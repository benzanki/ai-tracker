import { supabase } from "../lib/supabase";
import { ProviderShareChart } from "./ProviderShareChart";
import type { Filters } from "../lib/queries";

interface Props {
  filters: Filters;
  entityIds: string[];
  psOwnership: string;
}

export async function ProviderShareServer({ filters, entityIds, psOwnership }: Props) {
  const hasEntities = entityIds.length > 0;

  const { data: rows } = await supabase.rpc("provider_citation_share", {
    p_vertical: filters.vertical ?? null,
    p_tag: filters.tag ?? null,
    p_entity_ids: hasEntities ? entityIds : null,
    p_ownership: hasEntities ? null : (psOwnership || null),
    p_date_from: filters.dateFrom ?? null,
    p_date_to: filters.dateTo ?? null,
  });

  const { data: entities } = await supabase
    .from("entities")
    .select("id, label, ownership")
    .order("ownership")
    .order("label");

  const entityList = (entities ?? []).map((e: { id: string; label: string; ownership: string }) => ({
    entity_id: e.id,
    label: e.label,
    ownership: e.ownership,
  }));

  return (
    <ProviderShareChart
      rows={(rows as any[]) ?? []}
      entities={entityList}
      currentEntityIds={entityIds}
      currentOwnership={psOwnership}
    />
  );
}
