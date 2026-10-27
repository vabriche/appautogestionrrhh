"use server";

import { AsistenciaService } from "@/services";
import { getAuthUserAction } from "./auth.controller";
import { RegistroAsistencia } from "@/models";

export async function getRegistrosAsistenciaAction(
  fechaInicio: string,
  fechaFin: string = "0"
): Promise<RegistroAsistencia[]> {
  try {
    const user = await getAuthUserAction();
    if (!user || !user.legajo) {
      throw new Error("Usuario no autenticado");
    }

    const registros = await AsistenciaService.getRegistrosAsistencia(
      user.condicion,
      user.legajo,
      fechaInicio,
      fechaFin
    );

    return registros;
  } catch (error) {
    console.error("Error en getRegistrosAsistenciaAction:", error);
    return [];
  }
}

export async function getInasistenciasAnualesAction(year: number): Promise<any[]> {
  try {
    const user = await getAuthUserAction();
    if (!user || !user.legajo) {
      throw new Error("Usuario no autenticado");
    }

    const fechaInicio = `${year}-01-01`;
    const fechaFin = `${year}-12-31`;

    const inasistencias = await AsistenciaService.getInasistenciasRpEs(
      user.legajo,
      fechaInicio,
      fechaFin
    );

    return inasistencias;
  } catch (error) {
    console.error("Error en getInasistenciasAnualesAction:", error);
    return [];
  }
}

export async function getInasistenciasDetalleAction(
  fechaInicio: string,
  fechaFin: string
): Promise<any[]> {
  try {
    const user = await getAuthUserAction();
    if (!user || !user.legajo) {
      throw new Error("Usuario no autenticado");
    }

    const detalles = await AsistenciaService.getInasistenciasFechas(
      user.legajo,
      fechaInicio,
      fechaFin
    );

    return detalles;
  } catch (error) {
    console.error("Error en getInasistenciasDetalleAction:", error);
    return [];
  }
}

export async function getAlertaSalidaAction(): Promise<{
  alertaOlvidoSalida: boolean;
  fecha?: string;
  fechaIso?: string;
  hentrada?: string;
  nroregistro?: number;
}> {
  try {
    const user = await getAuthUserAction();
    if (!user || !user.legajo) {
      return { alertaOlvidoSalida: false };
    }

    return await AsistenciaService.getAlertaSalida(user.legajo);
  } catch (error) {
    console.error("Error en getAlertaSalidaAction:", error);
    return { alertaOlvidoSalida: false };
  }
}

