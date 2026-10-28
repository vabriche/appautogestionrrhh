import React from "react";
import Link from "next/link";
import type { InasistenciaRes } from "@/models";
import {
  MdDateRange,
  MdCalendarToday,
  MdAccessTime,
  MdTrendingUp,
  MdInfoOutline,
} from "react-icons/md";

interface AsistenciaFiltersProps {
  fechaInicio: string;
  setFechaInicio: (val: string) => void;
  fechaFin: string;
  setFechaFin: (val: string) => void;
  diasTrabajados: number;
  totalHoras: string;
  promedioHoras: string;
  cantDiasValidos: number;
  inasistencias: InasistenciaRes[];
  currentYear: number;
  anioConsultado: number;
}

export const AsistenciaFilters: React.FC<AsistenciaFiltersProps> = ({
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  diasTrabajados,
  totalHoras,
  promedioHoras,
  cantDiasValidos,
  inasistencias,
  anioConsultado,
}) => {
  const getDiasByMot = (mot: string) => {
    const found = inasistencias.find(
      (i) => i.mot === mot || i.mot === mot.replace(/^0+/, "") || Number(i.mot) === Number(mot)
    );
    return found ? Number(found.dias) : 0;
  };

  const diasEstudio = getDiasByMot("02");
  const diasParticulares = getDiasByMot("04");
  const diasExcepcionales = getDiasByMot("32");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-fce-gold/25 h-fit overflow-hidden flex flex-col">
      <div className="flex gap-3 px-5 pt-5 pb-3 items-center">
        <div className="p-2 bg-fce-maroon/10 text-fce-maroon rounded-lg">
          <MdDateRange size={20} />
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-bold text-gray-800">Período</p>
          <p className="text-xs text-gray-500">Filtrar registros</p>
        </div>
      </div>
      <hr className="border-gray-100" />
      <div className="px-5 py-5 flex flex-col gap-5 flex-1">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Fecha de inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-fce-maroon focus:ring-1 focus:ring-fce-maroon bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Fecha de fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-fce-maroon focus:ring-1 focus:ring-fce-maroon bg-white"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Indicadores de Días, Horas Totales y Promedio de Horas */}
        <div className="space-y-4 pt-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <MdCalendarToday className="text-gray-500" /> Días registrados
            </span>
            <span className="font-bold text-gray-800">{diasTrabajados}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <MdAccessTime className="text-gray-500" /> Horas totales
            </span>
            <span className="font-bold text-fce-maroon">{totalHoras} hs</span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className="text-sm text-gray-600 flex items-center gap-2"
              title={
                cantDiasValidos > 0
                  ? `Promedio calculado sobre ${cantDiasValidos} registro(s) válido(s) con entrada y salida`
                  : "Sin registros válidos con entrada y salida en el período"
              }
            >
              <MdTrendingUp className="text-gray-500" /> Promedio de horas
            </span>
            <span className="font-bold text-fce-maroon">{promedioHoras} hs</span>
          </div>
        </div>

        <hr className="border-gray-100" />
        
        {/* Justificaciones utilizadas en el año */}
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5 uppercase">
              <MdInfoOutline size={16} className="text-fce-maroon" /> Justificaciones utilizadas ({anioConsultado})
            </p>
            <Link
              href="/tramites?tab=mis-solicitudes"
              className="text-[11px] text-fce-maroon hover:underline font-semibold"
              title="Ir a Mis Solicitudes"
            >
              Ver todas →
            </Link>
          </div>
          
          <div className="space-y-1">
            {/* Estudio: X/28 */}
            <Link
              href="/tramites?tab=mis-solicitudes"
              className="flex justify-between items-center text-sm px-2 py-1.5 rounded-lg hover:bg-fce-cream/60 transition-colors group cursor-pointer border border-transparent hover:border-fce-gold/30"
              title="Ver detalle en Mis Solicitudes"
            >
              <span className="text-gray-700 group-hover:text-fce-maroon group-hover:font-medium transition-colors flex items-center gap-1.5">
                Estudio
                <span className="text-[10px] text-gray-400 group-hover:text-fce-maroon opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
              </span>
              <span className={`font-semibold ${diasEstudio > 28 ? "text-red-600" : "text-gray-800"}`}>
                {diasEstudio}/28
              </span>
            </Link>
            
            {/* Razones Particulares: X/6 */}
            <Link
              href="/tramites?tab=mis-solicitudes"
              className="flex justify-between items-center text-sm px-2 py-1.5 rounded-lg hover:bg-fce-cream/60 transition-colors group cursor-pointer border border-transparent hover:border-fce-gold/30"
              title="Ver detalle en Mis Solicitudes"
            >
              <span className="text-gray-700 group-hover:text-fce-maroon group-hover:font-medium transition-colors flex items-center gap-1.5">
                Razones Particulares
                <span className="text-[10px] text-gray-400 group-hover:text-fce-maroon opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
              </span>
              <span className={`font-semibold ${diasParticulares > 6 ? "text-red-600" : "text-gray-800"}`}>
                {diasParticulares}/6
              </span>
            </Link>
            
            {/* Permiso Excepcional: X/5 */}
            <Link
              href="/tramites?tab=mis-solicitudes"
              className="flex justify-between items-center text-sm px-2 py-1.5 rounded-lg hover:bg-fce-cream/60 transition-colors group cursor-pointer border border-transparent hover:border-fce-gold/30"
              title="Ver detalle en Mis Solicitudes"
            >
              <span className="text-gray-700 group-hover:text-fce-maroon group-hover:font-medium transition-colors flex items-center gap-1.5">
                Permiso Excepcional
                <span className="text-[10px] text-gray-400 group-hover:text-fce-maroon opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
              </span>
              <span className={`font-semibold ${diasExcepcionales > 5 ? "text-red-600" : "text-gray-800"}`}>
                {diasExcepcionales}/5
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
