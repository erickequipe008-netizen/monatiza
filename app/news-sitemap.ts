
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function newsSitemap() {

  const { data: articles } = await supabase
    .from("articles")
    .select("slug, title, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return articles?.map((article) => ({
    url: `https://monatiza.com/noticia/${article.slug}`,
    title: article.title,
    publishedAt: article.created_at,
  })) || [];
}

