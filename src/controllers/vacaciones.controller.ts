"use server";

import { vacacionesService } from "@/services/vacaciones.service";
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
import { getAuthUserAction } from "./auth.controller";
import { esEncargado } from "@/lib/roles";

export async function getResumenVacacionesAction(): Promise<{
  data: ResumenVacaciones | null;
  error?: string;
  sinRegistro?: boolean;
}> {
  const user = await getAuthUserAction();
  if (!user) return { data: null, error: "No autorizado" };
  return vacacionesService.getResumen();
}

export async function getMisTramosVacacionesAction(): Promise<TramoVacaciones[]> {
  const user = await getAuthUserAction();
  if (!user) return [];
  return vacacionesService.getMisTramos();
}

export async function prepararPedidoVacacionesAction(
  payload: PrepararPedidoPayload,
): Promise<PrepararPedidoResult> {
  const user = await getAuthUserAction();
  if (!user) {
    return { dias: null, ultimo_dia: null, fecha_reintegro: null, saldo: null, motivos: [], error: "No autorizado" };
  }
  return vacacionesService.prepararPedido(payload);
}

export async function registrarTramoVacacionesAction(
  payload: RegistrarTramoPayload,
): Promise<{ ok: boolean; data?: RegistrarTramoResult; error?: string }> {
  const user = await getAuthUserAction();
  if (!user) return { ok: false, error: "No autorizado" };
  return vacacionesService.registrarTramo(payload);
}

export async function modificarTramoVacacionesAction(
  id: number,
  payload: RegistrarTramoPayload,
): Promise<{ ok: boolean; data?: RegistrarTramoResult; error?: string }> {
  const user = await getAuthUserAction();
  if (!user) return { ok: false, error: "No autorizado" };
  return vacacionesService.modificarTramo(id, payload);
}

export async function getTramosJefeAction(area: string): Promise<TramoJefe[]> {
  const user = await getAuthUserAction();
  if (!user || !esEncargado(user.encargadoArea)) return [];
  return vacacionesService.getTramosJefe(area);
}

export async function vistoBuenoTramoAction(
  id: number,
  accion: AccionJefeTramo,
  motivo?: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || !esEncargado(user.encargadoArea)) return { ok: false, error: "No autorizado" };
  return vacacionesService.vistoBuenoTramo(id, accion, motivo);
}
