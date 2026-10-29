# Pashto Quest — Current curriculum and content status

The fixed teaching sequence lives in `content/LEARNING_CURRICULUM.json`; lexical identities and attested forms live in `content/LIBRARY_LEXICON.json`. All instructional clauses are dynamically composed after actual word/form study and grammar unlocks. `content/FIXED_PHRASES.json` lists the only six fixed-expression exceptions. Archived Week 1/2 drafts in `docs/grammar/attestations/` are evidence and regression fixtures, never lesson or assessment fallbacks. `GAME_SPEC.md` owns mechanics; `LANGUAGE_REVIEW.md` owns language approval.

## Learning sequence

| Day | Main focus | Normal narrative opening / key event |
|---|---|---|
| 1 | Greetings and descriptive vocabulary; tutorial of four question types; no newly taught lexical actions | Muhammad Jan in Library, then Home/Lake/Market/School; home handover |
| 2 | He/she, first lexical actions, present verbs and subject–object–verb | Ms Hameed's School workshop; later village visits |
| 3 | I, first-person present | Saleha at Lake; Edris's market/dinner conversation |
| 4 | Informal singular you (`ته`), contrast with I, compound clauses | Muhammad Jan at Home |
| 5 | Respectful/plural you (`تاسې`/`تاسو`), audience selection | Ms Hameed at School; gathering near Lake |
| 6 | We (`موږ`/`مونږ`), compound subjects and contrast with you all | Saleha introduces sister Mina at Lake; Hills final |
| 7 | They (`هغوی`), observed third-person plural, Week 1 synthesis | Edris at Market; Ms Hameed's 25-question Week 1 exam |
| 8 | This/that demonstratives | Saleha at Lake |
| 9 | Noun plurals, agreement and quantities 1–5 | Edris at Market |
| 10 | Here/there/where and spatial expressions | Mina's misplaced notebook |
| 11 | Possession: my/your/our and named possessors | Muhammad Jan at Home |
| 12 | Who/what/which/where/how many | Ms Hameed at School |
| 13 | Time/manner/frequency adverbs | Saleha and Mina |
| 14 | Cumulative investigation/scavenger hunt, no compulsory new words | Integrated four-district narrative and 25-question final |

The four district IDs are `residential`, `nature`, `business` and `school`; player-facing map labels are Home, Lake, Market and School. Library is reference-only, Hills is a Day 6 Nature story scene. Teacher identities, character relationships and speaker/addressee labels are authored. Day 1's mandatory Library tutorial teaches `سلام` (meaning choice), `څنګه یې؟` (Pashto tiles), a gender preference question, then a typed name response. Gender and name are English interface settings, not additional fixed Pashto questions.

Day 1 Home at default pace teaches house, door, room, big, window and open, plus the required evidenced feminine form. Agreement follows word study, then the engine composes house/big, door/open and window/open descriptions for study and tile construction. Other districts are unnecessary for this Home objective. Standard visits deduplicate complete sentence texts across locations and days; explicit revision/replay may repeat them. Later days request four generated study cards per visit when evidence and study permit, with current construction/person goals preferred and cumulative forms retained.

## Vocabulary allocation and identity

- User-selectable daily district-lemma pace: **0, 4, 8, 12, 16, 20 or 24**; fresh-profile default 24. Schema 7 freezes new plans. Valid schema-7 progress is preserved; older schemas are not converted. Nonzero paces divide evenly among four districts. Day 1 maximum is **six distinct nouns/adjectives per district**; action verbs first become teachable on Day 2.
- Every lexeme has one `lemmaId` and potentially multiple `formId`s. Inflections, universal vocabulary, expressions and sentence units are not counted as newly introduced district lemmas. Incidental story exposure is tracked separately from assigned and mastered entries.
- Day 14 assigns **zero new compulsory district lemmas**. Insufficient evidenced, eligible vocabulary must be reported, never silently filled using repeated entries, English-only candidates or fake translations.
- **Current playable draft:** 473 lexical identities/607 forms: 400 district lemmas (100 each for Home, Lake, Market and School) and 73 universal lemmas. “Playable” does **not** mean native-certified.
- **Expansion disposition:** all 301 selected candidates are mechanically complete `provisional_playable` drafts; 59 candidates remain rejected, including 7 existing-sense aliases. No candidate is marked native-approved or user-verified.
- At 24/day, the planner schedules exactly **312** distinct district introductions: six per district on Days 1–13. Each district retains 22 additional entries, and Day 14 remains cumulative review with no compulsory vocabulary.
- `content/UNIVERSAL_TEACHING_TARGETS.json` contains **40 proposed semantic teaching targets** (pronouns, numbers, question words, position, connectors etc.); they are not automatically 40 translated lexical records.

