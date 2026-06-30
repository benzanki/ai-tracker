"use client";

import { useState } from "react";
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

interface PageData {
  url: string;
  label: string;
  citations: number[];
  sessions: number[];
  conversions: number[];
}

interface Props {
  days: string[];
  pages: PageData[];
}

const BAR_COLOR = "#c1604a";
const LINE_COLOR = "#4a7fc1";

export function Ga4MockChart({ days, pages }: Props) {
  const [selectedUrl, setSelectedUrl] = useState(pages[0]?.url ?? "");
  const selected = pages.find((p) => p.url === selectedUrl) ?? pages[0];

  const data = days.map((day, i) => ({
    date: day,
    citations: selected.citations[i],
    sessions: selected.sessions[i],
  }));

  return (
    <div>
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        {pages.map((p) => {
          const isActive = p.url === selected.url;
          return (
            <button
              key={p.url}
              onClick={() => setSelectedUrl(p.url)}
              style={{
                border: `1px solid ${isActive ? "var(--color-accent)" : "var(--color-border)"}`,
                background: isActive ? "var(--color-accent-light)" : "var(--color-surface)",
                color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                borderRadius: 6,
                padding: "0.3rem 0.65rem",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "1.5rem", fontSize: 12, marginBottom: "0.5rem" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <span style={{ width: 12, height: 12, background: BAR_COLOR, display: "inline-block", borderRadius: 2 }} />
          Citations
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <span style={{ width: 16, height: 2, background: LINE_COLOR, display: "inline-block" }} />
          AI-referral sessions
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} allowDecimals={false} />
          <Tooltip />
          <Bar yAxisId="left" dataKey="citations" fill={BAR_COLOR} name="Citations" legendType="none" radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="sessions" stroke={LINE_COLOR} strokeWidth={2} dot={{ r: 3 }} name="AI-referral sessions" legendType="none" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
