-- 008_provider_citation_detail.sql
-- Returns per-entity, per-provider, per-day citation counts.
-- No entity/ownership filtering — fetch everything once and filter client-side.

create or replace function provider_citation_detail(
  p_vertical text default null,
  p_tag text default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null
)
returns table (
  date text,
  provider text,
  entity_id uuid,
  ownership text,
  citation_count bigint
)
language sql stable as $$
  select
    r.created_at::date::text as date,
    r.provider,
    c.entity_id,
    e.ownership,
    count(*) as citation_count
  from citations c
  join responses r on r.id = c.response_id
  join prompts p on p.id = r.prompt_id
  join entities e on e.id = c.entity_id
  where (p_vertical is null or p.vertical = p_vertical)
    and (p_tag is null or p_tag = any(p.tags))
    and (p_date_from is null or r.created_at >= p_date_from)
    and (p_date_to is null or r.created_at <= p_date_to)
  group by r.created_at::date, r.provider, c.entity_id, e.ownership
  order by r.created_at::date, r.provider, e.ownership;
$$;
