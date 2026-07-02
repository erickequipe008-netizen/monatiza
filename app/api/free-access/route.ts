import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Código do convite. Pode ser trocado sem deploy pela env FREE_INVITE_CODE.
const CODE = process.env.FREE_INVITE_CODE || "monatiza-vip-2026";

// Libera acesso grátis (assinante ativo, plano "free") para quem chegou pelo
// link de convite e está autenticado. Não rebaixa quem já paga.
export async function POST(req: Request) {
  try {
    const { code } = (await req.json()) as { code?: string };
    if (!code || code !== CODE) {
      return NextResponse.json({ error: "Convite inválido ou expirado." }, { status: 403 });
    }

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
    // já é assinante pagante → mantém
    if (existing?.status === "active" && existing.plan && existing.plan !== "free") {
      return NextResponse.json({ ok: true, already: true });
    }

    await supabaseAdmin.from("subscribers").upsert(
      {
        id: user.id,
        email: user.email,
        name: (user.user_metadata?.name as string | undefined) ?? null,
        plan: "free",
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
