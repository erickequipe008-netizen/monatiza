import CategoryFeed from "@/components/CategoryFeed";

export const metadata = {
  title: "Brasil",
  description: "Últimas notícias do Brasil — política, economia e os fatos que definem o país.",
};

export default function BrasilPage() {
  return <CategoryFeed slug="brasil" />;
}
