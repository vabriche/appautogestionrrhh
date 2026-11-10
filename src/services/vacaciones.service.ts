import "server-only";
import { unstable_rethrow } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type {
  ResumenVacaciones,
  TramoVacaciones,
  PrepararPedidoPayload,
  PrepararPedidoResult,
  RegistrarTramoPayload,
  RegistrarTramoResult,
  TramoJefe,
  AccionJefeTramo,
} from "@/models";

// El backend toma el legajo del token en /vacaciones/empleado/*, no hace falta enviarlo.
export const vacacionesService = {
  async getResumen(): Promise<{ data: ResumenVacaciones | null; error?: string; sinRegistro?: boolean }> {
    try {
      const data = await api.get<ResumenVacaciones>("/vacaciones/empleado/resumen");
      return { data };
    } catch (error) {
      unstable_rethrow(error);
      // 404: el agente no está cargado en vacaciones_rrhh; es un caso esperado, no un fallo.
      if (error instanceof ApiError && error.status === 404) {
        return {
          data: null,
          error: "Todavía no figurás en el personal de licencia anual. Consultá con Dirección de Personal.",
          sinRegistro: true,
        };
      }
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

  // Cambia las fechas de un pedido propio sin visto bueno: el backend cancela el viejo y registra el
  // nuevo en una sola transacción (si el nuevo no es válido, el viejo queda como estaba).
  async modificarTramo(
    id: number,
    payload: RegistrarTramoPayload,
  ): Promise<{ ok: boolean; data?: RegistrarTramoResult; error?: string }> {
    try {
      const data = await api.post<RegistrarTramoResult>(`/vacaciones/empleado/tramos/${id}/modificar`, payload);
      return { ok: true, data };
    } catch (error) {
      unstable_rethrow(error);
      console.error("Error en modificarTramo:", error);
      return { ok: false, error: (error as Error)?.message || "No se pudo modificar el pedido" };
    }
  },

  // Bandeja del jefe del área: el backend toma rol y área del token (S: su área, T: la pedida o todas).
  async getTramosJefe(area: string): Promise<TramoJefe[]> {
    try {
      const rows = await api.get<TramoJefe[]>(`/vacaciones/jefe/tramos?area=${encodeURIComponent(area)}`);
      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      unstable_rethrow(error);
      console.error("Error en getTramosJefe:", error);
      return [];
    }
  },

  async vistoBuenoTramo(
    id: number,
    accion: AccionJefeTramo,
    motivo?: string,
  ): Promise<{ ok: boolean; error?: string }> {
    const ruta = { aprobar: "visto-bueno", rechazar: "rechazar", quitar: "quitar-visto-bueno" }[accion];
    try {
      await api.post(`/vacaciones/jefe/tramos/${id}/${ruta}`, { motivo });
      return { ok: true };
    } catch (error) {
      unstable_rethrow(error);
      console.error("Error en vistoBuenoTramo:", error);
      return { ok: false, error: (error as Error)?.message || "No se pudo registrar el visto bueno" };
    }
  },
};
