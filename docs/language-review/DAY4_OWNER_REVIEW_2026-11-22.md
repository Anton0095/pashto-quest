# Day 4 — project-owner language review (22 November 2026)

**Scope:** Day 4 vocabulary V78–V104 (27 lexical entries), daily greeting P06 and Bilal dialogue B19–B24 (7 fixed-language entries), and displayed grammar G08–G09 (3 source rule/concept records).

**Frozen source baseline:** `ef23d11e3408d019060530aa94321332acda7c29`. User decision in the Pashto Quest ChatGPT project:

> Day 4 language review  
> Vocabulary V78–V104: Approved except corrections  
> Corrections: separate plar (father) and mor (mother) as separate words, remove the parent card  
> Dialogue P06 and B19–B24: Approved except corrections  
> Grammar G08–G09: Approved except corrections  
> Corrections and comments: None

## Decisions

| Scope | Owner decision | Worksheet |
| --- | --- | --- |
| V78–V96 and V98–V104 | **26 ACCEPT** unchanged; spelling, romanisation and English meaning as displayed | `WEEK1_LEXEME_REVIEW.csv` |
| V97 — Parent / مور او پلار / mor ao plar | **REJECT from active vocabulary curriculum**, at the owner's explicit request to remove the Parent card; no claim that the phrase itself is linguistically wrong | `lemma:expansion:noun:parent`, `issue_id=DAY4-V97-REMOVE-PARENT` |
| Mother / مور / mor | **Keep as independent existing Day 1 word V09** | `lemma:expansion:noun:mother`; no new lemma required |
| Father / پلار / plar | **Keep as independent existing Day 1 word V10** | `lemma:expansion:noun:father`; no new lemma required |
| P06 and B19–B24 | **7 ACCEPT** unchanged | `WEEK1_FIXED_LANGUAGE_REVIEW.csv` |
| G08–G09 | **3 ACCEPT** of the exact presented grammar descriptions | `WEEK1_GRAMMAR_REVIEW.csv` |

## Implementation required separately

- Remove the separate `lemma:expansion:noun:parent` item/card from active scheduled teaching, flashcard/lesson-selection pools, ordinary challenges and the learner's new-word progression as appropriate. This may require revising its active inventory/schedule configuration in `content/LIBRARY_LEXICON.json`, generated curriculum audits, and expected test fixtures. Use the existing authoritative curriculum mechanism, not a UI-only hide.
- Retain Mother and Father as the **two existing independent Day 1 lemmas** with unchanged stable IDs and meanings. Do not create duplicates or reassign their Day 1 teaching.
- The removal leaves one Day 4 planned 24-lemma slot potentially vacant at the highest pace. Inspect the current lesson planner's available replacements/redistribution and report the resulting Day 4 quota behaviour; do not invent a new Pashto word or silently shift a different lemma without deterministic curriculum reconciliation.
- Preserve the old October scoped approval as historical provenance; the owner's current decision is to drop the card from the active learning experience, not erase history or deny that the phrase can be grammatical.
- Run vocabulary/curriculum generation, lexicon validation, full impacted Day 4 flows (normal and shortcut), assessment score/answer and snapshot restore checks, and rebuild the offline release after implementing.
- Update the review record to implemented only when source/content, release build and regression checks confirm it is no longer a separate playable vocabulary card.

**State:** Day 4 owner language review recorded in PR #41; **runtime removal still pending**. This is a scoped project-owner decision, not independent native Laghman language certification. Grammar descriptions and displayed fixed expressions approved; individual future forms, plural morphology, and untested generated sentences remain separate review work.
