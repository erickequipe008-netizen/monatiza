import { supabase } from "@/lib/supabase/client";
import { ARTICLE_LIST_COLUMNS } from "@/lib/articleFields";

// Tipo leve de matéria para os cards/listagens do ambiente premium.
export interface ArticleCard {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  description?: string | null;
  image_url?: string | null;
  image?: string | null;
  category?: string | null;
  created_at?: string | null;
  journalist_name?: string | null;
  author?: string | null;
  is_premium?: boolean | null;
}

// Últimas matérias publicadas (suporta paginação por cursor "before").
export async function fetchLatest(limit = 24, before?: string | null): Promise<ArticleCard[]> {
  let q = supabase
    .from("articles")
    .select(ARTICLE_LIST_COLUMNS)
    .eq("status", "publicado")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (before) q = q.lt("created_at", before);
  const { data } = await q;
  return (data as ArticleCard[]) || [];
}

// Conteúdo exclusivo (matérias premium).
export async function fetchPremium(limit = 18): Promise<ArticleCard[]> {
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_LIST_COLUMNS)
    .eq("status", "publicado")
    .eq("is_premium", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as ArticleCard[]) || [];
}

// Matérias de uma categoria (ilike), ex.: "%Revista%".
export async function fetchByCategory(filter: string, limit = 24): Promise<ArticleCard[]> {
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_LIST_COLUMNS)
    .eq("status", "publicado")
    .ilike("category", filter)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as ArticleCard[]) || [];
}

// Uma matéria pelo slug (sem o corpo).
export async function fetchArticleBySlug(slug: string): Promise<ArticleCard | null> {
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_LIST_COLUMNS)
    .eq("slug", slug)
    .eq("status", "publicado")
    .maybeSingle();
  return (data as ArticleCard) || null;
}

// Corpo da matéria com paywall aplicado no servidor (assinante/staff destrava).
export async function fetchArticleBody(slug: string): Promise<string | null> {
  const { data } = await supabase.rpc("get_article_body", { p_slug: slug });
  return (data as string | null) ?? null;
}
