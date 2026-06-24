"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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

const OWNED_COLORS = ["#c1604a", "#4a7fc1", "#4ac17f"];

export function TypeShareChart({ data, ownedLabels }: Props) {
  if (!data || data.length === 0) {
    return <p className="empty">No trend data yet.</p>;
  }

  return (
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
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="aggregator" stackId="a" fill="#c1604a" name="Aggregator" />
        <Bar dataKey="lender"     stackId="a" fill="#4a7fc1" name="Lender" />
        <Bar dataKey="other"      stackId="a" fill="#c1a84a" name="Other" />
        {ownedLabels.map((label, i) => (
          <Line
            key={label}
            type="monotone"
            dataKey={label}
            stroke={OWNED_COLORS[i % OWNED_COLORS.length]}
            strokeWidth={2}
            dot={false}
            name={label}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
