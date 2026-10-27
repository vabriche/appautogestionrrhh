"use server";

import { cookies } from "next/headers";
import { authService } from "@/services/auth.service";
import { loginSchema, resetPasswordSchema } from "@/models/auth.model";
import { toFailure, validate, field } from "@/lib/validation";
import { AUTH_COOKIE, USER_COOKIE, SESSION_MAX_AGE } from "@/lib/config";
import type { ActionResult, AuthUser } from "@/models";

/**
 * Controller de Autenticación (MVC)
 * Maneja las acciones del servidor relacionadas con inicio de sesión,
 * gestión de cookies de sesión y cierre de sesión.
 */

export async function loginAction(
  _prevState: ActionResult<AuthUser> | null,
  formData: FormData,
): Promise<ActionResult<AuthUser>> {
  try {
    const rawLegajo = field(formData, "legajo") ?? "";
    const rawPassw = field(formData, "passw") ?? "";

    // 1. Validación de datos de entrada con Zod (Model Layer)
    const validation = validate(loginSchema, {
      legajo: rawLegajo,
      passw: rawPassw,
    });

    if (!validation.ok) {
      return {
        ok: false,
        error: validation.error,
        fieldErrors: validation.fieldErrors,
      };
    }

    // 2. Llamada a la capa de servicio (Service Layer)
    const session = await authService.login(validation.data);

    // 3. Persistencia de la sesión en cookies seguras
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    // Cookie httpOnly con el JWT para requests autorizados al backend
    cookieStore.set(AUTH_COOKIE, session.token, {
      httpOnly: true,
      secure: false, // Desactivado para test en HTTP (172.22.160.80)
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    // Cookie con datos legibles del usuario para hidratar la interfaz
    cookieStore.set(USER_COOKIE, JSON.stringify(session.user), {
      httpOnly: false,
      secure: false, // Desactivado para test en HTTP (172.22.160.80)
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return {
      ok: true,
      data: session.user,
      message: "Ingreso exitoso",
    };
  } catch (error) {
    return toFailure(error);
  }
}

export async function logoutAction(): Promise<ActionResult<void>> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE);
    cookieStore.delete(USER_COOKIE);

    return {
      ok: true,
      data: undefined,
      message: "Sesión cerrada correctamente",
    };
  } catch (error) {
    return toFailure(error);
  }
}

export async function getAuthUserAction(): Promise<AuthUser | null> {
  return authService.getCurrentUser();
}

export async function changePasswordAction(data: {
  legajo: string;
  passwold: string;
  passnew: string;
}): Promise<ActionResult<void>> {
  try {
    await authService.changePassword(data);
    return {
      ok: true,
      data: undefined,
      message: "Contraseña actualizada con éxito",
    };
  } catch (error) {
    return toFailure(error);
  }
}

export async function resetPasswordAction(data: {
  legajo: string;
  documento: string;
}): Promise<ActionResult<AuthUser>> {
  try {
    const validation = validate(resetPasswordSchema, data);
    if (!validation.ok) {
      return {
        ok: false,
        error: validation.error,
        fieldErrors: validation.fieldErrors,
      };
    }

    const session = await authService.resetPassword(validation.data);

    // Persistencia de la sesión en cookies seguras para acceso directo
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set(AUTH_COOKIE, session.token, {
      httpOnly: true,
      secure: false, // Desactivado para test en HTTP
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    cookieStore.set(USER_COOKIE, JSON.stringify(session.user), {
      httpOnly: false,
      secure: false, // Desactivado para test en HTTP
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return {
      ok: true,
      data: session.user,
      message: "Contraseña restablecida con éxito a tu número de documento.",
    };
  } catch (error) {
    return toFailure(error);
  }
}

