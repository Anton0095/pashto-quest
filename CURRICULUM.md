# Pashto Quest — Current curriculum and content status

> **Integrated user approval (31 October 2026):** [approval record](content/USER_LANGUAGE_APPROVALS.json) covers all 473 base lemmas and 18 conventional phrases. نن (“today”) uses the subsequently supplied `nun`. This approves exact base spelling, listed senses and supplied transliteration; inflections, grammatical analyses, generated combinations, recordings and 59 excluded candidates remain outside its scope. No independent native certification is claimed.

The fixed teaching sequence lives in `content/LEARNING_CURRICULUM.json`; lexical identities and attested forms live in `content/LIBRARY_LEXICON.json`. All instructional clauses are dynamically composed from licensed forms and grammar. Normal lessons introduce them through study; activating a challenge explicitly unlocks that day’s assigned material before question generation. `content/FIXED_PHRASES.json` lists the eighteen currently registered fixed-expression exceptions (see its [expansion gate](docs/grammar/FIXED_PHRASE_EXCEPTIONS.md#expanding-the-register)). Archived Week 1/2 drafts in `docs/grammar/attestations/` are evidence and regression fixtures, never lesson or assessment fallbacks. `GAME_SPEC.md` owns mechanics; `LANGUAGE_REVIEW.md` owns language approval.

The sequence below covers Days 1–14 in the educational engine. The playable RPG registers Days 1–7 only; Days 8–14 still require narrative, map and event registration. A challenge pass grants educational completion/access; the active RPG chapter advances only through sleep after narrative acknowledgements and successor eligibility, with no paused retry. Dream practice rehearses passed, registered days in a disposable copy and grants no persistent learning or campaign progress. See [mechanics](GAME_SPEC.md#rpg-house-sleep-and-dream-review), [world architecture](docs/rpg/RPG_ARCHITECTURE.md) and [maintenance findings](docs/maintenance/POST_MERGE_AUDIT.md).

**Character naming:** Deena (`saleha`) and Medina (`mina`, Deena's younger sister) keep the existing teaching identities and sequence. Bilal (fisherman, unresolved mysterious catch), Zamir (inspecting market stalls) and children Nayab, Sara, Omar, Afiya and Sanaa are implemented optional village-life NPCs, not new lesson teachers. Refer to the [cast specification](docs/rpg/CHARACTER_EXPANSION.md) and [implementation and validation](docs/rpg/LIVING_VILLAGE.md). Days 8–14 below remain educational content with future RPG registrations.

## Learning sequence

| Day | Main focus | Normal narrative opening / key event |
|---|---|---|
| 1 | Greetings and descriptive vocabulary; tutorial of four interactions; no newly taught lexical actions | Muhammad Jan in Library, then Home/Lake/Market/School; home handover |
| 2 | He/she, first lexical actions, present verbs and subject–object–verb | Ms Hameed's School workshop; later village visits |
| 3 | I, first-person present | Deena at Lake; Edris's market/dinner conversation |
| 4 | Informal singular you (`ته`), contrast with I, compound clauses | Muhammad Jan at Home |
| 5 | Respectful/plural you (`تاسې`/`تاسو`), audience selection | Ms Hameed at School; gathering near Lake |
| 6 | We (`موږ`/`مونږ`), compound subjects and contrast with you all | Deena introduces sister Medina at Lake; Hills final |
| 7 | They (`هغوی`), observed third-person plural, Week 1 synthesis | Edris at Market; Ms Hameed's 25-question Week 1 exam |
| 8 | This/that demonstratives | Deena at Lake |
| 9 | Noun plurals, agreement and quantities 1–5 | Edris at Market |
| 10 | Here/there/where and spatial expressions | Medina's misplaced notebook |
| 11 | Possession: my/your/our and named possessors | Muhammad Jan at Home |
| 12 | Who/what/which/where/how many | Ms Hameed at School |
| 13 | Time/manner/frequency adverbs | Deena and Medina |
| 14 | Cumulative investigation/scavenger hunt, no compulsory new words | Integrated four-district narrative and 25-question final |

The four district IDs are `residential`, `nature`, `business` and `school`; player-facing map labels are Home, Lake, Market and School. Library offers reference and voluntary zero-XP practice, Hills is a Day 6 Nature story scene. Teacher identities, character relationships and speaker/addressee labels are authored. Day 1's mandatory Library tutorial teaches `سلام` (meaning choice), `څنګه یې؟` (translation selection), the Pashto language-selection question `ته کومه ژبه زده کوې؟` (select `پښتو`), then `زما نوم څه دی؟` (type Muhammad Jan in English). The two authored questions are recorded in [TUTORIAL_PROMPTS.json](content/TUTORIAL_PROMPTS.json). Player name and gender are optional Library → Player Profile settings, not tutorial questions.

Day 1 Home at default pace teaches house, door, room, big, window and open, plus the required evidenced feminine form. Agreement follows word study, then the engine composes house/big, door/open and window/open descriptions for study and tile construction. Other districts are unnecessary for this Home objective. Standard visits deduplicate complete sentence texts across locations and days; explicit revision/replay may repeat them. Later days request four generated study cards per visit when evidence and study permit, with current construction/person goals preferred and cumulative forms retained.

## Vocabulary allocation and identity

- User-selectable daily district-lemma pace: **0, 4, 8, 12, 16, 20 or 24**; fresh-profile default 24. Schema 7 freezes new plans. Valid schema-7 progress is preserved; older schemas are not converted. Nonzero paces divide evenly among four districts. Day 1 maximum is **six distinct nouns/adjectives per district**; action verbs first become teachable on Day 2.
- Every lexeme has one `lemmaId` and potentially multiple `formId`s. Inflections, universal vocabulary, expressions and sentence units are not counted as newly introduced district lemmas. Incidental story exposure is tracked separately from assigned and mastered entries.
- Day 14 assigns **zero new compulsory district lemmas**. Insufficient evidenced, eligible vocabulary must be reported, never silently filled using repeated entries, English-only candidates or fake translations.
- **Current playable inventory:** 473 lexical identities/607 forms: 400 district lemmas (100 each for Home, Lake, Market and School) and 73 universal lemmas. “Playable” does **not** mean native-certified.
- **Expansion disposition:** all 301 selected candidates were promoted as mechanically complete provisional drafts and their canonical base entries are now user-approved; 59 candidates remain rejected, including 7 existing-sense aliases. The canonical promoted base entries are user-approved; candidate/archive provenance is retained without relabelling excluded candidates. None is independently native-certified.
- At 24/day, the planner schedules exactly **312** distinct district introductions: six per district on Days 1–13. Each district retains 22 additional entries, and Day 14 remains cumulative review with no compulsory vocabulary.
- `content/UNIVERSAL_TEACHING_TARGETS.json` contains **40 proposed semantic teaching targets** (pronouns, numbers, question words, position, connectors etc.); they are not automatically 40 translated lexical records.

`content/DISTRICT_INVENTORY_REPORT.json` and `node tools/district-inventory.mjs --check` quantify active capacity and projected expansions. Refresh the report after modifying planner/data identities. Mechanical completeness, evidence and grammar eligibility gate provisional lexical activation under [LANGUAGE_REVIEW.md](LANGUAGE_REVIEW.md#status-terms). Provisional activation is not native approval and does not activate incomplete candidates or pending phrases. Daily plans freeze vocabulary assignments and seeds. Assessments freeze presentation only for the current attempt: a paused attempt survives intervening study unchanged, while an explicitly new attempt activates the frozen day material before using licensed forms and grammar. A challenge response does not unlock a workshop. Challenge activation unlocks the day’s missed assigned material and prerequisite grammar, with challenge-start provenance and no invented study grades. A pass still controls location completion, bonuses and access to the next day.

## Greetings and contextual expressions

`content/NARRATIVE_EXPRESSIONS.json` is the sole authored list of **14 approved daily expressions**. Fourteen exact user-approved Pashto expressions are active, without independent native certification:

| Day/location | Speaker | English context | Pashto status |
|---|---|---|---|
| 1 residential | Muhammad Jan | Welcome! | `ښه راغلاست` — user-approved |
| 2 school | Ms Hameed | Good morning! | `سهار مو پخیر!` — user-approved |
| 3 nature | Deena | It’s nice to see you | `خوشحاله یم چې تاسې وینم.` — user-approved |
| 4 residential | Muhammad Jan | May you not be tired | `ستړي مه شئ.` — user-approved |
| 5 school | Ms Hameed | Peace be upon you | `السلام علیکم.` — user-approved |
| 6 nature | Medina | Nice to meet you | `ستاسې په لیدو خوشحاله شوم.` — user-approved |
| 7 business | Edris | And peace be upon you | `وعلیکم السلام.` — user-approved |
| 8 nature | Deena | Where have you been? | `چېرته وئ؟` — user-approved |
| 9 business | Edris | Please, come in | `مهرباني وکړئ، دننه راشئ.` — user-approved |
| 10 nature | Medina | Excuse me | `وبخښئ.` — user-approved |
| 11 residential | Muhammad Jan | Make yourself at home | `دا خپل کور وګڼئ.` — user-approved |
| 12 school | Ms Hameed | May I ask a question? | `اجازه شته چې یوه پوښتنه وکړم؟` — user-approved |
| 13 nature | Deena | How is your day going? | `ورځ مو څنګه تېرېږي؟` — user-approved |
| 14 residential | Muhammad Jan | Good luck! | `بریالي اوسئ!` — user-approved |

A day's active expression (including the optional Day-14 greeting) is the **first study card** at each of the four location lessons; the same daily greeting is shared across the four locations. An active greeting becomes the **first question** of that day's challenge, without increasing its question count or using its lexical quota. Visible presentation creates an encounter; challenge activation also makes missed location phrases available without practice grades. Availability does not claim actual phrase study; new expression questions select English translations. The removed alternatives remain historical editorial evidence and are not lesson or Library entries. Old `مننه` (Thank you) and `خدای پامان` (Goodbye) tutorial cards were reassigned to Day 2 Market and Day 3 Home.

## Editorial activation rules

Use `LANGUAGE_REVIEW.md` for exact review evidence. Native Laghman checking is still required for existing Week 1 language, all Week 2 drafts, the 301 provisional candidate entries and the 40 linked universal targets. The expansion records conventional written-Pashto editorial drafts with mechanical romanisation and explicit uncertainty. The canonical base entries now use `user_approved`; unshown forms remain provisional. Native approval still requires real reviewer/date/reference evidence.

## Introductions, composition and retention

Every active identity declares planned day, district/universal, order and grammar requirements. These gates differ from actual encounter, individual form study and mastery. `lemma:a-dark` remains Day 5 even if an earlier lesson has shortages. Individual inflected forms and universal grammar words are taught explicitly without district-lemma quota charges. Day 14 introduces neither compulsory district lemmas nor new forms.

Normal lessons teach vocabulary/forms, show missing English grammar prerequisites, then request compositions using actual knowledge. The engine supports 28 families: descriptions, attributives, present SOV and compound predicates, clause coordination, demonstratives, attested plurals/counts, spatial expressions, possession, typed questions and adverbs. No arbitrary stem inflection or authored sentence list is used. Earlier forms stay available as grammar becomes more complex.

When introduced/unlocked forms and grammar permit, 15-item challenges and 25-item examinations use generated clauses for construction, translation and dialogue, alongside vocabulary/approved phrase practice. Dialogue pairs join semantically compatible generated questions and replies as compiler material. Every construction screen presents a direct English target and the common Pashto tile interaction; teacher and recipient context belongs to broader study/story presentation. Full immutable snapshots preserve questions, choices, tile indices, source forms and syntax across reload/resume and correction of the same item; [explicitly new assessments](GAME_SPEC.md#attempt-terminology) recalculate current eligibility.

If a pace or skip route lacks studied forms, the interface reports the deficit and uses vocabulary/approved phrase practice. It neither gives extra district lemmas nor prewritten sentence substitutes. Counts and 12/15 or 20/25 pass thresholds remain unchanged. Activation unlocks the same shared lesson pools and day grammar before assessment generation, preserving frozen assignments, pace and Day-14 exclusions. Once active, questions remain frozen.

[Measured delivery](docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md) reports actual rendered content; [capacity/gaps](docs/grammar/GENERATION_COVERAGE.md) separately reports potential compositions and exact excluded forms. Masculine cardinal One, feminine Two, counted Four/Five and arbitrary noun obliques remain excluded pending evidence. Base wording is user-approved; morphology and composed language remain provisional. Story openings, relationships, Hills, home award, graduation and cumulative revision remain intact.

Optional English name/gender controls are implemented in Library Player Profile. A fuller Pashto profile conversation and contextual greeting sequence remain planned. The three former Day-1 alternative slots have been removed; see [delivery status](README.md#product-goal-and-delivery-status). Pending English targets are not permission to teach or assess invented Pashto.

Days 5 and 7 teach the peace exchange: the character says `السلام علیکم.` and the player replies `وعلیکم السلام.`. One response identity is introduced on Day 5 and reused on Day 7. New response assessments use Pashto-to-English translation selection, including unseen phrases. Neither increases challenge length or district quotas. The removed Day-1 contextual proposals remain [historical editorial evidence](docs/grammar/LANGUAGE_PROPOSALS.md). That document also retains two superseded profile-question proposals as historical evidence; they are separate from the approved replacement onboarding questions.

All fourteen days assess practical Pashto rather than grammatical terminology. The Library Grammar Journal exposes all 33 concept explanations/worked analyses and all curriculum-day rules as read-only reference, without completing lessons or unlocking forms/grammar. Actual lesson study/workshops or explicit challenge activation license generated Pashto examples. When sentence supply is insufficient, vocabulary or approved phrases preserve assessment length; a small pool may repeat. Earlier English assessment-fallback instructions are superseded.


New challenges open with three recognition/construction activities; fixed expressions always use English translation selection. Later unstudied lexical recall remains typed, with recognition used to separate adjacent typed items. Recognition does not claim prior study. Existing frozen attempts retain their exact questions until completed; the new rules apply to new attempts. Day transitions through bed/Quick travel wake beside the bed, while resuming retains the saved position. Muhammad Jan provides optional progress-sensitive guidance alongside his normal lessons. See [implementation and targeted validation](docs/rpg/DAILY_FLOW.md).

Daily opening content belongs to the designated NPC interaction, with an explicit study/explore choice. It does not run on waking or area entry. Quick Travel can begin an unlocked lesson directly; it uses the same course pool, eligibility and rewards as the NPC choice. Completed lessons are labelled as reviews. Existing follow-up dialogue remains available when the player next speaks with its teacher.
