# Week 2 Implementation Notes for Codex (content-only stage)

## Current approved scope

Days 8–14 narrative and language lessons only. Extend the existing four-location `loops`/`words`/`courses` structure, and reuse existing daily and weekly challenge UI, SRS review and skip capabilities. Do not introduce new interaction engines or an additional explorable location.

## Dependency

Week 1 Day 6, Day 7 and the Level 10/New Resident milestone spec in `GAME_SPEC.md` must be correctly integrated before enabling Day 8 progression. `pashto_quest_days_1_5_narrative.html` is a historical reference snapshot only, NOT source of truth.

## Data contract

For each day: one narrative-required opening (except Skip), exactly four optional location lessons of five contextual sentences (20/day), 15-question final challenge (12/15), except Day 14 weekly review (25 questions, 20/25). Day 8 follows a passing Day 7 score. Each sentence needs `id`, `day`, `location`, `speaker`, `recipient`, `english`, `pashto`, `romanization`, `note`, `status`, and `review_refs`. `status=needs_native_review` until checked.

## Tests

- Every Day 8–14 has exactly four zone records, five sentence targets per zone, correct grammar topic, and story opening.
- Passing Daily Day 7 unlocks Day 8 only after the real weekly examination; no Day 8 access from obsolete saves that previously marked generic Day 7 complete.
- Skipping all location visits on Day 8/9/…/14 allows an immediate challenge; no false completion flags.
- Day 14 uses the correct 25-question threshold and cannot award a Week 1 graduation twice.
- Speaker and addressee are visible; conversation prompts have semantically meaningful sentence/answer pairs.
- Existing Day 1–7 learning, pronunciation controls, character identity and XP progression remain unchanged.
- Existing saved progress safely migrates; Week 2 keys do not overwrite Week 1.

## Deferred game features

Scavenger hunt is presented as narrative/quiz only (no object-finding), map stays four locations, no minigame added, no new audio generation or UI mode. Those can be planned later.
