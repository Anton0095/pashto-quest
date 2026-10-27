# Pashto linguistic review and release gate

**Status: not native-certified.** The game targets Afghan Pashto as spoken in **Laghman**. Conventional Pashto spelling is preferred when local variants are uncertain. Existing Pashto, romanisation and authored Week 1/2 translations are instructional drafts; neither a browser voice nor passing tests establishes native-speaker review.

## Required approval record

For any lexical candidate, greeting, sentence, dialogue response or alternate accepted answer, record its stable content/lemma/form ID; Pashto; precise English sense; context, speaker and addressee; any local vs written variant; romanisation; reviewer name or identifier and review date; review source/reference; accepted alternatives and rationale; and audio provenance when available. Never invent sign-off. A complete entry may be playable as an explicitly unchecked provisional draft; `native_approved` still requires documented reviewer evidence.

The lexicon has 469 draft lemmas: 128 previously authored drafts plus **301** newly promoted district drafts and **40** newly linked universal targets. Every new item has `userVerified: false`, mechanical uncertainty notes and no native-approval claim. Review them in `content/VOCABULARY_REVIEW.csv`; corrections belong in `content/LIBRARY_LEXICON.json`, after which the CSV is regenerated. The 15 untranslated narrative expression slots remain inactive.

## Phonology, orthography and grammar checklist

- Validate `موږ / مونږ` for “we”, `تاسې / تاسو` for polite/plural “you”, and informal `ته` with explicit speaker/listener number and politeness. Select consistent written standards and deliberately approved variants.
- Check present-tense agreement and actual verb stems, not a universal suffix rule: `ـم`, `ـې`, `ـي`, `ـو`, `ـئ`, `ـي` may overlap; third-person plural is often distinguished by subject/context. Irregular and compound verbs such as `تلل`, `منډې وهل`, `کښېناستل`, `اخیستل`, `څښل`, `لوستل`, `لیکل` and `پاکول` merit individual checks.
- Validate SOV, postpositions, object marking, gender/number agreement, noun plurals/obliques, sensible everyday collocations and named compound subjects. `مینا او زه` includes the player in “we”; “they” describes an outside group.
- Romanisation must be consistently usable by beginners on phones; review vowel distinctions, aspirated sounds and local pronunciation instead of silently mixing dialect systems.
- A quiz should accept only intentionally approved equivalent forms/orderings. Do not accept arbitrary permutations, strip important inflections, or add dialect variants without explicit teaching/reviewer evidence. Keep distractor and dud-tile answers genuinely wrong in context.

## High-priority authored review queue

Week 1 Days 6–7: review `w6-river-run` / `w6-river-mina-run` / `w6-we-run` (lake/river, running, singular vs plural); `w6-river-you-walk` and `w6-walk` (respectful/plural agreement); `w6-house-help` and `w7-house-help` (help + Muhammad Jan); `w6-house-chairs` / `w7-house-chairs` (chair obliques); `w6-market-*` / `w7-market-*` (baskets, carrying, vegetable collocations); `w6-school-answer` / `w7-school-answer` (questions/answers); `w6-compound`, `w7-compound-*` (coordination), `w7-i-read` / `w7-you-read` / `w7-all-read` (person distinctions). Verify Week 1 exam contexts for `موږ`, `تاسې` and `هغوی`.

Week 2 `content/WEEK2_RUNTIME.json`: 140 sentence cards (`w2-d8-<zone>-1` through `w2-d14-<zone>-5`) and 48 NPC question/reply records (`w2-d8-reply-1` through `w2-d14-reply-12`, with actual per-day ranges defined in runtime). All are drafts marked for native review; no `acceptedPs` alternatives have been approved. Review by day:
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

`content/CURRICULUM_AUDIT.json` reports all 469 identities/565 forms, exact senses/POS/roles/traits, intended introductions, provenance, uncertainty, retimed cards and composition exclusions. `content/VOCABULARY_REVIEW.csv` mirrors every active district and universal lemma for human editing; it is generated output, not a runtime database.

Unknown morphology stays null. Source-level uncertainty such as “plural or oblique”, the bird/children citation anomalies and sell-lexeme synonym candidates requires individual human decisions. Sentence-level romanisation formerly attached to isolated finite forms is preserved as `contextRomanisation`, not falsely presented as that form's own pronunciation. The nine originally blank form romanisations remain unresolved; additional sentence-only romanisation is now correctly flagged too. These forms cannot enter composition.

Only ten forms currently have feature evidence for the restricted masculine-singular description frame; 214 forms are excluded from generation. Six outputs are exact authored examples; three are new constrained compositions using the same attested features and an explicit semantic whitelist. “Feature-vetted draft” means mechanically consistent with those sources, **not native-certified**. The frame and all language retain pending native review. There is no licensed lexical-verb, oblique/plural, possessive or negative sentence frame yet. Do not extrapolate a paradigm from a citation or promote a form merely because a property test passes.

CSV curriculum proposals and human scheduling approvals are separate from linguistic verification. A worksheet's `verifiedStatus` cannot confer native certification. No pending district candidate, universal target or narrative expression is activated by these changes. Existing device/audio caveats and required reviewer/date/reference/variant/alternative/audio provenance remain in force.
