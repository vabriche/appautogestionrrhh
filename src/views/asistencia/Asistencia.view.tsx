"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  getAuthUserAction,
  getRegistrosAsistenciaAction,
  getInasistenciasAnualesAction,
  getInasistenciasDetalleAction,
} from "@/controllers";
import type { AuthUser, RegistroAsistencia, InasistenciaRes, InasistenciaDetalle } from "@/models";
import {
  AsistenciaHeader,
  AsistenciaFilters,
  AsistenciaTable,
  AsistenciaInasistencias,
} from "@/components/asistencia";
import { horasADecimal } from "@/lib/horas";

const AsistenciaView = () => {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [registros, setRegistros] = useState<RegistroAsistencia[]>([]);
  const [inasistencias, setInasistencias] = useState<InasistenciaRes[]>([]);
  const [inasistenciasDetalle, setInasistenciasDetalle] = useState<InasistenciaDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fechas iniciales: comienzo y fin del mes actual
  const today = new Date();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, today.getMonth(), 1);
  const lastDay = new Date(currentYear, today.getMonth() + 1, 0);

  const [fechaInicio, setFechaInicio] = useState(
    firstDay.toISOString().split("T")[0]
  );
  const [fechaFin, setFechaFin] = useState(lastDay.toISOString().split("T")[0]);

  // Sincronizar inteligentemente el input de fin cuando cambian el de inicio (pero solo si la de inicio es mayor)
  const handleSetFechaInicio = (val: string) => {
    setFechaInicio(val);
    if (val && fechaFin) {
      if (val > fechaFin) {
        setFechaFin(val);
      }
    }
  };

  useEffect(() => {
    getAuthUserAction().then((u) => {
      setUser(u);
    });
  }, []);

  // Año consultado dinámico basado en la fecha de inicio del filtro
  const anioConsultado = useMemo(() => {
    if (fechaInicio) {
      const parts = fechaInicio.split("-");
      if (parts[0] && parts[0].length === 4) {
        const parsed = parseInt(parts[0], 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return currentYear;
  }, [fechaInicio, currentYear]);

  const fetchRegistros = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [data, inasistData, inasistDetalle] = await Promise.all([
        getRegistrosAsistenciaAction(fechaInicio, fechaFin),
        getInasistenciasAnualesAction(anioConsultado),
        getInasistenciasDetalleAction(fechaInicio, fechaFin),
      ]);
      setRegistros(data);
      setInasistencias(inasistData);
      setInasistenciasDetalle(inasistDetalle);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los registros. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [user, fechaInicio, fechaFin, anioConsultado]);

  useEffect(() => {
    fetchRegistros();
  }, [fetchRegistros]);

  const totalHoras = useMemo(() => {
    return registros
      .reduce((acc, curr) => acc + horasADecimal(curr.horasT), 0)
      .toFixed(2);
  }, [registros]);

  const diasTrabajados = useMemo(() => {
    const unicas = new Set(registros.map((r) => r.fecha));
    return unicas.size;
  }, [registros]);

  // Promedio de horas calculado sobre registros válidos de entrada y salida
  const { promedioHoras, cantDiasValidos } = useMemo(() => {
    const validos = registros.filter(
      (r) =>
        r.Hentrada &&
        String(r.Hentrada).trim() !== "" &&
        r.Hsalida &&
        String(r.Hsalida).trim() !== "" &&
        horasADecimal(r.horasT) > 0
    );
    if (validos.length === 0) return { promedioHoras: "0.00", cantDiasValidos: 0 };
    const suma = validos.reduce((acc, curr) => acc + horasADecimal(curr.horasT), 0);
    const prom = (suma / validos.length).toFixed(2);
    return { promedioHoras: prom, cantDiasValidos: validos.length };
  }, [registros]);

  if (!mounted) return null;

  return (
    <div className="bg-fce-cream-light min-h-[calc(100dvh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <AsistenciaHeader user={user} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <AsistenciaFilters
              fechaInicio={fechaInicio}
              setFechaInicio={handleSetFechaInicio}
              fechaFin={fechaFin}
              setFechaFin={setFechaFin}
              diasTrabajados={diasTrabajados}
              totalHoras={totalHoras}
              promedioHoras={promedioHoras}
              cantDiasValidos={cantDiasValidos}
              inasistencias={inasistencias}
              currentYear={currentYear}
              anioConsultado={anioConsultado}
            />
          </div>

          <div className="lg:col-span-3">
            <AsistenciaTable
              user={user}
              registros={registros}
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              loading={loading}
              error={error}
            />

            <AsistenciaInasistencias
              inasistencias={inasistenciasDetalle}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsistenciaView;
