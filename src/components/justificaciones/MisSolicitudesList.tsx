"use client";

import React, { useState, useEffect } from "react";
import type { SolicitudJustificacion } from "@/models";
import {
  getMisSolicitudesAction,
  actualizarSolicitudAction,
  subirDocumentoAction,
} from "@/controllers/justificaciones.controller";
import { showToast } from "@/components/ui";
import { MisSolicitudesTable } from "./MisSolicitudesTable";
import { CancelarSolicitudModal } from "./CancelarSolicitudModal";

interface MisSolicitudesListProps {
  shouldRefresh: boolean;
}

export const MisSolicitudesList: React.FC<MisSolicitudesListProps> = ({ shouldRefresh }) => {
  const [solicitudes, setSolicitudes] = useState<SolicitudJustificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingObs, setEditingObs] = useState<number | string | null>(null);
  const [tempObs, setTempObs] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    solicitud: SolicitudJustificacion | null;
    motivo: string;
    error: string | null;
  }>({ isOpen: false, solicitud: null, motivo: "", error: null });

  useEffect(() => {
    loadSolicitudes();
  }, [shouldRefresh]);

  const loadSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await getMisSolicitudesAction();
      setSolicitudes(data);
    } catch {
      showToast("Error al cargar solicitudes", "error");
    } finally {
      setLoading(false);
    }
  };

  const openConfirmCancelar = (sol: SolicitudJustificacion) => {
    setConfirmModal({
      isOpen: true,
      solicitud: sol,
      motivo: "",
      error: null,
    });
  };

  const executeCancelarSolicitud = async () => {
    if (!confirmModal.solicitud) return;
    const sol = confirmModal.solicitud;

    if (sol.estado === "A" && !confirmModal.motivo.trim()) {
      setConfirmModal((prev) => ({
        ...prev,
        error: "Para cancelar una justificación que ya fue aprobada, es obligatorio ingresar el motivo.",
      }));
      return;
    }

    setLoading(true);
    const res = await actualizarSolicitudAction(sol.id, {
      estado: "C",
      motivo_cancelacion: confirmModal.motivo.trim() || undefined,
    });

    if (res.ok) {
      showToast("Solicitud cancelada con éxito", "success");
      setConfirmModal({ isOpen: false, solicitud: null, motivo: "", error: null });
      await loadSolicitudes();
    } else {
      showToast(res.error || "No se pudo cancelar la solicitud", "error");
    }
    setLoading(false);
  };

  const handleSaveObs = async (id: number | string) => {
    setLoading(true);
    const res = await actualizarSolicitudAction(id, { observacion: tempObs });
    if (res.ok) {
      showToast("Observación actualizada", "success");
      setEditingObs(null);
      await loadSolicitudes();
    } else {
      showToast(res.error || "Error al guardar la observación", "error");
    }
    setLoading(false);
  };

  const handleUploadDoc = async (id: number | string, file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("documento", file);
    const success = await subirDocumentoAction(id, formData);
    if (success) {
      showToast("Documento subido con éxito", "success");
      await loadSolicitudes();
    } else {
      showToast("Error al subir el documento", "error");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Mis Solicitudes</h2>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fce-maroon"></div>
        </div>
      ) : (
        <MisSolicitudesTable
          solicitudes={solicitudes}
          editingObsId={editingObs}
          tempObs={tempObs}
          onStartEditObs={(sol) => {
            setEditingObs(sol.id);
            setTempObs(sol.observacion || "");
          }}
          onCancelEditObs={() => setEditingObs(null)}
          onTempObsChange={setTempObs}
          onSaveObs={handleSaveObs}
          onUploadDoc={handleUploadDoc}
          onOpenCancelar={openConfirmCancelar}
        />
      )}

      <CancelarSolicitudModal
        isOpen={confirmModal.isOpen}
        solicitud={confirmModal.solicitud}
        motivo={confirmModal.motivo}
        error={confirmModal.error}
        isLoading={loading}
        onMotivoChange={(motivo) => setConfirmModal((prev) => ({ ...prev, motivo, error: null }))}
        onClose={() => setConfirmModal({ isOpen: false, solicitud: null, motivo: "", error: null })}
        onConfirm={executeCancelarSolicitud}
      />
    </div>
  );
};
