-- ============================================================
-- Comunidade do assinante: perfis sociais + feed de opinião
-- (estilo X/Twitter) dentro da área premium. Aditivo e seguro.
-- Acesso restrito a assinantes ativos (e staff) via RLS.
-- ============================================================

-- 1) "Sou assinante ativo?" — versão SEM argumento, executável dentro do RLS
--    pelo próprio usuário (não expõe consulta por id de terceiros).
create or replace function public.am_i_subscriber()
returns boolean language sql security definer set search_path = public stable as $$
  select public.is_active_subscriber(auth.uid()) or public.is_staff();
$$;
grant execute on function public.am_i_subscriber() to authenticated, service_role;

-- 2) Perfis sociais dos membros
create table if not exists public.community_profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  handle      text unique,
  display_name text,
  bio         text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3) Posts (parent_id = respostas/opiniões encadeadas)
create table if not exists public.posts (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  content    text not null,
  parent_id  bigint references public.posts(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists posts_root_created_idx on public.posts (created_at desc) where parent_id is null;
create index if not exists posts_parent_idx        on public.posts (parent_id, created_at);
create index if not exists posts_user_idx          on public.posts (user_id, created_at desc);

-- 4) Curtidas de post
create table if not exists public.post_likes (
  post_id    bigint not null references public.posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index if not exists post_likes_post_idx on public.post_likes (post_id);

-- 5) RLS — comunidade só para assinantes ativos (e staff)
alter table public.community_profiles enable row level security;
alter table public.posts              enable row level security;
alter table public.post_likes         enable row level security;

drop policy if exists cp_select on public.community_profiles;
drop policy if exists cp_insert on public.community_profiles;
drop policy if exists cp_update on public.community_profiles;
create policy cp_select on public.community_profiles for select using (public.am_i_subscriber());
create policy cp_insert on public.community_profiles for insert with check (user_id = auth.uid() and public.am_i_subscriber());
create policy cp_update on public.community_profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists posts_select on public.posts;
drop policy if exists posts_insert on public.posts;
drop policy if exists posts_update on public.posts;
drop policy if exists posts_delete on public.posts;
create policy posts_select on public.posts for select using (public.am_i_subscriber());
create policy posts_insert on public.posts for insert with check (user_id = auth.uid() and public.am_i_subscriber());
create policy posts_update on public.posts for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy posts_delete on public.posts for delete using (user_id = auth.uid());

drop policy if exists pl_select on public.post_likes;
drop policy if exists pl_insert on public.post_likes;
drop policy if exists pl_delete on public.post_likes;
create policy pl_select on public.post_likes for select using (public.am_i_subscriber());
create policy pl_insert on public.post_likes for insert with check (user_id = auth.uid() and public.am_i_subscriber());
create policy pl_delete on public.post_likes for delete using (user_id = auth.uid());

-- 6) Feed em tempo real
do $$ begin
  alter publication supabase_realtime add table public.posts;
exception when duplicate_object then null; end $$;
