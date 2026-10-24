# Pashto Quest development

Use the existing checkout and preserve the current fourteen-day curriculum. Read `README.md`, `docs/CLEANUP_REVIEW.md`, `GAME_SPEC.md`, `XP_MILESTONE_SPEC.md`, and `ACCEPTANCE_TESTS.md` and `docs/LIBRARY_DESIGN.md` before changing behaviour. Historical specifications can describe superseded compatibility requirements; this release intentionally supports save format 4 only.

- Edit `src/` and `content/`; regenerate `index.html` with `python3 tools/build.py`. `python3 tools/build.py --check` verifies the entire release in one pass.
- Canonical district IDs are `residential`, `nature`, `business`, `school`. The map labels remain Home/Lake/Market/School plus reference Library. Hills is a Nature scene, not a fifth quota.
- `LibraryEngine` owns acquisition, form identity, SRS and planning. Do not introduce a mirrored card-stat system or old-save migrations. Incompatible saves require explanation and explicit reset.
- Preserve all 14 authored days, teachers/relationships, grammar objectives, normal/skip routes, contextual dialogue and unused distractor tiles. Day 14 is consolidation with no compulsory new vocabulary.
- Days 1–6/8–13 have 15 questions, pass 12; Days 7/14 have 25, pass 20. Week 1 graduation requires the actual current examination. Week 2 retains Level 10/New Resident without inventing a new schedule.
- `src/progression.js` owns XP transactions and progression. Do not add parallel exam/graduation flags or XP mutations to UI handlers.
- First submissions and reward identities are persistent. Replays must not farm XP; Library views/review never grant XP.
- Preserve RTL and accessible keyboard/mobile controls, single-file offline playback and explicit audio fallback.
- Keep candidates without complete Pashto inactive. Do not invent native review, Laghman pronunciation, translated sentences or approved variants. Refresh inventory with `node tools/district-inventory.mjs` after vocabulary/planner changes.
- Run `python3 tools/verify.py` for comprehensive checks. Public UI tests deliberately avoid runtime bridges; matrix tests complement detailed type-specific UI regressions. Never label a quick-only run as full validation.
- Use review branches/PRs; do not merge into main or force-push without explicit authorization.
