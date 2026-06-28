// Colunas "seguras" de `articles` para listagens e SSR público.
//
// NUNCA inclui `content`: o corpo da matéria só sai pela função
// get_article_body(slug), que aplica o paywall no servidor. Assim,
// quando a coluna `content` for trancada para anon/authenticated
// (migração 0006, no deploy), nenhuma destas leituras quebra.
//
// Ao adicionar uma coluna nova em `articles` que as listagens usem,
// inclua aqui (menos `content`).
export const ARTICLE_LIST_COLUMNS =
  "id, slug, title, excerpt, description, image_url, image, category, created_at, author, journalist_name, author_id, status, is_premium";
