"use client";

import React, { useEffect } from "react";
import { MdWarningAmber, MdClose, MdAccessTime, MdCalendarToday } from "react-icons/md";
import { Button } from "@heroui/react";

interface AlertaSalidaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fecha?: string;
  hentrada?: string;
}

export const AlertaSalidaModal: React.FC<AlertaSalidaModalProps> = ({
  isOpen,
  onClose,
  fecha,
  hentrada,
}) => {
  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-alerta-titulo"
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-fce-gold/40 z-10 animate-scale-up"
      >
        {/* Cabecera */}
        <div className="bg-amber-500 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <MdWarningAmber size={26} className="text-white" />
            </div>
            <div>
              <h2 id="modal-alerta-titulo" className="text-lg font-bold leading-tight">
                Aviso de Asistencia
              </h2>
              <p className="text-amber-100 text-xs">
                Registro de salida omitido
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            Hemos detectado que en tu última jornada laboral no se registró la marcación de salida:
          </p>

          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 space-y-2.5">
            {fecha && (
              <div className="flex items-center gap-2.5 text-sm text-amber-950">
                <MdCalendarToday size={18} className="text-amber-700 shrink-0" />
                <span className="font-semibold">Fecha:</span>
                <span>{fecha}</span>
              </div>
            )}
            {hentrada && (
              <div className="flex items-center gap-2.5 text-sm text-amber-950">
                <MdAccessTime size={18} className="text-amber-700 shrink-0" />
                <span className="font-semibold">Entrada registrada:</span>
                <span>{hentrada} hs</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm text-red-700 font-medium pt-1 border-t border-amber-200/60">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              <span>Salida: Sin registrar</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Recuerda informar o justificar este registro con el área de Personal / RRHH para que tus horas se computen correctamente.
          </p>
        </div>

        {/* Pie con botón de confirmación */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-100">
          <Button
            onPress={onClose}
            className="bg-fce-maroon hover:bg-fce-maroon-dark text-white font-semibold px-6 py-2 rounded-xl text-sm shadow-sm transition-all"
          >
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
};
