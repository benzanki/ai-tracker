"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "citation-rate",      label: "Citation rate over time" },
  { id: "type-share",         label: "Lender vs aggregator" },
  { id: "provider-share",     label: "Citation share by provider" },
  { id: "entity-metrics",     label: "Entity metrics" },
  { id: "portfolio",          label: "Portfolio coverage" },
  { id: "gap-analysis",       label: "Gap analysis" },
  { id: "page-citations",     label: "Page-level citations" },
  { id: "untracked-domains",  label: "Untracked domains" },
];

export function Sidebar() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-20% 0px -70% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav
      className="sidebar-nav"
      style={{
        position: "sticky",
        top: "1.5rem",
        width: 190,
        flexShrink: 0,
        alignSelf: "flex-start",
      }}
    >
      <p className="sidebar-label">Sections</p>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.1rem" }}>
        {SECTIONS.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                style={{
                  display: "block",
                  padding: "0.3rem 0.75rem",
                  fontSize: 12,
                  textDecoration: "none",
                  color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: `2px solid ${isActive ? "var(--color-accent)" : "transparent"}`,
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
