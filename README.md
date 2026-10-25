# Pashto Quest

An offline Pashto learning game with fourteen authored story days, four teaching districts, and an always-open Library. Week 1 finishes with the Level 10 / New Resident examination. Week 2 adds contextual dialogue, grammar and cumulative review; its language remains a draft awaiting local Laghman review.

Open `index.html` in a modern browser, or serve the checkout with `python3 -m http.server 8000`. No backend, API key, runtime JSON request or package installation is needed to play. Audio uses bundled Pashto MP3 recordings when present, then a detected browser Pashto voice. If no Pashto voice is listed, it asks the browser to speak in `ps-AF` and warns that the resulting pronunciation may be inaccurate. The build embeds an audio-file manifest so absent MP3s are not requested on every click.

## Edit and build

The HTML release is generated. Edit these authoritative files:

- `src/app.html`, `src/app.css`, `src/app.js`: interface, authored scenes, assessment rendering and save I/O.
- `src/progression.js`: current save version/factory, authoritative challenge results, XP transactions and level gates.
- `src/library-engine.js`: lemma acquisition, form/unit SRS, deterministic district plans and bank selection.
- `src/library-ui.js`: Library and its integration with lessons/assessments.
- `src/narrative-ui.js`, `content/NARRATIVE_EXPRESSIONS.json`: contextual expressions and reviewed/pending activation.
- `content/UNIVERSAL_TEACHING_TARGETS.json`: inactive semantic teaching targets, distinct from lexical identities.
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

Browser coverage includes public-UI-only checks at 1280px/375px, detailed Week 1/2 and Library flows, and fourteen complete normal/skip curriculum profiles at 0/4/8/12/16/20/24 assigned lemmas. See [current test evidence](docs/CURRICULUM_TEST_RESULTS.md) and [historical cleanup findings](docs/CLEANUP_REVIEW.md).

## Greeting-first lessons and challenges

Every active, non-optional daily greeting is taught inside the normal lesson sequence: it is the **first study card** at each of the four locations, with Pashto text, romanisation, audio and meaning. A location-specific approved expression takes priority; otherwise all locations repeat the day's active opening expression. The separate narrative panel must not pre-teach or acquire it. An opening grammar workshop follows the greeting when applicable, then scheduled vocabulary and sentences.

An active greeting is the **first question** of its day's challenge. Additional approved location expressions can take subsequent question slots. These replace existing vocabulary questions: total questions, pass thresholds and lexical-lemma quota are unchanged. A greeting encountered for the first time by skipping a day is flagged *Not previously studied* before its answer; normal SRS recognition records the reply, but fixed expressions earn no XP. Untranslated/pending expressions stay inactive. As of this version only Day 1's Welcome and Day 2's Good morning are enabled as provisional Afghan Pashto expressions, pending local review.

## Language and capacity

The 127 existing draft lemma records contain **99 district lemmas and 28 universal lemmas**. Exactly 301 of the original 360 untranslated candidates are selected as pending additions to a balanced **400-lemma target**; none is activated. Pace settings work below 20 from Day 1, and the maximum Day 1 setting assigns six distinct nouns/adjectives per district. Action verbs begin on Day 2. Day 14 schedules zero compulsory new words. The current pool cannot sustain 24/day through Days 1–13: the minimum raw shortfall is 213 lemmas, before incidental encounters. Shortages are explicit.

Two user-supplied expressions—Welcome and Day 2 Good morning—use the existing pronunciation/SRS system as provisional fixed expressions. The other 15 contextual expression slots are visibly pending translation and grammatical review; English dialogue never pretends to be acquired Pashto. See the [current expansion contract and linguistic blockers](docs/CURRICULUM_EXPANSION.md), [inventory report](content/DISTRICT_INVENTORY_REPORT.json) and [test results](docs/CURRICULUM_TEST_RESULTS.md).

[Language review](LANGUAGE_REVIEW.md), [Week 2 review checklist](content/WEEK2_REVIEW.md), [district model](docs/DISTRICT_MODEL.md), and [curriculum specification](GAME_SPEC.md) describe the remaining editorial/native-review work. Automated Chromium tests do not establish physical iPhone Safari compatibility or linguistic certification.
