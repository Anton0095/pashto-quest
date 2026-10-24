# Technical cleanup review

## Baseline and scope

Started from `14045d2` on `codex/implement-district-vocabulary-20261024`, the newest applicable district/P0–P3 implementation. Inspected main (`c45bb05`), district preparation (`8c3e059`), the Library handover, completed Week 1, Week 2 development and `feature/week2`. The latter is already an ancestor; no newer functionality was replaced. Work is isolated on `codex/cleanup-current-schema-20261024`.

The current request explicitly authorizes breaking old save compatibility and removing obsolete systems. Older feature instructions, migration requirements and patch-based workflows are superseded. The educational curriculum is retained, with its bilingual content captured in `tests/curriculum-contract.json`.

## Confirmed functional findings

| Finding | Evidence | Resolution |
|---|---|---|
| Immediate lesson replay farmed XP | Independent public-UI baseline at 1280px and 375px: repeating the same completed lesson immediately added **20 XP** | Permanent canonical skill reward identities; not-due repeats pay zero; due review is limited per skill/day |
| Standalone recall could appear without a standalone study card | Public UI encountered room/door/bread/fresh prompts after only sentence/context exposure; the old supplemental recall pool selected them without a study step | Remove the separate implicit recall picker; explicitly study due review material before its quiz |
| Corrupt stored progress was silently overwritten | Serving the unmodified baseline `14045d2`, setting `{broken`, then reloading replaced the raw value with a new schema-3 save, without a reset dialog | Schema-4 validation, blocking explanation, no write while incompatible/corrupt, explicit reset |
| Duplicate card identity | Two `a-clean` source records; the old runtime's map silently selected the last | One record, preserving the last record's effective authored content/metadata; no lost course references |
| Day 14 could create a compulsory new-word plan | Previous planner used the requested pace unchanged on Day 14 when candidates were available | Day 14 always creates a zero-new-word consolidation plan |
| Vocabulary types had competing authorities | Week 2's catalog labelled all vocabulary nouns, including demonstratives/question words/adverbs, despite explicit lexicon POS | The builder resolves lexical card types from the single lemma/form mapping and lexicon POS |

Sentence/context exposure is genuine exposure, not automatically mastery. The review change adds scaffolding; it does not erase incidental vocabulary or claim translations have been linguistically certified.

## Architectural findings and changes

- **Two SRS stores and writers:** old `progress.stats`, lemma/form SRS, duplicate answer scheduling and synchronization helpers could diverge. `LibraryEngine.schedule` is now the sole scheduling algorithm. Acquired forms hold lexical state; sentence/greeting units represent distinct recall skills using that same scheduler. Lexical aliases read form state directly, storing no mirrored counters.
- **Parallel progression flags:** historical exam-version/graduation/milestone flags duplicated challenge results. Current challenge records, valid scores and first-pass transitions now determine graduation, contiguous caps and once-only checkpoint awards. No old generic-exam reconciliation remains.
- **Layered old-save imports:** removed previous-key loaders, format migrations, legacy-day curriculum branches, old-stat repair/backfill and catch-up reconciliation. Save schema 4 is the only current format. Current valid saves and active attempts reload; incompatible data stays untouched until explicit reset.
- **District adapters:** replaced `house/river/market` navigation/storage aliases with `residential/nature/business` consistently across cards, plans, scenes, HTML/CSS, completion IDs and tests. `school` remains canonical. Immutable lexical/utterance IDs containing an English word such as `n-house` are content identities, not location adapters.
- **Editable/release ambiguity:** extracted HTML shell, styles and application source. One standard-library Python builder composes Week 1, Week 2, lexicon and runtime into standalone `index.html`. There is no second embedding pipeline editing the generated file in place.
- **Dead branches/state:** removed the always-empty mandatory-story allocation path, unused recall generator, unused completion helper, unused per-session reward sets and redundant tutorial-complete record. Narrative introduction flags remain because seeing a scene is distinct from learning a grammar rule through an exam.
- **Duplicate CSS:** removed the repeated round-path/stage block while retaining intentional responsive/type-specific overrides.
- **Obsolete files:** removed incorporated patchers and patch tests, tracked bytecode, prototype reference HTML, obsolete hashes, historical handover/test reports, superseded tasks, illustrative pre-integration dialogues, old screenshots and the unapproved Week 2 XP proposal. Current curriculum/source targets, language-review materials and acceptance contracts remain.
- **Readability:** formatted JS/CSS/HTML sources. Generated data stays compact in the offline release. `README.md`, `AGENTS.md` and one verification command describe the current architecture.

