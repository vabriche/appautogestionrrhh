"use client";

import React, { useEffect } from "react";
import { toast } from "@heroui/react";

export type ToastType = "success" | "error" | "danger" | "warning" | "info";

export interface ToastOptions {
  description?: string;
  timeout?: number;
  onClose?: () => void;
}

/**
 * Función genérica para disparar notificaciones Toast de HeroUI
 * pasando únicamente el mensaje y el tipo.
 *
 * @param message Texto principal de la notificación.
 * @param type Tipo de notificación ('success' | 'error' | 'danger' | 'warning' | 'info').
 * @param options Opciones adicionales como description, timeout o onClose.
 *
 * @example
 * showToast("Contraseña actualizada con éxito", "success");
 * showToast("Error al guardar datos", "error", { description: "Detalles del error..." });
 */
export const showToast = (
  message: string,
  type: ToastType = "info",
  options?: ToastOptions,
) => {
  const timeout =
    options?.timeout ??
    (type === "error" || type === "danger" ? 5000 : 3500);

  const toastOptions = {
    description: options?.description,
    timeout,
    onClose: options?.onClose,
  };

  switch (type) {
    case "success":
      return toast.success(message, toastOptions);
    case "error":
    case "danger":
      return toast.danger(message, toastOptions);
    case "warning":
      return toast.warning(message, toastOptions);
    case "info":
    default:
      return toast.info(message, toastOptions);
  }
};

export interface ToastNotificationProps {
  message: string;
  type?: ToastType;
  description?: string;
  timeout?: number;
}

/**
 * Componente genérico para disparar un Toast al montarse de forma declarativa.
 */
export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type = "info",
  description,
  timeout,
}) => {
  useEffect(() => {
    if (message) {
      showToast(message, type, { description, timeout });
    }
  }, [message, type, description, timeout]);

  return null;
};

export default showToast;
