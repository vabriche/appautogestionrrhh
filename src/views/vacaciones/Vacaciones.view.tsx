"use client";

import React, { useEffect, useState } from "react";
import type { ResumenVacaciones, TramoVacaciones } from "@/models";
import {
  getResumenVacacionesAction,
  getMisTramosVacacionesAction,
} from "@/controllers/vacaciones.controller";
import {
  ResumenVacacionesCard,
  PedidoVacacionesForm,
  MisTramosVacaciones,
} from "@/components/vacaciones";
import { FeedbackAlert } from "@/components/ui";

export const VacacionesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pedir" | "mis-pedidos">("pedir");
  const [resumen, setResumen] = useState<ResumenVacaciones | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tramos, setTramos] = useState<TramoVacaciones[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTramos, setLoadingTramos] = useState(false);

  const loadResumen = async () => {
    setLoading(true);
    const res = await getResumenVacacionesAction();
    setResumen(res.data);
    setError(res.data ? null : res.error ?? "No se pudo obtener la licencia anual");
    setLoading(false);
  };

  const loadTramos = async () => {
    setLoadingTramos(true);
    setTramos(await getMisTramosVacacionesAction());
    setLoadingTramos(false);
  };

  useEffect(() => {
    loadResumen();
  }, []);

  const handleSuccess = () => {
    loadResumen();
    loadTramos();
    setActiveTab("mis-pedidos");
  };

  return (
    <div className="bg-fce-cream-light min-h-[calc(100dvh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("pedir")}
            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
              activeTab === "pedir" ? "bg-fce-maroon text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Licencia Anual
          </button>
          <button
            onClick={() => {
              loadTramos();
              setActiveTab("mis-pedidos");
            }}
            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
              activeTab === "mis-pedidos" ? "bg-fce-maroon text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Mis Pedidos
          </button>
        </div>

        {/* Contenido Tabs */}
        <div className="p-6 sm:p-8 w-full space-y-8">
          {activeTab === "pedir" && (
            <>
              {loading && <p className="text-sm text-gray-500 text-center py-6">Cargando datos...</p>}
              {!loading && error && <FeedbackAlert type="error" message={error} />}
              {!loading && resumen && (
                <>
                  <ResumenVacacionesCard resumen={resumen} />
                  {resumen.activo && (
                    <PedidoVacacionesForm resumen={resumen} onSuccess={handleSuccess} />
                  )}
                </>
              )}
            </>
          )}
          {activeTab === "mis-pedidos" && (
            <MisTramosVacaciones tramos={tramos} loading={loadingTramos} />
          )}
        </div>
      </div>
    </div>
  );
};
