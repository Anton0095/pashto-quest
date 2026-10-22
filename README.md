# Pashto Quest — Codex Week 1 handoff

**Scope:** Codex implementation of the agreed Week 1 finish: Day 6 with Saleha/Mina and the Hills, Day 7 with Edris and Ms Hameed's 25-question exam, and a seven-day **Level 1 → Level 10 / Newcomer → New Resident** milestone system. Existing Days 1–5 are to be preserved.

**Week 1 is now implemented in `index.html`.** Open it directly in a modern browser; no build or backend is needed. See `IMPLEMENTATION_NOTES.md` for changes and verification, and `tests/README.md` for test commands. Language review and actual audio recordings remain outstanding.

**Original handoff context:** `reference/pashto_quest_days_1_5_narrative.html` is an unchanged reference snapshot. The user's GitHub repository remains the source of truth. Compare repository HEAD with the reference first; never blindly replace newer GitHub work with this copy.

## Start here

1. Open the existing **Pashto Quest GitHub repository** in Codex.
2. Add the root documents (`AGENTS.md`, `GAME_SPEC.md`, `CODEX_TASK.md`, `XP_MILESTONE_SPEC.md`, `WEEK1_CONTENT_BLUEPRINT.md`, `CODE_AUDIT.md`, `ACCEPTANCE_TESTS.md`) to the repository. Put the HTML from `reference/` in a reference-only folder if helpful; it is not a replacement for the repo's main page.
3. Give Codex `CODEX_TASK.md` as the task. The file tells Codex what to implement and test.
4. Have Codex modify the real application code and automated tests, then inspect a browser build on desktop and mobile before merging.

## File map

| File | Purpose |
|---|---|
| `GAME_SPEC.md` | **Authoritative project-wide requirements** and implemented-versus-planned status |
| `CODEX_TASK.md` | Copy/paste implementation instruction and definition of done |
| `XP_MILESTONE_SPEC.md` | Exact 200-XP levels, checkpoint floors, caps, graduation, migration, replay rules |
| `WEEK1_CONTENT_BLUEPRINT.md` | Day 6/7 scenes, characters, lesson banks and question-by-question challenge blueprint |
| `CODE_AUDIT.md` | Findings in the latest reference HTML, with specific function names |
| `ACCEPTANCE_TESTS.md` | Manual and automated regression scenarios; skip-only path is mandatory |
| `AGENTS.md` | Constraints Codex should retain while editing |
| `tests/acceptance_fixtures.json` | Machine-readable expected levels, scores and challenge lengths |
| `tests/check_handoff.mjs` | Tests fixture integrity only; does **not** certify a working game |
| `reference/pashto_quest_days_1_5_narrative.html` | Historical working baseline (Days 1–5); **do not overwrite HEAD** |

## Agreed game decisions

- Day 1 only tutorial is truly compulsory; from Days 2–7 story openings are required for the **normal story path** but can be bypassed via the day challenge immediately.
- Day 6: `we / موږ`, Saleha meets the player at the Lake with her sister Mina; 15-turn final challenge takes place in the **Hills** as a special scene only (no fifth explorable map location).
- Day 7: `they / هغوی`, Edris introduces it among market shoppers; Ms Hameed conducts a **25-question** end-of-week examination at School, **20/25** to pass.
- Day 7 first-time pass is the **only** event unlocking Level 10 and **New Resident**. The user begins as **Level 1 · Newcomer**.
- A player who skips all optional visits, but passes daily assessments at the minimum thresholds, must still finish at **Level 10**.
- Keep character speaker and addressee labels, mobile-friendly offline HTML, Pashto pronunciation affordances and Laghman-focused language review.

## Important limitation

Lesson wording in the content blueprint is an **English semantic plan**, not a fully native-verified Pashto translation library. Codex must make Pashto content complete, internally consistent and meaningful, flag any uncertain local forms for review, and must not claim that generated audio is a native recording unless one is actually bundled.

**Language references:** See `LANGUAGE_REVIEW.md` for grammar resources and the native-review checklist.
