-- Core tables
create table if not exists public.guards (
  id uuid primary key default gen_random_uuid(),
  employee_id text unique not null,
  name text not null,
  email text,
  phone text,
  default_shift_id text,
  created_at timestamptz default now()
);

create table if not exists public.shifts (
  id text primary key,
  name text not null,
  start_time time,
  end_time time,
  color text
);

create table if not exists public.schedule (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  guard_id uuid references public.guards(id) on delete cascade,
  shift_id text references public.shifts(id),
  created_at timestamptz default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  guard_id uuid references public.guards(id) on delete cascade,
  shift_id text references public.shifts(id),
  status text not null,
  covered_by uuid references public.guards(id),
  is_overtime boolean default false,
  created_at timestamptz default now()
);

-- RLS: enable with permissive dev policies
alter table public.guards enable row level security;
alter table public.shifts enable row level security;
alter table public.schedule enable row level security;
alter table public.attendance enable row level security;

drop policy if exists dev_guards_all on public.guards;
create policy dev_guards_all on public.guards for all using (true) with check (true);

drop policy if exists dev_shifts_all on public.shifts;
create policy dev_shifts_all on public.shifts for all using (true) with check (true);

drop policy if exists dev_schedule_all on public.schedule;
create policy dev_schedule_all on public.schedule for all using (true) with check (true);

drop policy if exists dev_attendance_all on public.attendance;
create policy dev_attendance_all on public.attendance for all using (true) with check (true);


