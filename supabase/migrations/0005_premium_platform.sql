-- ============================================================
-- Plataforma Premium (parte ADITIVA e segura — nada de DROP).
-- Cria: marca de matéria premium, biblioteca pessoal do assinante,
-- leitura protegida do corpo das matérias e feed em tempo real.
-- Rode no Supabase: SQL Editor → New query → cole tudo → Run.
--
-- IMPORTANTE: a *revogação* do acesso ao corpo premium pela API
-- pública fica no 0006_revoke_premium_content.sql e deve ser
-- rodada SÓ junto com o deploy do novo código (senão quebra o
-- site atual, que ainda lê o corpo direto da tabela).
-- ============================================================

-- 1) Marca de matéria premium ---------------------------------
alter table public.articles
  add column if not exists is_premium boolean not null default false;

create index if not exists articles_is_premium_idx
  on public.articles (is_premium);

-- 2) Quem é assinante ativo -----------------------------------
--    SECURITY DEFINER → ignora o RLS de subscribers na checagem.
--    current_period_end pode ser null logo após o checkout (o
--    webhook só preenche no próximo evento) → tratamos como ativo.
create or replace function public.is_active_subscriber(uid uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.subscribers s
    where s.id = uid
      and s.status = 'active'
      and (s.current_period_end is null or s.current_period_end > now())
  );
$$;

-- 3) Corpo da matéria com paywall NO SERVIDOR -----------------
--    Devolve o `content` apenas quando:
--      • a pessoa é staff (jornalista/admin) — qualquer status; OU
--      • a matéria está publicada e (não é premium OU é assinante ativo).
--    Caso contrário não retorna linha → o app mostra o paywall.
create or replace function public.get_article_body(p_slug text)
returns text language sql security definer set search_path = public stable as $$
  select a.content
  from public.articles a
  where a.slug = p_slug
    and (
      public.is_staff()
      or (
        a.status = 'publicado'
        and (a.is_premium = false or public.is_active_subscriber(auth.uid()))
      )
    )
  limit 1;
$$;

-- get_article_body PRECISA ser pública (devolve o corpo das matérias grátis
-- ao visitante anônimo e aplica o paywall internamente para as premium).
grant execute on function public.get_article_body(text) to anon, authenticated, service_role;

-- is_active_subscriber é só auxiliar interna (usada dentro de get_article_body).
-- Ninguém deve chamá-la direto, então fechamos para o público — evita que
-- alguém consulte o status de assinatura de um id qualquer. O get_article_body
-- (SECURITY DEFINER) continua chamando porque roda como dono da função.
revoke execute on function public.is_active_subscriber(uuid) from public;
grant  execute on function public.is_active_subscriber(uuid) to service_role;

-- 4) Biblioteca pessoal do assinante --------------------------
create table if not exists public.reading_history (
  user_id      uuid   not null references auth.users(id) on delete cascade,
  article_id   bigint not null references public.articles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  read_seconds integer not null default 0,
  progress     real    not null default 0,            -- 0..1
  primary key (user_id, article_id)
);

create table if not exists public.bookmarks (
  user_id    uuid   not null references auth.users(id) on delete cascade,
  article_id bigint not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table if not exists public.article_likes (
  user_id    uuid   not null references auth.users(id) on delete cascade,
  article_id bigint not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table if not exists public.newsletter_subscriptions (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  categories text[] not null default '{}',
  frequency  text   not null default 'semanal',        -- diaria | semanal | mensal
  updated_at timestamptz not null default now()
);

create index if not exists reading_history_user_idx on public.reading_history (user_id, last_read_at desc);
create index if not exists bookmarks_user_idx        on public.bookmarks (user_id, created_at desc);
create index if not exists article_likes_user_idx    on public.article_likes (user_id, created_at desc);

-- 4.1) RLS: cada assinante só lê/escreve as PRÓPRIAS linhas.
alter table public.reading_history        enable row level security;
alter table public.bookmarks              enable row level security;
alter table public.article_likes          enable row level security;
alter table public.newsletter_subscriptions enable row level security;

drop policy if exists rh_own on public.reading_history;
create policy rh_own on public.reading_history for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists bm_own on public.bookmarks;
create policy bm_own on public.bookmarks for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists al_own on public.article_likes;
create policy al_own on public.article_likes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists ns_own on public.newsletter_subscriptions;
create policy ns_own on public.newsletter_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 5) Feed em tempo real (Supabase Realtime) -------------------
do $$
begin
  alter publication supabase_realtime add table public.articles;
exception
  when duplicate_object then null;   -- já está na publicação
end $$;
