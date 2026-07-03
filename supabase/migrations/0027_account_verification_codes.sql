-- Códigos de verificação por e-mail para trocar nome/e-mail/senha (segurança).
-- Só o service_role (via API) acessa (RLS ligada, sem policies).
create table if not exists public.account_codes (
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null,
  code text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (user_id, purpose)
);
alter table public.account_codes enable row level security;
