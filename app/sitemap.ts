import { createClient } from "@supabase/supabase-js";

export default async function sitemap() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [
      {
        url: "https://monatiza.com",
        lastModified: new Date(),
      },
    ];
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseKey
  );

  const { data: articles } =
    await supabase
      .from("articles")
      .select("slug, created_at");

  const articleUrls =
    articles?.map((article) => ({
      url: `https://monatiza.com/noticia/${article.slug}`,

      // CORREÇÃO
      lastModified: article.created_at
        ? new Date(article.created_at)
        : new Date(),
    })) || [];

  return [
    {
      url: "https://monatiza.com",
      lastModified: new Date(),
    },

    ...articleUrls,
  ];
}