# Responsive learning and daily flow

The application uses a viewport-bounded shell and height-aware canvas sizing. Canvas dimensions retain their logical aspect ratio; small screens scroll the learning panel internally. A shared scrollable question body keeps the feedback/Next footer at a stable viewport position. Height rules include `vh` fallbacks for browsers without dynamic viewport units. The typed-recall Submit/reveal controls reuse `.speaker`, including its interaction states.

The base-approval study notice and unavailable-expression notice are removed from learning presentation. Verification metadata remains intact. The three untranslated Day 1 alternative location slots have been removed from playable narrative data and their exclusive renderer/lesson dependency has been deleted. The approved Welcome and daily greetings remain; ordinary location words and positional grammar are unchanged. Historical editorial proposals remain evidence, not teaching content.

`questions.js` selects recognition for the first three new challenge questions, or all questions in shorter challenges. Later unstudied lexical recall remains typed; intervening recognition separates adjacent typed items. Eligible material and choices remain seeded and varied through the existing generator. Fixed greetings/phrases always select English translations, including the two tutorial greetings. Productive sentence construction retains the shared tile renderer. `recognition` is a validated optional presentation flag, independent of `unstudied` and form/grammar licenses. Recognition grants no fabricated study or mastery. Counts, thresholds and reward identities remain unchanged.

Existing frozen challenge attempts keep their original questions, scores and drafts until completed. Newly generated attempts use the new rules. Supported paused tutorial drafts and recorded answers remain readable; an unsubmitted former greeting tile activity now uses translation selection. No old-schema migration or silent reset is added. Education schema 7 and world schema 1 remain unchanged.

`src/rpg/daily-flow.ts` resolves day-transfer spawns from the bed object's current position and walkability. `enterChapter` uses it for both sleep entry points; ordinary boot/resume and returning home retain existing position handling. Initial Day 1 onboarding keeps its existing introduction. New days after that transition wake beside the bed. The chapter's ordinary opening dialogue remains authoritative; optional guidance never runs automatically at waking.

Each chapter's `guidance` declares its introductory lesson, destination, character and before/after/pass text. Muhammad Jan's existing interaction receives the current guidance without losing its normal lesson actions, including Day 4. Available remaining destinations resolve through live NPC schedules and event eligibility, so visiting teachers are named at their actual location. Missing guidance uses remaining activities or a home/sleep fallback. Guidance does not grade answers or write a separate progression store.

## Validation

Targeted model checks cover low/default supply on Days 1/2/7, opening restrictions, typed spacing, phrase selection with exactly one accepted option, frozen snapshots/current-save validation, bed placement and configured/fallback guidance. Browser checks cover 1920×1080, 1366×768, 768×1024 and 375×812: the revised tutorial, a complete challenge, later typed recall, shared button styles, stable document scroll position and Day 2 bed spawn. Complete Home lessons at both desktop and laptop sizes also exercise actual study, grammar, generated sentences, word/construction answers, feedback and return without document scrolling. Additional laptop checks exercise guidance before/after the introductory lesson and after passing, Day 4's required lesson, saved-position resumption, and bed collision/interaction after resizing. Ready-for-challenge guidance also names the live challenge host and destination.

The existing tutorial/profile, audio, approved-sentence, curriculum-expansion, practical-assessment and RPG foundation/persistence regressions are also checked. The practical-assessment model suite covers 196 attempts; this is separate from the omitted full browser matrix. Screenshots are under `daily-flow/`. The user requested targeted validation rather than an unnecessarily long playthrough: the full fourteen-day browser matrix, benchmark reruns and delivery-report refresh are omitted. Historical reports retain their release-specific results. Viewport emulation does not establish physical iPhone Safari behavior or native pronunciation.

There is no standalone lint script in this repository; strict TypeScript and JavaScript syntax checks cover the changed code. Physical-device testing and a full curriculum delivery refresh are not claimed.

| Viewport | Running-game capture |
|---|---|
| 1920×1080 | [Desktop](daily-flow/meaning-1920.png) |
| 1366×768 | [Laptop](daily-flow/meaning-1366.png) |
| 768×1024 | [Tablet](daily-flow/meaning-768.png) |
| 375×812 | [Mobile](daily-flow/meaning-375.png) |

The [study-card capture](daily-flow/study-1366.png) also shows the removed notices without an empty note block.
