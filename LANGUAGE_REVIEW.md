# Pashto linguistic review and release gate

**Status: not native-certified.** The game targets Afghan Pashto as spoken in **Laghman**. Conventional Pashto spelling is preferred when local variants are uncertain. Existing Pashto, romanisation and authored Week 1/2 translations are instructional drafts; neither a browser voice nor passing tests establishes native-speaker review.

## Required approval record

For any lexical candidate, greeting, sentence, dialogue response or alternate accepted answer, record its stable content/lemma/form ID; Pashto; precise English sense; context, speaker and addressee; any local vs written variant; romanisation; reviewer name or identifier and review date; review source/reference; accepted alternatives and rationale; and audio provenance when available. Never invent sign-off. A complete entry may be playable as an explicitly unchecked provisional draft; `native_approved` still requires documented reviewer evidence.

The lexicon has 473 draft lemmas: 128 previously authored drafts, **301** promoted district drafts, **40** linked universal targets and four explicit existing story-character identities. Every new item has `userVerified: false`, mechanical uncertainty notes and no native-approval claim. Review them in `content/VOCABULARY_REVIEW.csv`; corrections belong in `content/LIBRARY_LEXICON.json`, after which the CSV is regenerated. The 15 untranslated narrative expression slots remain inactive.

## Phonology, orthography and grammar checklist

- Validate `موږ / مونږ` for “we”, `تاسې / تاسو` for polite/plural “you”, and informal `ته` with explicit speaker/listener number and politeness. Select consistent written standards and deliberately approved variants.
- Check present-tense agreement and actual verb stems, not a universal suffix rule: `ـم`, `ـې`, `ـي`, `ـو`, `ـئ`, `ـي` may overlap; third-person plural is often distinguished by subject/context. Irregular and compound verbs such as `تلل`, `منډې وهل`, `کښېناستل`, `اخیستل`, `څښل`, `لوستل`, `لیکل` and `پاکول` merit individual checks.
- Validate SOV, postpositions, object marking, gender/number agreement, noun plurals/obliques, sensible everyday collocations and named compound subjects. `مینا او زه` includes the player in “we”; “they” describes an outside group.
- Romanisation must be consistently usable by beginners on phones; review vowel distinctions, aspirated sounds and local pronunciation instead of silently mixing dialect systems.
- A quiz should accept only intentionally approved equivalent forms/orderings. Do not accept arbitrary permutations, strip important inflections, or add dialect variants without explicit teaching/reviewer evidence. Keep distractor and dud-tile answers genuinely wrong in context.

## Archival attestation review queue

Week 1 Days 6–7: review `w6-river-run` / `w6-river-mina-run` / `w6-we-run` (lake/river, running, singular vs plural); `w6-river-you-walk` and `w6-walk` (respectful/plural agreement); `w6-house-help` and `w7-house-help` (help + Muhammad Jan); `w6-house-chairs` / `w7-house-chairs` (chair obliques); `w6-market-*` / `w7-market-*` (baskets, carrying, vegetable collocations); `w6-school-answer` / `w7-school-answer` (questions/answers); `w6-compound`, `w7-compound-*` (coordination), `w7-i-read` / `w7-you-read` / `w7-all-read` (person distinctions). Verify Week 1 exam contexts for `موږ`, `تاسې` and `هغوی`.

Week 2 `docs/grammar/attestations/WEEK2_AUTHORED.json`: 140 sentence cards (`w2-d8-<zone>-1` through `w2-d14-<zone>-5`) and 48 NPC question/reply records (`w2-d8-reply-1` through `w2-d14-reply-12`, with actual per-day ranges defined in the archive). All are drafts marked for native review; no `acceptedPs` alternatives have been approved. Review by day:
- **8:** near/far demonstratives `دا / هغه`; feminine/plural agreement, lake terminology and obliques.
- **9:** counted nouns and plurals, feminine quantities, numbers 1–5 and adjective agreement.
- **10:** spatial constructions `پر مېز`, `په ټولګي کې`, `د دروازې تر څنګ`, motion/direction vs static location.
- **11:** possession `د صالحې`, `ستاسې`, `زموږ`, reflexive `خپله` and speaker-relative pronouns.
- **12:** question words `کوم / کومه`, `څو`, `د چا`; questions whose scene supports exactly the intended response.
- **13:** `ورو ورو` vs `وړو`, `ژر`, `تل`, `کله کله`, `هره ورځ`, adverb placement and present-tense continuity.
- **14:** distal feminine obliques, integrated clues and speaker/owner references, context-specific answers in the final examination.

