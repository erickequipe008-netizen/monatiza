-- Rastreio de ações do usuário (curtir, abrir artigo, clicar em hashtag, seguir,
-- "não tenho interesse") para aprender preferências e personalizar a aba Explorar.
create table if not exists public.user_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  tag text,
  category text,
  target_user uuid,
  weight real not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists user_events_user_created_idx on public.user_events (user_id, created_at desc);
create index if not exists user_events_user_tag_idx on public.user_events (user_id, tag) where tag is not null;

alter table public.user_events enable row level security;
drop policy if exists user_events_own_select on public.user_events;
create policy user_events_own_select on public.user_events
  for select to authenticated using (user_id = auth.uid());
drop policy if exists user_events_own_insert on public.user_events;
create policy user_events_own_insert on public.user_events
  for insert to authenticated with check (user_id = auth.uid());
