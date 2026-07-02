-- ============================================================
-- Stories (24h) + chat com "lido" + salvar post + denúncias.
-- ============================================================

-- 1) STORIES ---------------------------------------------------
create table if not exists public.stories (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  media_url  text not null,
  media_type text not null default 'image',   -- image | video
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours'
);
create index if not exists stories_active_idx on public.stories(expires_at desc);

alter table public.stories enable row level security;
drop policy if exists stories_select on public.stories;
drop policy if exists stories_insert on public.stories;
drop policy if exists stories_delete on public.stories;
create policy stories_select on public.stories for select
  using (public.am_i_subscriber() and (expires_at > now() or user_id = auth.uid()));
create policy stories_insert on public.stories for insert
  with check (user_id = auth.uid() and public.am_i_subscriber());
create policy stories_delete on public.stories for delete using (user_id = auth.uid());

-- quem viu (dono do story vê a lista)
create table if not exists public.story_views (
  story_id   bigint not null references public.stories(id) on delete cascade,
  viewer_id  uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, viewer_id)
);
alter table public.story_views enable row level security;
drop policy if exists story_views_insert on public.story_views;
drop policy if exists story_views_select on public.story_views;
create policy story_views_insert on public.story_views for insert
  with check (viewer_id = auth.uid() and public.am_i_subscriber());
create policy story_views_select on public.story_views for select
  using (
    viewer_id = auth.uid()
    or exists (select 1 from public.stories s where s.id = story_id and s.user_id = auth.uid())
  );

-- 2) CHAT: status de lido --------------------------------------
alter table public.direct_messages add column if not exists read boolean not null default false;
drop policy if exists dm_update_read on public.direct_messages;
create policy dm_update_read on public.direct_messages for update
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

-- 3) SALVAR POST ------------------------------------------------
create table if not exists public.post_bookmarks (
  user_id    uuid not null references auth.users(id) on delete cascade,
  post_id    bigint not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
alter table public.post_bookmarks enable row level security;
drop policy if exists post_bookmarks_all on public.post_bookmarks;
create policy post_bookmarks_all on public.post_bookmarks for all
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.am_i_subscriber());

-- 4) DENÚNCIAS --------------------------------------------------
create table if not exists public.reports (
  id          bigint generated always as identity primary key,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  post_id     bigint not null references public.posts(id) on delete cascade,
  reason      text,
  status      text not null default 'pending',   -- pending | resolved | dismissed
  created_at  timestamptz not null default now()
);
alter table public.reports enable row level security;
drop policy if exists reports_insert on public.reports;
drop policy if exists reports_select on public.reports;
drop policy if exists reports_update on public.reports;
create policy reports_insert on public.reports for insert
  with check (reporter_id = auth.uid() and public.am_i_subscriber());
create policy reports_select on public.reports for select
  using (reporter_id = auth.uid() or public.is_admin());
create policy reports_update on public.reports for update
  using (public.is_admin()) with check (public.is_admin());

-- admin pode remover qualquer publicação (moderação)
drop policy if exists posts_delete_admin on public.posts;
create policy posts_delete_admin on public.posts for delete using (public.is_admin());
