# Pashto Quest

Current follow-up: [Sleep/Dream transitions and authored Bilal Lake conversations](docs/rpg/SLEEP_AND_CONVERSATIONS.md) replace the earlier response sampler. The existing third-person “see” material is introduced in Day 2 Lake by explicit owner approval; first person remains Day 3. Narrative speech is an unverified editorial draft, and optional conversations grant no learning records or XP.


> **Integrated user approval (31 October 2026):** [approval record](content/USER_LANGUAGE_APPROVALS.json) records the original 473 base lemmas and 18 conventional phrases. نن (“today”) uses the subsequently supplied `nun`. This approves exact base spelling, listed senses and supplied transliteration; inflections, grammatical analyses, generated combinations, recordings and 59 excluded candidates remain outside its scope. No independent native certification is claimed.

An offline, browser-based Pashto learning game set in a village in Laghman, Afghanistan. Four teaching districts (Home, Lake, Market and School), a reference Library and a recurring cast support a Days 1–14 curriculum and educational engine. The playable RPG currently covers Days 1–7; Days 8–14 require additional narrative, map and event registration. Base entries and registered phrases are user-approved; grammar and inflected forms remain drafts, without independent native certification.

The current development follow-up adds a furnished Library interior, Nayab's girl design, optional tutorial skipping with one shared village introduction, independent selection/construction/typing quotas, and progressive Pashto-only Bilal conversations. See [behavior, planner, save and language-review details](docs/rpg/QUEST_IMPROVEMENTS.md). Typing defaults off in Library → Player Profile; saved assessments retain their original presentation.

## Village characters

**Deena** (stable ID `saleha`) and her younger sister **Medina** (`mina`, introduced Day 6) retain their teaching and story roles. Deena has a redesigned portrait and world sprite with visible light brown hair and blue eyes. **Bilal** fishes by the Lake and offers optional, unresolved hints about a mysterious catch. **Zamir** owns several Market stalls and walks an inspection circuit. **Nayab, Sara, Omar, Afiya and Sanaa** play in the School courtyard. These seven optional villagers grant no lessons, XP or required quests. See the [cast specification](docs/rpg/CHARACTER_EXPANSION.md) and [implementation, saves and validation](docs/rpg/LIVING_VILLAGE.md).

The owner supplied **دینه** (Deena) and **مدینه** (Medina). These are now canonical in active lexical forms, compiler metadata and speech, with `deena` / `madeena` pronunciation aids. Case forms and pronunciation remain provisional. See [the current lesson/progression fixes](docs/rpg/LESSON_PROGRESSION_FIXES.md) for the guided SOV demo, lesson-specific vocabulary, Day 2 access, Have entry and schema-8 save boundary.

## RPG interface and Week 1

The starting village now uses a 96×64 Afghan-inspired layout with northwest residential compounds, a northeast lake and dock, a school below the lake, southwest market and three barred future roads. See the [layout, rendering, save recovery and map extension guide](docs/rpg/VILLAGE_REDESIGN.md).

The default release uses strict TypeScript and locally bundled Phaser 4.2.1. Click or tap to walk, select an NPC to approach and talk, or use arrows/WASD and the touch directions. On wide screens the world occupies the left column (approximately 65%); day/title, Level, XP, encountered words and the contextual interface occupy the right column. At widths of 1000 CSS pixels or less, the world sits above the interface. Exploration and dialogue keep the world visible. Tutorials, lessons, revision, dreams and challenges switch to viewport-filling Learning Mode with the mounted world hidden and paused; permitted return actions restore exploration at the saved position. Library reference remains contextual, while voluntary practice expands to the viewport. Menu contains the collapsible Laghman/pronunciation information. Library remains independently accessible. See [Exploration Mode](docs/rpg/TWO_COLUMN_INTERFACE.md), [Learning Mode](docs/rpg/FULLSCREEN_LEARNING.md) and [current lesson UI, feedback and entry rules](docs/rpg/LESSON_UI_AND_ENTRY.md).

