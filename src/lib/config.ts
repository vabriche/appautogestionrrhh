/** Configuración centralizada del frontend FCE. */

/**
 * URL base del backend.
 * Las llamadas se hacen principalmente del lado del servidor (Server Actions / Server Components).
 * El backend monta sus rutas directamente en la raíz (ej: /biometrico/login).
 */
export const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

/** Nombre de la cookie httpOnly donde se guarda el JWT del backend. */
export const AUTH_COOKIE = "fce_token";

/** Cookie con datos básicos del agente autenticado para la UI. */
export const USER_COOKIE = "fce_user";

/** Duración de la sesión en segundos (24 horas). */
export const SESSION_MAX_AGE = 60 * 60 * 24;

