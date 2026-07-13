import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getMagazineById, signedPdfUrl } from "@/lib/magazines";
import { isActiveSub } from "@/lib/premium/access";

export const dynamic = "force-dynamic";

/**
 * Download da revista para ASSINANTE ativo (grátis, sem compra).
 * Valida o token do usuário, confirma assinatura ativa e devolve uma
 * Signed URL do PDF (expira em 15 min). O PDF nunca é exposto direto.
 */
export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Faça login para acessar." }, { status: 401 });

  // Valida o token e identifica o usuário.
  const authed = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
  );
  const {
    data: { user },
  } = await authed.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });

  // Confirma assinatura ativa (service role, mesma regra do is_active_subscriber).
  const { data: sub } = await supabaseAdmin
    .from("subscribers")
    .select("status, current_period_end")
    .eq("id", user.id)
    .maybeSingle();

  if (!isActiveSub(sub?.status, sub?.current_period_end)) {
    return NextResponse.json({ error: "Assinatura ativa necessária." }, { status: 403 });
  }

  const { magazineId } = (await req.json().catch(() => ({}))) as { magazineId?: string };
  if (!magazineId) return NextResponse.json({ error: "Revista não informada." }, { status: 400 });

  const mag = await getMagazineById(magazineId);
  if (!mag || !mag.pdf_path) {
    return NextResponse.json({ error: "Revista indisponível." }, { status: 404 });
  }

  const url = await signedPdfUrl(mag.pdf_path);
  if (!url) return NextResponse.json({ error: "Não foi possível gerar o download." }, { status: 500 });

  return NextResponse.json({ url });
}
