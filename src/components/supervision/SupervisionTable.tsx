"use client";

import React from "react";
import type { SupervisionRegistro } from "@/models";

interface SupervisionTableProps {
  registros: SupervisionRegistro[];
  loading: boolean;
}

export const SupervisionTable: React.FC<SupervisionTableProps> = ({
  registros,
  loading,
}) => {
  const getModalidad = (virtual: string | number | null | undefined) => {
    const vStr = String(virtual).toUpperCase();
    if (vStr === "V" || vStr === "3") return "V";
    return "P";
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fce-maroon"></div>
      </div>
    );
  }

  if (registros.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-500 font-medium">No se encontraron registros</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-h-[800px]">
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-white uppercase bg-fce-maroon sticky top-0 z-10">
            <tr>
              <th className="px-4 py-4 font-semibold w-24">Legajo</th>
              <th className="px-4 py-4 font-semibold">Nombre</th>
              <th className="px-4 py-4 font-semibold w-28 text-center">Fecha</th>
              <th className="px-4 py-4 font-semibold w-24 text-center">Entrada</th>
              <th className="px-4 py-4 font-semibold w-24 text-center">Salida</th>
              <th className="px-4 py-4 font-semibold w-24 text-center">Modalidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {registros.map((reg, idx) => {
              const mod = getModalidad(reg.virtual);
              return (
                <tr
                  key={`${reg.legajo}-${reg.fecha}-${idx}`}
                  className="hover:bg-gray-50/50 transition-colors even:bg-gray-50/30"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {reg.legajo}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {reg.apellido || "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {reg.fecha ? reg.fecha.replace(/-/g, "/") : "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {reg.Hentrada || "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {reg.Hsalida || "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {mod}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
