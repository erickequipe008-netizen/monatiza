-- Notificação de menção: @handle dentro do texto do post notifica o mencionado.
create or replace function public.trg_notify_post() returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_author uuid;
  v_handle text;
  v_uid uuid;
begin
  if new.parent_id is not null then
    select user_id into v_author from public.posts where id = new.parent_id;
    perform public.notify(v_author, new.user_id, 'comment', new.parent_id);
  end if;
  if new.repost_of is not null then
    select user_id into v_author from public.posts where id = new.repost_of;
    perform public.notify(v_author, new.user_id, 'repost', new.repost_of);
  end if;
  -- menções @usuario
  for v_handle in
    select distinct lower((regexp_matches(coalesce(new.content, ''), '@([A-Za-z0-9_]+)', 'g'))[1])
  loop
    select user_id into v_uid from public.community_profiles where lower(handle) = v_handle;
    if v_uid is not null then
      perform public.notify(v_uid, new.user_id, 'mention', new.id);
    end if;
  end loop;
  return new;
end; $$;
