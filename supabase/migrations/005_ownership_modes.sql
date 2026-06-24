-- 005_ownership_modes.sql
-- Extends ownership filter to support 'tracked' (owned+competitor) and 'untracked'.
-- 'tracked' = entity_id is not null (appears in entities table)
-- 'untracked' = entity_id is null (citation domain not in entities table)
-- For entity_metrics, 'untracked' doesn't apply (no entity row exists) so it returns empty.

create or replace function entity_metrics(
  p_provider text default null,
  p_vertical text default null,
  p_tag text default null,
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
      and (p_tag is null or p_tag = any(p.tags))
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
  where
    case
      when p_ownership = 'tracked' then true  -- all entities are tracked by definition
      when p_ownership = 'untracked' then false  -- no entity rows for untracked
      when p_ownership is null then true
      else e.ownership = p_ownership
    end
    and (p_type is null or e.type = p_type)
    and (p_entity_id is null or e.id = p_entity_id)
  group by e.id, e.domain, e.label, e.ownership, e.type
  order by cited_count desc, mentioned_count desc;
$$;

-- Untracked citations view: domains appearing in citations with no entity match
create or replace function untracked_citations(
  p_provider text default null,
  p_vertical text default null,
  p_tag text default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null
)
returns table (
  domain text,
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
      and (p_tag is null or p_tag = any(p.tags))
      and (p_date_from is null or r.created_at >= p_date_from)
      and (p_date_to is null or r.created_at <= p_date_to)
  ),
  total as (select count(*) as n from filtered_responses)
  select
    c.domain,
    count(*) as cite_count,
    (select n from total) as total_responses,
    round(count(*)::numeric / nullif((select n from total), 0) * 100, 2) as citation_rate
  from citations c
  join filtered_responses fr on fr.id = c.response_id
  where c.entity_id is null
  group by c.domain
  order by cite_count desc;
$$;