Entering a location, waking or returning from a lesson stays quiet. Interact with the designated NPC for its introduction and a choice to study or explore. Quick travel names actual destinations and begins an available lesson directly through the same guarded starter; completed lessons are labelled as reviews. Narrative follow-ups remain available through subsequent NPC interaction. Visiting teachers move with the narrative; the Day 6 Nature finale appears as Hills. Days 1–6 retain 15 questions/pass 12; Day 7 retains the 25-question/pass-20 weekly examination. Normal and explicit early-challenge routes use the existing educational, audio, XP and save systems. Week 1 graduation is a milestone linked to `day-8`; the Day 8–14 RPG story registrations remain future work, while their educational backend remains intact.

The reusable dialogue portrait component supports stable character IDs and expressions, including speaker changes. Original character portrait screenshots are preserved under `public/assets/portraits/`; the newly generated source atlas is under `public/assets/portraits/generated/`. The game uses lossless WebP portraits under `assets/portraits/`, registered by character ID in [content/CHARACTER_PORTRAITS.json](content/CHARACTER_PORTRAITS.json), embedded for offline use and loaded through Phaser. Retained screenshot crops preserve original pixels; new portraits record generated provenance, preparation and actual digests. Nearest-neighbour display preserves pixel edges; dialogue and buttons remain dynamic DOM content.

See the [overhaul audit and delivery report](docs/rpg/MULTIDAY_OVERHAUL.md), [architecture](docs/rpg/RPG_ARCHITECTURE.md) and [expansion guide](docs/rpg/RPG_EXPANSION_GUIDE.md). Educational schema 8 and world schema 1 saves retain their namespaces and coordination. Schema 8 deliberately rejects earlier educational saves with explicit export/reset handling; no automatic conversion or silent reset is introduced. Physical iPhone Safari remains untested.

## Product goal and delivery status

The aim is cumulative Pashto learning through a coherent village story: recurring characters teach language that fits their scene, speaker and listener. Text, meaning and the surrounding story must agree. Supplementary illustrated vocabulary/sentence-preview boards have been removed in favor of compact activities. Correct and incorrect answer feedback should behave consistently on every lesson surface, including forced story lessons and optional expressions. These are general requirements, not exceptions for individual days.

Onboarding now teaches two fixed greetings and two separately owner-approved Pashto questions: language selection and Muhammad Jan’s name. Optional player name/gender settings live in Library → Player Profile, defaulting to Player / Prefer not to say. The [two exact tutorial prompts and approval](content/TUTORIAL_PROMPTS.json) are distinct from the eighteen conventional expressions. The three pending Day-1 alternative location expressions have been removed from playable content.

## Play

Open the generated `index.html` in a modern browser, or serve the repository with:

```sh
python3 -m http.server 8000
```

The game needs no backend, account, API key or runtime JSON fetch. The generated release embeds source data. A browser may impose restrictions when opening local files; local HTTP hosting is a useful development alternative. Progress JSON is kept in browser local storage; IndexedDB holds only hash/revision metadata for safe cross-tab coordination. Browser Web Locks, IndexedDB and Web Crypto are required for coordinated saving; failures retain progress in this tab with Retry/Export. Audio is optional: bundled `audio/<id>.mp3` recordings take priority when supplied; otherwise the game attempts a detected Pashto device voice and warns about uncertain fallback. No native-reviewed MP3 pack is currently committed. Physical iPhone Safari and Windows speech quality have not been independently verified.

## Development

