import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("sb-access-token");

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Formulário do cliente fica público
  if (pathname.startsWith("/editorial/revista/formulario")) {
    return NextResponse.next();
  }

  // Login fica público
  if (pathname.startsWith("/editorial/revista/login")) {
    return NextResponse.next();
  }

  // Todo o restante do editorial exige senha
  if (pathname.startsWith("/editorial")) {
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
