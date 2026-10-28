"use client";

import React from "react";
import type { MarcacionHoy } from "@/models";
import { MdHistory } from "react-icons/md";

interface AsistenciaVirtualTableProps {
  registros: MarcacionHoy[];
}

export const AsistenciaVirtualTable: React.FC<AsistenciaVirtualTableProps> = React.memo(
  ({ registros }) => {
    const totalHorasHoy = registros
      .reduce((acc, r) => acc + (r.cantidadHoras ? Number(r.cantidadHoras) : 0), 0)
      .toFixed(2);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-fce-gold/25 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
            <MdHistory size={20} className="text-fce-maroon" />
            <span>Marcaciones de hoy ({registros.length})</span>
          </div>
          {registros.length > 0 && (
            <span className="text-xs font-semibold text-fce-maroon bg-fce-cream/60 px-2.5 py-1 rounded-md border border-fce-gold/30">
              Total hoy: {totalHorasHoy} hs
            </span>
          )}
        </div>

        {registros.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No tienes marcaciones registradas para el día de hoy.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3"># Turno</th>
                  <th className="px-6 py-3">Entrada</th>
                  <th className="px-6 py-3">Salida</th>
                  <th className="px-6 py-3">Horas</th>
                  <th className="px-6 py-3">Modalidad</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registros.map((reg, idx) => {
                  const enCurso = !reg.Hsalida || reg.Hsalida === "" || reg.Hsalida === "X";
                  return (
                    <tr key={reg.nroregistro || idx} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3.5 font-medium text-gray-800">
                        Turno {idx + 1}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-gray-700">
                        {reg.Hentrada} hs
                      </td>
                      <td className="px-6 py-3.5 font-mono text-gray-700">
                        {enCurso ? (
                          <span className="text-amber-600 font-medium">Pendiente</span>
                        ) : (
                          `${reg.Hsalida} hs`
                        )}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-fce-maroon">
                        {enCurso ? "—" : `${Number(reg.cantidadHoras || 0).toFixed(2)} hs`}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          Virtual
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {enCurso ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            En curso
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            Completado
                          </span>
                        )}
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
  }
);

AsistenciaVirtualTable.displayName = "AsistenciaVirtualTable";
