import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function sitemap() {
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, created_at");

  const articleUrls =
    articles?.map((article) => ({
      url: `https://monatiza.com/noticia/${article.slug}`,
      lastModified: article.created_at,
    })) || [];

  return [
    {
      url: "https://monatiza.com",
      lastModified: new Date(),
    },

    ...articleUrls,
  ];
}