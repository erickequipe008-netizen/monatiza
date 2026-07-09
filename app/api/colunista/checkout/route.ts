import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { COLUMNIST_PLANS } from "@/lib/columnist";

export const runtime = "nodejs";

interface Body {
  plan?: number;
  profile?: {
    full_name?: string;
    phone?: string;
    region?: string;
    area?: string;
    site?: string;
    bio?: string;
  };
}

// Assinatura do plano de colunista: registra a candidatura e abre o Checkout do Stripe.
// A liberação dos créditos acontece no webhook, após o pagamento confirmado.
export async function POST(req: Request) {
  try {
    const { plan, profile } = (await req.json()) as Body;
    const planCfg = COLUMNIST_PLANS[Number(plan)];
    if (!planCfg) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !userData.user) return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    const user = userData.user;

    // Guarda os dados do formulário; o webhook só muda status/créditos depois do pagamento.
    const { error: upErr } = await supabaseAdmin.from("columnist_plans").upsert(
      {
        user_id: user.id,
        plan: planCfg.id,
        monthly_credits: planCfg.credits,
        status: "pending",
        full_name: profile?.full_name?.slice(0, 120) || null,
        phone: profile?.phone?.slice(0, 40) || null,
        region: profile?.region?.slice(0, 120) || null,
        area: profile?.area?.slice(0, 80) || null,
        site: profile?.site?.slice(0, 200) || null,
        bio: profile?.bio?.slice(0, 2000) || null,
        accepted_terms_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.monatiza.com";

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      locale: "pt-BR",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: planCfg.amount,
            recurring: { interval: "month" },
            product_data: {
              name: `Colunista Monatiza — ${planCfg.name}`,
              description: `${planCfg.credits} artigos por mês no site`,
            },
          },
        },
      ],
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { user_id: user.id, type: "columnist", plan: String(planCfg.id) },
      subscription_data: {
        metadata: { user_id: user.id, type: "columnist", plan: String(planCfg.id) },
      },
      success_url: `${origin}/dashboard?colunista=1`,
      cancel_url: `${origin}/colunistas#planos`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao iniciar o checkout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
