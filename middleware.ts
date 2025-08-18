// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname, searchParams } = request.nextUrl;
  const method = request.method;

  // Log mejorado de petición entrante
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  console.log(
    `🌐 ${method} ${pathname}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    } - IP: ${ip.slice(0, 10)}...`
  );

  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;

  // Verificar si el token existe
  const isAuth = !!token;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isAdminDashboard =
    request.nextUrl.pathname.startsWith("/admin/dashboard");

  // Si NO está autenticado y no está en la página de login → redirigir a login
  if (!isAuth && !isLoginPage) {
    console.log("No autenticado, redirigiendo a login...");

    // Crear una respuesta de redirección con parámetro para mostrar mensaje
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("expired", "true");

    const response = NextResponse.redirect(loginUrl);

    // Eliminar las cookies de autenticación por seguridad
    response.cookies.delete("token");
    response.cookies.delete("user");

    return response;
  }

  // En el middleware no verificamos si el token está expirado
  // para evitar problemas con la ejecución en el servidor
  // La verificación de expiración se hará en el componente cliente AuthErrorHandler

  // Si está autenticado y entra a /login → mandarlo al dashboard
  if (isAuth && isLoginPage) {
    // Verificamos si hay un usuario guardado en las cookies
    const userCookie = request.cookies.get("user")?.value;
    let user;

    try {
      user = userCookie ? JSON.parse(userCookie) : null;
    } catch (e) {
      console.error("Error parsing user cookie", e);
      // Si hay un error al parsear la cookie, eliminar la cookie y redirigir al login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      response.cookies.delete("user");
      return response;
    }

    // Verificar el rol del usuario para decidir a qué dashboard redirigir
    try {
      if (user && user.roles) {
        if (user.roles.includes("ADMIN")) {
          return NextResponse.redirect(
            new URL("/admin/dashboard", request.url)
          );
        } else if (user.roles.includes("OPERADOR")) {
          return NextResponse.redirect(
            new URL("/empleado/dashboard", request.url)
          );
        }
      }
    } catch (error) {
      console.error("Error al procesar la cookie de usuario:", error);
    }
  }

  // Si es un OPERARIO intentando acceder al dashboard de admin → redirigir a dashboard de empleado
  if (isAuth && isAdminDashboard && userCookie) {
    try {
      const user = JSON.parse(userCookie);
      if (
        user.roles.includes("OPERARIO") &&
        !user.roles.includes("ADMIN") &&
        !user.roles.includes("SUPERVISOR")
      ) {
        return NextResponse.redirect(
          new URL("/empleado/dashboard", request.url)
        );
      }
    } catch (error) {
      console.error("Error al procesar la cookie de usuario:", error);
    }
  }

  // Crear respuesta con headers de debugging
  const response = NextResponse.next();

  // Agregar headers personalizados para debugging
  response.headers.set("x-request-id", generateRequestId());
  response.headers.set("x-timestamp", new Date().toISOString());

  // Log de respuesta con duración
  const duration = Date.now() - startTime;
  console.log(`✅ ${method} ${pathname} - ${duration}ms`);

  return response;
}

/**
 * Genera un ID único para cada petición
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};
