# Typed opt-out and Bilal completion repair

This follow-up supersedes the physical-Lake-only gate and missing-target greeting fallback described in the preceding [Sleep/Dream release](SLEEP_AND_CONVERSATIONS.md). It changes neither the curriculum nor the previously approved Day 2 third-person / Day 3 first-person schedule.

## Implemented behavior

Every typed tutorial, ordinary lesson and assessment question displays **I cannot type**. Muhammad Jan's name interaction sets `enableTypingChallenges` immediately: a correct typed name enables it; opting out disables it; a wrong name leaves the setting unchanged and permits retries. Opt-out completes the interaction without adding it to `passed`, awarding answer XP or writing practice/mastery. Both completed tutorial routes use the existing shared village introduction. A tutorial or ordinary lesson containing skipped required items receives no lesson-completion XP bonus; correctly answered items retain their normal rewards.

Outside the tutorial, opting out preserves the preference, consumes the existing question, records a skip and advances immediately. It neither replaces the question nor calls the SRS practice transaction. Assessment skips count in `answered` and the original denominator, with zero correct answers and zero answer XP. They cannot be submitted again while locked. The existing lesson completion, assessment result and reward authorities remain in charge; there is no parallel score or practice store. “I don’t know — reveal meaning” retains its existing incorrect-answer practice behavior and is distinct from skipping.

Unfinished current-format assessments retain `skippedQuestions` as question indices alongside the exact frozen questions. Paired RPG lesson snapshots retain `skippedItems` separately from correct `passed` items. Missing skip fields remain valid for existing format-8 saves. Save validation rejects invalid skip lists, including non-typed assessment positions and impossible correct totals. Finished assessments retain the existing aggregate result format. No save migration, reset, reroll or retrospective regrading is introduced.

New challenge category planning remains unchanged:

| Questions | Typing off: selection / construction / typing | Typing on |
|---|---|---|
| 15 | 10 / 5 / 0 | 5 / 5 / 5 |
| 25 | 17 / 8 / 0 | 9 / 8 / 8 |

Direction balance and documented material-shortage adaptations remain unchanged. Fresh profiles still default to typing off; a successful typed tutorial answer now turns it on. Changing the setting does not rewrite a paused assessment.

## Bilal root cause and repair

Two independent gates caused the greeting-only defect. NPC routing consulted physical-Lake flags instead of educational completion; early challenge passes already completed `N-nature` but never set those flags. Separately, response sampling returned an empty list when the exact intended proposition was absent from the actually unlocked sentence pool. Low vocabulary paces could therefore keep even eligible players at a greeting.

All seven days now use one predicate: the current day's educational `complete['N-nature']` **or** `progression.passedChallenge`. Activation or failure alone does not qualify. Challenge passes retain their existing completion behavior without inventing actual study, acquisition attempts or SRS mastery. Obsolete physical-Lake metadata and its writer are removed; old inert world flags are harmless and require no migration.

An eligible exchange opens with the existing greeting plus the authored daily statement. The exact intended compiler ID, Pashto and meaning must match. If that target is missing from the unlocked pool, `learning.authoredResponse` restores the existing licensed compiler binding and checks its earliest day. This read-only narrative fallback does not introduce or teach a form, change the study plan, unlock grammar or enter ordinary question generation. Distractors still come exclusively from the actual unlocked sentence pool, exclude the topic lemma and duplicate meanings, and are limited to three. A scarce pool can offer just the validated intended response; eligibility no longer silently degrades to a greeting because of sparse material.

Canonical intended responses remain `اوبه سړې دي.`, `دینه کب ویني.` and `زه کب وینم.` on Days 1–3. The lexicon's approved `دینه` spelling and existing pronunciation aids are retained. Days 4–7 continue the unresolved fish mystery. Relevant and irrelevant choices lead to different contextual reactions and then a conclusion. Reaction/conclusion cursors resume before repeat dialogue; acknowledged exchanges use the shorter repeat on later visits. All speech retains Pashto, transliteration and available audio controls without spoken English translations, learning writes or rewards. Deena's lesson path and NPC schedules are unchanged.

## Sequential implementation and refactor

Phase 1 implemented both fixes. Phase 2 passed the functional checks below before commit `7d09f66`, which records the verified implementation. Only then did Phase 3 begin.

The focused refactor:

