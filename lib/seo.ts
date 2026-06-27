// ─────────────────────────────────────────────────────────────
// Helpers de SEO / Google News
// ─────────────────────────────────────────────────────────────
export const SITE_URL = "https://www.monatiza.com";
export const SITE_NAME = "Monatiza";
export const SITE_LOGO = `${SITE_URL}/opengraph-image`;

/**
 * Normaliza datas do banco para ISO 8601 com fuso (UTC).
 * O campo `created_at` é `timestamp without time zone` e chega como
 * "2026-06-27 14:01:11.925054" (UTC). O Google News e o JSON-LD exigem
 * uma data ISO válida com fuso — por isso trocamos o espaço por "T" e
 * acrescentamos "Z".
 */
export function toISO(dateStr?: string | null): string {
  if (!dateStr) return new Date().toISOString();
  const s = String(dateStr).trim();
  // Já possui fuso (Z ou ±hh:mm)?
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  const normalized = s.replace(" ", "T") + "Z";
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/** Escapa caracteres especiais para uso seguro dentro de XML. */
export function escapeXml(input?: string | null): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type ArticleLike = {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  excerpt?: string | null;
  content?: string | null;
  image_url?: string | null;
  image?: string | null;
  category?: string | null;
  created_at?: string | null;
  journalist_name?: string | null;
  author?: string | null;
};

/** Texto-resumo seguro para descrição (sem HTML). */
export function plainText(input?: string | null, max = 200): string {
  const txt = String(input ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return txt.length > max ? txt.slice(0, max - 1).trimEnd() + "…" : txt;
}

/** Monta o JSON-LD NewsArticle (essencial para o Google News). */
export function newsArticleJsonLd(a: ArticleLike) {
  const url = `${SITE_URL}/noticia/${a.slug}`;
  const image = a.image_url || a.image || SITE_LOGO;
  const published = toISO(a.created_at);
  const authorName =
    a.journalist_name && !String(a.journalist_name).includes("@")
      ? a.journalist_name
      : a.author && !String(a.author).includes("@")
        ? a.author
        : "Redação Monatiza";
  const description =
    plainText(a.description) ||
    plainText(a.excerpt) ||
    plainText(a.content, 200);

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: plainText(a.title, 110),
    description,
    image: [image],
    datePublished: published,
    dateModified: published,
    articleSection: a.category || undefined,
    url,
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: SITE_LOGO, width: 1200, height: 630 },
    },
    inLanguage: "pt-BR",
  };
}
