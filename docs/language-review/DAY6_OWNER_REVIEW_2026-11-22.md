# Day 6 — project-owner language review (22 November 2026)

**Source snapshot:** `ef23d11e3408d019060530aa94321332acda7c29` (`main` at the time the language-review pack was prepared). Review scope: V130–V158 (24 district lemmas and 5 supporting entries), P08 and B31–B36 (7 fixed-language entries), and G13–G15 (4 underlying grammar records).

## Owner response

> Day 6 language review  
> Vocabulary V130–V158: Approved except corrections  
> V143 mermn --> merman  
> Dialogue P08 and B31–B36: Approved except corrections  
> Grammar G13–G15: Approved except corrections  
> Corrections and comments: None

## Decisions

| Scope | Decision | Stable record |
| --- | --- | --- |
| V130–V142, V144–V158 | **28 ACCEPT** unchanged for Pashto, transliteration and English as displayed | `WEEK1_LEXEME_REVIEW.csv` |
| V143 — Wife / مېرمن | **REVISE** transliteration from `mermn` to `merman`; Pashto and English unchanged | `lemma:expansion:noun:wife` |
| P08 and B31–B36 | **7 ACCEPT** unchanged | `WEEK1_FIXED_LANGUAGE_REVIEW.csv` |
| G13–G15 | **4 ACCEPT** of displayed grammar explanations and corresponding curriculum concepts | `WEEK1_GRAMMAR_REVIEW.csv` |

## Implementation task (pending)

1. Correct the canonical lemma entry's base romanisation for `lemma:expansion:noun:wife` from `mermn` to `merman` in `content/LIBRARY_LEXICON.json`, reconciling the scoped owner language-approval record and related exact base fields without changing Pashto `مېرمن` or English `Wife`.
2. Do not extrapolate this one correction to unreviewed inflected forms or unrelated vocabulary. Preserve original historical approval provenance and add a dated record of this revision.
3. Regenerate dependent vocabulary reports and offline build through documented scripts; test form flashcards and Day 6 lessons/challenge for correct display, plus relevant validation and regression.
4. Mark the worksheet's `REVISE` item implemented only after verifying the corrected runtime output and required tests.

**Review status:** Day 6 owner approval recorded, one base transliteration change pending in game. This is not independent native Laghman certification, an audio approval or endorsement of all generated sentence combinations.
