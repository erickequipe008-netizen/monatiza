import CategoryFeed from "@/components/CategoryFeed";

export const metadata = {
  title: "Tech",
  description: "Tecnologia, inovação, gadgets, software e transformação digital.",
};

export default function TechPage() {
  return <CategoryFeed slug="tech" />;
}
