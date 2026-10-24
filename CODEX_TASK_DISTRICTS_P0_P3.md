# Codex implementation task — District vocabulary + P0–P3 fixes

**Repository:** Anton0095/pashto-quest  
**Starting branch:** `codex/district-vocabulary-20261024`  
**Date:** 24 October 2026  
**Primary game:** standalone `index.html` with editable sources in `content/` and `src/`.  
**Working rule:** inspect current `main`/branch heads and diff before coding; keep later changes, use a non-destructive branch and PR, do not force-push or replace the Week 1/2 game with an older HTML.

## Completed preparation on this branch

1. Four canonical internal districts are Residential (`residential`), Nature (`nature`), Business (`business`), and School (`school`). The existing player labels and save keys are unchanged.
2. All 127 current Library entries are classified with `suitableDistricts` and `primaryDistrict`. District matching is used by the assignment, review and challenge paths.
3. `content/DISTRICT_VOCABULARY_CANDIDATES.json` contains **360 English lexical candidates**, 90 per primary district, separate from the **108 currently countable** content lemmas. They are NOT active/translated/validated. See `docs/DISTRICT_MODEL.md`.
4. Current main also contains fourteen authored story days and Week 2 draft material. Preserve Day 1 Library home handover, Day 6 Hills story, Day 7 25-question exam, Days 8–14, and all 48 authored Week 2 dialogue responses.

## P0 — Fix acquired vocabulary persistence first

**Confirmed source defect:** `src/library-engine.js` `encounter()` creates `r` with `s.acquired[e.lemmaId] || {...}` but does not set `s.acquired[e.lemmaId] = r`. First encounters are therefore transient; `expose()` and `practise()` cannot reliably grow the cumulative lemma bank.

- Persist each valid new record in `p.library.acquired` *before* updating forms or returning it.
- Preserve existing records, existing first-encounter metadata, form attempts, due dates, mastered status and idempotent event IDs.
- Verify `expose` versus `practise`: merely displaying a card counts as encountered; only submitted attempts count as practice. Repeated form variants share a lemma ID.
- Do not reaward XP, replay challenge score, backfill unseen words, or count vocabulary in a reference/plan as acquired.
- Inspect migration and the historical duplicate `a-clean` ID; preserve saves and use an explicit migration if needed.
- Tests: start with empty bank, expose one form, expose it again, practise correct/wrong, expose a second form, save/reload, migrate legacy save twice, and assert exact unique-lemma/form counts plus due/mastery transitions.
- Test normal lessons, skipped challenges, restored challenges and Library voluntary practice. Ensure legacy card stats and Library statuses agree.

## P1 — Make the daily word pace learner-controlled (below 20)

Current presets 8/12/16/20/24 are blocked on Day 1 because `storyRequirements[1]` covers 17 distinct lemmas. Fixed story *exposure* must not impose a floor on formally assigned new words.

- Offer at least **4, 8, 12, 16, 20, 24** new lexical lemmas/day (1/2/3/4/5/6 per district respectively), with 20 default. Consider an explicit **0 new words — review day** option; no fractions and no silent repeat-as-new substitution.
- The quota counts unique dictionary/lexical lemmas, not verb conjugations, plural forms, adjectives with agreement, greetings, grammar, sentences, or incidental story tokens.
- Keep five authored contextual sentence targets per visited district when they exist. Scaffolding, translations, revisited vocabulary and authored variants may make a sentence intelligible without requiring every word in it to be a newly assigned lemma.
- Separate fields for `scheduledNewLemmas`, `actuallyEncounteredScheduledLemmas`, `incidentalStoryLemmas`, `reviewedExistingLemmas` and `masteredLemmas`.
- Match each selected pace to the four canonical districts using the legacy place-key adapters. Any future scene, e.g. Hills, must resolve to district `nature` without becoming a fifth daily quota.
- Keep started-day plans frozen and explain changes as applying to the next unstarted day. Do not auto-freeze Day 1 before onboarding pace is selected. Support lower settings from a completely fresh save.
- Do not promise a feasible 24/day over fourteen days unless there are sufficient distinct **activated** entries. Explicitly report shortages, never fabricate Pashto or count repeats twice.
- Day 7 and Day 14 are cumulative exam days; make review-only scheduling a supported choice without blocking the narrative.
- Tests: fresh save choosing each lower pace; four-location allocation count; actual exposure tally; plan freeze; change pace midweek; skip with zero location visits; Day 1 original 17-word story with 4 or 8 *assigned* lemmas; no XP or progress loss.

## P2 — Align assessment and spaced review with the genuine bank

