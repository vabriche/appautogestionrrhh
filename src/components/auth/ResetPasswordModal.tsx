"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MdLockReset,
  MdClose,
  MdFingerprint,
} from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { Button, Spinner } from "@heroui/react";
import { resetPasswordAction } from "@/controllers/auth.controller";
import { showToast, FeedbackAlert } from "@/components/ui";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLegajo?: string | number | null;
  onSuccess?: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultLegajo = "",
  onSuccess,
}) => {
  const router = useRouter();
  const [legajo, setLegajo] = useState(
    defaultLegajo !== undefined && defaultLegajo !== null
      ? String(defaultLegajo)
      : "",
  );
  const [documento, setDocumento] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (defaultLegajo !== undefined && defaultLegajo !== null) {
      setLegajo(String(defaultLegajo));
    }
  }, [defaultLegajo]);

  // Limpiar campos al abrir/cerrar
  useEffect(() => {
    if (!isOpen) {
      setDocumento("");
      setErrorMessage(null);
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

    const legajoStr = String(legajo ?? "").trim();
    const docStr = String(documento ?? "").trim();

    if (!legajoStr) {
      const msg = "Por favor, ingresá tu legajo.";
      setErrorMessage(msg);
      showToast(msg, "warning");
      return;
    }

    if (!docStr) {
      const msg = "Por favor, ingresá tu número de documento.";
      setErrorMessage(msg);
      showToast(msg, "warning");
      return;
    }

    if (!/^\d+$/.test(legajoStr)) {
      const msg = "El legajo debe contener solo números.";
      setErrorMessage(msg);
      showToast(msg, "warning");
      return;
    }

    if (!/^\d+$/.test(docStr) || docStr.length < 6) {
      const msg = "Ingresá un número de documento válido (mínimo 6 dígitos).";
      setErrorMessage(msg);
      showToast(msg, "warning");
      return;
    }

    setIsPending(true);

    try {
      const result = await resetPasswordAction({
        legajo: legajoStr,
        documento: docStr,
      });

      if (result.ok) {
        showToast("¡Contraseña restablecida con éxito!", "success");
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          // Redirige al destino según su rol (MVC)
          const targetPath = result.data.encargadoArea
            ? "/supervision/personal"
            : "/asistencia";
          router.push(targetPath);
          router.refresh();
        }
      } else {
        const errorMsg =
          result.error ||
          "Los datos ingresados no coinciden con ningún agente registrado.";
        setErrorMessage(errorMsg);
        showToast(errorMsg, "danger");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado al restablecer la contraseña.";
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
      aria-labelledby="reset-modal-title"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-fce-gold/40 animate-in zoom-in-95 duration-200">
        {/* Cabecera institucional */}
        <div className="bg-fce-maroon px-6 py-5 border-b-4 border-fce-gold flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fce-maroon-mid rounded-xl text-fce-gold">
              <MdLockReset size={22} />
            </div>
            <div>
              <h2
                id="reset-modal-title"
                className="text-lg font-semibold leading-tight"
              >
                Restablecer Contraseña
              </h2>
              <p className="text-xs text-fce-cream">
                Blanqueo de clave a número de documento
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-fce-cream hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Mensaje de feedback de error */}
        {errorMessage && (
          <div className="mx-6 mt-4">
            <FeedbackAlert message={errorMessage} type="danger" />
          </div>
        )}

        {/* Información explicativa */}
        <div className="mx-6 mt-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
          <span className="font-semibold block mb-0.5">¿Cómo funciona?</span>
          Ingresá tu legajo y DNI. Si los datos coinciden, tu nueva clave pasará
          a ser tu número de documento e ingresarás directamente al sistema.
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Legajo */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Número de Legajo
            </label>
            <div className="relative">
              <FaRegUser
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                inputMode="numeric"
                value={legajo}
                onChange={(e) => setLegajo(e.target.value)}
                placeholder="Ej: 121725"
                required
                disabled={isPending}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-fce-maroon focus:ring-2 focus:ring-fce-gold/40 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Número de Documento (DNI) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Número de Documento (DNI)
            </label>
            <div className="relative">
              <MdFingerprint
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                inputMode="numeric"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ingresá tu DNI sin puntos"
                required
                disabled={isPending}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-fce-maroon focus:ring-2 focus:ring-fce-gold/40 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Acciones del pie */}
          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              onPress={onClose}
              isDisabled={isPending}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isDisabled={isPending}
              className="flex-1 bg-fce-maroon hover:bg-fce-maroon-mid text-white font-medium py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Spinner size="sm" color="current" />
                  <span>Restableciendo...</span>
                </>
              ) : (
                "Restablecer clave"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
