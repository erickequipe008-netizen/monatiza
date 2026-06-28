-- ============================================================
-- Seguidores + foto de capa do perfil (aditivo).
-- Todos veem perfis/publicações (RLS de assinante); só o dono segue/deixa de seguir.
-- ============================================================

alter table public.community_profiles add column if not exists cover_url text;

create table if not exists public.follows (
  follower_id  uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index if not exists follows_following_idx on public.follows (following_id);
create index if not exists follows_follower_idx  on public.follows (follower_id);

alter table public.follows enable row level security;
drop policy if exists follows_select on public.follows;
drop policy if exists follows_insert on public.follows;
drop policy if exists follows_delete on public.follows;
create policy follows_select on public.follows for select using (public.am_i_subscriber());
create policy follows_insert on public.follows for insert with check (follower_id = auth.uid() and public.am_i_subscriber());
create policy follows_delete on public.follows for delete using (follower_id = auth.uid());
