import "server-only";
import { cookies } from "next/headers";
import { api, ApiError } from "@/lib/api";
import { AUTH_COOKIE, USER_COOKIE } from "@/lib/config";
import type {
  LoginRequest,
  LoginResponse,
  ResetPasswordResponse,
  AuthUser,
  AuthSession,
} from "@/models";

/**
 * Servicio encargado de la comunicación con los endpoints de autenticación del backend.
 */
export const authService = {
  /**
   * Envía las credenciales al endpoint POST /biometrico/login.
   * Valida la respuesta del backend y retorna la sesión con el usuario y el token JWT.
   */
  async login(credentials: LoginRequest): Promise<AuthSession> {
    const rows = await api.post<LoginResponse[]>(
      "/biometrico/login",
      credentials,
      {
        skipAuth: true,
      },
    );

    const agent = rows?.[0];

    // Si las credenciales no coinciden, MySQL retorna count(*) as existe = 0 sin token
    if (!agent || Number(agent.existe) !== 1 || !agent.token) {
      throw new ApiError("Legajo o contraseña incorrectos.", 401);
    }

    const user: AuthUser = {
      legajo: String(agent.legajo ?? credentials.legajo),
      nrodocumento: String(agent.nrodocumento ?? ""),
      apellido: String(agent.apellido ?? ""),
      condicion: Number(agent.condicion ?? 0),
      area: String(agent.area ?? ""),
      encargadoArea: String(agent.encargado_area ?? "N"),
    };

    return {
      user,
      token: agent.token,
    };
  },

  /**
   * Cambia la contraseña del agente mediante POST /biometrico/changepass.
   */
  async changePassword(data: {
    legajo: string;
    passwold: string;
    passnew: string;
  }): Promise<unknown> {
    return api.post("/biometrico/changepass", {
      legajo: String(data.legajo),
      passwold: data.passwold,
      passnew: data.passnew,
    });
  },

  /**
   * Restablece la contraseña del agente a su número de documento mediante POST /biometrico/resetpass.
   * Valida legajo y documento contra el backend. Devuelve la sesión autenticada con JWT si coincide.
   */
  async resetPassword(data: {
    legajo: string;
    documento: string;
  }): Promise<AuthSession> {
    const response = await api.post<ResetPasswordResponse | string>(
      "/biometrico/resetpass",
      {
        legajo: String(data.legajo),
        documento: String(data.documento),
      },
      {
        skipAuth: true,
      },
    );

    if (
      !response ||
      response === "N" ||
      typeof response === "string" ||
      Number(response.existe) !== 1 ||
      !response.token
    ) {
      throw new ApiError(
        "Los datos ingresados no coinciden con ningún agente registrado.",
        404,
      );
    }

    const user: AuthUser = {
      legajo: String(response.legajo),
      nrodocumento: String(response.nrodocumento),
      apellido: String(response.apellido ?? ""),
      condicion: Number(response.condicion ?? 0),
      area: String(response.area ?? ""),
      encargadoArea: String(response.encargado_area ?? "N"),
    };

    return {
      user,
      token: response.token,
    };
  },

  /**
   * Obtiene los datos del usuario en sesión desde la cookie almacenada en el servidor.
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const cookieStore = await cookies();
      const rawUser = cookieStore.get(USER_COOKIE)?.value;
      if (!rawUser) return null;
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      return null;
    }
  },

  /**
   * Obtiene el token JWT actual de la sesión.
   */
  async getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_COOKIE)?.value ?? null;
  },

  /**
   * Comprueba si existe una sesión activa válida.
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  },
};
