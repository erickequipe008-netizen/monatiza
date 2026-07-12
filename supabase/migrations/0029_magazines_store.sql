-- ─────────────────────────────────────────────────────────────────
-- Loja de revistas digitais (/revista)
--
-- magazines: catálogo (capa pública, PDF privado).
-- magazine_purchases: pedidos pagos via Stripe (o nome magazine_orders
--   já é usado pela integração Kiwify — não reutilizar).
-- Buckets: magazine-covers (público) e magazine-pdfs (privado; download
--   sempre por Signed URL de 15 min gerada pelo servidor).
-- ─────────────────────────────────────────────────────────────────

create table if not exists public.magazines (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  edition text,
  category text,
  price numeric(10,2) not null default 17.80,
  cover_url text,          -- URL pública (bucket magazine-covers)
  pdf_path text,           -- caminho no bucket privado magazine-pdfs
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_magazines_published on public.magazines(published) where published;
create index if not exists idx_magazines_category on public.magazines(category);

create table if not exists public.magazine_purchases (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  magazine_id uuid references public.magazines(id) on delete set null,
  customer_name text,
  customer_email text not null,
  amount numeric(10,2) not null,
  status text not null default 'pending',   -- pending | paid | failed
  payment_date timestamptz,
  download_sent boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_magpurch_email on public.magazine_purchases(customer_email);
create index if not exists idx_magpurch_magazine on public.magazine_purchases(magazine_id);

alter table public.magazines enable row level security;
alter table public.magazine_purchases enable row level security;

-- Catálogo: qualquer um lê as publicadas; admin faz tudo.
drop policy if exists mag_public_read on public.magazines;
create policy mag_public_read on public.magazines for select using (published = true or is_admin());
drop policy if exists mag_admin_all on public.magazines;
create policy mag_admin_all on public.magazines for all using (is_admin()) with check (is_admin());

-- Pedidos: só admin lê pelo cliente; inserção/atualização é service role (webhook).
drop policy if exists mp_admin_read on public.magazine_purchases;
create policy mp_admin_read on public.magazine_purchases for select using (is_admin());

-- Storage
insert into storage.buckets (id, name, public)
values ('magazine-covers','magazine-covers', true), ('magazine-pdfs','magazine-pdfs', false)
on conflict (id) do nothing;

drop policy if exists magcov_read on storage.objects;
create policy magcov_read on storage.objects for select using (bucket_id = 'magazine-covers');
drop policy if exists magcov_admin_write on storage.objects;
create policy magcov_admin_write on storage.objects for all
  using (bucket_id='magazine-covers' and is_admin())
  with check (bucket_id='magazine-covers' and is_admin());

drop policy if exists magpdf_admin on storage.objects;
create policy magpdf_admin on storage.objects for all
  using (bucket_id='magazine-pdfs' and is_admin())
  with check (bucket_id='magazine-pdfs' and is_admin());
