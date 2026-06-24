import { createClient } from "@supabase/supabase-js";
import { qdrant } from "@/services/qdrant";
import { model } from "@/lib/gemini";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function syncArticle(articleId: number) {
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .single();

  if (!article) return;

  const text = `
  Título: ${article.title}

  Resumo: ${article.excerpt || ""}

  Conteúdo:
  ${article.content || ""}
  `;

  // Por enquanto vamos usar o Gemini para resumir/classificar
  const result = await model.generateContent(`
  Analise este artigo e gere:
  - resumo
  - palavras-chave
  - categoria principal

  ${text}
  `);

  await qdrant.upsert("artigos", {
    wait: true,
    points: [
      {
        id: Number(article.id),
        vector: Array(1536).fill(0.1), // temporário
        payload: {
          title: article.title,
          slug: article.slug,
          category: article.category,
          author: article.author,
          summary: result.response.text(),
          created_at: article.created_at,
        },
      },
    ],
  });
}