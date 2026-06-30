"use client";

import { useState } from "react";

interface RunRow {
  id: string;
  provider: string;
  started_at: string;
  finished_at: string | null;
  status: string;
}

interface DaySummary {
  date: string;
  runs: RunRow[];
  summary: { summary_text: string; created_at: string } | null;
}

interface Props {
  days: DaySummary[];
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RunSummaryPanel({ days }: Props) {
  const [selectedDate, setSelectedDate] = useState(days[0]?.date ?? "");
  const [expanded, setExpanded] = useState(false);

  if (!days || days.length === 0) return null;

  const selected = days.find((d) => d.date === selectedDate) ?? days[0];
  const providers = [...new Set(selected.runs.map((r) => r.provider))];
  const anyFailed = selected.runs.some((r) => r.status === "failed");

  return (
    <div className="section" id="run-summary" style={{ marginBottom: "1rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        <h2 className="section-title" style={{ marginBottom: 0, fontSize: "0.95rem" }}>
          Run summary
        </h2>
        <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>
          {expanded ? "Hide ▲" : "Show ▼"}
        </span>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: "0.5rem",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            background: "var(--color-surface)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              padding: "0.4rem 0.6rem 0",
              borderBottom: "1px solid var(--color-border)",
              overflowX: "auto",
            }}
          >
            {days.map((day) => {
              const isActive = day.date === selected.date;
              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  style={{
                    background: "none",
                    border: "none",
                    borderBottom: `2px solid ${isActive ? "var(--color-accent)" : "transparent"}`,
                    padding: "0.3rem 0.5rem",
                    fontSize: 11,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDate(day.date)}
                </button>
              );
            })}
          </div>

          <div style={{ padding: "0.65rem 0.85rem" }}>
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                alignItems: "center",
                marginBottom: "0.4rem",
                fontSize: 11,
                color: "var(--color-text-muted)",
                flexWrap: "wrap",
              }}
            >
              <span>{formatDate(selected.date)}</span>
              {providers.map((p) => (
                <span key={p} style={{ textTransform: "capitalize" }} className="badge badge-sm badge-competitor">
                  {p}
                </span>
              ))}
              {anyFailed && (
                <span className="badge badge-sm badge-competitor" style={{ color: "var(--color-accent)" }}>
                  partial failure
                </span>
              )}
            </div>

            {selected.summary ? (
              <p style={{ fontSize: 12.5, lineHeight: 1.5, whiteSpace: "pre-line" }}>
                {selected.summary.summary_text}
              </p>
            ) : (
              <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", fontStyle: "italic" }}>
                No AI-generated summary for this day yet. Once summary generation is wired up,
                this day-vs-previous-day comparison will appear here automatically.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
