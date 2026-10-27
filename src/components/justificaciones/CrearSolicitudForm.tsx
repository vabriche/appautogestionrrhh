"use client";

import React, { useState, useEffect } from "react";
import type { Motivo } from "@/models";
import { getMotivosAction, crearSolicitudAction } from "@/controllers/justificaciones.controller";
import { showToast } from "@/components/ui";
import { requiereDocumentoJustificativo } from "@/lib/motivosDoc";
import { obtenerReglaCupo } from "@/lib/limitesJustificaciones";
import { CuadroCuposLimites } from "./CuadroCuposLimites";
import { PeriodoFechasSelector } from "./PeriodoFechasSelector";
import { AdjuntarDocumentoField } from "./AdjuntarDocumentoField";

interface CrearSolicitudFormProps {
  onSuccess: () => void;
}

const getHoyLocalISO = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calcularDias = (inicio: string, fin: string): number => {
  if (!inicio || !fin) return 1;
  const d1 = new Date(inicio + "T00:00:00");
  const d2 = new Date(fin + "T00:00:00");
  const diffTime = d2.getTime() - d1.getTime();
  if (diffTime < 0) return 1;
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const CrearSolicitudForm: React.FC<CrearSolicitudFormProps> = ({ onSuccess }) => {
  const [motivos, setMotivos] = useState<Motivo[]>([]);
  const [codina, setCodina] = useState<string>("");
  const [tipo, setTipo] = useState<"I" | "L">("I");
  const [comunico, setComunico] = useState<"S" | "N">("S");
  const [observacion, setObservacion] = useState("");
  const [fechaInicio, setFechaInicio] = useState(getHoyLocalISO());
  const [fechaFin, setFechaFin] = useState(getHoyLocalISO());
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const motivoSeleccionado = motivos.find((m) => String(m.codina) === String(codina));
  const exigeDoc = requiereDocumentoJustificativo(motivoSeleccionado?.Motivo);
  const reglaActiva = obtenerReglaCupo(motivoSeleccionado?.Motivo);
  const cantDias = calcularDias(fechaInicio, fechaFin);

  const errorLimiteCupo = (() => {
    if (!reglaActiva || !reglaActiva.maxPorSolicitud) return null;
    if (cantDias > reglaActiva.maxPorSolicitud) {
      if (reglaActiva.tipo === "ESTUDIO") {
        return `Para Estudio el máximo permitido es de ${reglaActiva.maxPorSolicitud} días por examen (has seleccionado ${cantDias} días).`;
      }
      return `Para ${reglaActiva.nombre} el máximo permitido es de ${reglaActiva.maxPorSolicitud} días por mes (has seleccionado ${cantDias} días).`;
    }
    return null;
  })();

  useEffect(() => {
    loadMotivos();
  }, []);

  const loadMotivos = async () => {
    const data = await getMotivosAction();
    setMotivos(data);
    if (data.length > 0) setCodina(String(data[0].codina));
  };

  const handleMotivoChange = (nuevoCodina: string) => {
    setCodina(nuevoCodina);
    const mSel = motivos.find((m) => String(m.codina) === String(nuevoCodina));
    if (!requiereDocumentoJustificativo(mSel?.Motivo)) {
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (errorLimiteCupo) {
      showToast(errorLimiteCupo, "error");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    if (file) {
      formData.append("documento", file);
    }

    const payload = {
      legajo: "", // Se asigna en el server action
      codina,
      tipo,
      comunico,
      observacion: observacion || null,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      cantidad_dias: cantDias,
    };

    const res = await crearSolicitudAction(payload, file ? formData : undefined);
    
    if (res.ok) {
      if (res.error) {
        showToast(res.error, "warning");
      } else {
        showToast("Solicitud creada con éxito.", "success");
      }
      setFechaInicio(getHoyLocalISO());
      setFechaFin(getHoyLocalISO());
      setObservacion("");
      setFile(null);
      onSuccess();
    } else {
      showToast(res.error || "Ocurrió un error", "error");
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Nueva Solicitud de Justificación
      </h2>

      {/* Cuadro de Cupos y Límites Legales */}
      <CuadroCuposLimites reglaActiva={reglaActiva} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Tipo */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "I" | "L")}
            required
            className="h-11 px-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-sm focus:ring-2 focus:ring-fce-gold focus:border-fce-gold outline-none"
          >
            <option value="I">Inasistencia</option>
            <option value="L">Licencia</option>
          </select>
        </div>

        {/* Motivo */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Motivo</label>
          <select
            value={codina}
            onChange={(e) => handleMotivoChange(e.target.value)}
            required
            className="h-11 px-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-sm focus:ring-2 focus:ring-fce-gold focus:border-fce-gold outline-none"
          >
            <option value="" disabled>Seleccionar motivo...</option>
            {motivos.map((m) => (
              <option key={m.codina} value={m.codina}>
                {m.Motivo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comunicó */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">¿Se comunicó con antelación?</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="comunico"
              value="S"
              checked={comunico === "S"}
              onChange={() => setComunico("S")}
              className="w-4 h-4 text-fce-maroon focus:ring-fce-maroon"
            />
            <span className="text-sm text-gray-800">Sí</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="comunico"
              value="N"
              checked={comunico === "N"}
              onChange={() => setComunico("N")}
              className="w-4 h-4 text-fce-maroon focus:ring-fce-maroon"
            />
            <span className="text-sm text-gray-800">No</span>
          </label>
        </div>
      </div>

      {/* Período Solicitado (Fechas) */}
      <PeriodoFechasSelector
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        onFechaInicioChange={setFechaInicio}
        onFechaFinChange={setFechaFin}
        cantDias={cantDias}
        errorLimiteCupo={errorLimiteCupo}
      />

      {/* Observación */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">Observaciones (Opcional)</label>
        <textarea
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          placeholder="Detalles adicionales..."
          className="p-3 min-h-[100px] border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-sm focus:ring-2 focus:ring-fce-gold focus:border-fce-gold outline-none resize-y"
        />
      </div>

      {/* Archivo (Solo para las categorías que lo requieren) */}
      {exigeDoc && (
        <AdjuntarDocumentoField
          file={file}
          onFileChange={setFile}
        />
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || Boolean(errorLimiteCupo)}
          className="w-full sm:w-auto px-8 py-3 bg-fce-maroon hover:bg-fce-maroon-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
        </button>
      </div>
    </form>
  );
};
