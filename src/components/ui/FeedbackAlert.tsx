"use client";

import React from "react";
import {
  MdCheckCircle,
  MdErrorOutline,
  MdWarningAmber,
  MdInfoOutline,
} from "react-icons/md";

export type FeedbackType = "success" | "error" | "danger" | "warning" | "info";

export interface FeedbackAlertProps {
  message: string;
  type?: FeedbackType;
  title?: string;
  className?: string;
  onDismiss?: () => void;
}

/**
 * Componente genérico para mostrar mensajes informativos o de alerta en línea,
 * recibiendo simplemente el mensaje y el tipo ('success' | 'error' | 'warning' | 'info').
 */
export const FeedbackAlert: React.FC<FeedbackAlertProps> = ({
  message,
  type = "info",
  title,
  className = "",
  onDismiss,
}) => {
  if (!message) return null;

  const styleConfig = {
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: <MdCheckCircle className="text-emerald-600 text-lg shrink-0" />,
      defaultTitle: "Éxito",
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-800",
      icon: <MdErrorOutline className="text-red-600 text-lg shrink-0" />,
      defaultTitle: "Error",
    },
    danger: {
      container: "bg-red-50 border-red-200 text-red-800",
      icon: <MdErrorOutline className="text-red-600 text-lg shrink-0" />,
      defaultTitle: "Error",
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-800",
      icon: <MdWarningAmber className="text-amber-600 text-lg shrink-0" />,
      defaultTitle: "Atención",
    },
    info: {
      container: "bg-sky-50 border-sky-200 text-sky-800",
      icon: <MdInfoOutline className="text-sky-600 text-lg shrink-0" />,
      defaultTitle: "Información",
    },
  }[type] || {
    container: "bg-gray-50 border-gray-200 text-gray-800",
    icon: <MdInfoOutline className="text-gray-600 text-lg shrink-0" />,
    defaultTitle: "Aviso",
  };

  return (
    <div
      role="alert"
      className={`p-3 border rounded-xl flex items-start gap-2.5 text-xs transition-all ${styleConfig.container} ${className}`}
    >
      {styleConfig.icon}
      <div className="flex-1 leading-relaxed">
        {title && (
          <span className="font-semibold block mb-0.5">{title}</span>
        )}
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer leading-none text-base"
          aria-label="Cerrar aviso"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default FeedbackAlert;
