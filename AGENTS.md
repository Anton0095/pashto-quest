# Codex and ChatGPT project instructions

Read `README.md` and this file first. Consult `GAME_SPEC.md` for mechanics, `CURRICULUM.md` for lessons/characters/vocabulary, `LANGUAGE_REVIEW.md` for Pashto/audio, and `tests/README.md` for verification **only when relevant**. `docs/reference/` contains historical editorial plans, not active instructions. Inspect current source before trusting prose.

## Single sources of authority
- Edit `src/` and playable `content/*.json`, never generated `index.html` directly. Regenerate with `python3 tools/build.py`.
- `src/library-engine.js`: lemma/form identity, acquisition, spaced repetition and four-district planning.
- `src/progression.js`: current save factory, XP, results, milestones, reward identity and access rules.
- `src/question-engine.js`: answer evaluation and indexed tiles; `src/learning.js` applies practice transactions. UI renders outcomes.
- `src/storage.js`: save validation/I/O and active assessment snapshots. `src/app.js` only composes services and wires controls. Keep authored blueprints in content modules/JSON, apart from renderers.
- Four district keys: `residential`, `nature`, `business`, `school`. Library is reference-only; Hills is a Nature scene.
- Preserve 14 authored days, characters, normal/skip paths and current learning states. Day 1 excludes lexical action verbs; Day 14 has zero compulsory new lemmas.
- Only **save schema 5** is supported. Do not add old-format migration/backfill/content-repair adapters or silent save resets. Unsupported/corrupt saves remain untouched until explicit user reset.
- Do not add duplicate SRS/XP stores, replay-farmable rewards, or reveal unseen vocabulary's English meaning before answer submission.
- Inactive language candidates and pending expressions must remain inactive until documented review. No invented native Laghman approval, pronunciation or audio recordings.
- Preserve mobile/RTL interaction and candid audio fallback. Mocked browser testing is not physical-device verification.

## Change process
Use a review branch; do not merge or force-push without explicit authorisation. Rebuild and run `python3 tools/verify.py` (full browser-inclusive suite); `--quick` is **not** full. For vocabulary/planner edits refresh `node tools/district-inventory.mjs`. Report changed files, actual tests and limitations, and the PR link. Record task-specific handoffs in PRs, not new root-level Markdown files.
