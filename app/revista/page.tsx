import CategoryFeed from "@/components/CategoryFeed";
import { getCategoryArticles } from "@/lib/feed";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export const metadata = {
  title: "Revista",
  description:
    "Revista Monatiza — reportagens especiais, perfis e grandes histórias.",
  alternates: { canonical: `${SITE_URL}/revista` },
};

export default async function RevistaPage() {
  const initialArticles = await getCategoryArticles("revista");
  return <CategoryFeed slug="revista" initialArticles={initialArticles} />;
}
