import CategoryFeed from "@/components/CategoryFeed";

export const metadata = {
  title: "Empreende",
  description: "Empreendedorismo: histórias, táticas e ferramentas para o seu negócio.",
};

export default function EmpreendePage() {
  return <CategoryFeed slug="empreende" />;
}
