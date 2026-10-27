# Pashto Quest — Current game specification

**Status:** Current fourteen-day gameplay design, 25 October 2026. This is a behavioural specification of the current source, not a to-do list or handoff from an earlier release. Implementation truth resides in `src/` and playable `content/*RUNTIME.json`; resolve any discrepancy explicitly rather than restoring archived logic. For learning content see `CURRICULUM.md`; for acceptance and tests see `tests/README.md`.

## Product and world

A single-file, keyboard/mobile-aware, primarily text-and-map Pashto learning game. Four canonical teaching districts: `residential` (Home), `nature` (Lake), `business` (Market), `school` (School). Library is an always-open reference scene and does not count as a teaching visit, XP action or fifth quota. Hills is a Day 6 Nature finale, not a fifth map location. Characters may visit other districts from Day 5 onward. Muhammad Jan (village elder), Edris (shopkeeper), Saleha (fellow student), Mina (Saleha's sister, introduced Day 6) and Ms Hameed (teacher) retain their relationships and contextual speaker/addressee distinctions. Normal mode keeps each day's authored opening. Skip mode bypasses visits and normally forced openings.

## Onboarding and navigation

1. Day 1 begins with Muhammad Jan's guided Library tutorial of **four study/interaction cards**: `سلام` → choose English meaning; `څنګه یې؟` → assemble Pashto word tiles; provisional gender question `ستاسو جنسیت څه دی؟` → choose male/female/prefer not to say; provisional name question `ستا نوم څه دی؟` → type chosen name (nonempty, at most 40 characters).
2. The four interactions explain how to answer future questions. After completion, save `playerProfile` alongside `tutorialDone`. A tutorial replay may change the profile. The older Thank you and Goodbye greetings are taught later (Day 2 Market and Day 3 Home).
3. Only the Day 1 tutorial is a mandatory prerequisite to the initial skip action. On Days 2–14 the end-of-day challenge can be attempted immediately, including with zero visits.
4. Normal routes retain authored opening teacher and visit order. Skipping never creates unseen visit completion, encounters, mastered words or lesson XP. A passed challenge advances the day even if optional visits were skipped.
5. World and lesson screens put the map above accompanying word/lesson information. During lessons, the taught text precedes speaker/guide information; avoid reintroducing obsolete green speech-bubble presentation.

## Questions, teaching and SRS

- Fixed authored sentences, teacher/recipient context, Pashto script, beginner romanisation and English meanings remain linked to stable IDs. Distinct lexical lemmas are counted once regardless of inflected forms or how often a word appears in dialogue.
- `LibraryEngine` is the single authority for exposure, acquisition, form identity, shared spaced repetition, planner selection and due review. Acquired/encountered, correctly practiced and mastered are different states. Displaying a lesson is not mastering it.
- Four districts request 1–6 **new distinct district lemmas** each for daily paces of 4–24, selecting only the eligible curated prefix; actual supply can be lower. Optional pace zero assigns no new district lemmas. A plan freezes once started; changing pace does not reroll it. Report shortfalls explicitly.
- Day 1 excludes lexical action verbs from assignment, exposure, review and question selection. Day 2 School introduces verbs and subject–object–verb construction. Day 14 introduces no compulsory new lexical entries. Universal lexemes, derivational/inflectional forms and fixed phrases do not consume district quotas.
- Normal lesson sequence begins with the day's active greeting as its first study card in each teaching district (the local active expression takes priority), followed by appropriate grammar, new vocabulary, sentences and review. A day's active greeting is first in its daily challenge. Pending English-only phrases are not silently turned into playable Pashto or recognition prompts.
- When a skip presents previously **unstudied** Pashto vocabulary in a challenge, show Pashto script, romanisation and “Not previously studied”, but **not the English definition before submission**. Recognition choices may display English answers; feedback may show meaning after the first scored submission. Freeze prompt direction/presentation in the saved attempt.
- Choice, word tiles (including indexed duplicates, dud distractors, undo/clear), translation, context/dialogue and other authored question types retain first-submission scoring. Wrong answers change SRS, not retroactive challenge score; retries cannot farm first-answer XP.
- Library Vocabulary Bank, Universal Vocabulary, Grammar Journal, expressions and voluntary practice are reference/practice functions. Voluntary Library review grants no XP; contextual fixed expressions use nonlexical units and no expression XP. An unseen English narrative placeholder is not an acquired phrase.

## Challenges and progression

| Assessment | Questions | Pass | Notes |
|---|---:|---:|---|
| Days 1–6 and 8–13 | 15 | 12 | Immediate skip is permitted per the Day 1 tutorial gate |
| Day 7 | 25 | 20 | Ms Hameed's Week 1 exam, actual pass required for graduation |
| Day 14 | 25 | 20 | Week 2 cumulative scavenger-hunt assessment |

XP uses once-only persistent reward identities. Lessons, question rewards and milestones cannot be farmed by immediate replays; later due review follows bounded reward rules. A first Week 1 challenge pass can grant its 75 XP bonus and then a milestone floor top-up. Nominal levels use `1 + floor(xp/200)` but are capped by contiguous Week 1 clears:

| Cleared through | Minimum XP after first pass | Displayed level cap |
|---|---:|---:|
| None | 0 | 1 |
| Day 1 | 200 | 2 |
| Day 2 | 400 | 3 |
| Day 3 | 600 | 4 |
| Day 4 | 800 | 5 |
| Day 5 | 1200 | 7 |
| Day 6 | 1600 | 9 |
| Day 7 actual exam | 1800 | 10 |

A skip-only player who passes at the minimum score can reach Level 10 after the actual Day 7 exam. Day 1's first pass grants the home once. “Newcomer” becomes **“New Resident”** only on successful Week 1 graduation. Week 2 retains Level 10/title and may bank additional XP; there is no approved Week 2 level schedule. Keep question counts, pass marks and saved results synchronized with `src/progression.js`.

## Persistence

`src/progression.js` owns save schema **6** and its fresh state; `src/storage.js` validates, loads and saves it. `src/app.js` assembles services and wires browser controls. `src/learning.js` applies answer transactions using the single evaluator in `src/question-engine.js`; screens render the resulting feedback. Vocabulary/SRS remain exclusively in `src/library-engine.js`, and XP/results/access rules in `src/progression.js`. Persist acquired lemmas/forms, SRS, frozen district plans, unique rewards, challenge scores and live attempt state (including first-answer locks and placed tiles), current tutorial completion and optional player profile.

**No backwards compatibility.** Unsupported/corrupt storage must show a blocking explanation and explicit reset, without silently overwriting old data. Do not add old-schema migrations, old navigation aliases, deprecated XP flags, separate SRS counters or obsolete patchers. A current schema-6 save's active challenge must restore before world greetings are shown, preventing an unseen expression from being acquired behind the restored assessment. Resuming renders saved questions, tile order/placement and locked feedback without regrading, rewarding or substituting curriculum content. Earlier formats (including schema 5) are intentionally unsupported; an explicit reset starts the new schema.

## Audio and accessibility

Build a single offline HTML release using `tools/build.py`. The shared player is `src/audio.js`; all screens use it. Play existing `audio/<content-id>.mp3` first when bundled, then a detected `ps-AF`/other Pashto browser voice (preferring an available neural voice), including delayed `voiceschanged` discovery; show a warned `ps-AF` fallback if no usable device Pashto voice is listed. Do not choose an explicitly unrelated English/Persian/Urdu voice or report audio success before actual playback. Navigation cancels audio. Missing audio never blocks a quiz.

Retain correctly directed Pashto RTL, romanisation/English LTR, visible speaker/addressee, legible mobile/desktop layouts, keyboard controls and honest audio availability. Chromium/mocked voice tests do not prove iPhone/Windows hardware performance or authentic Laghman pronunciation.

## Change control

Edit authoritative sources, regenerate `index.html`, and run `python3 tools/verify.py`. See `tests/README.md` for actual suites and limitations. Pending translations and candidate activation require `LANGUAGE_REVIEW.md` review and `tools/build.py` validation; do not invent linguistic approvals.

## Curriculum and composition boundaries

The canonical lexicon separates lexical POS from grammatical roles and pedagogical functions. Unknown traits are null with explicit review findings; an uncertain “plural or oblique” is not treated as an approved paradigm. The same spelling `هغه` now has separate stable universal identities for the Day 2 personal subject and Day 8 distal demonstrative. The 127 previous lemma identities remain; the additional personal-subject identity corrects the former conflation without changing authored Pashto. Bird/children citation-family uncertainty and the two sell lexemes remain visible, without silently merging them.

A formal introduction plan follows curated day/district/order and grammar constraints, independently of authored card `loop`. `firstEncounteredDay`, individually `introducedFormIds`, `formallyIntroducedDay`, practice history and mastery are distinct player states. Seeing a sentence or an unanswered skipped challenge does not introduce its component forms for generation. Individual word/form study may license a form; actual grammar workshop unlocks are also required. Frozen plans reserve each distinct district lemma at most once as new. Missed study can be resumed at its earlier location; it is not silently reassigned as another new word.

After individual word/form study and grammar, eligible lessons add up to two cumulative generated cards. The compiler unifies typed slots over exact evidenced surface forms, requiring the player's actual form introductions, workshop unlocks, lexical senses, verb valency, adjective agreement and case licenses. Explicit form cards teach finite verbs, direct plurals, adjective variants and whole spatial/possessive chunks without consuming new-lemma quotas. Day 14 schedules no new forms. Words introduced earlier stay available for later constructions.

Templates cover descriptions, attributive adjectives, present simple/compound clauses with person agreement, demonstratives, supported counts/plurals, spatial expressions, independent/named possession, question types and compatible adverbs. English uses countability, articles, person, number, argument and adjunct semantics. Compound predicates and case-governed expressions stay intact. Unknown features and unattested inflections fail closed; no suffixes are attached to arbitrary citations. `content/GENERATION_AUDIT.json` and `docs/grammar/GENERATION_COVERAGE.md` distinguish bindings, unique/new compositions, authored matches and fixed fallback inventory by day/family/pace. Native verification and grammar eligibility remain separate.

Generic Days 1–2 assessment recall/build slots can use eligible generated practice. Authored story dialogue identities and named contexts are retained. A fixed exercise depending on later forms is deferred/replaced for scoring by an eligible authored exercise (maintaining question kind/objective and counts); its original content record is retained for later practice. Existing reference narrative, opaque fixed expressions and NPC prompts may contextualise unfamiliar language; they do not confer productive grammar/form unlocks. Skip still assesses unfamiliar eligible words without English solutions before submission and never deducts points automatically.

Questions freeze text, generated slot/provenance snapshots, direction, correct target/alternatives, choice order and tile indices in the plan/active attempt. Reload and retries use the same exam rather than drawing again. Generated copies of an authored sentence share its grammar-unit SRS/reward identity; new composed meanings have stable identities, with identical text/meaning across templates sharing one SRS/reward origin. All lexical forms use the same LibraryEngine records, and all answers/XP still use the existing evaluators and progression authority.
