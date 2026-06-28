-- ============================================================
-- DEPLOY-ONLY: tranca o corpo (content) das matérias na API
-- pública. A partir daqui, anon e usuários logados NÃO conseguem
-- mais ler a coluna `content` direto da tabela — o corpo só sai
-- pela função public.get_article_body(slug), que aplica o paywall.
--
-- ⚠️  RODE ISTO SOMENTE DEPOIS de publicar (deploy) o novo código,
--     que lê o corpo via get_article_body. Se rodar antes, o site
--     em produção (código antigo, que faz select do content) quebra.
--
-- Observação técnica: no Postgres, um GRANT de SELECT no nível da
-- tabela cobre TODAS as colunas. Para esconder só `content`, é
-- preciso revogar o SELECT da tabela e conceder de volta o SELECT
-- coluna a coluna (todas, menos `content`). O bloco abaixo monta
-- essa lista automaticamente — assim novas colunas entram sozinhas
-- ao rodar de novo.
-- ============================================================

do $$
declare cols text;
begin
  select string_agg(quote_ident(column_name), ', ')
    into cols
  from information_schema.columns
  where table_schema = 'public'
    and table_name   = 'articles'
    and column_name <> 'content';

  -- tira o SELECT amplo e devolve só as colunas seguras
  execute 'revoke select on public.articles from anon, authenticated';
  execute 'grant select (' || cols || ') on public.articles to anon, authenticated';
end $$;

-- o servidor (jobs/admin via service role) continua lendo tudo
grant select on public.articles to service_role;

-- lembrete: depois de rodar, todo `select("*")`/leitura de `content`
-- por anon/authenticated precisa ter migrado para get_article_body.
