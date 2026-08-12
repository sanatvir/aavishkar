-- Run after schema.sql (Supabase SQL Editor → New query → Run)
-- Adds events, settings, activity log for live admin + student preferences

-- ---------- Events ----------
create table if not exists public.events (
  id text primary key,
  title text not null,
  event_date text not null,
  place text not null,
  seats_total integer,
  seats_filled integer not null default 0
);

alter table public.events enable row level security;
drop policy if exists "prototype_all_events" on public.events;
create policy "prototype_all_events" on public.events for all using (true) with check (true);

-- ---------- Student preferences ----------
create table if not exists public.student_settings (
  student_id text primary key references public.students (id) on delete cascade,
  show_in_discover boolean not null default true,
  show_class boolean not null default true,
  allow_messages boolean not null default true,
  show_projects_public boolean not null default false,
  notify_connections boolean not null default true,
  notify_projects boolean not null default true,
  notify_opportunities boolean not null default true,
  notify_communities boolean not null default false
);

alter table public.student_settings enable row level security;
drop policy if exists "prototype_all_student_settings" on public.student_settings;
create policy "prototype_all_student_settings" on public.student_settings for all using (true) with check (true);

-- ---------- Platform settings (single row) ----------
create table if not exists public.platform_settings (
  id text primary key default 'default',
  platform_name text not null default 'AAVISHKAR',
  institution text not null default 'Army Public School Dhaula Kuan',
  restrict_signin boolean not null default true,
  allow_student_projects boolean not null default true,
  coordinators_close_recruitments boolean not null default true,
  teachers_publish_opportunities boolean not null default false,
  student_leads_communities boolean not null default true,
  auto_flag_connections boolean not null default true,
  require_idea_review boolean not null default false,
  deadline_reminders boolean not null default true,
  weekly_digest boolean not null default true,
  recruitment_alerts boolean not null default true
);

alter table public.platform_settings enable row level security;
drop policy if exists "prototype_all_platform_settings" on public.platform_settings;
create policy "prototype_all_platform_settings" on public.platform_settings for all using (true) with check (true);

insert into public.platform_settings (id) values ('default') on conflict (id) do nothing;

-- ---------- Activity feed ----------
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;
drop policy if exists "prototype_all_activity_log" on public.activity_log;
create policy "prototype_all_activity_log" on public.activity_log for all using (true) with check (true);

-- Optional: track when students joined (for growth charts on fresh data)
alter table public.students add column if not exists created_at timestamptz not null default now();
