import { getEntityMetrics, type Filters } from "../lib/queries";
import { EntityTable } from "./EntityTable";

interface Props {
  filters: Filters;
}

export async function EntityTableServer({ filters }: Props) {
  const data = await getEntityMetrics(filters);
  return <EntityTable data={data as any} />;
}
