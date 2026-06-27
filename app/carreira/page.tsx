import CategoryFeed from "@/components/CategoryFeed";
import { getCategoryArticles } from "@/lib/feed";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export const metadata = {
  title: "Carreira",
  description:
    "Carreira, liderança, mercado de trabalho e crescimento profissional.",
  alternates: { canonical: `${SITE_URL}/carreira` },
};

export default async function CarreiraPage() {
  const initialArticles = await getCategoryArticles("carreira");
  return <CategoryFeed slug="carreira" initialArticles={initialArticles} />;
}
