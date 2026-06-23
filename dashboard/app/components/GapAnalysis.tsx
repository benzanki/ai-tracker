import { getGapAnalysis, type Filters } from "../lib/queries";

interface Props {
  filters: Filters;
}

interface GapRow {
  prompt_id: string;
  prompt_text: string;
  vertical: string;
  competitor_domains: string[];
  frequency: number;
}

export async function GapAnalysis({ filters }: Props) {
  const data = (await getGapAnalysis(filters)) as GapRow[];

  if (!data || data.length === 0) {
    return <p className="empty">No gaps found — owned sites appeared in all responses, or no data yet.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Prompt</th>
          <th>Vertical</th>
          <th>Competitor domains cited</th>
          <th>Frequency</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.prompt_id}>
            <td>{row.prompt_text}</td>
            <td>{row.vertical.replace(/_/g, " ")}</td>
            <td style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              {row.competitor_domains.join(", ")}
            </td>
            <td>{row.frequency}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
