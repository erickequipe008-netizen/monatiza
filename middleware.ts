import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Admin (jornalistas via Supabase Auth) ─────────────────
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("sb-access-token");

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ── 2. Editorial (senha fixa) ────────────────────────────────
  // Apenas produção e entregues exigem senha
  if (
    pathname.startsWith("/editorial/revista/producao") ||
    pathname.startsWith("/editorial/revista/entregues")
  ) {
    const editorialToken = request.cookies.get("editorial-token");

    if (!editorialToken) {
      return NextResponse.redirect(
        new URL("/editorial/revista/login", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/editorial/:path*"],
};