import CategoryFeed from "@/components/CategoryFeed";
import { getCategoryArticles } from "@/lib/feed";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export const metadata = {
  title: "Startups",
  description:
    "Startups, venture capital, fundadores e o ecossistema de inovação.",
  alternates: { canonical: `${SITE_URL}/startups` },
};

export default async function StartupsPage() {
  const initialArticles = await getCategoryArticles("startups");
  return <CategoryFeed slug="startups" initialArticles={initialArticles} />;
}
