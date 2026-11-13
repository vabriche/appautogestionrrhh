"use client";

import React, { useEffect, useRef, useState } from "react";
import type {
  PeriodoVacaciones,
  PrepararPedidoPayload,
  PrepararPedidoResult,
  ResumenVacaciones,
  TipoTramo,
  TramoVacaciones,
} from "@/models";
import {
  modificarTramoVacacionesAction,
  prepararPedidoVacacionesAction,
  registrarTramoVacacionesAction,
} from "@/controllers/vacaciones.controller";
import { showToast, FeedbackAlert } from "@/components/ui";
import {
  TIPOS_TRAMO,
  formatearFecha,
  formatearFechaConDia,
} from "@/lib/vacaciones";

interface PedidoVacacionesFormProps {
  resumen: ResumenVacaciones;
  onSuccess: () => void;
  // Con un tramo, el formulario cambia las fechas de ese pedido (mismo periodo y tipo)
  tramoAEditar?: TramoVacaciones;
  onCancel?: () => void;
}

// Fechas ISO (aaaa-mm-dd) en hora local
const isoLocal = (d: Date) => d.toLocaleDateString("sv-SE");

/** Primer lunes en o después de `iso` (y no antes de hoy). */
const lunesDesde = (iso?: string | null): string => {
  const hoy = isoLocal(new Date());
  const d = new Date(((iso && iso > hoy) ? iso : hoy) + "T00:00:00");
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7));
  return isoLocal(d);
};

// Mientras no haya tramo principal solo se puede pedir ese; después, saldo o compensación.
const tiposDisponibles = (p?: PeriodoVacaciones): TipoTramo[] => {
  if (!p) return [];
  if (!p.tiene_principal) return ["principal"];
  return p.dias_devueltos > 0 ? ["saldo", "compensacion"] : ["saldo"];
};

const inputClass =
  "h-11 px-3 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:ring-2 focus:ring-fce-gold focus:border-fce-gold outline-none";

