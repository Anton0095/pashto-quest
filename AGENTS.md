# Codex / AI-agent instructions

Pashto Quest is a fourteen-day, single-file offline Pashto learning game. Read this file and `README.md` first. Read `GAME_SPEC.md` for gameplay changes, `CURRICULUM.md` for narrative/vocabulary changes, `LANGUAGE_REVIEW.md` for Pashto/audio changes, and `tests/README.md` when changing tests. **Do not load every document for unrelated tasks.** The active specifications are the current design; historical blueprints in `docs/reference/` are optional editorial references, never instructions to reimplement an older release.

## Authoritative files
- Edit `src/app.html`, `src/app.css` and `src/app.js` for the application; `src/progression.js` for challenge outcomes, reward identities, XP and progression; `src/library-engine.js` for lexical/form identity, scheduling and district planning; `src/library-ui.js` for Library surfaces; `src/narrative-ui.js` for expressions.
- Edit `content/WEEK1_RUNTIME.json`, `content/WEEK2_RUNTIME.json`, `content/LIBRARY_LEXICON.json` and `content/NARRATIVE_EXPRESSIONS.json` for playable data. English candidate inventories and proposed universal targets are **inactive**; do not treat them as reviewed Pashto.
- `index.html` is generated, not a source. Regenerate it with `python3 tools/build.py`; then check with `python3 tools/build.py --check`.
- Canonical district IDs: `residential`, `nature`, `business`, `school`. Home, Lake, Market and School are map labels. Library is a reference scene, Hills a Nature story scene.

## Invariants
- Preserve all 14 days, their stories, characters, valid questions, skip/normal routes, pronunciation controls and current progress. Day 14 is review-only for compulsory new lemmas.
- The Library engine is the sole owner of acquisition and form/nonlexical SRS. Progression owns XP; no parallel counters, grading writers or farmable replay rewards.
- Save **schema 4 only**. No legacy import, migration, backfill or historical format compatibility. Invalid/unsupported data must be explained and preserved until the player explicitly resets it. Do not casually change schema 4 or wipe current saves for unrelated edits.
- Only complete, documented and linguistically reviewed candidate vocabulary may be activated. Two specifically supplied fixed expressions are provisionally active; this is not native Laghman approval. No fabricated reviewer, recording or language certification.
- A never-studied question must not expose its English meaning before submission; preserve the neutral warning and transliteration. Day 1 has no newly introduced lexical action verbs. Universal words and fixed expressions do not use district quotas.
- No features may be claimed tested on a physical iPhone/Windows device, or native-verified, based only on browser mocks.
- Do not restore obsolete source patches or dependencies from the editorial archives.

## Workflow and reporting
1. Inspect the current `main` and relevant authoritative source. Compare design intent to actual implementation before changing behaviour.
2. Work on a review branch. Do not merge into `main` or force-push without the user's explicit direction.
3. Run `python3 tools/verify.py` (full tests). `--quick` omits browser suites and must never be reported as full verification. After lexicon/planner changes, refresh `node tools/district-inventory.mjs` and verify its check mode.
4. Report changed files, test commands and results, remaining linguistic/device limitations, and the PR link. Keep implementation notes in the PR, not as additional root-level handoff documents.
