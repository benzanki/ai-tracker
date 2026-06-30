-- 014_seed_7day_summaries.sql
-- Hand-written day summaries based on the real aggregates produced by the
-- 7-day dummy data reset in 013. Not AI-generated — placeholder content
-- for the dashboard UI before the automated generation pipeline exists.

insert into run_day_summaries (run_date, summary_text) values
(
  '2026-06-24',
  'All 4 providers ran today (Claude, ChatGPT, Gemini, Perplexity) — 80 responses, 436 citations total, all matched to tracked entities. Owned sites picked up 108 citations (24.8% of total); competitors took 328. Canstar led overall (67), followed by Finder (56), CommBank (54), InfoChoice (52) and RateCity (48). First day of this 7-day window, so no prior-day comparison.'
),
(
  '2026-06-25',
  'vs 24 Jun: total citations eased slightly (431 vs 436, -5). Owned site citations dropped from 108 to 90 (-18), while competitor citations rose to 341 (+13) — a less favourable mix than yesterday. Canstar (68) and Finder (66) extended their lead at the top; InfoChoice fell out of the top 3, replaced by RateCity (51).'
),
(
  '2026-06-26',
  'vs 25 Jun: citations ticked up (439 vs 431, +8) and owned site citations recovered to 105 (+15) while competitors held roughly flat (334 vs 341, -7). Canstar (69) and Finder (65) remain the two biggest citation winners; InfoChoice climbed back to 48, just ahead of CommBank (49) and RateCity (54).'
),
(
  '2026-06-27',
  'vs 26 Jun: a quieter day — total citations dropped to 406 (-33), with both owned (105, flat) and competitor (301, -33) citations contributing to the decline. Canstar fell to 58 citations from 69 the day before, the largest single-entity drop in the window so far, though it remained the top-cited site.'
),
(
  '2026-06-28',
  'vs 27 Jun: citations recovered (423 vs 406, +17), driven mostly by competitors (316 vs 301, +15) with owned sites flat at 105→107. Canstar bounced back to 69 citations, regaining its earlier high. CommBank (49) edged ahead of RateCity (48) for the first time this week.'
),
(
  '2026-06-29',
  'vs 28 Jun: the strongest day yet for owned sites — 114 citations (+7), with InfoChoice up to 54 and cracking the top 3 for the first time this week. Total citations also hit a window-high of 444 (+21). Notably Finder (62) overtook Canstar (59) at the top spot, the first time all week Canstar wasn''t the #1 cited entity.'
),
(
  '2026-06-30',
  'vs 29 Jun: a pullback after yesterday''s peak — total citations fell to 417 (-27), owned sites down to 102 (-12) and competitors down to 315 (-15). Canstar reclaimed the top spot with 69 citations as Finder eased back to 55. Across the full 7-day window, owned site citations have ranged 90-114 per day with no clear upward or downward trend yet — worth watching over a longer baseline.'
);
