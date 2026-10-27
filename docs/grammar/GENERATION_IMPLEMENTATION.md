# Codex implementation contract — productive grammar-aware Pashto practice

**Source of grammar:** [PASHTO_GENERATION_RULES.md](PASHTO_GENERATION_RULES.md). **Golden/negative cases:** [GENERATION_TEST_CASES.json](GENERATION_TEST_CASES.json).

**Purpose:** Turn a small finite nine-binding matrix into a maintainable *feature-constrained sentence composer*, using the user's 14-day curriculum. This is a **future implementation specification only**. This branch deliberately makes **no gameplay/source or lexicon edits**.

## 0. Merge/rebase boundary

As of document authorship (27 October 2026), merged main contains Issue #18 / PR #19 and save schema 6; **PR #20 is open** and contains 341 additional **provisional playable** word records, 301 district + 40 universal. Do not assume PR #20 is merged; inspect the current branch before touching files. If expanding generation using its new forms, either base/rebase on merged PR #20 or coordinate changes explicitly. Preserve `userVerified: false` for unreviewed entries. Grammar research does not provide translations for those 341 items and does not make their inflections trustworthy.

## 1. Expected architecture (no wholesale app rewrite unless necessary)

Retain the existing modular services, and strengthen:

- **Lexicon (content/LIBRARY_LEXICON.json):** stable lemmaId, senseId if needed, POS, grammatical features, formId and form-specific morphology, pronunciation provenance, firstAllowedDay, grammar prerequisites, review status.
- **Curriculum:** stable first formal introduction (day, district, teaching order), unlock of **individual forms/grammatical structures**, independent of whether a lemma appears incidentally in scripted dialogue.
- **Sentence grammar (content/SENTENCE_FRAMES.json or a new versioned equivalent):** composable typed AST/frame definitions. A frame is a pattern of *licensed grammatical slots and semantic constraints*, NOT a hand-entered list of every permissible noun+adjective combination. Keep curated exclusion/exception lists as needed.
- **Sentence compiler (src/sentence-engine.js):** choose compatible licensed forms, unify features, render Pashto and English, freeze provenance. No random word permutations.
- **English semantics:** generate glosses with sense-specific English countability, subject agreement, verb valency and article/number metadata. Never assume a simple string replacement produces a grammatical English translation. Source-specific English can remain a reviewed stored override.
- **Audit/testing:** capture why each eligible/unusable form or frame is allowed/blocked, including source/provenance.

The prior nine tuples are golden regressions, not a sufficient generation architecture.

## 2. Suggested canonical data contract (adjust names to existing schemas)

A lemma record should distinguish:
- lexical identity `lemmaId`, `senseId` (where polysemy matters), `partOfSpeech`;
- noun `gender`, `animacy`, `countability`, noun class, allowed semantic classes;
- verb `predicateType` = simple/compound/stative, `valency`, `objectSemanticClasses`, and `inflectionParadigmId` only where evidence supports one;
- adjective `inflectionClass`, predicative/attributive licensing, semantic suitability;
- grammatical function (demonstrative, possessive, interrogative, numeral, adposition) distinctly from POS;
- `introduction` and `verification` information separately.

Each surface form must carry: `formId`, actual Pashto spelling, verified-or-provisional romanisation, sense, tense/aspect/mood **if finite verb**, person/number/gender/case **where relevant**, role, evidence source IDs or URLs, first allowed grammar day, `compositionEligible` with reason, and `userVerified`. Absence of feature data is `null`, never “any”. Preserve exact authored forms and IDs.

A frame record must carry: immutable `frameId`, grammar `family`, `requiredGrammarIds`, `earliestDay`, typed subject/object/complement slots, slot agreement and case constraints, predicate semantic restrictions and sense choices, output structure, English realiser/approved gloss policy, and explicit evidence/review tier. Free variables may range over ALL compatible **attested** forms (not only 9 individually enumerated bindings). A lexical `semanticClass` filter is necessary but does not certify naturalness: keep per-predicate selection preferences/exclusions where required.

