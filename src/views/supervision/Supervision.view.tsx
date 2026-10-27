"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthUserAction } from "@/controllers/auth.controller";
import type { AuthUser, SupervisionRegistro } from "@/models";
import { getSupervisionRegistrosAction } from "@/controllers/supervision.controller";
import { SupervisionFilters, SupervisionTable } from "@/components/supervision";
import { AREAS_FCE } from "@/constants";

const SupervisionView = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Filtros
  const [area, setArea] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [registros, setRegistros] = useState<SupervisionRegistro[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);

    const today = new Date();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, today.getMonth(), 1);
    const lastDay = new Date(currentYear, today.getMonth() + 1, 0);

    setFechaInicio(firstDay.toISOString().split("T")[0]);
    setFechaFin(lastDay.toISOString().split("T")[0]);

    getAuthUserAction().then((u) => {
      setUser(u);
      if (u) {
        if (!u.encargadoArea || u.encargadoArea === "N") {
          router.push("/asistencia");
        } else {
          // Si es S (solo su area), setea su area. Si es T, setea la primera de la lista por defecto.
          const initialArea = u.encargadoArea === "S" ? u.area : AREAS_FCE[0];
          setArea(initialArea || "");
        }
      }
    });
  }, [router]);

  const handleSearch = async () => {
    if (!area || !fechaInicio || !fechaFin) return;
    setLoading(true);
    try {
      const data = await getSupervisionRegistrosAction(area, fechaInicio, fechaFin);
      setRegistros(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (registros.length === 0) return;

    const headers = [
      "area",
      '"legajo"',
      '"apellido"',
      '"fecha"',
      '"Hentrada"',
      '"Hsalida"',
      '"horasT"',
      '"virtual"',
      '"nroregistro"',
    ].join(",");

    const rows = registros.map((r) => {
      // Area va sin comillas. Si r.area no existe, usamos el state `area`.
      // Como el area tiene espacios, se deben reemplazar por underscores.
      const areaName = (r.area || area).replace(/ /g, "_");

      const mod = String(r.virtual).toUpperCase();
      const modText = mod === "V" || mod === "3" ? "V" : "P";

      let horasTFormateada = "00:00";
      if (typeof r.horasT === "number" && !isNaN(r.horasT)) {
        const h = Math.floor(r.horasT);
        const m = Math.round((r.horasT - h) * 60);
        horasTFormateada = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      } else {
        horasTFormateada = String(r.horasT || "00:00");
      }

      return [
        areaName,
        `"${r.legajo}"`,
        `"${r.apellido || ""}"`,
        `"${r.fecha ? r.fecha.replace(/\//g, "-") : ""}"`, // en el ej. estaba con guiones 25-08-2023
        `"${r.Hentrada || "X"}"`,
        `"${r.Hsalida || "X"}"`,
        `"${horasTFormateada}"`,
        `"${modText}"`,
        `"${r.nroregistro}"`,
      ].join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `supervision_${area.replace(/ /g, "_")}_${fechaInicio}_${fechaFin}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted || !user) return null;

  return (
    <div className="bg-fce-cream-light min-h-[calc(100dvh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Columna Izquierda: Filtros (Aprox 1/3) */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <SupervisionFilters
              area={area}
              setArea={setArea}
              fechaInicio={fechaInicio}
              setFechaInicio={setFechaInicio}
              fechaFin={fechaFin}
              setFechaFin={setFechaFin}
              onSearch={handleSearch}
              onExport={handleExport}
              isTotalAdmin={user.encargadoArea === "T"}
              userArea={user.area}
              loading={loading}
              hasData={registros.length > 0}
            />
          </div>

          {/* Columna Derecha: Tabla (Aprox 2/3) */}
          <div className="w-full lg:w-2/3 xl:w-3/4 h-[800px]">
            <SupervisionTable registros={registros} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisionView;
