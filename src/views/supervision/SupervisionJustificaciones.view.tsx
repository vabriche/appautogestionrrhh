"use client";

import React, { useState } from "react";
import { JustificacionesList } from "@/components/supervision/JustificacionesList";
import { LicenciaAnualJefeList } from "@/components/supervision/LicenciaAnualJefeList";

type Pestania = "justificaciones" | "licencia-anual";

export default function SupervisionJustificacionesView() {
  const [pestania, setPestania] = useState<Pestania>("justificaciones");

  const claseTab = (activa: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
      activa ? "bg-fce-maroon text-white" : "text-gray-600 hover:bg-gray-100"
    }`;

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

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPestania("justificaciones")}
          className={claseTab(pestania === "justificaciones")}
        >
          Justificaciones
        </button>
        <button
          type="button"
          onClick={() => setPestania("licencia-anual")}
          className={claseTab(pestania === "licencia-anual")}
        >
          Licencia Anual
        </button>
      </div>

      {pestania === "justificaciones" ? <JustificacionesList /> : <LicenciaAnualJefeList />}
    </div>
  );
}
