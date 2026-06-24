import { supabase } from "../lib/supabase";
import { ProviderShareChart } from "./ProviderShareChart";
import type { Filters } from "../lib/queries";

interface Props {
  filters: Filters;
}

export async function ProviderShareServer({ filters }: Props) {
  const [{ data: rows }, { data: entities }] = await Promise.all([
    supabase.rpc("provider_citation_detail", {
      p_vertical: filters.vertical ?? null,
      p_tag: filters.tag ?? null,
      p_date_from: filters.dateFrom ?? null,
      p_date_to: filters.dateTo ?? null,
    }),
    supabase
      .from("entities")
      .select("id, label, ownership")
      .order("ownership")
      .order("label"),
  ]);

  const entityList = (entities ?? []).map((e: { id: string; label: string; ownership: string }) => ({
    entity_id: e.id,
    label: e.label,
    ownership: e.ownership,
  }));

  return (
    <ProviderShareChart
      key={filters.entityId ?? "all"}
      rows={(rows as any[]) ?? []}
      entities={entityList}
      preselectedEntityId={filters.entityId}
    />
  );
}
