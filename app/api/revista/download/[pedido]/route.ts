import { NextResponse } from "next/server";
import { fulfillMagazineSession } from "@/lib/magazine-fulfill";
import { signedPdfUrl } from "@/lib/magazines";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Gera um link seguro e recente (Signed URL de 15 min) e redireciona para
 * o PDF. Cada clique cria uma nova URL — o arquivo nunca é exposto
 * diretamente. `pedido` = id da sessão de Checkout do Stripe.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ pedido: string }> }) {
  const { pedido } = await ctx.params;
  if (!pedido) return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });

  const r = await fulfillMagazineSession(pedido);
  if (!r.paid) {
    return NextResponse.json({ error: "Pagamento não localizado" }, { status: 403 });
  }
  if (!r.magazine?.pdf_path) {
    return NextResponse.json({ error: "Arquivo indisponível" }, { status: 404 });
  }

  const url = await signedPdfUrl(r.magazine.pdf_path);
  if (!url) return NextResponse.json({ error: "Falha ao gerar o download" }, { status: 500 });

  return NextResponse.redirect(url, 302);
}
