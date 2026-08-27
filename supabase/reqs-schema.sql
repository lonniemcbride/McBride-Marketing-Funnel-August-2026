-- Reqs, matching, and the Role-Specific Supplement — run once, after
-- schema.sql and admin-schema.sql.

-- ============================================================
-- Requisitions
-- ============================================================

create table if not exists nato_reqs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  domain text not null,
  duty_location text not null,
  need_by_date date,
  key_requirement text,
  status text not null default 'Open' check (status in ('Open', 'Filled', 'Closed'))
);

create table if not exists air_force_reqs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  domain text not null,
  duty_location text not null,
  need_by_date date,
  key_requirement text,
  status text not null default 'Open' check (status in ('Open', 'Filled', 'Closed'))
);

alter table nato_reqs enable row level security;
alter table air_force_reqs enable row level security;

create policy "NATO recruiters manage NATO reqs" on nato_reqs
  for all
  to authenticated
  using (exists (select 1 from recruiter_profiles where id = auth.uid() and team = 'nato'))
  with check (exists (select 1 from recruiter_profiles where id = auth.uid() and team = 'nato'));

create policy "Air Force recruiters manage Air Force reqs" on air_force_reqs
  for all
  to authenticated
  using (exists (select 1 from recruiter_profiles where id = auth.uid() and team = 'air_force'))
  with check (exists (select 1 from recruiter_profiles where id = auth.uid() and team = 'air_force'));

-- ============================================================
-- Matching (one active match per candidate, tracked on the candidate row)
-- ============================================================

alter table nato_survey_responses
  add column if not exists matched_req_id uuid references nato_reqs(id);

alter table air_force_survey_responses
  add column if not exists matched_req_id uuid references air_force_reqs(id);

-- ============================================================
-- Role-Specific Supplement responses
-- No RLS policies here at all, intentionally: the public-facing supplement
-- page never talks to Supabase directly with the anon key (a policy
-- permissive enough to fetch one row by id would also let anyone list the
-- whole table). Instead a server-side API route uses the service-role key
-- to read/write exactly one row after validating the id. Recruiters read
-- these via a join from the candidate/dossier views, which run under their
-- own authenticated session against nato_survey_responses /
-- nato_reqs — so a direct "grant select to authenticated" policy here,
-- scoped by team, is still useful for that join and is included below.
-- ============================================================

create table if not exists nato_supplement_responses (
  id uuid primary key default gen_random_uuid(),
  survey_response_id uuid not null references nato_survey_responses(id),
  req_id uuid not null references nato_reqs(id),
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  direct_experience text,
  confidence_rating text,
  available_by_need_date text,
  duty_location_workable text,
  notes_for_recruiter text
);

create table if not exists air_force_supplement_responses (
  id uuid primary key default gen_random_uuid(),
  survey_response_id uuid not null references air_force_survey_responses(id),
  req_id uuid not null references air_force_reqs(id),
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  direct_experience text,
  confidence_rating text,
  available_by_need_date text,
  duty_location_workable text,
  notes_for_recruiter text
);

alter table nato_supplement_responses enable row level security;
alter table air_force_supplement_responses enable row level security;

create policy "NATO recruiters can view NATO supplement responses" on nato_supplement_responses
  for select
  to authenticated
  using (exists (select 1 from recruiter_profiles where id = auth.uid() and team = 'nato'));

create policy "NATO recruiters can create NATO supplement responses" on nato_supplement_responses
  for insert
  to authenticated
  with check (exists (select 1 from recruiter_profiles where id = auth.uid() and team = 'nato'));

create policy "Air Force recruiters can view Air Force supplement responses" on air_force_supplement_responses
  for select
  to authenticated
  using (exists (select 1 from recruiter_profiles where id = auth.uid() and team = 'air_force'));

create policy "Air Force recruiters can create Air Force supplement responses" on air_force_supplement_responses
  for insert
  to authenticated
  with check (exists (select 1 from recruiter_profiles where id = auth.uid() and team = 'air_force'));
