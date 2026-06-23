import { getPageCitationRates, type Filters } from "../lib/queries";

interface Props {
  filters: Filters;
}

interface PageRow {
  url: string;
  domain: string;
  label: string;
  cite_count: number;
  total_responses: number;
  citation_rate: number;
}

export async function PageCitationsView({ filters }: Props) {
  const data = (await getPageCitationRates(filters)) as PageRow[];

  if (!data || data.length === 0) {
    return <p className="empty">No owned page citations yet.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th>Entity</th>
          <th>Citations</th>
          <th>Total responses</th>
          <th>Citation rate</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.url}>
            <td style={{ maxWidth: 400, wordBreak: "break-all", fontSize: 12 }}>
              {row.url}
            </td>
            <td>{row.label}</td>
            <td>{row.cite_count}</td>
            <td>{row.total_responses}</td>
            <td>{row.citation_rate}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
