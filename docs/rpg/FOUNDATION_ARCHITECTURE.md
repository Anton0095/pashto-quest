# TypeScript / Phaser RPG architecture

Branch `feature/rpg-foundation` starts from `feature/rpg-phaser-typescript` at `b726f01` and hardens the implementation that replaces the custom JavaScript RPG engine from `feature/rpg-prototype` (`2c2f8f7`) with strict TypeScript and locally bundled Phaser **4.2.1**. Main remains untouched. The original prototype's base is `a28d028` (merged review PR #23). The [build decision](TYPESCRIPT_PHASER_BUILD_PLAN.md) records the pipeline inspection and minimum changes proposed before implementation.

## Module ownership

| Source | Owns |
|---|---|
| `src/rpg/types.ts` | World/map/NPC/event/save types; explicit interfaces for existing JS educational services |
| `src/rpg/phaser-world.ts` | Phaser scene, tilemap/collision layers, Arcade bodies and actor sensors, tweens, animations, follow camera, generated original pixel textures and rendering |
| `src/rpg/world-data.ts` | Declarative map validation, static walkability for safe spawns/reachability and invalid-save recovery; no live movement or rendering |
| `src/rpg/content.ts` | Validated character/placement identities, conditional schedules/events and HTML dialogue rendering |
| `src/rpg/chapters.ts` | Chapter references, prerequisites, opening/ending dispatch, completion and safe next-chapter resolution |
| `src/rpg/story.ts` | Persistent dialogue cursor, once-only story effects, conditional action gating and lesson return targets; no learning rewards |
| `src/rpg/progression.ts` | Configured chapter range and prototype boundary; delegates actual progression authority |
| `src/rpg/save-fence.ts` | Shared transactional SHA-256 revision metadata, stale-renderer rejection and interrupted-commit recovery; no learning payload store |
| `src/rpg/persistence.ts` | Validated world envelope and paired transient lesson snapshot; injected shared question service validates tile indices |
| `src/rpg/ui.ts` | Typed education adapter, keyboard/touch intent, existing HTML overlays, pause/menu, story action dispatch and completion presentation |
| `src/rpg/index.ts` / `model.ts` | Browser entry point / Phaser-free Node test entry point |
| `content/RPG_WORLD.json` | Tile definitions, village and Library maps, NPC schedules, reference object, English dialogue/actions and terminal Day 1 registration |
| `tools/build-rpg.mjs` | Strict check, local Phaser/RPG bundling, checked generated output and test-model bundle |
| `tools/build.py` | Existing curriculum validation and offline HTML assembly, now invoking the RPG build first |

`src/app.js` passes existing services and world JSON into `PashtoRPG.createRPG`. New RPG TypeScript is strict-checked without converting unrelated educational JavaScript. No custom requestAnimationFrame rendering/movement engine remains. Phaser runs scene updates and rendering; its TilemapLayer collision flags and Arcade NPC overlap checks decide whether grid intent can proceed. Accepted movement uses a Phaser tween and Phaser walk animation, then commits the exact tile position to the independent world save. Arcade colliders also protect the live player against terrain/NPCs. The follow camera and bounds belong to Phaser. Interaction candidates come from Phaser's physics broadphase and are filtered to adjacent grid tiles and facing order.

## Educational authority and overlays

The existing vocabulary planner/acquisition/form/SRS store, sentence compiler, questions/evaluation, audio, XP, rewards, challenge activation and save validator remain JavaScript single sources of truth. The JavaScript storage adapter delegates only cross-renderer revision coordination to the shared TypeScript fence. The typed `EducationServices` and `QuestionService` interfaces describe the existing methods the RPG may call; RPG actions include lessons/challenges/reference/story flags, never XP or score mutation.

NPCs launch the existing tutorial or district lesson IDs. Challenge actions launch/resume the existing assessment UI. Challenge-start activation unlocks the frozen four-location material without fabricating actual study. `completeChallengeOnce` still owns missing-visit catch-up and once-only rewards. The terminal screen reads the real result and never manufactures completion. No teaching sentences, vocabulary allocations or Pashto translations were replaced.

The existing HTML/CSS lesson and assessment panels become fixed, scrollable overlays above the still-visible world. Library/dialogue/menu use native dialogs. While any overlay/dialog is active, Phaser movement and physics pause, held input clears and an unfinished movement tween resets to its last committed tile. The world resumes when the existing controls return to it. Phaser audio is disabled; the existing shared construction success audio and Pashto audio service retain ownership. Scene-owned colliders, bodies and display objects are released on transitions; an additional collision tilemap is explicitly destroyed as well.

## Maps, actors and events

A map has a stable ID, equal-width tile strings, walkable spawn, entrances/exits, optional regions/building-art rectangles and an optional equal-size `collision` layer of `0`/`1` strings. Tile definitions declare walkability. Phaser receives numeric tilemap data and collision indices generated from those definitions; optional collision overrides become an invisible Phaser collision layer. Water, trees, walls, stalls and eligible NPC bodies obstruct the player. A transition `{x,y,to,spawn:{x,y}}` commits atomically after a completed step; return spawns stay outside the destination trigger.

NPCs declare stable identity, display name, sprite, condition, event and `schedule:[{day,map,x,y,event?}]`. A schedule can override the event and location for a later day. These are stationary daily placements; autonomous time-of-day walking remains future work. Reference objects use Phaser sensor zones and the same event dispatcher. Conditions currently distinguish pre-guide, pre/post-tutorial and passed states. Events contain English `speaker`, `lines` and typed `actions`: flag, tutorial, lesson, challenge, reference or completion. Add approved narrative/configuration through the registry, never into Phaser collision or educational evaluation.

## Persistence

