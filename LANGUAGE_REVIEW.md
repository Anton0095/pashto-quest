# Pashto grammar and Laghman pronunciation review

This is a **quality checklist**, not a statement that all in-game phrases were validated by a native speaker. Grammar references help with standard Pashto present-tense forms; they do not alone establish authentic local speech in Laghman.

## Grammar resources for implementation

- LingDocs, **Verb Endings**: https://grammar.lingdocs.com/verbs/verb-endings/ — present-person suffixes (`ـم`, `ـې`, `ـي`, `ـو`, `ـئ`, `ـي`).
- LingDocs, **Present Verbs**: https://grammar.lingdocs.com/verbs/present-verbs/ — present stems and paradigms; supports careful differentiation of `I`, `we`, `you all`.
- Speaking Pashto, **Lesson Four**: https://www.speakingpashto.com/lesson-four/ — informal singular `ته` versus respectful/plural `تاسو`, with corresponding conjugation.
- Speaking Pashto, **Lesson Seven**: https://www.speakingpashto.com/lesson-seven/ — pronouns and forms with adpositions; may be more relevant as vocabulary expands.

## Priority items for native Laghman review

1. **Written vs spoken variants:** `موږ / مونږ` for “we”, `تاسې / تاسو` for respectful/plural “you”; pick a consistent written standard while accepting valid local alternates in recall where appropriate.
2. **Verbs:** `منډې وهل`, `تلل`, `کښېناستل`, `اخیستل`, `څښل`, `لوستل`, `لیکل`, `پاکول`, etc. Validate person/number conjugations from their actual stems and their fit in the sentence; some stems are irregular.
3. **Third plural:** do not assume a universal suffix distinguishes third-person singular from third-person plural in the present tense; many paradigms share `ـي`. Teach “they” primarily through `هغوی` and context.
4. **Natural collocations:** use semantically plausible subject–verb combinations (people run, doors open, customers buy fruit). Verify postpositions, compounds, object marking, plural forms, word order and politeness.
5. **Romanisation:** consistently represent vowel distinctions and aspirated/consonant sounds in a way playable on a beginner's phone; don't silently mix incompatible dialect notation.
6. **Audio availability:** the game can attempt `audio/<word-id>.mp3`, but a generated audio pack is not automatically bundled. Use human-reviewed recordings where feasible. A compatible browser Pashto TTS voice is a fallback only; avoid reading Pashto through a different-language voice.
7. **Assessment fairness:** allow objectively equivalent dialect spelling or acceptable word order where grammatically and contextually valid, or revise the prompt to make exactly one intended answer unambiguous. Tile construction should not reject meaningful alternatives without an explicit teaching rationale.

A release-quality language review should record each disputed phrase's word ID, current Pashto string, meaning, local alternative, reviewed speaker/date, and accepted quiz answers. Codex must not invent a native speaker validation record.

## New implementation review queue — 23 October 2026

No native-speaker sign-off has been obtained. All added `w6-*`, `w7-*` and `vocab6-*`/`vocab7-*` records include Pashto and approximate reading aids and remain review candidates. Particular priorities:

| IDs / pattern | Pashto examples | Review focus |
|---|---|---|
| `w6-river-run`, `w6-river-mina-run`, `w6-we-run` | زه د جهیل تر څنګ منډې وهم؛ مینا او زه یو ځای منډې وهو | Lake terminology, running collocation, singular/plural forms and romanisation |
| `w6-river-you-walk`, `w6-walk` | تاسې دواړه د سیند تر څنګ ګرځئ؛ موږ د جهیل تر څنګ یو ځای ګرځو | “You both” audience, walking expression and local lake/river terminology |
| `w6-house-help`, `w7-house-help` | له محمد جان سره مرسته کوئ / کوي | Help construction, respectful reference and present forms |
| `w6-house-chairs`, `w7-house-chairs` | پر څوکیو کښېنو / کښېني | Chair plural/oblique and sitting verb forms |
| `w6-market-*`, `w7-market-*` | ټوکرۍ وړو / وړي؛ تازه سابه غوره کوي | Carrying/choosing forms, baskets, vegetables and dinner vocabulary |
| `w6-school-answer`, `w7-school-answer` | پوښتنو ته ځوابونه ورکوو / ورکوي | Natural answer collocation, obliques and inflection |
| `w6-compound` | زه سیند وینم او موږ غونډۍ وینو | Hills noun/number and clause coordination |
| `w7-compound-*` | موږ سابه اخلو او هغوی ډوډۍ اخلي | Person agreement, natural compound wording and canonical tile order |
| `w7-i-read`, `w7-you-read`, `w7-all-read` and exam clozes | لولم / لولې / لولو / لولئ / لولي | Reading forms and consistency of learner romanisation |
| Grammar openings / choice distractors | موږ / مونږ؛ تاسې / تاسو؛ هغوی | Consistent written standard, shared third-person endings, unambiguous distractors |

The renderer identifies NPC teaching prompts separately from the player's model responses: “Mina and I” has the player as “I”. Day 7 observed groups are explicitly outside the speaker/player conversation. Review these referents alongside the text. Audio filenames are attempted at `audio/<id>.mp3`; there are no bundled recordings, synthesized pronunciation claims or dialect certification.
