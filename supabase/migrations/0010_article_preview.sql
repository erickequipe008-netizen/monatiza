-- ============================================================
-- Prévia (teaser) das matérias premium para visitantes.
-- Devolve só os primeiros N caracteres do corpo (texto puro, com
-- quebras de parágrafo) — o resto fica trancado atrás do paywall.
-- SECURITY DEFINER → consegue ler o content (que é revogado p/ anon).
-- ============================================================
create or replace function public.get_article_preview(p_slug text, p_chars int default 800)
returns text language sql security definer set search_path = public stable as $$
  select left(
           trim(regexp_replace(
             regexp_replace(a.content, '</p>|<br\s*/?>', E'\n\n', 'gi'),  -- quebras de parágrafo
             '<[^>]+>', '', 'g'                                           -- remove demais tags
           )),
           greatest(p_chars, 0)
         )
  from public.articles a
  where a.slug = p_slug and a.status = 'publicado'
  limit 1;
$$;

grant execute on function public.get_article_preview(text, int) to anon, authenticated, service_role;
