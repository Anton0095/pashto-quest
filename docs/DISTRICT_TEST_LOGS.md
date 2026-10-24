# District implementation test logs

All final commands below completed with exit status 0. The initial Week 1 Memory Trail timeout was resolved by advancing the test clock for the shared SRS schedule; see the implementation report. Direct file navigation is explicitly skipped by managed Chromium policy, while offline-after-delivery passes. Native language/audio review and physical iPhone Safari were not performed.

## python3 tools/embed_library.py --check

```text
Library bundle synchronized.
Exit status: 0
```

## python3 tools/embed_week2.py --check

```text
Week 2 inline content is synchronized.
Exit status: 0
```

## node tools/district-inventory.mjs --check

```text
District inventory: 108 activated content lemmas; 360 inactive candidates. No untranslated entry promoted.
Exit status: 0
```

## node tests/district.test.mjs

```text
PASS P0 persistence, form attempts/reload/repair, P1 all seven paces, frozen plans, incidental exposure, review-only exams
PASS P2 due-form selector and traceable origins; P3 scenes, aliases, activation gates and 14 chronological capacity profiles
Exit status: 0
```

## python3 tests/district-content.test.py

```text
....
----------------------------------------------------------------------
Ran 4 tests in 0.083s

OK
Exit status: 0
```

## python3 patch/test_patch.py

```text
JS syntax: 0
dialogue tiles and normalization passed

Patch-injection and feature tests passed
Exit status: 0
```

## node tests/check_handoff.mjs

```text
PASS: specification handoff files and expected XP/exam fixture are internally consistent.
NOTE: This is not a gameplay test; Codex must implement and execute the acceptance tests against the app.
Exit status: 0
```

## git diff --check

```text

Exit status: 0
```

## P0/P1 first-stage browser validation

```text
PASS LIB-04/13/14: all five pace allocations are distinct, even, stable and frozen
PASS LIB-05/24: actual content shortage is explicit; no fabricated 140/280-word claim
PASS LIB-06/07/15/16: explicit lemma families, hidden forms, actual attempts and spaced mastery
PASS LIB-09/10/19–23: home atomic pass, failure and idempotent legacy migration
PASS Legacy started days keep their original curriculum and future pace remains separate
PASS Day 1 contextual targets: five existing authored sentences per location
PASS LIB-17: grammar unlock follows exposure, not schedule or pass
PASS LIB browser 1280px: fresh map, pace, phrases, partial visits, home failure/retry/replay, challenge reload, all seven normal-day paces and honest content gaps, reference without rewards, search, keyboard and offline
PASS LIB browser 375px: fresh map, pace, phrases, partial visits, home failure/retry/replay, challenge reload, all seven normal-day paces and honest content gaps, reference without rewards, search, keyboard and offline
PASS 9 Library test groups. Full 140/280 content quota and native Laghman/iPhone review remain unavailable; content gaps are explicit.
Exit status: 0
```

## Final Library browser validation

```text
PASS LIB-04/13/14: all seven pace allocations are distinct, even, stable and frozen
PASS LIB-05/24: actual content shortage is explicit; no fabricated 140/280-word claim
PASS LIB-06/07/15/16: explicit lemma families, hidden forms, actual attempts and spaced mastery
PASS LIB-09/10/19–23: home atomic pass, failure and idempotent legacy migration
PASS Legacy started days keep their original curriculum and future pace remains separate
PASS Day 1 contextual targets: five existing authored sentences per location
PASS LIB-17: grammar unlock follows exposure, not schedule or pass
PASS LIB browser 1280px: fresh map, pace, phrases, partial visits, home failure/retry/replay, challenge reload, all seven normal-day paces and honest content gaps, reference without rewards, search, keyboard and offline
PASS LIB browser 375px: fresh map, pace, phrases, partial visits, home failure/retry/replay, challenge reload, all seven normal-day paces and honest content gaps, reference without rewards, search, keyboard and offline
PASS 9 Library test groups. Full 140/280 content quota and native Laghman/iPhone review remain unavailable; content gaps are explicit.
Exit status: 0
```

## Week 1 final regression

```text
PASS XP-01 fresh newcomer
PASS XP-02/03/05/06 minimum checkpoints, failure, repeat atomic rewards
PASS XP-04 banked XP cannot bypass story gate
PASS XP-07/08 legacy migration is idempotent and preserves SRS and XP
PASS Original Days 1–5 content and courses preserved; Day 2 has 20 sentences
TRACE 1280px Day 1: 200 XP, Level 2, Newcomer, 0 visits
TRACE 1280px Day 2: 400 XP, Level 3, Newcomer, 0 visits
TRACE 1280px Day 3: 600 XP, Level 4, Newcomer, 0 visits
TRACE 1280px Day 4: 800 XP, Level 5, Newcomer, 0 visits
TRACE 1280px Day 5: 1200 XP, Level 7, Newcomer, 0 visits
TRACE 1280px Day 6: 1600 XP, Level 9, Newcomer, 0 visits
TRACE 1280px Day 7: 1800 XP, Level 10, New Resident, 0 visits
PASS browser 1280px: tutorial + all seven minimum-score skip-only clears, 25-turn exam, reload and reward-idempotent replays
TRACE 390px Day 1: 200 XP, Level 2, Newcomer, 0 visits
TRACE 390px Day 2: 400 XP, Level 3, Newcomer, 0 visits
TRACE 390px Day 3: 600 XP, Level 4, Newcomer, 0 visits
TRACE 390px Day 4: 800 XP, Level 5, Newcomer, 0 visits
TRACE 390px Day 5: 1200 XP, Level 7, Newcomer, 0 visits
TRACE 390px Day 6: 1600 XP, Level 9, Newcomer, 0 visits
TRACE 390px Day 7: 1800 XP, Level 10, New Resident, 0 visits
PASS browser 390px: tutorial + all seven minimum-score skip-only clears, 25-turn exam, reload and reward-idempotent replays
PASS browser 1280px: all 28 normal lessons, mandatory openings, interactive group practice, five-sentence sets, all final scenes
PASS browser: legacy 15-turn clear rejected, 19/25 failure, 20/25 retry, reload, safe missing audio
PASS browser 390px: all 28 normal lessons, mandatory openings, interactive group practice, five-sentence sets, all final scenes
PASS browser: legacy 15-turn clear rejected, 19/25 failure, 20/25 retry, reload, safe missing audio
SKIP file:// access: managed Chromium policy blocks local-file navigation; real-device opening remains unverified.
PASS unmodified standalone runtime: offline tutorial/quiz after delivery, Pashto RTL, no app network dependencies
PASS 12 test groups across 4 browser contexts; actual app runtime exercised.
Exit status: 0
```

## Week 2 regression

```text
PASS completed Week 1 baseline content and courses unchanged
PASS content: 140 exact semantic targets, full draft Pashto/romanization, 48 contextual replies, distinct tiles and normalization
PASS 1280px: skip-only Days 8–14, minimum scores, 11/15 and 19/25 failures, title/XP safety, reload and replay
PASS 1280px: 28 normal lessons, named openings, 25-turn final, mixed-script safety, offline replies
PASS 375px: skip-only Days 8–14, minimum scores, 11/15 and 19/25 failures, title/XP safety, reload and replay
PASS 375px: 28 normal lessons, named openings, 25-turn final, mixed-script safety, offline replies
PASS Week 2 application acceptance suite; native review and audio validation remain unperformed.
Exit status: 0
```
