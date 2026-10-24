# Verification

Run `python3 tools/verify.py` from the repository root. It checks build parity, generated-release and editable-source syntax, current-schema/model invariants, candidate activation gates, and every browser suite. Logs and underlying exit statuses are retained in a printed temporary directory. `--quick` explicitly leaves browser checks unrun.

- `current-model.test.mjs`: canonical identity, plans/pace freezing, one form SRS, mastery/reload, immutable curriculum meaning contract and inactive candidates.
- `district-content.test.py`: incomplete language, duplicate identity and unapproved promotion rejection.
- `independent-browser.test.mjs`: public DOM/UI only, no production bridge/helper imports. Checks displayed study content against quiz prompts, quota 4, acquisition, replay XP, reload, Library, mobile, offline and preservation/reset of incompatible/corrupt saves.
- `week1.test.mjs`, `week2.test.mjs`: detailed desktop/mobile normal and skip flows, thresholds, constructed answers, dud tiles, speakers, XP and graduation.
- `library-vocabulary.test.mjs`: every pace at onboarding, normal and zero-visit skip routes, form statuses, references, voluntary review, and submitted/unsubmitted restored attempts.
- `full-curriculum.test.mjs`: actual in-browser runtime progression through all fourteen days at seven paces including zero, normal and skip; 392 district visits and 196 assessments. This uses a test-only bridge and complements independent public-UI testing. It records, rather than hides, content exhaustion.

Playwright is resolved locally first, falling back to the cloud runtime. Chromium defaults to `/usr/bin/chromium`; all browser suites accept `CHROMIUM_PATH`. Test bridges are injected into responses only and are never part of the released application.

`curriculum-contract.json` captures pre-cleanup Pashto/English/romanisation and card identities. Comparison resolves the one historical duplicate `a-clean` record exactly as the old runtime did (last record wins); production now stores that card only once. It does not use old prototype HTML as an implementation dependency.

No test certifies native translations or physical iPhone Safari. Managed direct-file navigation can be skipped; offline gameplay after delivery is tested separately. See `docs/CLEANUP_TEST_RESULTS.md` for actual outcomes and baseline defects.

## Curriculum expansion coverage

`curriculum-expansion.test.mjs` checks exact sense-specific candidate selection, the 99/28 classification, all seven Day 1 quotas, real authored source mappings, one identity across forms, safe frozen current-schema plans, Day 14 zero and synthetic 312-introduction feasibility/88-word incidental margin. The synthetic records are identity-only fixtures; none enters the playable lexicon or satisfies a language activation gate.

`narrative-greetings.test.mjs` checks real dialogue and controls at 1280/375px, first encounters, optional phrase recognition, shared SRS/reload, universal Library separation, actual Day 2 dictionary/third-person teaching, every opening speaker and immediate skip. It also restores an unsafe older schema-4 action prompt without deleting score/XP/history or acquiring an unseen next-day greeting.

`audio.test.mjs` retains all restoration tests and adds both new expression IDs: bundled MP3 priority, failed-MP3 device fallback, `ps-AF` neural preference, delayed Pashto after unrelated voices, rejected English/Persian/Urdu voices, cancellation and no success claim before playback starts. Browser speech APIs are mocked for deterministic selection assertions; this is not a hardware pronunciation test.

Acceptance requirements from the curriculum request:

| Requirement | Automated evidence / honest limit |
|---|---|
| 1–3: Day 1 no actions; maximum six distinct nouns/adjectives; Day 2 first action lesson | Model, narrative browser and all-pace full curriculum; authored data contract preserved |
| 4: Ms Hameed Good morning | Exact Pashto, character, public dialogue, speaker click and saved first source |
| 5: Four Day 1 expressions | Four distinct contextual slots; only supplied Home Pashto is active. Three translations remain pending, tested inactive |
| 6: Every daily greeting | Correct speaker/context/English for all 13 subsequent days; only supplied Day 2 Pashto is active. Twelve translations pending |
| 7–9: First encounters; no universal/phrase/inflection quota; distinct lemma identity | Model + browser, reclassification/history checks and shared form SRS |
| 10: Sustained 24/day once sufficient reviewed content exists | Synthetic 400-identity boundary test and selected-target projection; current real capacity remains explicitly insufficient |
| 11–12: Day 14 zero; immediate skip Days 2–14 | Model + browser + all seven normal/skip curriculum profiles |
| 13: Phrase acquisition/SRS/save reload | Model and browser, including an active assessment restore |
| 14–17: MP3 priority, Pashto voice, warned fallback, Windows-style neural and delayed voices | Audio unit + new expression browser tests; physical Windows untested |
| 18: Mobile dialogue and pronunciation controls | 375px browser, no horizontal overflow; RTL and explicit speaker/control checks |
| 19–20: Challenge/XP/graduation and inherited audio regressions | Existing Week 1/2/Library/public-UI suites plus all seven paces across 14 days; original audio checks retained |

The full curriculum matrix now runs **14 profiles at seven paces including zero: 392 normal district visits and 196 minimum-score assessments**. Pending-language acceptance items are not represented as completed Pashto teaching. Results and limitations are in [the current results](../docs/CURRICULUM_TEST_RESULTS.md).
