-- O painel admin "Perfil" (app/admin/settings) grava avatar_url/bio/redes na tabela journalists,
-- mas essas colunas não existiam (só name/email/role/avatar/display_name) → erro
-- "Could not find the 'avatar_url' column of 'journalists'". Aditivo e seguro.
alter table public.journalists
  add column if not exists avatar_url text,
  add column if not exists bio text,
  add column if not exists instagram text,
  add column if not exists linkedin text,
  add column if not exists website text;

-- Aproveita foto já existente na coluna antiga "avatar".
update public.journalists
  set avatar_url = avatar
  where avatar_url is null and avatar is not null and avatar <> '';
