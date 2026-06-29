-- ============================================================
-- Selo de verificado (dourado) + @ único e travado.
-- ============================================================

-- 1) Selo de verificado. Só service_role/admin define (usuário NÃO pode se auto-verificar).
alter table public.community_profiles add column if not exists verified boolean not null default false;
revoke update (verified) on public.community_profiles from anon, authenticated;

-- 2) @ único de verdade (case-insensitive): ninguém pega um @ já usado, em qualquer caixa.
create unique index if not exists community_profiles_handle_lower_idx
  on public.community_profiles (lower(handle));

-- 3) Pedidos de verificação (documento + selfie + pagamento de R$ 39,90)
create table if not exists public.verification_requests (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  doc_url    text,
  selfie_url text,
  status     text not null default 'pending',   -- pending | paid | approved | rejected
  stripe_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.verification_requests enable row level security;
drop policy if exists vr_select on public.verification_requests;
drop policy if exists vr_insert on public.verification_requests;
drop policy if exists vr_update on public.verification_requests;
create policy vr_select on public.verification_requests for select
  using (user_id = auth.uid() or public.is_admin());
create policy vr_insert on public.verification_requests for insert
  with check (user_id = auth.uid() and public.am_i_subscriber());
create policy vr_update on public.verification_requests for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