Use Python 3 for the offline builder and Node.js/npm for the strict TypeScript/Phaser build. Run `npm ci` once; players need no Node/npm or runtime downloads. Full tests use Playwright/Chromium. Choose commands using the [risk-based validation policy](tests/README.md#choose-validation-by-change-and-risk). The commands below are a reference, not a checklist for every edit; Markdown-only changes need no build or gameplay tests.

```sh
npm run typecheck                  # strict RPG TypeScript contracts
python3 tools/build.py              # update generated offline index.html
python3 tools/build.py --check      # check generated release matches sources
python3 tools/verify.py             # model, syntax, build and browser suites
python3 tools/verify.py --quick     # no browser suites: not full validation
node tools/district-inventory.mjs   # refresh candidate/capacity report after relevant edits
node tools/district-inventory.mjs --check
```

**Never edit `index.html` as the authoritative source.**

| Source | Owns |
|---|---|
| `src/app.js` | Browser composition, shared runtime state and event wiring |
| `src/rpg/*.ts` | Strict RPG types/adapters, Phaser scene, maps/actors/events and world persistence |
| `tools/build-rpg.mjs`, `generated/rpg.bundle.js` | TypeScript checks and locally bundled Phaser/RPG artifact |
| `src/content.js`, `src/assessment-content.js` | On-demand generated-card registry, English narrative and task blueprints |
| `src/library-engine.js` | Sole lemma/form identity, acquisition, SRS and district planner |
| `src/progression.js` | Save factory/version, XP/reward identity, results, milestones and access rules |
| `src/sentence-engine.js`, `content/SENTENCE_FRAMES.json` | Bounded feature/semantic unification, licensed draft compositions and deterministic practice selection |
| `src/question-engine.js`, `src/construction-ui.js` | Shared answer evaluation, indexed tiles and consistent construction controls/success audio |
| `src/learning.js`, `src/questions.js` | Practice transactions, lesson pools, frozen assessments and answer choices |
| `src/save-schema.js`, `src/storage.js` | Nested current-save validation; Web Locks coordinated persistence, fail-closed without coordination and active challenge snapshots |
| `src/ui.js`, `src/answer-feedback.js` | Shared instructor/speaker/partner context and correct/wrong presentation |
| `src/world-ui.js`, `src/lesson-ui.js`, `src/challenge-ui.js` | Phaser navigation facade and shared lesson/assessment presentation |
| `tests/fixtures/education-navigation.js` | Test-only fourteen-day educational navigation; excluded from the production build |
| `src/tutorial-ui.js`, `src/grammar-ui.js`, `src/library-ui.js`, `src/narrative-ui.js` | Onboarding, workshops and reference/expression presentation |
| `src/audio.js` | Common MP3/device-voice player and cancellation |
| `src/app.html`, `src/app.css` | UI shell and styles |
| `content/LEARNING_CURRICULUM.json`, `content/FIXED_PHRASES.json` | Curriculum, grammar, story/people, assessment scenes and eighteen conventional expression exceptions |
| `content/TUTORIAL_PROMPTS.json` | Two separately owner-approved authored onboarding questions; no curricular generation unlocks |
| `content/GRAMMAR_REFERENCE.json` | Read-only Grammar Journal explanations and worked analyses; never an assessment bank |
| `content/LIBRARY_LEXICON.json`, `content/NARRATIVE_EXPRESSIONS.json` | Lexical forms/mappings and approved daily expression identities |
| `content/DISTRICT_VOCABULARY_CANDIDATES.json`, `content/UNIVERSAL_TEACHING_TARGETS.json` | Inactive editorial candidates, not playable translations |
| `tools/build.py`, `tools/verify.py` | Offline assembly/validation and complete verification |

Modules expose small factory APIs with explicit state/service dependencies and screen-transition callbacks. UI submits answers through `learning.js`; it does not maintain a second score, XP or SRS store. `tools/build.py` assembles the modules in explicit dependency order inside one private script closure. The generated game embeds Phaser and the strict-checked RPG bundle alongside the educational modules. Players need no module loader, dependency installation or network requests for code/curriculum. Browser DOM, Canvas, local storage and optional Audio/Web Speech APIs provide the platform; development uses Python, npm/TypeScript/esbuild and Node/Playwright/Chromium.

`docs/reference/WEEK2_LESSON_DATA.json` archives the historical English editorial targets and is never read by the runtime/builder; `tests/curriculum-contract.json` preserves authored-content regression fixtures. `content/DISTRICT_INVENTORY_REPORT.json` is an inventory output. Do not delete data files just because some names overlap.

## How progression works

The Day 1 Library tutorial introduces four interactions: choose the meaning of `سلام`, choose the translation of `څنګه یې؟`, select `پښتو` in response to “What language are you learning?” and type Muhammad Jan’s name in English. Completing the tutorial or explicitly skipping it satisfies Day 1 onboarding; both routes reach the same village introduction. A normal day includes narrative openings and district lessons; after the tutorial on Day 1, or immediately on Days 2–14, the player can skip visits and attempt the daily challenge. Starting a challenge unlocks the day’s frozen assigned words, evidenced forms and grammar from all four locations before generating its sentence tasks. It records challenge-start availability separately from actual study, with no fabricated grades, XP or visit completion. Its first successful pass completes all four locations and awards missing once-only location bonuses. In the RPG, passing keeps the current day active. Return home and sleep, or use Quick travel → Sleep, to begin the next registered, eligible chapter. Sleep resolves pending route/ending acknowledgements first and blocks while a challenge retry is paused; narrative acknowledgement alone never advances the chapter. Day 7 remains the available story boundary even after graduation. The explorable house also opens the shared Library and offers dream lessons from registered days with recorded challenge passes. Dreams use a disposable review copy: no campaign XP, SRS, unlocks, completion or day changes persist, and dream sessions cannot be resumed after reload. See [house, sleep and dream behavior](docs/rpg/HOUSE_SLEEP_DREAM.md).

Each district selects eligible new **distinct lexical lemmas** in its explicit curated introduction order, at a selected pace of 8/12/16/20/24 per day. Universal vocabulary, inflections, grammar units and expressions do not consume district quotas. Day 1 teaches descriptions, while action verbs start on Day 2. Day 14 schedules no compulsory new words. Daily challenges have 15 items, pass 12; Days 7 and 14 have 25, pass 20. A passed Day 7 exam unlocks Level 10 and New Resident.

The current lexicon contains 401 district lemmas (101 Home, 100 in each other district) and 73 universal lemmas. The original 473 base entries and the newly requested Have base are `user_approved`, with scoped reviewer/date/reference evidence; individual inflections and grammar remain provisional. The candidate archive retains its original draft provenance and 59 excluded candidates remain inactive. A fresh profile at the default pace of 24 receives six district lemmas per location on Days 1–13; Day 14 has none. The generated `content/VOCABULARY_REVIEW.csv` is the human review register.

## Documentation roles and precedence

Latest explicit user instructions govern the task. This README states the product goal; [GAME_SPEC.md](GAME_SPEC.md) owns mechanics, [CURRICULUM.md](CURRICULUM.md) owns teaching sequence, and [LANGUAGE_REVIEW.md](LANGUAGE_REVIEW.md) owns linguistic review. [AGENTS.md](AGENTS.md) owns contributor workflow and [tests/README.md](tests/README.md) owns validation policy. [RPG_ARCHITECTURE](docs/rpg/RPG_ARCHITECTURE.md) maps current world authorities; [POST_MERGE_AUDIT](docs/maintenance/POST_MERGE_AUDIT.md) records maintenance findings and release-specific evidence. Domain-specific rules complement each other; resolve a real conflict explicitly rather than choosing whichever file is convenient. Source/data establish what currently runs, not permission to replace intended behaviour with a limitation.

| Documents | Role |
|---|---|
| This README, AGENTS, GAME_SPEC, CURRICULUM, LANGUAGE_REVIEW, tests/README | Active goals, mechanics, content, review and workflow as scoped above |
| [Fixed phrase register](docs/grammar/FIXED_PHRASE_EXCEPTIONS.md) | Current conventional-expression exceptions and expansion gate |
| [Generation rules](docs/grammar/PASHTO_GENERATION_RULES.md) | Researched grammar constraints; no native certification or blanket claim of implemented coverage |
| [Generation implementation proposal](docs/grammar/GENERATION_IMPLEMENTATION.md) | Historical implementation rationale, updated to remove prohibited fallback instructions; not an outstanding task |
| [Generation coverage](docs/grammar/GENERATION_COVERAGE.md), [instructional delivery](docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md) | Generated evidence tied to recorded inputs/release; potential capacity differs from measured delivery |
| [Audit remediation](docs/maintenance/AUDIT_REMEDIATION.md) | PR #23 implementation/validation record and explicitly identified remaining limits |
| [Audit performance](docs/maintenance/AUDIT_PERFORMANCE.md), [P1 performance](docs/maintenance/p1/PERFORMANCE.md) | Generated benchmark snapshots; retain original inputs, hashes and results |
| [Cleanup review](docs/maintenance/CLEANUP_REVIEW.md), [P1 fixes](docs/maintenance/P1_FIXES_AND_PERFORMANCE.md) | Historical maintenance decisions and evidence, not current work orders |
| [Week 1 blueprint](docs/reference/WEEK1_CONTENT_BLUEPRINT.md), [Week 2 lesson plan](docs/reference/WEEK2_DETAILED_LESSONS.md) | Historical editorial targets; old APIs, authored sentence sets, branch instructions and “not implemented” statements describe their original checkpoints |

Different historical check counts, sentence totals and timings describe different releases. They must not be reconciled by rewriting past results. Generated reports are changed by their tools only when their inputs and validation warrant it; their presence creates no testing obligation for Markdown-only work.

Save format **8 only** is supported. There is no old-save migration. An incompatible or corrupt save stays untouched until the player explicitly resets it. New format-8 progress, SRS and active attempts save and resume normally, including placed tiles and first-answer locks. Earlier formats are intentionally unsupported; there are no migration or content-repair adapters.

Vocabulary introductions are declared per immutable lemma ID in `content/LIBRARY_LEXICON.json` (planned day, district/universal, order and grammar requirements), separately from actual encounter, individual form study and mastery. A hash no longer selects the curriculum. All five paces remain selectable; plans remain frozen after creation. `content/CURRICULUM_AUDIT.json` is the maintained effective audit, and `content/DISTRICT_INVENTORY_REPORT.json` reports each day's assignments and the 23-entry Home reserve and 22-entry reserve in each other district.

Ordinary instructional Pashto clauses are produced by the sentence engine, including lesson study, construction, assessment questions/replies, dialogue and Library examples. The [eighteen currently registered conventional expressions](docs/grammar/FIXED_PHRASE_EXCEPTIONS.md) and [two separately owner-approved onboarding questions](content/TUTORIAL_PROMPTS.json) may be taught whole in their recorded contexts. Eighteen is the present inventory, not a permanent limit; additions require the register’s review process. Vocabulary/forms → grammar → engine composition is the normal lesson order; challenge activation explicitly licenses the current day’s material before assessment; the runtime builds no sentence catalogue before study or explicit challenge activation. The former authored teaching banks are archived in `docs/grammar/attestations/` as form evidence and fixtures only.

At default pace, Day 1 Home teaches six district lemmas plus an evidenced feminine adjective form, then composes **three distinct descriptions** without another district visit or an action verb. Later days combine compatible, forms unlocked through study or challenge activation through 28 grammar families, including typed question/reply joins and coordinated clauses. Unknown morphology fails closed. A small supported pace can lack enough compositions; an explicit deficit triggers vocabulary or approved phrase practice, without extra district words or fixed sentence substitutions. Day 14 introduces no new forms.

The [measured delivery report](docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md) records the actual rendered sentence percentage across all fourteen days, five paces and normal/skip routes. `python3 tools/verify.py` refreshes it only after the full browser matrix passes. Its release fingerprint prevents reuse after code changes. [Potential capacity and exact missing forms/features](docs/grammar/GENERATION_COVERAGE.md) are separate diagnostics, not a teaching-percentage claim. `userVerified: false` permits evidenced provisional composition without certifying translations or pronunciation.

For a future human-edited spreadsheet, export CSV columns `lemmaId,plannedDay,district,teachingOrder,verifiedStatus` and run `python3 tools/import-curriculum.py input.csv proposal.json`. This creates an **unapproved proposal**; it cannot certify language. `content/CURRICULUM_OVERRIDES.json` is applied only with explicit curriculum approval, reviewer/date/reference, valid stable IDs and grammar-safe days. Curriculum approval never changes linguistic approval. Regenerate/check the audit with `python3 tools/curriculum-audit.py [--check]` after rebuilding.

The [cleanup dependency review](docs/maintenance/CLEANUP_REVIEW.md) records traced removals, retained behaviour, before/after UI captures and verification. The active workshop and Grammar Journal read the same curriculum. Supported current saves continue to work; obsolete tutorial profile/tile records are no longer supported. Missing frozen attempt presentation is rejected rather than rerolled.

Lexical distractors prefer actually introduced forms across parts of speech, including current-lesson study before a correct response or completion. If fewer than three distinct wrong alternatives remain, they use display-only Day-1 base vocabulary; this grants no acquisition, grammar or XP. Equivalent surfaces, listed senses and explicit accepted answers are excluded. Typing is an optional, independently planned category. Selection questions offer choices even for unstudied targets; typed English recall withholds the English meaning until submission or a scored “I don’t know” reveal. Low-supply assessments use vocabulary or approved phrase practice; a small eligible pool may repeat to preserve question counts, without extra word introductions or repeated XP. English rule-analysis quizzes and pronoun-category questions are retired. Browser save failures keep progress in this tab, show a nonblocking warning and offer Retry/JSON Export.

The historical browser performance baseline used paces 0/12/24. For a current supported profile, run `node tools/performance-benchmark.mjs --samples 20 --pace 12 --output work/p1/performance.json` (or `--pace 24`): fourteen-day progression with measurements on Days 1/7/13/14, desktop and 4× CPU mobile Chromium, heap, storage and ten bounded revision/Library sessions. This diagnostic is separate from functional verification and requires the same Playwright/Chromium setup.

The [coordinated audit remediation](docs/maintenance/AUDIT_REMEDIATION.md) records all twelve findings, save-conflict and assessment boundaries, focused refactors, retained evidence and final verification. Its [paired performance report](docs/maintenance/AUDIT_PERFORMANCE.md) measures the corrected Stage 3 release against the optimized deliverable; previous benchmark reports retain their historical results.

Browser saves use an origin-wide Web Lock around the final comparison and localStorage write. A concurrent losing tab keeps its memory state, warns and offers export/reload; records are never merged. Saves are asynchronous and pending same-tab snapshots coalesce. Closing with a pending write requests the browser’s unsaved-work prompt. Without Web Locks, saving fails visibly and export remains available; use a secure local origin or supported offline browser. Coordination covers participating current-release tabs, not unrelated scripts or old releases that bypass the lock.

Current delivery evidence and its release fingerprint are recorded in the [delivery report](docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md); preceding measurements are preserved separately. Saved choices are never rerolled: assessments containing retired rule/category questions are paused behind an explicit notice. The player can keep them paused, export, or explicitly retire and archive the exact attempt before starting new practical practice. Historical scores remain unchanged.

The [post-merge maintenance audit](docs/maintenance/POST_MERGE_AUDIT.md) records the current application boundaries, save guarantees, cleanup decisions, regression results and paired performance measurements. Historical checkpoint reports retain their original scope and measurements.

New challenges preserve the opening expression and mix independently allocated selection, Pashto construction and optional typing categories. Typing defaults off; its allocation becomes additional selection questions. Recognition does not claim prior study. Existing frozen attempts retain their exact questions until completed; the new rules apply to new attempts. Day transitions through bed/Quick travel wake beside the bed, while resuming retains the saved position. Muhammad Jan provides optional progress-sensitive guidance alongside his normal lessons. See [implementation and targeted validation](docs/rpg/DAILY_FLOW.md).

Answer feedback shows correct/incorrect status and only the actual Pashto, transliteration and English meaning. Shared rendering covers lessons, challenges, review and Library practice; accepted-answer validation is unchanged. Legacy tutorial profile cards, tile drafts and their migration logic have been removed. Such obsolete saves/drafts are rejected; new saves use the existing format numbers without compatibility adapters.
