import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { COLUMNIST_PLANS } from "@/lib/columnist";
import { resend } from "@/lib/resend";

export const runtime = "nodejs";

// E-mail privado de boas-vindas do colunista com as orientações de acesso ao painel.
async function sendColumnistWelcomeEmail(userId: string, plan: number) {
  try {
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(userId);
    const email = u?.user?.email;
    if (!email) return;
    const cfg = COLUMNIST_PLANS[plan];
    await resend.emails.send({
      from: "Monatiza <contato@monatiza.com>",
      to: email,
      subject: "Seu acesso de colunista está liberado",
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
          <h2 style="margin:0 0 8px">Bem-vindo(a) ao programa de colunistas</h2>
          <p style="color:#555;margin:0 0 16px">Seu pagamento foi confirmado e o seu painel de colunista já está liberado${cfg ? ` no ${cfg.name}` : ""}.</p>
          <p style="margin:0 0 6px"><b>Como acessar:</b></p>
          <p style="color:#555;margin:0 0 16px">Entre em <a href="https://www.monatiza.com/login" style="color:#E0263B">www.monatiza.com/login</a> com este e-mail. Se a sua conta foi criada agora no cadastro de colunista, a senha inicial são os <b>6 últimos dígitos do telefone informado</b> no formulário. Por segurança, recomendamos trocá-la na aba <b>Perfil</b> do painel assim que entrar.</p>
          <a href="https://www.monatiza.com/dashboard" style="display:inline-block;background:#0b0b0c;color:#fff;text-decoration:none;font-weight:700;border-radius:10px;padding:12px 22px">Acessar meu painel</a>
          <p style="color:#888;font-size:13px;margin:20px 0 0">Dúvidas? Fale com a Redação: contato@monatiza.com</p>
        </div>`,
    });
  } catch {
    // e-mail é cortesia — não bloqueia a ativação
  }
}

// Libera os créditos mensais do plano de colunista e registra a transação.
async function grantColumnistCredits(userId: string, plan: number, paymentRef: string, amountPaid: number) {
  const cfg = COLUMNIST_PLANS[plan];
  if (!cfg) return;
  // idempotência: o Stripe reenvia eventos (e invoice.paid + invoice.payment_succeeded duplicam)
  const { data: existing } = await supabaseAdmin
    .from("credit_transactions")
    .select("id")
    .eq("stripe_payment_id", paymentRef)
    .maybeSingle();
  if (existing) return;
  await supabaseAdmin.rpc("add_journalist_credits", { p_journalist: userId, p_credits: cfg.credits });
  await supabaseAdmin.from("credit_transactions").insert({
    journalist_id: userId,
    stripe_payment_id: paymentRef,
    amount_paid: amountPaid,
    credits_added: cfg.credits,
    status: "concluido",
  });
  await supabaseAdmin
    .from("columnist_plans")
    .update({ last_credited_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("user_id", userId);
}

// invoice.subscription mudou de lugar conforme a versão da API; lê com segurança.
function invoiceSubscriptionId(inv: Stripe.Invoice): string | null {
  const direct = (inv as unknown as { subscription?: string | { id: string } }).subscription;
  if (typeof direct === "string") return direct;
  if (direct && typeof direct === "object") return direct.id;
  const parent = (inv as unknown as { parent?: { subscription_details?: { subscription?: string | { id: string } } } })
    .parent?.subscription_details?.subscription;
  if (typeof parent === "string") return parent;
  if (parent && typeof parent === "object") return parent.id;
  return null;
}

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
      } else if (userId && session.metadata?.type === "columnist") {
        // assinatura do plano de colunista: ativa o plano e libera os créditos do 1º mês
        const plan = parseInt(session.metadata.plan || "0", 10);
        const cfg = COLUMNIST_PLANS[plan];
        if (cfg) {
          await supabaseAdmin
            .from("columnist_plans")
            .update({
              status: "active",
              plan: cfg.id,
              monthly_credits: cfg.credits,
              stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
              stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
          await grantColumnistCredits(userId, plan, session.id, (session.amount_total ?? 0) / 100);
          await sendColumnistWelcomeEmail(userId, plan);
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
    } else if (event.type === "invoice.paid" || event.type === "invoice.payment_succeeded") {
      // Renovação mensal do plano de colunista → recarrega os créditos do mês.
      const inv = event.data.object as Stripe.Invoice;
      if (inv.billing_reason === "subscription_cycle") {
        const subId = invoiceSubscriptionId(inv);
        if (subId) {
          const sub = await getStripe().subscriptions.retrieve(subId);
          if (sub.metadata?.type === "columnist" && sub.metadata.user_id) {
            const plan = parseInt(sub.metadata.plan || "0", 10);
            await grantColumnistCredits(
              sub.metadata.user_id,
              plan,
              inv.id ?? subId,
              (inv.amount_paid ?? 0) / 100
            );
          }
        }
      }
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;

      // Plano de colunista: acompanha o status da assinatura (cancelou → perde a recarga mensal).
      if (sub.metadata?.type === "columnist") {
        const status =
          event.type === "customer.subscription.deleted"
            ? "canceled"
            : sub.status === "active" || sub.status === "trialing"
              ? "active"
              : sub.status === "past_due" || sub.status === "unpaid"
                ? "past_due"
                : "canceled";
        await supabaseAdmin
          .from("columnist_plans")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", sub.id);
        return NextResponse.json({ received: true });
      }

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
