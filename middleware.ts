// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Verificar si el token existe
  const isAuth = !!token;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

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
    if (user && user.roles) {
      if (user.roles.includes("ADMIN")) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else if (user.roles.includes("OPERADOR")) {
        return NextResponse.redirect(
          new URL("/empleado/dashboard", request.url)
        );
      }
    }

    // Si no tiene roles o no se pudo determinar, redirigir al admin dashboard por defecto
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/empleado/dashboard/:path*",
    "/login",
    "/",
  ],
};
