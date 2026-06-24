import CategoryFeed from "@/components/CategoryFeed";

export const metadata = {
  title: "Startups",
  description: "Startups, venture capital, fundadores e o ecossistema de inovação.",
};

export default function StartupsPage() {
  return <CategoryFeed slug="startups" />;
}
