"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { useState, useEffect, useActionState } from "react";
import { Button, FieldError, Input, Label, Spinner, TextField } from "@heroui/react";
import {
  MdLock,
  MdArrowForward,
  MdVisibilityOff,
  MdVisibility,
  MdVpnKey,
  MdLockReset,
} from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { loginAction } from "@/controllers/auth.controller";
import { showToast } from "@/components/ui";
import { ResetPasswordModal, ChangePasswordModal } from "@/components/auth";

const LoginView = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [legajoInput, setLegajoInput] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(loginAction, null);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state?.ok && state.data) {
      showToast("¡Bienvenido al sistema!", "success");
      if (state.data.encargadoArea) {
        router.push("/supervision/personal");
      } else {
        router.push("/asistencia");
      }
      router.refresh();
    } else if (state && !state.ok && state.error) {
      showToast(state.error, "danger");
    }
  }, [state, router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-fce-cream-light px-4">
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-fce-gold/30">
        {/* Panel superior */}
        <div className="bg-fce-maroon px-8 py-10 text-center border-b-4 border-fce-gold">
          <div className="mx-auto mb-5 w-fit bg-fce-cream-light rounded-xl px-5 py-3 shadow-sm">
            <Image
              src="/logo.svg"
              alt="Logo Facultad de Ciencias Económicas"
              width={160}
              height={60}
              className="h-10 w-auto object-contain mx-auto"
              priority
            />
          </div>
          <h1 className="text-white text-2xl font-semibold mb-1">Bienvenido</h1>
          <p className="text-fce-cream text-sm">
            Ingresá tus datos para continuar
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white px-8 py-8">
          <form action={formAction} className="flex flex-col gap-5">
            <TextField
              isRequired
              name="legajo"
              type="text"
              className="w-full"
              isInvalid={!!fieldErrors?.legajo}
              validate={(v) =>
                /^\d+$/.test(v) ? null : "Ingresá un legajo válido (solo números)"
              }
            >
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Legajo
              </Label>
              <div className="relative mt-1.5">
                <FaRegUser
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-fce-maroon/60 z-10"
                />
                <Input
                  name="legajo"
                  value={legajoInput}
                  onChange={(e) => setLegajoInput(e.target.value)}
                  placeholder="Número de legajo"
                  disabled={isPending}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-fce-maroon focus:ring-2 focus:ring-fce-gold/40 transition-all disabled:opacity-60"
                />
              </div>
              <FieldError className="text-xs text-red-600 mt-1" />
              {fieldErrors?.legajo && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.legajo[0]}
                </p>
              )}
            </TextField>

            <TextField
              isRequired
              name="passw"
              type={showPassword ? "text" : "password"}
              className="w-full"
              isInvalid={!!fieldErrors?.passw}
              validate={(v) =>
                v.length >= 1 ? null : "La contraseña es requerida"
              }
            >
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contraseña
              </Label>
              <div className="relative mt-1.5">
                <MdLock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-fce-maroon/60 z-10"
                />
                <Input
                  name="passw"
                  placeholder="Tu contraseña"
                  disabled={isPending}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-fce-maroon focus:ring-2 focus:ring-fce-gold/40 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-fce-maroon transition cursor-pointer"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <MdVisibilityOff size={18} />
                  ) : (
                    <MdVisibility size={18} />
                  )}
                </button>
              </div>
              <FieldError className="text-xs text-red-600 mt-1" />
              {fieldErrors?.passw && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.passw[0]}
                </p>
              )}
            </TextField>

            {state?.ok === false && (
              <p className="text-xs text-red-600 text-center bg-red-50 border border-red-200 rounded-lg py-2.5 px-3">
                {state.error}
              </p>
            )}

            <Button
              type="submit"
              isPending={isPending}
              isDisabled={isPending}
              className="w-full bg-fce-maroon text-white font-medium rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-fce-maroon-mid transition-colors disabled:opacity-70 cursor-pointer shadow-sm"
            >
              {({ isPending: btnPending }) =>
                btnPending || isPending ? (
                  <>
                    <Spinner size="sm" color="current" />
                    <span>Ingresando...</span>
                  </>
                ) : (
                  <>
                    <MdArrowForward size={16} />
                    <span>Iniciar sesión</span>
                  </>
                )
              }
            </Button>

            {/* Opciones de acceso: Restablecer o Cambiar contraseña */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-gray-100 text-xs">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="text-gray-500 hover:text-fce-maroon hover:underline flex items-center gap-1.5 transition-colors cursor-pointer py-1"
              >
                <MdLockReset size={16} className="text-fce-gold" />
                <span>¿Olvidaste tu contraseña?</span>
              </button>

              <button
                type="button"
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="text-fce-maroon hover:text-fce-maroon-mid font-medium hover:underline flex items-center gap-1.5 transition-colors cursor-pointer py-1"
              >
                <MdVpnKey size={14} className="text-fce-gold" />
                <span>Cambiar contraseña</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modales de recuperación y cambio de clave */}
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        defaultLegajo={legajoInput}
        onClose={() => setIsResetModalOpen(false)}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        defaultLegajo={legajoInput}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default LoginView;
