// middleware.ts
import { NextResponse, userAgent } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;

  const isAuth = !!token;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isAdminDashboard =
    request.nextUrl.pathname.startsWith("/admin/dashboard");

  // Si NO está autenticado y no está en la página de login → redirigir a login
  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si está autenticado y entra a /login → mandarlo al dashboard según su rol
  if (isAuth && isLoginPage && userCookie) {
    try {
      const user = JSON.parse(userCookie);

      if (user.roles.includes("ADMIN") || user.roles.includes("SUPERVISOR")) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else if (user.roles.includes("OPERARIO")) {
        return NextResponse.redirect(
          new URL("/empleado/dashboard", request.url)
        );
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};
