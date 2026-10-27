# Pashto Quest — evidence-based sentence generation grammar

**Status:** Implementation reference, 27 October 2026. **Not a native Laghman language approval.** Researched from published Pashto grammar and cross-checked with the game's authored 14-day content. No gameplay or translations are changed by this document.

**Audience:** Codex extending src/sentence-engine.js and content/SENTENCE_FRAMES.json. Read this alongside [GENERATION_IMPLEMENTATION.md](GENERATION_IMPLEMENTATION.md) and [GENERATION_TEST_CASES.json](GENERATION_TEST_CASES.json).

## Non-negotiable distinctions

- **Published grammatical rule:** a general constraint backed by sources below; usable to design a parser or unification check.
- **Attested surface form:** an exact Pashto spelling and features documented in the project's authored source or a referenced lexicon/grammar. Does not imply Laghman dialect sign-off.
- **Compositional license:** a particular combination of attested forms and a compatible frame, with semantic and English gloss constraints. This is narrower than knowing a grammatical rule.
- **User/native verified:** independently reviewed by a qualified speaker; keep the actual reviewer provenance and never infer this from Codex, mechanical tests or source citations.
- **Provisional playable:** may be practised as development-draft vocabulary. This is **not** automatically permission to inflect it or combine it into novel sentences.
- **Locked/unlocked:** must depend on what THIS player has actually been taught, not the existence or authorial day of a catalog entry.

A rule may be sound even when a particular lemma's gender, stem, case or pronunciation is unknown. **Never replace unknown traits with a guessed default.**

## A. Clause types and word order

**A1. Present-tense verbal clauses:** default basic shape is Subject NP — (Object NP) — Verb, with optional licensed time/place/manner phrases. The finite verb typically comes at the end; don't generate a word bag. Distinguish intransitive, transitive and ditransitive argument frames. Do not insert an object into an intransitive verb or omit an obligatory argument of a constrained frame. References: [VP structure](https://grammar.lingdocs.com/phrase-structure/shortening-vps/), [NP structure](https://grammar.lingdocs.com/phrase-structure/np/), and [Pashto overview](https://en.wikipedia.org/wiki/Pashto_grammar).

**A2. Equative/descriptive clauses (Day 1):** Subject NP + Predicate + equative. The predicate can be an adjective, spatial adverb, licensed location expression, or noun phrase. **Two different agreement cases:** in subject + complement + equative constructions, agreement targets the subject; in NP + NP + equative, it can follow the final predicate NP. Do not reuse the masculine singular equative دی for all subjects. Contrast the game's attested:
- کور لوی دی. — The house is big. (s3-house: masculine singular noun/adjective/equative)
- دا کوټه تیاره ده. — This room is dark. (s5-dark: feminine singular copula)
- دا مڼې دي. — These are apples. (w2-d9-market-2: plural equative)

