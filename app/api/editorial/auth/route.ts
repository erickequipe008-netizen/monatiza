// app/api/editorial/auth/route.ts
import { NextRequest, NextResponse } from "next/server";

// ⚠️ Troque pelo valor que quiser — mantenha em variável de ambiente em produção
const EDITORIAL_PASSWORD = process.env.EDITORIAL_PASSWORD ?? "monatiza2026";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== EDITORIAL_PASSWORD) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  // Cookie httpOnly — não acessível via JS, mais seguro
  response.cookies.set("editorial-token", "granted", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    // secure: true, // descomente em produção (HTTPS)
    maxAge: 60 * 60 * 8, // 8 horas
  });

  return response;
}