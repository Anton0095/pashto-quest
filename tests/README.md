# Verification

Run `python3 tools/verify.py` from the repository root. It checks build parity, generated-release and editable-source syntax, current-schema/model invariants, candidate activation gates, and every browser suite. Logs and underlying exit statuses are retained in a printed temporary directory. `--quick` explicitly leaves browser checks unrun.

- `current-model.test.mjs`: canonical identity, plans/pace freezing, one form SRS, mastery/reload, immutable curriculum meaning contract and inactive candidates.
- `district-content.test.py`: incomplete language, duplicate identity and unapproved promotion rejection.
- `independent-browser.test.mjs`: public DOM/UI only, no production bridge/helper imports. Checks displayed study content against quiz prompts, quota 4, acquisition, replay XP, reload, Library, mobile, offline and preservation/reset of incompatible/corrupt saves.
- `week1.test.mjs`, `week2.test.mjs`: detailed desktop/mobile normal and skip flows, thresholds, constructed answers, dud tiles, speakers, XP and graduation.
- `library-vocabulary.test.mjs`: every pace at onboarding, normal and zero-visit skip routes, form statuses, references, voluntary review, and submitted/unsubmitted restored attempts.
- `full-curriculum.test.mjs`: actual in-browser runtime progression through all fourteen days at six paces, normal and skip; 336 district visits and 168 assessments. This uses a test-only bridge and complements independent public-UI testing. It records, rather than hides, content exhaustion.

Playwright is resolved locally first, falling back to the cloud runtime. Chromium defaults to `/usr/bin/chromium`; all browser suites accept `CHROMIUM_PATH`. Test bridges are injected into responses only and are never part of the released application.

`curriculum-contract.json` captures pre-cleanup Pashto/English/romanisation and card identities. Comparison resolves the one historical duplicate `a-clean` record exactly as the old runtime did (last record wins); production now stores that card only once. It does not use old prototype HTML as an implementation dependency.

No test certifies native translations or physical iPhone Safari. Managed direct-file navigation can be skipped; offline gameplay after delivery is tested separately. See `docs/CLEANUP_TEST_RESULTS.md` for actual outcomes and baseline defects.
