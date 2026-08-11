-- AAVISHKAR Launchpad — run after schema.sql and 002_live_data.sql

-- Idea moderation (coordinator review before publish)
alter table public.ideas
  add column if not exists review_status text not null default 'published'
  check (review_status in ('published', 'pending'));

-- Opportunity registration (student sign-up, not just save)
create table if not exists public.opportunity_registrations (
  student_id text not null references public.students (id) on delete cascade,
  opportunity_id text not null references public.opportunities (id) on delete cascade,
  registered_at timestamptz not null default now(),
  primary key (student_id, opportunity_id)
);

alter table public.opportunity_registrations enable row level security;
drop policy if exists "prototype_all_opportunity_registrations" on public.opportunity_registrations;
create policy "prototype_all_opportunity_registrations" on public.opportunity_registrations
  for all using (true) with check (true);
