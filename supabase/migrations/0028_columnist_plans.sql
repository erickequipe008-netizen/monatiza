-- Programa de colunistas: plano assinado via Stripe libera créditos mensais de publicação.
create table if not exists public.columnist_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan smallint not null check (plan in (1, 2, 3)),
  monthly_credits integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'active', 'past_due', 'canceled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  full_name text,
  phone text,
  region text,
  area text,
  site text,
  bio text,
  accepted_terms_at timestamptz,
  last_credited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists columnist_plans_sub_idx on public.columnist_plans (stripe_subscription_id);

alter table public.columnist_plans enable row level security;

-- O colunista enxerga apenas o próprio plano; escrita somente via service_role (checkout/webhook).
create policy columnist_plans_select_own on public.columnist_plans
  for select using (auth.uid() = user_id);