The public-UI tests intentionally import no production progression or grading helpers and inject no runtime bridge. Detailed type-specific suites still derive authored answers to exercise rendering/grading mechanics; they are complemented by the independent UI check, the pre-cleanup curriculum contract, fixed threshold/XP tests and a full six-pace matrix.

## Failures found during refactoring

These were corrected before the final verification run, without suppressing assertions:

1. The first canonical-key pass left three `map-*` DOM IDs unchanged. Public UI caught a null-element error; the shell IDs were corrected.
2. Converting Memory Trail from quiz-only to study-then-quiz exposed a location-specific teaching message with `loc=null`. The full Week 1 suite caught the page errors. Review now uses its own message, and the independent public test advances time and completes Memory Trail.
3. A pure-model reload assertion initially compared objects from different VM realms with `deepStrictEqual`. It now compares serialized records, which tests the actual save/reload boundary.
4. A parity check correctly failed between editing the builder and regenerating its output. The release was rebuilt; final parity must pass.

All historical migration-only assertions were removed because old formats are no longer supported. They were replaced with explicit incompatible/corrupt-save preservation/reset tests, not trivial passing checks. Actual first-answer, replay XP, grade thresholds, saved tiles, speaker context, full lessons and progression assertions remain.

## Current ownership and workflow

| Concern | Authority |
|---|---|
| HTML and accessibility structure | `src/app.html` |
| Styles | `src/app.css` |
| Narrative, rendering, grading and current save I/O | `src/app.js` |
| Save version/factory, challenge results, XP transactions and progression gates | `src/progression.js` |
| Lemma acquisition, form/unit scheduler, plans and bank selection | `src/library-engine.js` |
| Library reference/settings and lesson integration | `src/library-ui.js` |
| Week 1/2 authored cards/targets | `content/WEEK1_RUNTIME.json`, `content/WEEK2_RUNTIME.json` |
| Lexical identity, forms, POS, grammar notes and mappings | `content/LIBRARY_LEXICON.json` |
| Release generation and activation validation | `tools/build.py` |
| Candidate/capacity audit | `tools/district-inventory.mjs` |
| Complete verification | `python3 tools/verify.py` |

Authored challenge builders implement different required stories/question formats behind one selector and grader; they are not discarded as “duplicates.” Sentence and greeting skill units do not mirror lexical counters. Save-version metadata, authored content IDs and current scene state have defined purposes rather than historical conversion branches.

## Curriculum, testing and capacity limits

All fourteen days retain their teacher relationships and grammar: descriptions; he/she/SOV; I; informal you; respectful/plural you; we; they/Week 1 exam; demonstratives; plurals/counts; locations; possession; question words; adverbs; cumulative review. Muhammad Jan's Library greeting/home award, Saleha/Mina's Hills outing, Edris's market contexts, Ms Hameed's exams, optional visits, and immediate skip remain.

Detailed tests cover 1280px desktop and 375/390px mobile, 15/12 and 25/20 boundaries, wrong-first/second-submission locks, dialogue/dud/duplicate tiles, saved attempts, missing audio and offline text/quiz. The integration matrix runs **12 complete 14-day profiles**, six paces on both normal and skip routes: **336 district visits and 168 assessments**. It checks actual in-browser progression and flags shortages; it does not merely calculate isolated quotas.

There remain **127 draft lemmas / 108 content lemmas / 223 forms**; **360 untranslated candidates** remain inactive, including seven links to existing senses. Primary content districts: Residential 22, Nature 35, Business 30, School 21. POS: 45 nouns, 29 verbs, 26 adjectives, 8 adverbs. All 127 records still need native review; none is claimed native-approved.

With compulsory zero new words on Day 14, 20/day across the other 13 days needs 260 distinct assigned content lemmas: even before district/incidental constraints, the current pool is **at least 152 short**. Intensive 24/day needs 312: **at least 204 short**. The older 14-new-word-day objectives of 280/336 are short by 172/228 respectively. Real chronological usable assignment totals can be smaller because prior incidental exposure removes candidates from future “new” supply; `content/DISTRICT_INVENTORY_REPORT.json` and the actual matrix logs report each day/district honestly.

P3 cannot honestly be completed by promoting English-only candidates. Qualified Pashto translation, morphology, contextual examples, orthography/romanisation and Laghman review remain external content prerequisites. No translations, audio or review sign-offs were fabricated. Missing capacity does not block the 14-day narrative/exams and is never filled by repeats disguised as new words.

Physical iPhone Safari, native pronunciation and language naturalness remain unverified. Managed Chromium may block direct `file://` navigation; that skip is distinct from the passing offline-after-delivery tests. See `CLEANUP_TEST_RESULTS.md` for final executed outcomes and logs.
