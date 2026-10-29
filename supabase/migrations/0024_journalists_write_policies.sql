-- journalists tinha apenas policy de SELECT; o upsert do painel (INSERT/UPDATE) era barrado
-- pela RLS. Permite que o próprio dono (id = auth.uid()) ou um admin gravem o próprio registro.
drop policy if exists journalists_insert_self_or_admin on public.journalists;
create policy journalists_insert_self_or_admin on public.journalists
  for insert to authenticated
  with check (id = auth.uid() or public.is_admin());

drop policy if exists journalists_update_self_or_admin on public.journalists;
create policy journalists_update_self_or_admin on public.journalists
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
