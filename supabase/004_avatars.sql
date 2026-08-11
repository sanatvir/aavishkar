-- Profile pictures for students and ATL coordinators
alter table public.students add column if not exists avatar_url text;

alter table public.platform_settings add column if not exists coordinator_name text not null default 'ATL Coordinator';
alter table public.platform_settings add column if not exists coordinator_avatar_url text;

-- Public bucket for profile photos (create in Supabase Dashboard → Storage if missing)
-- Name: avatars · Public: yes · Allowed MIME: image/*
