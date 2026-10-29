import { createClient } from "@supabase/supabase-js";
import { getFeedCategory } from "@/lib/categories";
import { ARTICLE_LIST_COLUMNS } from "@/lib/articleFields";

/**
 * Busca, no servidor, as matérias de uma categoria (para SSR/SEO).
 * Retorna [] se a categoria não existir ou faltar configuração.
 */
export async function getCategoryArticles(slug: string, limit = 20) {
  const cat = getFeedCategory(slug);
  if (!cat) return [];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_LIST_COLUMNS)
    .eq("status", "publicado")
    .ilike("category", cat.filter)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
}
