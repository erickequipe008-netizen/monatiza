-- Nível do selo de verificado: prata (silver) ou dourado (gold).
alter table public.community_profiles add column if not exists verified_tier text;
-- quem já é verificado sem nível definido vira dourado (padrão histórico)
update public.community_profiles set verified_tier = 'gold' where verified = true and verified_tier is null;
