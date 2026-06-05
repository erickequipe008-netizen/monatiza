import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Head({
  params,
}: {
  params: { slug: string };
}) {

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .single();

  const fallbackImage =
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085";

  if (!article) {

    return (
      <>
        <title>Monatiza</title>

        <meta
          name="description"
          content="Portal de notícias, negócios, tecnologia e inteligência artificial."
        />

        <meta property="og:title" content="Monatiza" />

        <meta
          property="og:description"
          content="Portal de notícias, negócios e tecnologia."
        />

        <meta
          property="og:image"
          content={fallbackImage}
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:image"
          content={fallbackImage}
        />
      </>
    );

  }

  const description =
    article.description ||
    article.excerpt ||
    article.content?.slice(0, 150) ||
    "Leia esta matéria na Monatiza.";

  const image =
    article.image_url || fallbackImage;

  return (
    <>
      <title>
        {article.title} | Monatiza
      </title>

      <meta
        name="description"
        content={description}
      />

      {/* OPEN GRAPH */}

      <meta
        property="og:title"
        content={article.title}
      />

      <meta
        property="og:description"
        content={description}
      />

      <meta
        property="og:image"
        content={image}
      />

      <meta
        property="og:type"
        content="article"
      />

      <meta
        property="og:url"
        content={`https://monatiza.com/noticia/${article.slug}`}
      />

      {/* TWITTER */}

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={article.title}
      />

      <meta
        name="twitter:description"
        content={description}
      />

      <meta
        name="twitter:image"
        content={image}
      />
    </>
  );

}