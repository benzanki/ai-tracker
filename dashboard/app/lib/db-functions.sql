-- Supabase Postgres functions (RPC) called by the dashboard.
-- Run these in the Supabase SQL editor or add as a migration (003_functions.sql).

-- ============================================================
-- entity_metrics
-- Returns citation rate, mention rate, citation share, avg position,
-- and mentioned-and-cited rate per entity.
-- ============================================================
create or replace function entity_metrics(
  p_provider text default null,
  p_vertical text default null,
  p_ownership text default null,
  p_type text default null,
  p_entity_id uuid default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null
)
returns table (
  entity_id uuid,
  domain text,
  label text,
  ownership text,
  type text,
  total_responses bigint,
  cited_count bigint,
  mentioned_count bigint,
  mentioned_and_cited_count bigint,
  citation_rate numeric,
  mention_rate numeric,
  mentioned_and_cited_rate numeric,
  citation_share_tracked numeric,
  citation_share_all numeric,
  avg_position numeric
)
language sql stable as $$
  with filtered_responses as (
    select r.id
    from responses r
    join prompts p on p.id = r.prompt_id
    join runs ru on ru.id = r.run_id
    where (p_provider is null or r.provider = p_provider)
      and (p_vertical is null or p.vertical = p_vertical)
      and (p_date_from is null or r.created_at >= p_date_from)
      and (p_date_to is null or r.created_at <= p_date_to)
  ),
  total_resp as (select count(*) as n from filtered_responses),
  total_tracked_citations as (
    select count(*) as n
    from citations c
    join filtered_responses fr on fr.id = c.response_id
    where c.entity_id is not null
  ),
  total_all_citations as (
    select count(*) as n
    from citations c
    join filtered_responses fr on fr.id = c.response_id
  )
  select
    e.id,
    e.domain,
    e.label,
    e.ownership,
    e.type,
    (select n from total_resp) as total_responses,
    count(distinct c.response_id) as cited_count,
    count(distinct em.response_id) as mentioned_count,
    count(distinct case when em.cited_separately then em.response_id end) as mentioned_and_cited_count,
    round(count(distinct c.response_id)::numeric / nullif((select n from total_resp), 0) * 100, 2) as citation_rate,
    round(count(distinct em.response_id)::numeric / nullif((select n from total_resp), 0) * 100, 2) as mention_rate,
    round(count(distinct case when em.cited_separately then em.response_id end)::numeric / nullif((select n from total_resp), 0) * 100, 2) as mentioned_and_cited_rate,
    round(count(distinct c.id)::numeric / nullif((select n from total_tracked_citations), 0) * 100, 2) as citation_share_tracked,
    round(count(distinct c.id)::numeric / nullif((select n from total_all_citations), 0) * 100, 2) as citation_share_all,
    round(avg(c.position), 2) as avg_position
  from entities e
  left join citations c on c.entity_id = e.id
    and c.response_id in (select id from filtered_responses)
  left join entity_mentions em on em.entity_id = e.id
    and em.response_id in (select id from filtered_responses)
  where (p_ownership is null or e.ownership = p_ownership)
    and (p_type is null or e.type = p_type)
    and (p_entity_id is null or e.id = p_entity_id)
  group by e.id, e.domain, e.label, e.ownership, e.type
  order by cited_count desc, mentioned_count desc;
$$;

-- ============================================================
-- portfolio_coverage
-- % of prompts where at least one owned site appears.
-- ============================================================
create or replace function portfolio_coverage(
  p_provider text default null,
  p_vertical text default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null
)
returns table (total_prompts bigint, covered_prompts bigint, coverage_rate numeric)
language sql stable as $$
  with filtered_responses as (
    select r.id, r.prompt_id
    from responses r
    join prompts p on p.id = r.prompt_id
    where (p_provider is null or r.provider = p_provider)
      and (p_vertical is null or p.vertical = p_vertical)
      and (p_date_from is null or r.created_at >= p_date_from)
      and (p_date_to is null or r.created_at <= p_date_to)
  ),
  owned_ids as (select id from entities where ownership = 'owned'),
  covered as (
    select distinct fr.prompt_id
    from filtered_responses fr
    where exists (
      select 1 from citations c
      join owned_ids o on o.id = c.entity_id
      where c.response_id = fr.id
      union
      select 1 from entity_mentions em
      join owned_ids o on o.id = em.entity_id
      where em.response_id = fr.id
    )
  )
  select
    (select count(distinct prompt_id) from filtered_responses) as total_prompts,
    count(*) as covered_prompts,
    round(count(*)::numeric / nullif((select count(distinct prompt_id) from filtered_responses), 0) * 100, 2) as coverage_rate
  from covered;
$$;

