import { unstable_rethrow } from "next/navigation";
import { api } from "@/lib/api";
import {
  RegistroAsistencia,
  RegistroAsistenciaSchema,
  AsistenciaVirtualEstado,
  MarcarAsistenciaVirtualResult,
} from "@/models";
import { z } from "zod";

export class AsistenciaService {
  /**
   * Obtiene los registros de asistencia de una persona entre dos fechas.
   * @param condicion "0" para No Docente, "1" para Docente
   * @param legajo Legajo del agente
   * @param fechaInicio Fecha inicial en formato YYYY-MM-DD
   * @param fechaFin Fecha final en formato YYYY-MM-DD. Si se envía "0", busca solo de fechaInicio.
   */
  static async getRegistrosAsistencia(
    condicion: string | number,
    legajo: string | number,
    fechaInicio: string,
    fechaFin: string = "0"
  ): Promise<RegistroAsistencia[]> {
    try {
      const response = await api.get<RegistroAsistencia[]>(
        `/biometrico/horario_persofechas/${condicion}/${legajo}/${fechaInicio}/${fechaFin}`
      );
      
      // Validación estricta con zod si lo necesitamos, o simplemente devolver la data
      const parsed = z.array(RegistroAsistenciaSchema).safeParse(response);
      if (parsed.success) {
        return parsed.data;
      }
      
      // Si falla la validación pero es un array, devolvemos como está,
      // la validación estricta a veces falla por nulos inesperados del backend
      return Array.isArray(response) ? response : [];
    } catch (error) {
      unstable_rethrow(error);
      console.error("Error obteniendo registros de asistencia:", error);
      return [];
    }
  }

  /**
   * Obtiene los das tomados por licencias (Estudio, RP, Excepcionales) en un ao.
   */
  static async getInasistenciasRpEs(
    legajo: string | number,
    fechaInicio: string,
    fechaFin: string
  ): Promise<any[]> {
    try {
      const response = await api.get<any[]>(
        `/biometrico/insasisteciasres/${legajo}/${fechaInicio}/${fechaFin}`
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      unstable_rethrow(error);
      console.error("Error obteniendo inasistencias:", error);
      return [];
    }
  }

  /**
   * Obtiene el detalle de inasistencias en un período dado.
   */
  static async getInasistenciasFechas(
    legajo: string | number,
    fechaInicio: string,
    fechaFin: string
  ): Promise<any[]> {
    try {
      const response = await api.get<any[]>(
        `/biometrico/inasistenciasF/${legajo}/${fechaInicio}/${fechaFin}`
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      unstable_rethrow(error);
      console.error("Error obteniendo inasistencias detalle:", error);
      return [];
    }
  }

  /**
   * Verifica si el usuario olvidó registrar su salida en su última jornada previa a hoy.
   */
  static async getAlertaSalida(
    legajo: string | number
  ): Promise<{
    alertaOlvidoSalida: boolean;
    fecha?: string;
    fechaIso?: string;
    hentrada?: string;
    nroregistro?: number;
  }> {
    try {
      const response = await api.get<{
        alertaOlvidoSalida: boolean;
        fecha?: string;
        fechaIso?: string;
        hentrada?: string;
        nroregistro?: number;
      }>(`/biometrico/alerta_salida/${legajo}`);
      return response || { alertaOlvidoSalida: false };
    } catch (error) {
      unstable_rethrow(error);
      console.error("Error obteniendo alerta de salida:", error);
      return { alertaOlvidoSalida: false };
    }
  }

  /**
   * Obtiene el estado actual de marcación virtual para hoy (período de vacaciones 21 Dic - 1 Feb).
   */
  static async getAsistenciaVirtualEstado(
    legajo: string | number
  ): Promise<AsistenciaVirtualEstado> {
    try {
      const response = await api.get<AsistenciaVirtualEstado>(
        `/biometrico/asistencia_virtual/estado/${legajo}`
      );
      return response;
    } catch (error) {
      unstable_rethrow(error);
      console.error("Error obteniendo estado de asistencia virtual:", error);
      return {
        esPeriodoHabilitado: false,
        esPeriodoReal: false,
        fechaHoy: new Date().toISOString().split("T")[0],
        horaActual: "00:00:00",
        estado: "FUERA_DE_TURNO",
        ultimoRegistro: null,
        minutosDesdeEntrada: null,
        puedeMarcarSalida: true,
        registrosHoy: [],
      };
    }
  }

  /**
   * Registra una marcación virtual de entrada o salida.
   */
  static async marcarAsistenciaVirtual(
    legajo: string | number
  ): Promise<MarcarAsistenciaVirtualResult> {
    try {
      const response = await api.post<MarcarAsistenciaVirtualResult>(
        "/biometrico/asistencia_virtual/marcar",
        { legajo }
      );
      return response;
    } catch (error: any) {
      unstable_rethrow(error);
      console.error("Error al marcar asistencia virtual:", error);
      return {
        success: false,
        error: error?.message || "No se pudo registrar la asistencia virtual",
      };
    }
  }
}
