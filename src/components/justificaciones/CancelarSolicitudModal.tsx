"use client";

import React from "react";
import { ConfirmModal } from "@/components/ui";
import type { SolicitudJustificacion } from "@/models";

interface CancelarSolicitudModalProps {
  isOpen: boolean;
  solicitud: SolicitudJustificacion | null;
  motivo: string;
  error: string | null;
  isLoading: boolean;
  onMotivoChange: (motivo: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelarSolicitudModal: React.FC<CancelarSolicitudModalProps> = ({
  isOpen,
  solicitud,
  motivo,
  error,
  isLoading,
  onMotivoChange,
  onClose,
  onConfirm,
}) => {
  const isAprobada = solicitud?.estado === "A";

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={isAprobada ? "Cancelar Justificación Aprobada" : "Cancelar Solicitud"}
      message={
        isAprobada
          ? "Esta justificación ya fue aprobada. Para cancelarla, es obligatorio ingresar el motivo de cancelación."
          : "¿Estás seguro de que deseas cancelar esta solicitud? Esta acción no se puede revertir."
      }
      confirmText="Sí, cancelar solicitud"
      cancelText="Volver"
      type="danger"
      isLoading={isLoading}
    >
      <div className="space-y-1.5 text-left">
        <label className="block text-xs font-semibold text-gray-700">
          Motivo de cancelación{" "}
          {isAprobada ? (
            <span className="text-red-600">* (obligatorio)</span>
          ) : (
            <span className="text-gray-400 font-normal">(opcional)</span>
          )}
        </label>
        <textarea
          value={motivo}
          onChange={(e) => onMotivoChange(e.target.value)}
          rows={3}
          placeholder={
            isAprobada
              ? "Explica detalladamente por qué cancelas la justificación aprobada..."
              : "Indica opcionalmente el motivo de la cancelación..."
          }
          className={`w-full border rounded-xl p-2.5 text-xs sm:text-sm outline-none transition-all resize-none ${
            error
              ? "border-red-400 ring-2 ring-red-100"
              : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"
          }`}
        />
        {error && (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        )}
      </div>
    </ConfirmModal>
  );
};
