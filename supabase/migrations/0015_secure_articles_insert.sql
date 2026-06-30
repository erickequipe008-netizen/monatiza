-- Segurança: só redação (admin/jornalista) pode inserir artigos pelo cliente.
-- Antes, QUALQUER usuário autenticado (incluindo assinante) podia inserir/publicar
-- artigos via REST. A API de jornalista usa service_role (não afetada por RLS).
drop policy if exists "Enable insert for authenticated users only" on public.articles;

create policy "articles_insert_staff" on public.articles
  for insert to authenticated
  with check (public.is_staff());
