// app/noticia/[slug]/page.tsx
import { createClient } from "@supabase/supabase-js";
import ArticleClient from "./ArticleClient";
import type { Metadata } from "next";

// Cliente criado inline — garante que roda no servidor sem depender do client-side singleton
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const supabase = getSupabase();

  const { data: article, error } = await supabase
    .from("articles")
    .select("title, excerpt, description, image_url, category, slug")
    .eq("slug", params.slug)
    .single();

  if (error || !article) {
    return { title: "Monatiza" };
  }

  const desc = article.description || article.excerpt || "";

  return {
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