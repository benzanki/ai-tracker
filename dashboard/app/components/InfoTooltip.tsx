"use client";

import { useState } from "react";

interface Props {
  text: string;
}

export function InfoTooltip({ text }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <span style={{ position: "relative", display: "inline-block", marginLeft: "0.4rem" }}>
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "var(--color-border)",
          color: "var(--color-text-muted)",
          fontSize: 10,
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
            bottom: "calc(100% + 6px)",
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
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              border: "5px solid transparent",
              borderTopColor: "var(--color-text)",
            }}
          />
        </span>
      )}
    </span>
  );
}
