"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface EntityRow {
  date: string;
  label: string;
  ownership: string;
  citation_rate: number;
  mention_rate: number;
  mentioned_and_cited_rate: number;
}

interface Props {
  rows: EntityRow[];
}

const COLORS = [
  "#c1604a", "#4a7fc1", "#4ac17f", "#c1a84a", "#9b4ac1", "#4ac1b8",
  "#c14a8a", "#7fc14a", "#4a8ac1", "#c18a4a",
];

const METRICS = [
  { key: "citation_rate", label: "Citation rate" },
  { key: "mention_rate", label: "Mention rate" },
  { key: "mentioned_and_cited_rate", label: "Mentioned & cited" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

export function CitationRateChart({ rows }: Props) {
  const allEntities = [...new Set(rows.map((r) => r.label))].sort();
  const [selectedEntities, setSelectedEntities] = useState<string[]>(
    allEntities.filter((_, i) => i < 5) // default to first 5
  );
  const [metric, setMetric] = useState<MetricKey>("citation_rate");

  if (!rows || rows.length === 0) {
    return <p className="empty">No trend data yet.</p>;
  }

  // Build chart data: [{ date, 'Canstar': 80, 'Finder': 65, ... }]
  const dateMap = new Map<string, Record<string, number>>();
  for (const row of rows) {
    if (!selectedEntities.includes(row.label)) continue;
    if (!dateMap.has(row.date)) dateMap.set(row.date, {});
    dateMap.get(row.date)![row.label] = Number(row[metric]);
  }
  const chartData = [...dateMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));

  function toggleEntity(label: string) {
    setSelectedEntities((prev) =>
      prev.includes(label) ? prev.filter((e) => e !== label) : [...prev, label]
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              style={{
                padding: "0.25rem 0.75rem",
                fontSize: 12,
                border: "1px solid var(--color-border)",
                borderRadius: 4,
                cursor: "pointer",
                background: metric === m.key ? "var(--color-accent)" : "var(--color-surface)",
                color: metric === m.key ? "#fff" : "var(--color-text)",
                fontWeight: metric === m.key ? 600 : 400,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {[
            { group: "Owned", entities: allEntities.filter((l) => rows.find((r) => r.label === l)?.ownership === "owned") },
            { group: "Competitors", entities: allEntities.filter((l) => rows.find((r) => r.label === l)?.ownership !== "owned") },
          ].map(({ group, entities }) =>
            entities.length === 0 ? null : (
              <div key={group} style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "var(--color-text-muted)", minWidth: 72 }}>{group}</span>
                {entities.map((label) => {
                  const selectionIdx = selectedEntities.indexOf(label);
                  const active = selectionIdx !== -1;
                  const color = active ? COLORS[selectionIdx % COLORS.length] : undefined;
                  return (
                    <button
                      key={label}
                      onClick={() => toggleEntity(label)}
                      style={{
                        padding: "0.2rem 0.6rem",
                        fontSize: 11,
                        border: `1px solid ${active ? color : "var(--color-border)"}`,
                        borderRadius: 3,
                        cursor: "pointer",
                        background: active ? color : "var(--color-surface)",
                        color: active ? "#fff" : "var(--color-text-muted)",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
            domain={[0, 100]}
          />
          <Tooltip formatter={(v) => `${v}%`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {selectedEntities.map((label, i) => (
            <Line
              key={label}
              type="monotone"
              dataKey={label}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
