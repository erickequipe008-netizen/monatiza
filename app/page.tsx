import { createClient } from "@supabase/supabase-js";
import HomeClient from "@/components/home/HomeClient";
import { SITE_URL, SITE_NAME, SITE_LOGO } from "@/lib/seo";
import { ARTICLE_LIST_COLUMNS } from "@/lib/articleFields";
import type { MagazinePublic } from "@/types/magazine";
import type { CommercialAdData } from "@/components/home/CommercialAd";

export const revalidate = 300;

async function getArticles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  const supabase = createClient(url, key);

  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_LIST_COLUMNS)
    .eq("status", "publicado")
    .order("created_at", { ascending: false })
    .limit(40);

  return data || [];
}

async function getCategoryArticles(category: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  const supabase = createClient(url, key);

  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_LIST_COLUMNS)
    .eq("status", "publicado")
    .ilike("category", `%${category}%`)
    .order("created_at", { ascending: false })
    .limit(7);

  return data || [];
}

async function getMagazines(): Promise<MagazinePublic[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  const supabase = createClient(url, key);

  const { data } = await supabase
    .from("magazines")
    .select(
      "id, slug, title, subtitle, description, edition, category, price, cover_url, published, created_at, updated_at"
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (data || []) as MagazinePublic[];
}

async function getCommercialAds(): Promise<CommercialAdData[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from("commercial_ads")
    .select(
      "id, position, name, desktop_image_url, mobile_image_url, target_url, active"
    )
    .eq("active", true)
    .order("position", { ascending: true });

  if (error) {
    console.error("Erro ao carregar publicidade:", error);
    return [];
  }

  return (data || []) as CommercialAdData[];
}

export default async function Home() {
  const [
    articles,
    magazines,
    commercialAds,
    negociosArticles,
    iaArticles,
    mercadoArticles,
    brasilArticles,
    politicaArticles,
    tecnologiaArticles,
    empreendeArticles,
    startupsArticles,
    carreiraArticles,
    saudeArticles,
  ] = await Promise.all([
    getArticles(),
    getMagazines(),
    getCommercialAds(),
    getCategoryArticles("Negócios"),
    getCategoryArticles("IA"),
    getCategoryArticles("Mercado"),
    getCategoryArticles("Brasil"),
    getCategoryArticles("Política"),
    getCategoryArticles("Tecnologia"),
    getCategoryArticles("Empreende"),
    getCategoryArticles("Startups"),
    getCategoryArticles("Carreira"),
    getCategoryArticles("Saúde"),
  ]);

  const commercialAd1 =
    commercialAds.find((ad) => ad.position === 1) || null;

  const commercialAd2 =
    commercialAds.find((ad) => ad.position === 2) || null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: SITE_LOGO,
          width: 1200,
          height: 630,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        inLanguage: "pt-BR",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/busca?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <HomeClient
        initialArticles={articles}
        initialMagazines={magazines}
        initialCommercialAd1={commercialAd1}
        initialCommercialAd2={commercialAd2}
        initialNegociosArticles={negociosArticles}
        initialIaArticles={iaArticles}
        initialMercadoArticles={mercadoArticles}
        initialBrasilArticles={brasilArticles}
        initialPoliticaArticles={politicaArticles}
        initialTecnologiaArticles={tecnologiaArticles}
        initialEmpreendeArticles={empreendeArticles}
        initialStartupsArticles={startupsArticles}
        initialCarreiraArticles={carreiraArticles}
        initialSaudeArticles={saudeArticles}
      />
    </>
  );
}