"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

interface Props {
  providers: string[];
  verticals: string[];
  tags: string[];
  entities: Array<{ id: string; label: string; ownership: string }>;
  current: Record<string, string | undefined>;
}

export function FiltersBar({ providers, verticals, tags, entities, current }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  return (
    <div className="filters-bar">
      <label>
        Provider
        <select
          value={current.provider ?? ""}
          onChange={(e) => update("provider", e.target.value)}
        >
          <option value="">All</option>
          {providers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <label>
        Vertical
        <select
          value={current.vertical ?? ""}
          onChange={(e) => update("vertical", e.target.value)}
        >
          <option value="">All</option>
          {verticals.map((v) => (
            <option key={v} value={v}>
              {v.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </label>

      <label>
        Tag
        <select
          value={current.tag ?? ""}
          onChange={(e) => update("tag", e.target.value)}
        >
          <option value="">All</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </label>

      <label>
        Ownership
        <select
          value={current.ownership ?? ""}
          onChange={(e) => update("ownership", e.target.value)}
        >
          <option value="">All</option>
          <option value="owned">Owned</option>
          <option value="competitor">Competitor</option>
          <option value="tracked">Tracked (owned + competitor)</option>
          <option value="untracked">Untracked</option>
        </select>
      </label>

      <label>
        Type
        <select
          value={current.type ?? ""}
          onChange={(e) => update("type", e.target.value)}
        >
          <option value="">All</option>
          <option value="lender">Lender</option>
          <option value="aggregator">Aggregator</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label>
        Entity
        <select
          value={current.entityId ?? ""}
          onChange={(e) => update("entityId", e.target.value)}
        >
          <option value="">All</option>
          {entities.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label} ({e.ownership})
            </option>
          ))}
        </select>
      </label>

      <label>
        From
        <input
          type="date"
          value={current.dateFrom ?? ""}
          onChange={(e) => update("dateFrom", e.target.value)}
        />
      </label>

      <label>
        To
        <input
          type="date"
          value={current.dateTo ?? ""}
          onChange={(e) => update("dateTo", e.target.value)}
        />
      </label>
    </div>
  );
}