**Unknown rule:** Any missing mandatory grammatical feature, unattested surface form, missing required morphological context or ill-licensed predicate must *exclude* that candidate, not silently make it flexible.

## 3. Generator pipeline

1. Obtain the player's **actual introduced form IDs** and unlocked grammar IDs. Never treat “exists in lexicon” or “assigned to future day” as unlocked. Previewing an untranslated word in a skipped challenge cannot unlock it.
2. Choose a frame valid for the current day/learning objective. Start with descriptive/equative, then present intransitive/transitive SOV, then later Week 2 families.
3. Choose a compatible subject NP: person, number, gender, noun/pronoun, case, contextual role; for first/second person identify the speaker/addressee. Do not infer character gender from the user's onboarding choices or assign grammatical gender to a free lexical noun from an English gloss.
4. Resolve predicate frame (simple lexical verb, compound predicate, equative), its transitivity, semantic arguments and aspect/tense. Require exact attested present imperfective conjugated form matching person/number; do not apply endings to infinitives on the fly.
5. Resolve appropriate object/head noun and adjectives/determiners/quantifiers, unifying gender, number and case. Apply only known inflection paradigms or attested surface forms.
6. Resolve spatial/possession/adverb/question/coordination slots if grammatically unlocked, using *licensed chunks* and contexts.
7. Apply semantic compatibility (e.g. `drink` with beverage; `read` with readable object). Check that each possible English gloss actually describes the generated Pashto proposition.
8. Render script from **licensed form spellings** and fixed functional particles with explicit grammar and unlock IDs. Generate phonetic transcription only from attested/approved form-level information (or with a clearly labelled provisional algorithm, not disguised as review).
9. Reject duplicate/implausible constructions, inflection mismatches, unlicensed form IDs and text/translation mismatches. If no safe candidate exists, choose a compatible previously-authored sentence and disclose that it is a fallback.
10. Freeze *complete* sentence text, gloss, romanisation, selected lemma/form IDs, frame ID, grammar IDs, speaker/addressee, answer choices, distractors, shuffle/seed and provenance in persisted attempts; no re-roll on resume/retry.

**Important:** A sentence does not become correct merely by passing feature unification. Apply scene semantics, selection restrictions and review requirements. A fallback should be correct in the player's taught grammar and never leak unsupported future forms.

## 4. Delivery phases (each as a testable milestone)

**G1 — Equative families (Days 1+):** masculine/feminine singular; masculine/feminine plural *only with attested pairings*. Both predicative and prenominal adjectives, but never confuse the two. Add location adverb equatives when licensed. Examples in [test cases](GENERATION_TEST_CASES.json).

**G2 — Present verbal clauses (Days 2–7):** start 3rd-singular simple intransitive/transitive; 1st-singular Day 3; informal 2nd-singular Day 4; respectful/plural 2nd Day 5; 1st-plural Day 6; 3rd-plural Day 7. Combinations of already unlocked lexical nouns and **attested present conjugations**, subject pronouns matched to person/number. Compound verbs are a separate frame type and must never be constructed by blindly detaching complements.

**G3 — Week 2 modifiers and questions (Days 8–13):** demonstrative noun phrases, plurals and count expressions, spatial/circumpositional chunks, possessive NP, question/answer schemas and adverbial adjuncts. Only add one family after the preceding family's feature schema and adversarial tests pass.

**G4 — Cumulative testing (Day 14):** no new forms. Mix distinct compositions across earlier grammars, use tested variation/review scheduling and do not merely repeat exact Day 8–13 pairs.

**G5 — Editorial scale-up:** progressively validate and attach the new provisional 341 word records to grammar/semantic classes and forms. New lexical *citation* cards are playable, but their form-specific generation stays excluded until required features and surface evidence exist. This can be done while `userVerified=false`, visibly provisional. User review status is NEVER auto-upgraded.

