import React from "react";
import { JustificacionesList } from "@/components/supervision/JustificacionesList";

export default function SupervisionJustificacionesView() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full h-full p-4 md:p-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-fce-maroon tracking-tight">
          Justificaciones del Área
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestione y evalúe las solicitudes de inasistencias y licencias presentadas por el personal a su cargo.
        </p>
      </div>

      <JustificacionesList />
    </div>
  );
}
