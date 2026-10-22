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
