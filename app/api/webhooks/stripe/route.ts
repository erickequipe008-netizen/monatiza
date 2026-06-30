import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// current_period_end pode estar em locais diferentes conforme a versão da API; lê com segurança.
function periodEnd(sub: Stripe.Subscription): string | null {
  const v = (sub as unknown as { current_period_end?: number }).current_period_end;
  return typeof v === "number" ? new Date(v * 1000).toISOString() : null;
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Webhook do Stripe não configurado" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const raw = await req.text(); // corpo cru é necessário para validar a assinatura
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "assinatura inválida";
    return NextResponse.json({ error: `Webhook inválido: ${msg}` }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || (session.metadata?.user_id ?? null);

      if (userId && session.metadata?.type === "credits") {
        // compra de créditos BrandVoice
        const credits = parseInt(session.metadata.credits || "0", 10);
        if (credits > 0) {
          await supabaseAdmin.rpc("add_journalist_credits", { p_journalist: userId, p_credits: credits });
          await supabaseAdmin.from("credit_transactions").insert({
            journalist_id: userId,
            stripe_payment_id: typeof session.payment_intent === "string" ? session.payment_intent : session.id,
            amount_paid: (session.amount_total ?? 0) / 100,
            credits_added: credits,
            status: "concluido",
          });
        }
      } else if (userId && session.metadata?.type === "verification") {
        // pagamento do selo de verificado → marca o pedido como pago (análise manual)
        await supabaseAdmin
          .from("verification_requests")
          .update({
            status: "paid",
            stripe_payment_id:
              typeof session.payment_intent === "string" ? session.payment_intent : session.id,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      } else if (userId) {
        // assinatura
        await supabaseAdmin
          .from("subscribers")
          .update({
            status: "active",
            stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
            stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;

      // Assinatura do SELO de verificado: ao cancelar/expirar, remove o selo.
      if (sub.metadata?.type === "verification") {
        const uid = sub.metadata.user_id;
        const active = sub.status === "active" || sub.status === "trialing";
        if (uid && !active) {
          await supabaseAdmin
            .from("community_profiles")
            .update({ verified: false, updated_at: new Date().toISOString() })
            .eq("user_id", uid);
          await supabaseAdmin
            .from("verification_requests")
            .update({ status: "canceled", updated_at: new Date().toISOString() })
            .eq("user_id", uid);
        }
        return NextResponse.json({ received: true });
      }

      const status =
        event.type === "customer.subscription.deleted"
          ? "canceled"
          : sub.status === "active" || sub.status === "trialing"
            ? "active"
            : sub.status === "past_due" || sub.status === "unpaid"
              ? "past_due"
              : "canceled";

      await supabaseAdmin
        .from("subscribers")
        .update({
          status,
          current_period_end: periodEnd(sub),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", sub.id);
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erro";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
