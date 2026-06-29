// app/noticia/[slug]/page.tsx
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleClient from "./ArticleClient";
import { SITE_URL, newsArticleJsonLd, plainText, toISO } from "@/lib/seo";
import { ARTICLE_LIST_COLUMNS } from "@/lib/articleFields";

// ISR: a página é gerada no servidor e revalidada a cada 5 min.
export const revalidate = 300;

// Cliente criado inline — roda no servidor sem depender do singleton do client.
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getArticle(slug: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_LIST_COLUMNS)
    .eq("slug", slug)
    .eq("status", "publicado")
    .single();
  return data;
}

// Corpo da matéria com paywall aplicado no servidor.
// Anônimo: recebe o corpo das matérias grátis; nas premium recebe null
// (→ a página mostra a prévia + paywall). Assinante/staff destravam.
async function getArticleBody(slug: string): Promise<string | null> {
  const supabase = getSupabase();
  const { data } = await supabase.rpc("get_article_body", { p_slug: slug });
  return (data as string | null) ?? null;
}

// Prévia (teaser) das matérias premium para o visitante: primeiros caracteres.
async function getArticlePreview(slug: string): Promise<string | null> {
  const supabase = getSupabase();
  const { data } = await supabase.rpc("get_article_preview", { p_slug: slug, p_chars: 800 });
  return (data as string | null) ?? null;
}

async function getRelated(category: string, slug: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("articles")
    .select("id, title, slug, category, image_url, created_at, excerpt, is_premium")
    .eq("category", category)
    .eq("status", "publicado")
    .neq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(4);
  return data || [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Matéria não encontrada | Monatiza" };
  }

  const desc =
    plainText(article.description) ||
    plainText(article.excerpt) ||
    "";
  const image = article.image_url || article.image || `${SITE_URL}/opengraph-image`;
  const url = `${SITE_URL}/noticia/${article.slug}`;

  return {
    title: article.title,
    description: desc,
    keywords: [
      article.category,
      "Monatiza",
      "IA",
      "Tecnologia",
      "Negócios",
      article.title,
    ].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: desc,
      url,
      siteName: "Monatiza",
      images: [{ url: image, width: 1200, height: 630, alt: article.title }],
      locale: "pt_BR",
      type: "article",
      publishedTime: toISO(article.created_at),
      section: article.category || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: desc,
      images: [image],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const [related, body] = await Promise.all([
    getRelated(article.category, slug),
    getArticleBody(slug),
  ]);

  // Premium + sem corpo (visitante anônimo no SSR) → mostra prévia + paywall.
  const locked = !!article.is_premium && !body;
  const preview = locked ? await getArticlePreview(slug) : null;

  // Para o Google: matéria premium é marcada como conteúdo de assinante.
  const jsonLd = {
    ...newsArticleJsonLd(article),
    ...(article.is_premium
      ? {
          isAccessibleForFree: false,
          hasPart: {
            "@type": "WebPageElement",
            isAccessibleForFree: false,
            cssSelector: ".article-body",
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleClient article={article} related={related} body={body} locked={locked} preview={preview} />
    </>
  );
}
