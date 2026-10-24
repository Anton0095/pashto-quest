# Library implementation test results

Executed in the cloud environment with Node.js 24, Chromium 154 and Playwright 1.62.1. Browser suites completed with exit status 0. No physical iPhone Safari or native language/audio certification was performed.

| Command | Outcome |
|---|---|
| `python3 tools/embed_library.py --check` | Pass |
| `python3 tools/embed_week2.py --check` | Pass |
| `python3 patch/test_patch.py` | Pass |
| `node tests/check_handoff.mjs` | Pass: fixtures only, not gameplay certification |
| `node tests/week1.test.mjs` | Pass: 12 groups across four browser contexts; 1280/390px |
| `node tests/week2.test.mjs` | Pass: normal and skip-only Week 2 flows; 1280/375px |
| `node tests/library-vocabulary.test.mjs` | Pass: 9 groups including 1280/375px browser flows |
| `git diff --check` | Pass |

The original Week 1 content fingerprint and all 140 original Week 2 sentence targets remain unchanged. Existing regression assertions remain; their four-map-location selectors now explicitly exclude Library.

## Acceptance distinctions

- Fresh map/empty states, pure reference access, greeting/pace onboarding, canonical form identities, partial visits, Day 1 award/failure/replay, frozen plans, encountered details/status/SRS, conservative migration, grammar exposure, existing progression, challenge boundaries, mobile/keyboard, audio/offline and saved attempts have automated coverage.
- LIB-04 is conditional on available content/story constraints. All five even allocations are unit-tested using the real lexical pool with controlled story requirements. Real Day 1 browser flows test exact **20 and 24** acquired-content-lemma totals. Real 8/12/16 Day 1 choices are disabled, not reported as completed flows.
- LIB-05's 140 distinct content lemmas and fourteen-day 280-lemma objective are **not achieved**: the bank contains only 108. Exhaustion tests verify explicit content gaps and no repeated-as-new credit.
- LIB-24's insufficient-content restriction is exercised. These are draft candidates, not human-reviewed vocabulary. No native-review guarantee is inferred from passing tests.
- LIB-27 covers submitted and unsubmitted tile state after reload, Library access without reset, and pausing/resuming via town. Score, answer locks and XP remain stable.
- The additional empty-pool browser case completes a Day 13 opening lesson after all candidate lemmas have been reserved elsewhere, proving the lexical/grammar fallback does not loop.
- Direct `file://` navigation is **skipped** by managed Chromium policy. Unmodified offline tutorial/quiz **after HTTP delivery** passes. This does not certify real-device file opening.
- Variable Pashto template synthesis, native Laghman verification and a fully supplied curriculum for every pace remain outstanding, as described in `LIBRARY_IMPLEMENTATION.md`.

## Actual logs

### Build/fixture checks

```text
$ python3 tools/embed_library.py --check
Library bundle synchronized.
exit status: 0

$ python3 tools/embed_week2.py --check
Week 2 inline content is synchronized.
exit status: 0

$ python3 patch/test_patch.py
JS syntax: 0
dialogue tiles and normalization passed

Patch-injection and feature tests passed
exit status: 0

$ node tests/check_handoff.mjs
PASS: specification handoff files and expected XP/exam fixture are internally consistent.
NOTE: This is not a gameplay test; Codex must implement and execute the acceptance tests against the app.
exit status: 0

$ node --check /tmp/library-runtime.js
exit status: 0

$ git diff --check
exit status: 0
```

### Week 1 regression

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
```

### Week 2 regression

```text
PASS completed Week 1 baseline content and courses unchanged
PASS content: 140 exact semantic targets, full draft Pashto/romanization, 48 contextual replies, distinct tiles and normalization
PASS 1280px: skip-only Days 8–14, minimum scores, 11/15 and 19/25 failures, title/XP safety, reload and replay
PASS 1280px: 28 normal lessons, named openings, 25-turn final, mixed-script safety, offline replies
PASS 375px: skip-only Days 8–14, minimum scores, 11/15 and 19/25 failures, title/XP safety, reload and replay
PASS 375px: 28 normal lessons, named openings, 25-turn final, mixed-script safety, offline replies
PASS Week 2 application acceptance suite; native review and audio validation remain unperformed.
```

### Library acceptance

```text
PASS LIB-04/13/14: all five pace allocations are distinct, even, stable and frozen
PASS LIB-05/24: actual content shortage is explicit; no fabricated 140/280-word claim
PASS LIB-06/07/15/16: explicit lemma families, hidden forms, actual attempts and spaced mastery
PASS LIB-09/10/19–23: home atomic pass, failure and idempotent legacy migration
PASS Legacy started days keep their original curriculum and future pace remains separate
PASS Day 1 contextual targets: five existing authored sentences per location
PASS LIB-17: grammar unlock follows exposure, not schedule or pass
PASS LIB browser 1280px: fresh map, pace, phrases, partial visits, home failure/retry/replay, challenge reload, supported normal-day paces and blocked insufficient quotas, reference without rewards, search, keyboard and offline
PASS LIB browser 375px: fresh map, pace, phrases, partial visits, home failure/retry/replay, challenge reload, supported normal-day paces and blocked insufficient quotas, reference without rewards, search, keyboard and offline
PASS 9 Library test groups. Full 140/280 content quota and native Laghman/iPhone review remain unavailable; content gaps are explicit.
```
