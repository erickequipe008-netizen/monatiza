-- Protege a tabela public.articles com RLS.
-- HOJE: RLS está desligado → qualquer um com a anon key (pública no frontend)
-- pode ler E alterar/excluir todos os artigos. Isto corrige isso.
--
-- Política: LEITURA pública (o site continua funcionando) + ESCRITA só para a
-- equipe (jornalistas/admins). O service role (backend/jobs) sempre ignora o RLS.
--
-- Rode no Supabase: SQL Editor → New query → cole tudo → Run.

-- 1) Função que diz se o usuário logado é da equipe.
--    SECURITY DEFINER: roda como dono da função, ignorando o RLS de profiles/journalists
--    (evita recursão e problemas de permissão na checagem).
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and coalesce(p.role, '') in ('journalist', 'admin'))
    or
    exists (select 1 from public.journalists j where j.id = auth.uid());
$$;

-- 2) Liga o RLS e define as políticas.
alter table public.articles enable row level security;

drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read" on public.articles
  for select using (true);

drop policy if exists "articles_staff_insert" on public.articles;
create policy "articles_staff_insert" on public.articles
  for insert to authenticated with check (public.is_staff());

drop policy if exists "articles_staff_update" on public.articles;
create policy "articles_staff_update" on public.articles
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "articles_staff_delete" on public.articles;
create policy "articles_staff_delete" on public.articles
  for delete to authenticated using (public.is_staff());

-- 3) IMPORTANTE: garanta que A SUA conta de publicação seja "equipe", senão você
--    fica sem conseguir publicar. Troque pelo e-mail com que você loga para publicar.
insert into public.profiles (id, email, role)
select id, email, 'admin'
from auth.users
where email = 'SEU_EMAIL_DE_LOGIN@exemplo.com'
on conflict (id) do update set role = 'admin';

-- Depois de rodar: entre no painel logado e teste criar/editar um artigo.
-- Visitantes (anon) e assinantes (logados, sem papel de equipe) não conseguem mais escrever.
