# Pashto linguistic review and release gate

> **Integrated user approval (31 October 2026):** [approval record](content/USER_LANGUAGE_APPROVALS.json) covers all 473 base lemmas and 18 conventional phrases. نن (“today”) uses the subsequently supplied `nun`. This approves exact base spelling, listed senses and supplied transliteration; inflections, grammatical analyses, generated combinations, recordings and 59 excluded candidates remain outside its scope. No independent native certification is claimed.

**Status: not native-certified.** The game targets Afghan Pashto as spoken in **Laghman**. Conventional Pashto spelling is preferred when local variants are uncertain. Authored sentence evidence, inflections and grammar remain instructional drafts. Exact base entries and registered phrases have owner approval as scoped above; neither a browser voice nor passing tests establishes independent native-speaker review.

## Status terms

| Term | Meaning |
|---|---|
| Draft / pending | Editorial material; incomplete or untranslated records cannot become teaching targets automatically |
| `provisional_playable` | Mechanically complete lexical draft with explicit provenance and `userVerified: false`; playable under the existing provisional pathway, not native-certified |
| Active expression | Enabled phrase identity under its documented approval/provisional pathway; an activation flag alone is not native approval |
| `user_approved` | Explicit owner approval of exact base content or phrase, with reviewer/date/reference and scope; no independent native certification |
| `native_approved` | Real linguistic sign-off with reviewer, date, reference and the item-specific evidence below; never inferred from tests, generation or curriculum scheduling |
| Introduced / acquired | Player learning state for that exact item/form; distinct from editorial status, assignment and mastery |
| Curriculum approved | Human approval of stable-ID scheduling; does not certify translation, morphology or pronunciation |

