"use client";

import React, { useEffect } from "react";
import {
  MdCheckCircleOutline,
  MdErrorOutline,
  MdWarningAmber,
  MdHelpOutline,
  MdClose,
} from "react-icons/md";
import { Button, Spinner } from "@heroui/react";

export type ConfirmType = "success" | "danger" | "warning" | "primary";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Confirmar acción?",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "primary",
  isLoading = false,
  children,
}) => {
  // Cerrar al presionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const configByType = {
    success: {
      icon: <MdCheckCircleOutline size={30} className="text-emerald-600" />,
      iconBg: "bg-emerald-50 border-emerald-200",
      buttonBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
      headerBorder: "border-emerald-500",
    },
    danger: {
      icon: <MdErrorOutline size={30} className="text-red-600" />,
      iconBg: "bg-red-50 border-red-200",
      buttonBg: "bg-red-600 hover:bg-red-700 text-white",
      headerBorder: "border-red-500",
    },
    warning: {
      icon: <MdWarningAmber size={30} className="text-amber-600" />,
      iconBg: "bg-amber-50 border-amber-200",
      buttonBg: "bg-amber-600 hover:bg-amber-700 text-white",
      headerBorder: "border-amber-500",
    },
    primary: {
      icon: <MdHelpOutline size={30} className="text-fce-maroon" />,
      iconBg: "bg-fce-cream border-fce-gold/30",
      buttonBg: "bg-fce-maroon hover:bg-fce-maroon-dark text-white",
      headerBorder: "border-fce-gold",
    },
  }[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-t-4 ${configByType.headerBorder} border-x border-b border-gray-100 z-10 animate-scale-up`}
      >
        <button
          onClick={() => !isLoading && onClose()}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors disabled:opacity-40"
          aria-label="Cerrar modal"
        >
          <MdClose size={20} />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-2xl border ${configByType.iconBg} shrink-0 mt-0.5`}
            >
              {configByType.icon}
            </div>

            <div className="space-y-1.5 flex-1 pr-6">
              <h3 className="text-lg font-bold text-gray-900 leading-snug">
                {title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          {children && <div className="mt-4 pt-2 border-t border-gray-100">{children}</div>}
        </div>

        {/* Botones de acción */}
        <div className="bg-gray-50/80 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onPress={onClose}
            isDisabled={isLoading}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-200/60 font-medium px-4 py-2 rounded-xl text-sm transition-all"
          >
            {cancelText}
          </Button>

          <Button
            onPress={onConfirm}
            isDisabled={isLoading}
            className={`${configByType.buttonBg} font-semibold px-5 py-2 rounded-xl text-sm shadow-sm transition-all flex items-center gap-2`}
          >
            {isLoading && <Spinner size="sm" color="current" />}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
