import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Abre o portal de cobrança do Stripe para o assinante gerenciar/cancelar a assinatura.
export async function POST(req: Request) {
  try {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !userData.user) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }

    const { data: sub } = await supabaseAdmin
      .from("subscribers")
      .select("stripe_customer_id")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: "Nenhuma assinatura encontrada" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.monatiza.com";
    const portal = await getStripe().billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/painel`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao abrir o portal";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
