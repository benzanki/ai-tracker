import { supabase } from "../lib/supabase";
import { CitationRateChart } from "./CitationRateChart";
import { TypeShareChart } from "./TypeShareChart";
import type { Filters } from "../lib/queries";

interface Props {
  filters: Filters;
}

export async function TrendCharts({ filters }: Props) {
  // Fetch citation rate per day for owned entities
  const { data: citationRows } = await supabase.rpc("entity_metrics_by_day", {
    p_provider: filters.provider ?? null,
    p_vertical: filters.vertical ?? null,
    p_date_from: filters.dateFrom ?? null,
    p_date_to: filters.dateTo ?? null,
  });

  // Fetch type share over time
  const { data: typeRows } = await supabase.rpc("type_share_over_time", {
    p_provider: filters.provider ?? null,
    p_vertical: filters.vertical ?? null,
    p_date_from: filters.dateFrom ?? null,
    p_date_to: filters.dateTo ?? null,
  });

  // Build citation rate chart data: [{ date, 'loans.com.au': 25, 'savings.com.au': 50, ... }]
  const dateEntityMap = new Map<string, Record<string, number>>();
  const ownedEntities = new Set<string>();

  for (const row of (citationRows as Array<{
    date: string;
    label: string;
    ownership: string;
    citation_rate: number;
  }> ?? [])) {
    if (row.ownership !== "owned") continue;
    ownedEntities.add(row.label);
    if (!dateEntityMap.has(row.date)) dateEntityMap.set(row.date, {});
    dateEntityMap.get(row.date)![row.label] = Number(row.citation_rate);
  }

  const citationChartData = [...dateEntityMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));

  // Build type share chart data: [{ date, lender: 40, aggregator: 55, other: 5 }]
  const typeMap = new Map<string, Record<string, number>>();
  for (const row of (typeRows as Array<{
    date: string;
    entity_type: string;
    share: number;
  }> ?? [])) {
    if (!typeMap.has(row.date)) typeMap.set(row.date, {});
    typeMap.get(row.date)![row.entity_type] = Number(row.share);
  }

  const typeChartData = [...typeMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div className="section">
        <h2 className="section-title">Owned site citation rate over time</h2>
        <CitationRateChart
          data={citationChartData}
          entities={[...ownedEntities]}
        />
      </div>
      <div className="section">
        <h2 className="section-title">Lender vs aggregator citation share</h2>
        <TypeShareChart data={typeChartData} />
      </div>
    </div>
  );
}
