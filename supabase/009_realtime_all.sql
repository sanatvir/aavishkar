-- Enable live updates for all AAVISHKAR tables used by subscribeAppChanges

do $$
declare
  tbl text;
  tables text[] := array[
    'notifications',
    'messages',
    'applications',
    'reports',
    'events',
    'recruitments',
    'opportunities',
    'ideas',
    'community_members',
    'connections',
    'community_join_applications',
    'projects',
    'communities',
    'community_posts'
  ];
begin
  foreach tbl in array tables loop
    execute format('alter table public.%I replica identity full', tbl);
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = tbl
    ) then
      execute format('alter publication supabase_realtime add table public.%I', tbl);
    end if;
  end loop;
end $$;
