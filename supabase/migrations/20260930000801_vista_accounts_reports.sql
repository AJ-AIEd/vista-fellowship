-- Private teacher cycles and immutable report snapshots.
create table public.vista_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  draft jsonb not null default '{}'::jsonb check (octet_length(draft::text) <= 1000000),
  revision integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(id,user_id)
);
create index vista_cycles_owner_updated on public.vista_cycles(user_id,updated_at desc);
alter table public.vista_cycles enable row level security;
create policy vista_cycles_select on public.vista_cycles for select to authenticated using ((select auth.uid()) = user_id);
create policy vista_cycles_insert on public.vista_cycles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy vista_cycles_update on public.vista_cycles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy vista_cycles_delete on public.vista_cycles for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.vista_cycles from anon, authenticated;
grant select,insert,update,delete on public.vista_cycles to authenticated;

create table public.vista_reports (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  stage text not null check (stage in ('initial','ahtr','final')),
  snapshot jsonb not null check (octet_length(snapshot::text) <= 1000000),
  report_text text not null check (octet_length(report_text) <= 1500000),
  created_at timestamptz not null default now(),
  foreign key(cycle_id,user_id) references public.vista_cycles(id,user_id) on delete cascade
);
create index vista_reports_owner_cycle on public.vista_reports(user_id,cycle_id,created_at desc);
alter table public.vista_reports enable row level security;
create policy vista_reports_select on public.vista_reports for select to authenticated using ((select auth.uid()) = user_id);
create policy vista_reports_insert on public.vista_reports for insert to authenticated with check ((select auth.uid()) = user_id);
create policy vista_reports_delete on public.vista_reports for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.vista_reports from anon,authenticated;
grant select,insert,delete on public.vista_reports to authenticated;

create table public.vista_files (
  id uuid primary key,
  cycle_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  stage text not null check (stage in ('initial','ahtr','final')),
  name text not null check (char_length(name) between 1 and 250),
  object_path text not null unique,
  mime_type text not null,
  size_bytes integer not null check (size_bytes between 1 and 26214400),
  created_at timestamptz not null default now(),
  foreign key(cycle_id,user_id) references public.vista_cycles(id,user_id) on delete cascade,
  check (object_path = user_id::text || '/' || cycle_id::text || '/' || id::text)
);
create index vista_files_owner_cycle on public.vista_files(user_id,cycle_id);
alter table public.vista_files enable row level security;
create policy vista_files_select on public.vista_files for select to authenticated using ((select auth.uid())=user_id);
create policy vista_files_insert on public.vista_files for insert to authenticated with check ((select auth.uid())=user_id);
create policy vista_files_delete on public.vista_files for delete to authenticated using ((select auth.uid())=user_id);
revoke all on public.vista_files from anon,authenticated;
grant select,insert,delete on public.vista_files to authenticated;

-- Compare-and-swap saves prevent silently overwriting another device's edits.
create function public.vista_save_cycle(p_id uuid,p_revision integer,p_title text,p_draft jsonb)
returns setof public.vista_cycles
language plpgsql security invoker set search_path = '' as $$
begin
  return query update public.vista_cycles
    set title=p_title,draft=p_draft,revision=revision+1,updated_at=now()
    where id=p_id and user_id=(select auth.uid()) and revision=p_revision
    returning *;
  if not found then raise exception 'SAVE_CONFLICT' using errcode='40001'; end if;
end;
$$;
revoke execute on function public.vista_save_cycle(uuid,integer,text,jsonb) from public,anon;
grant execute on function public.vista_save_cycle(uuid,integer,text,jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit)
values ('vista-submissions','vista-submissions',false,26214400);
create policy vista_objects_read on storage.objects for select to authenticated using (
  bucket_id='vista-submissions' and (storage.foldername(name))[1]=(select auth.uid())::text
);
create policy vista_objects_create on storage.objects for insert to authenticated with check (
  bucket_id='vista-submissions' and (storage.foldername(name))[1]=(select auth.uid())::text
  and exists(select 1 from public.vista_cycles c where c.id::text=(storage.foldername(name))[2] and c.user_id=(select auth.uid()))
);
create policy vista_objects_delete on storage.objects for delete to authenticated using (
  bucket_id='vista-submissions' and (storage.foldername(name))[1]=(select auth.uid())::text
);
