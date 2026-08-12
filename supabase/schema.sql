-- AAVISHKAR Launchpad — run once in Supabase SQL Editor
-- Dashboard → SQL → New query → paste → Run

create extension if not exists "pgcrypto";

-- ---------- Students ----------
create table if not exists public.students (
  id text primary key,
  name text not null,
  class_name text not null,
  initials text not null,
  bio text not null default '',
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  availability text not null default 'Available',
  projects text[] not null default '{}',
  achievements text[] not null default '{}',
  status text not null default 'Active',
  accent text not null default 'from-primary to-accent',
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin'))
);

-- ---------- Ideas ----------
create table if not exists public.ideas (
  id text primary key,
  title text not null,
  category text not null,
  problem text not null,
  solution text not null,
  why text not null default '',
  looking_for text[] not null default '{}',
  technologies text[] not null default '{}',
  creator_id text not null references public.students (id) on delete cascade,
  supports integer not null default 0,
  collaborators integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.idea_comments (
  id text primary key,
  idea_id text not null references public.ideas (id) on delete cascade,
  author_id text not null references public.students (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.idea_supporters (
  idea_id text not null references public.ideas (id) on delete cascade,
  student_id text not null references public.students (id) on delete cascade,
  primary key (idea_id, student_id)
);

create table if not exists public.idea_members (
  idea_id text not null references public.ideas (id) on delete cascade,
  student_id text not null references public.students (id) on delete cascade,
  primary key (idea_id, student_id)
);

-- ---------- Projects (nested fields as jsonb for workspace tabs) ----------
create table if not exists public.projects (
  id text primary key,
  title text not null,
  description text not null,
  status text not null default 'Planning',
  progress integer not null default 0,
  member_ids text[] not null default '{}',
  deadline text not null default 'Not set',
  milestones jsonb not null default '[]',
  tasks jsonb not null default '[]',
  files jsonb not null default '[]',
  updates jsonb not null default '[]',
  chat jsonb not null default '[]',
  mine boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Social graph ----------
create table if not exists public.connections (
  student_id text not null references public.students (id) on delete cascade,
  connected_id text not null references public.students (id) on delete cascade,
  primary key (student_id, connected_id),
  check (student_id <> connected_id)
);

create table if not exists public.communities (
  id text primary key,
  name text not null,
  members integer not null default 0,
  description text not null,
  activity text[] not null default '{}',
  accent text not null default 'from-primary to-accent'
);

create table if not exists public.community_members (
  community_id text not null references public.communities (id) on delete cascade,
  student_id text not null references public.students (id) on delete cascade,
  primary key (community_id, student_id)
);

-- ---------- Opportunities ----------
create table if not exists public.opportunities (
  id text primary key,
  title text not null,
  type text not null,
  deadline text not null,
  description text not null,
  eligibility text not null,
  skills text[] not null default '{}',
  organizer text not null
);

create table if not exists public.saved_opportunities (
  student_id text not null references public.students (id) on delete cascade,
  opportunity_id text not null references public.opportunities (id) on delete cascade,
  primary key (student_id, opportunity_id)
);

-- ---------- Messages ----------
create table if not exists public.conversations (
  id text primary key,
  participant_a text not null references public.students (id) on delete cascade,
  participant_b text not null references public.students (id) on delete cascade,
  unique (participant_a, participant_b)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null references public.conversations (id) on delete cascade,
  sender_id text not null references public.students (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_reads (
  conversation_id text not null references public.conversations (id) on delete cascade,
  student_id text not null references public.students (id) on delete cascade,
  unread_count integer not null default 0,
  primary key (conversation_id, student_id)
);

-- ---------- Notifications ----------
create table if not exists public.notifications (
  id text primary key,
  student_id text not null references public.students (id) on delete cascade,
  kind text not null,
  text text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Admin ----------
create table if not exists public.recruitments (
  id text primary key,
  title text not null,
  status text not null,
  skills text[] not null default '{}',
  applications integer not null default 0,
  closes text not null,
  description text not null
);

create table if not exists public.applications (
  id text primary key,
  student_id text not null references public.students (id) on delete cascade,
  recruitment_id text not null references public.recruitments (id) on delete cascade,
  submitted text not null,
  note text not null default '',
  stage text not null default 'New'
);

create table if not exists public.admin_shortlist (
  student_id text not null references public.students (id) on delete cascade,
  primary key (student_id)
);

create table if not exists public.reports (
  id text primary key,
  target text not null,
  kind text not null,
  reason text not null,
  date text not null,
  status text not null default 'Open'
);

-- ---------- RLS (prototype: open read/write for anon — tighten when auth ships) ----------
alter table public.students enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_comments enable row level security;
alter table public.idea_supporters enable row level security;
alter table public.idea_members enable row level security;
alter table public.projects enable row level security;
alter table public.connections enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.opportunities enable row level security;
alter table public.saved_opportunities enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_reads enable row level security;
alter table public.notifications enable row level security;
alter table public.recruitments enable row level security;
alter table public.applications enable row level security;
alter table public.admin_shortlist enable row level security;
alter table public.reports enable row level security;

create policy "prototype_all_students" on public.students for all using (true) with check (true);
create policy "prototype_all_ideas" on public.ideas for all using (true) with check (true);
create policy "prototype_all_idea_comments" on public.idea_comments for all using (true) with check (true);
create policy "prototype_all_idea_supporters" on public.idea_supporters for all using (true) with check (true);
create policy "prototype_all_idea_members" on public.idea_members for all using (true) with check (true);
create policy "prototype_all_projects" on public.projects for all using (true) with check (true);
create policy "prototype_all_connections" on public.connections for all using (true) with check (true);
create policy "prototype_all_communities" on public.communities for all using (true) with check (true);
create policy "prototype_all_community_members" on public.community_members for all using (true) with check (true);
create policy "prototype_all_opportunities" on public.opportunities for all using (true) with check (true);
create policy "prototype_all_saved_opportunities" on public.saved_opportunities for all using (true) with check (true);
create policy "prototype_all_conversations" on public.conversations for all using (true) with check (true);
create policy "prototype_all_messages" on public.messages for all using (true) with check (true);
create policy "prototype_all_conversation_reads" on public.conversation_reads for all using (true) with check (true);
create policy "prototype_all_notifications" on public.notifications for all using (true) with check (true);
create policy "prototype_all_recruitments" on public.recruitments for all using (true) with check (true);
create policy "prototype_all_applications" on public.applications for all using (true) with check (true);
create policy "prototype_all_admin_shortlist" on public.admin_shortlist for all using (true) with check (true);
create policy "prototype_all_reports" on public.reports for all using (true) with check (true);

-- ---------- Live data (events, settings, activity) — also in 002_live_data.sql ----------
create table if not exists public.events (
  id text primary key,
  title text not null,
  event_date text not null,
  place text not null,
  seats_total integer,
  seats_filled integer not null default 0
);

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
  recruitment_alerts boolean not null default true,
  coordinator_name text not null default 'ATL Coordinator',
  coordinator_avatar_url text
);

insert into public.platform_settings (id) values ('default') on conflict (id) do nothing;

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.students add column if not exists created_at timestamptz not null default now();

alter table public.events enable row level security;
alter table public.student_settings enable row level security;
alter table public.platform_settings enable row level security;
alter table public.activity_log enable row level security;

create policy "prototype_all_events" on public.events for all using (true) with check (true);
create policy "prototype_all_student_settings" on public.student_settings for all using (true) with check (true);
create policy "prototype_all_platform_settings" on public.platform_settings for all using (true) with check (true);
create policy "prototype_all_activity_log" on public.activity_log for all using (true) with check (true);
