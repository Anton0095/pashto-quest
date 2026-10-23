# Week 2 content review and implementation status

The playable **development preview** integrates all 140 English targets from `WEEK2_LESSON_DATA.json`. Each has a complete authored Pashto draft, approximate romanization, stable ID, speaker/recipient and review metadata in `WEEK2_RUNTIME.json`. There are also 48 authored NPC question/answer pairs, each with explicit scene context and at least two distinct single-word distractors. They are not merely the 12 supplied illustrative examples relabelled as a full question pool.

**No local native-speaker review has occurred.** All 140 cards and all 48 replies retain `needs_native_review`; none has approved alternative responses. The UI labels Week 2 draft status on world, opening, lesson and challenge surfaces. This is a reviewable implementation, not a language-certified production release. No audio pack is supplied, and dialogue pronunciation controls stay hidden without an actual audio mapping.

## Review inventory

- Cards: `w2-d8-<zone>-1` through `w2-d14-<zone>-5`, with zones `house`, `river`, `market`, `school` (140 records).
- Replies: `w2-d8-reply-1..4`, `d9:1..5`, `d10:1..6`, `d11:1..6`, `d12:1..7`, `d13:1..8`, `d14:1..12` (48 records).
- Vocabulary: the `vocabulary` arrays of each day. Review noun labels, numbers and regional reading aids as well as sentences.
- No reviewer identities, sign-offs or native audio claims have been fabricated. The existing Week 1 duplicate `a-clean` ID remains untouched.

## Highest-priority linguistic checks

| Records | Check |
|---|---|
| Day 8 | Near/far `دا / هغه`, feminine/plural agreement, tree oblique `ونې`, lake terminology `جهیل`, and the two different uses of `هغه` in “She reads that book.” |
| Day 9 | Feminine counts `یوه مرغۍ / یوه کوټه`, counted plurals, classroom student expression, plural adjectives/equatives, numbers 1–5 |
| Day 10 | `پر مېز`, `په ټولګي کې`, `د دروازې تر څنګ`, movement `ښوونځي ته ځي`, demonstrative oblique `په دې کوټه کې`; local naturalness of here/there/location clues |
| Day 11 | Possessor inflection `د صالحې`, respectful/plural `ستاسې`, `زموږ`, reflexive `خپله ټوکرۍ`, speaker-relative my/your/our |
| Day 12 | `کوم / کومه`, `څو`, `د چا`, person agreement, matching the precise NPC question to a unique scene-supported response |
| Day 13 | `ورو ورو` vs `وړو`, `ژر` fast/soon interpretation, `تل / کله کله / هره ورځ`, alternative adverb placement; keep all taught verb forms present tense |
| Day 14 | Distal feminine oblique `پر هغې څوکۍ`, integrated ownership/count/location clues, inherited question contexts and speaker identity |
| All | Standard spelling, regional Laghman usage, reading-aid consistency, dud plausibility, harmless punctuation normalization and potential valid answer alternatives |

Examples are internally checked for meaning, person, speaker and required tiles; automated checks do not establish local language accuracy. A qualified reviewer should record each ID, proposed correction, reviewer/date and any explicitly approved equivalent answer. Populate `acceptedPs` only after such review; do not globally strip inflections or accept arbitrary word orders.

## Editing and offline deployment

Edit `WEEK2_RUNTIME.json`, then run `python3 tools/embed_week2.py` from the repository root. `python3 tools/embed_week2.py --check` verifies synchronization. The builder retains Week 1 data and safely embeds JSON in the single HTML file; browsers never fetch the content JSON. The original English content plan stays authoritative for semantic targets.

The supplied interaction patch applied cleanly to commit `23850c7`. Integration additionally permits dialogue questions in the tile renderer, connects navigation/content, decorates mixed script across quiz surfaces and keeps Week 2 completion out of Week 1 milestone calculations. Reapplying the original patch to the integrated game correctly aborts rather than duplicating it.
