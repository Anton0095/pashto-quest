# Codex handover — implement Pashto Quest Library & vocabulary engine

**Status: implementation requested; no gameplay code modified by this handover.**  
**Repo:** `Anton0095/pashto-quest`  
**Starting baseline:** latest source of `codex/week2-development` (the latest Day 8–14 development branch seen 24 October 2026), or its properly merged successor if Week 2 has already landed. Inspect branch ancestry and diffs before making edits. **Do not resurrect old `reference/` HTML.**

## First read
1. `docs/LIBRARY_VOCABULARY_FEATURE_SPEC.md` — full requirements and tricky migration/skip rules.
2. `docs/LIBRARY_ACCEPTANCE_TESTS.md` — implementation and regression contract.
3. `AGENTS.md`, `GAME_SPEC.md`, `XP_MILESTONE_SPEC.md`, `WEEK1_CONTENT_BLUEPRINT.md`, `ACCEPTANCE_TESTS.md`, `CODEX_TASK.md`, `WEEK2_IMPLEMENTATION.md` and `content/WEEK2_REVIEW.md` as available on the chosen source branch.
4. Inspect `index.html`, `content/WEEK2_RUNTIME.json`, `tools/embed_week2.py`, `tests/week1.test.mjs` and `tests/week2.test.mjs`. Document current capabilities vs remaining requirements rather than trusting old “to implement” prose.

## Required implementation
1. Add a fifth, accessible, always-visible **Library** map location that never counts toward the four daily teaching visits, including the Day 6 Hills story exception.
2. Move Day 1 four-greeting tutorial with Muhammad Jan to Library, including new-player pace selection; keep Day 1 Skip locked until tutorial completion and all later Skip routes immediately available.
3. Reframe Day 1 Muhammad Jan 15-question/12-pass final challenge as awarding the player's home. A first pass grants it once; legacy Day 1 passes imply it on migration. The existing Home learning location remains reachable before and after handover, with narrative ownership changing; don't invent inventory.
4. Add editable structured Pashto **lemma and form data** and player-specific **acquired vocabulary bank**. Grammar inflections count under one lemma; avoid re-counting singular/plural, verb conjugations and repeated lessons. Track actual exposures and per-form practice/SRS.
5. Offer pace presets **8, 12, 16, 20(default), 24 new content lemmas/day**, evenly across Home/Market/Lake/School (2,3,4,5,6 each). Update an in-progress player's pace from the next unstarted day; persist day plans and deterministic selections. Provide enough curated/reviewed vocabulary to support every selectable pace or clearly limit unavailable settings; never silently duplicate or invent a Pashto word to fill a quota.
6. Preserve the five contextual story sentences per location and all Day 1–14 grammar/narrative themes. Select old-bank words for contextual recycling and SRS review while inserting per-location new lemmas, using linguistically safe constrained templates, not unsupervised translations.
7. Build Library Vocabulary Bank: browse/search acquired lemmas, open entry to see **encountered** inflected forms, pronunciation if available, example meanings, learning status; include empty state. Separate Grammar Journal containing unlocked grammar rules with Pashto/romanisation/English examples and reviewed status.
8. Update challenge generation to reuse previously acquired and newly scheduled content, with a deterministic fallback for immediate skip-only/empty-bank states. Never auto-mark skipped lessons or scheduled words as acquired, nor award mastery on opening a word card.
9. Migrate older localStorage saves without deleting XP, SRS, Day 1–14 clears, Week 1 `New Resident` gate, Week 2 title cap or first-pass rewards. Do not use duplicate historic card IDs as unique lexical keys.
10. Keep offline **single-file `index.html`** release. If Week 2 editable JSON is changed, update embedded output and pass the sync-check command. Retain RTL/LTR accessibility and functional audio fallback; flag unreviewed Laghman forms rather than invent verification.

## Order of work
- **A. Audit:** map current save keys, content cards, review stats and core challenge generation; list actual source files. Verify branch ancestry and retain Week 2.
- **B. Data:** lexicon/grammar schema + legacy mappings + save migration + deterministic planner, first with unit tests.
- **C. UI/story:** Library and pace settings, tutorial move, house award, vocabulary and grammar views.
- **D. Integration:** retrofit Day 1–14 lessons and assessments without breaking fixed stories or graded item counts; add review and word-family deduplication.
- **E. QA:** execute the companion acceptance tests and the existing Week 1/Week 2 suites at desktop and mobile widths. Verify real offline behavior; disclose any test or native-language review not performed.
- **F. Delivery:** commit implementation to a fresh `codex/implement-library-vocabulary` branch or a noncolliding equivalent. Supply changed-file list, demo instructions, sample migration trace, actual test logs, unresolved language review entries and a PR comparison URL. Do not overwrite unmerged Week 2 code, push to `main`, force-push or claim unverified features finished.

## Explicit invariants
- **Four** teaching locations + **one** always-open Library; not five teaching lessons per day.
- Same Day 1–14 stories except approved tutorial/house handover narrative and necessary ownership continuity.
- Days 1–6 & 8–13: **15 questions, pass 12**; Days 7 & 14: **25 questions, pass 20**.
- Week 1 Level 10/New Resident only after valid revised Day 7 exam; Week 2 level progression not newly authorised.
- Skip available after Day 1 greetings; immediately from Day 2 onward; zero optional visits accepted.
- No false learned-word credit, double XP, lost progress, unreviewed translated sentences or server dependency.

**Definition of complete:** playable code and tests satisfying `docs/LIBRARY_ACCEPTANCE_TESTS.md`; this documentation branch alone is not an implementation.
