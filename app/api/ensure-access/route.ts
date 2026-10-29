import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// App público: garante que todo usuário autenticado tenha uma linha de assinante
// ATIVA (plano "free") — necessário para o RLS da comunidade/mensagens funcionar.
// Não rebaixa quem já é pagante.
export async function POST(req: Request) {
  try {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    const user = userData.user;

    const { data: existing } = await supabaseAdmin
      .from("subscribers")
      .select("status, plan")
      .eq("id", user.id)
      .maybeSingle();
    if (existing?.status === "active") {
      return NextResponse.json({ ok: true, already: true });
    }

    await supabaseAdmin.from("subscribers").upsert(
      {
        id: user.id,
        email: user.email,
        name: (user.user_metadata?.name as string | undefined) ?? null,
        plan: existing?.plan || "free",
        status: "active",
        current_period_end: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao liberar acesso";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
