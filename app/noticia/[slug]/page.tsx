
import { supabase } from "@/lib/supabase/client";
import ArticleClient from "./ArticleClient";

export async function generateMetadata({ params }: any) {

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!article) {
    return {
      title: "Matéria | Monatiza",
    };
  }

  return {
    title: `${article.title} | Monatiza`,
    description:
      article.description || article.excerpt,

    keywords: [
      article.category,
      "Monatiza",
      "IA",
      "Tecnologia",
      "Negócios",
      article.title,
    ],

    openGraph: {
      title: article.title,
      description:
        article.description || article.excerpt,

      url: `https://monatiza.com/noticia/${article.slug}`,

      siteName: "Monatiza",

      images: [
        {
          url: article.image_url,
          width: 1200,
          height: 630,
        },
      ],

      locale: "pt_BR",
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title: article.title,
      description:
        article.description || article.excerpt,

      images: [article.image_url],
    },

    alternates: {
      canonical: `https://monatiza.com/noticia/${article.slug}`,
    },
  };
}

export default function Page() {
  return <ArticleClient />;
}

