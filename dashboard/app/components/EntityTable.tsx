import { getEntityMetrics, type Filters } from "../lib/queries";

interface Props {
  filters: Filters;
}

interface EntityRow {
  entity_id: string;
  domain: string;
  label: string;
  ownership: string;
  type: string;
  total_responses: number;
  cited_count: number;
  mentioned_count: number;
  mentioned_and_cited_count: number;
  citation_rate: number;
  mention_rate: number;
  mentioned_and_cited_rate: number;
  citation_share_tracked: number;
  citation_share_all: number;
  avg_position: number | null;
}

export async function EntityTable({ filters }: Props) {
  const data = (await getEntityMetrics(filters)) as EntityRow[];

  if (!data || data.length === 0) {
    return <p className="empty">No data yet. Run the batch to populate.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Entity</th>
            <th>Ownership</th>
            <th>Type</th>
            <th>Responses</th>
            <th>Citation rate</th>
            <th>Mention rate</th>
            <th>Mentioned &amp; cited</th>
            <th>Share (tracked)</th>
            <th>Share (all)</th>
            <th>Avg position</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.entity_id}>
              <td>
                <strong>{row.label}</strong>
                <br />
                <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                  {row.domain}
                </span>
              </td>
              <td>
                <span className={`badge badge-${row.ownership}`}>
                  {row.ownership}
                </span>
              </td>
              <td>{row.type}</td>
              <td>{row.total_responses}</td>
              <td>{row.citation_rate ?? 0}%</td>
              <td>{row.mention_rate ?? 0}%</td>
              <td>{row.mentioned_and_cited_rate ?? 0}%</td>
              <td>{row.citation_share_tracked ?? 0}%</td>
              <td>{row.citation_share_all ?? 0}%</td>
              <td>{row.avg_position ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
