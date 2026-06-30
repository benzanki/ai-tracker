-- 010_seed_run_summaries.sql
-- Hand-written summaries for existing runs, based on real citation data.
-- These are NOT AI-generated — placeholder content to populate the Run
-- summary UI before the automated generation pipeline is built.

insert into run_summaries (run_id, summary_text) values
(
  '754ab244-04e3-4a70-818b-ed3af6be4021', -- perplexity, 23 Jun
  'First Perplexity run — no prior run on this provider to compare against. 128 citations across 20 responses, all matched to tracked entities (0 untracked). Competitor aggregators dominate: RateCity (18), Canstar (17) and Mozo (17) lead the citation count. Owned sites picked up 33 citations combined, ahead of this run''s competitor lender citations but still well behind the top three aggregators individually.'
),
(
  '2429ccd5-d266-4231-a23d-54e6f5bb847f', -- claude, 24 Jun
  'Claude run on 24 Jun. 197 citations across 20 responses — 27 to owned sites, 62 to tracked competitors, 108 to untracked domains. Canstar led with 17 citations, followed by Savings.com.au (12) and InfoChoice (11). No prior Claude run in the system yet to compare against.'
),
(
  'f6aaee12-81a1-4fe3-9f37-993409c4500e', -- claude, 29 Jun
  'Claude run on 29 Jun, compared to the 24 Jun run. Total citations held roughly flat (198 vs 197). Owned site citations unchanged at 27. Competitor citations eased slightly (59 vs 62, -3), while untracked domain citations rose (112 vs 108, +4). Canstar stayed the top-cited entity (18, +1), with Savings.com.au and InfoChoice unchanged at 12 and 11 respectively. No major shifts — the citation landscape looks stable run over run.'
),
(
  '1596e577-288b-40e5-8d60-c2ec13e8a654', -- gemini, 29 Jun
  'First successful Gemini run. 251 citations across 20 responses, but all 251 are currently showing as untracked — Gemini''s grounding API returns Google redirect URLs rather than the source domain directly, so none resolved to a tracked entity yet. A fix to resolve these redirect URLs to their real destination has been written; the next Gemini run should attribute citations correctly.'
);
