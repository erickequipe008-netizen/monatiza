// app/noticia/[slug]/page.tsx
import { supabase } from "@/lib/supabase/client";
import ArticleClient from "./ArticleClient";
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const { data: article } = await supabase
    .from("articles")
    .select("title, excerpt, description, image_url, category, slug")
    .eq("slug", params.slug)
    .single();

  if (!article) {
    return { title: "Artigo não encontrado" };
  }

  const desc = article.description || article.excerpt || "";

  return {
    // O layout.tsx tem template: "%s | Monatiza"
    // então isso vira automaticamente "Título do Artigo | Monatiza" na aba
    title: article.title,
    description: desc,
    keywords: [article.category, "Monatiza", "IA", "Tecnologia", "Negócios", article.title],

    openGraph: {
      title: article.title,
      description: desc,
      url: `https://monatiza.com/noticia/${article.slug}`,
      siteName: "Monatiza",
      images: [{ url: article.image_url, width: 1200, height: 630, alt: article.title }],
      locale: "pt_BR",
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: desc,
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