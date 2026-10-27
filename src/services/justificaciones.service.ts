import "server-only";
import { api } from "@/lib/api";
import { API_URL, AUTH_COOKIE } from "@/lib/config";
import { cookies } from "next/headers";
import type {
  Motivo,
  SolicitudJustificacion,
  CrearSolicitudPayload,
} from "@/models";
import { z } from "zod";
import { MotivoSchema, SolicitudJustificacionSchema } from "@/models";

export const justificacionesService = {
  async getMotivos(): Promise<Motivo[]> {
    try {
      const rows = await api.get<unknown[]>("/cargos/motina");
      if (!rows || !Array.isArray(rows)) return [];
      const parsed = z.array(MotivoSchema).safeParse(rows);
      if (!parsed.success) {
        console.error("Error validando motivos:", parsed.error);
        return [];
      }
      return parsed.data;
    } catch (error) {
      console.error("Error en getMotivos:", error);
      return [];
    }
  },

  async getMisSolicitudes(legajo: string): Promise<SolicitudJustificacion[]> {
    try {
      const rows = await api.get<unknown[]>(
        `/solicitudes/mis-solicitudes/${legajo}`
      );
      if (!rows || !Array.isArray(rows)) return [];
      const parsed = z.array(SolicitudJustificacionSchema).safeParse(rows);
      if (!parsed.success) {
        console.error("Error validando mis solicitudes:", parsed.error);
        return [];
      }
      return parsed.data;
    } catch (error) {
      console.error("Error en getMisSolicitudes:", error);
      return [];
    }
  },

  async getSolicitudesPorArea(area: string): Promise<SolicitudJustificacion[]> {
    try {
      const rows = await api.get<unknown[]>(`/solicitudes/area/${encodeURIComponent(area)}`);
      if (!rows || !Array.isArray(rows)) return [];
      const parsed = z.array(SolicitudJustificacionSchema).safeParse(rows);
      if (!parsed.success) {
        console.error("Error validando solicitudes por área:", parsed.error);
        return [];
      }
      return parsed.data;
    } catch (error) {
      console.error("Error en getSolicitudesPorArea:", error);
      return [];
    }
  },

  async getAreas(): Promise<string[]> {
    try {
      const rows = await api.get<string[]>("/solicitudes/areas");
      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      console.error("Error en getAreas:", error);
      return [];
    }
  },

  async crearSolicitud(payload: CrearSolicitudPayload): Promise<{
    ok: boolean;
    id?: number;
    error?: string;
  }> {
    try {
      const res = await api.post<{ message?: string; id?: number }>(
        "/solicitudes/justificacion",
        payload
      );
      if (res && res.id) {
        return { ok: true, id: res.id };
      }
      return { ok: false };
    } catch (error: any) {
      console.error("Error en crearSolicitud:", error);
      return { ok: false, error: error?.message || "Error al crear la solicitud" };
    }
  },

  async actualizarSolicitud(
    id: number | string,
    payload: { estado?: string; observacion?: string; motivo_cancelacion?: string }
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      await api.put(`/solicitudes/justificacion/${id}`, payload);
      return { ok: true };
    } catch (error: any) {
      console.error("Error en actualizarSolicitud:", error);
      return {
        ok: false,
        error: error?.message || "Error al actualizar la solicitud",
      };
    }
  },

  async subirDocumento(id: number | string, formData: FormData): Promise<boolean> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(AUTH_COOKIE)?.value;
      const res = await fetch(`${API_URL}/solicitudes/justificacion/${id}/documento`, {
        method: "POST",
        body: formData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return res.ok;
    } catch (error) {
      console.error("Error al subir documento:", error);
      return false;
    }
  },
};

