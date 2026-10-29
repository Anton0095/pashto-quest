# Pashto Quest

An offline, browser-based Pashto learning game set in a village in Laghman, Afghanistan. Four teaching districts (Home, Lake, Market and School), a reference Library and a recurring cast support 14 narrative days of cumulative language study. The playable Pashto is a **draft**, not certified local-language instruction.

## Play

Open the generated `index.html` in a modern browser, or serve the repository with:

```sh
python3 -m http.server 8000
```

The game needs no backend, account, API key or runtime JSON fetch. The generated release embeds source data. A browser may impose restrictions when opening local files; local HTTP hosting is a useful development alternative. Progress is kept in browser local storage. Audio is optional: bundled `audio/<id>.mp3` recordings take priority when supplied; otherwise the game attempts a detected Pashto device voice and warns about uncertain fallback. No native-reviewed MP3 pack is currently committed. Physical iPhone Safari and Windows speech quality have not been independently verified.

## Development

Use Python 3 for the standard-library builder and Node.js/Playwright/Chromium for full tests.

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
| `src/save-schema.js`, `src/storage.js` | Nested current-save validation; conflict-safe persistence and active challenge snapshots |
| `src/sentence-scene.js`, `src/answer-feedback.js` | Teacher/listener context and shared correct/wrong presentation |
| `src/ui.js`, `src/world-ui.js`, `src/lesson-ui.js`, `src/challenge-ui.js` | DOM/RTL shell and world, lesson and assessment presentation |
| `src/tutorial-ui.js`, `src/grammar-ui.js`, `src/library-ui.js`, `src/narrative-ui.js` | Onboarding, workshops and reference/expression presentation |
| `src/audio.js` | Common MP3/device-voice player and cancellation |
| `src/app.html`, `src/app.css` | UI shell and styles |
| `content/LEARNING_CURRICULUM.json`, `content/FIXED_PHRASES.json` | Curriculum, grammar, story/people, assessment scenes and six conventional expression exceptions |
| `content/LIBRARY_LEXICON.json`, `content/NARRATIVE_EXPRESSIONS.json` | Lexical forms/mappings and active/pending expression identities |
| `content/DISTRICT_VOCABULARY_CANDIDATES.json`, `content/UNIVERSAL_TEACHING_TARGETS.json` | Inactive editorial candidates, not playable translations |
| `tools/build.py`, `tools/verify.py` | Offline assembly/validation and complete verification |

Modules expose small factory APIs with explicit state/service dependencies and screen-transition callbacks. UI submits answers through `learning.js`; it does not maintain a second score, XP or SRS store. `tools/build.py` assembles the modules in explicit dependency order inside one private script closure. The generated game needs no module loader, framework, package manager or network requests for code/curriculum. Runtime dependencies remain browser DOM, local storage and optional Audio/Web Speech APIs; development uses Python and Node/Playwright/Chromium.

`docs/reference/WEEK2_LESSON_DATA.json` archives the historical English editorial targets and is never read by the runtime/builder; `tests/curriculum-contract.json` preserves authored-content regression fixtures. `content/DISTRICT_INVENTORY_REPORT.json` is an inventory output. Do not delete data files just because some names overlap.

## How progression works

The Day 1 Library tutorial introduces four question types: choose the meaning of `سلام`, arrange `څنګه یې؟`, select a gender preference and type a player name using English profile controls. Completing all four is required to begin Day 1. A normal day includes narrative openings and district lessons; after the tutorial on Day 1, or immediately on Days 2–14, the player can skip visits and attempt the daily challenge. Skips do not mark unseen locations or vocabulary complete.

Each district selects eligible new **distinct lexical lemmas** in its explicit curated introduction order, at a selected pace of 0/4/8/12/16/20/24 per day. Universal vocabulary, inflections, grammar units and expressions do not consume district quotas. Day 1 teaches descriptions, while action verbs start on Day 2. Day 14 schedules no compulsory new words. Daily challenges have 15 items, pass 12; Days 7 and 14 have 25, pass 20. A passed Day 7 exam unlocks Level 10 and New Resident.

The current lexicon contains 400 balanced district drafts (100 per district) and 73 universal drafts. The 301 promoted district candidates and 40 universal targets are explicitly `provisional_playable`, unchecked by the user, and not native-certified. A fresh profile at the default pace of 24 receives six district lemmas per location on Days 1–13; Day 14 has none. The generated `content/VOCABULARY_REVIEW.csv` is the human review register.

## Current documentation

