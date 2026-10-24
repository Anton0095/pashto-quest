# District P0–P3 implementation and validation

Based on `codex/district-vocabulary-20261024` at `8c3e059`, which contains current main (`c45bb05`). Changes use a separate implementation branch. Original GAME_DATA, fourteen story days, Week 2 runtime JSON, relationships, four teaching place keys, Library, Hills scene, challenge thresholds, Week 1 graduation and Week 2 title cap are retained.

## P0 and P1, verified before P2/P3

The inspected source already had `s.acquired[id] ||= record`, so first-encounter persistence was not broken in this branch. Assignment is now explicit and regression-tested. Library schema 2 conservatively repairs missing records in schema-1 saves only where actual old card stats provide evidence; existing records, dates, events, XP, plans and attempts are retained. No acquisition is inferred from a day unlock or a plan. Form variants share explicit lexical identities, including the historical `a-clean` alias. Repeat submissions are idempotent.

Fresh onboarding and Library settings support **0, 4, 8, 12, 16, 20, 24** assigned content lemmas per day, respectively 0–6 per district. Default remains 20. Story words no longer impose a minimum quota. The five authored contextual targets remain; translations and fixed model examples scaffold incidental vocabulary. Nothing is counted as mastered merely by exposure or opening Library.

`LibraryEngine.tallies` returns separate `scheduledNewLemmas`, `actuallyEncounteredScheduledLemmas`, `incidentalStoryLemmas`, `reviewedExistingLemmas` and `masteredLemmas`. Day exposure records persist; assignments derive from frozen day plans. Incidental new words and prior-day review are distinct. Day 1 is not frozen by opening onboarding/Library; started and historical plans remain unchanged. Changes apply to the next unstarted day. Review-only mode works on Days 7/14 without blocking either exam or graduation.

The first-stage district unit suite and Library browser suite passed before work proceeded to P2/P3. Browser tests use real pace buttons before tutorial completion and complete all seven pace profiles at both 1280px and 375px, including lower-pace Day 1 with its original story vocabulary.

## P2 assessment and review

Lexical slots prefer due encountered entries, then other encountered entries, then scheduled words clearly labelled as not previously studied. Each selected lexical item records `lemmaId` and `vocabularyOrigin`. A day plan snapshots `assessmentMix`, and the existing selected-question/attempt snapshot preserves order, score, tiles, answer locks and once-only rewards. Tiny/empty banks use scaffolded authored fallback questions; a skip never completes visits or acquires the whole plan. Edris's fixed Day 3 dinner scenario and historical started-day question banks retain their authored lexical context. Grammar and dialogue slots remain authored; the original Week 2 answer/dud tile machinery is unchanged.

Review uses **encountered due forms across districts**, not simply a dictionary citation form from the same location. Lexical source aliases mirror form SRS after submitted attempts, including voluntary Library review and dialogue/choice feedback. Incorrect answers reset the form stage/due date; Library review awards no XP. Sentence-level statistics remain sentence-level rather than being fabricated from one constituent word. Existing migration statistics are retained conservatively.

The future scene model returns `{sceneId, districtId, displayName, participants}`. Hills resolves to Nature, bakery to Business and neighbour home to Residential, while the four existing teaching/navigation/save keys remain unchanged. Future scene descriptors do not add mandatory visits or unapproved narrative scenes.

## P3 inventory and safe activation

There are **127 activated draft lemma records**, of which **108** count as content vocabulary, with **223** attested forms. All 127 need native review; **zero** are claimed native-approved. Primary content districts: Residential 22, Nature 35, Business 30, School 21. POS: nouns 45, verbs 29, adjectives 26, adverbs 8. Difficulty has not been assessed; the report labels this explicitly. Scene/example coverage, duplicate identities/headwords and review status are machine-audited.

The **360 English candidates remain inactive** (90 per district). Seven confirmed existing-sense aliases are linked without increasing counts: bright/clear, swim, choose, cheap, ripe/cooked. The remaining 353 are still candidates, not 353 newly verified lexemes; ambiguous synonyms require editorial/native review. No Pashto headwords, sentences, inflections, recordings or native sign-offs were invented.

`tools/district-inventory.mjs` audits aliases, promotion gaps and real chronological capacity. Its activation checks require Pashto, romanisation, POS, district tags, stable forms/morphology, contextual examples/constraints, source mappings and documented native review. The HTML bundler rejects duplicate IDs, untranslated/incomplete entries and attempted candidate promotion without review metadata/examples. Existing draft content retains its explicit status.

Regenerate/check the report:

```sh
node tools/district-inventory.mjs
node tools/district-inventory.mjs --check
```

`content/DISTRICT_INVENTORY_REPORT.json` includes fourteen chronological profiles: all seven paces, with and without review-only exam days. Simulation includes actual assigned **and incidental story exposure**, rather than subtracting idealised quotas from a pool. With unchanged requested pace on every day, complete quotas are feasible on these days:

| Pace | Feasible days in the current chronological normal-route simulation |
|---|---|
| 0 | 1–14 |
| 4 | 1–9 |
| 8 | 1–6 |
| 12 | 1–5 |
| 16 | 1–4 |
| 20 | 1–3 |
| 24 | 1–3 |

These are capacity observations, not content certifications. Unsupported later quotas show explicit partial availability/gaps; no duplicates or untranslated candidates become “new words.” Choosing a smaller available pace or review-only remains possible. The JSON contains every per-day/per-district allocation, including exam-review variants.

**P3 language/content expansion remains blocked:** the supplied candidates have no Pashto translation, forms, contextual examples or qualified native sign-off. Neither 280 nor 336 distinct new-word trajectories can honestly be delivered from 108 activated content lemmas. The implemented audit, promotion gates and capacity reporting prepare that work; they do not substitute for translation/review. No numerical capacity claim counts inactive candidates.

## Verification

Commands run include:

```sh
python3 tools/embed_library.py
python3 tools/embed_library.py --check
python3 tools/embed_week2.py --check
python3 patch/test_patch.py
node tests/check_handoff.mjs
node tests/district.test.mjs
python3 tests/district-content.test.py
node tests/library-vocabulary.test.mjs
node tests/week1.test.mjs
node tests/week2.test.mjs
node tools/district-inventory.mjs --check
git diff --check
```

The content gate suite has four tests. The district suite exercises P0/P1, form repair, seven quotas, frozen plans, due selection, scene adapters, inactive candidates and fourteen capacity profiles. Library browser coverage includes normal/partial routes, all seven onboarding/lesson/challenge profiles, voluntary review, first-pass/failure/retry, saved submitted/unsubmitted responses, keyboard/mobile/offline and exhausted-pool fallback. Existing suites cover zero-visit Week 1/2 paths, 19/25 vs 20/25, duplicate/dud tiles, title/XP safety and all 56 normal lessons. The Memory Trail regression fixture advances time by 31 days, because a successful challenge now reschedules the corresponding card/form together. Its former assumption that the same word remains immediately due caused an initial test timeout; no assertion was removed. Actual logs are recorded in `DISTRICT_TEST_LOGS.md` after completion.

Physical iPhone Safari and native pronunciation/language verification remain unperformed. Managed Chromium may skip direct `file://` navigation; offline-after-delivery validation is distinct and retained. No merge or force push is part of delivery.
