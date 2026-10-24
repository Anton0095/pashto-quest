# Pashto Quest — District vocabulary architecture (24 October 2026)

## Status

This branch introduces a **backward-compatible internal district taxonomy** and a curated **English-lemma candidate backlog**. The four player-facing map labels stay **Home, Lake, Market, School**. Nothing here represents 360 production-ready Pashto entries: every new candidate requires native Laghman translation, morphological and orthographic review. Candidate entries are intentionally **not in LIBRARY_DATA.entries** and cannot silently count toward quotas.

## Canonical mapping

| Canonical district | Existing runtime/save key | Player-facing map label | Future scene examples |
| --- | --- | --- | --- |
| `residential` — Residential district | `house` | Home | household, courtyard, garden, neighbour's home, family gathering |
| `nature` — Nature district | `river` | Lake | lakeside, riverbank, hills, mountains, valley, forest, orchard |
| `business` — Business district | `market` | Market | bazaar, bakery, pharmacy, tailor, café, workshop, grocer |
| `school` — School district | `school` | School | classroom, library, science room, assembly, playground |

The Day 6 Hills outing remains a story/challenge scene **inside Nature district**, not an explorable fifth teaching location. A future character visit to a bakery remains a Business-district scene, just as a visit to a neighbour's house is Residential. NPC residence/location is **not** a permanent district lock.

## Implementation in this branch

- `content/LIBRARY_LEXICON.json` now declares `districtModel`. Its 127 existing entries retain `suitableLocations` for backward compatibility and additionally declare `suitableDistricts` and `primaryDistrict`.
- `src/library-engine.js` uses `matchesPlace(entry, legacyPlaceKey)` in assignment. The match is district-based for enriched entries and falls back to `suitableLocations` for old test fixtures and older schema.
- `src/library-ui.js` uses the same semantic matcher for review and challenge vocabulary.
- `index.html` bundles the changes and remains a standalone file. Existing `house/river/market/school` course keys, save identifiers, study card IDs, map and XP logic remain unchanged.
- `content/DISTRICT_VOCABULARY_CANDIDATES.json` contains 360 extra editorial English lemma candidates, 90 assigned primarily to each district. These have null Pashto/romanisation fields and `countsTowardDailyQuota:false` until reviewed and promoted. Existing 108 quota-counting content lemmas remain available.

## Candidate policy and next steps

The backlog is a **base-lemma pool**, not a sentence or conjugation pool. Each item has one stable `candidateId`, a primary district and suitable districts. During Codex content work:
1. Check if the concept already exists under a Pashto lemma, even when the English gloss differs. Deduplicate by lexical identity; do not count inflected forms separately.
2. Reject, rephrase or split ambiguous English entries; compound expressions must be reviewed as legitimate lexical units.
3. Add vetted standard Pashto spelling, POS, usable citation form, romanisation, translation, morphology, inflection records, contextual examples, speaker/recipient and review status.
4. Require local Laghman native-speaker review before claiming pronunciation/dialect validation; keep drafts explicitly flagged.
5. Only then promote entries into `LIBRARY_LEXICON.json` and `sourceMappings`; do not use null-language candidates in lessons, speech or quiz distractors.
6. Allow a location lesson in one district to use vocabulary introduced in another, without charging it against the new-lemma quota again.

## Backward compatibility

The stable public-facing map and existing saved progress must be preserved. Do **not** replace the original place keys in `progress.complete`, `courses`, `wordById`, historic event IDs, SRS records or frozen day plans without an explicit idempotent migration. The district model is an internal classification layer. Future `sceneId` values should carry a `districtId` and `displayName`, with the four present map zones acting as anchors.

## Tests and remaining known issues

The vocabulary-bank first-encounter persistence bug, rigid Day 1 pacing, legacy/card-bank integration and insufficient *approved* Pashto lemma capacity are **not fixed here**. Follow `CODEX_TASK_DISTRICTS_P0_P3.md` for P0–P3 implementation and acceptance tests. Regenerate the standalone bundle whenever editing its source JSON/JS:

```sh
python3 tools/embed_library.py
python3 tools/embed_library.py --check
node tests/library-vocabulary.test.mjs
```

A domain-specific scene should be introduced only after there is authored content for it; the map still shows the same four teaching locations plus the reference Library.
