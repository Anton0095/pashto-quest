# Pashto Quest

An offline Pashto learning game with fourteen authored story days, four teaching districts, and an always-open Library. Week 1 finishes with the Level 10 / New Resident examination. Week 2 adds contextual dialogue, grammar and cumulative review; its language remains a draft awaiting local Laghman review.

Open `index.html` in a modern browser, or serve the checkout with `python3 -m http.server 8000`. No backend, API key, runtime JSON request or package installation is needed to play. Audio uses an available Pashto asset/device voice and reports missing pronunciation support honestly.

## Edit and build

The HTML release is generated. Edit these authoritative files:

- `src/app.html`, `src/app.css`, `src/app.js`: interface, authored scenes, assessment rendering and save I/O.
- `src/progression.js`: current save version/factory, authoritative challenge results, XP transactions and level gates.
- `src/library-engine.js`: lemma acquisition, form/unit SRS, deterministic district plans and bank selection.
- `src/library-ui.js`: Library and its integration with lessons/assessments.
- `content/WEEK1_RUNTIME.json`, `content/WEEK2_RUNTIME.json`: curriculum cards and narrative data.
- `content/LIBRARY_LEXICON.json`: lexical identities, forms, mappings, grammar notes and review metadata.

```sh
python3 tools/build.py
python3 tools/build.py --check
```

The single Python-standard-library builder bundles the complete game. Do not edit generated `index.html` independently. The internal district keys are `residential`, `nature`, `business`, `school`. Home, Lake, Market and School remain the player-facing map labels; Library is a reference scene and Hills belongs to Nature.

## Save format

This release uses **save schema 4 only**. It deliberately does not migrate older formats. An incompatible or corrupt save produces a blocking explanation and an explicit reset button. The stored value remains unchanged until the player chooses reset. Current-version progress, frozen plans, SRS and challenge attempts persist normally.

Vocabulary acquisition and SRS have one authority in `progress.library`. Sentences and expressions have distinct learning units using the same scheduler; lexical card aliases read the corresponding form record and store no mirrored counters. XP uses persistent reward identities to prevent immediate lesson replay farming.

## Verification

Requires Python 3, Node.js, Playwright and Chromium. The cloud image supplies these; local installations can use `playwright` and set `CHROMIUM_PATH` where necessary.

```sh
python3 tools/verify.py          # all syntax/model/build checks and all browser suites
python3 tools/verify.py --quick  # explicitly excludes browser suites
node tools/district-inventory.mjs       # refresh capacity report after content/model changes
node tools/district-inventory.mjs --check
```

Browser coverage includes public-UI-only checks at 1280px/375px, detailed Week 1/2 and Library flows, and twelve complete normal/skip curriculum profiles at 4/8/12/16/20/24 assigned lemmas. See [cleanup findings and limits](docs/CLEANUP_REVIEW.md) and [test evidence](docs/CLEANUP_TEST_RESULTS.md).

## Language and capacity

The 127 draft lemma records contain 108 quota-counting content lemmas. All 360 untranslated candidates remain inactive. Pace settings work below 20 from Day 1; incidental story vocabulary is counted separately. Day 14 always schedules zero compulsory new words. The current inventory cannot sustain a full standard/intensive new-word quota throughout the curriculum: shortages are displayed and tested, never filled with repeats or fabricated Pashto.

[Language review](LANGUAGE_REVIEW.md), [Week 2 review checklist](content/WEEK2_REVIEW.md), [district model](docs/DISTRICT_MODEL.md), and [curriculum specification](GAME_SPEC.md) describe the remaining editorial/native-review work. Automated Chromium tests do not establish physical iPhone Safari compatibility or linguistic certification.
