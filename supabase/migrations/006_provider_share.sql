-- 006_provider_share.sql
-- Citation share by provider over time, filterable by entity or ownership group.

create or replace function provider_citation_share(
  p_vertical text default null,
  p_tag text default null,
  p_entity_ids uuid[] default null,
  p_ownership text default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null
)
returns table (
  date text,
  provider text,
  citation_count bigint,
  total_citations bigint,
  share numeric
)
language sql stable as $$
  with filtered_responses as (
    select r.id, r.provider, r.created_at::date as response_date
    from responses r
    join prompts p on p.id = r.prompt_id
    where (p_vertical is null or p.vertical = p_vertical)
      and (p_tag is null or p_tag = any(p.tags))
      and (p_date_from is null or r.created_at >= p_date_from)
      and (p_date_to is null or r.created_at <= p_date_to)
  ),
  filtered_citations as (
    select c.id, c.entity_id, fr.provider, fr.response_date
    from citations c
    join filtered_responses fr on fr.id = c.response_id
    join entities e on e.id = c.entity_id
    where
      -- entity filter: specific entities or ownership group
      case
        when p_entity_ids is not null then c.entity_id = any(p_entity_ids)
        when p_ownership = 'owned' then e.ownership = 'owned'
        when p_ownership = 'competitor' then e.ownership = 'competitor'
        else c.entity_id is not null  -- 'all' = all tracked entities
      end
  ),
  daily_provider_counts as (
    select
      response_date,
      provider,
      count(*) as citation_count
    from filtered_citations
    group by response_date, provider
  ),
  daily_totals as (
    select response_date, sum(citation_count) as total
    from daily_provider_counts
    group by response_date
  )
  select
    dpc.response_date::text as date,
    dpc.provider,
    dpc.citation_count,
    dt.total as total_citations,
    round(dpc.citation_count::numeric / nullif(dt.total, 0) * 100, 2) as share
  from daily_provider_counts dpc
  join daily_totals dt on dt.response_date = dpc.response_date
  order by dpc.response_date, dpc.provider;
$$;
