import { supabase } from "@/lib/supabase/client";
import { SITE_URL, SITE_NAME, escapeXml, toISO } from "@/lib/seo";

// Revalida no servidor a cada 15 min (Google News busca com frequência).
export const revalidate = 900;

export async function GET() {
  // Google News indexa apenas matérias dos últimos 2 dias.
  const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();

  const { data } = await supabase
    .from("articles")
    .select("slug, title, created_at")
    .eq("status", "publicado")
    .gte("created_at", twoDaysAgo)
    .order("created_at", { ascending: false })
    .limit(1000);

  const urls = (data || [])
    .filter((a) => a.slug)
    .map(
      (article) => `
  <url>
    <loc>${escapeXml(`${SITE_URL}/noticia/${article.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${SITE_NAME}</news:name>
        <news:language>pt-BR</news:language>
      </news:publication>
      <news:publication_date>${toISO(article.created_at)}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=1800",
    },
  });
}
