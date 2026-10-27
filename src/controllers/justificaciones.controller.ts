"use server";

import { justificacionesService } from "@/services/justificaciones.service";
import type {
  Motivo,
  SolicitudJustificacion,
  CrearSolicitudPayload,
} from "@/models";
import { getAuthUserAction } from "./auth.controller";

export async function getMotivosAction(): Promise<Motivo[]> {
  const user = await getAuthUserAction();
  if (!user) return [];
  return justificacionesService.getMotivos();
}

export async function getMisSolicitudesAction(): Promise<SolicitudJustificacion[]> {
  const user = await getAuthUserAction();
  if (!user) return [];
  return justificacionesService.getMisSolicitudes(String(user.legajo));
}

export async function getSupervisionSolicitudesAction(area?: string): Promise<SolicitudJustificacion[]> {
  const user = await getAuthUserAction();
  if (!user || user.encargadoArea === "N") return [];
  
  // Si es titular y mandó un área, usar esa; si no, usar la de su usuario. Si es titular y mandó TODAS, usar TODAS.
  const queryArea = (user.encargadoArea === "T" && area) ? area : user.area;
  return justificacionesService.getSolicitudesPorArea(String(queryArea));
}

export async function getAreasAction(): Promise<string[]> {
  const user = await getAuthUserAction();
  if (!user || user.encargadoArea !== "T") return [];
  return justificacionesService.getAreas();
}

export async function crearSolicitudAction(
  payload: CrearSolicitudPayload,
  formData?: FormData
): Promise<{ ok: boolean; error?: string }> {
  const user = await getAuthUserAction();
  if (!user) return { ok: false, error: "No autorizado" };

  // Forzamos el legajo del usuario autenticado
  payload.legajo = String(user.legajo);

  const res = await justificacionesService.crearSolicitud(payload);
  
  if (res.ok && res.id && formData) {
    const file = formData.get("documento");
    if (file && file instanceof File && file.size > 0) {
      // Subir archivo
      const uploadFormData = new FormData();
      uploadFormData.append("documento", file);
      const uploadRes = await justificacionesService.subirDocumento(res.id, uploadFormData);
      if (!uploadRes) {
        return { ok: true, error: "Solicitud creada, pero falló la subida del documento." };
      }
    }
  }

  return res;
}

export async function actualizarSolicitudAction(
  id: number | string,
  payload: { estado?: string; observacion?: string; motivo_cancelacion?: string }
): Promise<{ ok: boolean; error?: string }> {
  const user = await getAuthUserAction();
  if (!user) return { ok: false, error: "No autorizado" };
  return justificacionesService.actualizarSolicitud(id, payload);
}

export async function subirDocumentoAction(
  id: number | string,
  formData: FormData
): Promise<boolean> {
  const user = await getAuthUserAction();
  if (!user) return false;
  return justificacionesService.subirDocumento(id, formData);
}
