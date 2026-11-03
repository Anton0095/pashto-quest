# Pashto Quest — Current game specification

**Status:** Current fourteen-day gameplay design. It describes implemented mechanics; pending product goals are explicitly separated in the [README](README.md#product-goal-and-delivery-status). Current implementation resides in `src/`, `content/LEARNING_CURRICULUM.json` and the lexical/phrase registries; resolve any discrepancy explicitly rather than restoring archived logic. For learning content see `CURRICULUM.md`; for acceptance and tests see `tests/README.md`.

## Product and world

A single-file, keyboard/mobile-aware, primarily text-and-map Pashto learning game. Four canonical teaching districts: `residential` (Home), `nature` (Lake), `business` (Market), `school` (School). Library is an always-open reference scene and does not count as a teaching visit, XP action or fifth quota. Hills is a Day 6 Nature finale, not a fifth map location. Characters may visit other districts from Day 5 onward. Muhammad Jan (village elder), Edris (shopkeeper), Saleha (fellow student), Mina (Saleha's sister, introduced Day 6) and Ms Hameed (teacher) retain their relationships and contextual speaker/addressee distinctions. Normal mode keeps each day's authored opening. Skip mode bypasses visits and normally forced openings.

## Onboarding and navigation

1. Day 1 begins with Muhammad Jan's guided Library tutorial of **four study/interaction cards**: `سلام` → choose English meaning; `څنګه یې؟` → assemble Pashto word tiles; `ته کومه ژبه زده کوې؟` → select `پښتو`; `زما نوم څه دی؟` → type Muhammad Jan in English, accepting documented spelling variants and normalized case/whitespace. Optional Library profile settings default to Player / Prefer not to say and persist independently of tutorial answers.
2. The four interactions explain how to answer future questions. After completion, save `tutorialDone`; profile changes are optional and only made in the Library. A tutorial replay never changes the player profile. The older Thank you and Goodbye greetings are taught later (Day 2 Market and Day 3 Home).
3. Only the Day 1 tutorial is a mandatory prerequisite to the initial skip action. On Days 2–14 the end-of-day challenge can be attempted immediately, including with zero visits.
4. Normal routes retain authored opening teacher and visit order. Starting a challenge unlocks its frozen four-location vocabulary, evidenced forms and grammar through that day before generating questions. This grants availability without visit completion, actual-study claims or practice grades. The first successful pass completes all four locations and makes the RPG day ready for sleep; it does not change the active RPG day. Missed nonempty locations receive their normal once-only 25 XP completion bonus; completed locations receive none. It creates no correct answers, mastery, SRS grades or practice activity timestamps.
5. World and lesson screens put the map above accompanying word/lesson information. During lessons, the taught text precedes speaker/guide information; avoid reintroducing obsolete green speech-bubble presentation.

## Questions, teaching and SRS

- Engine-composed sentences retain teacher/recipient context, Pashto, romanisation, English, stable form bindings and syntax provenance. Distinct lexical lemmas are counted once regardless of inflected forms or how often a word appears in dialogue.
- `LibraryEngine` is the single authority for exposure, acquisition, form identity, shared spaced repetition, planner selection and due review. Acquired/encountered, correctly practiced and mastered are different states. Displaying a lesson is not mastering it.
- Four districts request 1–6 **new distinct district lemmas** each for daily paces of 4–24, selecting only the eligible curated prefix; actual supply can be lower. Optional pace zero assigns no new district lemmas. A plan freezes once started; changing pace does not reroll it. Report shortfalls explicitly.
- Day 1 excludes lexical action verbs from assignment, exposure, review and question selection. Day 2 School introduces verbs and subject–object–verb construction. Day 14 introduces no compulsory new lexical entries. Universal lexemes, derivational/inflectional forms and fixed phrases do not consume district quotas.
- Normal lesson sequence begins with the day's active greeting as its first study card in each teaching district (the local active expression takes priority), followed by new vocabulary/forms, the visible grammar workshop, generated sentences and review. A day's active greeting is first in its daily challenge. Pending English-only phrases are not silently turned into playable Pashto or recognition prompts.
- Each challenge samples its frozen vocabulary assignments from all four locations regardless of visit completion, word-practice answers or lesson grades. Word-recall slots cover each location with eligible assignments; shortage recall cycles evenly through the remaining assigned words before universal/revision material, avoiding repeated form identities while distinct candidates remain. A 15-question challenge samples the assignment pool rather than promising every word in a 24-word plan. Pace zero and Day 14 add no assigned words. Sentence construction uses licensed forms and grammar unlocked by actual study or explicit challenge activation. Current-day assigned words are preferred in sentence tasks, with earlier material retained for cumulative revision.
- When a skip presents previously **unstudied** Pashto vocabulary in a challenge, show Pashto script, romanisation and “Not previously studied”, but **not the English definition before submission**. Unstudied targets use typed English recall, with an explicit “I don’t know” reveal after the first scored submission; no translation answer is offered as a clue. Case and outer whitespace are ignored for this uncued English response. Lexical distractors on teaching, assessment, Library and phrase surfaces prefer individually introduced forms (including earlier word study in the same lesson) across parts of speech. If needed, display-only Day-1 base words supply distinct wrong alternatives. Backup display creates no study/acquisition, grammar or XP. Target accepted answers, overlapping listed senses, duplicates and equivalent Pashto forms are excluded. Generic placeholders are reserved for a genuine remaining shortage. Freeze prompt direction/presentation and any typed draft in the saved attempt.
- Choice, word tiles (including indexed duplicates, dud distractors, undo/clear), translation and context/dialogue tasks retain first-submission scoring. Wrong answers change SRS, not retroactive challenge score; retries cannot farm first-answer XP.
- Library Vocabulary Bank, Universal Vocabulary, Grammar Journal, expressions and voluntary practice are reference/practice functions. Voluntary Library review grants no XP; contextual fixed expressions use nonlexical units and no expression XP. An unseen English narrative placeholder is not an acquired phrase.

All sentence construction uses the shared indexed tile renderer in lessons, assessments, onboarding phrases and Library Sentence practice: direct English target, shuffled Pashto tiles, removable answer tokens, Undo, Clear and Check sentence. Exact-tile and distractor variants are deliberately mixed; distractor tasks allow submission with unused tiles. Duds prefer introduced forms (including same-lesson study), then display-only Day-1 base forms, excluding target/accepted equivalent tokens. Correct feedback alone offers “Hear the correct sentence”, using the shared recording/device-voice service and the complete correct Pashto; restored correct feedback retains it. Playback changes no scores, SRS, XP or locks; navigation cancels it. Village story and character portraits remain on their own surfaces; supplementary illustrated vocabulary/sentence-preview boards remain removed.

Library entries record unlock day, assigned Home/Lake/Market/School (universal words separately), and study, challenge-start or historical challenge-pass mechanism. Per-form metadata remains under stable lemma IDs. Historical records without provenance remain readable with an explicit “not recorded” label; no historic source is guessed.

## Challenges and progression

| Assessment | Questions | Pass | Notes |
|---|---:|---:|---|
| Days 1–6 and 8–13 | 15 | 12 | Immediate skip is permitted per the Day 1 tutorial gate |
| Day 7 | 25 | 20 | Ms Hameed's Week 1 exam, actual pass required for graduation |
| Day 14 | 25 | 20 | Week 2 cumulative scavenger-hunt assessment |

A first pass with missing locations shows: “You have completed this day’s challenge. Words from the locations you skipped were unlocked when the challenge began and remain available for future activities. Visit the Library to review them.” A result button opens the newly unlocked Library entries, including universals. Failed attempts retain activation-time availability; they grant no visit completion or pass bonuses. Repeated activation/passes cannot farm unlocks or rewards. Day 14 introduces no new lemmas/forms. Active questions, scores and answer rewards stay frozen through grading.

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

`src/progression.js` owns save schema **7** and its fresh state; `src/save-schema.js` validates its nested shape/proofs; `src/storage.js` delegates validation, loads and saves it. `src/app.js` assembles services and wires browser controls. `src/learning.js` applies answer transactions using the single evaluator in `src/question-engine.js`; screens render the resulting feedback. Vocabulary/SRS remain exclusively in `src/library-engine.js`, and XP/results/access rules in `src/progression.js`. Persist acquired lemmas/forms, SRS, frozen district plans, unique rewards, challenge scores and live attempt state (including first-answer locks and placed tiles), current tutorial completion and optional player profile.

**No support for save schemas earlier than 7.** Valid existing schema-7 saves, including those without optional retirement metadata, remain supported. This does not authorise old-schema migration or silent repair. Unsupported/corrupt storage must show a blocking explanation and explicit reset, without silently overwriting old data. Do not add old-schema migrations, old navigation aliases, deprecated XP flags, separate SRS counters or obsolete patchers. A current schema-7 save's active challenge must restore before world greetings are shown, preventing an unseen expression from being acquired behind the restored assessment. Resuming renders saved questions, tile order/placement and locked feedback without regrading, rewarding or substituting curriculum content. Earlier formats (including schema 6) are intentionally unsupported; an explicit reset starts the new schema.

## Audio and accessibility

Build a single offline HTML release using `tools/build.py`. The shared player is `src/audio.js`; all screens use it. Play existing `audio/<content-id>.mp3` first when bundled, then a detected `ps-AF`/other Pashto browser voice (preferring an available neural voice), including delayed `voiceschanged` discovery; show a warned `ps-AF` fallback if no usable device Pashto voice is listed. Do not choose an explicitly unrelated English/Persian/Urdu voice or report audio success before actual playback. Navigation cancels audio. Missing audio never blocks a quiz.

Retain correctly directed Pashto RTL, romanisation/English LTR, visible speaker/addressee, legible mobile/desktop layouts, keyboard controls and honest audio availability. Chromium/mocked voice tests do not prove iPhone/Windows hardware performance or authentic Laghman pronunciation.

## Change control

Edit authoritative sources and follow the [risk-based validation policy](tests/README.md#choose-validation-by-change-and-risk). Rebuild when release inputs change; Markdown-only edits require documentation checks, not builds or gameplay tests. Pending translations and candidate activation require `LANGUAGE_REVIEW.md` review and `tools/build.py` validation; do not invent linguistic approvals.

## Curriculum and composition boundaries

The canonical lexicon separates lexical POS from grammatical roles and pedagogical functions. Unknown traits are null with explicit review findings; an uncertain “plural or oblique” is not treated as an approved paradigm. The same spelling `هغه` now has separate stable universal identities for the Day 2 personal subject and Day 8 distal demonstrative. The 127 previous lemma identities remain; the additional personal-subject identity corrects the former conflation without changing authored Pashto. Bird/children citation-family uncertainty and the two sell lexemes remain visible, without silently merging them.

A formal introduction plan follows curated day/district/order and grammar constraints, independently of authored card `loop`. `firstEncounteredDay`, individually `introducedFormIds`, `formallyIntroducedDay`, practice history and mastery are distinct player states. Displaying or answering individual assessment questions adds no form licenses beyond the explicit challenge-activation manifest. Individual word/form study or explicit challenge activation licenses a form; grammar is unlocked through its workshop or challenge activation. The activation manifest preserves the planned material and per-location completion counts across reload. Frozen plans reserve each distinct district lemma at most once as new. Missed study can be resumed at its earlier location; it is not silently reassigned as another new word.

Lessons teach individual words/forms, then missing English grammar rules, then request engine-composed clauses. Day 1 requests three study sentences; later days request four when distinct eligible compositions remain. Standard visits exclude previously studied sentence texts; explicit revision/replay may repeat them. At default pace, Home alone yields at least two (currently three) distinct descriptions from its six assigned nouns/adjectives and required forms. Low paces report deficits without changing district quotas.

All instructional clauses on every surface must be compiled from introduced/unlocked forms and unlocked grammar: lessons, assessment targets and Pashto prompts, dialogue replies, feedback and Library examples. `content/FIXED_PHRASES.json` is the current eighteen-expression exception bank, expandable only through the [phrase review gate](docs/grammar/FIXED_PHRASE_EXCEPTIONS.md#expanding-the-register). The two explicitly owner-approved authored onboarding questions are separately recorded in `content/TUTORIAL_PROMPTS.json`; they never enter the curricular generation bank. English profile settings and story narration are interface/scenario text, not Pashto phrase exceptions. Former authored banks, models and question/reply targets are archival form evidence only and are absent from the runtime.

Typed templates enforce gender/number/person agreement, semantic valency, countability, case licenses and whole compound predicates. English follows the actual bindings. Unknown morphology and unattested inflections fail closed. Twenty-eight families include coordinated present clauses and compatible generated question/reply joins. Generated question/reply joins remain licensed compiler material; all construction activities present the answer’s direct English meaning without narrative reply or speaker/listener instructions. Earlier forms remain available for cumulative composition; Day 14 introduces no new forms.

An under-supplied pace/skip route adapts with explicit vocabulary or approved phrase practice, preserving question counts and pass thresholds. Activation explicitly unlocks the day’s material before selection; submitting an answer introduces no additional forms or grammar. No fixed sentence fills a shortage. The measured browser-observed delivery report is `docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md`; potential capacity and exact missing features are separate in `GENERATION_COVERAGE.md`.

Frozen attempts retain generated text, gloss, syntax, slot/form/grammar references, question direction, indexed tile order/placement, scene, speaker/recipient, choices and locked feedback. Restore recompiles each proof; a generated label alone is insufficient. Identical text/gloss shares one reward/SRS origin. Vocabulary/SRS and answer/XP authorities remain unchanged.

Grammar catch-up shows all previously missed workshops through the current day before unlocking those visible rule IDs; it does not grant future grammar or introduce words. When a visit has no vocabulary/forms/review and no eligible generated sentences, it records completion after grammar guidance with zero practice/completion XP. This permits normal route progression without a fixed greeting fallback. The settings UI reflects the actual requested pace and four-district allocation; assessment captions count the frozen question set.

The Grammar Journal reads `content/GRAMMAR_REFERENCE.json`: all 33 concept explanations and worked analyses, plus all fourteen curriculum-day rules, are available immediately as reference. Reading it grants no lesson completion, form study, XP or generation unlocks. Pashto examples require forms and grammar licensed by actual study or challenge activation. There are no grammar-rule or category questions in newly created assessments. A shortage uses vocabulary or approved phrase recall, preserving 15/12 and 25/20 lengths/thresholds, with explicit repetition when the eligible pool is small.

Persistence errors display a nonblocking warning, keep progress in memory and offer Retry and Export. Success requires reading back the exact written payload. A failed initial read cannot overwrite an existing save on recovery; the player can export this tab and reload the stored progress. This state is distinct from incompatible/corrupt-save rejection. Schema 7, scoring and explicit reset remain unchanged. Export is a JSON backup, not a new import/migration system.

## English answer policy

Lexical recall accepts its displayed gloss and explicitly stored `acceptedEnglishAnswers` for that individual form, using NFC, case and outer-whitespace normalization. For unambiguous English infinitive labels, the stored list explicitly permits omission of “to”; this does not accept finite-person forms, imperatives or arbitrary lemma-family synonyms. Slash-separated or person-annotated ambiguous glosses await editorial review. This formatting policy changes neither Pashto forms nor native approval.

## Assessment and persistence boundaries

Daily plans freeze assigned vocabulary and their curriculum seed. A newly created challenge draws a fresh random seed (Web Crypto when available; browser random fallback) independent of that curriculum seed. Words, form cohorts, compatible generated sentences, distractors and tile/choice orders use the attempt draw. Sampling stays constrained by location coverage, current-day/revision priorities and licensed grammar; the prescribed opening phrase remains fixed. Repeated words across separate attempts remain possible by chance or a small pool. Each explicitly new assessment first activates the frozen day material, then uses current licensed forms and grammar. The selected questions, knowledge labels, directions, dud tokens, tile sequence, draft and first-answer lock then freeze for that attempt, including while paused for study. An older daily question bank is not reused.

Schema-7 saves are validated before use, including nested SRS, plans, exposure records and generated proofs. Invalid raw data remains untouched until explicit reset. Storage is checked before every write; an already-observed changed payload blocks writes and prompts reload/export rather than merging learning records. The final comparison and write run inside one origin-wide Web Lock, covering simultaneous current-release writers. Failed writes retain in-memory progress and offer asynchronous retry plus immediate export.

Completed practice events retire under the existing monotonic attempt sequence. Current UI and paused assessment attempts retain their exact event/delivery keys; retired attempts cannot grade again. Completed deliveries aggregate by exact content identity, surface and mode, retaining counts and first/last day. This preserves previous-standard-study exclusions and compiler-restorable identities. SRS, rewards, acquired forms and frozen plans/proofs remain intact. Older valid schema-7 payloads without retirement fields remain readable; this is bounded-history maintenance, not old-schema migration. Repeated unchanged saves skip storage writes after checking the existing payload.

## Attempt terminology

- **Answer correction/retry:** another response to the same practice item; retain its identity and first-answer scoring lock. It is not a new assessment.
- **Resume/reload:** continue the same active or paused assessment snapshot, including after intervening study. Questions, choices, knowledge labels, draft and locks do not reroll.
- **Explicitly new assessment:** activate the day’s material and create a new attempt with current form/grammar eligibility. Prior reward identities still prevent replay farming.
- **Frozen daily vocabulary plan:** the independently persisted district assignment/seed; starting a new assessment does not regenerate this plan.

A storage-warning “Retry” retries persistence, not an answer or assessment. UI labels must make the operation clear.

## Narrative and feedback consistency

Generated language must fit the scene, teacher, speaker and recipient as well as the grammatical licenses. Any picture must depict the taught proposition (an open window for “the window is open”). Correct/wrong selection highlighting and answer revelation use the same shared feedback rules across ordinary lessons, forced story lessons, optional expressions and assessments. Apply fixes to the shared behaviour, not a single day-specific exception. This is an acceptance requirement; pending visual/content work is not certified complete by grammar tests.

Save writes are asynchronous and origin-wide Web Locks serialize the final stale comparison and write. Pending same-tab snapshots coalesce; a losing tab cannot overwrite the winner and offers export/reload. Browser shutdown with a pending write requests an unsaved-work prompt. Browsers without Web Locks fail visibly rather than attempting an unsafe write. No automatic merging or schema migration is performed.

New assessments test word/phrase recall, sentence meaning, construction and contextual dialogue. English grammar analysis and category-selection questions are retired. Saved format-7 attempts containing those items stay intact behind a notice, with pause/export and an explicit retire-and-start action. Retirement archives the original session as `retiredRuleAssessmentJSON`; it neither grades the old attempt nor changes XP, SRS, past results or frozen vocabulary plans. The archive remains downloadable from the Grammar Journal. Pure legacy validation/interpretation is retained for these snapshots; retired items cannot enter the grading transaction.

Challenge-start provenance does not mean physical study. Per-form unlock records may record a later `studiedDay`; unstudied word-recall targets remain uncued even when their forms are licensed for sentence generation. New sentence tasks prioritise compatible current-day assignments while retaining earlier words and grammar. No sentence bank is unlocked: the compiler composes the newly available combinations on demand. Older active attempts retain their exact questions/score/locks after activation and display an explicit notice; finish one to start an assessment from the expanded pool.

## RPG house, sleep and dream review

The village house entrance leads to a separate collidable 16-pixel-tile interior based on `docs/design/house-interior-reference.png`. The bottom door returns to the entrance courtyard. Keyboard, pointer navigation and touch controls share the existing Phaser movement controller. The bed opens Sleep / Dream; the bookshelf opens the existing Library at the same saved indoor position.

A passed daily challenge makes sleep available in Quick Travel and at the bed, through one guarded transition. The current chapter remains active until sleep. Persistent `sleepIntent` records the source/target before advancement; recovery finishes that exact transition or clears an already committed marker. Next-day openings, actor schedules and lesson access follow the existing chapter services. No available next chapter produces a message without changing progression.

Dream lists only recorded passed days, then the original four district lessons. It runs the normal learning engine in a disposable copy of progress, with zero XP/completion rewards, blocked challenge starts and canonical-only saves/exports. Exit/reload returns to the house; it never replaces the active campaign day or campaign records. See [state and compatibility details](docs/rpg/HOUSE_SLEEP_DREAM.md).
