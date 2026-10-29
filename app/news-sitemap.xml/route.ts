import { supabase } from "@/lib/supabase/client";
import { SITE_URL, SITE_NAME, escapeXml, toISO } from "@/lib/seo";

// Revalida no servidor a cada 15 min (Google News busca com frequência).
export const revalidate = 900;

export async function GET() {
  // Google News indexa apenas matérias dos últimos 2 dias.
  const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();

  const cols = "slug, title, created_at";
  let { data } = await supabase
    .from("articles")
    .select(cols)
    .eq("status", "publicado")
    .gte("created_at", twoDaysAgo)
    .order("created_at", { ascending: false })
    .limit(1000);

  // Se não houver matéria nas últimas 48h, o sitemap ficaria VAZIO — e um
  // news sitemap vazio dá erro no Search Console ("0 páginas / tag XML
  // ausente"). Então caímos nas mais recentes dos últimos 30 dias.
  if (!data || data.length === 0) {
    const thirtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
    const fallback = await supabase
      .from("articles")
      .select(cols)
      .eq("status", "publicado")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false })
      .limit(20);
    data = fallback.data;
  }

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
