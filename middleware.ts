import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Rotas do Admin (jornalistas) ─────────────────────────
  // Protegidas pelo cookie do Supabase Auth
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("sb-access-token");
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ── 2. Rotas do Editorial (equipe interna) ───────────────────
  // Protegidas pelo cookie de senha fixa
  // Deixa /editorial/login passar livremente
  if (
    pathname.startsWith("/editorial") &&
    !pathname.startsWith("/editorial/login")
  ) {
    const editorialToken = request.cookies.get("editorial-token");
    if (!editorialToken) {
      return NextResponse.redirect(new URL("/editorial/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/editorial/:path*"],
};