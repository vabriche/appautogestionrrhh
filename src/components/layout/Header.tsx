"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { IoMdMenu } from "react-icons/io";
import { MdVpnKey, MdLogout, MdPerson } from "react-icons/md";
import Sidebar from "./Sidebar";
import ChangePasswordModal from "../auth/ChangePasswordModal";
import { AlertaSalidaModal } from "../asistencia/AlertaSalidaModal";
import { Button } from "@heroui/react";
import { logoutAction, getAuthUserAction } from "@/controllers/auth.controller";
import { getAlertaSalidaAction } from "@/controllers/asistencia.controller";
import type { AuthUser } from "@/models";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] =
    useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [alertaSalida, setAlertaSalida] = useState<{
    isOpen: boolean;
    fecha?: string;
    hentrada?: string;
  }>({ isOpen: false });

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cargar usuario autenticado y verificar alerta de salida pendiente
  useEffect(() => {
    if (pathname !== "/login") {
      getAuthUserAction().then(async (u) => {
        setUser(u);
        if (u?.legajo) {
          const resAlerta = await getAlertaSalidaAction();
          if (resAlerta?.alertaOlvidoSalida && resAlerta.fecha) {
            const storageKey = `alerta_salida_vista_${u.legajo}_${resAlerta.fecha}`;
            const yaVista = sessionStorage.getItem(storageKey);
            if (!yaVista) {
              setAlertaSalida({
                isOpen: true,
                fecha: resAlerta.fecha,
                hentrada: resAlerta.hentrada,
              });
            }
          }
        }
      });
    }
  }, [pathname]);

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setIsSideBarOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Cerrar menú de usuario al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // No mostrar el Header en la vista de Login
  if (pathname === "/login") return null;

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logoutAction();
    router.push("/login");
    router.refresh();
  };


  return (
    <>
      {/* Sidebar y backdrop */}
      {isSideBarOpen && (
        <>
          <Sidebar setIsSideBarOpen={setIsSideBarOpen} />
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsSideBarOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setIsSideBarOpen(false);
            }}
            aria-label="Cerrar menú lateral"
            className="fixed inset-0 bg-black/40 z-[9998] transition-opacity"
          />
        </>
      )}

      {/* Barra de navegación superior */}
      <header className="h-[15dvh] relative top-0 w-full bg-fce-maroon flex items-center px-6 md:px-10 text-fce-cream-light justify-between z-[50] border-b-4 border-fce-gold shadow-md">
        {/* Botón Menú Hamburguesa */}
        <Button
          onPress={() => setIsSideBarOpen(true)}
          isIconOnly
          aria-label="Abrir menú"
          className="bg-transparent text-white hover:bg-white/10 w-12 h-12 rounded-xl transition-colors"
        >
          <IoMdMenu size={30} />
        </Button>

        {/* Logo Institucional */}
        <button
          onClick={() =>
            router.push(
              user?.encargadoArea && user.encargadoArea !== "N"
                ? "/supervision/personal"
                : "/asistencia",
            )
          }
          className="flex items-center h-2/3 bg-fce-cream-light rounded-xl px-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer"
          aria-label="Ir al inicio"
        >
          <Image
            src="/logo.svg"
            alt="Logo Facultad de Ciencias Económicas"
            width={160}
            height={60}
            className="h-3/4 w-auto object-contain"
            priority
          />
        </button>

        {/* Acciones del lado derecho: Home + Dropdown de Usuario */}
        <div className="flex items-center gap-3">
          {/* Menú de Usuario desplegable */}
          <div className="relative" ref={userMenuRef}>
            <Button
              isIconOnly
              aria-label="Menú de usuario"
              aria-expanded={isUserMenuOpen}
              onPress={() => setIsUserMenuOpen((prev) => !prev)}
              className={`rounded-full w-12 h-12 transition-all flex items-center justify-center  ${
                isUserMenuOpen
                  ? "bg-fce-cream-light text-fce-maroon shadow-md scale-105"
                  : "bg-fce-maroon-mid text-white border-fce-gold/50 hover:border-fce-gold"
              }`}
            >
              <MdPerson size={24} />
            </Button>

            {/* Dropdown flotante */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-fce-gold/30 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Cabecera del usuario */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 rounded-t-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-fce-maroon/10 text-fce-maroon flex items-center justify-center font-bold text-xs">
                      <MdPerson size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 leading-tight">
                        {user ? user.apellido : "Mi Cuenta"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {user ? `Legajo: ${user.legajo}` : "Sesión activa"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Opciones del menú */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsPasswordModalOpen(true);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-fce-cream-light/60 hover:text-fce-maroon flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-gray-100 text-fce-maroon">
                      <MdVpnKey size={16} />
                    </div>
                    <span className="font-medium">Cambiar contraseña</span>
                  </button>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-red-100/70 text-red-600">
                      <MdLogout size={16} />
                    </div>
                    <span className="font-medium">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal de Cambio de Contraseña */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        defaultLegajo={user?.legajo}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Modal de Alerta de Salida No Registrada */}
      <AlertaSalidaModal
        isOpen={alertaSalida.isOpen}
        fecha={alertaSalida.fecha}
        hentrada={alertaSalida.hentrada}
        onClose={() => {
          if (user?.legajo && alertaSalida.fecha) {
            sessionStorage.setItem(
              `alerta_salida_vista_${user.legajo}_${alertaSalida.fecha}`,
              "true"
            );
          }
          setAlertaSalida({ isOpen: false });
        }}
      />
    </>
  );
};

export default Header;
