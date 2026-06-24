import CategoryFeed from "@/components/CategoryFeed";

export const metadata = {
  title: "Saúde",
  description: "Saúde, bem-estar, medicina e ciência para viver melhor.",
};

export default function SaudePage() {
  return <CategoryFeed slug="saude" />;
}
