import { z } from "zod";

export const SupervisionRegistroSchema = z.object({
  area: z.string().nullable().optional(),
  legajo: z.string().or(z.number()).transform(String),
  apellido: z.string().nullable().optional(),
  fecha: z.string(),
  Hentrada: z.string().nullable().optional(),
  Hsalida: z.string().nullable().optional(),
  horasT: z.number().or(z.string()),
  virtual: z.string().or(z.number()).nullable().optional(),
  nroregistro: z.string().or(z.number()).transform(String),
});

export type SupervisionRegistro = z.infer<typeof SupervisionRegistroSchema>;
