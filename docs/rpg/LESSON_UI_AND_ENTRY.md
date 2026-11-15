# Lesson UI, feedback and explicit entry

> Current ordering and tutorial policy: [School-first curriculum](../../CURRICULUM.md#daily-allocation) supersedes this checkpoint’s opening, optional-tutorial and equal-allocation rules. Historical validation below remains evidence for its recorded release.
> This records the preceding release. The subsequent [lesson/progression fixes](LESSON_PROGRESSION_FIXES.md) supersede name projection, Day 2 ordering, pace and save-format statements where applicable; original validation remains release-specific.


This follow-up continues PR #35 on `fix/ui-challenges-daily-flow`. `origin/main` was fetched before editing and was already included at `a193937`. The village, Phaser architecture, full-screen Learning Mode, two-column exploration and prior six fixes remain.

## Layout and feedback

`src/app.css` now uses intrinsic activity and footer rows instead of fixed feedback reservations and overlapping overrides. At desktop sizes, Pashto/instructions and answer/construction controls share the available width. The footer remains in the viewport as feedback changes. On a small screen, the question body is the only quiz scroller; study/grammar use the lesson surface instead. Expanded supporting notes switch to that outer surface, avoiding nested scrolling regions. Pashto sizing and touch controls remain readable.

`src/answer-feedback.js` renders correct/incorrect status and one actual-question translation: Pashto (transliteration) — English. Lessons, restored responses, challenges, construction, tutorial and Library/review activities use it. Construction retains success-only sentence audio. The evaluator still accepts exactly the same alternative answers; grading, XP, SRS and rewards are unchanged. Explanatory acceptance prose, duplicate formatting and cached rendered feedback text are removed.

## Entry and narrative

Waking, entering an area, ordinary travel and returning from a lesson do not open dialogue. Interacting with the designated teacher offers its introduction and study/explore choices. After completion, lesson actions are labelled Review and require another explicit choice. Follow-up dialogue and map-scoped arrival content remain registered and are presented when the matching character is next approached and interacted with.

Quick Travel begins an available lesson directly, moving near its teacher when that placement is available. It uses the same `lessonEligible` guard and `beginLesson` starter as NPC choices. Day prerequisites, introductory-course locks, lesson pools, vocabulary unlocks, completion and reward identities remain authoritative in the educational services. A deliberate introductory-course selection acknowledges the existing opening through the story director; it does not grade or complete the lesson. Muhammad Jan's guidance, Day 4's Home teaching, normal/skip routes, challenge acknowledgements and genuine-pass sleep guards remain.

Removed code includes the per-frame/map-entry dispatcher, automatic chapter-opening mode, post-lesson queued cursor/resume helper, obsolete Nature-lesson diversion to the Hills finale, duplicate explanation builders, unused profile aliases, the unreachable tutorial tile renderer and its migration/validation scaffolding. Hills and its story/challenge remain accessible through normal world interactions. `resumeEvent` on an opening lesson now identifies its next explicit teacher conversation.

## Save impact

Old-save compatibility is intentionally not maintained. Retired tutorial profile card IDs, profile-step drafts and greeting-tile drafts are no longer supported; obsolete records are rejected without migration and may require restarting/resetting that old progress. Raw rejected educational saves retain the existing fail-closed/export/reset handling rather than crashing or silently overwriting them. No new schema or blanket reset was introduced: new saves still use educational format 7/world format 1, and current save/draft/reload behavior is tested. The original save guarantees in earlier reports describe their checkpoints.

## Targeted validation

The cleanup checks cover:

- Actual Day 1 Home completion through NPC and Quick Travel, with identical pools, introduced forms, completion and XP; return to the same position with no dialogue reopening.
- Quiet Day 2 spawn/location entry, teacher introduction and decline, locked destinations, direct School start, and Day 4's required Muhammad Jan lesson.
- Correct and incorrect word/expression/typed/construction feedback against the actual question, retained audio, stable Next, and no desktop internal/page overflow.
- Complete Home lessons at 1920×1080, 1366×768 and 1280×720; complete tutorials/challenges at those sizes plus 768×1024 and 390×844. Mobile fallback keeps Next accessible with a single content scroller when necessary.
- Memory Trail review with the original paused challenge retained, all three Library practice types without XP, current draft reload, retained scene identity, sleep/bed spawn, Day 2 resumption/guidance and narrative acknowledgement gates.
- Strict TypeScript, production build/synchronization, changed source/test syntax, and focused acceptance/choice, approved-sentence, world/foundation/persistence, seven-day policy/narrative, sleep/dream and audio models. No standalone lint command exists.

See [actual validation output](lesson-cleanup/validation.txt). Updated long-route tests follow the new explicit interaction contract, but the complete seven-day and fourteen-day browser playthroughs were not repeated: this task requested targeted checks and no unrelated playthrough. Historical reports/benchmarks remain unchanged. Touch uses Chromium emulation; physical Safari and native pronunciation remain unverified.

| Viewport | Incorrect feedback | Correct feedback |
|---|---|---|
| 1920×1080 | [View](lesson-cleanup/incorrect-1920.png) | [View](lesson-cleanup/correct-1920.png) |
| 1366×768 | [View](lesson-cleanup/incorrect-1366.png) | [View](lesson-cleanup/correct-1366.png) |
| 390×844 | [View](lesson-cleanup/incorrect-390.png) | [View](lesson-cleanup/correct-390.png) |

Additional [desktop typed recall](lesson-cleanup/meaning-1920.png), [laptop feedback](lesson-cleanup/feedback-1366.png) and [mobile challenge](lesson-cleanup/feedback-390.png) captures demonstrate the shared interface.
