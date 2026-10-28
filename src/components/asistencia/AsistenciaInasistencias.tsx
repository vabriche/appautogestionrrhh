import React from "react";
import type { InasistenciaDetalle } from "@/models";
import { MdEventBusy } from "react-icons/md";
import { Spinner } from "@heroui/react";

interface AsistenciaInasistenciasProps {
  inasistencias: InasistenciaDetalle[];
  loading: boolean;
  error: string | null;
}

export const AsistenciaInasistencias: React.FC<AsistenciaInasistenciasProps> = ({
  inasistencias,
  loading,
  error,
}) => {
  const getMotivoText = (mot: string) => {
    switch (mot) {
      case "02":
        return "Estudio";
      case "04":
        return "Razones Particulares";
      case "32":
        return "Permiso Excepcional";
      default:
        return `Otro (${mot})`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-fce-gold/25 overflow-hidden flex flex-col mt-6">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">
          Detalle de Justificaciones / Inasistencias
        </h3>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : inasistencias.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-gray-500 gap-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <MdEventBusy size={32} className="text-gray-400" />
            <p className="text-sm">No hay licencias registradas en este período.</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[350px] border border-gray-100 rounded-xl relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 bg-gray-50">MOT. INASISTENCIA</th>
                  <th className="px-4 py-3 bg-gray-50 text-center">FECHA INICIO</th>
                  <th className="px-4 py-3 bg-gray-50 text-center">FECHA FIN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inasistencias.map((ina, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {getMotivoText(ina.mot)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {ina.fechai ? ina.fechai.replace(/-/g, "/") : "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {ina.fechaf ? ina.fechaf.replace(/-/g, "/") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
