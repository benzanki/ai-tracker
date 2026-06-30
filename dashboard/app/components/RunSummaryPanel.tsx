"use client";

import { useState } from "react";

interface RunSummary {
  id: string;
  provider: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  summary: { summary_text: string; created_at: string } | null;
}

interface Props {
  runs: RunSummary[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RunSummaryPanel({ runs }: Props) {
  const [selectedId, setSelectedId] = useState(runs[0]?.id ?? "");
  const [expanded, setExpanded] = useState(true);

  if (!runs || runs.length === 0) return null;

  const selected = runs.find((r) => r.id === selectedId) ?? runs[0];

  return (
    <div className="section" id="run-summary">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          Run summary
        </h2>
        <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
          {expanded ? "Hide ▲" : "Show ▼"}
        </span>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: "0.75rem",
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
              padding: "0.6rem 0.75rem 0",
              borderBottom: "1px solid var(--color-border)",
              overflowX: "auto",
            }}
          >
            {runs.map((run) => {
              const isActive = run.id === selected.id;
              return (
                <button
                  key={run.id}
                  onClick={() => setSelectedId(run.id)}
                  style={{
                    background: "none",
                    border: "none",
                    borderBottom: `2px solid ${isActive ? "var(--color-accent)" : "transparent"}`,
                    padding: "0.4rem 0.6rem",
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDate(run.started_at)}
                  <span style={{ textTransform: "capitalize", marginLeft: 4 }}>
                    ({run.provider})
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ padding: "1rem 1.25rem" }}>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                marginBottom: "0.6rem",
                fontSize: 12,
                color: "var(--color-text-muted)",
              }}
            >
              <span className={`badge badge-${selected.status === "complete" ? "owned" : "competitor"}`}>
                {selected.status}
              </span>
              <span>{formatDate(selected.started_at)}</span>
              <span style={{ textTransform: "capitalize" }}>{selected.provider}</span>
            </div>

            {selected.summary ? (
              <p style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                {selected.summary.summary_text}
              </p>
            ) : (
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", fontStyle: "italic" }}>
                No AI-generated summary for this run yet. Once summary generation is wired up,
                this run-vs-previous-run comparison will appear here automatically.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
