-- Migration for Job Applications tracking
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null,
  role text not null,
  location text,
  job_url text,
  status text not null default 'Applied' check (status in ('Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected')),
  applied_at date default current_date,
  deadline date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.job_applications enable row level security;

drop policy if exists "job_applications_all_own" on public.job_applications;
create policy "job_applications_all_own" on public.job_applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists job_applications_user_idx on public.job_applications (user_id);
