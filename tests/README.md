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
