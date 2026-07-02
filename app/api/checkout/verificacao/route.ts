import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Assinatura mensal de R$ 39,90 pelo selo de verificado (Checkout hospedado, cancele quando quiser).
export async function POST(req: Request) {
  try {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }
    const user = userData.user;

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.monatiza.com";

    const { tier: rawTier } = ((await req.json().catch(() => ({}))) || {}) as { tier?: string };
    const tier = rawTier === "silver" ? "silver" : "gold";
    const amount = tier === "silver" ? 2990 : 4990; // Prata R$29,90 · Ouro R$49,90
    const name = tier === "silver" ? "Selo Prata — Monatiza" : "Selo Ouro — Monatiza";

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: amount,
            recurring: { interval: "month" },
            product_data: { name },
          },
        },
      ],
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { user_id: user.id, type: "verification", tier },
      subscription_data: { metadata: { user_id: user.id, type: "verification", tier } },
      locale: "pt-BR",
      success_url: `${origin}/app/verificacao?pago=1`,
      cancel_url: `${origin}/app/verificacao`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao iniciar o pagamento";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
