-- Tabela de assinantes (Stripe). Rode no Supabase: SQL Editor → New query → Run.
-- Segurança: o assinante só LÊ a própria linha; o status (pago/ativo) só é escrito
-- pelo servidor (webhook do Stripe via service role), nunca pelo cliente.

create table if not exists public.subscribers (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',   -- inactive | active | past_due | canceled
  plan text,                                  -- mensal | anual
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

drop policy if exists "subscribers_select_own" on public.subscribers;
create policy "subscribers_select_own" on public.subscribers
  for select using (auth.uid() = id);

create index if not exists subscribers_stripe_subscription_id_idx
  on public.subscribers (stripe_subscription_id);
