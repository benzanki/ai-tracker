"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Row {
  date: string;
  provider: string;
  citation_count: number;
  share: number;
}

interface Entity {
  entity_id: string;
  label: string;
  ownership: string;
}

interface Props {
  rows: Row[];
  entities: Entity[];
  currentEntityIds: string[];
  currentOwnership: string;
}

const PROVIDER_COLORS: Record<string, string> = {
  claude: "#c1604a",
  openai: "#4a7fc1",
  perplexity: "#4ac17f",
  gemini: "#c1a84a",
};

const OWNERSHIP_GROUPS = [
  { key: "all", label: "All tracked" },
  { key: "owned", label: "Owned" },
  { key: "competitor", label: "Competitors" },
];

export function ProviderShareChart({ rows, entities, currentEntityIds, currentOwnership }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = currentEntityIds.length > 0 ? "entity" : "group";
  const providers = [...new Set(rows.map((r) => r.provider))].sort();
  const ownedEntities = entities.filter((e) => e.ownership === "owned");
  const competitorEntities = entities.filter((e) => e.ownership === "competitor");

  function setGroup(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("psEntityIds");
    params.set("psOwnership", key === "all" ? "" : key);
    if (!params.get("psOwnership")) params.delete("psOwnership");
    router.push(`?${params.toString()}`);
  }

  function toggleEntity(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("psOwnership");
    const next = currentEntityIds.includes(id)
      ? currentEntityIds.filter((e) => e !== id)
      : [...currentEntityIds, id];
    if (next.length > 0) {
      params.set("psEntityIds", next.join(","));
    } else {
      params.delete("psEntityIds");
    }
    router.push(`?${params.toString()}`);
  }

  function switchMode(newMode: "group" | "entity") {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("psEntityIds");
    params.delete("psOwnership");
    router.push(`?${params.toString()}`);
  }

  // Build chart data
  const dateMap = new Map<string, Record<string, number>>();
  for (const row of rows) {
    if (!dateMap.has(row.date)) dateMap.set(row.date, {});
    dateMap.get(row.date)![row.provider] = Number(row.share);
  }
  const chartData = [...dateMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));

  const btnBase = {
    padding: "0.25rem 0.75rem",
    fontSize: 12,
    border: "1px solid var(--color-border)",
    borderRadius: 4,
    cursor: "pointer",
  } as const;

  const chipBase = {
    padding: "0.2rem 0.6rem",
    fontSize: 11,
    border: "1px solid var(--color-border)",
    borderRadius: 3,
    cursor: "pointer",
  } as const;

  return (
    <div>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Mode toggle */}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            onClick={() => switchMode("group")}
            style={{
              ...btnBase,
              background: mode === "group" ? "var(--color-accent)" : "var(--color-surface)",
              color: mode === "group" ? "#fff" : "var(--color-text)",
              fontWeight: mode === "group" ? 600 : 400,
            }}
          >
            By ownership
          </button>
          <button
            onClick={() => switchMode("entity")}
            style={{
              ...btnBase,
              background: mode === "entity" ? "var(--color-accent)" : "var(--color-surface)",
              color: mode === "entity" ? "#fff" : "var(--color-text)",
              fontWeight: mode === "entity" ? 600 : 400,
            }}
          >
            By entity
          </button>
        </div>

        {/* Group selector */}
        {mode === "group" && (
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {OWNERSHIP_GROUPS.map((g) => {
              const active = currentOwnership === g.key || (g.key === "all" && !currentOwnership);
              return (
                <button
                  key={g.key}
                  onClick={() => setGroup(g.key)}
                  style={{
                    ...chipBase,
                    background: active ? "var(--color-text)" : "var(--color-surface)",
                    color: active ? "#fff" : "var(--color-text-muted)",
                    border: `1px solid ${active ? "var(--color-text)" : "var(--color-border)"}`,
                  }}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Entity selector */}
        {mode === "entity" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {[
              { group: "Owned", list: ownedEntities },
              { group: "Competitors", list: competitorEntities },
            ].map(({ group, list }) =>
              list.length === 0 ? null : (
                <div key={group} style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)", minWidth: 72 }}>{group}</span>
                  {list.map((e) => {
                    const active = currentEntityIds.includes(e.entity_id);
                    return (
                      <button
                        key={e.entity_id}
                        onClick={() => toggleEntity(e.entity_id)}
                        style={{
                          ...chipBase,
                          background: active ? "var(--color-accent)" : "var(--color-surface)",
                          color: active ? "#fff" : "var(--color-text-muted)",
                          border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
                        }}
                      >
                        {e.label}
                      </button>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {chartData.length === 0 ? (
        <p className="empty">No data for this selection.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              domain={[0, 100]}
            />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {providers.map((provider) => (
              <Bar
                key={provider}
                dataKey={provider}
                stackId="a"
                fill={PROVIDER_COLORS[provider] ?? "#aaa"}
                name={provider.charAt(0).toUpperCase() + provider.slice(1)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
