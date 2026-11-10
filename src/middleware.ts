import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, USER_COOKIE } from "@/lib/config";
import { esEncargado } from "@/lib/roles";

// Rutas protegidas que requieren sesión activa
const PROTECTED_PREFIXES = ["/asistencia", "/supervision", "/tramites", "/home"];

// El JWT vencido (o ilegible) cuenta como sin sesión. Solo se lee el "exp" del payload: la firma la
// verifica el backend. Sin esto, con la cookie viva y el token vencido, el backend responde 401, la app
// manda a /login y este middleware la devolvía a /asistencia (la página "se abría y se cerraba").
function tokenVencido(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function sinSesion(response: NextResponse): NextResponse {
  response.cookies.delete(AUTH_COOKIE);
  response.cookies.delete(USER_COOKIE);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawToken = request.cookies.get(AUTH_COOKIE)?.value;
  const vencido = !!rawToken && tokenVencido(rawToken);
  const token = vencido ? undefined : rawToken;

  // 1. Redirigir a /login si no hay token (o venció) en rutas protegidas
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    return vencido ? sinSesion(response) : response;
  }

  // Token vencido en una ruta pública (p. ej. /login): se deja pasar y se limpia la sesión
  if (vencido) {
    return sinSesion(NextResponse.next());
  }

  // 2. Si ya está autenticado e intenta ir a /login o a la raíz /, enviarlo a /asistencia
  if (token && (pathname === "/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/asistencia", request.url));
  }

  // 3. Control de acceso para supervisión (requiere rol de encargado "S" o "T")
  if (token && pathname.startsWith("/supervision")) {
    const rawUser = request.cookies.get(USER_COOKIE)?.value;
    let encargadoArea: unknown = null;
    try {
      encargadoArea = rawUser ? JSON.parse(decodeURIComponent(rawUser)).encargadoArea : null;
    } catch {
      // Cookie de usuario ilegible: se trata como agente sin cargo
    }
    if (!esEncargado(encargadoArea)) {
      return NextResponse.redirect(new URL("/asistencia", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Interceptar todas las rutas excepto:
     * - api (rutas internas API)
     * - _next/static (archivos estáticos de Next.js)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, sitemap, robots
     * - extensiones de recursos estáticos (.svg, .png, .jpg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
