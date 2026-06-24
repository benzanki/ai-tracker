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
  // Base query: join responses → prompts for vertical filtering
  // and citations / entity_mentions for metrics
  let query = supabase.rpc("entity_metrics", {
    p_provider: filters.provider ?? null,
    p_vertical: filters.vertical ?? null,
    p_tag: filters.tag ?? null,
    p_ownership: filters.ownership ?? null,
    p_type: filters.type ?? null,
    p_entity_id: filters.entityId ?? null,
    p_date_from: filters.dateFrom ?? null,
    p_date_to: filters.dateTo ?? null,
  });

  const { data, error } = await query;
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

export async function getEntities(ownership?: string) {
  let q = supabase.from("entities").select("id, label, domain, ownership, type").order("label");
  if (ownership) q = q.eq("ownership", ownership);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}
