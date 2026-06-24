import { getPortfolioCoverage, getCannibalisation, type Filters } from "../lib/queries";

interface Props {
  filters: Filters;
}

interface CannibRow {
  prompt_id: string;
  prompt_text: string;
  owned_domains: string[];
  preferred_domain: string;
  preferred_position: number;
}

export async function PortfolioView({ filters }: Props) {
  const [coverageResult, cannibalisation] = await Promise.all([
    getPortfolioCoverage(filters),
    getCannibalisation(filters),
  ]);

  const coverage = Array.isArray(coverageResult) ? coverageResult[0] : coverageResult;

  const cannibRows = cannibalisation as CannibRow[];

  return (
    <div>
      <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
        <Stat
          label="Total prompts"
          value={String(coverage?.total_prompts ?? 0)}
        />
        <Stat
          label="Covered prompts"
          value={String(coverage?.covered_prompts ?? 0)}
        />
        <Stat
          label="Portfolio coverage"
          value={`${coverage?.coverage_rate ?? 0}%`}
          highlight
        />
      </div>

      {cannibRows.length > 0 && (
        <>
          <p style={{ marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: 12 }}>
            Cannibalisation — prompts where more than one owned site appeared:
          </p>
          <table>
            <thead>
              <tr>
                <th>Prompt</th>
                <th>Owned sites appearing</th>
                <th>Preferred (lowest position)</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              {cannibRows.map((row) => (
                <tr key={row.prompt_id}>
                  <td>{row.prompt_text}</td>
                  <td>{row.owned_domains.join(", ")}</td>
                  <td>{row.preferred_domain}</td>
                  <td>{row.preferred_position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {cannibRows.length === 0 && (
        <p className="empty">No cannibalisation detected in this period.</p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: "0.75rem 1.25rem",
        border: `1px solid ${highlight ? "var(--color-accent-light)" : "var(--color-border)"}`,
        borderRadius: 6,
        background: highlight ? "var(--color-accent-light)" : "var(--color-surface)",
        minWidth: 140,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: highlight ? "var(--color-accent)" : "var(--color-text-muted)",
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: highlight ? "var(--color-accent)" : "var(--color-text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