| Key | Authority |
|---|---|
| `pashto-town-days-v1` | Production save, never imported/read/written by the RPG profile |
| `pashto-quest-rpg-education-v1` | Existing schema-7 educational payload, validator, observed-value comparison and Web Locks |
| `pashto-quest-rpg-world-v1` | World schema 1: committed tile/map/facing, independent appearance, bounded boolean event/NPC/trigger flags, view and optional paired lesson snapshot |

The technology change retains these keys and formats. A separate browser IndexedDB database, `pashto-quest-save-fence-v1`, contains a `heads` record per key with SHA-256 hashes and an optional pending before/after pair. It stores no names, vocabulary, questions, XP, SRS or progress JSON. This closes the reproduced case where a renderer reads stale localStorage despite owning the Web Lock: a serialized metadata comparison rejects the stale writer independently of that cache. Metadata commits are acknowledged before the save promise succeeds. An interrupted write is reconciled only to its exact before/after bytes; unknown bytes fail closed. There is no educational content repair or save-format migration. Appearance remains explicit masculine/feminine/neutral, separate from name/gender or learning progress. Invalid map IDs, blocked/invalid coordinates and NPC overlap recover to a safe tile without rewriting educational knowledge. Unsupported educational schemas remain untouched behind the existing explicit-reset UI. No legacy migration or silent educational reset is introduced. Only an explicit reset authorizes rebasing revision metadata, and the incompatible-save reset awaits a successful durable save before reloading. Out-of-protocol manual localStorage edits can cause a revision conflict; test fixtures install raw snapshots through the same coordinator.

Active challenges remain entirely in the existing educational snapshot, including frozen questions/choices/proofs, indexed tiles, feedback, submitted answer and first-answer locks. A transient lesson serializes its queue, choices, phase and construction; a fingerprint pairs it with the exact educational JSON. Its sets are restored before educational history compaction protects active attempt IDs. Invalid/mismatched transient lessons fall back to the village while preserving knowledge. Locked response rendering never resubmits an answer. Tutorial construction now preserves its indexed draft/order and lock in the same transient session. The shared construction component accepts a draft instead of owning a separate tutorial store. Reloading a recorded correct response renders its existing lock and never submits it again.

Educational writes settle successfully before the paired world save. World writes debounce by 180ms and reject competing writers using their own Web Lock and observed raw value. The revision fence journals metadata, while world/education payloads remain separate; abrupt termination can leave an older position/draft, and a stale pairing safely returns to exploration. Local HTTP/HTTPS is recommended for safe Web Locks; unsupported save coordination retains the existing warning/export behaviour.

## Chapter range and verification

`firstDay`, `lastDay` and registered day IDs define the playable profile. Only Day 1 is registered in the shipped data. Chapters declare a stable ID and curriculum day, presentation, maps/spawn, prerequisites, mandatory story events, active NPC placements, optional lessons, challenge, opening mode/event, ending event, next chapter and terminal status. The director resolves these without per-day branches; it consults the educational service for permission and actual challenge passes. Lesson/challenge entry guards and restored-state clamping keep Day 2 unavailable even though the educational backend still supports fourteen days. Day 1 completion, home award and scores stay authentic. The [inactive Day 2 example](day2-registration.example.json) is excluded from build inputs.

The default HTML embeds the Phaser RPG profile. Existing browser fixtures select the retained educational navigation profile for the fourteen-day/seven-pace regression matrix, while the full public RPG playthrough and new Phaser suite use the default profile. The Phaser suite checks real tilemaps, physics, animation, cameras, transitions, HTML overlays and 375px DPR3 touch emulation. Strict contracts, map/recovery and competing-writer tests complement those browser checks. No viewport or touch emulation is claimed as physical Safari verification. A deterministic stale-cache/recovery suite and repeated real two-renderer save contests verify the new fence. Exact results are in [validation](FOUNDATION_VALIDATION.md).

## Foundation lifecycle and recovery

`createRPG` composes the chapter/story directors and educational adapters. An NPC interaction freezes held input, faces the same character identity toward the player and opens the appropriate conditional event. An eligible action completes story effects, then calls the existing lesson/challenge service. HTML educational overlays pause the same Phaser scene. Educational saves settle before the paired world snapshot is acknowledged. Returning to the village resumes a configured dialogue return target or the existing world position; a terminal pass renders the configured one-line ending summary, while sequential/interactive endings keep the shared dialogue open for their choices/effects. Nonterminal Continue is available only for a registered, active, eligible next chapter.

Story cursors are optional validated world state (`event`, `index`, optional `resumeEvent`). A matched transient lesson restores before history compaction; an active educational assessment takes priority. A mismatched lesson fingerprint falls back to exploration without altering learning progress. Chapter selection is stored by stable ID and rechecked against both profile and educational permission. No obsolete educational format is migrated.

Focus loss, hidden documents, dialogs and educational overlays all make movement inactive; a canceled tween restores its last committed tile. Visibility/pagehide request best-effort persistence. The browser can still terminate asynchronous work. World writes skip identical payloads, and lock failures report a recoverable problem without poisoning future retries. The existing revision fence remains responsible for concurrent/ambiguous-write safety.

A compact Learning access disclosure provides keyboard/native HTML access to the same lesson, challenge and Library services. It remains usable if the Canvas cannot initialize or loses its context; no fallback world renderer is introduced. Audio remains optional.

Disposal destroys Phaser, removes dialogs/controls, aborts all scoped global listeners and restores the original UI, lesson, challenge, storage and learning-policy methods. Pending adapter saves recheck disposal before writing. Map transitions continue to destroy previous Phaser groups/maps/objects rather than creating new scenes for educational overlays.

See [foundation findings and residual severity](FOUNDATION_AUDIT.md) and the [Day 2 walkthrough](FOUNDATION_EXPANSION_GUIDE.md).
