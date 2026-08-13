-- Student sign-in codes, coordinator portal PIN, community sessions/resources in DB

alter table public.students add column if not exists sign_in_code text;

alter table public.platform_settings
  add column if not exists coordinator_sign_in_code text not null default 'apsdk-atl';

alter table public.communities
  add column if not exists sessions jsonb not null default '[]'::jsonb,
  add column if not exists resources jsonb not null default '[]'::jsonb;

-- Backfill sign-in codes for existing roster (lowercase student id)
update public.students
set sign_in_code = coalesce(sign_in_code, lower(id))
where sign_in_code is null;
