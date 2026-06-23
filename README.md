# AI Tracker

Monitors how AI answer engines (Claude, and later others) respond to a list of prompts, tracking which owned websites and named competitors are cited or mentioned in the generated answers.

## Architecture

```
supabase/migrations/   ← Postgres schema + seed data
runner/                ← TypeScript batch script (runs in GitHub Actions)
dashboard/             ← Next.js read-only metrics dashboard (deploys to Vercel)
.github/workflows/     ← Daily cron trigger
```

All provider API calls happen server-side only. No secrets are exposed to the browser.

---

## 1. Supabase setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the migrations in order:
   - `supabase/migrations/001_tables.sql`
   - `supabase/migrations/002_seed.sql`
3. Run the RPC functions defined in `dashboard/app/lib/db-functions.sql`.
4. Note your **Project URL** and two keys:
   - **Anon key** — for the dashboard (read-only RLS policies)
   - **Service role key** — for the runner (bypasses RLS to write)

> **Tip:** You can also use the Supabase CLI (`supabase db push`) if you prefer migration-based deployment.

### Row-level security (recommended)

Enable RLS on all tables and add a policy allowing `SELECT` with the anon key. The runner uses the service key and bypasses RLS automatically.

---

## 2. Runner — local testing

```bash
cd runner
npm install
```

Set environment variables (or create a `.env` file — do not commit it):

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_KEY=eyJ...
```

Run one full batch:

```bash
npm start
```

The runner will:
1. Load all active prompts from Supabase.
2. Run each through Claude (web search enabled).
3. Normalise citations and prose mentions.
4. Write `responses`, `citations`, and `entity_mentions` rows.
5. Mark the run as `complete`.

Per-prompt errors are caught and logged — a single failed prompt will not abort the run.

---

## 3. GitHub Actions — automated daily run

### Required secrets

Add the following in **Settings → Secrets and variables → Actions**:

| Secret name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |

The workflow at `.github/workflows/daily-run.yml` runs at 02:00 UTC daily.

> **⚠️ Cron auto-disable:** GitHub automatically disables scheduled workflows after approximately 60 days of repository inactivity (no pushes, PRs, etc.). If the daily run stops, check the Actions tab and re-enable the workflow manually, or make a trivial commit to reset the inactivity timer.

---

## 4. Dashboard — Vercel deployment

```bash
cd dashboard
npm install
npm run dev    # local preview at http://localhost:3000
```

### Vercel environment variables

Set these in your Vercel project settings (not `NEXT_PUBLIC_` — they are server-only):

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key (read-only) |

Deploy:

```bash
vercel deploy
```

The dashboard is fully read-only — it never triggers a batch run and never exposes provider API keys.

---

## 5. How to add a new AI provider

The `Provider` interface lives in `runner/src/types.ts`:

```ts
interface Provider {
  name: string;
  model: string;
  run(prompt: string): Promise<ProviderResult>;
}
```

To add a provider (e.g. Perplexity):

1. Create `runner/src/providers/perplexity.ts` implementing `Provider`.
2. Extract `answer_text`, `model`, and `citations: RawCitation[]` from the provider's response — keep all provider-specific parsing inside this file.
3. Import and instantiate it in `runner/src/index.ts` alongside (or instead of) `ClaudeProvider`.
4. Add the necessary API key to GitHub Actions secrets and the runner's env.

The normaliser, storage layer, and dashboard require no changes.

Stub files for OpenAI, Perplexity, and Gemini are in `runner/src/providers/` as starting points.

---

## 6. Managing prompts and entities

Prompts and entities are stored in Supabase and can be edited directly in the Supabase table editor — no redeploy required.

- **Disable a prompt:** set `active = false`.
- **Add a competitor:** insert a row in `entities` with `ownership = 'competitor'`.
- **Tune mention detection:** update `brand_variants` for any entity.

> **Note on mention detection:** Prose mention detection (the `entity_mentions` table) uses case-insensitive word-boundary string matching against `brand_variants`. It is best-effort and may produce false positives/negatives. Citation data (the `citations` table) is structured and reliable. Treat citations as ground truth; treat mentions as approximate signals to be refined over time.

---

## 7. Out of scope (v1)

These are intentional omissions, not gaps:

- OpenAI / Perplexity / Gemini wrappers (interface is ready — add when needed).
- Multiple samples per prompt (single daily run; schema supports expansion later).
- Cadence logic — `prompts.cadence` column is seeded but the runner runs all active prompts.
- Write/edit UI in the dashboard — use Supabase table editor for now.