## 5. Minimum smoke/golden invariants

Inspect and preserve exact live IDs before coding:
- `s3-house`: کور لوی دی. / The house is big. (masculine sg equative)
- `s5-dark`: دا کوټه تیاره ده. / This room is dark. (feminine sg equative)
- `s1-read`: زه کتاب لولم. / I read a book. (1sg present SOV)
- `s2-read`: ته کتاب لولې. / You read a book. (2sg present SOV)
- `s5-read`: تاسې کتاب لولئ. / You read a book. polite/plural (2pl/polite)
- `s3-read`: هغه کتاب لولي. / He/she reads a book. (3sg)
- `s6-books`: هغوی کتابونه لولي. / They read books. (3pl)
- `w2-d9-market-2`: دا مڼې دي. / These are apples. (plural equative)
- `w2-d11-house-1`: دا زما کور دی. / This is my house. (possessive)
- `w2-d10-school-1`: کتاب پر مېز دی. / The book is on the table. (spatial)
These are **existing game drafts**, not independently reviewed linguistic gold standards; lock them as *regression fixtures*, not as proof of local correctness.

Require **negative tests** for each of: Day 1 action verb; gender mismatch in equative; singular/plural copula mismatch; noun gender guessed from ending; wrong pronoun/person conjugation; future-form substitution; unseen oblique/plural token; verb used with semantically incompatible object; possessive slot lacking case; loose word-by-word spatial shuffle; code switching English labels into Pashto; a skipped challenge inadvertently granting vocabulary; and identical text/gloss retried with changed slots.

See [GENERATION_TEST_CASES.json](GENERATION_TEST_CASES.json) for machine-readable fixtures. The tests are initially spec examples; a Codex implementation must integrate them into the project's real test runner, not merely check their JSON syntax.

## 6. Quality and coverage acceptance (beyond nine)

No arbitrary “all 341 words in every sentence” requirement.

- **Rule coverage:** at least one active, tested frame for **each of G1, G2 and G3 families** where grammatical forms actually exist. When none are sufficient, record exact lexical/morphological blockers and the missing review decision per form.
- **Variety:** for a normal route with several compatible taught nouns/verbs, repeated seed-controlled practice should produce **more than nine** distinct, well-typed sentences across introduced grammar families. If the actual lexicon cannot support such a result, produce a concrete gap report, not misleading “expanded” claims.
- **Unlocked-only**: every generated form ID and particle has a suitable earlier introduction/grammar license; no future words even if they exist in the proposed vocabulary PR.
- **No false review:** every unverified composition and newly added form remains marked draft; no auto-certification.
- **Determinism:** repeated seeds/states produce identical outputs, but different seeds yield variety where multiple *licensed* choices exist; challenge resume preserves exact text/choices/locks.
- **Tests:** full `python3 tools/verify.py`, browser suites, schema validation, thousands of property-style combinations, adversarial invalid forms, pace 0/4/8/12/16/20/24 and all 14 days (normal/skip), offline generated index.html, audio fallback test, and save schema lifecycle. Report exact commands and exit codes. Do not conflate mocks and iPhone/Windows device evidence.
- **Report:** per grammar/day counts of licensed sentence possibilities, lexical coverage and exclusion reasons, example Pashto/English side by side, count of *new* compositions vs fixed authored fallback, any tests skipped, and specific items needing the user's review.

## 7. Copyright and language-review integrity

Do not scrape/copy LingDocs dictionary datasets, phrase builder algorithms, page code, full tables, or bulk examples into the game. Cite references and independently implement the rule constraints using the user's own corpus and vetted selected examples. LingDocs is not an endorsement of generated content and explicitly highlights the risks of LLM-generated Pashto. Respect its content license and the project's own corpus licensing/provenance.

**Delivery:** Implementation on a fresh branch, PR against current main, no automatic merge. Update existing active documentation files only as truly necessary; this standalone reference remains source-linked research, not a substitute for the canonical runtime curriculum.