export const PedidoVacacionesForm: React.FC<PedidoVacacionesFormProps> = ({
  resumen,
  onSuccess,
  tramoAEditar,
  onCancel,
}) => {
  const editando = !!tramoAEditar;
  // Al editar, el periodo del tramo puede no tener saldo libre (sus propios días ya cuentan)
  const periodosConSaldo = editando
    ? resumen.periodos.filter((p) => p.periodo === tramoAEditar.periodo)
    : resumen.periodos.filter((p) => p.saldo > 0);
  const periodoInicial =
    periodosConSaldo.find((p) => p.sugerido) ?? periodosConSaldo[0];

  const [periodo, setPeriodo] = useState<number | null>(periodoInicial?.periodo ?? null);
  const [tipo, setTipo] = useState<TipoTramo>(tramoAEditar?.tipo ?? "principal");
  // Se carga solo el inicio (por defecto un lunes) y los días; último día y reintegro los calcula la base
  const [fechaInicio, setFechaInicio] = useState(
    tramoAEditar?.fecha_inicio ?? lunesDesde(periodoInicial?.ventana_sugerida?.inicio),
  );
  const [dias, setDias] = useState(
    tramoAEditar ? String(tramoAEditar.dias_computados) : String(periodoInicial?.saldo ?? ""),
  );
  const [observacion, setObservacion] = useState(tramoAEditar?.observacion ?? "");
  const [prep, setPrep] = useState<PrepararPedidoResult | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ultimaConsulta = useRef(0);

  const periodoSel = resumen.periodos.find((p) => p.periodo === periodo);
  const tipos = editando ? [tramoAEditar.tipo] : tiposDisponibles(periodoSel);

  // Al cambiar de periodo: inicio el lunes sugerido y todos los días del saldo
  useEffect(() => {
    if (!periodoSel || editando) return;
    setTipo(tiposDisponibles(periodoSel)[0]);
    setFechaInicio(lunesDesde(periodoSel.ventana_sugerida?.inicio));
    setDias(String(periodoSel.saldo));
    setObservacion("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]);

  const esPrincipal = tipo === "principal";

  // Con cada cambio se simula el tramo en la base (no guarda nada)
  useEffect(() => {
    if (!periodo || !fechaInicio || !dias || Number(dias) < 1) {
      setPrep(null);
      return;
    }
    const payload: PrepararPedidoPayload = {
      periodo,
      tipo,
      fecha_inicio: fechaInicio,
      dias: Number(dias),
      reemplaza: tramoAEditar?.id,
    };

    const consulta = ++ultimaConsulta.current;
    setIsPreparing(true);
    const timer = setTimeout(async () => {
      const res = await prepararPedidoVacacionesAction(payload);
      if (consulta !== ultimaConsulta.current) return;
      setPrep(res);
      setIsPreparing(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [periodo, tipo, fechaInicio, dias, tramoAEditar?.id]);

  // Saldo disponible para este pedido (la simulación ya descuenta el propio si se está editando)
  const saldoDisponible = prep?.saldo ?? periodoSel?.saldo ?? null;
  // Lo único que se controla es la cantidad de días contra el saldo (la base lo rechaza en
  // prep.error). Fechas fuera de lo habitual se graban igual y la observación es siempre opcional.
  const puedeConfirmar = !!prep && !prep.error && !!prep.dias && !isPreparing;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodo || !prep?.dias || prep.error) return;

    setIsSubmitting(true);
    // Se envían los días calculados por la base, no lo que se tipeó
    const datos = {
      periodo,
      tipo,
      fecha_inicio: fechaInicio,
      dias: prep.dias,
      observacion: observacion.trim() || null,
    };
    const res = tramoAEditar
      ? await modificarTramoVacacionesAction(tramoAEditar.id, datos)
      : await registrarTramoVacacionesAction(datos);
    setIsSubmitting(false);

    if (res.ok) {
      showToast(
        editando
          ? "Fechas actualizadas. El pedido sigue pendiente de visto bueno del jefe."
          : res.data?.estado === "pedido"
            ? "Pedido registrado. Queda pendiente de visto bueno del jefe."
            : "Pedido de licencia registrado y aprobado.",
        res.data?.estado === "pedido" ? "warning" : "success",
      );
      onSuccess();
    } else {
      showToast(res.error || "No se pudo registrar el pedido", "error");
    }
  };

  if (periodosConSaldo.length === 0) {
    return (
      <FeedbackAlert
        type="info"
        message="No tenés saldo de licencia anual disponible para pedir."
      />
    );
  }

  const restante = prep?.saldo != null && prep.dias != null ? prep.saldo - prep.dias : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <h2 className="text-xl font-bold text-gray-800">
        {editando ? "Cambiar fechas del pedido" : "Registrar período de licencia"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Periodo</label>
          <select
            value={periodo ?? ""}
            onChange={(e) => setPeriodo(Number(e.target.value))}
            disabled={editando}
            className={`${inputClass} bg-gray-50`}
          >
            {periodosConSaldo.map((p) => (
              <option key={p.periodo} value={p.periodo}>
                {editando ? p.periodo : `${p.periodo} — saldo ${p.saldo} días${p.sugerido ? " (sugerido)" : ""}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Tipo de tramo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoTramo)}
            disabled={editando}
            className={`${inputClass} bg-gray-50`}
          >
            {tipos.map((t) => (
              <option key={t} value={t}>
                {TIPOS_TRAMO[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {periodoSel && (
        <p className="text-xs text-gray-500">
          Inicio habitual desde el {formatearFecha(periodoSel.ventana.desde)} · reintegro general el{" "}
          {formatearFechaConDia(periodoSel.ventana.reintegro_general)}
          {!periodoSel.tiene_principal &&
            ` · pedido principal hasta el ${formatearFecha(periodoSel.fecha_limite_pedido)}`}
        </p>
      )}

      {/* Fechas */}
      <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">
              Fecha de inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
              className={inputClass}
            />
            {fechaInicio && (
              <span className="text-[11px] text-gray-500">{formatearFechaConDia(fechaInicio)}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">
              Cantidad de días <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={saldoDisponible ?? undefined}
              value={dias}
              onChange={(e) => setDias(e.target.value)}
              required
              className={inputClass}
            />
            {saldoDisponible != null && (
              <span className="text-[11px] text-gray-500">{esPrincipal ? `Te corresponden ${saldoDisponible} días` : `Saldo disponible: ${saldoDisponible} días (se puede fraccionar)`}
              </span>
            )}
          </div>
        </div>

        {/* Resultado de la simulación */}
        {isPreparing && <p className="text-xs text-gray-500">Calculando...</p>}
        {!isPreparing && prep?.error && <FeedbackAlert type="error" message={prep.error} />}
        {!isPreparing && prep && !prep.error && prep.dias != null && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Días a computar</p>
              <p className="text-lg font-bold text-fce-maroon">{prep.dias}</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Último día</p>
              <p className="text-sm font-semibold text-gray-800">{formatearFechaConDia(prep.ultimo_dia)}</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Reintegro</p>
              <p className="text-sm font-semibold text-gray-800">{formatearFechaConDia(prep.fecha_reintegro)}</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Saldo restante</p>
              <p className="text-lg font-bold text-gray-800">{restante ?? "-"}</p>
            </div>
          </div>
        )}

      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">
          Observaciones (Opcional)
        </label>
        <textarea
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          maxLength={255}
          placeholder="Detalles adicionales..."
          className="p-3 min-h-[90px] border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-sm focus:ring-2 focus:ring-fce-gold focus:border-fce-gold outline-none resize-y"
        />
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !puedeConfirmar}
          className="w-full sm:w-auto px-8 py-3 bg-fce-maroon hover:bg-fce-maroon-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : editando ? "Guardar cambios" : "Confirmar pedido"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            Volver
          </button>
        )}
      </div>
    </form>
  );
};
