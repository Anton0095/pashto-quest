# TypeScript / Phaser Week 1 architecture

Current map/schedule behavior: [permanent Hills and the Day 6 invitation](HILLS_EXPANSION.md) supersede the earlier eastern spur, Day 6-only access and Medina-at-Lake introduction. Historical verification figures below retain their original scope.


See the [Sleep/Dream and authored-conversation follow-up](SLEEP_AND_CONVERSATIONS.md) for current transitions, Bilal's branching practice, actual Lake prerequisites and the authorized Day 2 form schedule. Earlier implementation and validation statements below describe their recorded release.


Current follow-up: [Library, Nayab, shared onboarding, optional typing planner and Bilal dialogue](QUEST_IMPROVEMENTS.md) supersedes earlier mandatory-tutorial/typed-recall and English Bilal descriptions. The four teaching locations, learning authorities, save version and chapter boundary remain unchanged.

This is the current architecture after the merged Week 1, movement and house/sleep/dream packages. The [post-merge audit](../maintenance/POST_MERGE_AUDIT.md) records the maintenance baseline and validation. Phaser 4.2.1 remains locally bundled; TypeScript RPG modules remain strict. The existing Python/esbuild pipeline and JavaScript educational authorities are retained. See the current [house/sleep/dream state handling](HOUSE_SLEEP_DREAM.md), [overhaul report](MULTIDAY_OVERHAUL.md) and historical [Week 1 implementation](WEEK1_IMPLEMENTATION.md) for registry, route flow, schedules and play instructions.

| Module | Responsibility |
|---|---|
| `types.ts` | Chapter/route/event/actor/world contracts and typed educational interfaces |
| `chapters.ts` | Chapter references, map events, host maps, prerequisites, opening/ending, genuine-pass completion and next resolution |
| `routes.ts` | Actual normal/skip narrative choices and their event requirements; no educational state mutation |
| `story.ts` | Durable cursor, not-started/in-progress/completed status, once-only effects and flags; no queued post-lesson dialogue |
| `content.ts` | Validated maps/identities/schedules/events, conditional choices and multi-speaker/listener DOM dialogue |
| `ui.ts` | Selected RPG chapter, educational adapters, serialized chapter transfer, contextual dialogs, keyboard/touch lifecycle and completion/history UI |
| `layout.ts` | DOM placement of existing screens, persistent HUD and contextual panel; observed panel bounds for dialogs and canvas sizing |
| `phaser-world.ts` | Sole live world engine: tilemaps, collisions, bodies, sensors, movement/tweens/animation, camera, procedural textures and resource cleanup |
| `village-art.ts` | Cached ground, adobe buildings, shoreline and environmental artwork; registry geometry and ground-footpoint depth; no movement or educational state |
| `activities.ts` | Bounded ambient routines, settled positions, destination reservations and selected-target holds, driven by the sole Phaser update loop |
| `movement.ts` | A* paths, clear NPC interaction lines, automatic/manual instruction arbitration over the Phaser stepper |
| `world-data.ts` | Static content validation, walkability for spawn/reachability and invalid-position recovery; no parallel movement engine |
| `progression.ts` | Registered profile cap (Days 1–7); wraps existing educational eligibility, never recalculates rewards |
| `persistence.ts` | World schema-1 validation, optional route/chapter/cursor, paired transient lesson restoration and retryable coordinated writes |
| `save-fence.ts` | Existing hash-only IndexedDB revision metadata under Web Locks; progress JSON remains localStorage |
| `content/RPG_WORLD.json` | Single build registry with day-prefixed event sections, maps, NPC schedules, seven chapters and route declarations |

## Authority and chapter selection

Day transfers use `daily-flow.ts` to resolve a safe spawn beside the current bed object; ordinary resumption retains saved position. The same module supplies optional chapter-configured Muhammad Jan guidance, with available destinations resolved through live schedules. See [daily flow and responsive learning](DAILY_FLOW.md).