-- ============================================================
-- gap_analysis
-- Prompts where a competitor appeared but no owned site did.
-- ============================================================
create or replace function gap_analysis(
  p_provider text default null,
  p_vertical text default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null
)
returns table (
  prompt_id uuid,
  prompt_text text,
  vertical text,
  competitor_domains text[],
  frequency bigint
)
language sql stable as $$
  with filtered_responses as (
    select r.id, r.prompt_id, p.text as prompt_text, p.vertical
    from responses r
    join prompts p on p.id = r.prompt_id
    where (p_provider is null or r.provider = p_provider)
      and (p_vertical is null or p.vertical = p_vertical)
      and (p_date_from is null or r.created_at >= p_date_from)
      and (p_date_to is null or r.created_at <= p_date_to)
  ),
  owned_ids as (select id from entities where ownership = 'owned'),
  competitor_ids as (select id, domain from entities where ownership = 'competitor'),
  gap_responses as (
    select fr.id as response_id, fr.prompt_id, fr.prompt_text, fr.vertical
    from filtered_responses fr
    where not exists (
      select 1 from citations c join owned_ids o on o.id = c.entity_id where c.response_id = fr.id
      union
      select 1 from entity_mentions em join owned_ids o on o.id = em.entity_id where em.response_id = fr.id
    )
    and exists (
      select 1 from citations c join competitor_ids ci on ci.id = c.entity_id where c.response_id = fr.id
    )
  )
  select
    gr.prompt_id,
    gr.prompt_text,
    gr.vertical,
    array_agg(distinct e.domain) as competitor_domains,
    count(distinct gr.response_id) as frequency
  from gap_responses gr
  join citations c on c.response_id = gr.response_id
  join entities e on e.id = c.entity_id and e.ownership = 'competitor'
  group by gr.prompt_id, gr.prompt_text, gr.vertical
  order by frequency desc;
$$;

-- ============================================================
-- cannibalisation
-- Prompts where >1 owned site appears.
-- ============================================================
create or replace function cannibalisation(
  p_provider text default null,
  p_vertical text default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null
)
returns table (
  prompt_id uuid,
  prompt_text text,
  owned_domains text[],
  preferred_domain text,
  preferred_position int
)
language sql stable as $$
  with filtered_responses as (
    select r.id, r.prompt_id, p.text as prompt_text, p.vertical
    from responses r
    join prompts p on p.id = r.prompt_id
    where (p_provider is null or r.provider = p_provider)
      and (p_vertical is null or p.vertical = p_vertical)
      and (p_date_from is null or r.created_at >= p_date_from)
      and (p_date_to is null or r.created_at <= p_date_to)
  ),
  owned_citations as (
    select fr.prompt_id, fr.prompt_text, e.domain, c.position
    from filtered_responses fr
    join citations c on c.response_id = fr.id
    join entities e on e.id = c.entity_id and e.ownership = 'owned'
  ),
  multi_owned as (
    select prompt_id, prompt_text, array_agg(distinct domain) as owned_domains
    from owned_citations
    group by prompt_id, prompt_text
    having count(distinct domain) > 1
  ),
  best_position as (
    select distinct on (oc.prompt_id)
      oc.prompt_id,
      oc.domain as preferred_domain,
      oc.position as preferred_position
    from owned_citations oc
    join multi_owned mo on mo.prompt_id = oc.prompt_id
    order by oc.prompt_id, oc.position asc
  )
  select mo.prompt_id, mo.prompt_text, mo.owned_domains, bp.preferred_domain, bp.preferred_position
  from multi_owned mo
  join best_position bp on bp.prompt_id = mo.prompt_id
  order by array_length(mo.owned_domains, 1) desc;
$$;

-- ============================================================
-- page_citation_rates
-- Which specific owned URLs earn citations.
-- ============================================================
create or replace function page_citation_rates(
  p_provider text default null,
  p_vertical text default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null
)
returns table (
  url text,
  domain text,
  label text,
  cite_count bigint,
  total_responses bigint,
  citation_rate numeric
)
language sql stable as $$
  with filtered_responses as (
    select r.id
    from responses r
    join prompts p on p.id = r.prompt_id
    where (p_provider is null or r.provider = p_provider)
      and (p_vertical is null or p.vertical = p_vertical)
      and (p_date_from is null or r.created_at >= p_date_from)
      and (p_date_to is null or r.created_at <= p_date_to)
  ),
  total as (select count(*) as n from filtered_responses)
  select
    c.url,
    e.domain,
    e.label,
    count(*) as cite_count,
    (select n from total) as total_responses,
    round(count(*)::numeric / nullif((select n from total), 0) * 100, 2) as citation_rate
  from citations c
  join entities e on e.id = c.entity_id and e.ownership = 'owned'
  join filtered_responses fr on fr.id = c.response_id
  group by c.url, e.domain, e.label
  order by cite_count desc;
$$;

-- ============================================================
-- type_share_over_time
-- Citation share by entity type (lender vs aggregator) by day.
-- ============================================================
create or replace function type_share_over_time(
  p_provider text default null,
  p_vertical text default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null
)
returns table (
  date date,
  entity_type text,
  citation_count bigint,
  share numeric
)
language sql stable as $$
  with filtered_responses as (
    select r.id, r.created_at::date as response_date
    from responses r
    join prompts p on p.id = r.prompt_id
    where (p_provider is null or r.provider = p_provider)
      and (p_vertical is null or p.vertical = p_vertical)
      and (p_date_from is null or r.created_at >= p_date_from)
      and (p_date_to is null or r.created_at <= p_date_to)
  ),
  daily_type_counts as (
    select
      fr.response_date as date,
      e.type as entity_type,
      count(*) as citation_count
    from citations c
    join entities e on e.id = c.entity_id
    join filtered_responses fr on fr.id = c.response_id
    group by fr.response_date, e.type
  ),
  daily_totals as (
    select date, sum(citation_count) as total
    from daily_type_counts
    group by date
  )
  select
    dtc.date,
    dtc.entity_type,
    dtc.citation_count,
    round(dtc.citation_count::numeric / nullif(dt.total, 0) * 100, 2) as share
  from daily_type_counts dtc
  join daily_totals dt on dt.date = dtc.date
  order by dtc.date, dtc.entity_type;
$$;
