import React from "react";
import type { AuthUser } from "@/models";

interface AsistenciaHeaderProps {
  user: AuthUser | null;
}

export const AsistenciaHeader: React.FC<AsistenciaHeaderProps> = ({ user }) => {
  const currentDateText = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-fce-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-fce-maroon">
          Módulo de Asistencia Personal
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
          {user?.apellido
            ? `Hola, ${user.apellido}`
            : "Mis Registros de Asistencia"}
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Legajo: {user?.legajo ?? "—"} •{" "}
          {user?.condicion === 1 ? "Docente" : "No Docente"} •{" "}
          {user?.area ? user.area.replace(/_/g, " ") : "Sin Área"}
        </p>
      </div>
      <p className="text-xs text-gray-600 capitalize bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg w-fit shrink-0">
        {currentDateText}
      </p>
    </div>
  );
};
