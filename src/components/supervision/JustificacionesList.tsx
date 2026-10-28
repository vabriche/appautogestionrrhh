"use client";

import React, { useState, useEffect } from "react";
import type { SolicitudJustificacion } from "@/models";
import {
  getSupervisionSolicitudesAction,
  actualizarSolicitudAction,
  getAreasAction,
} from "@/controllers/justificaciones.controller";
import { getAuthUserAction } from "@/controllers/auth.controller";
import { showToast, ConfirmModal } from "@/components/ui";
import { requiereDocumentoJustificativo } from "@/lib/motivosDoc";
import { SupervisionJustificacionesFilters } from "./SupervisionJustificacionesFilters";
import { SupervisionJustificacionesTable } from "./SupervisionJustificacionesTable";

export const JustificacionesList: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("TODAS");

  const [solicitudes, setSolicitudes] = useState<SolicitudJustificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterEstado, setFilterEstado] = useState<string>("P"); // P, A, R, C, T(Todos)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    solicitudId: number | string | null;
    nuevoEstado: "A" | "R" | null;
  }>({ isOpen: false, solicitudId: null, nuevoEstado: null });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const u = await getAuthUserAction();
    setUser(u);
    if (u?.encargadoArea === "T") {
      const ar = await getAreasAction();
      setAreas(ar);
    }
    await loadSolicitudes("TODAS");
  };

  const loadSolicitudes = async (areaToFetch: string) => {
    setLoading(true);
    try {
      const data = await getSupervisionSolicitudesAction(areaToFetch);
      setSolicitudes(data);
    } catch {
      showToast("Error al cargar solicitudes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAreaChange = (newArea: string) => {
    setSelectedArea(newArea);
    loadSolicitudes(newArea);
  };

  const openConfirmCambiarEstado = (
    sol: SolicitudJustificacion,
    nuevoEstado: "A" | "R"
  ) => {
    if (
      nuevoEstado === "A" &&
      requiereDocumentoJustificativo(sol.motivoDesc, sol.codina) &&
      !sol.documento
    ) {
      showToast(
        "No se puede aprobar: Esta solicitud requiere adjuntar justificativo documental y aún no ha sido presentado.",
        "warning"
      );
      return;
    }
    setConfirmModal({ isOpen: true, solicitudId: sol.id, nuevoEstado });
  };

  const executeCambiarEstado = async () => {
    if (!confirmModal.solicitudId || !confirmModal.nuevoEstado) return;
    const { solicitudId, nuevoEstado } = confirmModal;
    setConfirmModal({ isOpen: false, solicitudId: null, nuevoEstado: null });

    const accion = nuevoEstado === "A" ? "aprobar" : "rechazar";
    setLoading(true);
    const res = await actualizarSolicitudAction(solicitudId, {
      estado: nuevoEstado,
    });
    if (res.ok) {
      showToast(
        `Solicitud ${nuevoEstado === "A" ? "aprobada" : "rechazada"} con éxito`,
        "success"
      );
      await loadSolicitudes(selectedArea);
    } else {
      showToast(res.error || `No se pudo ${accion} la solicitud`, "error");
    }
    setLoading(false);
  };

  const filteredSolicitudes = solicitudes.filter(
    (sol) => filterEstado === "T" || sol.estado === filterEstado,
  );

  return (
    <div className="flex flex-col space-y-4 w-full bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <SupervisionJustificacionesFilters
        isTitular={user?.encargadoArea === "T"}
        areas={areas}
        selectedArea={selectedArea}
        onAreaChange={handleAreaChange}
        filterEstado={filterEstado}
        onFilterEstadoChange={setFilterEstado}
      />

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fce-maroon"></div>
        </div>
      ) : (
        <SupervisionJustificacionesTable
          solicitudes={filteredSolicitudes}
          onAprobar={(sol) => openConfirmCambiarEstado(sol, "A")}
          onRechazar={(sol) => openConfirmCambiarEstado(sol, "R")}
        />
      )}

      {/* Modal para confirmar Aceptar/Rechazar */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, solicitudId: null, nuevoEstado: null })}
        onConfirm={executeCambiarEstado}
        title={confirmModal.nuevoEstado === "A" ? "Aprobar Solicitud" : "Rechazar Solicitud"}
        message={
          confirmModal.nuevoEstado === "A"
            ? "¿Estás seguro de que deseas aprobar esta solicitud de justificación?"
            : "¿Estás seguro de que deseas rechazar esta solicitud de justificación?"
        }
        confirmText={confirmModal.nuevoEstado === "A" ? "Sí, aprobar" : "Sí, rechazar"}
        cancelText="Volver"
        type={confirmModal.nuevoEstado === "A" ? "success" : "danger"}
        isLoading={loading}
      />
    </div>
  );
};
