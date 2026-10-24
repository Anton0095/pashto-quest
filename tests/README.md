# Week 1 verification

Run from the repository root:

```sh
node tests/check_handoff.mjs
node tests/week1.test.mjs
```

The second command executes pure progression/migration checks and Chromium browser flows against the actual inline runtime. Install Playwright in your development tooling if it is unavailable (`npm install --prefix /tmp/pashto-test-tools playwright` then `NODE_PATH=/tmp/pashto-test-tools/node_modules node tests/week1.test.mjs`). It uses `/usr/bin/chromium` by default; override with `CHROMIUM_PATH`. The Codex image's existing Playwright installation is also detected. No runtime dependency or web host is needed by the game.

Optional screenshots: `TEST_ARTIFACTS=/tmp/pashto-week1-qa node tests/week1.test.mjs`.

Tests serve an in-memory copy with a test-only inspection bridge; no bridge is written into `index.html`. Answers are derived from the runtime's authored question definitions to test rendering, first-answer grading, lengths, pass boundaries, XP, persistence and navigation. They do not certify Pashto translations. Fixture checks independently assert the progression contract and compare historical Days 1–5 content against the unchanged reference. The final smoke check attempts local `file://` access (reported as skipped if managed browser policy blocks it), then exercises the unmodified game with networking disabled after delivery.

Browser coverage includes 1280px and 390px: the full tutorial/seven-day minimum-score skip-only path, all normal lessons and special events, replay rewards, legacy migration, 19/25 failure then 20/25 retry, Memory Trail, missing audio, RTL and viewport overflow. Browser tests require no application network access and leave no save changes in your usual browser profile.

## Week 2

```sh
python3 patch/test_patch.py
python3 tools/embed_week2.py --check
node tests/week1.test.mjs
TEST_ARTIFACTS=/tmp/pashto-week2-qa node tests/week2.test.mjs
```

The Week 2 suite checks all 140 semantic targets, embedded-bank parity, the completed Week 1 baseline hash, 48 contextual replies, indexed duplicate words and normalization. Browser flows at 1280px and 375px exercise all seven minimum-score skip-only clears, failure/retry boundaries, every normal lesson, first-answer locking, unused dud tiles, Undo/Clear/removal, first-word RTL placement, reload/replay, Level 10 and save preservation, offline replies and safe mixed-script rendering. It does not certify native language or pronunciation.

## Library and vocabulary

```sh
python3 tools/embed_library.py --check
node tests/library-vocabulary.test.mjs
```

Editable Library data/runtime live in `content/LIBRARY_LEXICON.json` and `src/library-*.js`. After edits, run `python3 tools/embed_library.py` to regenerate the standalone bundle. The Week 2 embed check is still required. Optional screenshots: `TEST_ARTIFACTS=/tmp/pashto-library-qa node tests/library-vocabulary.test.mjs`.

The Library suite covers migration, all five allocation presets with controlled content, explicit real-content quota restrictions, lemma/form deduplication, spaced practice, home-award failure/retry/replay, partial visits, challenge restoration, supported normal-day actual totals, search, reference-only access, keyboard focus and offline pages. It does not certify seven/fourteen days of 20 new lemmas: the existing bank has only 108 content lemmas. Day 1 supports 20/24; smaller targets are blocked because its preserved story exceeds them. See `docs/LIBRARY_IMPLEMENTATION.md` for remaining content work.

## District P0–P3

```sh
node tests/district.test.mjs
python3 tests/district-content.test.py
node tools/district-inventory.mjs --check
```

Run these alongside both embedding checks, patch/fixture checks and all three existing browser suites. Day 1 now supports all seven paces (0/4/8/12/16/20/24); incidental story exposure is separate from assigned vocabulary. Earlier Library notes describing blocked lower paces are historical. See `docs/DISTRICT_IMPLEMENTATION_RESULTS.md` for current capacity and inactive-candidate limitations.
