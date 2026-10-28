"use client";

import React, { useState, useEffect } from "react";
import { MdLock, MdLockOutline, MdClose, MdVpnKey } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { Button, Spinner } from "@heroui/react";
import { changePasswordAction } from "@/controllers/auth.controller";
import { showToast, FeedbackAlert, PasswordInput } from "@/components/ui";

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

    if (!legajo.trim()) {
      setErrorMessage("Por favor, ingresá tu legajo.");
      return;
    }
    if (!currentPassword) {
      setErrorMessage("Por favor, ingresá tu contraseña actual.");
      return;
    }
    if (!newPassword) {
      setErrorMessage("Por favor, ingresá la nueva contraseña.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Las nuevas contraseñas no coinciden.");
      return;
    }
    if (currentPassword === newPassword) {
      setErrorMessage("La nueva contraseña no puede ser igual a la actual.");
      return;
    }

    setIsPending(true);

    try {
      if (onSubmit) {
        const result = await onSubmit({
          legajo: legajo.trim(),
          currentPassword,
          newPassword,
          confirmPassword,
        });
        if (result.success) {
          setSuccessMessage(
            result.message || "Contraseña cambiada con éxito.",
          );
          showToast(
            result.message || "Contraseña actualizada exitosamente",
            "success",
          );
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setErrorMessage(
            result.message || "No se pudo actualizar la contraseña.",
          );
        }
      } else {
        const res = await changePasswordAction({
          legajo: legajo.trim(),
          passwold: currentPassword,
          passnew: newPassword,
        });

        if (res.ok) {
          setSuccessMessage("Contraseña actualizada con éxito.");
          showToast("Contraseña actualizada exitosamente", "success");
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setErrorMessage(res.error || "No se pudo actualizar la contraseña.");
        }
      }
    } catch {
      setErrorMessage("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-fce-gold/30 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-fce-maroon to-[#5c1722] p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="absolute right-4 top-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <MdClose size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-fce-gold backdrop-blur-xs">
              <MdVpnKey size={24} />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold tracking-tight">
                Cambiar Contraseña
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                Actualizá tus credenciales de acceso al sistema
              </p>
            </div>
          </div>
        </div>

        {/* Alertas inline */}
        {errorMessage && (
          <div className="p-4 pb-0">
            <FeedbackAlert
              type="error"
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
            />
          </div>
        )}
        {successMessage && (
          <div className="p-4 pb-0">
            <FeedbackAlert type="success" message={successMessage} />
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

          <PasswordInput
            label="Contraseña Actual"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Tu contraseña actual"
            required
            disabled={isPending}
            icon={<MdLock size={17} />}
          />

          <PasswordInput
            label="Nueva Contraseña"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Nueva contraseña (mínimo 6 caracteres)"
            required
            disabled={isPending}
            icon={<MdLockOutline size={17} />}
          />

          <div>
            <PasswordInput
              label="Confirmar Nueva Contraseña"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repetí la nueva contraseña"
              required
              disabled={isPending}
              icon={<MdLockOutline size={17} />}
            />
            {newPassword &&
              confirmPassword &&
              newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Las contraseñas no coinciden.
                </p>
              )}
          </div>

          {/* Acciones del pie */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onPress={onClose}
              isDisabled={isPending}
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isDisabled={isPending}
              className="px-5 py-2 text-xs font-semibold text-white bg-fce-maroon hover:bg-[#601823] active:scale-98 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {isPending && <Spinner size="sm" color="current" />}
              <span>{isPending ? "Actualizando..." : "Guardar Cambios"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
