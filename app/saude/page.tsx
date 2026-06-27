import CategoryFeed from "@/components/CategoryFeed";
import { getCategoryArticles } from "@/lib/feed";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export const metadata = {
  title: "Saúde",
  description: "Saúde, bem-estar, medicina e ciência para viver melhor.",
  alternates: { canonical: `${SITE_URL}/saude` },
};

export default async function SaudePage() {
  const initialArticles = await getCategoryArticles("saude");
  return <CategoryFeed slug="saude" initialArticles={initialArticles} />;
}
