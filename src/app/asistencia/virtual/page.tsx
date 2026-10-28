import React, { Suspense } from "react";
import AsistenciaVirtualView from "@/views/asistencia/AsistenciaVirtual.view";

export default function AsistenciaVirtualPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando asistencia virtual...</div>}>
      <AsistenciaVirtualView />
    </Suspense>
  );
}
