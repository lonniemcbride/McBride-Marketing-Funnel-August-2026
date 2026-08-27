-- Recruiter admin view — run once, after schema.sql.
-- Adds: a status column on each track's survey table, a recruiter_profiles
-- table that tags each Supabase Auth user with a team, and RLS policies so
-- an authenticated recruiter can only read/update their own team's data.

-- ============================================================
-- Status column (candidate pipeline state)
-- ============================================================

alter table nato_survey_responses
  add column if not exists status text not null default 'New'
  check (status in ('New', 'Contacted', 'Matched', 'Not a fit'));

alter table air_force_survey_responses
  add column if not exists status text not null default 'New'
  check (status in ('New', 'Contacted', 'Matched', 'Not a fit'));

-- ============================================================
-- Recruiter profiles (who belongs to which team)
-- ============================================================

create table if not exists recruiter_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  team text not null check (team in ('nato', 'air_force')),
  display_name text
);

alter table recruiter_profiles enable row level security;

create policy "Recruiters can read their own profile" on recruiter_profiles
  for select
  to authenticated
  using (id = auth.uid());

-- ============================================================
-- Team-gated read/update access to survey data
-- ============================================================

create policy "NATO recruiters can view NATO submissions" on nato_survey_responses
  for select
  to authenticated
  using (
    exists (
      select 1 from recruiter_profiles
      where id = auth.uid() and team = 'nato'
    )
  );

create policy "NATO recruiters can update NATO submissions" on nato_survey_responses
  for update
  to authenticated
  using (
    exists (
      select 1 from recruiter_profiles
      where id = auth.uid() and team = 'nato'
    )
  );

create policy "Air Force recruiters can view Air Force submissions" on air_force_survey_responses
  for select
  to authenticated
  using (
    exists (
      select 1 from recruiter_profiles
      where id = auth.uid() and team = 'air_force'
    )
  );

create policy "Air Force recruiters can update Air Force submissions" on air_force_survey_responses
  for update
  to authenticated
  using (
    exists (
      select 1 from recruiter_profiles
      where id = auth.uid() and team = 'air_force'
    )
  );

-- ============================================================
-- Team-gated resume downloads (signed URLs only — buckets stay private)
-- ============================================================

create policy "NATO recruiters can read NATO resumes" on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'resumes-nato'
    and exists (
      select 1 from recruiter_profiles
      where id = auth.uid() and team = 'nato'
    )
  );

create policy "Air Force recruiters can read Air Force resumes" on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'resumes-air-force'
    and exists (
      select 1 from recruiter_profiles
      where id = auth.uid() and team = 'air_force'
    )
  );

-- ============================================================
-- After running this file: create recruiter accounts manually.
-- 1. Supabase dashboard -> Authentication -> Users -> Add user
--    (set an email + password for the recruiter).
-- 2. Copy their User UID, then run for each recruiter:
--
--    insert into recruiter_profiles (id, team, display_name)
--    values ('<user-uid-from-step-1>', 'nato', 'Recruiter Name');
--
--    (use 'air_force' for Air Force team recruiters)
-- ============================================================