- [`AGENTS.md`](AGENTS.md): short workflow/safety contract for Codex and ChatGPT.
- [`GAME_SPEC.md`](GAME_SPEC.md): current mechanics, game state, XP, UI and audio behaviour.
- [`CURRICULUM.md`](CURRICULUM.md): current daily plan, districts, greetings and inventory.
- [`LANGUAGE_REVIEW.md`](LANGUAGE_REVIEW.md): linguistic review queue and activation rules.
- [`tests/README.md`](tests/README.md): verification coverage, requirements and limitations.
- [`docs/reference/`](docs/reference/): historical Week 1/2 authoring blueprints retained only for editorial context; current JSON/runtime and active specifications take precedence.

Save format **7 only** is supported. There is no old-save migration. An incompatible or corrupt save stays untouched until the player explicitly resets it. New format-7 progress, SRS and active attempts save and resume normally, including placed tiles and first-answer locks. Earlier formats are intentionally unsupported; there are no migration or content-repair adapters.

Vocabulary introductions are declared per immutable lemma ID in `content/LIBRARY_LEXICON.json` (planned day, district/universal, order and grammar requirements), separately from actual encounter, individual form study and mastery. A hash no longer selects the curriculum. All seven paces remain selectable; plans remain frozen after creation. `content/CURRICULUM_AUDIT.json` is the maintained effective audit, and `content/DISTRICT_INVENTORY_REPORT.json` reports each day's assignments and the 22-entry reserve per district.

Every instructional Pashto clause is produced by the sentence engine, including lesson study, construction, assessment questions/replies, dialogue and Library examples. Only the [six designated conventional expressions](docs/grammar/FIXED_PHRASE_EXCEPTIONS.md) are fixed language. Vocabulary/forms → grammar → engine composition is the teaching order; the runtime builds no sentence catalogue before study. The former authored teaching banks are archived in `docs/grammar/attestations/` as form evidence and fixtures only.

At default pace, Day 1 Home teaches six district lemmas plus an evidenced feminine adjective form, then composes **three distinct descriptions** without another district visit or an action verb. Later days combine compatible, actually introduced forms through 28 grammar families, including typed question/reply joins and coordinated clauses. Unknown morphology fails closed. Paces 0/4 can lack enough compositions; an explicit deficit triggers word or English grammar tasks, without extra district words or fixed sentence substitutions. Day 14 introduces no new forms.

The [measured delivery report](docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md) records the actual rendered sentence percentage across all fourteen days, seven paces and normal/skip routes. `python3 tools/verify.py` refreshes it only after the full browser matrix passes. Its release fingerprint prevents reuse after code changes. [Potential capacity and exact missing forms/features](docs/grammar/GENERATION_COVERAGE.md) are separate diagnostics, not a teaching-percentage claim. `userVerified: false` permits evidenced provisional composition without certifying translations or pronunciation.

For a future human-edited spreadsheet, export CSV columns `lemmaId,plannedDay,district,teachingOrder,verifiedStatus` and run `python3 tools/import-curriculum.py input.csv proposal.json`. This creates an **unapproved proposal**; it cannot certify language. `content/CURRICULUM_OVERRIDES.json` is applied only with explicit curriculum approval, reviewer/date/reference, valid stable IDs and grammar-safe days. Curriculum approval never changes linguistic approval. Regenerate/check the audit with `python3 tools/curriculum-audit.py [--check]` after rebuilding.

The [cleanup dependency review](docs/maintenance/CLEANUP_REVIEW.md) records traced removals, retained behaviour, before/after UI captures and verification. The active workshop and Grammar Journal read the same curriculum. Current schema-7 saves continue to work; missing frozen attempt presentation is rejected rather than rerolled.

Distractors use actually introduced forms, rather than all day-eligible vocabulary. An unstudied assessment target uses uncued typed recall or a scored “I don’t know” reveal; its English meaning is absent before submission. Low-supply assessments use varied English rule-application tasks from visited workshops, or explicitly guided Day-1 reference checks without granting grammar. Browser save failures keep progress in this tab, show a nonblocking warning and offer Retry/JSON Export.

Run `node tools/performance-benchmark.mjs --samples 20 --output work/p1/performance.json` for the browser performance baseline: paces 0/12/24, fourteen-day progression with measurements on Days 1/7/13/14, desktop and 4× CPU mobile Chromium, heap, storage and ten bounded revision/Library sessions. This diagnostic is separate from functional verification and requires the same Playwright/Chromium setup.

The [coordinated audit remediation](docs/maintenance/AUDIT_REMEDIATION.md) records all twelve findings, save-conflict and assessment boundaries, focused refactors, retained evidence and final verification. Its [paired performance report](docs/maintenance/AUDIT_PERFORMANCE.md) measures the corrected Stage 3 release against the optimized deliverable; previous benchmark reports retain their historical results.
