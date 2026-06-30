"use client";

import { useState } from "react";

interface Props {
  text: string;
  placement?: "top" | "bottom";
}

export function InfoTooltip({ text, placement = "top" }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <span style={{ position: "relative", display: "inline-block", marginLeft: "0.25rem" }}>
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "var(--color-border)",
          color: "var(--color-text-muted)",
          fontSize: 8,
          fontWeight: 700,
          cursor: "default",
          verticalAlign: "middle",
          userSelect: "none",
        }}
      >
        ?
      </span>
      {visible && (
        <span
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            ...(placement === "top"
              ? { bottom: "calc(100% + 6px)" }
              : { top: "calc(100% + 6px)" }),
            background: "var(--color-text)",
            color: "var(--color-bg)",
            fontSize: 12,
            lineHeight: 1.5,
            padding: "0.5rem 0.75rem",
            borderRadius: 5,
            width: 260,
            zIndex: 100,
            whiteSpace: "normal",
            pointerEvents: "none",
          }}
        >
          {text}
          <span
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              border: "5px solid transparent",
              ...(placement === "top"
                ? { top: "100%", borderTopColor: "var(--color-text)" }
                : { bottom: "100%", borderBottomColor: "var(--color-text)" }),
            }}
          />
        </span>
      )}
    </span>
  );
}
