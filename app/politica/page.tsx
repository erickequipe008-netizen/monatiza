import CategoryFeed from "@/components/CategoryFeed";

export const metadata = {
  title: "Política",
  description: "Política, Congresso, governo e as decisões que afetam o país.",
};

export default function PoliticaPage() {
  return <CategoryFeed slug="politica" />;
}