- Preserve 15-question Days 1–6 and 8–13 challenges, 25-question Days 7 and 14 examinations; pass marks 12/15 and 20/25. Preserve the current special speaker/addressee context, Hill scene, dialogue question-response tiles, dud tiles, first-submitted answer, saved attempts, once-only rewards, and immediate skip.
- Sample lexical recall primarily from genuinely assigned/encountered lemmas and due previously acquired lemmas, in a traceable ratio; do not present never-studied content as if formally taught.
- Preserve the day's grammar objective even when selected new-lemma pace is low. Keep authored contextual dialogue and sentences, but provide context/help where non-target unfamiliar words are necessary. Avoid word quota dependence for required grammar forms.
- The player can skip visits and attempt the assessment immediately. Skipping should not mark all location lessons or planned vocabulary acquired; only items actually displayed/answered may register exposure and practice.
- Old card SRS and new lemma/form SRS must be consistent. Revisit due forms across other districts and days, prevent duplicate XP, and ensure incorrect answers return for review.
- Define a rigorous deterministic selector and snapshot selected questions for save/restore so replay/reload does not rerandomize a live assessment.
- Tests: 4/8/12/16/20/24-day learner challenge content, zero-visit skip, previous-day due recall, partial route, failure/retry, duplicated tiles, 19/25 vs 20/25, frozen restored attempt, no regrading/no XP duplication.

## P3 — Expand safely into the district-wide lexical corpus

- Review `content/DISTRICT_VOCABULARY_CANDIDATES.json` (360 additional English roots, 90 per district). The candidate list is a working editorial inventory, **not 360 validated Pashto translations**.
- Audit against all existing `LIBRARY_LEXICON.json` lemmas for same lexeme under alternate English senses. Merge semantic duplicates; do not increase counts by creating inflections, number variants or synonyms for an existing lemma.
- Use standard Pashto orthography and carefully checked Pashto headwords; attach POS, senses, transliteration, appropriate grammatical forms, semantic district tags, plausible scene(s), neutral contextual examples and speaker/recipient. Mark all unverified items `needsReview` with clear gaps. No invented audio or false claims of Laghman native validation.
- If high-confidence drafts are provided, still require qualified local Laghman speaker sign-off on gender, agreement, spelling, dialect form, romanisation, naturalness and accepted assessment answers. If unsure, leave item inactive rather than guessing.
- Promote only complete/usable entries into the active `LIBRARY_LEXICON.json` with stable lemma IDs, sourceMappings and suitable district associations. New lexical entries must supply safe lesson and assessment content; avoid blind Pashto sentence substitution.
- Content capacity: **14×20 = 280** distinct new lemmas for standard pace; **14×24 = 336** for intensive, plus a buffer for scenario restrictions and duplicates. Current 108 active entries are insufficient. Candidate backlog may be more than enough numerically only after review/promotion; verify attainable allocations across real chronological learner saves and all supported rates.
- Ensure district diversity, including homes/neighbours, lake/hills/forest/farm, bazaar/specialty shops, and classroom/library/sport/science. Characters may travel to authored scenes; their home district does not limit their vocabulary.
- Treat Day 14 as deliberate cumulative review, not a compulsory 20-new-word story.
- Provide content inventory and test coverage by POS, district, scene, difficulty, review status, duplicate lemma and form count.

## District-specific regression requirements

- Internal canonical names: Residential district, Nature district, Business district, School district. Player-facing map remains Home, Lake, Market, School, plus reference Library.
- Preserve historical `house`, `river`, `market`, `school` keys in course IDs, progress.complete, saves and challenge/event IDs unless a fully tested idempotent migration exists.
- Add a future-proof scene model `{sceneId,districtId,displayName,participants}`. `hills` → `nature`; future bakery → `business`, neighbour home → `residential`. Do not add unrelated new mandatory map visits.
- Retain Week 1 graduation at Level 10 · New Resident and Week 2 progression; no forced invented Week 2 leveling system.
- Do not regress keyboard focus, large RTL script, mobile at 375px and desktop 1280px, offline single HTML, or fallback audio warnings. Do not imply native recordings are bundled.

## Required verification and completion report

1. Run editable-source parity and synchronization: `python3 tools/embed_library.py`, `python3 tools/embed_library.py --check`, `python3 tools/embed_week2.py --check`.
2. Run all relevant existing tests, including `node tests/week1.test.mjs`, `node tests/week2.test.mjs`, `node tests/library-vocabulary.test.mjs`; add regression tests for P0–P3, real-time onboarding and all supported pace profiles.
3. Perform fresh/legacy saves and browser-based normal-route and skip-route playthroughs. Clearly distinguish automated Chromium tests from unverified physical iPhone Safari.
4. Inspect GitHub diff for no overwritten newer implementation, no unexpected binary/audio additions, and no forced migrations.
5. Provide: actual activated distinct lemma count, candidate/unreviewed count, feasible pace schedule by day, per-district breakdown, native-review status, passed/failed/skipped tests, preserved save compatibility and remaining blockers.
6. Prepare a reviewable PR; do **not** merge, force-push main or claim linguistic certification without human approval.

**Do not consider the work complete merely because 360 English candidates exist.** It is complete when vocabulary persistence is correct, lower paces actually work, assessments track the player's bank, and enough honest, reviewed content exists for the supported schedules.
