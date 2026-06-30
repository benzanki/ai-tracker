-- 009_run_summaries.sql
-- Stores AI-generated summaries comparing a run to the previous run.
-- Populated later by the runner; for now this just gives the dashboard
-- a real table to query against (empty until generation is wired up).

create table run_summaries (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade unique,
  summary_text text not null,
  created_at timestamptz not null default now()
);

create index on run_summaries (run_id);
