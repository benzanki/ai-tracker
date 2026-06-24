"use client";

import { useState } from "react";

interface EntityRow {
  entity_id: string;
  domain: string;
  label: string;
  ownership: string;
  type: string;
  total_responses: number;
  cited_count: number;
  mentioned_count: number;
  mentioned_and_cited_count: number;
  citation_rate: number;
  mention_rate: number;
  mentioned_and_cited_rate: number;
  citation_share_tracked: number;
  citation_share_all: number;
  avg_position: number | null;
}

type SortKey = keyof EntityRow;

interface Props {
  data: EntityRow[];
}

export function EntityTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("citation_rate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  if (!data || data.length === 0) {
    return <p className="empty">No data yet. Run the batch to populate.</p>;
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey] ?? (sortDir === "asc" ? Infinity : -Infinity);
    const bv = b[sortKey] ?? (sortDir === "asc" ? Infinity : -Infinity);
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function Th({ label, col }: { label: string; col: SortKey }) {
    const active = sortKey === col;
    return (
      <th
        onClick={() => handleSort(col)}
        style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
      >
        {label}{" "}
        <span style={{ color: active ? "var(--color-accent)" : "var(--color-border)" }}>
          {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </th>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <Th label="Entity" col="label" />
            <Th label="Ownership" col="ownership" />
            <Th label="Type" col="type" />
            <Th label="Responses" col="total_responses" />
            <Th label="Citation rate" col="citation_rate" />
            <Th label="Mention rate" col="mention_rate" />
            <Th label="Mentioned & cited" col="mentioned_and_cited_rate" />
            <Th label="Share (tracked)" col="citation_share_tracked" />
            <Th label="Share (all)" col="citation_share_all" />
            <Th label="Avg position" col="avg_position" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.entity_id}>
              <td>
                <strong>{row.label}</strong>
                <br />
                <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                  {row.domain}
                </span>
              </td>
              <td>
                <span className={`badge badge-${row.ownership}`}>
                  {row.ownership}
                </span>
              </td>
              <td>{row.type}</td>
              <td>{row.total_responses}</td>
              <td>{row.citation_rate ?? 0}%</td>
              <td>{row.mention_rate ?? 0}%</td>
              <td>{row.mentioned_and_cited_rate ?? 0}%</td>
              <td>{row.citation_share_tracked ?? 0}%</td>
              <td>{row.citation_share_all ?? 0}%</td>
              <td>{row.avg_position ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
