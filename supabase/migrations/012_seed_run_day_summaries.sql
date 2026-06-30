-- 012_seed_run_day_summaries.sql
-- Hand-written day summaries based on real citation data, combining all
-- providers that ran on each day. Not AI-generated — placeholder content
-- for the dashboard UI before the automated generation pipeline exists.

insert into run_day_summaries (run_date, summary_text) values
(
  '2026-06-23',
  'Perplexity run only (a Claude run on the same day produced no responses and is excluded). 128 citations across 20 responses, all matched to tracked entities — 0 untracked. Competitor aggregators dominate: RateCity (18), Canstar (17) and Mozo (17) lead. Owned sites picked up 33 citations combined, more than any single competitor but a small share of total volume.'
),
(
  '2026-06-24',
  'Claude run. 197 citations across 20 responses — 27 to owned sites, 62 to tracked competitors, 108 to untracked domains. Canstar led with 17 citations, followed by Savings.com.au (12) and InfoChoice (11). No prior Claude data to compare against yet at this point.'
),
(
  '2026-06-29',
  'Two providers ran today: Claude and Gemini (a second Gemini attempt failed on rate limits and produced no data).

Claude, vs 24 Jun: total citations held flat (198 vs 197). Owned site citations unchanged at 27. Competitor citations eased slightly (59 vs 62, -3) while untracked citations rose (112 vs 108, +4). Canstar stayed the top-cited entity (18, +1); Savings.com.au and InfoChoice unchanged at 12 and 11.

Gemini: first successful run, 251 citations across 20 responses. All 251 are currently showing as untracked — Gemini''s grounding API returns Google redirect URLs rather than the source domain, so none resolved to a tracked entity yet. A fix to resolve these redirects has been written; the next Gemini run should attribute citations correctly.'
);
