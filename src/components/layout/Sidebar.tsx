"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  MdClose,
  MdLogout,
  MdKeyboardArrowDown,
  MdAccessTime,
  MdSupervisorAccount,
  MdDescription,
} from "react-icons/md";
import { logoutAction, getAuthUserAction } from "@/controllers/auth.controller";
import type { AuthUser } from "@/models";

interface SubNavItem {
  name: string;
  path: string;
  roles?: string[];
}

interface NavDropdownSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  roles?: string[];
  items: SubNavItem[];
}

interface SidebarProps {
  setIsSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const navDropdowns: NavDropdownSection[] = [
  {
    id: "supervision",
    name: "Supervisión",
    icon: <MdSupervisorAccount size={18} />,
    roles: ["encargado"],
    items: [
      { name: "Área Asistencia", path: "/supervision/personal" },
      { name: "Justificaciones", path: "/supervision/justificaciones" }
    ],
  },
  {
    id: "asistencia",
    name: "Asistencia",
    icon: <MdAccessTime size={18} />,
    items: [{ name: "Ver Registros", path: "/asistencia" }],
  },
  {
    id: "tramites",
    name: "Trámites RRHH",
    icon: <MdDescription size={18} />,
    items: [
      { name: "Justificar Inasistencias", path: "/tramites" },
      { name: "Licencia Anual (Vacaciones)", path: "/tramites/vacaciones" },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ setIsSideBarOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    getAuthUserAction().then(setUser);
  }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    asistencia: false,
    tramites: false,
    supervision: false,
  });

  useEffect(() => {
    navDropdowns.forEach((section) => {
      const containsActiveRoute = section.items.some((item) =>
        pathname.startsWith(item.path),
      );
      if (containsActiveRoute) {
        setOpenSections((prev) => ({ ...prev, [section.id]: true }));
      }
    });
  }, [pathname]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsSideBarOpen(false);
  };

  const handleLogout = async () => {
    setIsSideBarOpen(false);
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  const visibleSections = navDropdowns.filter((section) => {
    if (
      section.id === "supervision" &&
      (!user?.encargadoArea || user.encargadoArea === "N")
    ) {
      return false;
    }
    return true;
  });

  return (
    <aside className="fixed top-0 left-0 w-72 max-w-[85vw] h-screen bg-fce-cream-light border-r border-fce-gold/30 z-[9999] flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-150">
      {/* Cabecera y Navegación con scroll */}
      <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5">
        {/* Cabecera del Menú */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-fce-gold/25">
          <span className="text-xs font-bold uppercase tracking-wider text-fce-maroon">
            Menú Principal
          </span>
          <button
            type="button"
            onClick={() => setIsSideBarOpen(false)}
            aria-label="Cerrar menú"
            className="p-1.5 rounded-lg text-gray-400 hover:text-fce-maroon hover:bg-white/60 transition-colors cursor-pointer"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Lista de navegación */}
        <nav className="flex flex-col gap-1.5">
          {/* Secciones Desplegables con contenedor blanco diferenciado */}
          <div className="pt-2 flex flex-col gap-1.5">
            {visibleSections.map((section) => {
              const isOpen = !!openSections[section.id];
              const isSectionActive = section.items.some(
                (item) => pathname === item.path,
              );

              return (
                <div key={section.id} className="flex flex-col">
                  {/* Botón Cabecera de la Sección */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={isOpen}
                    className={`group w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-xl transition-all cursor-pointer ${
                      isSectionActive
                        ? "text-fce-maroon font-semibold bg-white/70 shadow-2xs border border-fce-gold/25"
                        : "text-fce-text-dark hover:text-fce-maroon hover:bg-white/50 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          isSectionActive
                            ? "text-fce-maroon"
                            : "text-fce-maroon/70 group-hover:text-fce-maroon transition-colors"
                        }
                      >
                        {section.icon}
                      </span>
                      <span>{section.name}</span>
                    </div>
                    <MdKeyboardArrowDown
                      size={17}
                      className={`text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-fce-maroon" : ""
                      }`}
                    />
                  </button>

                  {/* Sub-elementos en panel blanco distintivo sobre el fondo crema */}
                  {isOpen && (
                    <div className="bg-white/95 border border-fce-gold/30 rounded-xl p-1.5 my-1.5 shadow-sm flex flex-col gap-1">
                      {section.items.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                          <button
                            key={item.path}
                            type="button"
                            onClick={() => handleNavigate(item.path)}
                            className={`w-full text-left text-xs py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-between ${
                              isActive
                                ? "bg-fce-maroon text-white font-semibold shadow-xs"
                                : "text-gray-700 hover:text-fce-maroon hover:bg-fce-cream-light/60 font-medium"
                            }`}
                          >
                            <span>{item.name}</span>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-fce-gold shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Pie del Sidebar */}
      <div className="p-3 border-t border-fce-gold/25 bg-black/5">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 text-xs text-red-700 hover:text-red-800 hover:bg-red-50/80 py-2.5 px-3 rounded-xl font-medium transition-colors cursor-pointer"
        >
          <MdLogout size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
