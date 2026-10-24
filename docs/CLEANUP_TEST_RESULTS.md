# Cleanup verification results

The final comprehensive `python3 tools/verify.py` run completed with **exit status 0** after the source/model refactor. All five browser suites passed. Additional exact-interval/XP/invalid-grade unit checks and current-save negative UI cases also passed. Quick checks are recorded separately and are not presented as full browser validation.

## Outcomes

| Check | Result |
|---|---|
| Single-builder editable/generated parity | Pass |
| Editable JS and compiled-release syntax | Pass |
| Canonical identity / SRS / curriculum contract | Pass |
| Candidate activation/build gates | 4 tests pass |
| Public-UI-only desktop/mobile test | Pass, 1280px and 375px |
| Unsupported/corrupt/inconsistent save preservation and explicit reset | Pass |
| Detailed Week 1 normal/skip/boundary/review suite | Pass |
| Detailed Week 2 normal/skip/dialogue/dud suite | Pass |
| Library pacing/forms/voluntary review/restore suite | Pass |
| Full six-pace normal/skip matrix | 12 profiles; 336 visits; 168 assessments pass |
| Inventory parity and whitespace checks | Pass |
| Direct `file://` navigation | Skipped by managed Chromium policy |
| Offline-after-delivery | Pass |
| Physical iPhone Safari / native language/audio certification | Not performed |

No production test bridge is present in the release. The public-UI test uses displayed teaching content as its recall oracle and reads persisted state through localStorage. The integration matrix intentionally uses a response-only bridge for speed and is not described as an independent linguistic oracle.

## Actual full-curriculum supply

All profiles complete all fourteen days and graduate/finish at the exact permitted thresholds. This is **not** a claim that the requested vocabulary supply is complete. Day 14 schedules zero new words. Counts below are actual in-browser scheduled distinct lemmas, with shortages against 13 teaching days. Incidental exposure and district constraints make usable formal assignment capacity smaller than the raw 108-entry pool.

| Pace | Route | Assigned across curriculum | Unfilled assigned target | First content-gap day |
|---:|---|---:|---:|---:|
| 4 | normal | 40 | 12 | 10 |
| 4 | skip | 52 | 0 | none |
| 8 | normal | 54 | 50 | 7 |
| 8 | skip | 68 | 36 | 8 |
| 12 | normal | 62 | 94 | 6 |
| 12 | skip | 76 | 80 | 7 |
| 16 | normal | 67 | 141 | 5 |
| 16 | skip | 78 | 130 | 5 |
| 20 | normal | 73 | 187 | 4 |
| 20 | skip | 81 | 179 | 4 |
| 24 | normal | 78 | 234 | 4 |
| 24 | skip | 84 | 228 | 4 |

The inactive English backlog contributes **zero** playable words. No test weakens quotas, counts repeated words as new, or treats an untranslated candidate as Pashto to make these figures pass.

## Baseline findings and outcomes

Original district implementation `14045d2` passed its existing Week 1/2 and Library suites. Independent baseline testing nevertheless found immediate replay XP farming and standalone recall without explicit study scaffolding. A separate public-UI check of the unmodified baseline confirmed silent replacement of corrupt storage. These are resolved; current tests require zero not-due replay XP, study-before-review, raw-value preservation and explicit reset.

Intermediate failures (canonical map IDs, review with no location, VM-realm comparison and a stale build between source edits/regeneration) were diagnosed and fixed. They are described in `CLEANUP_REVIEW.md`. No final required check remains unexplained or failing. Linguistic capacity/qualified review remains the explicit external blocker to full P3 content supply.

## Final comprehensive command output

```text
PASS python3 tools/build.py --check
PASS node tools/district-inventory.mjs --check
PASS node tests/current-model.test.mjs
PASS python3 tests/district-content.test.py
PASS node --check src/app.js
PASS node --check src/library-engine.js
PASS node --check src/library-ui.js
PASS node --check src/progression.js
PASS node --check tools/district-inventory.mjs
PASS node --check tests/current-model.test.mjs
PASS node --check tests/full-curriculum.test.mjs
PASS node --check tests/independent-browser.test.mjs
PASS node --check tests/library-vocabulary.test.mjs
PASS node --check tests/week1.test.mjs
PASS node --check tests/week2.test.mjs
PASS compiled release syntax
PASS node tests/independent-browser.test.mjs
PASS node tests/week2.test.mjs
PASS node tests/week1.test.mjs
PASS node tests/library-vocabulary.test.mjs
PASS node tests/full-curriculum.test.mjs
Logs: /tmp/pashto-quest-checks-63pd4qva
```

