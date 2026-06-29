-- ============================================================
-- Mensagens diretas (DM) entre assinantes.
-- ============================================================
create table if not exists public.direct_messages (
  id           bigint generated always as identity primary key,
  sender_id    uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  content      text not null,
  created_at   timestamptz not null default now()
);
create index if not exists dm_pair_idx on public.direct_messages (sender_id, recipient_id, created_at);
create index if not exists dm_recipient_idx on public.direct_messages (recipient_id, created_at);

alter table public.direct_messages enable row level security;

drop policy if exists dm_select on public.direct_messages;
drop policy if exists dm_insert on public.direct_messages;
-- leio as conversas em que sou remetente ou destinatário
create policy dm_select on public.direct_messages for select
  using ((sender_id = auth.uid() or recipient_id = auth.uid()) and public.am_i_subscriber());
-- só envio como eu mesmo
create policy dm_insert on public.direct_messages for insert
  with check (sender_id = auth.uid() and public.am_i_subscriber());

do $$ begin
  alter publication supabase_realtime add table public.direct_messages;
exception when duplicate_object then null; end $$;
