-- Link (site/URL) no perfil da comunidade.
alter table public.community_profiles add column if not exists link text;

-- Perfil oficial @monatiza já vem com o site.
update public.community_profiles
   set link = 'https://monatiza.com'
 where handle = 'monatiza' and (link is null or link = '');
