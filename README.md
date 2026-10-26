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
| `src/content.js`, `src/assessment-content.js`, `src/grammar-content.js` | Catalog adapters and existing authored narrative/question/grammar blueprints |
| `src/library-engine.js` | Sole lemma/form identity, acquisition, SRS and district planner |
| `src/progression.js` | Save factory/version, XP/reward identity, results, milestones and access rules |
| `src/sentence-engine.js`, `content/SENTENCE_FRAMES.json` | Bounded feature/semantic unification, licensed draft compositions and deterministic practice selection |
| `src/question-engine.js` | Shared answer evaluation, approved normalisation and indexed tiles |
| `src/learning.js`, `src/questions.js` | Practice transactions, lesson pools, frozen assessments and answer choices |
| `src/storage.js` | Current-save validation, local storage and active challenge snapshots |
| `src/ui.js`, `src/world-ui.js`, `src/lesson-ui.js`, `src/challenge-ui.js` | DOM/RTL shell and world, lesson and assessment presentation |
| `src/tutorial-ui.js`, `src/grammar-ui.js`, `src/library-ui.js`, `src/narrative-ui.js` | Onboarding, workshops and reference/expression presentation |
| `src/audio.js` | Common MP3/device-voice player and cancellation |
| `src/app.html`, `src/app.css` | UI shell and styles |
| `content/WEEK1_RUNTIME.json`, `content/WEEK2_RUNTIME.json` | Authoritative exact fourteen-day authored learning content |
| `content/LIBRARY_LEXICON.json`, `content/NARRATIVE_EXPRESSIONS.json` | Lexical forms/mappings and active/pending expression identities |
| `content/DISTRICT_VOCABULARY_CANDIDATES.json`, `content/UNIVERSAL_TEACHING_TARGETS.json` | Inactive editorial candidates, not playable translations |
| `tools/build.py`, `tools/verify.py` | Offline assembly/validation and complete verification |

Modules expose small factory APIs with explicit state/service dependencies and screen-transition callbacks. UI submits answers through `learning.js`; it does not maintain a second score, XP or SRS store. `tools/build.py` assembles the modules in explicit dependency order inside one private script closure. The generated game needs no module loader, framework, package manager or network requests for code/curriculum. Runtime dependencies remain browser DOM, local storage and optional Audio/Web Speech APIs; development uses Python and Node/Playwright/Chromium.

`content/WEEK2_LESSON_DATA.json` retains the English curricular source/semantic targets; `tests/curriculum-contract.json` preserves authored-content regression fixtures. `content/DISTRICT_INVENTORY_REPORT.json` is an inventory output. Do not delete data files just because some names overlap.

## How progression works

The Day 1 Library tutorial introduces four question types: choose the meaning of `سلام`, arrange `څنګه یې؟`, select a gender preference, and type a player name. Completing all four is required to begin Day 1. A normal day includes narrative openings and district lessons; after the tutorial on Day 1, or immediately on Days 2–14, the player can skip visits and attempt the daily challenge. Skips do not mark unseen locations or vocabulary complete.

Each district selects eligible new **distinct lexical lemmas** in its explicit curated introduction order, at a selected pace of 0/4/8/12/16/20/24 per day. Universal vocabulary, inflections, grammar units and expressions do not consume district quotas. Day 1 teaches descriptions, while action verbs start on Day 2. Day 14 schedules no compulsory new words. Daily challenges have 15 items, pass 12; Days 7 and 14 have 25, pass 20. A passed Day 7 exam unlocks Level 10 and New Resident.

The current lexicon is short of the high-pace target: 99 district draft lemmas + 29 universal draft lemmas are playable; 301 selected district candidates are inactive pending linguistic work. The interface reports shortages without counting untranslated English candidates as learned words. Details and day-by-day teaching targets are in `CURRICULUM.md`.

## Current documentation

- [`AGENTS.md`](AGENTS.md): short workflow/safety contract for Codex and ChatGPT.
- [`GAME_SPEC.md`](GAME_SPEC.md): current mechanics, game state, XP, UI and audio behaviour.
- [`CURRICULUM.md`](CURRICULUM.md): current daily plan, districts, greetings and inventory.
- [`LANGUAGE_REVIEW.md`](LANGUAGE_REVIEW.md): linguistic review queue and activation rules.
- [`tests/README.md`](tests/README.md): verification coverage, requirements and limitations.
- [`docs/reference/`](docs/reference/): historical Week 1/2 authoring blueprints retained only for editorial context; current JSON/runtime and active specifications take precedence.

Save format **6 only** is supported. There is no old-save migration. An incompatible or corrupt save stays untouched until the player explicitly resets it. New format-6 progress, SRS and active attempts save and resume normally, including placed tiles and first-answer locks. Earlier formats are intentionally unsupported; there are no migration or content-repair adapters.

Vocabulary introductions are declared per immutable lemma ID in `content/LIBRARY_LEXICON.json` (planned day, district/universal, order and grammar requirements), separately from actual encounter, individual form study and mastery. A hash no longer selects the curriculum. All seven paces remain selectable when supply is insufficient; the plan displays real district shortfalls instead of pulling future words forward. `content/CURRICULUM_AUDIT.json` is the maintained effective audit, including applied approved overrides, form exclusions and retimed authored cards. `content/DISTRICT_INVENTORY_REPORT.json` reports each day's district assignments/shortfalls at every pace.

Controlled cumulative practice now composes noun–adjective–copula descriptions from ten feature-vetted forms and actual study/grammar unlocks. The initial frame enables nine semantic tuples: six exact authored outputs and three new generated drafts (e.g. `کور نوی دی.` / “The house is new.”). Incomplete or ambiguous forms are excluded. Other grammar retains eligible authored fallbacks; no verb conjugation or noun declension is extrapolated. New and authored outputs both remain pending native Laghman review. All authored JSON sentences/dialogues are retained; practice involving later forms is deferred rather than exposing future grammar as new material.

For a future human-edited spreadsheet, export CSV columns `lemmaId,plannedDay,district,teachingOrder,verifiedStatus` and run `python3 tools/import-curriculum.py input.csv proposal.json`. This creates an **unapproved proposal**; it cannot certify language. `content/CURRICULUM_OVERRIDES.json` is applied only with explicit curriculum approval, reviewer/date/reference, valid stable IDs and grammar-safe days. Curriculum approval never changes linguistic approval. Regenerate/check the audit with `python3 tools/curriculum-audit.py [--check]` after rebuilding.