## Independent baseline UI

```text
BASELINE unintroduced review prompt: تازه
BASELINE unintroduced review prompt: کتاب
BASELINE replay XP increase: 20
PASS independent public UI 1280 pace 4, study/quiz, acquisition, replay, reload, Library, RTL/mobile/offline
BASELINE unintroduced review prompt: ډوډۍ
BASELINE unintroduced review prompt: تازه
BASELINE unintroduced review prompt: دروازه
BASELINE unintroduced review prompt: کوټه
BASELINE replay XP increase: 20
PASS independent public UI 375 pace 4, study/quiz, acquisition, replay, reload, Library, RTL/mobile/offline
```

## Independent corrupt-save baseline

```text
CONFIRMED baseline 14045d2 silently replaced corrupt stored value with schema 3 without reset confirmation.
```

## Additional current model checks

```text
PASS current schema: seven pacing options, canonical districts, one form SRS, idempotent events, mastery, intact 14-day content contract and inactive candidate gates
PASS exact SRS intervals, not-due stability, wrong-answer due reset, invalid grades and once-only XP/completion transactions
```

## Additional public UI/save checks

```text
PASS independent public UI 1280 pace 4, study/quiz, acquisition, replay, reload, Library, RTL/mobile/offline
PASS independent public UI 375 pace 4, study/quiz, acquisition, replay, reload, Library, RTL/mobile/offline
PASS independent incompatible/corrupt save preservation, explicit reset, and current-version reload
```

## Week 1 raw log

```text
PASS XP-01 fresh newcomer
PASS XP-02/03/05/06 minimum checkpoints, failure, repeat atomic rewards
PASS XP-04 banked XP cannot bypass story gate
PASS Current save reload retains current XP and gate flags
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
PASS browser: current exam 19/25 failure, 20/25 retry, reload, safe missing audio
PASS browser 390px: all 28 normal lessons, mandatory openings, interactive group practice, five-sentence sets, all final scenes
PASS browser: current exam 19/25 failure, 20/25 retry, reload, safe missing audio
SKIP file:// access: managed Chromium policy blocks local-file navigation; real-device opening remains unverified.
PASS unmodified standalone runtime: offline tutorial/quiz after delivery, Pashto RTL, no app network dependencies
PASS 11 test groups across 4 browser contexts; actual app runtime exercised.
```

## Week 2 raw log

```text
PASS current canonical Week 1 content; independent curriculum contract checked separately
PASS content: 140 exact semantic targets, full draft Pashto/romanization, 48 contextual replies, distinct tiles and normalization
PASS 1280px: skip-only Days 8–14, minimum scores, 11/15 and 19/25 failures, title/XP safety, reload and replay
PASS 1280px: 28 normal lessons, named openings, 25-turn final, mixed-script safety, offline replies
PASS 375px: skip-only Days 8–14, minimum scores, 11/15 and 19/25 failures, title/XP safety, reload and replay
PASS 375px: 28 normal lessons, named openings, 25-turn final, mixed-script safety, offline replies
PASS Week 2 application acceptance suite; native review and audio validation remain unperformed.
```

## Library raw log

```text
PASS LIB-04/13/14: all seven pace allocations are distinct, even, stable and frozen
PASS LIB-05/24: actual content shortage is explicit; no fabricated 140/280-word claim
PASS LIB-06/07/15/16: explicit lemma families, hidden forms, actual attempts and spaced mastery
PASS Home award is atomic and replay-safe in current schema
PASS Day 1 contextual targets: five existing authored sentences per location
PASS LIB-17: grammar unlock follows exposure, not schedule or pass
PASS LIB browser 1280px: fresh map, pace, phrases, partial visits, home failure/retry/replay, challenge reload, all seven normal-day paces and honest content gaps, reference without rewards, search, keyboard and offline
PASS LIB browser 375px: fresh map, pace, phrases, partial visits, home failure/retry/replay, challenge reload, all seven normal-day paces and honest content gaps, reference without rewards, search, keyboard and offline
PASS 8 Library test groups. Full 140/280 content quota and native Laghman/iPhone review remain unavailable; content gaps are explicit.
```

