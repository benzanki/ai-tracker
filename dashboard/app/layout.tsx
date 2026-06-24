import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Tracker",
  description: "AI answer engine citation monitoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>
            <strong>AI Tracker</strong>
            <a href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.85rem" }}>Dashboard</a>
            <a href="/prompts" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.85rem" }}>Prompts</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
