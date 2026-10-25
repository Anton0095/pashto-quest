# Human language-review preparation

This is an editorial export, not playable content or linguistic approval. Start with `FINDINGS.md` and `coverage.json` for findings and `review-register.csv` for assignment; open each linked `batches/*.json` for full existing language, meanings, morphology, source IDs, contexts and editable approval fields. Batches contain at most 25 records. Do not overwrite completed reviewer work by regenerating: copy working batches outside this generated directory and reconcile approved changes deliberately.

Run from the repository root:

```sh
python3 tools/prepare-language-review.py
python3 tools/prepare-language-review.py --check
```

The exporter reads the actual built catalog and authored assessment factories, all runtime cards, Week 2 models/dialogue prompts/replies/duds, and double-quoted Pashto literals in source. The catalog includes the tutorial and active expressions. Existing lexicon records include every form and authored example. `scenes.json` lists the actual teacher/participants for each of the 56 district/day scenes; Library is the reference/tutorial scene, and the Day 6 Hills conversation includes Saleha and Mina. Static blueprints and every authored card are covered; random question selection is not treated as an exhaustive list of all possible word-bank choices. Those choices and all Library forms are covered by the full lexical inventory. Template/dynamically assembled prose needs side-by-side source inspection; extraction is not a full linguistic parser.

Review in this order:

- **P0:** possible form/identity gaps, Days 6–7 high-risk authored contexts, distractors and pending expressions. Resolve identity/alignment before commissioning extra vocabulary.
- **P1:** existing lemmas/forms and other teaching/assessment surfaces. Check the exact sense, all contextual agreement, romanisation, register, speaker/listener and answer alternatives. Existing draft language is not certified.
- **P2:** the 301 selected district candidates and 40 universal semantic targets. Resolve sense aliases and existing identities first. District scenes are proposed teaching contexts, not authorisation to schedule new words. Action introductions start on Day 2; Day 14 remains cumulative with no compulsory new lemmas.
- **P3:** the 59 excluded district candidates, retained for editorial reconciliation rather than translation commissioning by default.

The intended English sense for lexical entries/candidates comes from authored data, not a new translation. Existing form morphology is copied verbatim. Review requests specify what remains needed: noun gender/countability/plural/oblique, adjective agreement, verb infinitive/compound identity/transitivity/stems/person/number/object marking, or function-word scope/reference/politeness. “Unspecified” and “plural or oblique” are unresolved metadata, not approved analyses.

For an unmatched token, the record supplies every English sentence/context, current spelling and scene; **its individual gloss and morphology are unresolved**. Human alignment must decide whether it is an inflection, function word, proper name, compound component, bound morpheme, spelling variant or missing lemma. Exact-token absence is not proof that a new word or translation is needed. Phrase components are not automatically independent lexical quotas. No speculative Pashto or token gloss has been supplied.

A reviewer should fill proposed Pashto/romanisation, precise sense and morphological corrections, local versus written variants, accepted alternatives with rationale, identity/form mappings, reviewer/date/reference and audio provenance. Check wrong options/dud tiles against their full questions; do not activate them as independent teaching words merely because they occur in an assessment. Record “retain draft”, “revise”, “merge identity”, “exclude” or “approved” explicitly. Approval in an export alone never activates runtime content: follow `LANGUAGE_REVIEW.md` and builder gates in a separate reviewed change.

Coverage findings distinguish structural reference failures, incomplete metadata, token-alignment triage and future supply shortages. Even an error-free identity graph does not prove every component of a sentence has been taught independently. At 24/day, 312 introductions across Days 1–13 exceed the 99 active district lemmas by at least 213, before incidental exposure and district constraints. Pending translations cannot fill that deficit until reviewed and activated.