## Full curriculum matrix raw log

```text
PASS full curriculum 4 normal [{"day":1,"assigned":4,"gap":false},{"day":2,"assigned":4,"gap":false},{"day":3,"assigned":4,"gap":false},{"day":4,"assigned":4,"gap":false},{"day":5,"assigned":4,"gap":false},{"day":6,"assigned":4,"gap":false},{"day":7,"assigned":4,"gap":false},{"day":8,"assigned":4,"gap":false},{"day":9,"assigned":4,"gap":false},{"day":10,"assigned":3,"gap":true},{"day":11,"assigned":1,"gap":true},{"day":12,"assigned":0,"gap":true},{"day":13,"assigned":0,"gap":true},{"day":14,"assigned":0,"gap":false}]
PASS full curriculum 4 skip [{"day":1,"assigned":4,"gap":false},{"day":2,"assigned":4,"gap":false},{"day":3,"assigned":4,"gap":false},{"day":4,"assigned":4,"gap":false},{"day":5,"assigned":4,"gap":false},{"day":6,"assigned":4,"gap":false},{"day":7,"assigned":4,"gap":false},{"day":8,"assigned":4,"gap":false},{"day":9,"assigned":4,"gap":false},{"day":10,"assigned":4,"gap":false},{"day":11,"assigned":4,"gap":false},{"day":12,"assigned":4,"gap":false},{"day":13,"assigned":4,"gap":false},{"day":14,"assigned":0,"gap":false}]
PASS full curriculum 8 normal [{"day":1,"assigned":8,"gap":false},{"day":2,"assigned":8,"gap":false},{"day":3,"assigned":8,"gap":false},{"day":4,"assigned":8,"gap":false},{"day":5,"assigned":8,"gap":false},{"day":6,"assigned":8,"gap":false},{"day":7,"assigned":6,"gap":true},{"day":8,"assigned":0,"gap":true},{"day":9,"assigned":0,"gap":true},{"day":10,"assigned":0,"gap":true},{"day":11,"assigned":0,"gap":true},{"day":12,"assigned":0,"gap":true},{"day":13,"assigned":0,"gap":true},{"day":14,"assigned":0,"gap":false}]
PASS full curriculum 8 skip [{"day":1,"assigned":8,"gap":false},{"day":2,"assigned":8,"gap":false},{"day":3,"assigned":8,"gap":false},{"day":4,"assigned":8,"gap":false},{"day":5,"assigned":8,"gap":false},{"day":6,"assigned":8,"gap":false},{"day":7,"assigned":8,"gap":false},{"day":8,"assigned":7,"gap":true},{"day":9,"assigned":3,"gap":true},{"day":10,"assigned":2,"gap":true},{"day":11,"assigned":0,"gap":true},{"day":12,"assigned":0,"gap":true},{"day":13,"assigned":0,"gap":true},{"day":14,"assigned":0,"gap":false}]
PASS full curriculum 12 normal [{"day":1,"assigned":12,"gap":false},{"day":2,"assigned":12,"gap":false},{"day":3,"assigned":12,"gap":false},{"day":4,"assigned":12,"gap":false},{"day":5,"assigned":12,"gap":false},{"day":6,"assigned":2,"gap":true},{"day":7,"assigned":0,"gap":true},{"day":8,"assigned":0,"gap":true},{"day":9,"assigned":0,"gap":true},{"day":10,"assigned":0,"gap":true},{"day":11,"assigned":0,"gap":true},{"day":12,"assigned":0,"gap":true},{"day":13,"assigned":0,"gap":true},{"day":14,"assigned":0,"gap":false}]
PASS full curriculum 12 skip [{"day":1,"assigned":12,"gap":false},{"day":2,"assigned":12,"gap":false},{"day":3,"assigned":12,"gap":false},{"day":4,"assigned":12,"gap":false},{"day":5,"assigned":12,"gap":false},{"day":6,"assigned":12,"gap":false},{"day":7,"assigned":4,"gap":true},{"day":8,"assigned":0,"gap":true},{"day":9,"assigned":0,"gap":true},{"day":10,"assigned":0,"gap":true},{"day":11,"assigned":0,"gap":true},{"day":12,"assigned":0,"gap":true},{"day":13,"assigned":0,"gap":true},{"day":14,"assigned":0,"gap":false}]
PASS full curriculum 16 normal [{"day":1,"assigned":16,"gap":false},{"day":2,"assigned":16,"gap":false},{"day":3,"assigned":16,"gap":false},{"day":4,"assigned":16,"gap":false},{"day":5,"assigned":3,"gap":true},{"day":6,"assigned":0,"gap":true},{"day":7,"assigned":0,"gap":true},{"day":8,"assigned":0,"gap":true},{"day":9,"assigned":0,"gap":true},{"day":10,"assigned":0,"gap":true},{"day":11,"assigned":0,"gap":true},{"day":12,"assigned":0,"gap":true},{"day":13,"assigned":0,"gap":true},{"day":14,"assigned":0,"gap":false}]
PASS full curriculum 16 skip [{"day":1,"assigned":16,"gap":false},{"day":2,"assigned":16,"gap":false},{"day":3,"assigned":16,"gap":false},{"day":4,"assigned":16,"gap":false},{"day":5,"assigned":12,"gap":true},{"day":6,"assigned":2,"gap":true},{"day":7,"assigned":0,"gap":true},{"day":8,"assigned":0,"gap":true},{"day":9,"assigned":0,"gap":true},{"day":10,"assigned":0,"gap":true},{"day":11,"assigned":0,"gap":true},{"day":12,"assigned":0,"gap":true},{"day":13,"assigned":0,"gap":true},{"day":14,"assigned":0,"gap":false}]
PASS full curriculum 20 normal [{"day":1,"assigned":20,"gap":false},{"day":2,"assigned":20,"gap":false},{"day":3,"assigned":20,"gap":false},{"day":4,"assigned":13,"gap":true},{"day":5,"assigned":0,"gap":true},{"day":6,"assigned":0,"gap":true},{"day":7,"assigned":0,"gap":true},{"day":8,"assigned":0,"gap":true},{"day":9,"assigned":0,"gap":true},{"day":10,"assigned":0,"gap":true},{"day":11,"assigned":0,"gap":true},{"day":12,"assigned":0,"gap":true},{"day":13,"assigned":0,"gap":true},{"day":14,"assigned":0,"gap":false}]
PASS full curriculum 20 skip [{"day":1,"assigned":20,"gap":false},{"day":2,"assigned":20,"gap":false},{"day":3,"assigned":20,"gap":false},{"day":4,"assigned":19,"gap":true},{"day":5,"assigned":2,"gap":true},{"day":6,"assigned":0,"gap":true},{"day":7,"assigned":0,"gap":true},{"day":8,"assigned":0,"gap":true},{"day":9,"assigned":0,"gap":true},{"day":10,"assigned":0,"gap":true},{"day":11,"assigned":0,"gap":true},{"day":12,"assigned":0,"gap":true},{"day":13,"assigned":0,"gap":true},{"day":14,"assigned":0,"gap":false}]
PASS full curriculum 24 normal [{"day":1,"assigned":24,"gap":false},{"day":2,"assigned":24,"gap":false},{"day":3,"assigned":24,"gap":false},{"day":4,"assigned":6,"gap":true},{"day":5,"assigned":0,"gap":true},{"day":6,"assigned":0,"gap":true},{"day":7,"assigned":0,"gap":true},{"day":8,"assigned":0,"gap":true},{"day":9,"assigned":0,"gap":true},{"day":10,"assigned":0,"gap":true},{"day":11,"assigned":0,"gap":true},{"day":12,"assigned":0,"gap":true},{"day":13,"assigned":0,"gap":true},{"day":14,"assigned":0,"gap":false}]
PASS full curriculum 24 skip [{"day":1,"assigned":24,"gap":false},{"day":2,"assigned":24,"gap":false},{"day":3,"assigned":24,"gap":false},{"day":4,"assigned":12,"gap":true},{"day":5,"assigned":0,"gap":true},{"day":6,"assigned":0,"gap":true},{"day":7,"assigned":0,"gap":true},{"day":8,"assigned":0,"gap":true},{"day":9,"assigned":0,"gap":true},{"day":10,"assigned":0,"gap":true},{"day":11,"assigned":0,"gap":true},{"day":12,"assigned":0,"gap":true},{"day":13,"assigned":0,"gap":true},{"day":14,"assigned":0,"gap":false}]
PASS 12 full 14-day profiles at six paces, 336 normal visits, 168 minimum-score assessments, explicit supply gaps
```
