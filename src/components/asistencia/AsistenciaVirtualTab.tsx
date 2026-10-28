"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { AuthUser, AsistenciaVirtualEstado } from "@/models";
import {
  getAsistenciaVirtualEstadoAction,
  marcarAsistenciaVirtualAction,
} from "@/controllers/asistencia.controller";
import { showToast } from "@/components/ui";
import { LiveClock } from "./LiveClock";
import { AsistenciaVirtualTable } from "./AsistenciaVirtualTable";
import {
  MdAccessTime,
  MdPlayArrow,
  MdStop,
  MdCheckCircle,
  MdWarningAmber,
  MdLock,
} from "react-icons/md";
import { Spinner } from "@heroui/react";

interface AsistenciaVirtualTabProps {
  user?: AuthUser | null;
}

export const AsistenciaVirtualTab: React.FC<AsistenciaVirtualTabProps> = () => {
  const [data, setData] = useState<AsistenciaVirtualEstado | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState("");
  const [segundosRestantesSalida, setSegundosRestantesSalida] = useState(0);

  const loadEstado = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAsistenciaVirtualEstadoAction();
      setData(res as AsistenciaVirtualEstado);
    } catch (err) {
      console.error(err);
      showToast("Error al cargar el estado de asistencia virtual", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEstado();
  }, [loadEstado]);

  // Contador de tiempo transcurrido y cálculo de 10 minutos para salida (solo cuando está en curso)
  useEffect(() => {
    if (data?.estado !== "EN_CURSO" || !data.ultimoRegistro?.Hentrada) {
      setTiempoTranscurrido("");
      setSegundosRestantesSalida(0);
      return;
    }

    const calcElapsed = () => {
      const now = new Date();
      const parts = String(data.ultimoRegistro?.Hentrada).split(":").map(Number);
      const h = parts[0] || 0;
      const m = parts[1] || 0;
      const s = parts[2] || 0;

      const entradaDate = new Date();
      entradaDate.setHours(h, m, s, 0);

      const diffMs = Math.max(0, now.getTime() - entradaDate.getTime());
      const totalSec = Math.floor(diffMs / 1000);

      // Mínimo 10 minutos = 600 segundos
      const remainingSec = Math.max(0, 600 - totalSec);
      setSegundosRestantesSalida(remainingSec);

      const hrs = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      setTiempoTranscurrido(
        `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );
    };

    calcElapsed();
    const interval = setInterval(calcElapsed, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const handleMarcar = async () => {
    if (!data?.esPeriodoHabilitado) {
      showToast(
        "La asistencia virtual solo está habilitada del 21 de diciembre al 1 de febrero.",
        "warning"
      );
      return;
    }

    if (data?.estado === "EN_CURSO" && segundosRestantesSalida > 0) {
      const min = Math.ceil(segundosRestantesSalida / 60);
      showToast(
        `Debes esperar al menos 10 minutos desde tu registro de entrada para marcar la salida (faltan ${min} min).`,
        "warning"
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await marcarAsistenciaVirtualAction();
      if (res.success) {
        showToast(res.mensaje || "Marcación registrada con éxito", "success");
        await loadEstado();
      } else {
        showToast(res.error || "No se pudo registrar la marcación", "error");
      }
    } catch {
      showToast("Ocurrió un error al procesar la marcación", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const esHabilitado = data?.esPeriodoHabilitado ?? false;
  const estadoActual = data?.estado ?? "FUERA_DE_TURNO";
  const registrosHoy = data?.registrosHoy ?? [];

  const minRestantes = Math.floor(segundosRestantesSalida / 60);
  const secRestantes = segundosRestantesSalida % 60;
  const countdownSalidaText = `${String(minRestantes).padStart(2, "0")}:${String(secRestantes).padStart(2, "0")}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      {/* Banner de Período de Vacaciones */}
      {data && !data.esPeriodoReal && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl mt-0.5 shrink-0">
            <MdLock size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-amber-900">
              Período de Asistencia Virtual Inactivo
            </h2>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              La marcación virtual se habilita únicamente durante el receso vacacional, comprendido entre el{" "}
              <span className="font-semibold">21 de diciembre</span> y el{" "}
              <span className="font-semibold">1 de febrero</span>. Fuera de este período, el registro se realiza mediante los dispositivos biométricos habituales.
            </p>
          </div>
        </div>
      )}

      {data && data.esPeriodoReal && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
            <MdCheckCircle size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-emerald-900">
              Período de Receso Vacacional Activo
            </h2>
            <p className="text-xs text-emerald-700">
              La asistencia virtual se encuentra habilitada para registrar tu jornada laboral remota.
            </p>
          </div>
        </div>
      )}

      {/* Reloj y Tarjeta Principal de Marcación */}
      <div className="bg-white rounded-2xl shadow-sm border border-fce-gold/30 p-6 sm:p-8 text-center flex flex-col items-center gap-6">
        {/* Reloj digital memoizado */}
        <LiveClock />

        {/* Badge de estado del turno */}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Spinner size="sm" />
            <span>Consultando estado...</span>
          </div>
        ) : estadoActual === "EN_CURSO" ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Turno en curso desde las {data?.ultimoRegistro?.Hentrada} hs</span>
            {tiempoTranscurrido && (
              <span className="font-mono text-emerald-900 font-bold ml-1">
                ({tiempoTranscurrido})
              </span>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
            <span>Fuera de turno • Listo para registrar entrada</span>
          </div>
        )}

        {/* Botón principal de marcación */}
        <div className="w-full max-w-md pt-2">
          {estadoActual === "EN_CURSO" ? (
            <button
              onClick={handleMarcar}
              disabled={submitting || !esHabilitado || segundosRestantesSalida > 0}
              className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-lg shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${
                segundosRestantesSalida > 0
                  ? "bg-amber-700 hover:bg-amber-700"
                  : "bg-amber-600 hover:bg-amber-700 active:scale-[0.98] hover:shadow-lg"
              }`}
            >
              {submitting ? (
                <Spinner size="sm" color="current" className="text-white" />
              ) : segundosRestantesSalida > 0 ? (
                <MdAccessTime size={26} />
              ) : (
                <MdStop size={28} />
              )}
              <span>
                {segundosRestantesSalida > 0
                  ? `Salida disponible en ${countdownSalidaText}`
                  : "Marcar Salida Virtual"}
              </span>
            </button>
          ) : (
            <button
              onClick={handleMarcar}
              disabled={submitting || !esHabilitado}
              className="w-full py-4 px-6 rounded-2xl bg-fce-maroon hover:bg-[#601823] active:scale-[0.98] text-white font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Spinner size="sm" color="current" className="text-white" />
              ) : (
                <MdPlayArrow size={28} />
              )}
              <span>
                {registrosHoy.length > 0
                  ? "Marcar Nueva Entrada"
                  : "Marcar Entrada Virtual"}
              </span>
            </button>
          )}

          {estadoActual === "EN_CURSO" ? (
            segundosRestantesSalida > 0 ? (
              <p className="text-xs text-amber-700 font-medium mt-2.5 flex items-center justify-center gap-1.5">
                <MdAccessTime size={15} className="shrink-0" />
                Mínimo 10 minutos requeridos entre entrada y salida.
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-2.5">
                Al presionar se registrará la salida y se computarán las horas trabajadas.
              </p>
            )
          ) : (
            <p className="text-xs text-gray-500 mt-2.5">
              Puedes registrar múltiples turnos a lo largo del día según tu modalidad.
            </p>
          )}
        </div>
      </div>

      {/* Historial de Marcaciones de Hoy (Memoizado) */}
      <AsistenciaVirtualTable registros={registrosHoy} />

      {/* Recordatorio de olvido de salida */}
      <div className="p-4 bg-fce-cream/40 border border-fce-gold/30 rounded-xl flex items-start gap-3 text-xs text-gray-700">
        <MdWarningAmber size={20} className="text-fce-maroon shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-gray-800">Recordatorio importante:</span>{" "}
          Recuerda siempre registrar tu salida al culminar cada jornada laboral. Si olvidas marcar tu salida, el sistema te mostrará un aviso al día siguiente.
        </div>
      </div>
    </div>
  );
};
