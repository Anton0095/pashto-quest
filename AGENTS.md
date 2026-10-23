# Agent instructions — Pashto Quest

Before changes, read `GAME_SPEC.md`, `CODEX_TASK.md`, `XP_MILESTONE_SPEC.md`, `WEEK1_CONTENT_BLUEPRINT.md`, and `ACCEPTANCE_TESTS.md`.

- **Source of truth:** current GitHub HEAD. `reference/` is an older working HTML snapshot. Diff and merge surgically; do not replace newer source indiscriminately.
- **Scope:** implement the current authorized Week 2 task while preserving the completed Week 1 game and milestone behaviour. Preserve Days 1–5 behavior, all four explorable zones, accessible controls, mobile/offline gameplay, study/review and skip-to-challenge.
- **Narrative:** forced opening lessons exist only on normal route. Skip is available after Day 1 tutorial and immediately on Days 2–7. Passing 0-visit challenges is valid and must grant sufficient XP to progress.
- **Grammar:** first-week content is present tense. Use meaningful sentences and contextual speakers/recipients. Maintain Pashto RTL, English LTR, pronoun forms and appropriate respectful address. Do not claim local Laghmani dialect or voice verification without human review.
- **Challenge:** Days 1–6: 15 questions, threshold 12; Day 7: 25, threshold 20. Avoid hard-coded challenge lengths in runtime. No XP/title award for failing, replaying or repeating migrated first-pass flags.
- **Progression:** Level 10 and `New Resident` require a fresh-version Day 7 weekly examination pass, never a prior generic Day 7 clear. Save migration must preserve XP and completed Days 1–6.
- **Quality:** add automated tests for XP checkpoints, skip-only path, migration, grading, 25-question completion and idempotent rewards; browser test at mobile and desktop widths. Report test results honestly and provide a short changelog.

## Week 2 integration

- Days 8–14 are authorized as a draft development preview using the completed Week 1 baseline. Preserve all original Week 1 cards, courses, milestones and migration.
- `content/WEEK2_RUNTIME.json` is the editable Week 2 bank; run `python3 tools/embed_week2.py` to update the offline HTML and `--check` to verify synchronization.
- Keep all unreviewed content clearly marked. Do not claim native Laghman review or create approved alternative answers without reviewer evidence. See `content/WEEK2_REVIEW.md`.
- Week 2 has no approved level schedule: retain Level 10/New Resident, bank existing lesson/answer rewards, and do not apply Week 1 floors or first-pass bonuses to Days 8–14. The separate XP proposal is not runtime authorization.
- Run `python3 patch/test_patch.py`, `node tests/week1.test.mjs`, and `node tests/week2.test.mjs`. New dialogue/construct dud banks must permit unused tiles; original Week 1 constructions retain their all-answer-tile rule.
