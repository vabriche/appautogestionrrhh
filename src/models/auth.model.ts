import { z } from "zod";

/**
 * Payload enviado al endpoint de autenticación POST /biometrico/login.
 */
export interface LoginRequest {
  legajo: string;
  passw: string;
}

/**
 * Esquema de respuesta retornado por el backend MySQL en POST /biometrico/login.
 * El backend devuelve un array con un único elemento (o vacío en caso anómalo).
 */
export interface LoginResponse {
  existe: number;
  legajo: string | null;
  nrodocumento: string | null;
  apellido: string | null;
  condicion: number | null; // 1: Docente, 2: No Docente
  area: string | null;
  encargado_area: string | null; // "N", "S", "T"
  token?: string;
}

/**
 * Modelo de dominio para el Agente autenticado en la sesión de la aplicación.
 */
export interface AuthUser {
  legajo: string;
  nrodocumento: string;
  apellido: string;
  condicion: number; // 1: Docente, 2: No Docente
  area: string;
  encargadoArea: string; // "N", "S", "T"
}

/**
 * Sesión completa autenticada (usuario + token JWT).
 */
export interface AuthSession {
  user: AuthUser;
  token: string;
}

/**
 * Esquema de validación para el formulario de login.
 */
export const loginSchema = z.object({
  legajo: z
    .string()
    .min(1, "El legajo es requerido")
    .regex(/^\d+$/, "El legajo debe contener solo números"),
  passw: z.string().min(1, "La contraseña es requerida"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Payload enviado al endpoint POST /biometrico/resetpass.
 */
export interface ResetPasswordRequest {
  legajo: string;
  documento: string;
}

/**
 * Respuesta del backend al resetear contraseña exitosamente.
 * Es idéntica a LoginResponse (mismo formato para permitir login directo).
 */
export type ResetPasswordResponse = LoginResponse;

/**
 * Esquema de validación para restablecer contraseña (blanqueo a DNI).
 */
export const resetPasswordSchema = z.object({
  legajo: z
    .string()
    .min(1, "El legajo es requerido")
    .regex(/^\d+$/, "El legajo debe contener solo números"),
  documento: z
    .string()
    .min(6, "El número de documento debe tener al menos 6 dígitos")
    .regex(/^\d+$/, "El documento debe contener solo números"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

