import { z } from "zod";

export const MotivoSchema = z.object({
  codina: z.number().or(z.string().transform(Number)),
  Motivo: z.string(),
});
export type Motivo = z.infer<typeof MotivoSchema>;

export const SolicitudJustificacionSchema = z.object({
  id: z.number().or(z.string().transform(Number)),
  legajo: z.coerce.string(),
  apellido: z.string().nullable().optional(),
  fecha: z.string(),
  tipo: z.string(),
  codina: z.number().or(z.string().transform(Number)),
  motivoDesc: z.string().nullable().optional(),
  comunico: z.string(),
  observacion: z.string().nullable().optional(),
  estado: z.string(),
  documento: z.string().nullable().optional(),
  fecha_inicio: z.string().nullable().optional(),
  fecha_fin: z.string().nullable().optional(),
  cantidad_dias: z.number().nullable().optional(),
  cargo_id: z.number().nullable().optional(),
  motivo_cancelacion: z.string().nullable().optional(),
});
export type SolicitudJustificacion = z.infer<typeof SolicitudJustificacionSchema>;

export interface CrearSolicitudPayload {
  legajo: string;
  codina: string | number;
  cargo_id?: number | null;
  tipo: "I" | "L";
  comunico: "S" | "N";
  observacion?: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  cantidad_dias?: number | null;
}
