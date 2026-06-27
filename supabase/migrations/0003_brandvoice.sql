-- ============================================================
-- BrandVoice: créditos + aprovação editorial + papéis
-- Rode no Supabase: SQL Editor → New query → cole tudo → Run.
-- (Substitui a RLS de articles do 0002 — pode rodar mesmo se 0002 já rodou.)
-- ============================================================

-- 0) Marca a conta de ADMIN. Os demais usuários são jornalistas.
insert into public.profiles (id, email, role)
select id, email, 'admin'
from auth.users
where email = 'erickequipe008@gmail.com'
on conflict (id) do update set role = 'admin';

-- 1) Colunas novas em articles
alter table public.articles
  add column if not exists status text not null default 'publicado',  -- publicado | em_analise | aprovado | rejeitado
  add column if not exists credit_used boolean not null default false,
  add column if not exists credit_transaction_id uuid;

-- 2) Saldo de créditos por jornalista
create table if not exists public.journalist_credits (
  id uuid primary key default gen_random_uuid(),
  journalist_id uuid not null unique references auth.users(id) on delete cascade,
  balance integer not null default 0,
  total_purchased integer not null default 0,
  total_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Transações de crédito (compras Stripe / ajustes do admin)
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  journalist_id uuid not null references auth.users(id) on delete cascade,
  stripe_payment_id text,
  amount_paid numeric(10,2),
  credits_added integer not null default 0,
  status text not null default 'concluido',   -- concluido | pendente | ajuste_admin
  created_at timestamptz not null default now()
);

-- 4) Funções utilitárias (SECURITY DEFINER → ignoram RLS internamente)
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- consome 1 crédito de forma atômica; retorna true se havia saldo
create or replace function public.use_journalist_credit(p_journalist uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update public.journalist_credits
     set balance = balance - 1, total_used = total_used + 1, updated_at = now()
   where journalist_id = p_journalist and balance > 0;
  get diagnostics n = row_count;
  return n > 0;
end; $$;

-- adiciona créditos (compra confirmada / ajuste do admin)
create or replace function public.add_journalist_credits(p_journalist uuid, p_credits int)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.journalist_credits (journalist_id, balance, total_purchased)
  values (p_journalist, p_credits, p_credits)
  on conflict (journalist_id) do update
    set balance = public.journalist_credits.balance + p_credits,
        total_purchased = public.journalist_credits.total_purchased + greatest(p_credits, 0),
        updated_at = now();
end; $$;

-- 5) RLS dos créditos: jornalista lê só o seu; admin lê tudo. Escrita só via funções/service role.
alter table public.journalist_credits enable row level security;
drop policy if exists jc_select on public.journalist_credits;
create policy jc_select on public.journalist_credits for select
  using (journalist_id = auth.uid() or public.is_admin());

alter table public.credit_transactions enable row level security;
drop policy if exists ct_select on public.credit_transactions;
create policy ct_select on public.credit_transactions for select
  using (journalist_id = auth.uid() or public.is_admin());

-- 6) profiles: cada um lê o próprio perfil (necessário pro roteamento por papel); admin lê todos.
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- journalists: cada um lê o próprio; admin lê todos.
drop policy if exists journalists_select_self_or_admin on public.journalists;
create policy journalists_select_self_or_admin on public.journalists for select
  using (id = auth.uid() or public.is_admin());

-- 7) RLS de articles: público vê só 'publicado'; autor vê os próprios (qualquer status); admin vê tudo.
alter table public.articles enable row level security;
drop policy if exists "articles_public_read" on public.articles;
drop policy if exists "articles_staff_insert" on public.articles;
drop policy if exists "articles_staff_update" on public.articles;
drop policy if exists "articles_staff_delete" on public.articles;
drop policy if exists articles_read on public.articles;
drop policy if exists articles_insert on public.articles;
drop policy if exists articles_update on public.articles;
drop policy if exists articles_delete on public.articles;

create policy articles_read on public.articles for select
  using (status = 'publicado' or author_id = auth.uid() or public.is_admin());
create policy articles_insert on public.articles for insert to authenticated
  with check (author_id = auth.uid() or public.is_admin());
create policy articles_update on public.articles for update to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());
create policy articles_delete on public.articles for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());
