import { createClient } from "@supabase/supabase-js";
import { ARTICLE_LIST_COLUMNS } from "@/lib/articleFields";
import IAClient from "./IAClient";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export const metadata = {
  title: "Inteligência Artificial",
  description:
    "Notícias de IA: OpenAI, Claude, Gemini, modelos abertos, agentes e tendências.",
  alternates: { canonical: `${SITE_URL}/ia` },
};

async function getArticles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_LIST_COLUMNS)
    .eq("status", "publicado")
    .ilike("category", "%IA%")
    .order("created_at", { ascending: false })
    .limit(20);
  return data || [];
}

export default async function IAPage() {
  const initialArticles = await getArticles();
  return <IAClient initialArticles={initialArticles} />;
}
