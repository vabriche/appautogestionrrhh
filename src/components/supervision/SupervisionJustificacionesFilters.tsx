"use client";

import React from "react";

interface SupervisionJustificacionesFiltersProps {
  isTitular: boolean;
  areas: string[];
  selectedArea: string;
  onAreaChange: (area: string) => void;
  filterEstado: string;
  onFilterEstadoChange: (estado: string) => void;
}

export const SupervisionJustificacionesFilters: React.FC<
  SupervisionJustificacionesFiltersProps
> = ({
  isTitular,
  areas,
  selectedArea,
  onAreaChange,
  filterEstado,
  onFilterEstadoChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div className="flex gap-2">
        {isTitular && (
          <select
            value={selectedArea}
            onChange={(e) => onAreaChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-fce-gold outline-none"
          >
            <option value="TODAS">Todas las áreas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        )}

        <select
          value={filterEstado}
          onChange={(e) => onFilterEstadoChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-fce-gold outline-none"
        >
          <option value="P">Pendientes</option>
          <option value="A">Aceptadas</option>
          <option value="R">Rechazadas</option>
          <option value="C">Canceladas</option>
          <option value="T">Todos los estados</option>
        </select>
      </div>
    </div>
  );
};
