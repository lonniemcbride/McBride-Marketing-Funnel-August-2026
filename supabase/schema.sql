-- McBride Core Survey — two fully independent funnels (NATO / Air Force).
-- Same question set, but separate tables, buckets, and policies per track —
-- no data ever mixes between the two. Run this once in the Supabase SQL
-- editor for your project.

-- ============================================================
-- NATO track (McBride International)
-- ============================================================

create table if not exists nato_survey_responses (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),

  -- Contact & Basics
  c1_full_name text not null,
  c2_email text not null,
  c3_phone text not null,
  c4_location text not null,
  c6_linkedin_url text,
  resume_path text not null,

  -- Clearance & Eligibility (self-reported only — see Compliance Notes)
  cl1_citizenship text not null,
  cl2_clearance_status text not null,
  cl3_clearance_level text,
  cl4_investigation_tier text,
  cl5_clearance_date text,
  cl6_polygraph_status text,
  cl7_clearance_sponsor text,

  -- Professional Background
  p1_domain text not null,
  p2_years_experience text not null,
  p3_experience_band text not null,
  p4_certifications text[] not null default '{}',
  p4_certifications_other text,
  p5_programs_platforms text,

  -- Motivation & Fit
  m1_why_this_work text not null,
  m2_priorities text[] not null,
  m3_job_search_status text not null,

  -- Work Style & Logistics
  w1_location_model text not null,
  w2_relocate text not null,
  w3_oconus text not null,
  w4_availability text not null,
  w5_compensation text,

  -- Entry-Level Add-On (only populated when p3_experience_band = 'Entry')
  e1_sponsorship_interest text,
  e2_training_background text,
  e3_mentorship_interest text,

  -- Principal-Level Add-On (only populated when p3_experience_band = 'Principal')
  pr1_leadership_scope text,
  pr2_bd_willingness text,
  pr3_technical_authority text,

  -- Consent & Next Steps
  cn2_contact_preference text not null,
  consent_given_at timestamptz not null,
  consent_text_version text not null
);

alter table nato_survey_responses enable row level security;

create policy "Allow public insert" on nato_survey_responses
  for insert
  to anon
  with check (true);

insert into storage.buckets (id, name, public)
values ('resumes-nato', 'resumes-nato', false)
on conflict (id) do nothing;

create policy "Allow public upload to resumes-nato" on storage.objects
  for insert
  to anon
  with check (bucket_id = 'resumes-nato');

-- ============================================================
-- Air Force track (McBride)
-- ============================================================

create table if not exists air_force_survey_responses (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),

  c1_full_name text not null,
  c2_email text not null,
  c3_phone text not null,
  c4_location text not null,
  c6_linkedin_url text,
  resume_path text not null,

  cl1_citizenship text not null,
  cl2_clearance_status text not null,
  cl3_clearance_level text,
  cl4_investigation_tier text,
  cl5_clearance_date text,
  cl6_polygraph_status text,
  cl7_clearance_sponsor text,

  p1_domain text not null,
  p2_years_experience text not null,
  p3_experience_band text not null,
  p4_certifications text[] not null default '{}',
  p4_certifications_other text,
  p5_programs_platforms text,

  m1_why_this_work text not null,
  m2_priorities text[] not null,
  m3_job_search_status text not null,

  w1_location_model text not null,
  w2_relocate text not null,
  w3_oconus text not null,
  w4_availability text not null,
  w5_compensation text,

  e1_sponsorship_interest text,
  e2_training_background text,
  e3_mentorship_interest text,

  pr1_leadership_scope text,
  pr2_bd_willingness text,
  pr3_technical_authority text,

  cn2_contact_preference text not null,
  consent_given_at timestamptz not null,
  consent_text_version text not null
);

alter table air_force_survey_responses enable row level security;

create policy "Allow public insert" on air_force_survey_responses
  for insert
  to anon
  with check (true);

insert into storage.buckets (id, name, public)
values ('resumes-air-force', 'resumes-air-force', false)
on conflict (id) do nothing;

create policy "Allow public upload to resumes-air-force" on storage.objects
  for insert
  to anon
  with check (bucket_id = 'resumes-air-force');
