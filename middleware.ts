// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const isAuth = !!token;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  // Si NO está autenticado y no está en la página de login → redirigir a login
  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si está autenticado y entra a /login → mandarlo al dashboard
  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};