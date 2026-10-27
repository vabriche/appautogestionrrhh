"use client";

import React, { useState, useEffect } from "react";
import {
  MdLock,
  MdLockOutline,
  MdVisibility,
  MdVisibilityOff,
  MdClose,
  MdVpnKey,
} from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { Button, Spinner } from "@heroui/react";
import { changePasswordAction } from "@/controllers/auth.controller";
import { showToast, FeedbackAlert } from "@/components/ui";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLegajo?: string | number | null;
  onSubmit?: (data: {
    legajo: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; message?: string }>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  defaultLegajo = "",
  onSubmit,
}) => {
  const [legajo, setLegajo] = useState(
    defaultLegajo !== undefined && defaultLegajo !== null
      ? String(defaultLegajo)
      : "",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (defaultLegajo !== undefined && defaultLegajo !== null) {
      setLegajo(String(defaultLegajo));
    }
  }, [defaultLegajo]);

  // Limpiar campos al abrir/cerrar
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const legajoStr = String(legajo ?? "").trim();

    if (!legajoStr) {
      const msg = "Por favor, ingresá tu legajo.";
      setErrorMessage(msg);
      showToast(msg, "warning");
      return;
    }

    if (!currentPassword) {
      const msg = "Por favor, ingresá tu contraseña actual.";
      setErrorMessage(msg);
      showToast(msg, "warning");
      return;
    }

    if (newPassword.length < 4) {
      const msg = "La nueva contraseña debe tener al menos 4 caracteres.";
      setErrorMessage(msg);
      showToast(msg, "warning");
      return;
    }

    if (newPassword === currentPassword) {
      const msg = "La nueva contraseña no puede ser igual a la actual.";
      setErrorMessage(msg);
      showToast(msg, "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = "Las contraseñas no coinciden.";
      setErrorMessage(msg);
      showToast(msg, "danger");
      return;
    }

    setIsPending(true);

    try {
      if (onSubmit) {
        const result = await onSubmit({
          legajo: legajoStr,
          currentPassword,
          newPassword,
          confirmPassword,
        });

        if (result?.success) {
          const msg =
            result.message ?? "¡Contraseña actualizada con éxito!";
          showToast(msg, "success");
          onClose();
        } else {
          const msg =
            result?.message ?? "No se pudo actualizar la contraseña.";
          setErrorMessage(msg);
          showToast(msg, "danger");
        }
      } else {
        // Conexión directa con la Server Action del backend (POST /biometrico/changepass)
        const result = await changePasswordAction({
          legajo: legajoStr,
          passwold: currentPassword,
          passnew: newPassword,
        });

        if (result.ok) {
          showToast("¡Contraseña actualizada con éxito!", "success");
          onClose();
        } else {
          const errorMsg = result.error || "No se pudo actualizar la contraseña.";
          setErrorMessage(errorMsg);
          showToast(errorMsg, "danger");
        }
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado al cambiar la contraseña.";
      setErrorMessage(msg);
      showToast(msg, "danger");
    } finally {
      setIsPending(false);
    }
  };


  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-fce-gold/40 animate-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="bg-fce-maroon px-6 py-5 border-b-4 border-fce-gold flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fce-maroon-mid rounded-xl text-fce-gold">
              <MdVpnKey size={22} />
            </div>
            <div>
              <h2
                id="modal-title"
                className="text-lg font-semibold leading-tight"
              >
                Cambiar Contraseña
              </h2>
              <p className="text-xs text-fce-cream">
                Actualizá las credenciales de tu cuenta
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-fce-cream hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Mensajes de feedback */}
        {errorMessage && (
          <div className="mx-6 mt-4">
            <FeedbackAlert message={errorMessage} type="danger" />
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4">
            <FeedbackAlert message={successMessage} type="success" />
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Legajo */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Legajo
            </label>
            <div className="relative">
              <FaRegUser
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={legajo}
                onChange={(e) => setLegajo(e.target.value)}
                placeholder="Ingresá tu legajo"
                required
                disabled={isPending}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-fce-maroon focus:ring-2 focus:ring-fce-gold/40 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Contraseña Actual */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Contraseña Actual
            </label>
            <div className="relative">
              <MdLock
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Tu contraseña actual"
                required
                disabled={isPending}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-fce-maroon focus:ring-2 focus:ring-fce-gold/40 transition-all disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-fce-maroon transition-colors"
                aria-label={showCurrentPassword ? "Ocultar" : "Mostrar"}
              >
                {showCurrentPassword ? (
                  <MdVisibilityOff size={18} />
                ) : (
                  <MdVisibility size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Nueva Contraseña
            </label>
            <div className="relative">
              <MdLockOutline
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña"
                required
                disabled={isPending}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-fce-maroon focus:ring-2 focus:ring-fce-gold/40 transition-all disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-fce-maroon transition-colors"
                aria-label={showNewPassword ? "Ocultar" : "Mostrar"}
              >
                {showNewPassword ? (
                  <MdVisibilityOff size={18} />
                ) : (
                  <MdVisibility size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Confirmar Nueva Contraseña */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <MdLockOutline
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí la nueva contraseña"
                required
                disabled={isPending}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-fce-maroon focus:ring-2 focus:ring-fce-gold/40 transition-all disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-fce-maroon transition-colors"
                aria-label={showConfirmPassword ? "Ocultar" : "Mostrar"}
              >
                {showConfirmPassword ? (
                  <MdVisibilityOff size={18} />
                ) : (
                  <MdVisibility size={18} />
                )}
              </button>
            </div>
            {newPassword &&
              confirmPassword &&
              newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Las contraseñas no coinciden.
                </p>
              )}
          </div>

          {/* Acciones del pie */}
          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              onPress={onClose}
              isDisabled={isPending}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isDisabled={
                isPending ||
                (confirmPassword !== "" && newPassword !== confirmPassword)
              }
              className="flex-1 bg-fce-maroon hover:bg-fce-maroon-mid text-white font-medium py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Spinner size="sm" color="current" />
                  <span>Actualizando...</span>
                </>
              ) : (
                "Actualizar"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
