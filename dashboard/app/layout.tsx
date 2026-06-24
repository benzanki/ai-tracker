import type { Metadata } from "next";
import Link from "next/link";
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
            <Link href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.85rem" }}>Dashboard</Link>
            <Link href="/prompts" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.85rem" }}>Prompts</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
