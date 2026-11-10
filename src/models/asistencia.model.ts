import { z } from "zod";

export const RegistroAsistenciaSchema = z.object({
  area: z.string().nullable().optional(),
  legajo: z.number(),
  apellido: z.string(),
  fecha: z.string(),
  Hentrada: z.string(),
  Hsalida: z.string().nullable(),
  horasT: z.number().or(z.string()).nullable(),
  nroregistro: z.number(),
  virtual: z.union([z.number(), z.string()]).optional().nullable(),
});

export type RegistroAsistencia = z.infer<typeof RegistroAsistenciaSchema>;

export interface MarcacionHoy {
  nroregistro: number;
  legajo: number;
  fecha: string;
  fecha_formateada?: string;
  Hentrada: string;
  Hsalida: string | null;
  cantidadHoras: number | null;
  virtual: string | null;
}

export interface AsistenciaVirtualEstado {
  esPeriodoHabilitado: boolean;
  esPeriodoReal: boolean;
  // Ventana del receso vigente o del próximo (periodo_vacaciones): desde ventana_desde hasta el día
  // anterior a reintegro_general. Fechas aaaa-mm-dd; null si no hay periodo cargado.
  periodoVirtual?: {
    activo: boolean;
    periodo: number | null;
    desde: string | null;
    hasta: string | null;
    reintegro: string | null;
  };
  fechaHoy: string;
  horaActual: string;
  estado: "FUERA_DE_TURNO" | "EN_CURSO";
  ultimoRegistro: MarcacionHoy | null;
  minutosDesdeEntrada?: number | null;
  puedeMarcarSalida?: boolean;
  registrosHoy: MarcacionHoy[];
}

export interface MarcarAsistenciaVirtualResult {
  success: boolean;
  tipo?: "ENTRADA" | "SALIDA";
  mensaje?: string;
  hora?: string;
  cantidadHoras?: number;
  nroregistro?: number;
  error?: string;
}
