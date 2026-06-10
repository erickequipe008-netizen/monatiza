import { createClient } from "@supabase/supabase-js";

export default async function sitemap() {

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // evita quebrar build
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