import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditClient from "./EditClient";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) return notFound();

  return <EditClient article={article} />;
}