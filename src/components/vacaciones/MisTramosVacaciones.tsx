"use client";

import React from "react";
import type { TramoVacaciones } from "@/models";
import {
  ESTADOS_TRAMO,
  TIPOS_TRAMO,
  formatearFecha,
  textoMotivoNorma,
} from "@/lib/vacaciones";

interface MisTramosVacacionesProps {
  tramos: TramoVacaciones[];
  loading: boolean;
}

const MOTIVOS_INTERRUPCION: Record<string, string> = {
  enfermedad: "Enfermedad",
  trabajo: "Trabajo",
  otro: "Otro",
};

export const MisTramosVacaciones: React.FC<MisTramosVacacionesProps> = ({ tramos, loading }) => {
  if (loading) {
    return <p className="text-sm text-gray-500 text-center py-6">Cargando pedidos...</p>;
  }

  if (tramos.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-6">
        Todavía no registraste pedidos de licencia anual.
      </p>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {tramos.map((t) => {
        const estado = ESTADOS_TRAMO[t.estado] ?? ESTADOS_TRAMO.pedido;
        const motivos = t.motivos_norma ? t.motivos_norma.split(",").filter(Boolean) : [];
        return (
          <div key={t.id} className="p-4 border border-gray-200 rounded-xl bg-white space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">Periodo {t.periodo}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {TIPOS_TRAMO[t.tipo] ?? t.tipo}
                </span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${estado.className}`}>
                {estado.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-[11px] text-gray-500 font-semibold uppercase">Desde</p>
                <p className="font-semibold text-gray-800">{formatearFecha(t.fecha_inicio)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-semibold uppercase">Último día</p>
                <p className="font-semibold text-gray-800">{formatearFecha(t.fecha_fin_computo)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-semibold uppercase">Reintegro</p>
                <p className="font-semibold text-gray-800">{formatearFecha(t.fecha_reintegro)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-semibold uppercase">Días</p>
                <p className="font-semibold text-gray-800">
                  {t.dias_computados}
                  {t.dias_corridos !== t.dias_computados && (
                    <span className="text-xs font-normal text-gray-500"> ({t.dias_corridos} corridos)</span>
                  )}
                </p>
              </div>
            </div>

            {motivos.length > 0 && (
              <p className="text-xs text-amber-700">
                Fuera de norma: {motivos.map(textoMotivoNorma).join(" · ")}
              </p>
            )}
            {t.observacion && <p className="text-xs text-gray-600">Observación: {t.observacion}</p>}
            {t.motivo_autoriz && (
              <p className="text-xs text-gray-600">
                {t.estado === "rechazado" ? "Motivo del rechazo" : "Autorización"}: {t.motivo_autoriz}
              </p>
            )}

            {t.interrupciones.length > 0 && (
              <div className="pt-2 border-t border-gray-100 space-y-1">
                <p className="text-[11px] text-gray-500 font-semibold uppercase">Interrupciones</p>
                {t.interrupciones.map((i) => (
                  <p key={i.id} className="text-xs text-gray-700">
                    {MOTIVOS_INTERRUPCION[i.motivo] ?? i.motivo}: {formatearFecha(i.fecha_desde)} al{" "}
                    {formatearFecha(i.fecha_hasta)} — {i.dias} {i.dias === 1 ? "día" : "días"} ({i.estado})
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
