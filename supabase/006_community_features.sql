-- Run after schema.sql and prior migrations
-- Community join applications + coordinator posts

create table if not exists public.community_join_applications (
  id text primary key,
  student_id text not null references public.students (id) on delete cascade,
  community_id text not null references public.communities (id) on delete cascade,
  submitted text not null,
  note text not null default '',
  status text not null default 'Pending'
    check (status in ('Pending', 'Accepted', 'Rejected')),
  created_at timestamptz not null default now()
);

alter table public.community_join_applications enable row level security;
drop policy if exists "prototype_all_community_join_applications" on public.community_join_applications;
create policy "prototype_all_community_join_applications" on public.community_join_applications
  for all using (true) with check (true);

create table if not exists public.community_posts (
  id text primary key,
  community_id text not null references public.communities (id) on delete cascade,
  author_id text not null,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.community_posts enable row level security;
drop policy if exists "prototype_all_community_posts" on public.community_posts;
create policy "prototype_all_community_posts" on public.community_posts
  for all using (true) with check (true);

alter table public.reports add column if not exists target_id text;
