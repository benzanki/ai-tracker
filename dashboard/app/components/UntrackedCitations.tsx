import { getUntrackedCitations, type Filters } from "../lib/queries";

interface Props {
  filters: Filters;
}

export async function UntrackedCitations({ filters }: Props) {
  const data = await getUntrackedCitations(filters);

  if (!data || data.length === 0) {
    return <p className="empty">No untracked citations found.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Domain</th>
          <th>Citations</th>
          <th>Total responses</th>
          <th>Citation rate</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.domain}>
            <td>{row.domain}</td>
            <td>{row.cite_count}</td>
            <td>{row.total_responses}</td>
            <td>{row.citation_rate}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
