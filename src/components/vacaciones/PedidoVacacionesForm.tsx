"use client";

import React, { useEffect, useRef, useState } from "react";
import type {
  ModoPedido,
  PeriodoVacaciones,
  PrepararPedidoPayload,
  PrepararPedidoResult,
  ResumenVacaciones,
  TipoTramo,
} from "@/models";
import {
  prepararPedidoVacacionesAction,
  registrarTramoVacacionesAction,
} from "@/controllers/vacaciones.controller";
import { showToast, FeedbackAlert } from "@/components/ui";
import {
  TIPOS_TRAMO,
  formatearFecha,
  formatearFechaConDia,
  textoMotivoNorma,
} from "@/lib/vacaciones";

interface PedidoVacacionesFormProps {
  resumen: ResumenVacaciones;
  onSuccess: () => void;
}

const MODOS: { value: ModoPedido; label: string }[] = [
  { value: "fecha_reintegro", label: "Día de reintegro" },
  { value: "ultimo_dia", label: "Último día" },
  { value: "dias", label: "Cantidad de días" },
];

// Mientras no haya tramo principal solo se puede pedir ese; después, saldo o compensación.
const tiposDisponibles = (p?: PeriodoVacaciones): TipoTramo[] => {
  if (!p) return [];
  if (!p.tiene_principal) return ["principal"];
  return p.dias_devueltos > 0 ? ["saldo", "compensacion"] : ["saldo"];
};

const inputClass =
  "h-11 px-3 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:ring-2 focus:ring-fce-gold focus:border-fce-gold outline-none";

export const PedidoVacacionesForm: React.FC<PedidoVacacionesFormProps> = ({ resumen, onSuccess }) => {
  const periodosConSaldo = resumen.periodos.filter((p) => p.saldo > 0);
  const periodoInicial =
    periodosConSaldo.find((p) => p.sugerido) ?? periodosConSaldo[0];

  const [periodo, setPeriodo] = useState<number | null>(periodoInicial?.periodo ?? null);
  const [tipo, setTipo] = useState<TipoTramo>("principal");
  const [fechaInicio, setFechaInicio] = useState("");
  const [modo, setModo] = useState<ModoPedido>("fecha_reintegro");
  const [valor, setValor] = useState("");
  const [observacion, setObservacion] = useState("");
  const [prep, setPrep] = useState<PrepararPedidoResult | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ultimaConsulta = useRef(0);

  const periodoSel = resumen.periodos.find((p) => p.periodo === periodo);
  const tipos = tiposDisponibles(periodoSel);

  // Al cambiar de periodo se precargan las fechas sugeridas (si no pidió la principal)
  useEffect(() => {
    if (!periodoSel) return;
    setTipo(tiposDisponibles(periodoSel)[0]);
    if (periodoSel.ventana_sugerida) {
      setFechaInicio(periodoSel.ventana_sugerida.inicio);
      setModo("fecha_reintegro");
      setValor(periodoSel.ventana_sugerida.reintegro);
    } else {
      setFechaInicio("");
      setModo("dias");
      setValor(String(periodoSel.saldo));
    }
    setObservacion("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]);

  // Con cada cambio se simula el tramo en la base (no guarda nada)
  useEffect(() => {
    if (!periodo || !fechaInicio || !valor) {
      setPrep(null);
      return;
    }
    const payload: PrepararPedidoPayload = { periodo, tipo, fecha_inicio: fechaInicio };
    if (modo === "dias") payload.dias = Number(valor);
    else payload[modo] = valor;

    const consulta = ++ultimaConsulta.current;
    setIsPreparing(true);
    const timer = setTimeout(async () => {
      const res = await prepararPedidoVacacionesAction(payload);
      if (consulta !== ultimaConsulta.current) return;
      setPrep(res);
      setIsPreparing(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [periodo, tipo, fechaInicio, modo, valor]);

  const handleModoChange = (nuevo: ModoPedido) => {
    // Se conserva lo calculado para no obligar a cargar todo de nuevo
    setModo(nuevo);
    if (nuevo === "dias") setValor(prep?.dias ? String(prep.dias) : "");
    else if (nuevo === "ultimo_dia") setValor(prep?.ultimo_dia ?? "");
    else setValor(prep?.fecha_reintegro ?? "");
  };

  const fueraDeNorma = (prep?.motivos.length ?? 0) > 0;
  const puedeConfirmar =
    !!prep && !prep.error && !!prep.dias && !isPreparing && (!fueraDeNorma || observacion.trim() !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodo || !prep?.dias || prep.error) return;
    if (fueraDeNorma && !observacion.trim()) {
      showToast("El pedido está fuera de norma: la observación es obligatoria.", "error");
      return;
    }

    setIsSubmitting(true);
    // Se envían los días calculados por la base, no lo que se tipeó
    const res = await registrarTramoVacacionesAction({
      periodo,
      tipo,
      fecha_inicio: fechaInicio,
      dias: prep.dias,
      observacion: observacion.trim() || null,
    });
    setIsSubmitting(false);

    if (res.ok) {
      showToast(
        res.data?.estado === "pedido"
          ? "Pedido registrado. Queda pendiente de autorización."
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
      <h2 className="text-xl font-bold text-gray-800">Registrar período de licencia</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Periodo</label>
          <select
            value={periodo ?? ""}
            onChange={(e) => setPeriodo(Number(e.target.value))}
            className={`${inputClass} bg-gray-50`}
          >
            {periodosConSaldo.map((p) => (
              <option key={p.periodo} value={p.periodo}>
                {p.periodo} — saldo {p.saldo} días{p.sugerido ? " (sugerido)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Tipo de tramo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoTramo)}
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
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Indicar por</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden h-11">
              {MODOS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleModoChange(m.value)}
                  className={`flex-1 text-xs font-medium px-2 transition-colors ${
                    modo === m.value ? "bg-fce-maroon text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 sm:max-w-[calc(50%-0.5rem)]">
          <label className="text-xs font-semibold text-gray-600">
            {MODOS.find((m) => m.value === modo)?.label} <span className="text-red-500">*</span>
          </label>
          {modo === "dias" ? (
            <input
              type="number"
              min={1}
              max={periodoSel?.saldo}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              className={inputClass}
            />
          ) : (
            <input
              type="date"
              value={valor}
              min={fechaInicio || undefined}
              onChange={(e) => setValor(e.target.value)}
              required
              className={inputClass}
            />
          )}
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

        {!isPreparing && prep && !prep.error && fueraDeNorma && (
          <FeedbackAlert
            type="warning"
            title="Pedido fuera de norma: requiere autorización"
            message={prep.motivos.map(textoMotivoNorma).join(" · ")}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">
          Observaciones {fueraDeNorma ? <span className="text-red-500">*</span> : "(Opcional)"}
        </label>
        <textarea
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          maxLength={255}
          required={fueraDeNorma}
          placeholder={fueraDeNorma ? "Explicá el motivo de la excepción..." : "Detalles adicionales..."}
          className="p-3 min-h-[90px] border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-sm focus:ring-2 focus:ring-fce-gold focus:border-fce-gold outline-none resize-y"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !puedeConfirmar}
          className="w-full sm:w-auto px-8 py-3 bg-fce-maroon hover:bg-fce-maroon-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Registrando..." : "Confirmar pedido"}
        </button>
      </div>
    </form>
  );
};
