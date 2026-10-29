import CategoryFeed from "@/components/CategoryFeed";
import { getCategoryArticles } from "@/lib/feed";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export const metadata = {
  title: "Política",
  description: "Política, Congresso, governo e as decisões que afetam o país.",
  alternates: { canonical: `${SITE_URL}/politica` },
};

export default async function PoliticaPage() {
  const initialArticles = await getCategoryArticles("politica");
  return <CategoryFeed slug="politica" initialArticles={initialArticles} />;
}
