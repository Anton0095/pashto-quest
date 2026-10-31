# Pashto Quest

> **Integrated user approval (31 October 2026):** [approval record](content/USER_LANGUAGE_APPROVALS.json) covers all 473 base lemmas and 18 conventional phrases. نن (“today”) uses the subsequently supplied `nun`. This approves exact base spelling, listed senses and supplied transliteration; inflections, grammatical analyses, generated combinations, recordings and 59 excluded candidates remain outside its scope. No independent native certification is claimed.

An offline, browser-based Pashto learning game set in a village in Laghman, Afghanistan. Four teaching districts (Home, Lake, Market and School), a reference Library and a recurring cast support 14 narrative days of cumulative language study. Base entries and registered phrases are user-approved; grammar and inflected forms remain drafts, without independent native certification.

## Product goal and delivery status

The aim is cumulative Pashto learning through a coherent village story: recurring characters teach language that fits their scene, speaker and listener. Text, meaning and any illustration must agree; for example, Muhammad Jan describing an open window needs an open-window scene. Correct and incorrect answer feedback should behave consistently on every lesson surface, including forced story lessons and optional expressions. These are general requirements, not exceptions for individual days.

The intended onboarding includes a Pashto conversation about the learner’s name/gender, and the narrative calls for contextual greetings throughout the days. The current implementation uses English profile controls and has fourteen active user-approved contextual expression slots out of seventeen. These are delivery gaps, not a redefinition of that goal. The remaining three Day-1 slots and two tutorial questions need reviewed language and explicit activation; do not invent translations or claim that English controls fulfil the Pashto conversation. Visual relevance is an acceptance requirement, not a claim that every scene already has a bespoke illustration.

## Play

Open the generated `index.html` in a modern browser, or serve the repository with:

```sh
python3 -m http.server 8000
```

The game needs no backend, account, API key or runtime JSON fetch. The generated release embeds source data. A browser may impose restrictions when opening local files; local HTTP hosting is a useful development alternative. Progress is kept in browser local storage. Audio is optional: bundled `audio/<id>.mp3` recordings take priority when supplied; otherwise the game attempts a detected Pashto device voice and warns about uncertain fallback. No native-reviewed MP3 pack is currently committed. Physical iPhone Safari and Windows speech quality have not been independently verified.

## Development

