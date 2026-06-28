-- ============================================================
-- Upgrade social: fotos em posts, Reels (vídeos) e bucket de mídia.
-- Aditivo. Acesso restrito a assinantes (RLS via am_i_subscriber()).
-- ============================================================

-- 1) Foto em posts
alter table public.posts add column if not exists image_url text;

-- 2) Reels (vídeos curtos)
create table if not exists public.reels (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  video_url  text not null,
  caption    text,
  created_at timestamptz not null default now()
);
create index if not exists reels_created_idx on public.reels (created_at desc);
create index if not exists reels_user_idx    on public.reels (user_id, created_at desc);

create table if not exists public.reel_likes (
  reel_id    bigint not null references public.reels(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reel_id, user_id)
);

alter table public.reels      enable row level security;
alter table public.reel_likes enable row level security;

drop policy if exists reels_select on public.reels;
drop policy if exists reels_insert on public.reels;
drop policy if exists reels_delete on public.reels;
create policy reels_select on public.reels for select using (public.am_i_subscriber());
create policy reels_insert on public.reels for insert with check (user_id = auth.uid() and public.am_i_subscriber());
create policy reels_delete on public.reels for delete using (user_id = auth.uid());

drop policy if exists rl_select on public.reel_likes;
drop policy if exists rl_insert on public.reel_likes;
drop policy if exists rl_delete on public.reel_likes;
create policy rl_select on public.reel_likes for select using (public.am_i_subscriber());
create policy rl_insert on public.reel_likes for insert with check (user_id = auth.uid() and public.am_i_subscriber());
create policy rl_delete on public.reel_likes for delete using (user_id = auth.uid());

do $$ begin
  alter publication supabase_realtime add table public.reels;
exception when duplicate_object then null; end $$;

-- 3) Bucket de mídia (fotos de perfil, fotos de post, vídeos de reels)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community', 'community', true, 78643200,  -- 75 MB
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 4) Escrita no storage: cada assinante só na PRÓPRIA pasta (primeiro segmento = user_id).
--    Leitura é pública (bucket público) para as imagens/vídeos carregarem.
drop policy if exists community_insert on storage.objects;
drop policy if exists community_update on storage.objects;
drop policy if exists community_delete on storage.objects;
create policy community_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'community'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.am_i_subscriber()
  );
create policy community_update on storage.objects for update to authenticated
  using (bucket_id = 'community' and (storage.foldername(name))[1] = auth.uid()::text);
create policy community_delete on storage.objects for delete to authenticated
  using (bucket_id = 'community' and (storage.foldername(name))[1] = auth.uid()::text);
