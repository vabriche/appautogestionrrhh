"use client";

import React, { useState } from "react";
import { CrearSolicitudForm, MisSolicitudesList } from "@/components/justificaciones";

export const JustificacionesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"crear" | "mis-solicitudes">("crear");
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleSuccess = () => {
    // Cuando la solicitud se crea con éxito, cambiamos de pestaña y recargamos
    setTimeout(() => {
      setRefreshCounter((prev) => prev + 1);
      setActiveTab("mis-solicitudes");
    }, 1500);
  };

  return (
    <div className="bg-fce-cream-light min-h-[calc(100dvh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("crear")}
            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
              activeTab === "crear"
                ? "bg-fce-maroon text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Crear Solicitud
          </button>
          <button
            onClick={() => {
              setRefreshCounter((prev) => prev + 1);
              setActiveTab("mis-solicitudes");
            }}
            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
              activeTab === "mis-solicitudes"
                ? "bg-fce-maroon text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Mis Solicitudes
          </button>
        </div>

        {/* Contenido Tabs */}
        <div className="p-6 sm:p-8 flex justify-center w-full">
          {activeTab === "crear" && <CrearSolicitudForm onSuccess={handleSuccess} />}
          {activeTab === "mis-solicitudes" && (
            <MisSolicitudesList shouldRefresh={refreshCounter > 0} />
          )}
        </div>
      </div>
    </div>
  );
};
