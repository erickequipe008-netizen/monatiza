// Helpers de servidor da loja de revistas. Usa a service role — NUNCA
// importar em componentes client. O PDF fica sempre privado; o acesso é
// só por Signed URL de curta duração gerada aqui.
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Magazine, MagazinePublic, MagazinePurchase } from "@/types/magazine";

/** Validade da Signed URL de download: 15 minutos. */
export const SIGNED_URL_TTL = 60 * 15;

const PUBLIC_COLS =
  "id, slug, title, subtitle, description, edition, category, price, cover_url, published, created_at, updated_at";

/** Catálogo público — apenas revistas publicadas, mais recentes primeiro. */
export async function listPublishedMagazines(): Promise<MagazinePublic[]> {
  const { data } = await supabaseAdmin
    .from("magazines")
    .select(PUBLIC_COLS)
    .eq("published", true)
    .order("created_at", { ascending: false });
  return (data ?? []) as MagazinePublic[];
}

/** Detalhe público por slug (só publicada). */
export async function getPublicMagazineBySlug(slug: string): Promise<MagazinePublic | null> {
  const { data } = await supabaseAdmin
    .from("magazines")
    .select(PUBLIC_COLS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as MagazinePublic) ?? null;
}

/** Revista completa por id (inclui pdf_path) — uso interno/servidor. */
export async function getMagazineById(id: string): Promise<Magazine | null> {
  const { data } = await supabaseAdmin.from("magazines").select("*").eq("id", id).maybeSingle();
  return (data as Magazine) ?? null;
}

/** Pedido por sessão do Stripe. */
export async function getPurchaseBySession(sessionId: string): Promise<MagazinePurchase | null> {
  const { data } = await supabaseAdmin
    .from("magazine_purchases")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  return (data as MagazinePurchase) ?? null;
}

/** Gera uma Signed URL temporária para o PDF privado (15 min por padrão). */
export async function signedPdfUrl(pdfPath: string, ttl = SIGNED_URL_TTL): Promise<string | null> {
  const { data } = await supabaseAdmin.storage.from("magazine-pdfs").createSignedUrl(pdfPath, ttl, {
    download: true,
  });
  return data?.signedUrl ?? null;
}
