# RPG prototype architecture

This branch builds a playable Day 1 RPG from main commit `a28d02810fe39afa7a80618d27736b866c3c5bf9` (merged review PR #23). It does not modify the production main branch. The generated `index.html` is the RPG release; editable sources remain `src/` and `content/`, assembled by `python3 tools/build.py`.

## Ownership and dependencies

| Module | Responsibility |
|---|---|
| `rpg-world-engine.js` | Pure deterministic grid movement, collision, safe spawns, map transitions, camera; adjacent-object detection |
| `rpg-renderer.js` | Original integer-rectangle pixel art; visible tile culling, depth-sorted sprites and interaction marker |
| `rpg-content.js` | Registry, day/location schedules, conditions and event resolution; dialogue sequence presenter |
| `rpg-progression.js` | Configured chapter policy and prototype boundary; delegates all educational authority |
| `rpg-ui.js` | Input/lifecycle, dialogue action dispatch, lesson/assessment/Library adapters, pause/menu and completion presentation |
| `rpg-persistence.js` | Independently validated world envelope, position recovery, appearance/flags, paired transient lesson resume |
| `content/RPG_WORLD.json` | Tile definitions, two maps, six NPC placements, reference object, English events, Day 1 registration |
| Existing `lesson-ui.js` / `tutorial-ui.js` | Authentic educational presentation plus resumable session rendering; no replacement lessons |
| Existing `storage.js` | Schema-7 saves, validation and coordinated writes; accepts an explicit storage key |

The simulation receives only maps, positions, direction and current NPC occupancy. It cannot see player knowledge, grade an answer, grant XP or trigger a hardcoded Day 1 lesson. The registry and adapter resolve eligible story events; the dialogue engine displays lines and emits typed actions. Input pauses when a lesson, result, menu, Library or dialogue is open, when the page is hidden, or when focus is lost. Movement and interaction do not run behind modal controls. One animation loop performs drawing only when dirty; there is no per-frame DOM rebuild. Key repeat cannot reopen dialogue; release clears held input. Touch pointer capture is released on up/cancel/lost capture.

## Educational authority

`library-engine.js` remains the sole lexical/form acquisition, allocation and SRS authority. `sentence-engine.js` and existing JSON frames compose every instructional sentence. `learning.js` and `question-engine.js` retain answer evaluation, retries and first-answer locks. `progression.js` retains lesson completion, challenge activation, rewards, catch-up and XP. `save-schema.js` validates the educational save and compiler proofs. `construction-ui.js`, `audio.js`, the Library and all curriculum/language registries are reused.

NPC lesson actions launch the existing lesson IDs; challenge actions launch/resume the existing assessment UI. Challenge activation still unlocks the frozen four-location assignment before selection without fabricating study. Passing still completes missing locations and grants once-only rewards through `completeChallengeOnce`. The RPG completion screen reads the recorded result; it never writes scores or rewards. The Day 1 content and action-verb restrictions are unchanged. No new Pashto translation or approval claim was added.

## World format

A tile definition maps one character to `{walkable, kind}`. A map has a stable ID, equal-width `tiles` rows, `spawn`, `transitions`, optional named `regions`, and building art rectangles. Walls, water, trees and stalls block movement. Collision combines tile walkability and current NPC occupancy. An entrance is a walkable tile with `{x,y,to,spawn:{x,y}}`; stepping onto it switches map atomically. Place return spawns outside the destination trigger to prevent bouncing between maps. The Library has an interior and two door exits. Other districts use outdoor courtyards and lesson interaction points.

NPCs declare stable `id`, display `name`, `sprite`, `event`, optional condition, and `schedule:[{day,map,x,y}]`. Schedules select a placement for a day, allowing later relocation without movement changes. The prototype uses static placements; autonomous time-of-day movement is not implemented. Registry validation rejects unknown events, maps and blocked NPC tiles. Objects use the same event path, without character rendering.

An event contains `speaker`, English `lines`, and actions with `label`, `type` and optional condition. Supported actions: `flag`, `tutorial`, `lesson` with `lessonId`, `challenge` with `day`, `reference`, `completion`. Conditions are named predicates supplied to the registry, currently `beforeTutorial`, `afterTutorial`, `passed`. World flags carry narrative information only. New condition concepts belong in the event/progression adapter, not collision/rendering.

## Persistence and failure recovery

| Key | Payload |
|---|---|
| `pashto-town-days-v1` | Production save; never read or written by the RPG profile |
| `pashto-quest-rpg-education-v1` | Existing schema-7 educational payload with original validator and Web Locks coordination |
| `pashto-quest-rpg-world-v1` | World schema 1: position/map/facing, independent appearance, completed event flags, NPC flags, trigger flags, last view and optional lesson UI snapshot |

Appearance is explicit masculine/feminine/neutral and never inferred from a name or gender preference. New players start neutral and can choose in Menu. Educational name/gender controls remain unchanged.

World validation accepts only known maps, integer walkable coordinates, supported facing/appearance, bounded boolean flags and recognized views. Unsafe coordinates recover to the current valid map's spawn or a safe tile; unavailable maps recover to the village. Current NPC collision is checked again before world entry. Corrupt world state cannot reset or rewrite educational progress. Unsupported/corrupt educational schema stays untouched behind the existing explicit-reset dialog. There are no legacy save imports or migrations.

Active challenges remain entirely in the educational snapshot: exact questions, choices, source proofs, tile ordering/placement, submitted response, feedback and score locks. The world envelope does not duplicate challenge grading state. Paused lessons serialize their transient queue, choices, indexed construction, passed/firstAsked sets and phase. A fingerprint pairs that snapshot with the exact educational JSON; a mismatched or invalid transient lesson is discarded, preserving acquired knowledge. On boot the paired lesson is restored **before** educational history compaction so its event IDs remain protected. Rendering a locked response never resubmits it. A Library tutorial reload retains the step and completed-response lock; an unfinished tutorial tile arrangement currently restarts that arrangement.

Writes debounce during movement and use a separate world Web Lock plus observed-value comparison. Concurrent changes are rejected instead of merged. Educational saves must settle successfully before a paired world snapshot is written. The stores are deliberately not transactional: if a tab closes between them, the safer recovery is the village with educational knowledge retained. World positions can lag the last step by the 180ms debounce. Use local HTTP/HTTPS for durable Web Locks; unsupported browsers retain the existing export/fail-closed warning. Physical Safari remains unverified.

## Chapter boundary and verification profiles

`firstDay`, `lastDay`, and the registered day IDs define the adapter's playable range. This release registers only Day 1 and clamps restored/replayed navigation to it. Lesson and assessment entry points reject unavailable days; passing Day 1 retains its authentic completion and home award while showing the terminal sequence. Day 2 cannot become playable through the normal UI or an active future-day snapshot.

The default release embeds `RPG_ENABLED=true`. The existing browser fixture explicitly selects `false` for the retained educational shell so the fourteen-day/seven-pace regression matrix can continue validating shared engines. New RPG tests select `true` and use the actual default RPG UI. This switch changes navigation/persistence profiles, not evaluation or curriculum. It is not a URL setting or player-accessible Day 2 escape.

`rpg-world.test.mjs` checks simulation/registry/reachability; `rpg-persistence.test.mjs` checks recovery, competing writers and chapter policy. `rpg-browser.test.mjs` drives public controls at 375/1280px through the complete normal route, early failure/retry and exact lesson/challenge reloads. It uses read-only saved JSON as an assessment oracle, without an injected runtime bridge or score mutations. The full verifier includes these tests alongside the retained educational matrix. `tools/rpg-performance.mjs` separately measures loopback load, input-to-render, transitions, heap endpoints and storage in desktop and 4× CPU mobile-emulated Chromium.
