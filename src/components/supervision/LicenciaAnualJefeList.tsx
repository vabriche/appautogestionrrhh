"use client";

import React, { useEffect, useState } from "react";
import type { AccionJefeTramo, AuthUser, TramoJefe } from "@/models";
import { getTramosJefeAction, vistoBuenoTramoAction } from "@/controllers/vacaciones.controller";
import { getAreasAction } from "@/controllers/justificaciones.controller";
import { getAuthUserAction } from "@/controllers/auth.controller";
import { showToast, ConfirmModal } from "@/components/ui";
import { estadoTramo, formatearFecha, textoMotivoNorma, TIPOS_TRAMO } from "@/lib/vacaciones";

// P: pedidos abiertos (sin visto bueno, o con visto bueno esperando a RRHH: ahí se puede quitar),
// V: con visto bueno (pendiente de RRHH o ya resuelto), R: rechazados, T: todos
type FiltroVisto = "P" | "V" | "R" | "T";

const pendienteDeJefe = (t: TramoJefe) => t.estado === "pedido" && !t.vb_jefe_fecha;
// Con visto bueno pero sin autorizar por RRHH: el jefe puede quitarlo (vuelve a pendiente)
const vistoBuenoRevocable = (t: TramoJefe) => t.estado === "pedido" && !!t.vb_jefe_fecha;

const TEXTOS_ACCION: Record<AccionJefeTramo, { titulo: string; mensaje: string; boton: string; ok: string }> = {
  aprobar: {
    titulo: "Dar visto bueno",
    mensaje: "Con tu visto bueno el pedido pasa a Dirección de Personal para su autorización.",
    boton: "Sí, dar visto bueno",
    ok: "Visto bueno registrado",
  },
  rechazar: {
    titulo: "Rechazar pedido",
    mensaje: "El pedido queda rechazado y los días vuelven al saldo del agente.",
    boton: "Sí, rechazar",
    ok: "Pedido rechazado",
  },
  quitar: {
    titulo: "Quitar visto bueno",
    mensaje:
      "El pedido vuelve a quedar pendiente de tu visto bueno y sale de la bandeja de Dirección de Personal. El agente va a poder cambiar las fechas.",
    boton: "Sí, quitar visto bueno",
    ok: "Visto bueno quitado: el pedido volvió a pendiente",
  },
};

const cumpleFiltro = (t: TramoJefe, filtro: FiltroVisto): boolean => {
  if (filtro === "T") return true;
  if (filtro === "P") return t.estado === "pedido";
  if (filtro === "R") return t.estado === "rechazado";
  return !!t.vb_jefe_fecha && t.estado !== "rechazado";
};

