import { createClient } from "@supabase/supabase-js";
import MercadoClient from "./MercadoClient";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export const metadata = {
  title: "Mercado",
  description:
    "Mercado financeiro: bolsa, ações, câmbio, juros e os movimentos que mexem com o seu dinheiro.",
  alternates: { canonical: `${SITE_URL}/mercado` },
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
    .ilike("category", "%Mercado%")
    .order("created_at", { ascending: false })
    .limit(20);
  return data || [];
}

export default async function MercadoPage() {
  const initialArticles = await getArticles();
  return <MercadoClient initialArticles={initialArticles} />;
}