The [curriculum](../../CURRICULUM.md) and educational engine cover Days 1–14; the playable registry in `content/RPG_WORLD.json` covers Days 1–7. Days 8–14 need additional narrative, map and event registration. [GAME_SPEC](../../GAME_SPEC.md) owns mechanics and the [README](../../README.md#documentation-roles-and-precedence) defines documentation roles; the post-merge audit records release-specific findings and evidence.

The educational services still own vocabulary/form introduction, SRS, grammar, sentence generation, question/answer evaluation, frozen assessments, audio, XP, once-only visit bonuses, levels and titles. No educational engine was migrated or replaced. Districts remain Home/Residential, Lake/Nature, Market/Business and School; Hills is a Nature scene.

Educational assessment completion selects the next teaching day for its existing navigation. The RPG now keeps a separate **selected chapter**, synchronized into the educational view when rendering, until the player completes the chapter and chooses Sleep. Sleep requires a genuine pass, no paused challenge retry, acknowledged route/ending and an eligible registered successor. It reopens pending narrative acknowledgements before proceeding; dialogue completion alone never advances the chapter. Day 7 remains active because Day 8 is unregistered. This prevents the educational next-day selection from resolving the wrong RPG ending. It is presentation state, not a second progression store. A valid active assessment selects its actual chapter on boot; world chapter IDs are accepted only when registered and educationally eligible.

Lesson choices ask `learning.placeAccessible` and the existing profile policy. Day 2 retains School first, then immediate Home access; Business/Nature are optional; later normal routes retain their opening-lesson prerequisites. The early challenge remains accessible independently through its explicit alternate exposition. No renderer or RPG predicate reimplements those educational rules.

Normal and skip route declarations are optional for chapters without separate routes, including Day 1. New Week 1 chapters resolve actual event IDs; they do not set a generic “opening played” flag on an unplayed route. World route selection is persisted before a new assessment launches. Genuine challenge completion applies its existing catch-up once; stored route selection prevents those newly completed locations from fabricating a normal narrative route.

## Interaction lifecycle

NPC/object interactions and explicit narrative actions resolve a shared event. Dialogue shows sequential speaker/listener messages and eligible choices; Phaser is paused throughout native dialogs and educational overlays. An eligible action completes the narrative event, then delegates lesson/challenge, links another event, sets a story flag, changes a scene or returns to exploration. Opening `resumeEvent` metadata now identifies a follow-up offered on the next interaction with its teacher; no automatic cursor is queued. The world owns no language grading or XP.

Map-scoped arrival events are offered only when interacting with their matching character. Location entry, waking and lesson return stay quiet. Scene actions validate allowed maps and safe spawn, then ask the same Phaser scene to synchronize. Chapter changes also reuse that scene. Completed openings/endings/arrival events remain one-time across confirmed saves. Repeated eligible lessons use existing reward locks; menu history exposes isolated dream practice without resetting campaign progress.

The sole Phaser-specific correction is a reproduced mobile boot race: resize could arrive before ScaleManager assigned its canvas. The wrapper now defers that resize until Phaser READY, ignoring uninitialized/destroying scale state. No day-specific movement/rendering branch was introduced.

Dream review in `src/rpg/ui.ts` uses the same educational engine with a disposable `reviewOnly` clone for passed, registered days. Canonical saves/exports retain the original campaign; no XP, SRS, mastery, unlocks or completion changes persist. Challenges and profile edits are disabled, exit discards the clone, and reload restores the saved house position rather than resuming the dream. See [mechanics](../../GAME_SPEC.md#rpg-house-sleep-and-dream-review).

## Persistence and recovery

Production key `pashto-town-days-v1` remains unused by the default RPG. Educational `pashto-quest-rpg-education-v1` stays schema 8 and world `pashto-quest-rpg-world-v1` stays schema 1. Existing Web Locks, observed-value comparison, revision hashes and interrupted-write recovery remain. Optional `routes` extends world state with only registered chapter IDs and normal/skip values; chapter, cursor, positions and lesson drafts are validated. Unsupported educational saves remain untouched pending explicit reset, with no old-format migration.

A chapter transfer is serialized: persist the completed chapter, write the target chapter/spawn, start its quiet world scene, then persist the target world state. It never calls a reward function. An interruption may restore the last committed completed chapter (Sleep can be retried) or the committed target spawn. Educational knowledge and frozen assessments remain authoritative. Unpaired lesson drafts are discarded; invalid positions recover safely. World/education transactions are separate, so unacknowledged story/position/draft work can still be lost; lifecycle flush is best effort, not atomic shutdown persistence.

Current educational components remain the same HTML/CSS nodes. Learning Mode expands their context to the viewport, hides the mounted world and pauses movement through the existing activity lifecycle. Results remain in this mode until an existing return action restores exploration. Library, optional audio fallback, RTL/LTR tiles, focus and touch cancellation are retained. Native Quick travel remains available after Canvas failure. Disposal aborts scoped global listeners, removes dialogs, restores service wrappers and destroys Phaser resources. The existing scene/map lifecycle tests remain intact.

## Map hierarchy, portraits and movement

The starting village now uses a 96×64 Afghan-inspired layout with northwest residential compounds, a northeast lake and dock, a school below the lake, southwest market and three barred future roads. See the [layout, rendering, save recovery and map extension guide](VILLAGE_REDESIGN.md).

The RPG toolbar, day/title and progress card persist in the sidebar. Library and Menu use native dialogs bounded to the contextual area, with transparent backdrops so the world stays visible. The duplicate global header is hidden during gameplay. In Learning Mode the same return control moves into a compact Pashto Quest/day header; the exploration HUD is hidden. Regional notes and reset live inside Menu. Pashto recall prompts precede transliteration, audio and instructions; direct English construction targets remain unchanged to avoid revealing the answer. The shared English-choice formatter changes labels only; original values stay in `data-answer` and all scoring still uses them.

`content/CHARACTER_PORTRAITS.json` maps immutable character IDs to named expressions. Twelve neutral expressions map to retained screenshot crops or newly generated portraits with separate source/preparation/digest records; future missing expressions use explicit fallback states. `src/character-portraits.js` renders portraits for both the shared educational UI and RPG dialogue; each story message may declare `characterId`/`expression`. Optimised lossless WebP assets under `assets/portraits/` (original screenshots and the separately generated atlas remain under `public/assets/portraits/`; the manifest records each actual origin) are embedded by the builder, loaded by Phaser scene preload and resolved from its texture manager into the shared portrait component, preserving offline play. No backgrounds or screenshots are used as portraits.

A* uses the static tile/collision grid, current actor occupancy and chapter map permissions. Phaser remains the only animated stepper. One controller accepts automatic routes and manual overrides; it revalidates after interrupted tweens, cancels at map changes and overlays, and rejects inaccessible targets. NPC targets resolve to reachable interaction tiles; interaction also requires a clear orthogonal line. DOM Pointer Events convert client coordinates through the scaled canvas and Phaser camera. `touch-action:none` prevents map gestures scrolling the page. A ResizeObserver responds to world-container and context changes; Phaser logical resizing also refreshes camera bounds. Display size is fitted to the available container without distorting the logical aspect ratio. Hidden learning-mode containers do not resize the retained Phaser scene to zero; its dimensions are updated on return. Scene shutdown removes its pointer listener. Scene relocation stops old tweens before quick travel can change position.

Quick travel resolves the lesson giver through its existing lesson actions and map regions, moves to a safe nearby tile when available, and begins the lesson directly. The NPC choice and Quick Travel share `beginLesson` and `lessonEligible`, including existing educational locks. Starting an introductory lesson through either deliberate action acknowledges its registered opening via the story director; it does not fabricate lesson completion. Completed courses receive explicit Review labels. The old Nature-to-Hills finale diversion is removed from lesson buttons; Hills story/challenge interactions remain in the world. Guarded direct lessons remain available after Canvas failure.

Completion predicates `complete:<lesson>`, `not-complete:<lesson>`, `allLessons`, `not-allLessons` and `all:<predicate>|<predicate>` drive teacher schedules. On Day 6 Deena moves from Lake to Home after Nature practice and returns after Home practice; Muhammad Jan visits Market. On Day 7 Deena teaches School while Ms Hameed teaches at Lake, then Ms Hameed returns to School for the exam. On Day 5 Ms Hameed joins the other three adults at Lake after the visits. These changes align world speakers with the existing curriculum without changing its teachers or lesson IDs.

Day 7 is nonterminal and links to `day-8`; its `presentation.milestoneTitle` presents graduation independently of terminal policy. The chapter director resolves only registered, eligible next chapters. A model test activates the existing Day 8 fixture and verifies this transition without changing engine code. No production day-skip harness or unreviewed Week 2 story is activated.

Optional `activities` adds settled NPC tiles, facing, stop/turn and remaining idle delay to world schema 1. Missing routine state uses authored placement; invalid optional positions recover within the safe activity zone without touching education. Unfinished steps and paths are transient; refresh restores the last committed tile, story cursor, paired lesson or exact active assessment. Existing world route/chapter flags and educational reward identities remain the only progression records. The two-store non-atomic persistence limitation described above still applies.

See [two-column Exploration Mode](TWO_COLUMN_INTERFACE.md) and [full-screen Learning Mode](FULLSCREEN_LEARNING.md) for layout ownership, synchronization and browser evidence.

`src/answer-feedback.js` owns status plus actual Pashto/transliteration/English feedback. It receives card/question data and never validates or awards XP. Active explanation builders and stored rendered feedback text are removed. `app.css` uses intrinsic activity/footer rows, with one overflow owner per phase and no nested feedback scroller. See [current UI/entry validation and save impact](LESSON_UI_AND_ENTRY.md).

Ambient routines use the same A* and collision grid, with protected teacher approaches, doors, spawns, transitions and reserved barriers. Each routine stays within an authored public zone. Current and destination tiles are occupied during movement; the player's destination is also reserved. Selecting a moving NPC holds it at its committed tile while the existing player controller approaches. Overlays stop flights and animations; active exploration resumes bounded walks/pauses. Settled states save through existing world writes and lifecycle flushes; ambient frames create no independent timer or save stream. Map relocation/shutdown cancels paths and movement. See [configuration, save semantics and evidence](LIVING_VILLAGE.md).

`content/CHARACTER_NAMES.json` records owner-supplied spelling approval. Current lexical forms and `sentence-engine.js` use Deena/Medina directly; the old display-projection module is removed. `REVIEWED_LANGUAGE_UPDATES.json` separates current name-revised spans and researched Have forms from unchanged historical attestation files. Lesson plans record their new noun/verb pool and actual first-study lesson provenance; these constrain ordinary instructional generation, not cumulative assessments. The guided SOV example reuses the compiler and construction component. See [current source, save and validation details](LESSON_PROGRESSION_FIXES.md).

The [lesson/progression update](LESSON_PROGRESSION_FIXES.md) supersedes the preceding name-projection and schema-8 compatibility descriptions. Current forms/compiler metadata use the names directly; format 8 deliberately rejects earlier educational saves.
