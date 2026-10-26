# Pashto Quest — Current curriculum and content status

The 14-day curriculum is implemented as a playable **development draft**. Its authoritative lesson cards, bilingual drafts and dialogue data are `content/WEEK1_RUNTIME.json` and `content/WEEK2_RUNTIME.json`. Lexical identities/forms live in `content/LIBRARY_LEXICON.json`. The 140 English Week 2 semantic targets are retained in `content/WEEK2_LESSON_DATA.json`. This document explains the teaching sequence and pending editorial work without duplicating every sentence. `GAME_SPEC.md` owns game mechanics; `LANGUAGE_REVIEW.md` owns language approval.

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

The four district IDs are `residential`, `nature`, `business` and `school`; player-facing map labels are Home, Lake, Market and School. Library is reference-only, Hills is a Day 6 Nature story scene. Teacher identities, character relationships and speaker/addressee labels are authored. Day 1's mandatory Library tutorial teaches `سلام` (meaning choice), `څنګه یې؟` (Pashto tiles), a gender preference question, then a typed name response. The two question translations introduced for gender/name remain provisional and require local linguistic review.

Week 1 Days 6–7 contain five meaningful context-specific sentences per district, plus the Hills dialogue and a 25-part cumulative examination. Week 2 contains **140 authored sentence targets (5 per district per day)** and **48 contextual question/reply pairs**, with Pashto and romanisation drafts requiring local native review. Editorial background is preserved in `docs/reference/WEEK1_CONTENT_BLUEPRINT.md` and `docs/reference/WEEK2_DETAILED_LESSONS.md`; those are not current implementation instructions.

## Vocabulary allocation and identity

- User-selectable daily district-lemma pace: **0, 4, 8, 12, 16, 20 or 24**; default 20. Nonzero paces divide evenly among four districts. Day 1 maximum is **six distinct nouns/adjectives per district**; action verbs first become teachable on Day 2.
- Every lexeme has one `lemmaId` and potentially multiple `formId`s. Inflections, universal vocabulary, expressions and sentence units are not counted as newly introduced district lemmas. Incidental story exposure is tracked separately from assigned and mastered entries.
- Day 14 assigns **zero new compulsory district lemmas**. Insufficient verified vocabulary must be reported, never silently filled using repeated entries, English-only candidates or fake translations.
- **Current playable draft:** 128 distinct lexical identities/224 forms, of which 99 are district lemmas (Home 22, Lake 27, Market 29, School 21) and 29 are universal. “Playable” does **not** mean native-certified.
- **Pending district target:** 400 balanced draft/projected identities (100 per district), via 301 selected yet inactive candidates: Home +78, Lake +73, Market +71, School +79. The initial 360 English candidates include 59 excluded selections; 7 of the exclusions are existing-sense aliases. These numbers describe candidates, not translations.
- At 24/day across 13 new-word days, **312** introductions are needed, already **213** more than the current 99 district lemmas before incidental exposure/district constraints. The synthetic 400-entry allocation check does **not** establish that new Pashto is approved or currently available.
- `content/UNIVERSAL_TEACHING_TARGETS.json` contains **40 proposed semantic teaching targets** (pronouns, numbers, question words, position, connectors etc.); they are not automatically 40 translated lexical records.

`content/DISTRICT_INVENTORY_REPORT.json` and `node tools/district-inventory.mjs --check` quantify active capacity and projected expansions. Refresh the report after modifying planner/data identities. Language and grammatical review must precede activating candidates.

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

Use `LANGUAGE_REVIEW.md` for exact review evidence. Native Laghman checking is still required for existing Week 1 language, all Week 2 drafts, the 301 candidate selections, the universal target plan and 15 pending expressions. Preserve standard written Pashto when local pronunciation is uncertain, record acceptable equivalents deliberately, and never infer dialect approval from programmatic tests. Add complete Pashto, romanisation, accurate gloss, person/number/context, audio ID and reviewer/provenance before activating an unapproved expression or new candidate. Automated `tools/build.py` gates prevent incomplete candidate promotion.

## Intentional introductions and retention practice

Every active identity now declares its planned first teaching day, district (or universal), teaching order and required grammar in `content/LIBRARY_LEXICON.json`. These are explicit editorial decisions, not inferred live assignments from an old authored loop or worksheet. Basic nouns/descriptions are eligible on Day 1; action citations start at School on Day 2; finite forms have separate person/number grammar gates. For example `lemma:a-dark` stays planned for Day 5 even when an earlier day has shortages. Formal first introduction, grammar eligibility and actual player study are separate facts.

The dataset retains all 127 former IDs and adds `lemma:pronoun:third-person` for the existing personal use of `هغه` (he/she), previously incorrectly linked to the demonstrative “that/those” identity. It is universal and does not increase district supply. Numbers, demonstratives, pronouns, interrogatives and adverbs now have lexical categories rather than generic POS “grammar”. The idiom `یو ځای` (Together) no longer incidentally introduces cardinal One through a component self-count; mapped idiom corrections are recorded in the lexicon.

At lower paces, eligible unassigned items retain their curated order on later days; future-stage items are never brought forward to satisfy quota. Frozen past assignments are not counted a second time as new. All seven paces, including zero, are selectable even with content shortages. Coverage for each pace/day/district, stable assignment IDs and missing quota counts is in `content/DISTRICT_INVENTORY_REPORT.json`. A zero-pace or exhausted day can still complete its narrative visits using already known reference/review material.

Authored lesson/assessment records are retained verbatim. Productive practice is retimed where a component's introduction or inflection belongs later (for example nominal plural teaching); earlier eligible authored sentences provide fallbacks. Lessons can also add controlled cumulative descriptions from individually studied forms. The frame's nine enabled tuples include `کور لوی دی.` (“The house is big.”), `کتاب نوی دی.` (“The book is new.”), and the new composed drafts `کور نوی دی.` (“The house is new.”), `بازار نوی دی.` (“The market is new.”), `کتاب لوی دی.` (“The book is big.”). These exemplify a tightly bounded masculine-singular frame, not free substitution or native approval. All fourteen narrative openings, characters/relationships, Hills scene, home award and examinations remain.
