-- ============================================================
-- Bucket PRIVADO para documentos de verificação (não público!).
-- Só o dono envia/lê na própria pasta; admin pode ler (revisão).
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('verification', 'verification', false, 15728640,  -- 15 MB, privado
        array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists ver_insert on storage.objects;
drop policy if exists ver_select on storage.objects;
drop policy if exists ver_update on storage.objects;
drop policy if exists ver_delete on storage.objects;
create policy ver_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'verification' and (storage.foldername(name))[1] = auth.uid()::text and public.am_i_subscriber());
create policy ver_select on storage.objects for select to authenticated
  using (bucket_id = 'verification' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy ver_update on storage.objects for update to authenticated
  using (bucket_id = 'verification' and (storage.foldername(name))[1] = auth.uid()::text);
create policy ver_delete on storage.objects for delete to authenticated
  using (bucket_id = 'verification' and (storage.foldername(name))[1] = auth.uid()::text);