export const LicenciaAnualJefeList: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState("TODAS");
  const [tramos, setTramos] = useState<TramoJefe[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState<FiltroVisto>("P");
  const [confirm, setConfirm] = useState<{ tramo: TramoJefe | null; accion: AccionJefeTramo }>({
    tramo: null,
    accion: "aprobar",
  });
  const [motivo, setMotivo] = useState("");

  const loadTramos = async (area: string) => {
    setLoading(true);
    setTramos(await getTramosJefeAction(area));
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const u = await getAuthUserAction();
      setUser(u);
      if (u?.encargadoArea === "T") setAreas(await getAreasAction());
      await loadTramos("TODAS");
    })();
  }, []);

  const abrirConfirm = (tramo: TramoJefe, accion: AccionJefeTramo) => {
    setMotivo("");
    setConfirm({ tramo, accion });
  };

  const cerrarConfirm = () => setConfirm({ tramo: null, accion: "aprobar" });

  const ejecutar = async () => {
    const { tramo, accion } = confirm;
    if (!tramo) return;
    if (accion === "rechazar" && !motivo.trim()) {
      showToast("Indicá el motivo del rechazo", "warning");
      return;
    }
    cerrarConfirm();
    setLoading(true);
    const res = await vistoBuenoTramoAction(tramo.id, accion, motivo.trim() || undefined);
    if (res.ok) {
      showToast(TEXTOS_ACCION[accion].ok, "success");
      await loadTramos(selectedArea);
    } else {
      showToast(res.error || "No se pudo registrar el visto bueno", "danger");
      setLoading(false);
    }
  };

  const visibles = tramos.filter((t) => cumpleFiltro(t, filtro));

  return (
    <div className="flex flex-col space-y-4 w-full bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        {user?.encargadoArea === "T" && (
          <select
            value={selectedArea}
            onChange={(e) => {
              setSelectedArea(e.target.value);
              loadTramos(e.target.value);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-fce-gold outline-none"
          >
            <option value="TODAS">Todas las áreas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        )}
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as FiltroVisto)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-fce-gold outline-none"
        >
          <option value="P">Pendientes</option>
          <option value="V">Con visto bueno</option>
          <option value="R">Rechazados</option>
          <option value="T">Todos</option>
        </select>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fce-maroon"></div>
        </div>
      ) : visibles.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-500 font-medium">No hay pedidos de licencia anual en este estado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-4 font-semibold">Agente</th>
                <th className="px-4 py-4 font-semibold">Periodo</th>
                <th className="px-4 py-4 font-semibold">Desde</th>
                <th className="px-4 py-4 font-semibold">Último día</th>
                <th className="px-4 py-4 font-semibold">Reintegro</th>
                <th className="px-4 py-4 font-semibold">Días</th>
                <th className="px-4 py-4 font-semibold">Estado</th>
                <th className="px-4 py-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibles.map((t) => {
                const estado = estadoTramo(t);
                const motivos = t.motivos_norma ? t.motivos_norma.split(",").filter(Boolean) : [];
                const esPropio = user && String(user.legajo) === String(t.legajo);
                return (
                  <tr key={t.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{t.apellido ?? "-"}</p>
                      <p className="text-xs text-gray-500">
                        Legajo {t.legajo}
                        {t.area ? ` · ${t.area}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{t.periodo}</p>
                      <p className="text-xs text-gray-500">{TIPOS_TRAMO[t.tipo] ?? t.tipo}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{formatearFecha(t.fecha_inicio)}</td>
                    <td className="px-4 py-3 text-gray-800">{formatearFecha(t.fecha_fin_computo)}</td>
                    <td className="px-4 py-3 text-gray-800">{formatearFecha(t.fecha_reintegro)}</td>
                    <td className="px-4 py-3 text-gray-800">{t.dias_computados}</td>
                    <td className="px-4 py-3 space-y-1">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${estado.className}`}>
                        {estado.label}
                      </span>
                      {motivos.length > 0 && (
                        <p className="text-xs text-amber-700">
                          Fuera de norma: {motivos.map(textoMotivoNorma).join(" · ")}
                        </p>
                      )}
                      {t.observacion && <p className="text-xs text-gray-600">Obs.: {t.observacion}</p>}
                      {t.estado === "rechazado" && t.motivo_autoriz && (
                        <p className="text-xs text-gray-600">Motivo: {t.motivo_autoriz}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {vistoBuenoRevocable(t) && !esPropio && (
                        <button
                          onClick={() => abrirConfirm(t, "quitar")}
                          className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1 rounded text-xs font-semibold transition-colors"
                        >
                          Quitar visto bueno
                        </button>
                      )}
                      {pendienteDeJefe(t) &&
                        (esPropio ? (
                          <span className="text-xs text-gray-400" title="El visto bueno lo da otro encargado">
                            Pedido propio
                          </span>
                        ) : (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => abrirConfirm(t, "aprobar")}
                              className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-xs font-semibold transition-colors"
                            >
                              Visto bueno
                            </button>
                            <button
                              onClick={() => abrirConfirm(t, "rechazar")}
                              className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-xs font-semibold transition-colors"
                            >
                              Rechazar
                            </button>
                          </div>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirm.tramo}
        onClose={cerrarConfirm}
        onConfirm={ejecutar}
        title={TEXTOS_ACCION[confirm.accion].titulo}
        message={TEXTOS_ACCION[confirm.accion].mensaje}
        confirmText={TEXTOS_ACCION[confirm.accion].boton}
        cancelText="Volver"
        type={confirm.accion === "aprobar" ? "success" : confirm.accion === "quitar" ? "warning" : "danger"}
        isLoading={loading}
      >
        {confirm.accion === "rechazar" && (
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            maxLength={255}
            rows={3}
            placeholder="Motivo del rechazo (obligatorio)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-fce-gold outline-none"
          />
        )}
      </ConfirmModal>
    </div>
  );
};
