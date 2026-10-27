import React from "react";
import type { RegistroAsistencia, AuthUser } from "@/models";
import { MdEventBusy, MdFileDownload } from "react-icons/md";
import { Spinner } from "@heroui/react";
import { horasADecimal } from "@/lib/horas";

interface AsistenciaTableProps {
  user: AuthUser | null;
  registros: RegistroAsistencia[];
  fechaInicio: string;
  fechaFin: string;
  loading: boolean;
  error: string | null;
}

export const AsistenciaTable: React.FC<AsistenciaTableProps> = ({
  user,
  registros,
  fechaInicio,
  fechaFin,
  loading,
  error,
}) => {
  const handleExportCSV = () => {
    if (!registros.length || !user) return;

    // Headers
    const headers = [
      "area",
      "legajo",
      "apellido",
      "fecha",
      "Hentrada",
      "Hsalida",
      "horasT",
      "nroregistro",
      "virtual",
    ];

    const getVirtualLetter = (virtual: any) => {
      if (virtual === 1 || virtual === "A" || virtual === "1") return "A";
      if (virtual === "V") return "V";
      if (virtual === 0 || virtual === "0" || virtual === null || virtual === undefined) return "P";
      return virtual.toString();
    };

    // Rows
    const rows = registros.map((reg) => {
      // Formato de horasT: HH:MM
      const horasT = horasADecimal(reg.horasT);
      const h = Math.floor(horasT);
      const m = Math.round((horasT - h) * 60);
      const horasTStr = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;

      return [
        user.area || "1",
        `"${user.legajo}"`,
        `"${user.apellido}"`,
        `"${reg.fecha ? reg.fecha.replace(/-/g, "/") : ""}"`,
        `"${reg.Hentrada || ""}"`,
        `"${reg.Hsalida || "X"}"`,
        `"${horasTStr}"`,
        `"${reg.nroregistro}"`,
        `"${getVirtualLetter(reg.virtual)}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `asistencia_${user.legajo}_${fechaInicio}_${fechaFin}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-fce-gold/25 overflow-hidden flex flex-col mb-6">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Detalle de Registros</h3>
        <button
          onClick={handleExportCSV}
          disabled={loading || registros.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-fce-maroon hover:bg-fce-maroon-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdFileDownload size={18} />
          Exportar CSV
        </button>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : registros.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500 gap-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <MdEventBusy size={40} className="text-gray-400" />
            <p className="text-sm">No hay registros en este período.</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] border border-gray-100 rounded-xl relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 bg-gray-50">FECHA</th>
                  <th className="px-4 py-3 bg-gray-50">ENTRADA</th>
                  <th className="px-4 py-3 bg-gray-50">SALIDA</th>
                  <th className="px-4 py-3 bg-gray-50 text-center">HORAS</th>
                  <th className="px-4 py-3 bg-gray-50 text-center">MODALIDAD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {registros.map((reg) => (
                  <tr
                    key={reg.nroregistro}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {reg.fecha ? reg.fecha.replace(/-/g, "/") : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {reg.Hentrada || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {reg.Hsalida || "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">
                      {horasADecimal(reg.horasT).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(reg.virtual === 1 || String(reg.virtual) === "1" || String(reg.virtual) === "A" || String(reg.virtual) === "V") ? (
                        <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-fce-gold/20 text-yellow-800 whitespace-nowrap">
                          {String(reg.virtual) === "V" ? "Virt. No Acreditado" : "Virt. Acreditado"}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                          Presencial
                        </span>
                      )}
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
