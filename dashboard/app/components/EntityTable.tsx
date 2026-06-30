"use client";

import { useState } from "react";
import { InfoTooltip } from "./InfoTooltip";

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

  function Th({ label, col, tip }: { label: string; col: SortKey; tip?: string }) {
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
        {tip && <InfoTooltip text={tip} placement="bottom" />}
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
            <Th label="Responses" col="total_responses" tip="Total number of AI responses evaluated for this entity across the selected filters." />
            <Th label="Citation rate" col="citation_rate" tip="% of responses where this entity was linked as a source in the AI's answer. The strongest signal — the AI actively pointed users to this site." />
            <Th label="Mention rate" col="mention_rate" tip="% of responses where this entity was named in the answer content, whether or not it was linked. Includes brand mentions without a hyperlink." />
            <Th label="Mentioned & cited" col="mentioned_and_cited_rate" tip="% of responses where this entity was both named in the answer AND linked as a source. The best possible outcome — named and linked." />
            <Th label="Share (tracked)" col="citation_share_tracked" tip="This entity's citations as a % of all citations given to your 31 tracked entities combined. Shows how this site competes within your watchlist — e.g. 10% means 1 in 10 tracked citations went to this site." />
            <Th label="Share (all)" col="citation_share_all" tip="This entity's citations as a % of every citation in the responses, including sites not in your watchlist. A truer picture of overall visibility — lower than Share (tracked) because untracked sites are included in the denominator." />
            <Th label="Avg position" col="avg_position" tip="Average rank of this entity in the citation list when it appears. Position 1 means cited first. Lower is better." />
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
