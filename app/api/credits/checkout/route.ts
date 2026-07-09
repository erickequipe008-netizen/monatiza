import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { COLUMNIST_EXTRA_CREDIT_PRICE } from "@/lib/columnist";

export const runtime = "nodejs";

const BRANDVOICE_PRICE = 15000; // R$ 150,00 em centavos (sem plano de colunista)
const PACKAGES = [1, 3, 5, 10];

// Cria um Checkout (pagamento único) para comprar créditos de publicação.
// Colunista com plano ativo paga o valor de crédito extra; sem plano, vale o preço BrandVoice.
export async function POST(req: Request) {
  try {
    const { credits } = (await req.json()) as { credits?: number };
    const qty = Number(credits);
    if (!PACKAGES.includes(qty)) {
      return NextResponse.json({ error: "Pacote inválido" }, { status: 400 });
    }

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !userData.user) return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    const user = userData.user;

    const { data: colPlan } = await supabaseAdmin
      .from("columnist_plans")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();
    const isColumnist = colPlan?.status === "active";
    const unitPrice = isColumnist ? COLUMNIST_EXTRA_CREDIT_PRICE : BRANDVOICE_PRICE;
    const productName = isColumnist
      ? `${qty} crédito${qty > 1 ? "s" : ""} extra${qty > 1 ? "s" : ""} de colunista`
      : `${qty} crédito${qty > 1 ? "s" : ""} BrandVoice`;

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.monatiza.com";

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: unitPrice * qty,
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
