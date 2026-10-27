import { z } from "zod";

export const InasistenciaResSchema = z.object({
  mot: z.string(),
  dias: z.number().or(z.string().transform(Number)),
});

export type InasistenciaRes = z.infer<typeof InasistenciaResSchema>;

export const InasistenciaDetalleSchema = z.object({
  mot: z.string(),
  fechai: z.string(),
  fechaf: z.string(),
});

export type InasistenciaDetalle = z.infer<typeof InasistenciaDetalleSchema>;
