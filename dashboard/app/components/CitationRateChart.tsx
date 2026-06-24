"use client";

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

interface DataPoint {
  date: string;
  [entity: string]: string | number;
}

interface Props {
  data: DataPoint[];
  entities: string[];
}

const COLORS = [
  "#c1604a",
  "#4a7fc1",
  "#4ac17f",
  "#c1a84a",
  "#9b4ac1",
  "#4ac1b8",
];

export function CitationRateChart({ data, entities }: Props) {
  if (!data || data.length === 0) {
    return <p className="empty">No trend data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
        />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          domain={[0, 100]}
        />
        <Tooltip formatter={(v) => `${v}%`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {entities.map((entity, i) => (
          <Line
            key={entity}
            type="monotone"
            dataKey={entity}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
