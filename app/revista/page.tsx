import CategoryFeed from "@/components/CategoryFeed";

export const metadata = {
  title: "Revista",
  description: "Revista Monatiza — reportagens especiais, perfis e grandes histórias.",
};

export default function RevistaPage() {
  return <CategoryFeed slug="revista" />;
}
