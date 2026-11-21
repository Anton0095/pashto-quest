# Day 5 — project-owner language review (22 November 2026)

**Scope:** Vocabulary V105–V129 (24 district words and one universal pronoun), plural forms F01–F09 (nine exact inflected noun forms), fixed-language items P07 and B25–B30 (seven records), and displayed grammar topics G10–G12 (five underlying curriculum/Grammar Journal records).

**Source snapshot:** `ef23d11e3408d019060530aa94321332acda7c29`, the main release captured for the reviewer package. Project owner's review in the Pashto Quest ChatGPT conversation:

> Day 5 language review  
> Vocabulary V105–V129: Approved except corrections  
> Plural forms F01–F09: Approved except corrections  
> Dialogue P07 and B25–B30: Approved except corrections  
> Grammar G10–G12: Approved except corrections  
> Corrections and comments:  
> F06 kabaan is the plural, remove f07 kabuna

## Recorded decisions

| Scope | Decision | Stable source record |
| --- | --- | --- |
| V105–V129 | **25 ACCEPT** without changes to Pashto, romanisation or English | `WEEK1_LEXEME_REVIEW.csv` |
| F01–F05 and F08–F09 | **7 ACCEPT**, exact sample plural forms | `WEEK1_FORM_REVIEW.csv` |
| F06 — کبان / kabaan | **ACCEPT**, and owner's explicitly selected plural of کب | `lemma:n-fish:licensed:1` |
| F07 — کبونه / kabuna (stored aid `kabúna`) | **REJECT from active playable content**, not an accepted variant in this project's learning dialect | `lemma:n-fish:research:direct:plural:3aa8f716`, issue `DAY5-F07-REMOVE-KABUNA` |
| P07, B25–B30 | **7 ACCEPT** without changes | `WEEK1_FIXED_LANGUAGE_REVIEW.csv` |
| G10–G12 | **5 ACCEPT** of displayed grammar topics/source records | `WEEK1_GRAMMAR_REVIEW.csv` |
| Noun morphology of کب | **REVISE** research note to reflect approved plural and rejected variant; other case cells remain unresolved | `WEEK1_NOUN_MORPHOLOGY_REVIEW.csv` |

## Changes required in a separate implementation PR

1. The canonical `content/LIBRARY_LEXICON.json` currently retains both `lemma:n-fish:licensed:1` (کبان, kabaan) and `lemma:n-fish:research:direct:plural:3aa8f716` (کبونه, kabúna). Preserve the first as the taught/licensed plural. Stop teaching, formally acknowledging, assessing or compiling with the second and do not list it in the player's Library as an accepted plural variant. The simplest solution may be to remove the second from active `forms`, while preserving its historical research attestation separately. Do not delete its research provenance without retaining the audit trail.
2. Inspect `sourceMappings`, `generationAttestations`, curriculum form quotas, grammar gates, morphologically licensed noun roles, generated cards and previously frozen answer proofs to avoid dangling references to the excluded form. Do not create replacement inflections by rule.
3. Preserve the historical lexicographic research status of the disputed spelling: the owner's review rejects it **for the game**, not necessarily for all Pashto dialects, and not as a blanket dictionary invalidation.
4. Regenerate the affected form/morphology/grammar audits and compiled offline HTML. Run targeted language validator, noun/form grammar, sentence generation, Day 5 lesson/challenge and persistence/restore regressions. Old-save compatibility is not a requirement unless later specified.
5. When implementation tests pass and new UI output shows only **کبان** as the plural of **کب**, resolve the corresponding worksheet rejection as implemented. Do not convert the decision to blanket native approval.

**Scope boundary:** This owner's sign-off covers only the words, nine plural samples, seven fixed-language records and shown grammar explanations; it does not certify other noun forms or independently sampled generated sentences. No human recording/audio review occurred.

**Status:** Day 5 reviewed and recorded on PR #41; one inflected form removal pending separate runtime implementation; no independent Laghman native-review certification claimed.
