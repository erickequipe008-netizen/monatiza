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

    const priceId = planKey === "anual" ? process.env.STRIPE_PRICE_ANUAL : process.env.STRIPE_PRICE_MENSAL;
    if (!priceId) {
      return NextResponse.json({ error: "Plano não configurado no servidor" }, { status: 500 });
    }

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

    // ui_mode: "elements" → checkout próprio no site (Payment Element), em vez da
    // tela hospedada do Stripe. O client_secret é consumido pelo CheckoutElementsProvider.
    const session = await getStripe().checkout.sessions.create({
      ui_mode: "elements",
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { user_id: user.id, plano: planKey },
      subscription_data: { metadata: { user_id: user.id, plano: planKey } },
      return_url: `${origin}/painel?sucesso=1`,
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao iniciar o checkout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
