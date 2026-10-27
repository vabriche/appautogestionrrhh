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
  virtual: z.number(),
});

export type RegistroAsistencia = z.infer<typeof RegistroAsistenciaSchema>;