Don't treat English “is” as an ordinary conjugated action verb and don't assume every noun/adjective pair has a sensible reading. Source: [Equative Phrases](https://grammar.lingdocs.com/phrase-structure/ep/).

**A3. Attributive adjectives precede their head noun** inside an NP and, when inflecting, must agree with its gender/number/case. Contrast “new book” (نوی کتاب) versus predicative “the book is new” (کتاب نوی دی). Never use the same fixed word order for both syntactic contexts. Source: [Noun Phrases](https://grammar.lingdocs.com/phrase-structure/np/).

**A4. Negation and questions:** for a SIMPLE licensed present indicative verb, negative نه precedes the verb. Yes/no questions can have the same surface word order with question intonation/punctuation. Do not enable the negative or negative infinitive pattern globally: imperatives, compound verbs and other aspects have extra constraints. Question-word selection and pragmatics must be encoded per template. References: [Present verbs](https://grammar.lingdocs.com/verbs/present-verbs/), [Roots and stems](https://grammar.lingdocs.com/verbs/roots-and-stems/).

## B. Noun and adjective morphology

**B1. Nouns are grammatically masculine or feminine, with exceptions to apparent spelling-pattern predictions.** Keep a lexically established gender on each noun sense. For example, کور is masculine, and اوبه “water” is **feminine plural**, not ordinary feminine singular. Grammatical person for common nouns defaults to third person only where the governing grammar requires it. Do not infer gender from English or a spelling heuristic. Source: [Nouns and Gender](https://grammar.lingdocs.com/nouns/nouns-gender/).

**B2. Represent number and case explicitly.** Pashto has direct and oblique inflection central to first-week and week-two constructions; the broader language also has other case environments (e.g. ablative/vocative) that should not be silently collapsed into direct. Store the case distinctions relevant to each frame, and reject unrepresented combinations. A source comment “plural or oblique” is NOT evidence sufficient to generate both. Sources: [Noun Plurals](https://grammar.lingdocs.com/nouns/nouns-plural/), [Determiners](https://grammar.lingdocs.com/nouns/determiners/), [NPs](https://grammar.lingdocs.com/phrase-structure/np/).

**B3. There is no one-size-fits-all noun plural suffix.** Plurals use inflection classes, overt plural endings and irregular lexical forms. Each permissible singular/plural and case form must be explicitly documented, or derived **only** by a verified per-class rule from verified inflection-class data and accompanied by an explicit generation license. Treat plural headwords such as ماشومان / ځوابونه / مرغان as forms: investigate whether the singular is known and whether plural “lemma” records should be linked to an underlying lexeme. **Do not deduplicate distinct words just because English meanings coincide.** Source: [Making Nouns Plural](https://grammar.lingdocs.com/nouns/nouns-plural/).

**B4. Adjective agreement** requires the actual adjective paradigm or attested form for the appropriate gender/number/case. Some adjectives have invariant forms and others inflect in several classes; null/unreviewed features are not wildcards. In composition:
  - adjective used **before** noun: agree with head noun;
  - descriptive predicate adjective: agree with described subject NP;
  - nouns used as predicative complements are NOT freely treated as adjectives;
  - if no compatible surface form exists, fail closed / use authored fallback.
Source: [NPs](https://grammar.lingdocs.com/phrase-structure/np/), [Equative Phrases](https://grammar.lingdocs.com/phrase-structure/ep/).

**B5. Numerals and quantifiers (Day 9):** identify countable noun, quantity, noun number, gender/case behaviour and numeral-specific construction. “One” must not indiscriminately replace “two”; some numerals distinguish forms/contexts. Example in current authored game: دا مڼه ده. vs دا مڼې دي. Enable only licensed numeral + count-noun pairings with suitable examples and grammar IDs; do not simply prepend a count token. Sources: [Determiners](https://grammar.lingdocs.com/nouns/determiners/) and [Noun Plurals](https://grammar.lingdocs.com/nouns/nouns-plural/).

## C. Present verbs (Days 2–7)

**C1. Restrict initial productive action sentences to present imperfective indicative.** Published standard conjugation construction is *imperfective present stem + person/number ending*. Stem selection is lexical: **the infinitive is not the stem**. Irregular verbs and compound predicates need individually identified stems/paradigms. Source: [Present](https://grammar.lingdocs.com/verbs/present-verbs/), [Roots/Stems](https://grammar.lingdocs.com/verbs/roots-and-stems/).

Typical present ending inventory from [Verb Endings](https://grammar.lingdocs.com/verbs/verb-endings/):

| Person | Singular ending | Plural ending | Week 1 first-introduction |
|---|---|---|---|
| first | ـم | ـو | Days 3 / 6 |
| second | ـې | ـئ | Days 4 / 5 |
| third | ـي | ـي | Days 2 / 7 |

This is a **description of the paradigm**, not a license to algorithmically suffix these to every infinitive. Use a validated imperfective stem and explicit form features, or direct attested conjugated forms. Third singular/plural often have the same written surface ending, so subject context must remain distinguishable.

**C2. Subject agreement:** ordinary present indicative finite verbs agree with the grammatical subject in person and number, for both transitive and intransitive predicates. For a simple transitive clause, object selection does **not** determine the present finite verb ending. Source: [Present](https://grammar.lingdocs.com/verbs/present-verbs/) and [VP structure](https://grammar.lingdocs.com/phrase-structure/shortening-vps/).

Author-provided examples already in Week 1:
- هغه کتاب لولي. — He/she reads a book. (s3-read)
- زه کتاب لولم. — I read a book. (s1-read)
- ته کتاب لولې. — You read a book. (s2-read)
- تاسې کتاب لولئ. — Respectful/plural you read a book. (s5-read)
- هغوی کتابونه لولي. — They read books. (s6-books)

**C3. Distinguish subjects and addressees.** زه first singular; ته second informal singular; تاسې / تاسو polite singular or plural depending context; موږ / مونږ first plural; هغوی third plural. هغه also serves different third-person/demonstrative functions and is **not** a universal genderless syntactic wildcard. Keep speaker/addressee/context; don't indiscriminately change the addressee while preserving the conjugation. Treat preferred written variants separately until reviewed.

**C4. Valency and argument semantics:** Store each verb sense's transitivity and allowable object **semantic types**, not just POS. Reading a book, drinking water and eating bread are composable only if the intended sense and surface-form evidence support them; “read water” should not be constructed merely because the grammar agrees. Some predicates are multiword units: خبرې کول, مرسته کول, منډې وهل, زده کول. Such items need a dedicated **predicate construction** and complement rules, rather than free splitting/recombining words.

**C5. Past-tense transitive clauses are fundamentally different:** in the ergative past system, the transitive object's features govern verb agreement and the subject can take oblique case. That is outside Days 1–14 as currently approved. Explicitly prevent “future-proof” generation of past, perfect, subjunctive, passive, imperative or ability constructions without an independently specified, reviewed frame. Sources: [VP structure](https://grammar.lingdocs.com/phrase-structure/shortening-vps/), [Master Chart](https://grammar.lingdocs.com/verbs/master-chart/).

## D. Week 2 construction families

**D8. Demonstratives:** دا / هغه may act as determiners before a noun or as independent pronouns; هغه has distinct deictic and personal-pronoun functions, including context/stress distinctions. Track role, deixis, referent and noun agreement. A licensed demonstrative NP is not a substitute for an arbitrary pronoun in a different frame. References: [Determiners](https://grammar.lingdocs.com/nouns/determiners/), [Pashto grammar: pronouns](https://en.wikipedia.org/wiki/Pashto_grammar).

**D9. Plurals and quantities:** require all features of B2, B3 and B5. Do not generate counted nouns from an English plural rule or infer a gender by default.

**D10. Location:** treat location expressions as a unit with a case-governing preposition/postposition or circumposition (“sandwich”), e.g. په ... کې (in) and د ... تر څنګ (beside). A bare place noun cannot replace the whole expression; inflected noun forms may be required. Location adverbs دلته and هلته can be independent predicate/adjuncts. Reference: [Adverb Phrases](https://grammar.lingdocs.com/phrase-structure/ap/); attested in game: کتاب پر مېز دی. (w2-d10-school-1).

**D11. Possession:** build NP possession by a possessive construction such as د + possessor (in appropriate oblique form) + possessed head; keep the ownership semantics, pronoun person and gender/case requirements. Distinguish independent forms زما, ستا/ستاسې, زموږ from clitic forms; they are not freely substitutable tokens. Example already in game: دا زما کور دی. (w2-d11-house-1). Reference: [NPs](https://grammar.lingdocs.com/phrase-structure/np/).

**D12. Questions and dialogue:** a question is a *typed semantic predicate*. “Where” requires a location reply; “who” a person; “which” a scene-grounded choice; “how many” a count; “whose” a possessor. “Which” کوم/کومه may inflect with noun features. A yes/no question may use the same clause order with interrogative intent. Ensure generated reply changes according to asked question, speaking role and narrative context. Reference: [Determiners](https://grammar.lingdocs.com/nouns/determiners/) and [Present](https://grammar.lingdocs.com/verbs/present-verbs/).

**D13. Adverbs:** time, manner, frequency and place modifiers can add adjuncts to compatible verbal/equative predicates, but not every adverb fits every action. Most adverbs are invariant; adjective-derived adverbial material can still inflect. Encode a typed adjunct, its allowed anchor, and meaning, rather than appending a free token at a random position. Source: [Adverb Phrases](https://grammar.lingdocs.com/phrase-structure/ap/).

**D14. Review only:** no mandatory new grammatical form or lemma. Generated practice should combine **already introduced** compatible constructions and familiar forms; no new tense or grammatical family.

## E. Pronunciation, spelling, dialect, safety boundary

- Spoken pronunciation and romanisation cannot be reliably inferred from Pashto orthography alone; spelling, stress and vowel distinctions may remain ambiguous. Do not manufacture “verified” romanisation from a character conversion. Make the output unavailable for generated practice if a form lacks a suitable pronunciation record required by the game, or label the missing audio transparently.
- Preserve exact Pashto script in authored/golden examples and acceptable Laghman-written variants only after evidence; **do not** accept arbitrary substitutions of ی, ي, ې, ۍ, ء, spacing, negation or grammatical endings under generic string normalisation.
- Do not claim a native dialect rule from a general Pashto grammar reference. Ask the user/native reviewer to check lexical choice, inflection paradigm, actual idiomatic combinations, acceptable translations, informal/formal address and pronunciation.
- Avoid borrowing/copying another site's code, phrase generation engine, full paradigms or long examples. This document independently paraphrases general grammatical rules and links to references.

## F. Reference bibliography and provenance

The following resources were accessed for the rule summaries above on 27 October 2026. **These are general Pashto grammar resources, NOT native Laghman sign-off.**

1. [LingDocs: Nouns and Gender](https://grammar.lingdocs.com/nouns/nouns-gender/) — gender and known exceptions including feminine-plural water.
2. [LingDocs: Making Nouns Plural](https://grammar.lingdocs.com/nouns/nouns-plural/) — several plural patterns and irregularities.
3. [LingDocs: Noun Phrases](https://grammar.lingdocs.com/phrase-structure/np/) — prenominal adjectives, agreement, possession, noun phrases.
4. [LingDocs: Equative Phrases](https://grammar.lingdocs.com/phrase-structure/ep/) — predicate/subject agreement distinctions.
5. [LingDocs: Present Verbs](https://grammar.lingdocs.com/verbs/present-verbs/) — present imperfective conjugation, questions and negation.
6. [LingDocs: Verb Endings](https://grammar.lingdocs.com/verbs/verb-endings/) — person/number endings and caveats.
7. [LingDocs: Roots and Stems](https://grammar.lingdocs.com/verbs/roots-and-stems/) — irregular stems, aspect distinction, compound/exception handling.
8. [LingDocs: Verb Forms Master Chart](https://grammar.lingdocs.com/verbs/master-chart/) — aspect/tense distinction and excluded future scope.
9. [LingDocs: Determiners](https://grammar.lingdocs.com/nouns/determiners/) — demonstrative/determiner use and question forms.
10. [LingDocs: Adverb Phrases](https://grammar.lingdocs.com/phrase-structure/ap/) — adverbs and circumpositional spatial phrases.
11. [LingDocs: Shortening VPs](https://grammar.lingdocs.com/phrase-structure/shortening-vps/) — subject/object agreement distinction across present and past.
12. [Wikipedia Pashto grammar](https://en.wikipedia.org/wiki/Pashto_grammar) — broad corroboration of SOV, gender, pronouns, cases and split ergativity; secondary source, not independent verification of a specific game sentence.

**Source-use policy:** Cite individual rules by URL in any changed code/spec comments and any review audit. Grammar rule evidence ≠ verified specific word form ≠ verified natural sentence ≠ verified dialect pronunciation. The game's exact authored examples are developmental drafts and must be marked as such.
