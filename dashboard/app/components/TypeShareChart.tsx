"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  lender?: number;
  aggregator?: number;
  other?: number;
  [key: string]: string | number | undefined;
}

interface Props {
  data: DataPoint[];
  ownedLabels: string[];
}

const BARS = [
  { key: "aggregator", color: "#c1604a", label: "Aggregator" },
  { key: "lender",     color: "#4a7fc1", label: "Lender" },
  { key: "other",      color: "#c1a84a", label: "Other" },
];

// Distinct from bar colours and from each other
const OWNED_COLORS = ["#9b59b6", "#1abc9c", "#e67e22"];

export function TypeShareChart({ data, ownedLabels }: Props) {
  if (!data || data.length === 0) {
    return <p className="empty">No trend data yet.</p>;
  }

  return (
    <div>
      {/* Custom legend — bars group then lines group */}
      <div style={{ display: "flex", gap: "1.5rem", fontSize: 12, marginBottom: "0.5rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>Share</span>
          {BARS.map(({ key, color, label }) => (
            <span key={key} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ width: 12, height: 12, background: color, display: "inline-block", borderRadius: 2 }} />
              {label}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>Citation rate</span>
          {ownedLabels.map((label, i) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ width: 16, height: 2, background: OWNED_COLORS[i % OWNED_COLORS.length], display: "inline-block" }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
            domain={[0, 100]}
          />
          <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
          {BARS.map(({ key, color, label }) => (
            <Bar key={key} dataKey={key} stackId="a" fill={color} name={label} legendType="none" />
          ))}
          {ownedLabels.map((label, i) => (
            <Line
              key={label}
              type="monotone"
              dataKey={label}
              stroke={OWNED_COLORS[i % OWNED_COLORS.length]}
              strokeWidth={2}
              dot={false}
              name={label}
              legendType="none"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