Use Python 3 for the standard-library builder and Node.js/Playwright/Chromium for full tests. Choose commands using the [risk-based validation policy](tests/README.md#choose-validation-by-change-and-risk). The commands below are a reference, not a checklist for every edit; Markdown-only changes need no build or gameplay tests.

```sh
python3 tools/build.py              # update generated offline index.html
python3 tools/build.py --check      # check generated release matches sources
python3 tools/verify.py             # model, syntax, build and browser suites
python3 tools/verify.py --quick     # no browser suites: not full validation
node tools/district-inventory.mjs   # refresh candidate/capacity report after relevant edits
node tools/district-inventory.mjs --check
```

**Never edit `index.html` as the authoritative source.**

| Source | Owns |
|---|---|
| `src/app.js` | Browser composition, shared runtime state and event wiring |
| `src/content.js`, `src/assessment-content.js` | On-demand generated-card registry, English narrative and task blueprints |
| `src/library-engine.js` | Sole lemma/form identity, acquisition, SRS and district planner |
| `src/progression.js` | Save factory/version, XP/reward identity, results, milestones and access rules |
| `src/sentence-engine.js`, `content/SENTENCE_FRAMES.json` | Bounded feature/semantic unification, licensed draft compositions and deterministic practice selection |
| `src/question-engine.js` | Shared answer evaluation, approved normalisation and indexed tiles |
| `src/learning.js`, `src/questions.js` | Practice transactions, lesson pools, frozen assessments and answer choices |
| `src/save-schema.js`, `src/storage.js` | Nested current-save validation; Web Locks coordinated persistence, fail-closed without coordination and active challenge snapshots |
| `src/sentence-scene.js`, `src/answer-feedback.js` | Teacher/listener context and shared correct/wrong presentation |
| `src/ui.js`, `src/world-ui.js`, `src/lesson-ui.js`, `src/challenge-ui.js` | DOM/RTL shell and world, lesson and assessment presentation |
| `src/tutorial-ui.js`, `src/grammar-ui.js`, `src/library-ui.js`, `src/narrative-ui.js` | Onboarding, workshops and reference/expression presentation |
| `src/audio.js` | Common MP3/device-voice player and cancellation |
| `src/app.html`, `src/app.css` | UI shell and styles |
| `content/LEARNING_CURRICULUM.json`, `content/FIXED_PHRASES.json` | Curriculum, grammar, story/people, assessment scenes and eighteen conventional expression exceptions |
| `content/LIBRARY_LEXICON.json`, `content/NARRATIVE_EXPRESSIONS.json` | Lexical forms/mappings and active/pending expression identities |
| `content/DISTRICT_VOCABULARY_CANDIDATES.json`, `content/UNIVERSAL_TEACHING_TARGETS.json` | Inactive editorial candidates, not playable translations |
| `tools/build.py`, `tools/verify.py` | Offline assembly/validation and complete verification |

Modules expose small factory APIs with explicit state/service dependencies and screen-transition callbacks. UI submits answers through `learning.js`; it does not maintain a second score, XP or SRS store. `tools/build.py` assembles the modules in explicit dependency order inside one private script closure. The generated game needs no module loader, framework, package manager or network requests for code/curriculum. Runtime dependencies remain browser DOM, local storage and optional Audio/Web Speech APIs; development uses Python and Node/Playwright/Chromium.

`docs/reference/WEEK2_LESSON_DATA.json` archives the historical English editorial targets and is never read by the runtime/builder; `tests/curriculum-contract.json` preserves authored-content regression fixtures. `content/DISTRICT_INVENTORY_REPORT.json` is an inventory output. Do not delete data files just because some names overlap.

## How progression works

The Day 1 Library tutorial introduces four question types: choose the meaning of `سلام`, arrange `څنګه یې؟`, select a gender preference and type a player name using English profile controls. Completing all four is required to begin Day 1. A normal day includes narrative openings and district lessons; after the tutorial on Day 1, or immediately on Days 2–14, the player can skip visits and attempt the daily challenge. Skips do not mark unseen locations or vocabulary complete.

Each district selects eligible new **distinct lexical lemmas** in its explicit curated introduction order, at a selected pace of 0/4/8/12/16/20/24 per day. Universal vocabulary, inflections, grammar units and expressions do not consume district quotas. Day 1 teaches descriptions, while action verbs start on Day 2. Day 14 schedules no compulsory new words. Daily challenges have 15 items, pass 12; Days 7 and 14 have 25, pass 20. A passed Day 7 exam unlocks Level 10 and New Resident.

The current lexicon contains 400 district lemmas (100 per district) and 73 universal lemmas. All 473 base entries are `user_approved`, with scoped reviewer/date/reference evidence; individual inflections and grammar remain provisional. The candidate archive retains its original draft provenance and 59 excluded candidates remain inactive. A fresh profile at the default pace of 24 receives six district lemmas per location on Days 1–13; Day 14 has none. The generated `content/VOCABULARY_REVIEW.csv` is the human review register.

## Documentation roles and precedence

Latest explicit user instructions govern the task. This README states the product goal; [GAME_SPEC.md](GAME_SPEC.md) owns mechanics, [CURRICULUM.md](CURRICULUM.md) owns teaching sequence, and [LANGUAGE_REVIEW.md](LANGUAGE_REVIEW.md) owns linguistic review. [AGENTS.md](AGENTS.md) owns contributor workflow and [tests/README.md](tests/README.md) owns validation policy. Domain-specific rules complement each other; resolve a real conflict explicitly rather than choosing whichever file is convenient. Source/data establish what currently runs, not permission to replace intended behaviour with a limitation.

| Documents | Role |
|---|---|
| This README, AGENTS, GAME_SPEC, CURRICULUM, LANGUAGE_REVIEW, tests/README | Active goals, mechanics, content, review and workflow as scoped above |
| [Fixed phrase register](docs/grammar/FIXED_PHRASE_EXCEPTIONS.md) | Current conventional-expression exceptions and expansion gate |
| [Generation rules](docs/grammar/PASHTO_GENERATION_RULES.md) | Researched grammar constraints; no native certification or blanket claim of implemented coverage |
| [Generation implementation proposal](docs/grammar/GENERATION_IMPLEMENTATION.md) | Historical implementation rationale, updated to remove prohibited fallback instructions; not an outstanding task |
| [Generation coverage](docs/grammar/GENERATION_COVERAGE.md), [instructional delivery](docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md) | Generated evidence tied to recorded inputs/release; potential capacity differs from measured delivery |
| [Audit remediation](docs/maintenance/AUDIT_REMEDIATION.md) | PR #23 implementation/validation record and explicitly identified remaining limits |
| [Audit performance](docs/maintenance/AUDIT_PERFORMANCE.md), [P1 performance](docs/maintenance/p1/PERFORMANCE.md) | Generated benchmark snapshots; retain original inputs, hashes and results |
| [Cleanup review](docs/maintenance/CLEANUP_REVIEW.md), [P1 fixes](docs/maintenance/P1_FIXES_AND_PERFORMANCE.md) | Historical maintenance decisions and evidence, not current work orders |
| [Week 1 blueprint](docs/reference/WEEK1_CONTENT_BLUEPRINT.md), [Week 2 lesson plan](docs/reference/WEEK2_DETAILED_LESSONS.md) | Historical editorial targets; old APIs, authored sentence sets, branch instructions and “not implemented” statements describe their original checkpoints |

Different historical check counts, sentence totals and timings describe different releases. They must not be reconciled by rewriting past results. Generated reports are changed by their tools only when their inputs and validation warrant it; their presence creates no testing obligation for Markdown-only work.

Save format **7 only** is supported. There is no old-save migration. An incompatible or corrupt save stays untouched until the player explicitly resets it. New format-7 progress, SRS and active attempts save and resume normally, including placed tiles and first-answer locks. Earlier formats are intentionally unsupported; there are no migration or content-repair adapters.

Vocabulary introductions are declared per immutable lemma ID in `content/LIBRARY_LEXICON.json` (planned day, district/universal, order and grammar requirements), separately from actual encounter, individual form study and mastery. A hash no longer selects the curriculum. All seven paces remain selectable; plans remain frozen after creation. `content/CURRICULUM_AUDIT.json` is the maintained effective audit, and `content/DISTRICT_INVENTORY_REPORT.json` reports each day's assignments and the 22-entry reserve per district.

Every instructional Pashto clause is produced by the sentence engine, including lesson study, construction, assessment questions/replies, dialogue and Library examples. Only the [eighteen currently registered conventional expressions](docs/grammar/FIXED_PHRASE_EXCEPTIONS.md) are fixed language. Eighteen is the present inventory, not a permanent limit; additions require the register’s review process. Vocabulary/forms → grammar → engine composition is the teaching order; the runtime builds no sentence catalogue before study. The former authored teaching banks are archived in `docs/grammar/attestations/` as form evidence and fixtures only.

At default pace, Day 1 Home teaches six district lemmas plus an evidenced feminine adjective form, then composes **three distinct descriptions** without another district visit or an action verb. Later days combine compatible, actually introduced forms through 28 grammar families, including typed question/reply joins and coordinated clauses. Unknown morphology fails closed. Paces 0/4 can lack enough compositions; an explicit deficit triggers word or English grammar tasks, without extra district words or fixed sentence substitutions. Day 14 introduces no new forms.

The [measured delivery report](docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md) records the actual rendered sentence percentage across all fourteen days, seven paces and normal/skip routes. `python3 tools/verify.py` refreshes it only after the full browser matrix passes. Its release fingerprint prevents reuse after code changes. [Potential capacity and exact missing forms/features](docs/grammar/GENERATION_COVERAGE.md) are separate diagnostics, not a teaching-percentage claim. `userVerified: false` permits evidenced provisional composition without certifying translations or pronunciation.

For a future human-edited spreadsheet, export CSV columns `lemmaId,plannedDay,district,teachingOrder,verifiedStatus` and run `python3 tools/import-curriculum.py input.csv proposal.json`. This creates an **unapproved proposal**; it cannot certify language. `content/CURRICULUM_OVERRIDES.json` is applied only with explicit curriculum approval, reviewer/date/reference, valid stable IDs and grammar-safe days. Curriculum approval never changes linguistic approval. Regenerate/check the audit with `python3 tools/curriculum-audit.py [--check]` after rebuilding.

The [cleanup dependency review](docs/maintenance/CLEANUP_REVIEW.md) records traced removals, retained behaviour, before/after UI captures and verification. The active workshop and Grammar Journal read the same curriculum. Current schema-7 saves continue to work; missing frozen attempt presentation is rejected rather than rerolled.

Lexical distractors prefer actually introduced forms across parts of speech, including current-lesson study before a correct response or completion. If fewer than three distinct wrong alternatives remain, they use display-only Day-1 base vocabulary; this grants no acquisition, grammar or XP. Equivalent surfaces, listed senses and explicit accepted answers are excluded. An unstudied assessment target uses uncued typed recall or a scored “I don’t know” reveal; its English meaning is absent before submission. Low-supply assessments use varied English rule-application tasks from visited workshops, or explicitly guided Day-1 reference checks without granting grammar. Browser save failures keep progress in this tab, show a nonblocking warning and offer Retry/JSON Export.

Run `node tools/performance-benchmark.mjs --samples 20 --output work/p1/performance.json` for the browser performance baseline: paces 0/12/24, fourteen-day progression with measurements on Days 1/7/13/14, desktop and 4× CPU mobile Chromium, heap, storage and ten bounded revision/Library sessions. This diagnostic is separate from functional verification and requires the same Playwright/Chromium setup.

The [coordinated audit remediation](docs/maintenance/AUDIT_REMEDIATION.md) records all twelve findings, save-conflict and assessment boundaries, focused refactors, retained evidence and final verification. Its [paired performance report](docs/maintenance/AUDIT_PERFORMANCE.md) measures the corrected Stage 3 release against the optimized deliverable; previous benchmark reports retain their historical results.

Browser saves use an origin-wide Web Lock around the final comparison and localStorage write. A concurrent losing tab keeps its memory state, warns and offers export/reload; records are never merged. Saves are asynchronous and pending same-tab snapshots coalesce. Closing with a pending write requests the browser’s unsaved-work prompt. Without Web Locks, saving fails visibly and export remains available; use a secure local origin or supported offline browser. Coordination covers participating current-release tabs, not unrelated scripts or old releases that bypass the lock.

The choice-quality follow-up used focused model/browser validation, not a fresh full delivery matrix. The delivery report remains evidence for its recorded release fingerprint, rather than a measurement of the latest HTML. Saved choices are never rerolled: narrowly identified older underspecified agreement/address questions accept their defensible alternatives, with explanatory feedback and unchanged historical scoring.
