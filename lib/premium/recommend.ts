import { supabase } from "@/lib/supabase/client";
import { ARTICLE_LIST_COLUMNS } from "@/lib/articleFields";
import { getStats } from "@/lib/premium/library";
import { fetchPremium, fetchLatest, type ArticleCard } from "@/lib/premium/articles";

/**
 * "Recomendado para você" — algoritmo simples baseado nas categorias mais
 * lidas pelo assinante (histórico). Sem histórico ainda, cai para o conteúdo
 * exclusivo e as últimas matérias.
 */
export async function getRecommended(limit = 6): Promise<ArticleCard[]> {
  const stats = await getStats();
  const cats = stats.topCategories.map((c) => c.category);

  if (cats.length === 0) {
    const prem = await fetchPremium(limit);
    if (prem.length >= limit) return prem;
    const latest = await fetchLatest(limit * 2);
    const merged = [...prem, ...latest.filter((l) => !prem.some((p) => p.id === l.id))];
    return merged.slice(0, limit);
  }

  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_LIST_COLUMNS)
    .eq("status", "publicado")
    .in("category", cats)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as ArticleCard[]) || [];
}
