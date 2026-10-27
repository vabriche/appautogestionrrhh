"use client";

import React from "react";
import { AREAS_FCE } from "@/constants";

interface SupervisionFiltersProps {
  area: string;
  setArea: (v: string) => void;
  fechaInicio: string;
  setFechaInicio: (v: string) => void;
  fechaFin: string;
  setFechaFin: (v: string) => void;
  onSearch: () => void;
  onExport: () => void;
  isTotalAdmin: boolean;
  userArea: string;
  loading: boolean;
  hasData: boolean;
}

export const SupervisionFilters: React.FC<SupervisionFiltersProps> = ({
  area,
  setArea,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  onSearch,
  onExport,
  isTotalAdmin,
  userArea,
  loading,
  hasData,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Control Por Area</h2>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Area */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-900">Area</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            disabled={!isTotalAdmin || loading}
            className="w-full h-11 px-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-sm focus:ring-2 focus:ring-fce-gold focus:border-fce-gold outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isTotalAdmin ? (
              AREAS_FCE.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))
            ) : (
              <option value={userArea}>{userArea}</option>
            )}
          </select>
        </div>

        {/* Fecha Inicio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-900">
            Fecha Inicio
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => {
              const newStart = e.target.value;
              setFechaInicio(newStart);
              if (newStart > fechaFin) {
                setFechaFin(newStart);
              }
            }}
            disabled={loading}
            className="w-full h-11 px-3 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:ring-2 focus:ring-fce-gold focus:border-fce-gold outline-none"
          />
        </div>

        {/* Fecha Fin */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-900">
            Fecha Fin
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => {
              const newEnd = e.target.value;
              if (newEnd >= fechaInicio) {
                setFechaFin(newEnd);
              }
            }}
            min={fechaInicio}
            disabled={loading}
            className="w-full h-11 px-3 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:ring-2 focus:ring-fce-gold focus:border-fce-gold outline-none"
          />
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 rounded-b-xl">
        <button
          onClick={onSearch}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-fce-maroon hover:bg-fce-maroon-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          Ver Asistencia
        </button>

        {hasData && (
          <button
            onClick={onExport}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            Exportar a .csv
          </button>
        )}
      </div>
    </div>
  );
};
