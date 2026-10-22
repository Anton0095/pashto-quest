# Agent instructions — Pashto Quest

Before changes, read `GAME_SPEC.md`, `CODEX_TASK.md`, `XP_MILESTONE_SPEC.md`, `WEEK1_CONTENT_BLUEPRINT.md`, and `ACCEPTANCE_TESTS.md`.

- **Source of truth:** current GitHub HEAD. `reference/` is an older working HTML snapshot. Diff and merge surgically; do not replace newer source indiscriminately.
- **Scope:** implement pending Day 6, Day 7, XP/title and associated UI/persistence/test changes. Preserve Days 1–5 behavior, all four explorable zones, accessible controls, mobile/offline gameplay, study/review and skip-to-challenge.
- **Narrative:** forced opening lessons exist only on normal route. Skip is available after Day 1 tutorial and immediately on Days 2–7. Passing 0-visit challenges is valid and must grant sufficient XP to progress.
- **Grammar:** first-week content is present tense. Use meaningful sentences and contextual speakers/recipients. Maintain Pashto RTL, English LTR, pronoun forms and appropriate respectful address. Do not claim local Laghmani dialect or voice verification without human review.
- **Challenge:** Days 1–6: 15 questions, threshold 12; Day 7: 25, threshold 20. Avoid hard-coded challenge lengths in runtime. No XP/title award for failing, replaying or repeating migrated first-pass flags.
- **Progression:** Level 10 and `New Resident` require a fresh-version Day 7 weekly examination pass, never a prior generic Day 7 clear. Save migration must preserve XP and completed Days 1–6.
- **Quality:** add automated tests for XP checkpoints, skip-only path, migration, grading, 25-question completion and idempotent rewards; browser test at mobile and desktop widths. Report test results honestly and provide a short changelog.
