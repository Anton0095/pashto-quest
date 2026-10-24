# Library and cumulative vocabulary implementation

Historical handover report. Current pacing and district changes supersede its lower-pace restrictions; see [district results](DISTRICT_IMPLEMENTATION_RESULTS.md).

Implementation branch: `codex/implement-library-vocabulary-20261024`.
Base: `codex/handover-library-vocabulary-20261024` at `d4001d24fafadf64a628100651a54c9e90e881da`.
That branch contains Week 2 development commit `19f3660ba51ce0be589ae89078f1829e20e6fe06` and gameplay commit `b7824fb`. No reference HTML replacement, main merge, reset or force push is involved.

## Play and review

Open the standalone `index.html` in a supported browser, or run `python3 -m http.server 8000` from the repository root. Text, reference pages, quizzes and persistence use no runtime JSON fetch, API or backend. Existing browser policies may prevent direct `file://` navigation; that is distinct from offline gameplay after delivery.

A fresh player sees the five-location map and meets Muhammad Jan at the Library. Choose an available pace, finish the existing four greetings, then explore four teaching locations or skip to the 15-question Library home-handover challenge. A first 12/15 pass grants the home and the original XP checkpoint atomically. Opening Home before the award shows Muhammad Jan's Home; afterwards it shows Your Home. All later stories and Week 1/2 gates remain in place.

Use the persistent Library button during exploration, study or a challenge. The reference dialog preserves the active exercise, traps keyboard focus, closes with Escape and returns focus. Its Vocabulary Bank supports search, sorting, day/location/POS/status filters, encountered-form details, attested examples, pronunciation fallback and voluntary practice without XP. Useful Expressions holds tutorial greetings separately. Grammar Journal reveals only encountered/demonstrated rules. Learning Pace distinguishes the current frozen plan from the next unstarted day.

## Data and offline build

- `content/LIBRARY_LEXICON.json`: 127 explicit lemma identities, including 108 quota-counting content entries; attested forms, source-card aliases, fixed example sentences, review metadata, fourteen grammar references, greeting phrases, story requirements and contextual Day 1 sentence targets.
- `src/library-engine.js`: pure schema migration, actual exposures, form-specific attempts/SRS, summary/status calculations, deterministic constrained allocation and frozen plans. A capacity matching step reserves the vocabulary needed by preserved story examples before adding new cards. Unsupported quotas produce explicit content gaps.
- `src/library-ui.js`: Library views, optional practice, current lesson/challenge integration, reference overlay and saved challenge restoration.
- `tools/embed_library.py`: bundles the editable sources into `index.html`. Run it after changing lexicon/runtime sources, then run `python3 tools/embed_library.py --check`.
- `index.html`: standalone output plus integration hooks; original GAME_DATA and Week 2 source bank are retained. `python3 tools/embed_week2.py --check` still checks the original Week 2 pipeline.
- `tests/library-vocabulary.test.mjs`: pure logic and real Chromium acceptance flows at 1280px and 375px. Existing Week 1/2 tests change only their map-count selector to count the four teaching locations separately from Library.

Source mappings use editorial lemma IDs, not English gloss matching or runtime text stemming. The historical duplicate `a-clean` cards both represent the same explicitly mapped lexeme; migration does not infer a unique historical lesson/location from that ambiguous ID. Singular/plural books, chairs, baskets, notebooks, noun/adjective agreement variants and attested present-tense paradigms share canonical identities. Distinct lexemes such as the two authored verbs translated “sell” remain distinct.

Day 1's original 2–3 sentence courses are supplemented to five model targets per location by reusing existing authored present-tense description sentences, with English scene context for books, bread and drinking water. No new Pashto translation or automatic word substitution is introduced. All original targets remain. Later courses retain their five original sentence targets, Week 2 dialogues, unused distractor tiles, speaker/recipient roles and narrative openings.

## Persistence and migration

The localStorage key remains `pashto-town-days-v1`. Existing XP, stats, lesson completion, question reward keys, challenge attempts/clears, Week 1 exam version, graduation and Week 2 title cap are preserved. Core save schema becomes 3; the nested Library schema is 1. Historical started days, identified from completed visits, actual card stats, grammar-introduction flags or challenge attempts, retain their original course cards. They do not receive retroactive vocabulary plans; pace changes apply to future unstarted days.

Acquisition comes from displayed study/quiz content and submitted answers. Plans, day unlocks and mere references do not acquire words. Greetings are separate. Each form records actual practice and spaced due dates. Mastery requires successful spaced repetitions of every encountered form; encountering an additional unpractised form removes the mastery label. Voluntary Library practice never awards XP. Each exercise submission has an idempotent event key. Existing lesson/challenge XP policies remain responsible for their original rewards.

Migration imports only cards with actual `stats.seen` evidence; it conservatively imports known forms without claiming native review or inherited mastery. Existing `personIntros`/`sovSeen` exposure flags can unlock their grammar notes. A later clear alone cannot unlock unseen grammar. A legitimate Day 1 pass implies `homeGranted`; tutorial-only saves do not receive a home or replay their tutorial.

Representative tested trace: a legacy Week 2 save with 5,000 XP, valid Week 1 exam flags, cleared Days 1–14, two completed visits, original reward keys and `n-door` stats (`seen=3`, `correct=2`, `stage=2`, `dueAt=123`) retains those fields after migration twice. It gains `homeGranted=true`, requested future pace 20, and an encountered/practised door record with legacy context. It does not acquire fish or unlock Day 14 grammar without exposure evidence. Generic old 15-question Day 7 clears still do not graduate.

In-progress challenge snapshots preserve the exact selected questions, index, built tile indices, submitted answer, first-answer lock, attempt identity and score/XP state. Reloading a submitted answer reconstructs feedback without grading or paying it twice. Returning to town keeps a Resume action. Opening Library does not discard or restart the attempt.

## Remaining content limitations

This is a development implementation, not a native-reviewed curriculum release. All lexical/forms/grammar examples retain `needsReview`; no authentic Laghmani recording or native review is claimed. The original Week 2 draft review requirement remains.

The current source contains **108** distinct content lemmas, so it cannot deliver 140 or 280 new distinct lemmas across seven/fourteen normal days. Nor can the existing Day 1 story fit into 8, 12 or 16 distinct new lemmas. Those presets remain visible but disabled for that story; 20 and 24 are supported and browser-tested to produce exactly their stated full-day acquired totals. The planner can use smaller quotas on later days when known vocabulary/story constraints and supply allow. Unit fixtures separately exercise even allocation for all five presets.

Pace applies to scheduled content, not guaranteed mastery. Story exposure can encounter an entry before its assigned location is visited. A frozen day's target that cannot cover preserved narrative vocabulary or available safe content is explicitly marked unsupported, with actual scheduled/encountered totals displayed; no lower target is silently substituted. Partial/skip routes retain their true encounter counts. More carefully authored/reviewed sentence alternatives and lexical candidates are required for every preset on every day. The existing curated fallback assessments remain playable when the pool is exhausted.

The planner reuses attested fixed constructions and due acquired words rather than synthesizing new Pashto sentences. Full variable safe-template substitution awaits approved grammatical models. This intentionally leaves the handover's broader synthesis/content-volume objective incomplete instead of inventing unreviewed translations.

Chromium desktop/mobile automation is covered. Physical iPhone Safari, native language/audio review and manual pronunciation quality remain unverified. See `LIBRARY_TEST_RESULTS.md` for actual executed checks and outcome distinctions.
