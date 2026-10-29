import CategoryFeed from "@/components/CategoryFeed";
import { getCategoryArticles } from "@/lib/feed";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export const metadata = {
  title: "Tech",
  description: "Tecnologia, inovação, gadgets, software e transformação digital.",
  alternates: { canonical: `${SITE_URL}/tech` },
};

export default async function TechPage() {
  const initialArticles = await getCategoryArticles("tech");
  return <CategoryFeed slug="tech" initialArticles={initialArticles} />;
}
