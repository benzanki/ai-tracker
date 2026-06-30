import { supabase } from "./supabase";

export interface Filters {
  provider?: string;
  vertical?: string;
  tag?: string;
  ownership?: "owned" | "competitor" | "tracked" | "untracked";
  type?: "lender" | "aggregator" | "other";
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ----------------------------------------------------------------
// Entity-level metrics
// ----------------------------------------------------------------

export async function getEntityMetrics(filters: Filters) {
  // 'tracked' and 'untracked' are UI concepts — translate before hitting the DB.
  // 'tracked' = pass null (all entities are tracked by definition in this function)
  // 'untracked' = no entity rows exist for untracked sites, return empty
  if (filters.ownership === "untracked") return [];

  const p_ownership =
    filters.ownership === "tracked" ? null : (filters.ownership ?? null);

  const { data, error } = await supabase.rpc("entity_metrics", {
    p_provider: filters.provider ?? null,
    p_vertical: filters.vertical ?? null,
    p_tag: filters.tag ?? null,
    p_ownership,
    p_type: filters.type ?? null,
    p_entity_id: filters.entityId ?? null,
    p_date_from: filters.dateFrom ?? null,
    p_date_to: filters.dateTo ?? null,
  });

  if (error) throw error;
  return data;
}

// ----------------------------------------------------------------
// Portfolio coverage
// ----------------------------------------------------------------

export async function getPortfolioCoverage(filters: Filters) {
  const { data, error } = await supabase.rpc("portfolio_coverage", {
    p_provider: filters.provider ?? null,
    p_vertical: filters.vertical ?? null,
    p_tag: filters.tag ?? null,
    p_date_from: filters.dateFrom ?? null,
    p_date_to: filters.dateTo ?? null,
  });
  if (error) throw error;
  return data as {
    total_prompts: number;
    covered_prompts: number;
    coverage_rate: number;
  };
}

// ----------------------------------------------------------------
// Gap analysis: prompts where competitors appear but no owned site
// ----------------------------------------------------------------

export async function getGapAnalysis(filters: Filters) {
  const { data, error } = await supabase.rpc("gap_analysis", {
    p_provider: filters.provider ?? null,
    p_vertical: filters.vertical ?? null,
    p_tag: filters.tag ?? null,
    p_date_from: filters.dateFrom ?? null,
    p_date_to: filters.dateTo ?? null,
  });
  if (error) throw error;
  return data as Array<{
    prompt_text: string;
    vertical: string;
    competitor_domains: string[];
    frequency: number;
  }>;
}

// ----------------------------------------------------------------
// Cannibalisation: prompts where >1 owned site appears
// ----------------------------------------------------------------

export async function getCannibalisation(filters: Filters) {
  const { data, error } = await supabase.rpc("cannibalisation", {
    p_provider: filters.provider ?? null,
    p_vertical: filters.vertical ?? null,
    p_tag: filters.tag ?? null,
    p_date_from: filters.dateFrom ?? null,
    p_date_to: filters.dateTo ?? null,
  });
  if (error) throw error;
  return data as Array<{
    prompt_text: string;
    owned_domains: string[];
    preferred_domain: string;
    preferred_position: number;
  }>;
}

// ----------------------------------------------------------------
// Page-level citation rate (top cited URLs for owned entities)
// ----------------------------------------------------------------

export async function getPageCitationRates(filters: Filters) {
  const { data, error } = await supabase.rpc("page_citation_rates", {
    p_provider: filters.provider ?? null,
    p_vertical: filters.vertical ?? null,
    p_tag: filters.tag ?? null,
    p_date_from: filters.dateFrom ?? null,
    p_date_to: filters.dateTo ?? null,
  });
  if (error) throw error;
  return data as Array<{
    url: string;
    domain: string;
    label: string;
    cite_count: number;
    total_responses: number;
    citation_rate: number;
  }>;
}

// ----------------------------------------------------------------
// Lender vs aggregator citation share over time
// ----------------------------------------------------------------

export async function getTypeShareOverTime(filters: Filters) {
  const { data, error } = await supabase.rpc("type_share_over_time", {
    p_provider: filters.provider ?? null,
    p_vertical: filters.vertical ?? null,
    p_tag: filters.tag ?? null,
    p_date_from: filters.dateFrom ?? null,
    p_date_to: filters.dateTo ?? null,
  });
  if (error) throw error;
  return data as Array<{
    date: string;
    entity_type: string;
    citation_count: number;
    share: number;
  }>;
}

// ----------------------------------------------------------------
// Filter option enumerations
// ----------------------------------------------------------------

export async function getProviders() {
  const { data, error } = await supabase
    .from("runs")
    .select("provider")
    .order("provider");
  if (error) throw error;
  return [...new Set((data ?? []).map((r: { provider: string }) => r.provider))];
}

export async function getVerticals() {
  const { data, error } = await supabase
    .from("prompts")
    .select("vertical")
    .order("vertical");
  if (error) throw error;
  return [...new Set((data ?? []).map((r: { vertical: string }) => r.vertical))];
}

export async function getUntrackedCitations(filters: Filters) {
  const { data, error } = await supabase.rpc("untracked_citations", {
    p_provider: filters.provider ?? null,
    p_vertical: filters.vertical ?? null,
    p_tag: filters.tag ?? null,
    p_date_from: filters.dateFrom ?? null,
    p_date_to: filters.dateTo ?? null,
  });
  if (error) throw error;
  return data as Array<{
    domain: string;
    cite_count: number;
    total_responses: number;
    citation_rate: number;
  }>;
}

export async function getTags() {
  const { data, error } = await supabase.from("prompts").select("tags");
  if (error) throw error;
  const all = (data ?? []).flatMap((r: { tags: string[] }) => r.tags);
  return [...new Set(all)].sort();
}

// ----------------------------------------------------------------
// Run summaries: recent days with their AI-generated summary (if any).
// A single day's batch can produce multiple `runs` rows (one per
// provider), so summaries are grouped and keyed by calendar date.
// ----------------------------------------------------------------

export async function getRecentRunSummaries(dayLimit = 5) {
  const { data: runs, error: runsError } = await supabase
    .from("runs")
    .select("id, provider, started_at, finished_at, status")
    .order("started_at", { ascending: false })
    .limit(dayLimit * 5); // enough rows to cover dayLimit distinct days across providers
  if (runsError) throw runsError;
  if (!runs || runs.length === 0) return [];

  const dayMap = new Map<string, typeof runs>();
  for (const run of runs) {
    const date = run.started_at.slice(0, 10);
    if (!dayMap.has(date)) dayMap.set(date, []);
    dayMap.get(date)!.push(run);
  }

  const dates = [...dayMap.keys()].sort((a, b) => (a < b ? 1 : -1)).slice(0, dayLimit);

  const { data: summaries, error: summariesError } = await supabase
    .from("run_day_summaries")
    .select("run_date, summary_text, created_at")
    .in("run_date", dates);
  if (summariesError) throw summariesError;

  const summaryByDate = new Map((summaries ?? []).map((s) => [s.run_date, s]));

  return dates.map((date) => ({
    date,
    runs: dayMap.get(date)!,
    summary: summaryByDate.get(date) ?? null,
  }));
}

export async function getEntities(ownership?: string) {
  let q = supabase.from("entities").select("id, label, domain, ownership, type").order("label");
  if (ownership) q = q.eq("ownership", ownership);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}
