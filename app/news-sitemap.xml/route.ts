import { supabase } from "@/lib/supabase/client";

export async function GET() {
  const { data } = await supabase
    .from("articles")
    .select("slug, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const urls = (data || [])
    .map(
      (article) => `
<url>
  <loc>https://monatiza.com/noticia/${article.slug}</loc>
  <news:news>
    <news:publication>
      <news:name>Monatiza</news:name>
      <news:language>pt-BR</news:language>
    </news:publication>
    <news:publication_date>${article.created_at}</news:publication_date>
  </news:news>
</url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}