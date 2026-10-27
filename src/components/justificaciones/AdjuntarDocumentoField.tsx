"use client";

import React from "react";

interface AdjuntarDocumentoFieldProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export const AdjuntarDocumentoField: React.FC<AdjuntarDocumentoFieldProps> = ({
  onFileChange,
}) => {
  return (
    <div className="flex flex-col gap-2 p-4 bg-amber-50/70 border border-amber-200/90 rounded-xl">
      <label className="text-sm font-semibold text-amber-950 flex items-center justify-between">
        <span>Documento Adjunto / Justificativo</span>
        <span className="text-[11px] bg-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded-full font-semibold">
          Requerido para este motivo
        </span>
      </label>
      <p className="text-xs text-amber-900/80">
        Este motivo requiere adjuntar comprobante. Si no cuentas con él en este momento, puedes continuar y subirlo luego desde la sección <strong>&quot;Mis Solicitudes&quot;</strong>.
      </p>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-semibold
          file:bg-fce-maroon file:text-white
          hover:file:bg-fce-maroon-dark file:cursor-pointer file:transition-colors"
      />
    </div>
  );
};
