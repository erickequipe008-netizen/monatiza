import CategoryFeed from "@/components/CategoryFeed";
import { getCategoryArticles } from "@/lib/feed";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export const metadata = {
  title: "Brasil",
  description:
    "Últimas notícias do Brasil — política, economia e os fatos que definem o país.",
  alternates: { canonical: `${SITE_URL}/brasil` },
};

export default async function BrasilPage() {
  const initialArticles = await getCategoryArticles("brasil");
  return <CategoryFeed slug="brasil" initialArticles={initialArticles} />;
}
