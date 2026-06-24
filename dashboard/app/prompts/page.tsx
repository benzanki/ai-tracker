import { supabase } from "../lib/supabase";

interface Prompt {
  id: string;
  text: string;
  vertical: string;
  tags: string[];
  active: boolean;
  created_at: string;
}

export default async function PromptsPage() {
  const { data: prompts } = await supabase
    .from("prompts")
    .select("*")
    .order("vertical")
    .order("text");

  const rows = (prompts ?? []) as Prompt[];
  const homeLoans = rows.filter((p) => p.vertical === "home_loans");
  const carLoans = rows.filter((p) => p.vertical === "car_loans");
  const other = rows.filter(
    (p) => p.vertical !== "home_loans" && p.vertical !== "car_loans"
  );

  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", marginBottom: "0.25rem" }}>
          Monitored prompts
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
          {rows.filter((p) => p.active).length} active prompts across {" "}
          {[...new Set(rows.map((p) => p.vertical))].length} verticals.
          Prompts are managed in Supabase.
        </p>
      </div>

      <PromptGroup title="Home loans" prompts={homeLoans} />
      <PromptGroup title="Car loans" prompts={carLoans} />
      {other.length > 0 && <PromptGroup title="Other" prompts={other} />}
    </>
  );
}

function PromptGroup({ title, prompts }: { title: string; prompts: Prompt[] }) {
  if (prompts.length === 0) return null;

  return (
    <div className="section">
      <h2 className="section-title">{title}</h2>
      <table>
        <thead>
          <tr>
            <th style={{ width: "60%" }}>Prompt</th>
            <th>Tags</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {prompts.map((p) => (
            <tr key={p.id}>
              <td>{p.text}</td>
              <td style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {p.tags.join(", ")}
              </td>
              <td>
                <span
                  className="badge"
                  style={{
                    background: p.active ? "var(--color-accent-light)" : "var(--color-border)",
                    color: p.active ? "var(--color-accent)" : "var(--color-text-muted)",
                  }}
                >
                  {p.active ? "Active" : "Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