- `typed-answer-ui.js`, composed by `app.js`, renders shared accessible typed input, submit, optional reveal and opt-out controls for `tutorial-ui.js`, `lesson-ui.js` and `challenge-ui.js`. Callers retain submission, preference, saving and advancement responsibilities.
- `question-engine.js` owns the common typed-format predicate used by rendering, learning transactions and assessment-save validation. `learning.js` owns the shared passed-or-skipped completion predicate and the single tutorial preference update.
- `save-schema.js` validates skip metadata after validating the assessment shape. `rpg/persistence.ts` keeps skips separate from correct lesson answers within existing snapshot validation.
- `rpg/conversations.ts` owns educational eligibility, relevance selection and reaction/repeat routing. Intended-response restoration is lazy, and the pool is searched without copying it to append a fallback. `rpg/ui.ts` wires the existing story director to those decisions.
- `RPG_WORLD.json` and the boundary types no longer carry unused physical-Lake prerequisite fields. The unused test-fixture flag path and an unreachable tutorial feedback branch were removed. No unrelated planner, curriculum, progression, schedule or SRS rewrite was needed.

## Verification record

Phase 2 passed TypeScript, the production build and build consistency, these 16 suites, and the four additional focused browser suites below. Phase 3 passed the same 20 suite commands (16 listed regression suites plus four additional focused browser suites), TypeScript, production build and build consistency. No significant functional failures remain. [Recorded outcomes](typing-bilal-validation.txt) separate the pre-refactor baseline from the final repeat.

Run each named suite with `node tests/NAME.test.mjs`:

| Suites | Coverage |
|---|---|
| `typing-bilal` | Correct/wrong/skipped tutorial; no-write lesson skip; 15/25-item skips, zero marks, duplicates and frozen saves; 140 day/pace/route cases and 70 intended-only sparse exchanges |
| `quest-improvements`, `authored-conversations` | Quotas, direction balance, approved schedule boundary, compiler proofs, frozen prior scheduling metadata and narrative content |
| `practical-assessment`, `challenge-activation`, `assessment-randomness` | All 14 days × five paces × two routes: 140 assessments / 280 model visits; thresholds, availability, random selection, frozen snapshots and no invented study |
| `rpg-persistence`, `rpg-world`, `rpg-foundation`, `rpg-week1`, `rpg-narrative-audit` | Save boundaries, events, schedules, chapter/route gates, identities and reward locks |
| `narrative-feedback`, `house-sleep-dream`, `resume-behaviour`, `concurrent-save`, `audit-compaction` | Both feedback outcomes, tutorial/review boundaries, exact locked restore, duplicate rewards, concurrency and bounded practice history |
| `typing-bilal-browser` | 1280/390px: both tutorial routes and identical shared intro, incorrect retries, saved setting, public skip/auto-advance, frozen reload, 14/15 result, lesson skip/reload; all seven days × four eligibility routes, both reactions, Pashto/audio controls, reaction reload, repeat and zero learning writes |
| `tutorial-profile-browser`, `quest-improvements-browser` | Existing public onboarding/profile, settings, typed drafts/locks and village features at desktop/mobile widths |
| `sleep-conversations-browser` | Seven actual Lake lessons at 1280/390px, both replies/conclusions, reaction reload/repeat, unchanged Deena lesson access; normal/reduced-motion Sleep/Dream and permanent-state isolation |

Additional final model checks passed: `current-model`, `game-state`, `generated-architecture`, `construction-completion`, `choice-quality`, `p1-storage`, `lesson-progression-fixes` and `generation-cache`. These cover the shared question predicate's wider contracts; the generation cache reports unchanged full-card, 20-seed and dialogue payload digests on all fourteen days. Source JavaScript syntax, build/verifier Python syntax, changed documentation links and diff whitespace checks also passed.

The older `authored-conversations` pool-only test still measures 22 present targets and 13 missing targets across paces; that is a sentence-pool observation, not current conversation eligibility. The new suite supplies the validated fallback and proves all eligible cases remain interactive. Initial browser fixture issues (final-question completion, nested text selection, terminal-day routes) were corrected before the all-green Phase 2 baseline; no refactor started during those failures.

## Limits

Generated combinations, inflections and authored narrative speech remain editorial language drafts requiring qualified Afghan Pashto review. Base spelling approval is not native certification of complete sentences or recordings. Audio controls and Chromium emulation do not establish hardware audio or physical-device behavior.

Following the requested focused scope, no complete seven-day public RPG playthrough or fourteen-day browser delivery matrix was repeated. The fourteen-day assessment **model** matrix was repeated. Prior delivery reports, fingerprints, screenshots and performance observations remain evidence for their recorded release; they were not rewritten to imply coverage of this build.
