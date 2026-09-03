-- P0-1 / P0-2: close the direct-API write path.
--
-- Today's anon "insert ... with check (true)" policies (from schema.sql)
-- let anyone with the public anon key POST straight to the tables/buckets,
-- bypassing the form, Turnstile, rate limiting, and validation entirely.
-- This drops those policies so the only writer left is the service-role
-- key used by /api/survey/submit and /api/survey/upload-url — and sets
-- real size/type limits on the storage buckets themselves, which Supabase
-- enforces on every upload regardless of how the upload was authorized.

-- ============================================================
-- Remove public write access — service role is now the only writer
-- ============================================================

drop policy if exists "Allow public insert" on nato_survey_responses;
drop policy if exists "Allow public insert" on air_force_survey_responses;

drop policy if exists "Allow public upload to resumes-nato" on storage.objects;
drop policy if exists "Allow public upload to resumes-air-force" on storage.objects;

-- ============================================================
-- Bucket-level size/MIME enforcement (applies even to signed uploads)
-- ============================================================

update storage.buckets set
  file_size_limit = 10485760, -- 10MB
  allowed_mime_types = array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
where id in ('resumes-nato', 'resumes-air-force');
