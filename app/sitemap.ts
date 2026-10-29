import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL, toISO } from "@/lib/seo";

export const revalidate = 3600;

// Páginas fixas / editorias do portal.
const STATIC_PATHS = [
  "",
  "/negocios",
  "/ia",
  "/mercado",
  "/brasil",
  "/politica",
  "/tech",
  "/empreende",
  "/startups",
  "/carreira",
  "/saude",
  "/revista",
  "/about",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const staticUrls: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "hourly" : "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  if (!supabaseUrl || !supabaseKey) return staticUrls;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, created_at")
    .eq("status", "publicado")
    .order("created_at", { ascending: false })
    .limit(5000);

  const articleUrls: MetadataRoute.Sitemap = (articles || [])
    .filter((a) => a.slug)
    .map((article) => ({
      url: `${SITE_URL}/noticia/${article.slug}`,
      lastModified: new Date(toISO(article.created_at)),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return [...staticUrls, ...articleUrls];
}