`content/DISTRICT_INVENTORY_REPORT.json` and `node tools/district-inventory.mjs --check` quantify active capacity and projected expansions. Refresh the report after modifying planner/data identities. Language and grammatical review must precede activating candidates. Daily plans freeze vocabulary assignments and seeds. Assessments freeze presentation only for the current attempt: a paused attempt survives intervening study unchanged, while an explicitly new attempt uses current introduced forms and visited grammar. A challenge response does not unlock a workshop.

## Greetings and contextual expressions

`content/NARRATIVE_EXPRESSIONS.json` is the sole authored list of **17 contextual expression slots**. Two exact user-supplied Pashto expressions are **provisionally active**, not native-approved:

| Day/location | Speaker | English context | Pashto status |
|---|---|---|---|
| 1 Home | Muhammad Jan | Welcome! | `ښه راغلاست` — active, provisional |
| 1 Lake | Saleha | What is your name? | Pending |
| 1 Market | Edris | How much is this? | Pending |
| 1 School | Ms Hameed | What is this? | Pending |
| 2 School | Ms Hameed | Good morning! | `سهار مو پخیر!` — active, provisional |
| 3 Lake | Saleha | It's nice to see you | Pending |
| 4 Home | Muhammad Jan | May you not be tired | Pending |
| 5 School | Ms Hameed | Peace be upon you, with response | Pending |
| 6 Lake | Mina | Nice to meet you | Pending |
| 7 Market | Edris | How is business going? | Pending |
| 8 Lake | Saleha | Where have you been? | Pending |
| 9 Market | Edris | Please, come in | Pending |
| 10 Lake | Mina | Excuse me | Pending |
| 11 Home | Muhammad Jan | Make yourself at home | Pending |
| 12 School | Ms Hameed | May I ask a question? | Pending |
| 13 Lake | Saleha | How is your day going? | Pending |
| 14 Home | Muhammad Jan | Good luck! | Pending / optional |

A day's active expression is the **first study card** at each of the four location lessons; a local approved expression has priority, otherwise the day's active opening expression repeats. An active greeting becomes the **first question** of that day's challenge, without increasing its question count or using its lexical quota. Actual visible presentation alone creates the first encounter. Skipping does not pre-teach an unseen phrase. Pending slots are contextual English dialogue, not acquired Pashto, and cannot receive audio or recognition questions as if translated. Old `مننه` (Thank you) and `خدای پامان` (Goodbye) tutorial cards were reassigned to Day 2 Market and Day 3 Home.

## Editorial activation rules

Use `LANGUAGE_REVIEW.md` for exact review evidence. Native Laghman checking is still required for existing Week 1 language, all Week 2 drafts, the 301 provisional candidate entries, the 40 provisional universal targets and 15 pending expressions. The expansion records conventional written-Pashto editorial drafts with mechanical romanisation and explicit uncertainty. `tools/build.py` permits these only under `provisional_playable`; native approval still requires real reviewer evidence.

## Introductions, composition and retention

Every active identity declares planned day, district/universal, order and grammar requirements. These gates differ from actual encounter, individual form study and mastery. `lemma:a-dark` remains Day 5 even if an earlier lesson has shortages. Individual inflected forms and universal grammar words are taught explicitly without district-lemma quota charges. Day 14 introduces neither compulsory district lemmas nor new forms.

Normal lessons teach vocabulary/forms, show missing English grammar prerequisites, then request compositions using actual knowledge. The engine supports 28 families: descriptions, attributives, present SOV and compound predicates, clause coordination, demonstratives, attested plurals/counts, spatial expressions, possession, typed questions and adverbs. No arbitrary stem inflection or authored sentence list is used. Earlier forms stay available as grammar becomes more complex.

All 15-item challenges and 25-item examinations use generated clauses for construction, translation and dialogue, alongside word/English grammar tasks. Dialogue pairs join semantically compatible generated questions and replies; early days use English scene requests with generated responses until Pashto questions are taught. Context preserves teacher, speaker and recipient. Full immutable snapshots preserve questions, choices, tile indices, source forms and syntax across reload/retry.

If a pace or skip route lacks studied forms, the interface reports the deficit and uses word/English grammar tasks. It neither gives extra district lemmas nor prewritten sentence substitutes. Counts and 12/15 or 20/25 pass thresholds remain unchanged. Skip does not introduce forms behind an assessment.

[Measured delivery](docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md) reports actual rendered content; [capacity/gaps](docs/grammar/GENERATION_COVERAGE.md) separately reports potential compositions and exact excluded forms. Masculine cardinal One, feminine Two, counted Four/Five and arbitrary noun obliques remain excluded pending evidence. All language is provisional. Story openings, relationships, Hills, home award, graduation and cumulative revision remain intact.
