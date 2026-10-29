-- ============================================================
-- Segurança dos créditos: só o service role (servidor) pode
-- adicionar/consumir créditos. Fecha a brecha onde um usuário
-- logado poderia chamar as funções via API e se autocreditar.
-- Rode no Supabase → SQL Editor → Run.
-- ============================================================

revoke execute on function public.add_journalist_credits(uuid, int) from public, anon, authenticated;
revoke execute on function public.use_journalist_credit(uuid) from public, anon, authenticated;

grant execute on function public.add_journalist_credits(uuid, int) to service_role;
grant execute on function public.use_journalist_credit(uuid) to service_role;
