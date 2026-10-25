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
| `src/app.html`, `src/app.css`, `src/app.js` | UI shell, styles, gameplay, narrative screens, questions and save I/O |
| `src/progression.js` | Save factory/version, challenge outcomes, XP and titles |
| `src/library-engine.js` | Lemma/form identity, exposure, SRS and district scheduling |
| `src/library-ui.js` | Vocabulary Bank, Grammar Journal, pace settings and lesson/challenge integration |
| `src/narrative-ui.js` | Contextual expression presentation |
| `content/WEEK1_RUNTIME.json`, `content/WEEK2_RUNTIME.json` | Authored fourteen-day lesson content |
| `content/LIBRARY_LEXICON.json` | Lexical records, forms, POS and source mappings |
| `content/NARRATIVE_EXPRESSIONS.json` | Active/pending contextual phrase identities |
| `content/DISTRICT_VOCABULARY_CANDIDATES.json`, `content/UNIVERSAL_TEACHING_TARGETS.json` | Inactive editorial candidates, not playable translations |
| `tools/build.py`, `tools/verify.py` | Release assembly/validation and verification |

`content/WEEK2_LESSON_DATA.json` retains the English curricular source/semantic targets; `tests/curriculum-contract.json` preserves authored-content regression fixtures. `content/DISTRICT_INVENTORY_REPORT.json` is an inventory output. Do not delete data files just because some names overlap.

## How progression works

The Day 1 Library tutorial introduces four question types: choose the meaning of `سلام`, arrange `څنګه یې؟`, select a gender preference, and type a player name. Completing all four is required to begin Day 1. A normal day includes narrative openings and district lessons; after the tutorial on Day 1, or immediately on Days 2–14, the player can skip visits and attempt the daily challenge. Skips do not mark unseen locations or vocabulary complete.

Each of the four districts contributes new **distinct lexical lemmas**, at a selected pace of 0/4/8/12/16/20/24 per day. Universal vocabulary, inflections, grammar units and expressions do not consume district quotas. Day 1 teaches descriptions, while action verbs start on Day 2. Day 14 schedules no compulsory new words. Daily challenges have 15 items, pass 12; Days 7 and 14 have 25, pass 20. A passed Day 7 exam unlocks Level 10 and New Resident.

The current lexicon is short of the high-pace target: 99 district draft lemmas + 28 universal draft lemmas are playable; 301 selected district candidates are inactive pending linguistic work. The interface reports shortages without counting untranslated English candidates as learned words. Details and day-by-day teaching targets are in `CURRICULUM.md`.

## Current documentation

- [`AGENTS.md`](AGENTS.md): short workflow/safety contract for Codex and ChatGPT.
- [`GAME_SPEC.md`](GAME_SPEC.md): current mechanics, game state, XP, UI and audio behaviour.
- [`CURRICULUM.md`](CURRICULUM.md): current daily plan, districts, greetings and inventory.
- [`LANGUAGE_REVIEW.md`](LANGUAGE_REVIEW.md): linguistic review queue and activation rules.
- [`tests/README.md`](tests/README.md): verification coverage, requirements and limitations.
- [`docs/reference/`](docs/reference/): historical Week 1/2 authoring blueprints retained only for editorial context; current JSON/runtime and active specifications take precedence.

Save format **4 only** is supported. There is no old-save migration. An incompatible or corrupt save stays untouched until the player explicitly resets it. Current-format progress, SRS and active attempts are preserved.
