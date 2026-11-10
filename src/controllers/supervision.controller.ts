"use server";

import { supervisionService } from "@/services/supervision.service";
import type { SupervisionRegistro } from "@/models";
import { getAuthUserAction } from "./auth.controller";
import { esEncargado } from "@/lib/roles";

export async function getSupervisionRegistrosAction(
  area: string,
  fechaInicio: string,
  fechaFin: string
): Promise<SupervisionRegistro[]> {
  const user = await getAuthUserAction();
  if (!user || !esEncargado(user.encargadoArea)) {
    return [];
  }

  // Si es "S" (sólo su área), forzamos que el área consultada sea la suya
  const finalArea = user.encargadoArea === "S" ? user.area : area;

  if (!finalArea) return [];

  return supervisionService.getRegistrosArea(finalArea, fechaInicio, fechaFin);
}
