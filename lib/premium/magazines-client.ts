import { supabase } from "@/lib/supabase/client";
import type { MagazinePublic } from "@/types/magazine";

/** Colunas públicas — nunca inclui pdf_path (bucket privado). */
const PUBLIC_COLS =
  "id, slug, title, subtitle, description, edition, category, price, cover_url, published, created_at, updated_at";

/** Revistas publicadas para o ambiente premium (leitura via RLS mag_public_read). */
export async function fetchPublishedMagazines(limit = 48): Promise<MagazinePublic[]> {
  const { data } = await supabase
    .from("magazines")
    .select(PUBLIC_COLS)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as MagazinePublic[]) || [];
}
