-- ============================================================
-- Rede social completa: repost/citar, foto no chat, notificações.
-- ============================================================

-- 1) Repost / citar: um post pode referenciar outro
alter table public.posts add column if not exists repost_of bigint references public.posts(id) on delete set null;
create index if not exists posts_repost_of_idx on public.posts(repost_of);

-- 2) Foto/anexo no chat
alter table public.direct_messages add column if not exists image_url text;

-- 3) Notificações
create table if not exists public.notifications (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,  -- destinatário
  actor_id   uuid references auth.users(id) on delete cascade,           -- quem fez a ação
  type       text not null,      -- like | comment | follow | message | repost
  post_id    bigint,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;
drop policy if exists notif_select on public.notifications;
drop policy if exists notif_update on public.notifications;
create policy notif_select on public.notifications for select using (user_id = auth.uid());
create policy notif_update on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;

-- helper: cria notificação (ignora auto-ações e nunca quebra a ação principal)
create or replace function public.notify(p_user uuid, p_actor uuid, p_type text, p_post bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_user is null or p_actor is null or p_user = p_actor then return; end if;
  begin
    insert into public.notifications(user_id, actor_id, type, post_id) values (p_user, p_actor, p_type, p_post);
  exception when others then null;
  end;
end; $$;

-- curtida → autor do post
create or replace function public.trg_notify_like() returns trigger language plpgsql security definer set search_path = public as $$
declare v_author uuid;
begin
  select user_id into v_author from public.posts where id = new.post_id;
  perform public.notify(v_author, new.user_id, 'like', new.post_id);
  return new;
end; $$;
drop trigger if exists notify_like on public.post_likes;
create trigger notify_like after insert on public.post_likes for each row execute function public.trg_notify_like();

-- comentário (parent_id) e repost (repost_of) → autor do post original
create or replace function public.trg_notify_post() returns trigger language plpgsql security definer set search_path = public as $$
declare v_author uuid;
begin
  if new.parent_id is not null then
    select user_id into v_author from public.posts where id = new.parent_id;
    perform public.notify(v_author, new.user_id, 'comment', new.parent_id);
  end if;
  if new.repost_of is not null then
    select user_id into v_author from public.posts where id = new.repost_of;
    perform public.notify(v_author, new.user_id, 'repost', new.repost_of);
  end if;
  return new;
end; $$;
drop trigger if exists notify_post on public.posts;
create trigger notify_post after insert on public.posts for each row execute function public.trg_notify_post();

-- seguir → seguido
create or replace function public.trg_notify_follow() returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify(new.following_id, new.follower_id, 'follow', null);
  return new;
end; $$;
drop trigger if exists notify_follow on public.follows;
create trigger notify_follow after insert on public.follows for each row execute function public.trg_notify_follow();

-- mensagem → destinatário
create or replace function public.trg_notify_message() returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify(new.recipient_id, new.sender_id, 'message', null);
  return new;
end; $$;
drop trigger if exists notify_message on public.direct_messages;
create trigger notify_message after insert on public.direct_messages for each row execute function public.trg_notify_message();
