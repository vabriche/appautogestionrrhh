import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, USER_COOKIE } from "@/lib/config";

// Rutas protegidas que requieren sesión activa
const PROTECTED_PREFIXES = ["/asistencia", "/supervision", "/tramites", "/home"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  // 1. Redirigir a /login si no hay token en rutas protegidas
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Si ya está autenticado e intenta ir a /login o a la raíz /, enviarlo a /asistencia
  if (token && (pathname === "/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/asistencia", request.url));
  }

  // 3. Control de acceso para supervisión (requiere rol de encargado)
  if (token && pathname.startsWith("/supervision")) {
    const rawUser = request.cookies.get(USER_COOKIE)?.value;
    if (rawUser) {
      try {
        const user = JSON.parse(decodeURIComponent(rawUser));
        if (!user.encargadoArea || user.encargadoArea === "N") {
          return NextResponse.redirect(new URL("/asistencia", request.url));
        }
      } catch {
        // En caso de error parseando la cookie de usuario, continúa
      }
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
