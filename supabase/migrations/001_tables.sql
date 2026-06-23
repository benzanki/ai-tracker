-- 001_tables.sql: Create all tables for AI prompt monitoring tool

create extension if not exists "pgcrypto";

-- Prompts to run through AI providers
create table prompts (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  vertical text not null,
  tags text[] not null default '{}',
  active boolean not null default true,
  cadence text not null default 'daily',
  created_at timestamptz not null default now()
);

-- Owned sites and competitor watchlist
create table entities (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  brand_variants text[] not null default '{}',
  ownership text not null check (ownership in ('owned', 'competitor')),
  type text not null check (type in ('lender', 'aggregator', 'other')),
  label text not null
);

-- A single batch execution across all prompts
create table runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'complete', 'failed')),
  provider text not null
);

-- One response per prompt per run
create table responses (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,
  prompt_id uuid not null references prompts(id) on delete cascade,
  provider text not null,
  model text not null,
  answer_text text not null,
  created_at timestamptz not null default now()
);

create index on responses (run_id);
create index on responses (prompt_id);

-- Linked sources cited in a response
create table citations (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references responses(id) on delete cascade,
  entity_id uuid references entities(id) on delete set null,
  url text not null,
  domain text not null,
  position int not null,
  in_body boolean not null default false
);

create index on citations (response_id);
create index on citations (entity_id);

-- Prose mentions of tracked entities in a response
create table entity_mentions (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references responses(id) on delete cascade,
  entity_id uuid not null references entities(id) on delete cascade,
  linked boolean not null default false,
  cited_separately boolean not null default false
);

create index on entity_mentions (response_id);
create index on entity_mentions (entity_id);
