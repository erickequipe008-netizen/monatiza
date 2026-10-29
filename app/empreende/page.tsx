import CategoryFeed from "@/components/CategoryFeed";
import { getCategoryArticles } from "@/lib/feed";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export const metadata = {
  title: "Empreende",
  description:
    "Empreendedorismo: histórias, táticas e ferramentas para o seu negócio.",
  alternates: { canonical: `${SITE_URL}/empreende` },
};

export default async function EmpreendePage() {
  const initialArticles = await getCategoryArticles("empreende");
  return <CategoryFeed slug="empreende" initialArticles={initialArticles} />;
}
