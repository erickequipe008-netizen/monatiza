// Fulfillment da compra de revista: confirma o pagamento no Stripe,
// registra o pedido (idempotente) e entrega o e-mail com o download.
// Compartilhado pelo webhook e pela página/rota de download (à prova de
// corrida — quem chegar primeiro finaliza).
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getMagazineById, signedPdfUrl } from "@/lib/magazines";
import { sendMagazineDeliveryEmail } from "@/lib/magazine-email";
import { SITE_URL } from "@/lib/seo";
import type { Magazine, MagazinePurchase } from "@/types/magazine";

type FulfillResult =
  | { paid: false }
  | {
      paid: true;
      purchase: MagazinePurchase | null;
      magazine: Magazine | null;
      email: string;
      name: string | null;
      amount: number;
    };

/** Confirma a sessão e grava/atualiza o pedido. Não envia e-mail. */
export async function fulfillMagazineSession(sessionId: string): Promise<FulfillResult> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid" || session.metadata?.type !== "magazine") {
    return { paid: false };
  }

  const magazineId = session.metadata?.magazine_id ?? null;
  const email = session.customer_details?.email || session.customer_email || "";
  const name = session.customer_details?.name ?? null;
  const amount = (session.amount_total ?? 0) / 100;

  const { data: existing } = await supabaseAdmin
    .from("magazine_purchases")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  let purchase = existing as MagazinePurchase | null;
  if (!purchase) {
    const { data: inserted } = await supabaseAdmin
      .from("magazine_purchases")
      .insert({
        stripe_session_id: sessionId,
        magazine_id: magazineId,
        customer_name: name,
        customer_email: email,
        amount,
        status: "paid",
        payment_date: new Date().toISOString(),
      })
      .select("*")
      .maybeSingle();
    purchase = inserted as MagazinePurchase | null;
  } else if (purchase.status !== "paid") {
    const { data: upd } = await supabaseAdmin
      .from("magazine_purchases")
      .update({ status: "paid", payment_date: new Date().toISOString(), amount })
      .eq("id", purchase.id)
      .select("*")
      .maybeSingle();
    purchase = (upd as MagazinePurchase) ?? purchase;
  }

  const magazine = magazineId ? await getMagazineById(magazineId) : null;
  return { paid: true, purchase, magazine, email, name, amount };
}

/** Finaliza e envia o e-mail de entrega uma única vez (idempotente). */
export async function deliverMagazineEmailOnce(sessionId: string): Promise<void> {
  const r = await fulfillMagazineSession(sessionId);
  if (!r.paid || !r.purchase || !r.magazine || r.purchase.download_sent || !r.magazine.pdf_path) return;

  const signed = await signedPdfUrl(r.magazine.pdf_path);
  if (!signed) return;

  // Anexa o PDF se for pequeno (< 8 MB); senão, o botão usa o link seguro.
  let attachment: { filename: string; content: Buffer } | null = null;
  try {
    const res = await fetch(signed);
    const len = Number(res.headers.get("content-length") || "0");
    if (res.ok && len > 0 && len < 8_000_000) {
      attachment = { filename: `${r.magazine.slug}.pdf`, content: Buffer.from(await res.arrayBuffer()) };
    }
  } catch {
    /* segue sem anexo */
  }

  const sent = await sendMagazineDeliveryEmail({
    to: r.email,
    name: r.name,
    magazineTitle: r.magazine.title,
    edition: r.magazine.edition,
    amount: r.amount,
    downloadUrl: signed,
    orderUrl: `${SITE_URL}/revista/download/${sessionId}`,
    attachment,
  });
  if (sent) {
    await supabaseAdmin.from("magazine_purchases").update({ download_sent: true }).eq("id", r.purchase.id);
  }
}
