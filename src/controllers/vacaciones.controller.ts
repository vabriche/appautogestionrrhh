"use server";

import { vacacionesService } from "@/services/vacaciones.service";
import type {
  ResumenVacaciones,
  TramoVacaciones,
  PrepararPedidoPayload,
  PrepararPedidoResult,
  RegistrarTramoPayload,
  RegistrarTramoResult,
} from "@/models";
import { getAuthUserAction } from "./auth.controller";

export async function getResumenVacacionesAction(): Promise<{
  data: ResumenVacaciones | null;
  error?: string;
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
