-- CareerIQ schema: user-scoped data + admin-managed content.
-- Idempotent + self-healing: works on fresh projects AND aligns older
-- tables that were created before this file existed.

-- ---------------------------------------------------------------- profiles --
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  usn text,
  "current_role" text,
  target_role text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Align pre-existing profiles tables with the expected shape.
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists usn text,
  add column if not exists "current_role" text,
  add column if not exists target_role text,
  add column if not exists role text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.profiles set role = 'student' where role is null;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Admins may list student profiles for the admin portal.
drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ----------------------------------------------------------------- resumes --
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  filename text not null,
  file_url text,
  created_at timestamptz not null default now()
);

alter table public.resumes
  add column if not exists filename text,
  add column if not exists file_url text,
  add column if not exists created_at timestamptz default now();

alter table public.resumes enable row level security;

drop policy if exists "resumes_select_own" on public.resumes;
create policy "resumes_select_own" on public.resumes
  for select using (auth.uid() = user_id);

drop policy if exists "resumes_insert_own" on public.resumes;
create policy "resumes_insert_own" on public.resumes
  for insert with check (auth.uid() = user_id);

drop policy if exists "resumes_delete_own" on public.resumes;
create policy "resumes_delete_own" on public.resumes
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------------ skills --
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null default 'Technical',
  level text not null default 'beginner'
    check (level in ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at timestamptz not null default now()
);
alter table public.skills enable row level security;

drop policy if exists "skills_all_own" on public.skills;
create policy "skills_all_own" on public.skills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------- saved_roles --
create table if not exists public.saved_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  summary text,
  demand text,
  salary text,
  created_at timestamptz not null default now(),
  unique (user_id, title)
);
alter table public.saved_roles enable row level security;

drop policy if exists "saved_roles_all_own" on public.saved_roles;
create policy "saved_roles_all_own" on public.saved_roles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------------- rooms --
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_name text not null,
  role text,
  type text,
  status text not null default 'open',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.rooms enable row level security;

drop policy if exists "rooms_insert_authenticated" on public.rooms;
create policy "rooms_insert_authenticated" on public.rooms
  for insert to authenticated with check (true);

drop policy if exists "rooms_select_authenticated" on public.rooms;
create policy "rooms_select_authenticated" on public.rooms
  for select to authenticated using (true);

-- -------------------------------------------------------------- interviews --
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  student_name text,
  type text,
  role text,
  score integer check (score between 0 and 100),
  scheduled_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.interviews enable row level security;

drop policy if exists "interviews_insert_own" on public.interviews;
create policy "interviews_insert_own" on public.interviews
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "interviews_select_own_or_admin" on public.interviews;
create policy "interviews_select_own_or_admin" on public.interviews
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- --------------------------------------------------------------- materials --
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null default 'article' check (type in ('article', 'video', 'course')),
  category text,
  url text,
  created_at timestamptz not null default now()
);
alter table public.materials enable row level security;

drop policy if exists "materials_select_authenticated" on public.materials;
create policy "materials_select_authenticated" on public.materials
  for select to authenticated using (true);

drop policy if exists "materials_write_admin" on public.materials;
create policy "materials_write_admin" on public.materials
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  ) with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ----------------------------------------------------------------- quizzes --
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.quizzes enable row level security;

drop policy if exists "quizzes_select_authenticated" on public.quizzes;
create policy "quizzes_select_authenticated" on public.quizzes
  for select to authenticated using (true);

drop policy if exists "quizzes_write_admin" on public.quizzes;
create policy "quizzes_write_admin" on public.quizzes
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  ) with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ------------------------------------------------------------- assignments --
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  due_date date,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.assignments enable row level security;

drop policy if exists "assignments_select_authenticated" on public.assignments;
create policy "assignments_select_authenticated" on public.assignments
  for select to authenticated using (true);

drop policy if exists "assignments_write_admin" on public.assignments;
create policy "assignments_write_admin" on public.assignments
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  ) with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ------------------------------------------------------------- performance --
create table if not exists public.performance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  category text not null default 'Overall',
  score numeric check (score >= 0),
  recorded_at timestamptz not null default now()
);
alter table public.performance enable row level security;

drop policy if exists "performance_select_own_or_admin" on public.performance;
create policy "performance_select_own_or_admin" on public.performance
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "performance_insert_own" on public.performance;
create policy "performance_insert_own" on public.performance
  for insert to authenticated with check (auth.uid() = user_id);

-- ---------------------------------------------------------------- indexes --
create index if not exists skills_user_idx on public.skills (user_id);
create index if not exists saved_roles_user_idx on public.saved_roles (user_id);
create index if not exists resumes_user_idx on public.resumes (user_id);
create index if not exists interviews_scheduled_idx on public.interviews (scheduled_at);
