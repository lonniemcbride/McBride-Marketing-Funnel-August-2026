-- Rate limiting, stored in the same Supabase project rather than a
-- separate Redis service — nothing here is exposed to the anon key, only
-- called by the service-role routes (/api/survey/submit and
-- /api/survey/upload-url), which already bypass RLS entirely.

create table if not exists rate_limit_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  purpose text not null,
  track text not null,
  ip text not null
);

create index if not exists rate_limit_events_lookup
  on rate_limit_events (purpose, track, ip, created_at);

alter table rate_limit_events enable row level security;
-- No policies added — service role bypasses RLS anyway, and this ensures
-- the anon/authenticated roles have no access if ever queried directly.

-- Records this attempt, then returns whether the caller is still within
-- p_limit attempts in the trailing p_window. Insert-then-count in one
-- function call (rather than a SELECT and an INSERT as two separate round
-- trips from application code) keeps the race window a single query
-- instead of a full network round trip — not a hard guarantee under truly
-- concurrent requests, but this is anti-abuse tooling, not billing, so
-- that's an acceptable trade-off for the much simpler implementation.
create or replace function check_rate_limit(
  p_purpose text,
  p_track text,
  p_ip text,
  p_limit integer,
  p_window interval
) returns boolean
language plpgsql
as $$
declare
  v_count integer;
begin
  insert into rate_limit_events (purpose, track, ip) values (p_purpose, p_track, p_ip);

  select count(*) into v_count
  from rate_limit_events
  where purpose = p_purpose
    and track = p_track
    and ip = p_ip
    and created_at > now() - p_window;

  return v_count <= p_limit;
end;
$$;
