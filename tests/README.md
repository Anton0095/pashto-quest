# Pashto Quest verification

Use the single current entry point from the repository root. Full checks require Python 3, Node.js, Playwright and Chromium; browser suites honour `CHROMIUM_PATH` and may use the Codex cloud-runtime Playwright fallback.

```sh
python3 tools/build.py --check        # generated index.html parity
node tools/district-inventory.mjs --check
python3 tools/verify.py               # includes ALL browser suites
python3 tools/verify.py --quick       # excludes browser suites; not equivalent
```

`tools/verify.py` also performs editable/compiled JS syntax, lexical model/activation checks, generated inventory parity and Python content checks. Logs are emitted to a temporary directory; their paths are per-run and are not persistent project specifications.

| Suite | Contract exercised |
|---|---|
| `tests/game-state.test.mjs` | Domain APIs: all answer kinds, frozen fourteen-day assessments, atomic first submissions, shared rewards/SRS, retries, current saves and rejection/reset |
| `tests/resume-behaviour.test.mjs` | Public controls across all fourteen skip days; partial tiles, pause/resume, locked feedback, persisted results, and network-disabled HTML boot without runtime fetches |
| `tests/curriculum-first.test.mjs`, `tests/curriculum-schema.test.py` | All 128 identities/224 forms; curated order, Day 5 Dark, every pace, 20,000 deterministic licensed compositions and adversarial feature/unlock/schema/CSV cases |
| `tests/generated-practice.test.mjs` | Real study-before-generation, new combinations, mobile controls, frozen provenance/options/tiles, reload and retry |
| `tests/current-model.test.mjs` | District keys/pace/plans, lemma/form SRS, identity and fixed-language contract |
| `tests/curriculum-expansion.test.mjs` | Candidate selection, universal classes, Day 1 no-action rules, synthetic future capacity |
| `tests/district-content.test.py` | Incomplete language, duplicate identities and prohibited candidate promotion |
| `tests/audio.test.mjs` | MP3 preference, Pashto voice discovery/fallback, delayed voices, cancellation and warnings using mocks |
| `tests/independent-browser.test.mjs` | Public UI only; actual tutorial, study/quiz fairness, XP/replay/reload, Library, mobile and save handling |
| `tests/challenge-disclosure.test.mjs` | Unstudied challenge-word masking, answer-first scoring and restored question presentation |
| `tests/week1.test.mjs` | Day 1 four-interaction tutorial, normal/skip progression, Days 6/7 narratives and graduation |
| `tests/week2.test.mjs` | Days 8–14 lessons, contextual replies, distractor tiles, pass thresholds and persistence |
| `tests/library-vocabulary.test.mjs` | Paces, lexeme exposure/forms/SRS, study/reference, saved attempts |
| `tests/full-curriculum.test.mjs` | All 14 days, seven pace settings, normal/skip routes and supply shortfalls |
| `tests/narrative-greetings.test.mjs` | Expression-first lessons/assessments, active vs pending greetings, first encounters, Day 2 verbs, skip |

The comprehensive matrix has **14 profiles** (seven paces × normal/skip), with expected **392 normal district visits and 196 challenges**. The current lexicon cannot fill high-pace targets; the suite must report shortages rather than silently pass off candidates as available.

`tests/curriculum-contract.json` is a regression fixture preserving previously authored bilingual content and stable IDs; it is not a historical compatibility runtime. `tests/acceptance_fixtures.json` contains test fixtures. Browser suites may inject test-only bridges; none is part of the generated playable release. The independent UI and resume-behaviour suites use public controls without injected runtime bridges. Model/audio tests call whole module APIs instead of locating implementation snippets in `app.js`. The curriculum matrix completes the current four-interaction tutorial through its rendered controls before exercising lessons/challenges.

## Core acceptance invariants

- Day 1 tutorial requires four different interaction types and saves optional player profile; Day 2+ skip is immediately available.
- Distinct lemma/form history and frozen district assignments remain consistent; Day 1 has no lexical actions; Day 14 has no compulsory new words.
- Correctly use 12/15 daily passes and 20/25 on Days 7 and 14; graduation requires the actual Day 7 exam.
- Never-studied challenge words do not reveal English meaning before first submission, even after reload.
- Replay cannot farm XP; voluntary Library and phrase review cannot grant expression XP; first-score locks persist.
- Schema 6 alone is supported. Unsupported/corrupt saves preserve raw stored content until an explicit reset. Schema 4 is deliberately rejected; no historical repair/migration tests require obsolete runtime code.
- Only reviewed, complete candidate records can activate; pending English-only greetings stay inactive.
- Offline-after-delivery works without runtime JSON requests; RTL, desktop/mobile browser controls and visible audio fallback remain accessible.

A passing test suite does **not** certify Pashto translations, local pronunciation, bundled recordings, physical iPhone Safari or physical Windows compatibility. Do not claim such verification without independent testing.

Full checks also verify `content/CURRICULUM_AUDIT.json` parity and the effective per-day/per-district inventory. Generation tests deliberately include both authored outputs and three new composed drafts, using explicit form study rather than exposure or mastery as eligibility. Wrong gender/number/case/person, missing own romanisation, future forms and locked grammar are adversarial exclusions. Feature consistency is not native validation. Current default quotas may be short on earlier days because the planner no longer fills them with future-stage words. The complete curriculum matrix still exercises all fourteen days, seven paces and normal/skip routes; authored-content fixtures remain unchanged.
