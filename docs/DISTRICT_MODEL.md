# Current district model

The application uses canonical district IDs directly in cards, courses, day plans, completion records, scene metadata and save format 4. No previous-location-key adapters or migrations remain.

| District ID | Player map label | Narrative scope |
|---|---|---|
| residential | Home | Muhammad Jan's welcome, household and visiting neighbours |
| nature | Lake | Saleha/Mina, lake and the Day 6 Hills scene |
| business | Market | Edris, market conversations and future authored shop scenes |
| school | School | Ms Hameed, classroom and examinations |

Library is an always-open reference scene associated with School, not a teaching visit or fifth daily vocabulary quota. Characters can travel between districts. Scene descriptors describe context and participants without inventing new mandatory routes.

`src/library-engine.js` is authoritative for district matching and the four allocation buckets. `content/LIBRARY_LEXICON.json` declares primary/suitable districts. Opaque lexical/card IDs containing words such as `house` or `river` identify the actual vocabulary or authored utterance; they are not navigation adapters.

The 360 English candidates in `content/DISTRICT_VOCABULARY_CANDIDATES.json` remain inactive. Seven link to existing senses; none counts as additional translated vocabulary. The generated inventory report includes per-district/POS/form/review counts and realistic chronological allocations. Native Laghman translation, morphology and example review remain prerequisites for expansion.

## Curriculum expansion

The current inventory is 99 district lemmas (22/27/29/21) plus 28 universal identities. Universal words match every district but consume no district quota. Selected candidate additions are 78/73/71/79; all 301 remain inactive until language and review metadata exist. Day 1 allocation excludes action verbs, and Day 14 assigns no compulsory new words. See [the expansion contract](CURRICULUM_EXPANSION.md) for the exact target/current capacity distinction and save protections.
