import { createClient } from "@supabase/supabase-js";
import NegociosClient from "./NegociosClient";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export const metadata = {
  title: "Negócios",
  description:
    "Notícias de negócios, empresas, economia e estratégia corporativa no Brasil e no mundo.",
  alternates: { canonical: `${SITE_URL}/negocios` },
};

async function getArticles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "publicado")
    .ilike("category", "%Negócios%")
    .order("created_at", { ascending: false })
    .limit(20);
  return data || [];
}

export default async function NegociosPage() {
  const initialArticles = await getArticles();
  return <NegociosClient initialArticles={initialArticles} />;
}
