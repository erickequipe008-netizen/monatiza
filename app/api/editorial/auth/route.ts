// app/api/editorial/auth/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Segredos vêm SÓ de variáveis de ambiente (nada versionado no código).
const EDITORIAL_PASSWORD = process.env.EDITORIAL_PASSWORD;
const EDITORIAL_TOKEN = process.env.EDITORIAL_TOKEN;

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!EDITORIAL_PASSWORD || !EDITORIAL_TOKEN) {
    return NextResponse.json({ error: "Editorial não configurado" }, { status: 500 });
  }
  if (password !== EDITORIAL_PASSWORD) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  // Cookie httpOnly com o token secreto (não adivinhável) — prova de sessão.
  response.cookies.set("editorial-token", EDITORIAL_TOKEN, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 8, // 8 horas
  });

  return response;
}
