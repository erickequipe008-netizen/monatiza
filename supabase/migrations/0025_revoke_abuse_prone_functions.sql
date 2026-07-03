-- Segurança: funções SECURITY DEFINER que só devem rodar via cron ou trigger estavam
-- executáveis por anon/authenticated pela API REST (spam de posts nas contas oficiais e
-- injeção de notificações falsas). Revoga o EXECUTE direto. O cron roda como dono e os
-- triggers chamam notify() no contexto do definidor, então continuam funcionando.
revoke execute on function public.notify(uuid, uuid, text, bigint) from public, anon, authenticated;
revoke execute on function public.post_daily_monatiza() from public, anon, authenticated;
revoke execute on function public.post_daily_empreende() from public, anon, authenticated;
revoke execute on function public.post_daily_erickboniz() from public, anon, authenticated;
revoke execute on function public.trg_notify_follow() from public, anon, authenticated;
revoke execute on function public.trg_notify_like() from public, anon, authenticated;
revoke execute on function public.trg_notify_message() from public, anon, authenticated;
revoke execute on function public.trg_notify_post() from public, anon, authenticated;
