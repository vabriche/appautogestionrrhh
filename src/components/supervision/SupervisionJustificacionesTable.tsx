"use client";

import React from "react";
import type { SolicitudJustificacion } from "@/models";
import { API_URL } from "@/lib/config";
import { OBTENER_LABEL_MOTIVO } from "@/constants";
import { requiereDocumentoJustificativo } from "@/lib/motivosDoc";

interface SupervisionJustificacionesTableProps {
  solicitudes: SolicitudJustificacion[];
  onAprobar: (sol: SolicitudJustificacion) => void;
  onRechazar: (sol: SolicitudJustificacion) => void;
}

const formatearFechaVista = (isoStr?: string | null): string => {
  if (!isoStr) return "";
  const partes = isoStr.split("T")[0].split("-");
  if (partes.length === 3) {
    if (partes[0].length === 4) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return isoStr;
  }
  return isoStr;
};

export const SupervisionJustificacionesTable: React.FC<
  SupervisionJustificacionesTableProps
> = ({ solicitudes, onAprobar, onRechazar }) => {
  if (solicitudes.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
        <p className="text-gray-500 font-medium">No hay solicitudes en este estado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-white uppercase bg-fce-maroon">
          <tr>
            <th className="px-4 py-4 font-semibold whitespace-nowrap">Fecha Creada</th>
            <th className="px-4 py-4 font-semibold">Agente</th>
            <th className="px-4 py-4 font-semibold">Tipo</th>
            <th className="px-4 py-4 font-semibold">Motivo</th>
            <th className="px-4 py-4 font-semibold">Período Solicitado</th>
            <th className="px-4 py-4 font-semibold">Observación</th>
            <th className="px-4 py-4 font-semibold text-center">Doc.</th>
            <th className="px-4 py-4 font-semibold text-center">Avisó</th>
            <th className="px-4 py-4 font-semibold">Estado</th>
            <th className="px-4 py-4 font-semibold text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {solicitudes.map((sol) => (
            <tr key={sol.id} className="hover:bg-gray-50/50">
              <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                {sol.fecha}
              </td>
              <td className="px-4 py-3 text-gray-800 whitespace-nowrap font-medium">
                {sol.apellido || sol.legajo}
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {sol.tipo === "I" ? "Inasistencia" : "Licencia"}
              </td>
              <td className="px-4 py-3 text-gray-600 min-w-[150px]">
                {OBTENER_LABEL_MOTIVO(sol.codina) || sol.motivoDesc || sol.codina}
              </td>
              <td className="px-4 py-3 text-gray-600 min-w-[140px]">
                {sol.fecha_inicio ? (
                  <div className="space-y-0.5">
                    <div className="font-medium text-gray-800 text-xs">
                      {sol.fecha_inicio === sol.fecha_fin || !sol.fecha_fin ? (
                        formatearFechaVista(sol.fecha_inicio)
                      ) : (
                        `${formatearFechaVista(sol.fecha_inicio)} al ${formatearFechaVista(sol.fecha_fin)}`
                      )}
                    </div>
                    {sol.cantidad_dias && (
                      <span className="inline-block text-[11px] font-semibold text-fce-maroon bg-fce-cream/70 px-1.5 py-0.2 rounded border border-fce-gold/30">
                        {sol.cantidad_dias} {sol.cantidad_dias === 1 ? "día" : "días"}
                      </span>
                    )}
                  </div>
                ) : (
                  <span>—</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600 min-w-[200px]">
                <div className="space-y-1.5">
                  {sol.observacion ? (
                    <p className="whitespace-pre-wrap break-words text-gray-700">
                      {sol.observacion}
                    </p>
                  ) : (
                    !sol.motivo_cancelacion && <span className="text-gray-400">—</span>
                  )}
                  {sol.motivo_cancelacion && (
                    <div className="p-2 bg-red-50 border border-red-200/80 rounded-lg text-xs text-red-800">
                      <span className="font-semibold block text-[11px] uppercase tracking-wider text-red-900 mb-0.5">
                        Motivo Cancelación:
                      </span>
                      <span className="whitespace-pre-wrap break-words">
                        {sol.motivo_cancelacion}
                      </span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                {sol.documento ? (
                  <a
                    href={`${API_URL}/${sol.documento.replace(/\\/g, "/")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-fce-maroon hover:underline font-medium text-xs"
                  >
                    Ver
                  </a>
                ) : requiereDocumentoJustificativo(sol.motivoDesc, sol.codina) ? (
                  <span
                    className="inline-flex items-center text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-medium whitespace-nowrap"
                    title="Comprobante obligatorio pendiente de entrega"
                  >
                    ⚠ Falta Doc
                  </span>
                ) : (
                  <span className="text-xs text-gray-400" title="No requiere comprobante">
                    —
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-center text-gray-600">
                {sol.comunico === "S" ? "Sí" : "No"}
              </td>
              <td className="px-4 py-3 font-medium whitespace-nowrap">
                {sol.estado === "P" && <span className="text-orange-600">Pendiente</span>}
                {sol.estado === "A" && <span className="text-green-600">Aprobado</span>}
                {sol.estado === "R" && <span className="text-red-600">Rechazado</span>}
                {sol.estado === "C" && <span className="text-gray-500">Cancelado</span>}
              </td>
              <td className="px-4 py-3 text-center space-x-2">
                {sol.estado === "P" && (() => {
                  const necesitaDoc = requiereDocumentoJustificativo(sol.motivoDesc, sol.codina);
                  const faltaDoc = necesitaDoc && !sol.documento;

                  return (
                    <div className="flex gap-2 justify-center">
                      {faltaDoc ? (
                        <button
                          disabled
                          title="No se puede aprobar: Requiere adjuntar documento justificativo"
                          className="bg-gray-100 text-gray-400 cursor-not-allowed px-3 py-1 rounded text-xs font-semibold border border-gray-200"
                        >
                          Aceptar
                        </button>
                      ) : (
                        <button
                          onClick={() => onAprobar(sol)}
                          className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-xs font-semibold transition-colors"
                        >
                          Aceptar
                        </button>
                      )}
                      <button
                        onClick={() => onRechazar(sol)}
                        className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-xs font-semibold transition-colors"
                      >
                        Rechazar
                      </button>
                    </div>
                  );
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
