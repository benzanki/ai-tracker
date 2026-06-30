-- 011_run_day_summaries.sql
-- Replaces per-run summaries with per-day summaries. A single day's batch
-- can produce multiple rows in `runs` (one per provider), so the summary
-- should cover the whole day's batch across all providers, not one run.

create table run_day_summaries (
  id uuid primary key default gen_random_uuid(),
  run_date date not null unique,
  summary_text text not null,
  created_at timestamptz not null default now()
);

drop table if exists run_summaries;