The requirements below govern genuine linguistic sign-off. Do not describe mechanical eligibility or a source citation as native review. All eighteen registered phrases have explicit owner approval. Untranslated expressions do not inherit that approval. See the [phrase expansion gate](docs/grammar/FIXED_PHRASE_EXCEPTIONS.md#expanding-the-register).

## Required approval record

For any lexical candidate, greeting, sentence, dialogue response or alternate accepted answer, record its stable content/lemma/form ID; Pashto; precise English sense; context, speaker and addressee; any local vs written variant; romanisation; reviewer name or identifier and review date; review source/reference; accepted alternatives and rationale; and audio provenance when available. Never invent sign-off. A mechanically complete lexical entry may use the existing explicitly unchecked provisional pathway; new expressions follow the separate phrase activation gate. For native sign-off, `native_approved` still requires documented reviewer evidence.

The lexicon has 473 user-approved base lemmas: 128 previously authored drafts, **301** promoted district drafts, **40** linked universal targets and four explicit existing story-character identities. Each canonical base entry has `userVerified: true` and a scoped `userApproval`; individual form/grammar review flags and uncertainty remain unchanged, with no native-approval claim. Review them in `content/VOCABULARY_REVIEW.csv`; corrections belong in `content/LIBRARY_LEXICON.json`, after which the CSV is regenerated. The three untranslated Day-1 narrative slots and two tutorial Pashto questions remain inactive; see the [wording proposals](docs/grammar/LANGUAGE_PROPOSALS.md).

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

Full authored English targets and editorial context are in `docs/reference/WEEK2_LESSON_DATA.json` and the non-authoritative `docs/reference/WEEK2_DETAILED_LESSONS.md`. Mark resolved issues individually; do not globally remove draft/review flags.

## Audio and device status

An optional `audio/<content-id>.mp3` pack is **not** currently bundled or native-verified. The common player prioritises available MP3 files, then detected Pashto device voices with neural/`ps-AF` preference and delayed discovery, or a clearly warned `ps-AF` fallback. An explicitly unrelated language voice must not be selected as Pashto. Tests of mocked speech selection do **not** prove audio is intelligible or works on a particular physical iPhone/Windows device. Log actual device/browser/voice, phrase ID, intelligibility and pronunciation validation before claiming success.

## Helpful grammatical references (not local dialect sign-off)

- LingDocs: [Verb endings](https://grammar.lingdocs.com/verbs/verb-endings/) and [present verbs](https://grammar.lingdocs.com/verbs/present-verbs/).
- Speaking Pashto: [Lesson four](https://www.speakingpashto.com/lesson-four/) and [lesson seven](https://www.speakingpashto.com/lesson-seven/).

These support systematic review but do not replace a qualified Laghman speaker or verified recordings.

## Current lexical audit and generation exclusions

`content/CURRICULUM_AUDIT.json` reports 473 identities/607 forms, including four existing story-character identities made explicit for individual named-subject/possessor study. The 341 promoted base entries now have explicit user approval; their original candidate provenance, unreviewed inflections and grammar evidence remain intact. `content/VOCABULARY_REVIEW.csv` remains a generated human review register.

The productive generator has 181 eligible surface forms and 29 typed templates across 28 families. Features are explicit contextual analyses of exact authored draft spellings, backed by the researched constraints in `docs/grammar/PASHTO_GENERATION_RULES.md`. Previously missing isolated pronunciation aids have been supplied only where an exact span can be extracted from a cited authored sentence; these aids remain provisional and do not constitute reviewed pronunciation. Original context romanisation and uncertainty records remain available.

Unknown morphology stays null and is never a wildcard. For example, the direct object “Pashto” can participate in a licensed learning predicate while its unknown gender excludes it from gendered descriptions. Named possessors use stored whole oblique chunks; direct-case names are not substituted. Compound verbs preserve their entire attested predicate. No native approval, new lexical stem, invented inflection or recording has been asserted.

`content/GENERATION_AUDIT.json` enumerates exact excluded/partially usable form IDs, missing features, semantic evidence and absent present-conjugation cells. [Capacity and gaps](docs/grammar/GENERATION_COVERAGE.md) are separate from [actual instructional delivery](docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md). There are no authored sentence fallbacks. Only the [eighteen registered conventional expressions](docs/grammar/FIXED_PHRASE_EXCEPTIONS.md) may be taught whole. Masculine cardinal One (the idiom “together” is not cardinal evidence), feminine Two, counted Four/Five, arbitrary noun obliques and unlicensed tenses remain blocked. All combinations, selection preferences and English senses still require human naturalness/dialect review.

The additional window analysis and conjunction license cite exact archived forms; neither guesses a stem or certifies pronunciation. Runtime carries per-form evidence, not complete archived teaching sentences. Archive corrections that affect runtime licenses should update those licenses and use the relevant generation/delivery checks under the [validation policy](tests/README.md#choose-validation-by-change-and-risk).

CSV curriculum proposals and human scheduling approvals are separate from linguistic verification. A worksheet's `verifiedStatus` cannot confer native certification. CSV generation, schedule approval and Markdown edits do not activate pending district candidates, universal targets or narrative expressions. Existing device/audio caveats and required reviewer/date/reference/variant/alternative/audio provenance remain in force.

## Form-specific English recall

Exact infinitive forms with unambiguous “To …” glosses now declare `acceptedEnglishAnswers` for the same gloss without “to”, with formatting-equivalence evidence. This does not certify the gloss or pronunciation. Unannotated atomic slash-separated listed senses now share recall acceptance and distractor exclusion, including infinitive “to” formatting for those explicit listed verbs. A finite gloss such as “He/she reads” or a person-annotated “To live / reside — first person” is not split into incomplete answers. New unlisted synonyms still require item-specific review. The [historical exact-form review queue](docs/maintenance/audit/english-editorial-review.json) records the earlier form IDs/glosses. Explicit unannotated listed-sense handling now covers some base entries; unlisted synonyms and person-annotated alternatives still need item-specific decisions. Unambiguous English-only formatting equivalence can be documented editorially for the same form and sense. New synonyms, changed senses or Pashto variants require item-specific linguistic review; neither pathway certifies an unreviewed Pashto form.

## Scoped owner approval and pronunciation correction

`content/USER_LANGUAGE_APPROVALS.json` is the dated owner-approval authority. Builders reject changed approved wording, sense or transliteration; schema, inventory and CSV distinguish that approval from native review. Both applicable approval types require reviewer, date and reference. Base approval does not approve new English synonyms, morphology, combinations, recordings or the excluded candidates.

The owner supplied `nun` for نن (“today”) in the implementation request. New lexical display and generated practice use it. Exact current-schema frozen assessments may retain the previously attested `nan` aid; the compiler validates the same complete proof and permits only that documented prior aid, without changing text, meaning, forms, grammar, answers or scores. Arbitrary pronunciation edits remain rejected. This is exact schema-7 snapshot preservation, not an old-schema migration.

Grammar reference is now read-only Library material, not a source of assessed English rule/category answers. Approved lexical spelling/senses/transliteration remain unchanged. Terminology-heavy editorial glosses (for example person/gender labels) are not standalone assessment targets; evidenced forms can still participate in eligible generated language contexts. Journal reading itself grants no form study, lesson completion or generation unlocks.
