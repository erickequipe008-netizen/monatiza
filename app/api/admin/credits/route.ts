import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function getAdmin(req: Request) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: prof } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  return prof?.role === "admin" ? data.user : null;
}

// Ajuste manual de créditos pelo admin (positivo adiciona, negativo remove).
export async function POST(req: Request) {
  try {
    const admin = await getAdmin(req);
    if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

    const { journalist_id, delta } = (await req.json()) as { journalist_id?: string; delta?: number };
    if (!journalist_id || typeof delta !== "number" || !Number.isInteger(delta) || delta === 0) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    let effective = delta;
    if (effective < 0) {
      const { data: c } = await supabaseAdmin
        .from("journalist_credits")
        .select("balance")
        .eq("journalist_id", journalist_id)
        .maybeSingle();
      const bal = c?.balance ?? 0;
      effective = -Math.min(Math.abs(effective), bal); // nunca deixa o saldo negativo
    }
    if (effective === 0) return NextResponse.json({ ok: true, applied: 0 });

    const { error: rpcErr } = await supabaseAdmin.rpc("add_journalist_credits", {
      p_journalist: journalist_id,
      p_credits: effective,
    });
    if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 });

    await supabaseAdmin.from("credit_transactions").insert({
      journalist_id,
      stripe_payment_id: null,
      amount_paid: 0,
      credits_added: effective,
      status: "ajuste_admin",
    });

    return NextResponse.json({ ok: true, applied: effective });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
