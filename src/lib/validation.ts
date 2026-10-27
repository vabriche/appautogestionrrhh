import "server-only";
import { z } from "zod";
import { ApiError } from "@/lib/api";
import type { ActionResult } from "@/models";

export function toFailure(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    return {
      ok: false,
      error: error.message,
      fieldErrors: error.fieldErrors as Record<string, string[]> | undefined,
    };
  }
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }
  return { ok: false, error: "Ocurrió un error inesperado." };
}

export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown,
):
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors: Record<string, string[]> } {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };

  const flat = z.flattenError(result.error);
  return {
    ok: false,
    error: "Hay errores de validación en el formulario.",
    fieldErrors: flat.fieldErrors as Record<string, string[]>,
  };
}

export function field(form: FormData, name: string): string | undefined {
  const value = form.get(name);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function numberField(form: FormData, name: string): number | undefined {
  const value = field(form, name);
  if (value === undefined) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}
