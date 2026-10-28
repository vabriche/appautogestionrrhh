import React, { Suspense } from "react";
import AsistenciaView from "@/views/asistencia/Asistencia.view";

export default function AsistenciaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando asistencia...</div>}>
      <AsistenciaView />
    </Suspense>
  );
}
