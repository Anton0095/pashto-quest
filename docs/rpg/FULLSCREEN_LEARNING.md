# Full-screen learning and main synchronization

This records the earlier implementation checkpoint. [Current lesson layout, concise feedback, explicit entry and save impact](LESSON_UI_AND_ENTRY.md) supersede its fixed-footer, automatic-opening and legacy tutorial-draft behavior. The screenshots and verification below retain their original release scope.

PR #35 continues on `fix/ui-challenges-daily-flow`. Merge commit `6b5af7c` incorporates `origin/main` at `a193937` (merged PR #34, the 96×64 village redesign) without rewriting the shared branch. Conflict resolution retained both the village documentation/rendering and the UI branch's six fixes, two-column exploration and tests; generated files were rebuilt from the combined sources. The village model, browser collision/recovery checks, build and TypeScript checks passed before Learning Mode was changed.

## Presentation modes

Exploration retains the [two-column layout](TWO_COLUMN_INTERFACE.md): approximately 65% world and 35% sidebar above 1000 CSS pixels, stacked below that breakpoint. Dialogue, Menu, Quick travel and Library reference keep their existing contextual behavior. The [merged village layout, rendering, barriers and save recovery](VILLAGE_REDESIGN.md) remain intact.

Tutorials, ordinary lessons, spaced revision, dream lessons, challenges and their results use the available viewport. The world and exploration HUD are hidden; the Phaser scene stays mounted, with movement paused by the existing activity rules. The compact header shows Pashto Quest, the current day/chapter and the existing return action. Lesson title and question/study progress remain in the original learning components. Results retain their normal continuation/return actions, so narrative acknowledgements and compulsory activity gates are preserved.

`src/rpg/layout.ts` places the original DOM nodes and moves the same return control between exploration and learning headers. It introduces no progression store. `src/rpg/ui.ts` retains the activity lifecycle and chapter authority. `src/rpg/phaser-world.ts` avoids resizing a hidden container to zero; return to exploration fits the same scene to its current container. Position, NPC state, chapter, frozen questions, answer locks and saved drafts retain their existing owners.

`src/app.css` owns the viewport layout. Desktop questions use the extra width for a Pashto/instruction area beside choices or construction, with bounded line lengths and comfortable script sizing. A reserved feedback/footer area keeps Next in place before and after submission; yellow meaning/audio controls are retained. Tutorial study and interaction use two columns, with continuation below them. Narrow screens stack the activity content. Teacher/listener portraits, story context and audio notices remain available in expandable lesson details. No browser Fullscreen API is used.

Library reference remains contextual. Sentence practice, expression practice and explicit encountered-form practice expand the same native Library dialog to the viewport and hide the world. Its header retains the day, practice context and close control; returning to reference restores contextual sizing. Long reference/practice collections scroll inside the Library body, with close/navigation controls outside that scrolling area. Existing form/verification eligibility, answer evaluation, SRS and zero-XP practice rules are unchanged.

## Verification

`daily-flow-browser.test.mjs` completes the actual four-card tutorial and a full challenge at all five requested viewports. At the three desktop/laptop sizes it checks both initial and feedback states for internal overflow, as well as a stable Next position, bounded document, retained audio and yellow controls. Its laptop fixtures retain both sleep entry points, Day 2 bed spawn/resume/guidance and Day 4's required lesson.

`daily-lesson-browser.test.mjs` follows exploration → Quick travel → NPC conversation → Home lesson → study/grammar/generated sentences/questions/feedback → completion → exploration at 1920×1080, 1366×768 and 1280×720. Every active learning phase is checked for internal overflow. The player returns to the same NPC position.

`fullscreen-learning-browser.test.mjs` covers desktop/mobile mode switching and resizing while hidden without scene recreation, no native fullscreen, the mandatory tutorial exit guard, saved typed-draft reload with exact frozen questions, movement suppression, and all three Library practice types without XP. `two-column-browser.test.mjs` protects exploration geometry, pointer/touch mapping, collisions/camera, dialogs, Menu/Library/Quick travel and repeated resize behavior.

The repository's `python3 tools/verify.py --rpg` entry point includes these tests alongside the existing RPG, Phaser, portrait, persistence, sleep/dream, tutorial/profile and redesigned-village model/browser regressions, strict TypeScript, source/release syntax and build synchronization. The initial runner reported two stale UI assertions; both complete affected suites passed after their helpers were corrected (guidance continuation and expanded participant details). The validation record distinguishes that initial non-zero invocation from the passing focused reruns. See [validation output](fullscreen-learning/validation.txt) for actual command results.

| Viewport | Exploration | Learning | Submitted-answer state |
|---|---|---|---|
| 1920×1080 | [World](fullscreen-learning/exploration-1920.png) | [Recall](fullscreen-learning/meaning-1920.png) | [Feedback](fullscreen-learning/feedback-1920.png) |
| 1366×768 | [World](fullscreen-learning/exploration-1366.png) | [Recall](fullscreen-learning/meaning-1366.png) | [Feedback](fullscreen-learning/feedback-1366.png) |
| 1280×720 | [World](fullscreen-learning/exploration-1280.png) | [Recall](fullscreen-learning/meaning-1280.png) | [Feedback](fullscreen-learning/feedback-1280.png) |
| 768×1024 | [World](fullscreen-learning/exploration-768.png) | [Recall](fullscreen-learning/meaning-768.png) | [Feedback](fullscreen-learning/feedback-768.png) |
| 390×844 | [World](fullscreen-learning/exploration-390.png) | [Recall](fullscreen-learning/meaning-390.png) | [Feedback](fullscreen-learning/feedback-390.png) |

## Limits

Standard tested desktop/laptop Day 1 lessons and challenges fit without internal or page scrolling. Exceptionally small viewports, expanded supporting notes, long grammar workshops and long Library collections use controlled internal overflow; their essential continuation/close controls remain accessible. Mobile uses Chromium touch emulation, not physical Safari verification. Audio regressions do not certify native pronunciation. There is no standalone lint script; strict TypeScript and JavaScript syntax checks are used.

The complete fourteen-day educational delivery matrix and benchmarks are separate from RPG verification and were not rerun. Historical reports, screenshots, release fingerprints and benchmark results retain their original scope. Educational definitions, approved Pashto, grading, vocabulary allocation, challenge sequencing, narrative progression, rewards and save schemas are unchanged by Learning Mode. The branch remains unmerged into main.
