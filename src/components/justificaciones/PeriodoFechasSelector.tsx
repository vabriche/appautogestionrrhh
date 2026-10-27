"use client";

import React from "react";

interface PeriodoFechasSelectorProps {
  fechaInicio: string;
  fechaFin: string;
  onFechaInicioChange: (fecha: string) => void;
  onFechaFinChange: (fecha: string) => void;
  cantDias: number;
  errorLimiteCupo?: string | null;
}

const formatearFechaVista = (isoStr: string): string => {
  if (!isoStr) return "";
  const partes = isoStr.split("-");
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return isoStr;
};

export const PeriodoFechasSelector: React.FC<PeriodoFechasSelectorProps> = ({
  fechaInicio,
  fechaFin,
  onFechaInicioChange,
  onFechaFinChange,
  cantDias,
  errorLimiteCupo,
}) => {
  const handleInicio = (val: string) => {
    onFechaInicioChange(val);
    if (!fechaFin || fechaFin < val) {
      onFechaFinChange(val);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-800">Período Solicitado</label>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-fce-maroon text-white">
          {cantDias} {cantDias === 1 ? "día" : "días"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">
            Fecha Desde <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => handleInicio(e.target.value)}
            required
            className="h-11 px-3 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:ring-2 focus:ring-fce-gold focus:border-fce-gold outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">
            Fecha Hasta <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={fechaFin}
            min={fechaInicio}
            onChange={(e) => onFechaFinChange(e.target.value)}
            required
            className="h-11 px-3 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:ring-2 focus:ring-fce-gold focus:border-fce-gold outline-none"
          />
        </div>
      </div>

      {errorLimiteCupo ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorLimiteCupo}</span>
        </div>
      ) : (
        fechaInicio && fechaFin && (
          <p className="text-xs text-gray-500">
            {fechaInicio === fechaFin
              ? `Justificación por 1 jornada (${formatearFechaVista(fechaInicio)})`
              : `Justificación desde el ${formatearFechaVista(fechaInicio)} hasta el ${formatearFechaVista(fechaFin)} (${cantDias} días en total)`}
          </p>
        )
      )}
    </div>
  );
};
