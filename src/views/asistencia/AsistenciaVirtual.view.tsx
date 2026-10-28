"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAuthUserAction } from "@/controllers";
import type { AuthUser } from "@/models";
import { AsistenciaVirtualTab } from "@/components/asistencia/AsistenciaVirtualTab";
import { MdArrowBack, MdCalendarToday } from "react-icons/md";

const AsistenciaVirtualView = () => {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setMounted(true);
    getAuthUserAction().then((u) => {
      setUser(u);
    });
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-fce-cream-light min-h-[calc(100dvh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cabecera y Navegación rápida */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/asistencia"
            className="inline-flex items-center gap-2 text-sm font-semibold text-fce-maroon hover:text-[#5a1420] transition-colors group w-fit"
          >
            <MdArrowBack
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />
            <span>Volver a Mis Registros de Asistencia</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-fce-gold/30 text-xs font-semibold text-gray-700 shadow-xs self-start sm:self-auto">
            <MdCalendarToday size={14} className="text-fce-maroon" />
            <span>Receso anual: 21 Dic — 1 Feb</span>
          </div>
        </div>

        {/* Encabezado Principal */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-fce-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-fce-maroon">
              Marcación Remota
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
              Asistencia Virtual
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {user?.apellido ? `Agente: ${user.apellido}` : "Marcación de jornada"}{" "}
              • Legajo: {user?.legajo ?? "—"} •{" "}
              {user?.condicion === 1 ? "Docente" : "No Docente"} •{" "}
              {user?.area ? user.area.replace(/_/g, " ") : "Sin Área"}
            </p>
          </div>
          <div className="text-xs text-gray-500 max-w-xs text-right hidden sm:block">
            Módulo exclusivo para registro de entrada y salida durante el período de vacaciones.
          </div>
        </div>

        {/* Componente principal de marcación virtual */}
        <AsistenciaVirtualTab user={user} />
      </div>
    </div>
  );
};

export default AsistenciaVirtualView;
