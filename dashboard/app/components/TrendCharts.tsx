import { supabase } from "../lib/supabase";
import { CitationRateChart } from "./CitationRateChart";
import { TypeShareChart } from "./TypeShareChart";
import { InfoTooltip } from "./InfoTooltip";
import type { Filters } from "../lib/queries";

interface Props {
  filters: Filters;
}

export async function TrendCharts({ filters }: Props) {
  const { data: citationRows } = await supabase.rpc("entity_metrics_by_day", {
    p_provider: filters.provider ?? null,
    p_vertical: filters.vertical ?? null,
    p_tag: filters.tag ?? null,
    p_date_from: filters.dateFrom ?? null,
    p_date_to: filters.dateTo ?? null,
  });

  const { data: typeRows } = await supabase.rpc("type_share_over_time", {
    p_provider: filters.provider ?? null,
    p_vertical: filters.vertical ?? null,
    p_tag: filters.tag ?? null,
    p_date_from: filters.dateFrom ?? null,
    p_date_to: filters.dateTo ?? null,
  });

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
        <h2 className="section-title">
          Citation rate over time
          <InfoTooltip text="Citation rate = % of prompts where the entity was cited as a source. Mention rate = % where it was named in the answer content. Mentioned & cited = % where both occurred." />
        </h2>
        <CitationRateChart rows={(citationRows as any[]) ?? []} />
      </div>
      <div className="section">
        <h2 className="section-title">
          Lender vs aggregator citation share
          <InfoTooltip text="Share of all tracked-entity citations going to lenders vs aggregators, by day." />
        </h2>
        <TypeShareChart data={typeChartData} />
      </div>
    </div>
  );
}
