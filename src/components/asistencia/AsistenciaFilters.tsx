import React from "react";
import type { InasistenciaRes } from "@/models";
import { MdDateRange, MdCalendarToday, MdAccessTime, MdInfoOutline } from "react-icons/md";

interface AsistenciaFiltersProps {
  fechaInicio: string;
  setFechaInicio: (val: string) => void;
  fechaFin: string;
  setFechaFin: (val: string) => void;
  diasTrabajados: number;
  totalHoras: string;
  inasistencias: InasistenciaRes[];
  currentYear: number;
}

export const AsistenciaFilters: React.FC<AsistenciaFiltersProps> = ({
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  diasTrabajados,
  totalHoras,
  inasistencias,
  currentYear,
}) => {
  const getDiasByMot = (mot: string) => {
    const found = inasistencias.find((i) => i.mot === mot);
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

        <div className="space-y-4 pt-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <MdCalendarToday /> Días registrados
            </span>
            <span className="font-bold text-gray-800">{diasTrabajados}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <MdAccessTime /> Horas totales
            </span>
            <span className="font-bold text-fce-maroon">{totalHoras} hs</span>
          </div>
        </div>

        <hr className="border-gray-100" />
        
        <div className="flex flex-col gap-3 pt-1">
          <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5 uppercase">
            <MdInfoOutline size={16} className="text-fce-maroon" /> Licencias ({currentYear})
          </p>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Por Estudio <span className="text-xs text-gray-400">(Máx 24)</span></span>
              <span className={`font-semibold ${diasEstudio > 24 ? "text-red-600" : "text-gray-800"}`}>{diasEstudio}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Razones Partic. <span className="text-xs text-gray-400">(Máx 6)</span></span>
              <span className={`font-semibold ${diasParticulares > 6 ? "text-red-600" : "text-gray-800"}`}>{diasParticulares}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Excepcionales <span className="text-xs text-gray-400">(Máx 5)</span></span>
              <span className={`font-semibold ${diasExcepcionales > 5 ? "text-red-600" : "text-gray-800"}`}>{diasExcepcionales}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
