import "server-only";
import { unstable_rethrow } from "next/navigation";
import { api } from "@/lib/api";
import type {
  ResumenVacaciones,
  TramoVacaciones,
  PrepararPedidoPayload,
  PrepararPedidoResult,
  RegistrarTramoPayload,
  RegistrarTramoResult,
} from "@/models";

// El backend toma el legajo del token en /vacaciones/empleado/*, no hace falta enviarlo.
export const vacacionesService = {
  async getResumen(): Promise<{ data: ResumenVacaciones | null; error?: string }> {
    try {
      const data = await api.get<ResumenVacaciones>("/vacaciones/empleado/resumen");
      return { data };
    } catch (error) {
      unstable_rethrow(error);
      console.error("Error en getResumen vacaciones:", error);
      return { data: null, error: (error as Error)?.message || "No se pudo obtener la licencia anual" };
    }
  },

  async getMisTramos(): Promise<TramoVacaciones[]> {
    try {
      const rows = await api.get<TramoVacaciones[]>("/vacaciones/empleado/tramos");
      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      unstable_rethrow(error);
      console.error("Error en getMisTramos:", error);
      return [];
    }
  },

  async prepararPedido(payload: PrepararPedidoPayload): Promise<PrepararPedidoResult> {
    try {
      const res = await api.post<PrepararPedidoResult>("/vacaciones/empleado/preparar", payload);
      return { ...res, motivos: res?.motivos ?? [] };
    } catch (error) {
      unstable_rethrow(error);
      console.error("Error en prepararPedido:", error);
      return {
        dias: null,
        ultimo_dia: null,
        fecha_reintegro: null,
        saldo: null,
        motivos: [],
        error: (error as Error)?.message || "No se pudo calcular el pedido",
      };
    }
  },

  async registrarTramo(
    payload: RegistrarTramoPayload,
  ): Promise<{ ok: boolean; data?: RegistrarTramoResult; error?: string }> {
    try {
      const data = await api.post<RegistrarTramoResult>("/vacaciones/empleado/tramos", payload);
      return { ok: true, data };
    } catch (error) {
      unstable_rethrow(error);
      console.error("Error en registrarTramo:", error);
      return { ok: false, error: (error as Error)?.message || "No se pudo registrar el pedido" };
    }
  },
};
