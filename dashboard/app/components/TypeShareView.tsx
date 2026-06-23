import { getTypeShareOverTime, type Filters } from "../lib/queries";

interface Props {
  filters: Filters;
}

interface TypeShareRow {
  date: string;
  entity_type: string;
  citation_count: number;
  share: number;
}

export async function TypeShareView({ filters }: Props) {
  const data = (await getTypeShareOverTime(filters)) as TypeShareRow[];

  if (!data || data.length === 0) {
    return <p className="empty">No data yet.</p>;
  }

  // Group by date for table display
  const byDate = new Map<string, Record<string, TypeShareRow>>();
  for (const row of data) {
    if (!byDate.has(row.date)) byDate.set(row.date, {});
    byDate.get(row.date)![row.entity_type] = row;
  }

  const types = [...new Set(data.map((r) => r.entity_type))].sort();
  const dates = [...byDate.keys()].sort().reverse();

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          {types.map((t) => (
            <th key={t}>
              {t} citations
            </th>
          ))}
          {types.map((t) => (
            <th key={`${t}-share`}>
              {t} share
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dates.map((date) => {
          const row = byDate.get(date)!;
          return (
            <tr key={date}>
              <td>{date}</td>
              {types.map((t) => (
                <td key={t}>{row[t]?.citation_count ?? 0}</td>
              ))}
              {types.map((t) => (
                <td key={`${t}-share`}>{row[t]?.share ?? 0}%</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
