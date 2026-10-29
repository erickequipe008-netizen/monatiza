import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CREDIT_PACKAGES } from "@/lib/columnist";

export const runtime = "nodejs";

// Cria um Checkout (pagamento único) para comprar um pacote de créditos de publicação.
export async function POST(req: Request) {
  try {
    const { credits } = (await req.json()) as { credits?: number };
    const qty = Number(credits);
    const pkg = CREDIT_PACKAGES.find((p) => p.credits === qty);
    if (!pkg) {
      return NextResponse.json({ error: "Pacote inválido" }, { status: 400 });
    }

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !userData.user) return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    const user = userData.user;

    const productName = `${qty} crédito${qty > 1 ? "s" : ""} de publicação`;
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.monatiza.com";

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: pkg.amount,
            product_data: { name: productName },
          },
        },
      ],
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { user_id: user.id, type: "credits", credits: String(qty) },
      success_url: `${origin}/dashboard/creditos?ok=1`,
      cancel_url: `${origin}/dashboard/creditos`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao iniciar o checkout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
