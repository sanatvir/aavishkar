-- Student self-registration: store onboarding quiz answers on the profile

alter table public.students
  add column if not exists onboarding_responses jsonb not null default '{}';

alter table public.students
  add column if not exists onboarded_at timestamptz;
