-- AAVISHKAR Launchpad — Storage buckets + prototype policies
-- Safe to re-run (idempotent)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    524288,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  ),
  (
    'project-files',
    'project-files',
    true,
    26214400,
    null
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- avatars
drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "avatars_anon_upload" on storage.objects;
drop policy if exists "avatars_anon_update" on storage.objects;
drop policy if exists "avatars_anon_delete" on storage.objects;

create policy "avatars_public_read"
on storage.objects for select
to public
using (bucket_id = 'avatars');

create policy "avatars_anon_upload"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'avatars');

create policy "avatars_anon_update"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'avatars');

create policy "avatars_anon_delete"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'avatars');

-- project-files
drop policy if exists "project_files_public_read" on storage.objects;
drop policy if exists "project_files_anon_upload" on storage.objects;
drop policy if exists "project_files_anon_update" on storage.objects;
drop policy if exists "project_files_anon_delete" on storage.objects;

create policy "project_files_public_read"
on storage.objects for select
to public
using (bucket_id = 'project-files');

create policy "project_files_anon_upload"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'project-files');

create policy "project_files_anon_update"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'project-files');

create policy "project_files_anon_delete"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'project-files');
