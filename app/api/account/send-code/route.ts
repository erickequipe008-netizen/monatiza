import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";

export const runtime = "nodejs";

const PURPOSES = ["password", "email", "name"];

export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user?.email) return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });

  const uid = data.user.id;
  const email = data.user.email;
  const body = await req.json().catch(() => ({}));
  const purpose = String(body.purpose || "");
  if (!PURPOSES.includes(purpose)) return NextResponse.json({ error: "Ação inválida" }, { status: 400 });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await supabaseAdmin
    .from("account_codes")
    .upsert({ user_id: uid, purpose, code, expires_at: expires, attempts: 0 }, { onConflict: "user_id,purpose" });

  const acao = purpose === "password" ? "alterar sua senha" : purpose === "email" ? "alterar seu e-mail" : "alterar seu nome";
  try {
    await resend.emails.send({
      from: "Monatiza <contato@monatiza.com>",
      to: email,
      subject: `${code} é o seu código de verificação`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
          <h2 style="margin:0 0 8px">Código de verificação</h2>
          <p style="color:#555;margin:0 0 16px">Use o código abaixo para ${acao} na Monatiza.</p>
          <div style="font-size:34px;font-weight:800;letter-spacing:8px;background:#f3f3f5;border-radius:12px;padding:16px;text-align:center">${code}</div>
          <p style="color:#888;font-size:13px;margin:16px 0 0">O código expira em 10 minutos. Se você não solicitou, ignore este e-mail e sua conta segue protegida.</p>
        </div>`,
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível enviar o e-mail. Tente novamente." }, { status: 500 });
  }

  const [u, d] = email.split("@");
  const masked = `${u.slice(0, 1)}${"*".repeat(Math.max(1, u.length - 2))}${u.slice(-1)}@${d}`;
  return NextResponse.json({ ok: true, sentTo: masked });
}