Full authored English targets and editorial context are in `content/WEEK2_LESSON_DATA.json` and the non-authoritative `docs/reference/WEEK2_DETAILED_LESSONS.md`. Mark resolved issues individually; do not globally remove draft/review flags.

## Audio and device status

An optional `audio/<content-id>.mp3` pack is **not** currently bundled or native-verified. The common player prioritises available MP3 files, then detected Pashto device voices with neural/`ps-AF` preference and delayed discovery, or a clearly warned `ps-AF` fallback. An explicitly unrelated language voice must not be selected as Pashto. Tests of mocked speech selection do **not** prove audio is intelligible or works on a particular physical iPhone/Windows device. Log actual device/browser/voice, phrase ID, intelligibility and pronunciation validation before claiming success.

## Helpful grammatical references (not local dialect sign-off)

- LingDocs: [Verb endings](https://grammar.lingdocs.com/verbs/verb-endings/) and [present verbs](https://grammar.lingdocs.com/verbs/present-verbs/).
- Speaking Pashto: [Lesson four](https://www.speakingpashto.com/lesson-four/) and [lesson seven](https://www.speakingpashto.com/lesson-seven/).

These support systematic review but do not replace a qualified Laghman speaker or verified recordings.

## Current lexical audit and generation exclusions

`content/CURRICULUM_AUDIT.json` reports 473 identities/607 forms, including four existing story-character identities made explicit for individual named-subject/possessor study. The 341 promoted drafts retain their original `userVerified: false` status and provenance. `content/VOCABULARY_REVIEW.csv` remains a generated human review register.

The productive generator has 181 eligible surface forms and 29 typed templates across 28 families. Features are explicit contextual analyses of exact authored draft spellings, backed by the researched constraints in `docs/grammar/PASHTO_GENERATION_RULES.md`. Previously missing isolated pronunciation aids have been supplied only where an exact span can be extracted from a cited authored sentence; these aids remain provisional and do not constitute reviewed pronunciation. Original context romanisation and uncertainty records remain available.

Unknown morphology stays null and is never a wildcard. For example, the direct object “Pashto” can participate in a licensed learning predicate while its unknown gender excludes it from gendered descriptions. Named possessors use stored whole oblique chunks; direct-case names are not substituted. Compound verbs preserve their entire attested predicate. No native approval, new lexical stem, invented inflection or recording has been asserted.

`content/GENERATION_AUDIT.json` enumerates exact excluded/partially usable form IDs, missing features, semantic evidence and absent present-conjugation cells. [Capacity and gaps](docs/grammar/GENERATION_COVERAGE.md) are separate from [actual instructional delivery](docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md). There are no authored sentence fallbacks. Only the [six registered conventional expressions](docs/grammar/FIXED_PHRASE_EXCEPTIONS.md) may be taught whole. Masculine cardinal One (the idiom “together” is not cardinal evidence), feminine Two, counted Four/Five, arbitrary noun obliques and unlicensed tenses remain blocked. All combinations, selection preferences and English senses still require human naturalness/dialect review.

The additional window analysis and conjunction license cite exact archived forms; neither guesses a stem or certifies pronunciation. Runtime carries per-form evidence, not complete archived teaching sentences. Archive corrections should update the relevant form licenses and rerun generation and delivery tests.

CSV curriculum proposals and human scheduling approvals are separate from linguistic verification. A worksheet's `verifiedStatus` cannot confer native certification. No pending district candidate, universal target or narrative expression is activated by these changes. Existing device/audio caveats and required reviewer/date/reference/variant/alternative/audio provenance remain in force.
