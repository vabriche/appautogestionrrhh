"use client";

import React from "react";
import type { ReglaCupo } from "@/lib/limitesJustificaciones";

interface CuadroCuposLimitesProps {
  reglaActiva?: ReglaCupo | null;
}

export const CuadroCuposLimites: React.FC<CuadroCuposLimitesProps> = ({ reglaActiva }) => {
  return (
    <div className="p-4 bg-fce-cream/40 border border-fce-gold/50 rounded-xl space-y-2">
      <div className="flex items-center gap-2 text-fce-maroon font-semibold text-sm">
        <svg className="w-5 h-5 text-fce-maroon flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Límites y Cupos de Justificación</span>
      </div>
      <ul className="space-y-1.5 text-xs text-gray-700 pl-6 list-disc">
        <li className={reglaActiva?.tipo === "RAZONES_PARTICULARES" ? "font-bold text-fce-maroon" : ""}>
          <span className="font-semibold">Razones particulares:</span> 6 días al año (máx. 2 por mes)
        </li>
        <li className={reglaActiva?.tipo === "EXCEPCIONALES" ? "font-bold text-fce-maroon" : ""}>
          <span className="font-semibold">Excepcionales (Art. 102):</span> 5 días al año (máx. 2 por mes)
        </li>
        <li className={reglaActiva?.tipo === "ESTUDIO" ? "font-bold text-fce-maroon" : ""}>
          <span className="font-semibold">Estudio:</span> 28 anuales (máx. 5 por examen)
        </li>
      </ul>
    </div>
  );
};
