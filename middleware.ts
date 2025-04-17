import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const url = request.nextUrl.pathname;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 👇 Rutas privadas por rol
  const user = token.user as { role: string };

  if (url.startsWith("/admin") && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/no-autorizado", request.url));
  }

  if (
    url.startsWith("/supervisor") &&
    !["SUPERVISOR", "ADMIN"].includes(user.role)
  ) {
    return NextResponse.redirect(new URL("/no-autorizado", request.url));
  }

  if (
    url.startsWith("/operario") &&
    !["OPERARIO", "SUPERVISOR", "ADMIN"].includes(user.role)
  ) {
    return NextResponse.redirect(new URL("/no-autorizado", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/supervisor/:path*", "/operario/:path*"],
};
