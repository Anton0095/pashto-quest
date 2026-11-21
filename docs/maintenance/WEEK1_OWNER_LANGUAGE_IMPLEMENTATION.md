# Week 1 owner language implementation

The November 2026 owner decisions from merged PR #41 are implemented in the playable lexicon, lesson and assessment recall, Bilal’s dialogue and the offline release. Day 3 had no correction. The archived review worksheets retain the wording, verdicts and source commit that the owner reviewed. The November decision records preserve the October approval entries and capture the exact changes, reviewer, date and scope. [Owner approval record](../../content/USER_LANGUAGE_APPROVALS.json) · [Review history](../language-review/README.md)

Implementation commit [432c7e6](https://github.com/Anton0095/pashto-quest/commit/432c7e6ee95b5518f43694ad42de0b9d30dd85a6). The release SHA-256 is `29a06f7180edf106e63efeb4d04622139407a79dfde75d7f5cd77a241290d155`.

## Implemented corrections

| Day | Stable ID | Before | Playable result |
| --- | --- | --- | --- |
| 1 | `lemma:expansion:noun:tree`, `lemma:expansion:noun:tree:citation` | ونه / ona | ونه / **wona**, Tree |
| 1 | `bilal-day-1`, `bilal-day-1-correct` | jaheel | **jheel** in the two dialogue romanisations. Pashto and English meanings are preserved. |
| 2 | `lemma:expansion:noun:brother`, `lemma:expansion:noun:brother:citation` | ورور / oror | ورور / **wror**, Brother |
| 2 | `lemma:expansion:noun:flower`, `lemma:expansion:noun:flower:citation` | ګل / gl | ګل / **gul**, Flower |
| 4 | `lemma:expansion:noun:parent`, `lemma:expansion:noun:parent:citation` | مور او پلار / mor ao plar, Parent | Separate card retired from teaching, the Library, assessments and allocation. |
| 4 | `lemma:expansion:noun:mother`, `lemma:expansion:noun:mother:citation`, `lemma:expansion:noun:father`, `lemma:expansion:noun:father:citation` | مور / mor, Mother and پلار / plar, Father | Distinct Day 1 entries with their existing schedules. |
| 5 | `lemma:n-fish:form:0` | کب / kab | **کب / kab**, Fish singular |
| 5 | `lemma:n-fish:licensed:1` | کبان / kabaan alongside a second plural | **کبان / kabaan**, sole playable and licensed direct plural |
| 5 | `lemma:n-fish:research:direct:plural:3aa8f716` | کبونه / kabúna, licensed for composition | Retained as historical dictionary evidence, removed from the playable lexicon and compiler evidence. |
| 6 | `lemma:expansion:noun:wife`, `lemma:expansion:noun:wife:citation` | مېرمن / mermn | مېرمن / **merman**, Wife |
| 7 | `lemma:v-go`, `lemma:v-go:form:0` | تلل / tlal, To go | Movement scene for English recall. Existing intransitive finite forms remain licensed. |
| 7 | `lemma:expansion:verb:weigh`, `lemma:expansion:verb:weigh:citation` | تلل / tll, Weigh | Scale scene for English recall. Accepts Weigh and To weigh. The citation has no composition license. |
| 7 | `lemma:expansion:noun:purse`, `lemma:expansion:noun:purse:citation` | کڅوړه / ktsora, Purse | **همياني / humyani**, Purse. Gender, number and case remain unresolved. |
| 7 | `lemma:n-bag3` | کڅوړه / katswaṛa, Bag | Bag and its recorded forms retain their separate identity and spelling. |

The two **تلل** citations have separate flashcards and stable IDs. Pashto-to-English lesson, challenge and Library recall identifies the intended sense with an English scene before scoring. The options exclude the other citation’s English meaning, even where an inflected form shares that gloss. English-to-Pashto recall provides the English target and accepts **تلل** for either sense. Compiler bindings remain tied to lemma and form IDs. Go uses its evidenced intransitive present forms, while Weigh has no productive conjugations. [Day 7 review](../language-review/DAY7_OWNER_REVIEW_2026-11-22.md)

## Day 4 pacing

| Daily pace | Home | Lake | Market | School new district words | Last Market assignment |
| ---: | ---: | ---: | ---: | ---: | --- |
| 8 | 1 | 2 | 5 | 0 | Post office |
| 12 | 2 | 3 | 7 | 0 | Eraser |
| 16 | 2 | 5 | 9 | 0 | Pencil |
| 20 | 3 | 6 | 11 | 0 | Seed |
| 24 | 4 | 7 | 13 | 0 | Pan |

Each fresh-profile plan fills its quota. At 24 words, the planner uses the next eligible and unused Day 3 Market noun, Pan (`lemma:expansion:noun:pan`). The 16- and 20-word plans fill the former Parent slot with Pencil and Seed respectively. The 8- and 12-word plans never scheduled Parent and retain their assignments. The generated fresh-profile assignments for every other day match the baseline. Mother and Father are separate Day 1 entries and neither is introduced again on Day 4. School grammar and the ordinary and early challenge routes stay available. [Generated district inventory](../../content/DISTRICT_INVENTORY_REPORT.json)

At maximum pace the Day 6 Market lesson teaches the existing plural of Wife first. The corrected singular citation is visible in the Library. The plural retains its existing research spelling and transliteration.

## Save compatibility

The release continues to use schema 9. A paused Day 1 assessment saved by the baseline release reloads with the same active questions. Current-release tests cover frozen assessment, lesson and result reloads. A baseline Day 4 plan containing Parent, a generated lesson proof using the removed Fish plural, and a frozen English-to-Pashto Purse choice that only supplies the previous spelling are incompatible with the current content. The existing recovery screen preserves the original bytes for export and requires an explicit reset to start again. There is no automatic rewrite or reset of saved data.

## Generated artifacts

The offline `index.html`, vocabulary CSV, curriculum audit, district inventory, generation audit, generated coverage report and schema-9 generation digests were refreshed. The active inventory contains 473 lexical identities, 665 forms and 214 composition-eligible forms. The Week 1 review worksheets and dictionary evidence remain linked to their original review baseline. [Vocabulary register](../../content/VOCABULARY_REVIEW.csv) · [Generation coverage](../grammar/GENERATION_COVERAGE.md)

## Validation and screenshots

| Check | Result |
| --- | --- |
| `npm ci --cache /tmp/pashto-npm-cache`, `npm run typecheck` | Passed. A fresh cache resolved the initial tarball errors. |
| `python3 tools/build.py`, `python3 tools/build.py --check` | Passed. The offline release matches the edited inputs. |
| Approval, plural curriculum, form lifecycle and language tests | Passed. Covered scoped base approval, the selected Fish plural, distinct Go/Weigh recall and intransitive Go generation. |
| Construction completion and practical assessment model suites | Passed. Covered 70 day/pace completion cases and 140 assessments across five paces and both routes, including frozen restores. |
| Bilal browser suite | Passed at 1280 and 390 pixels. Verified both corrected Day 1 lines and dialogue reaction reload. |
| Focused Library inspection | Passed at 1280 and 375 pixels using a model-generated Day 7 profile. Verified the five corrected citations, absent Parent, Fish forms, distinct Bag/Purse, and contextual Weigh scoring. |
| Baseline save compatibility | Four fixtures verified. The unaffected paused Day 1 attempt reloads exactly. Each affected save remains intact, including after a save attempt. |

Chromium captures from the desktop lessons and mobile-emulated Library and dialogue.

- [Tree](week1-language/tree-1280.png) · [Brother](week1-language/brother-1280.png) · [Flower](week1-language/flower-1280.png) · [Wife citation](week1-language/wife-citation-375.png) · [Purse](week1-language/purse-1280.png)
- [Bilal’s introduction](week1-language/week1-intro-390.png) · [Bilal’s correct response](week1-language/week1-correct-390.png)
- [Fish plural in the Library](week1-language/fish-plural-375.png) · [Weigh recall scene](week1-language/weigh-recall-375.png)

The initial public browser run completed both seven-day gameplay routes. Its desktop test then failed an assertion that expected a singular Wife flashcard in the maximum-pace Day 6 lesson. The regression now checks the corrected citation in the Library and preserves the existing plural-first lesson. The updated public suite and the full `python3 tools/verify.py` browser run are in progress.

## Open review

Independent native Laghman review, unreviewed noun and verb paradigms, generated sentence naturalness, and pronunciation on physical devices remain open. The owner’s explicit Day 5 approval covers the reviewed example forms, including **کبان**, and the Week 1 worksheet’s 343 baseline form rows retain their individual review states. [Language review](../../LANGUAGE_REVIEW.md)
