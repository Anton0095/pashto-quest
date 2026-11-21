# Day 2 — project-owner language review (22 November 2026)

**Scope:** Vocabulary V25–V52 (28 rows: 24 district entries and four supporting entries), daily expression P04, Bilal B07–B12 (seven fixed-language rows), and G03–G05 grammar presentations (four source records: one curriculum rule and three Grammar Journal concepts).

**Source baseline:** `ef23d11e3408d019060530aa94321332acda7c29` (`main` when reviewer pack was prepared). User's exact review message in the Pashto Quest ChatGPT project:

> Day 2 language review  
> Vocabulary V25–V52: Approved except corrections  
> Dialogue P04 and B07–B12: Approved except corrections  
> Grammar G03–G05: Approved except corrections  
> Corrections and comments:  
> v29 oror --> wror, v41 gl --> gul

## Decisions

| Content | Owner decision | Record |
| --- | --- | --- |
| V25–V28, V30–V40, V42–V52 | Exact Pashto, transliteration and English accepted unchanged | 26 Day 2 rows in `WEEK1_LEXEME_REVIEW.csv` marked `ACCEPT` |
| V29 — Brother / ورور | Romanisation `oror` → `wror`; Pashto and English otherwise accepted | `lemma:expansion:noun:brother`, `REVISE` |
| V41 — Flower / ګل | Romanisation `gl` → `gul`; Pashto and English otherwise accepted | `lemma:expansion:noun:flower`, `REVISE` |
| P04, B07–B12 | Approved unchanged | Seven Day 2 fixed-language records marked `ACCEPT` |
| G03–G05 | Presented English grammar explanations and source rule/concepts approved unchanged | Four Day 2 grammar records marked `ACCEPT` |

## Implementation still pending

This review updates only the **review worksheets** on the PR #41 branch. The playable game and canonical source JSON still contain the original Romanisation until a follow-up implementation change is made.

1. Update the **base citation romanisation** for `lemma:expansion:noun:brother` from `oror` to `wror` in `content/LIBRARY_LEXICON.json`. Maintain the exact Pashto spelling `ورور` and English meaning `Brother`, and preserve other inflected forms unless individually reviewed.
2. Update the **base citation romanisation** for `lemma:expansion:noun:flower` from `gl` to `gul` in `content/LIBRARY_LEXICON.json`. Maintain `ګل` and `Flower`. Do not extrapolate changes to different case/plural forms.
3. Reconcile the explicit prior owner-approval records with the corrected exact base spellings/transliteration using a new, dated, scoped approval event; preserve historical approval evidence.
4. Regenerate derived review files and the offline HTML release using standard scripts. Run relevant vocabulary/syntax/build/generation/assessment tests before merging runtime changes.
5. Confirm both newly corrected citation flashcards in the playable Day 2 workflow, with the new spelling aid.
6. Preserve the independent native-Laghman review status as pending. Approval of English grammar explanations is not native certification of all possible generated sentences.

**Status:** Owner Day 2 review recorded; 26 unchanged vocabulary entries, 7 fixed-language entries and 4 grammar records accepted, 2 vocabulary romanisation corrections pending implementation; no independent native sign-off asserted.
