# Day 7 — project-owner language review (22 November 2026)

**Scope:** Vocabulary V159–V183 (24 district lemmas and one supporting pronoun), fixed expression P09 and Bilal B37–B42 (seven authored/fixed-language records), and G16–G18 displayed grammar explanations (four source rule/concept rows).

**Frozen baseline:** `ef23d11e3408d019060530aa94321332acda7c29` — main at creation of the language-review pack.

## Owner's review response

> Day 7 language review  
> Vocabulary V159–V183: Approved except corrections  
> V165 to weigh and to go are homophones in pashto, the sentence engine will need to use context to determine which to use.  
> V178 use purse, humyani,  
> همياني  
> Dialogue P09 and B37–B42: Approved except corrections  
> Grammar G16–G18: Approved except corrections  
> Corrections and comments: None

## Review decisions

| Scope | Owner decision | Stable IDs and worksheet |
| --- | --- | --- |
| V159–V164, V166–V177, V179–V183 | **23 ACCEPT** unchanged, exact displayed Pashto, transliteration and English | `WEEK1_LEXEME_REVIEW.csv` |
| V165 — تلل / tll / Weigh | **ACCEPT lexical meaning**, **requires semantic disambiguation** from existing "To go" lemma; no spelling/romanisation change was requested | `lemma:expansion:verb:weigh`, issue `DAY7-V165-SENSE-DISAMBIGUATION` |
| V178 — Purse | **REVISE** base Pashto and pronunciation aid from `کڅوړه / ktsora` to **`همياني / humyani`**, English **Purse** unchanged | `lemma:expansion:noun:purse`, `lemma:expansion:noun:purse:citation`, issue `DAY7-V178-PURSE-LEXEME` |
| V127 — Bag | **Retain unchanged:** `کڅوړه` remains the separate, previously approved Bag word | `lemma:n-bag3` |
| P09, B37–B42 | **7 ACCEPT** unchanged | `WEEK1_FIXED_LANGUAGE_REVIEW.csv` |
| G16–G18 | **4 ACCEPT** of shown Day 7 explanations | `WEEK1_GRAMMAR_REVIEW.csv` |

## Important engineering finding: two senses of تلل

The canonical lexicon currently contains two distinct lemma records with the same Pashto surface:

- `lemma:v-go` — **To go**, `تلل / tlal`, with separately licensed **intransitive** finite present forms.
- `lemma:expansion:verb:weigh` — **Weigh**, `تلل / tll`, currently a single **provisional, nonproductive citation** form whose generation eligibility is **false**.

The sentence engine has explicit semantic arguments and lemma/form binding metadata. The user requires preserving two meanings in context. This is a **future compatibility / semantic-disambiguation requirement**, not verified evidence that the sentence generator is already confusing the two: the Weigh entry is not currently composition-eligible.

### Required implementation behaviour

1. Maintain distinct **stable lemma IDs and senses** for To go and Weigh; do not deduplicate solely because the written form overlaps.
2. In word-choice, English recall, translation and distractor generation, only use contexts with **unambiguous intended meaning**. Where the same Pashto spelling could validly refer to two senses, design a prompt/context that distinguishes them or accept both *only when the question explicitly permits both*; do not mark a contextually valid answer wrong.
3. Preserve transitivity and scene/semantic argument constraints. **To go** is not interchangeable with **Weigh** merely because the citation surfaces are homophonous.
4. Do **not** enable productive Weigh conjugations without form-specific evidence and separate language approval. Keep its `composition.enabled=false` until explicitly reviewed and licensed.
5. Add test cases for shared Pashto spelling / distinct English senses in questions, answer adjudication, distractors, and future generation paths; verify no existing Day 5 go sentences regress.

## Required implementation behaviour: V178

1. Replace the active Purse entry's **base** `displayLemmaPs` and citation `pashto` with `همياني`; set base and citation `romanisation` to `humyani`; retain English `Purse`. Preserve its existing `lemma:expansion:noun:purse` ID unless content schema requires an explicit migration.
2. The old Purse entry `کڅوړه` is not the desired **Purse card**; retain `lemma:n-bag3` (Bag / کڅوړه), its licensed inflections and any existing assessed usages.
3. Reconcile scoped project-owner language approvals (preserving old evidence and adding exact dated correction) and any derived vocabulary review, source mappings, lesson inventories, accepted answers and generated release.
4. Do not infer gender, direct plural, oblique forms, agreement, phonetics beyond `humyani`, or new generative licences for Purse. The base research remains provisional outside this owner's specific exact-word correction.
5. Verify an actual Day 7 playable Purse card displays `همياني / humyani / Purse`, and Day 5 Bag continues to display `کڅوړه` as an independent word.

## Implementation and sign-off state

These owner decisions are recorded in the review worksheets and **have not yet altered live game content**. Make a dedicated implementation branch after the review PR is merged and run existing validation/build tests, plus targeted Day 7 sentences, challenge, vocabulary schedule, semantic collision, frozen assessment and save/restore regressions. Keep user/owner confirmation separate from independent Laghman native review or actual recording approval.

**Day 7 result:** 24 vocabulary lemma records accepted (V165 with specific engine requirement), one vocabulary lemma flagged for correction (V178), seven dialogue records accepted, four grammar records accepted; associated Purse citation and noun morphology reference flagged for revision. Unreviewed forms and dynamic sentence output remain pending independent review.
