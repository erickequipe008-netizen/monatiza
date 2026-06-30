import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Cria uma sessão de Checkout do Stripe (assinatura recorrente) para o usuário logado.
export async function POST(req: Request) {
  try {
    const { plano } = (await req.json()) as { plano?: string };
    const planKey = plano === "anual" ? "anual" : "mensal";

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    // valida a sessão pelo token do Supabase (não confiar em id vindo do cliente)
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }
    const user = userData.user;

    // Preço recorrente criado na hora — evita depender de price IDs avulsos
    // (one-time) mal configurados, que quebram o modo "subscription".
    const PRICE = {
      mensal: { unit_amount: 1990, interval: "month" as const, label: "MonatizaPlus · Mensal" },
      anual: { unit_amount: 19900, interval: "year" as const, label: "MonatizaPlus · Anual" },
    };
    const price = PRICE[planKey];

    // garante a linha do assinante; status fica 'inactive' até o webhook confirmar o pagamento
    await supabaseAdmin.from("subscribers").upsert(
      {
        id: user.id,
        email: user.email,
        name: (user.user_metadata?.name as string | undefined) ?? null,
        plan: planKey,
      },
      { onConflict: "id" }
    );

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.monatiza.com";

    // Checkout hospedado pela Stripe (página segura): cartão + Apple/Google Pay,
    // sempre carrega (sem depender do Stripe.js no nosso domínio). Volta para /painel.
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: price.unit_amount,
            recurring: { interval: price.interval },
            product_data: { name: price.label },
          },
        },
      ],
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { user_id: user.id, plano: planKey },
      subscription_data: { metadata: { user_id: user.id, plano: planKey } },
      allow_promotion_codes: true,
      locale: "pt-BR",
      billing_address_collection: "auto",
      success_url: `${origin}/painel?sucesso=1`,
      cancel_url: `${origin}/assinantes`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao iniciar o checkout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
