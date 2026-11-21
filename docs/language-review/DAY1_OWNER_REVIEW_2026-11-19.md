# Day 1 — project-owner language review (19 November 2026)

**Scope:** Day 1 vocabulary V01–V24; tutorial/greeting P01–P03; Bilal B01–B06; the displayed G01 and G02 example sentence wording/meaning. This is an explicit **project-owner approval or correction**, not an independent native Laghman linguistic certification and not an audio review.

**Source baseline:** `ef23d11e3408d019060530aa94321332acda7c29` (`main` when the reviewer materials were prepared). Review received in the ChatGPT Pashto Quest language-review conversation on 19 November 2026:

> Vocabulary V01–V24: Approved / Corrections below  
> V17: ona --> wona  
> Bilal: All jaheel --> jheel  
> All other entries approved for pashto, transliteration and English meaning

## Decisions

| Content | Owner decision | Source record / correction |
| --- | --- | --- |
| V01–V16 and V18–V24 | Approved unchanged in Pashto, transliteration and English meaning | 23 entries in [WEEK1_LEXEME_REVIEW.csv](WEEK1_LEXEME_REVIEW.csv) marked `ACCEPT` |
| V17, Tree / ونه | Pashto and English approved, transliteration corrected from `ona` to `wona` | `lemma:expansion:noun:tree` marked `REVISE` |
| P01–P03, B02, B04–B06 | Approved unchanged in Pashto, transliteration where provided, and English meaning | 7 records in [WEEK1_FIXED_LANGUAGE_REVIEW.csv](WEEK1_FIXED_LANGUAGE_REVIEW.csv) marked `ACCEPT` |
| B01 and B03 | Pashto and English approved, romanisation `jaheel` → `jheel` | `bilal-day-1` and `bilal-day-1-correct` marked `REVISE` |
| G01, `کور لوی دی.` — “The house is big.” | Text and English meaning accepted under user's global “all other entries” response | This sample was displayed in chat, not in the grammar worksheet as an exact reviewed runtime sample |
| G02, `اوبه سړې دي.` — “The water is cold.” | Text and English meaning accepted under the same response | Also present as `bilal-day-1-response`; grammar rule and its broader generated combinations still need independent language review |

The broader Day 1 Grammar Journal explanation records in [WEEK1_GRAMMAR_REVIEW.csv](WEEK1_GRAMMAR_REVIEW.csv) remain `PENDING`, because this review approved the presented Pashto/transliteration/English entries rather than certifying every technical rule and example in the Journal. Similarly, Day 1 recorded forms and Day 5 plural/case forms remain pending in [WEEK1_FORM_REVIEW.csv](WEEK1_FORM_REVIEW.csv).

## Implementation changes pending

The CSV review record is not the playable game's content:

1. Update canonical tree citation romanisation in `content/LIBRARY_LEXICON.json` for `lemma:expansion:noun:tree`, and linked authoritative base approval/source metadata as required by its provenance checks. Do **not** apply `wona` to the separately attested plural `وني` or oblique `ونو` forms.
2. Update the exact `content/RPG_WORLD.json` Pashto `roman` fields for `bilal-day-1` and `bilal-day-1-correct`: replace `jaheel` with `jheel`. Do not edit the Pashto script `جهیل` or English senses, and do not incorrectly extend Day 1 textual approval to Days 2–7.
3. Refresh generated vocabulary review artifacts and the compiled HTML release using the repository's documented tools. Update owner approval evidence with the exact scope and date, preserve the October approval history, then run affected vocabulary, character/dialogue, sentence/assessment, language-proof and browser regressions.
4. Confirm corrected player-visible word cards and Bilal Day 1 dialogue after implementation; mark `REVISE` items resolved only when the new runtime content is checked. Separate native-speaker language certification remains pending.

**Status:** Day 1 owner review recorded; three required romanisation changes pending implementation; no independent native sign-off claimed.
