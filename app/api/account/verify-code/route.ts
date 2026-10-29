import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });

  const uid = data.user.id;
  const body = await req.json().catch(() => ({}));
  const purpose = String(body.purpose || "");
  const code = String(body.code || "").trim();
  const payload = (body.payload || {}) as { password?: string; email?: string; name?: string };

  const { data: row } = await supabaseAdmin
    .from("account_codes")
    .select("code, attempts, expires_at")
    .eq("user_id", uid)
    .eq("purpose", purpose)
    .maybeSingle();

  if (!row) return NextResponse.json({ error: "Solicite um novo código." }, { status: 400 });
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await supabaseAdmin.from("account_codes").delete().eq("user_id", uid).eq("purpose", purpose);
    return NextResponse.json({ error: "Código expirado. Solicite outro." }, { status: 400 });
  }
  if ((row.attempts ?? 0) >= 5) {
    await supabaseAdmin.from("account_codes").delete().eq("user_id", uid).eq("purpose", purpose);
    return NextResponse.json({ error: "Muitas tentativas. Solicite um novo código." }, { status: 429 });
  }
  if (row.code !== code) {
    await supabaseAdmin.from("account_codes").update({ attempts: (row.attempts ?? 0) + 1 }).eq("user_id", uid).eq("purpose", purpose);
    return NextResponse.json({ error: "Código incorreto." }, { status: 400 });
  }

  // Código válido → aplica a mudança
  try {
    if (purpose === "password") {
      if (!payload.password || payload.password.length < 6) return NextResponse.json({ error: "Senha inválida (mín. 6)." }, { status: 400 });
      const { error: e } = await supabaseAdmin.auth.admin.updateUserById(uid, { password: payload.password });
      if (e) throw e;
    } else if (purpose === "email") {
      const em = (payload.email || "").trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
      const { error: e } = await supabaseAdmin.auth.admin.updateUserById(uid, { email: em, email_confirm: true });
      if (e) throw e;
    } else if (purpose === "name") {
      const nm = (payload.name || "").trim().slice(0, 40);
      if (!nm) return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
      await supabaseAdmin.from("community_profiles").update({ display_name: nm, updated_at: new Date().toISOString() }).eq("user_id", uid);
      await supabaseAdmin.auth.admin.updateUserById(uid, { user_metadata: { ...(data.user.user_metadata || {}), name: nm } });
    } else {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Não foi possível aplicar a alteração." }, { status: 500 });
  }

  await supabaseAdmin.from("account_codes").delete().eq("user_id", uid).eq("purpose", purpose);
  return NextResponse.json({ ok: true });
}
