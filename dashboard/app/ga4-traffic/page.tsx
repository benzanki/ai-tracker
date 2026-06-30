import { Ga4MockChart } from "../components/Ga4MockChart";
import { InfoTooltip } from "../components/InfoTooltip";

// Dummy data only — this page mocks up what AI-referral traffic from
// BigQuery-exported GA4 data could look like once joined against citation
// data. Not connected to any real GA4/BigQuery account.

const DAYS = ["24 Jun", "25 Jun", "26 Jun", "27 Jun", "28 Jun", "29 Jun", "30 Jun"];

const TRAFFIC_BY_PAGE = [
  {
    url: "loans.com.au/home-loans/offset-account",
    label: "loans.com.au",
    citations: [3, 2, 4, 3, 5, 4, 6],
    sessions: [41, 35, 52, 44, 61, 58, 73],
    conversions: [2, 1, 3, 2, 4, 3, 5],
  },
  {
    url: "savings.com.au/compare/savings-accounts",
    label: "Savings.com.au",
    citations: [5, 6, 5, 7, 6, 8, 7],
    sessions: [88, 95, 84, 110, 99, 128, 119],
    conversions: [6, 7, 5, 9, 8, 11, 10],
  },
  {
    url: "infochoice.com.au/car-loans/compare",
    label: "InfoChoice",
    citations: [2, 3, 2, 1, 3, 2, 4],
    sessions: [22, 29, 19, 14, 31, 24, 38],
    conversions: [1, 1, 1, 0, 2, 1, 2],
  },
];

const SOURCE_BREAKDOWN = [
  { provider: "ChatGPT",    sessions: 412, conversions: 28, color: "#4a7fc1" },
  { provider: "Perplexity", sessions: 268, conversions: 19, color: "#4ac17f" },
  { provider: "Gemini",     sessions: 184, conversions: 11, color: "#c1a84a" },
  { provider: "Claude",     sessions: 97,  conversions: 7,  color: "#c1604a" },
];

export default function Ga4TrafficMockPage() {
  const totalSessions = SOURCE_BREAKDOWN.reduce((s, p) => s + p.sessions, 0);
  const totalConversions = SOURCE_BREAKDOWN.reduce((s, p) => s + p.conversions, 0);

  return (
    <>
      <div
        style={{
          padding: "0.6rem 0.85rem",
          marginBottom: "1.5rem",
          background: "var(--color-accent-light)",
          border: "1px solid var(--color-accent)",
          borderRadius: 6,
          fontSize: 12.5,
          color: "var(--color-text)",
        }}
      >
        <strong>Mock-up only.</strong> This page uses fabricated data to illustrate what
        joining GA4 (via BigQuery export) AI-referral traffic against citation data could
        look like. It is not connected to any real Google Analytics or BigQuery account.
      </div>

      <div className="section">
        <h2 className="section-title">
          AI-referral traffic overview
          <InfoTooltip text="Mocked GA4 sessions/conversions where source contains an AI provider name (e.g. 'claude', 'chatgpt', 'perplexity', 'gemini'), for owned sites only, over the last 7 days." />
        </h2>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          <StatCard label="Total AI-referral sessions" value={totalSessions.toLocaleString()} />
          <StatCard label="Total conversions" value={totalConversions.toLocaleString()} />
          <StatCard
            label="Conversion rate"
            value={`${((totalConversions / totalSessions) * 100).toFixed(1)}%`}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {SOURCE_BREAKDOWN.map((p) => (
            <div
              key={p.provider}
              style={{
                flex: "1 1 180px",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "0.75rem 1rem",
                background: "var(--color-surface)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, display: "inline-block" }} />
                <strong style={{ fontSize: 13 }}>{p.provider}</strong>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {p.sessions.toLocaleString()} sessions · {p.conversions} conversions
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">
          Citations vs AI-referral sessions by page
          <InfoTooltip text="For each owned page that's been cited, citation count (bars) plotted against GA4 AI-referral sessions to that page (line) over the same window. Shows whether citation volume is translating into actual traffic." />
        </h2>
        <Ga4MockChart days={DAYS} pages={TRAFFIC_BY_PAGE} />
      </div>

      <div className="section">
        <h2 className="section-title">Top owned pages by AI-referral traffic</h2>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Page</th>
                <th>Citations (7d)</th>
                <th>Sessions (7d)</th>
                <th>Conversions (7d)</th>
                <th>Conv. rate</th>
              </tr>
            </thead>
            <tbody>
              {TRAFFIC_BY_PAGE.map((p) => {
                const totalCitations = p.citations.reduce((a, b) => a + b, 0);
                const totalSess = p.sessions.reduce((a, b) => a + b, 0);
                const totalConv = p.conversions.reduce((a, b) => a + b, 0);
                return (
                  <tr key={p.url}>
                    <td>
                      <strong>{p.label}</strong>
                      <br />
                      <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{p.url}</span>
                    </td>
                    <td>{totalCitations}</td>
                    <td>{totalSess}</td>
                    <td>{totalConv}</td>
                    <td>{((totalConv / totalSess) * 100).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        flex: "1 1 160px",
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: "0.75rem 1rem",
        background: "var(--color-surface)",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: "0.3rem" }}>{label}</div>
      <div style={{ fontSize: 22, fontFamily: "var(--font-display)" }}>{value}</div>
    </div>
  );
}
