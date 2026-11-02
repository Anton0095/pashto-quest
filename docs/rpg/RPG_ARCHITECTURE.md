# TypeScript / Phaser Week 1 architecture

The Week 1 branch starts from foundation `04891a4`. Phaser 4.2.1 remains locally bundled; TypeScript RPG modules remain strict. The existing Python/esbuild pipeline and JavaScript educational authorities are retained. See [Week 1 implementation](WEEK1_IMPLEMENTATION.md) for registry, route flow, schedules and play instructions.

| Module | Responsibility |
|---|---|
| `types.ts` | Chapter/route/event/actor/world contracts and typed educational interfaces |
| `chapters.ts` | Chapter references, map events, host maps, prerequisites, opening/ending, genuine-pass completion and next resolution |
| `routes.ts` | Actual normal/skip narrative choices and their event requirements; no educational state mutation |
| `story.ts` | Durable cursor, not-started/in-progress/completed status, once-only effects, flags and post-lesson return event |
| `content.ts` | Validated maps/identities/schedules/events, conditional choices and multi-speaker/listener DOM dialogue |
| `ui.ts` | Selected RPG chapter, educational adapters, serialized chapter transfer, native overlays, keyboard/touch lifecycle and completion/history UI |
| `phaser-world.ts` | Sole live world engine: tilemaps, collisions, bodies, sensors, movement/tweens/animation, camera, procedural textures and resource cleanup |
| `world-data.ts` | Static content validation, walkability for spawn/reachability and invalid-position recovery; no parallel movement engine |
| `progression.ts` | Registered profile cap (Days 1–7); wraps existing educational eligibility, never recalculates rewards |
| `persistence.ts` | World schema-1 validation, optional route/chapter/cursor, paired transient lesson restoration and retryable coordinated writes |
| `save-fence.ts` | Existing hash-only IndexedDB revision metadata under Web Locks; progress JSON remains localStorage |
| `content/RPG_WORLD.json` | Single build registry with day-prefixed event sections, maps, NPC schedules, seven chapters and route declarations |

## Authority and chapter selection

The educational services still own vocabulary/form introduction, SRS, grammar, sentence generation, question/answer evaluation, frozen assessments, audio, XP, once-only visit bonuses, levels and titles. No educational engine was migrated or replaced. Districts remain Home/Residential, Lake/Nature, Market/Business and School; Hills is a Nature scene.

Educational assessment completion selects the next teaching day for its existing navigation. The RPG now keeps a separate **selected chapter**, synchronized into the educational view when rendering, until the player completes the ending and chooses Continue. This prevents the educational next-day selection from resolving the wrong RPG ending. It is presentation state, not a second progression store. A valid active assessment selects its actual chapter on boot; world chapter IDs are accepted only when registered and educationally eligible.

Lesson choices ask `learning.placeAccessible` and the existing profile policy. Day 2 therefore retains School first, Business/Nature before Home; later normal routes retain their opening-lesson prerequisites. The early challenge remains accessible independently through its explicit alternate exposition. No renderer or RPG predicate reimplements those educational rules.

Normal and skip route declarations are optional for historical chapter compatibility. New Week 1 chapters resolve actual event IDs; they do not set a generic “opening played” flag on an unplayed route. World route selection is persisted before a new assessment launches. Genuine challenge completion applies its existing catch-up once; stored route selection prevents those newly completed locations from fabricating a normal narrative route.

## Interaction lifecycle

NPC/object/map triggers resolve a shared event. Dialogue shows sequential speaker/listener messages and eligible choices; Phaser is paused throughout native dialogs and educational overlays. An eligible action completes the narrative event, then delegates lesson/challenge, links another event, sets a story flag, changes a scene or returns to exploration. Post-lesson cursors use the same dialogue. The world owns no language grading or XP.

Current-map entry events resolve after Phaser commits a transition. Scene actions validate allowed maps and safe spawn, then ask the same Phaser scene to synchronize. Chapter changes also reuse that scene. Completed openings/endings/arrival events remain one-time across confirmed saves. Repeated eligible lessons use existing reward locks; menu history exposes completed chapters without resetting progress.

The sole Phaser-specific correction is a reproduced mobile boot race: resize could arrive before ScaleManager assigned its canvas. The wrapper now defers that resize until Phaser READY, ignoring uninitialized/destroying scale state. No day-specific movement/rendering branch was introduced.

## Persistence and recovery

Production key `pashto-town-days-v1` remains unused by the default RPG. Educational `pashto-quest-rpg-education-v1` stays schema 7 and world `pashto-quest-rpg-world-v1` stays schema 1. Existing Web Locks, observed-value comparison, revision hashes and interrupted-write recovery remain. Optional `routes` extends world state with only registered chapter IDs and normal/skip values; chapter, cursor, positions and lesson drafts are validated. Unsupported educational saves remain untouched pending explicit reset, with no old-format migration.

A chapter transfer is serialized: persist the completed chapter, write the target chapter/spawn, start its scene/opening, then persist the opening cursor. It never calls a reward function. An interruption may restore the last committed completed chapter (Continue can be retried) or the committed target spawn. Educational knowledge and frozen assessments remain authoritative. Unpaired lesson drafts are discarded; invalid positions recover safely. World/education transactions are separate, so unacknowledged story/position/draft work can still be lost; lifecycle flush is best effort, not atomic shutdown persistence.

Current educational components remain HTML/CSS above the paused world. Library, optional audio fallback, RTL/LTR tiles, focus and touch cancellation are retained. Native Learning access remains available after Canvas failure. Disposal aborts scoped global listeners, removes dialogs, restores service wrappers and destroys Phaser resources. The existing scene/map lifecycle tests remain intact.
