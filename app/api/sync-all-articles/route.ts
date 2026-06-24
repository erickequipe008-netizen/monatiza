import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { qdrant } from "@/services/qdrant";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: articles, error } = await supabase
      .from("articles")
      .select("*");

    if (error) throw error;

    let synced = 0;

    for (const article of articles || []) {
      await qdrant.upsert("artigos", {
        wait: true,
        points: [
          {
            id: Number(article.id),
            vector: Array(1536).fill(0.1),
            payload: {
              id: article.id,
              title: article.title,
              slug: article.slug,
              category: article.category,
              author: article.author,
              description: article.description,
              content: article.content,
              created_at: article.created_at,
            },
          },
        ],
      });

      synced++;
    }

    return NextResponse.json({
      success: true,
      synced,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}