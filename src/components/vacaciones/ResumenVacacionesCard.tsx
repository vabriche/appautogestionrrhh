"use client";

import React from "react";
import type { ResumenVacaciones } from "@/models";
import { ESTADOS_SALDO, formatearFecha, formatearMeses } from "@/lib/vacaciones";

interface ResumenVacacionesCardProps {
  resumen: ResumenVacaciones;
}

const Dato: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-800">{value}</span>
  </div>
);

export const ResumenVacacionesCard: React.FC<ResumenVacacionesCardProps> = ({ resumen }) => {
  const { antiguedad, periodos } = resumen;

  return (
    <div className="space-y-4">
      {/* Datos del legajo y antigüedad */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-gray-800">{resumen.apellido ?? "-"}</p>
            <p className="text-xs text-gray-500">Legajo {resumen.legajo}</p>
          </div>
          {!resumen.activo && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
              Inactivo
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Dato label="Fecha de ingreso" value={formatearFecha(antiguedad.fecha_ingreso)} />
          <Dato label="Antigüedad reconocida" value={formatearMeses(antiguedad.reconocida_meses)} />
          <Dato
            label={`Antigüedad al ${formatearFecha(antiguedad.al)}`}
            value={formatearMeses(antiguedad.total_meses)}
          />
          <Dato label="Días según escala" value={`${antiguedad.dias_segun_escala} días`} />
        </div>
      </div>

      {/* Derechos por periodo */}
      {periodos.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          Todavía no hay un derecho de licencia generado para tu legajo.
        </p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
              <tr>
                <th className="px-3 py-2 text-left">Periodo</th>
                <th className="px-3 py-2 text-right">Corresponden</th>
                <th className="px-3 py-2 text-right">Aprobados</th>
                <th className="px-3 py-2 text-right">Pendientes</th>
                <th className="px-3 py-2 text-right">Devueltos</th>
                <th className="px-3 py-2 text-right">Saldo</th>
                <th className="px-3 py-2 text-left">Vence</th>
                <th className="px-3 py-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {periodos.map((p) => {
                const estado = ESTADOS_SALDO[p.estado_saldo] ?? ESTADOS_SALDO.vigente;
                return (
                  <tr key={p.periodo} className={p.sugerido ? "bg-fce-cream-light/60" : ""}>
                    <td className="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">
                      {p.periodo}
                      {p.sugerido && (
                        <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-fce-maroon text-white">
                          Sugerido
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">{p.dias_corresponden}</td>
                    <td className="px-3 py-2 text-right">{p.dias_aprobados}</td>
                    <td className="px-3 py-2 text-right">{p.dias_pendientes_autoriz}</td>
                    <td className="px-3 py-2 text-right">{p.dias_devueltos}</td>
                    <td className="px-3 py-2 text-right font-bold text-fce-maroon">{p.saldo}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatearFecha(p.vencimiento)}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${estado.className}`}>
                        {estado.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
