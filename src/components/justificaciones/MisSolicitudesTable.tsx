"use client";

import React from "react";
import type { SolicitudJustificacion } from "@/models";
import { API_URL } from "@/lib/config";
import { requiereDocumentoJustificativo } from "@/lib/motivosDoc";

interface MisSolicitudesTableProps {
  solicitudes: SolicitudJustificacion[];
  editingObsId: number | string | null;
  tempObs: string;
  onStartEditObs: (sol: SolicitudJustificacion) => void;
  onCancelEditObs: () => void;
  onTempObsChange: (val: string) => void;
  onSaveObs: (id: number | string) => void;
  onUploadDoc: (id: number | string, file: File) => void;
  onOpenCancelar: (sol: SolicitudJustificacion) => void;
}

const parsearFechaLocal = (isoStr?: string | null): Date | null => {
  if (!isoStr) return null;
  const partes = isoStr.split("T")[0].split("-");
  if (partes.length === 3) {
    const [anio, mes, dia] = partes.map(Number);
    const d = new Date(anio, mes - 1, dia);
    d.setHours(0, 0, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

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

const puedeCancelar = (sol: SolicitudJustificacion): boolean => {
  if (sol.estado !== "P" && sol.estado !== "A") return false;

  let fechaReferencia: Date | null = null;
  if (sol.fecha_fin) {
    fechaReferencia = parsearFechaLocal(sol.fecha_fin);
  } else if (sol.fecha_inicio) {
    fechaReferencia = parsearFechaLocal(sol.fecha_inicio);
  } else if (sol.fecha) {
    const partes = sol.fecha.split("-");
    if (partes.length === 3) {
      fechaReferencia = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
      fechaReferencia.setHours(0, 0, 0, 0);
    }
  }

  if (!fechaReferencia) return false;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return fechaReferencia >= hoy;
};

export const MisSolicitudesTable: React.FC<MisSolicitudesTableProps> = ({
  solicitudes,
  editingObsId,
  tempObs,
  onStartEditObs,
  onCancelEditObs,
  onTempObsChange,
  onSaveObs,
  onUploadDoc,
  onOpenCancelar,
}) => {
  if (solicitudes.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
        <p className="text-gray-500 font-medium">No tienes solicitudes registradas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-white uppercase bg-fce-maroon">
          <tr>
            <th className="px-4 py-4 font-semibold whitespace-nowrap">Fecha</th>
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
              <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{sol.fecha}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {sol.tipo === "I" ? "Inasistencia" : "Licencia"}
              </td>
              <td className="px-4 py-3 text-gray-600 min-w-[150px]">{sol.motivoDesc || sol.codina}</td>
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
                {editingObsId === sol.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempObs}
                      onChange={(e) => onTempObsChange(e.target.value)}
                      className="border rounded px-2 py-1 w-full text-xs outline-none focus:ring-1 focus:ring-fce-maroon"
                    />
                    <button onClick={() => onSaveObs(sol.id)} className="text-green-600 font-bold text-xs">✔</button>
                    <button onClick={onCancelEditObs} className="text-red-600 font-bold text-xs">✖</button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="whitespace-pre-wrap break-words">
                        {sol.observacion || (!sol.motivo_cancelacion ? "—" : "")}
                      </span>
                      {sol.estado === "P" && (
                        <button
                          onClick={() => onStartEditObs(sol)}
                          className="text-fce-gold hover:text-yellow-600 shrink-0 mt-0.5"
                          title="Editar observación"
                        >
                          ✎
                        </button>
                      )}
                    </div>
                    {sol.motivo_cancelacion && (
                      <div className="p-2 bg-red-50 border border-red-200/80 rounded-lg text-xs text-red-800">
                        <span className="font-semibold block text-[11px] uppercase tracking-wider text-red-900 mb-0.5">
                          Motivo Cancelación:
                        </span>
                        <span className="whitespace-pre-wrap break-words">{sol.motivo_cancelacion}</span>
                      </div>
                    )}
                  </div>
                )}
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
                ) : requiereDocumentoJustificativo(sol.motivoDesc || sol.codina) ? (
                  sol.estado === "P" ? (
                    <label className="cursor-pointer text-fce-gold hover:text-yellow-600 font-medium text-xs underline">
                      Subir Doc
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files?.[0]) onUploadDoc(sol.id, e.target.files[0]);
                        }}
                      />
                    </label>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium" title="No se adjuntó comprobante">
                      Sin Doc
                    </span>
                  )
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
                {puedeCancelar(sol) ? (
                  <button
                    onClick={() => onOpenCancelar(sol)}
                    className="text-red-500 hover:text-red-700 font-medium text-xs underline"
                  >
                    Cancelar
                  </button>
                ) : (
                  <span className="text-gray-400 text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
