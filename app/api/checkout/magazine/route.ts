import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getMagazineById } from "@/lib/magazines";

export const runtime = "nodejs";

/**
 * Cria a sessão de Checkout do Stripe para comprar uma revista digital
 * (pagamento único). O Stripe coleta e-mail e nome do comprador; após o
 * pagamento o cliente vai para a página de download do pedido, e o
 * webhook entrega o e-mail com o link seguro.
 */
export async function POST(req: Request) {
  try {
    const { magazineId } = ((await req.json().catch(() => ({}))) || {}) as { magazineId?: string };
    if (!magazineId) return NextResponse.json({ error: "Revista não informada" }, { status: 400 });

    const magazine = await getMagazineById(magazineId);
    if (!magazine || !magazine.published) {
      return NextResponse.json({ error: "Revista indisponível" }, { status: 404 });
    }
    if (!magazine.pdf_path) {
      return NextResponse.json({ error: "Esta edição ainda não está pronta para venda." }, { status: 409 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.monatiza.com";
    const amount = Math.round(Number(magazine.price) * 100);

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: amount,
            product_data: {
              name: magazine.edition ? `${magazine.title} — Edição ${magazine.edition}` : magazine.title,
              description: magazine.subtitle || undefined,
              ...(magazine.cover_url ? { images: [magazine.cover_url] } : {}),
            },
          },
        },
      ],
      metadata: { type: "magazine", magazine_id: magazine.id, magazine_slug: magazine.slug },
      locale: "pt-BR",
      billing_address_collection: "auto",
      success_url: `${origin}/revista/download/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/revista/${magazine.slug}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao iniciar o pagamento";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
