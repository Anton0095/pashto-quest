# Expanding the RPG

This is a strict TypeScript / Phaser 4.2.1 Day 1 prototype. Keep main's learning/progression engines authoritative. Add approved data and narrative before changing generic simulation code.

## Add a map

Add a stable key under `maps` in `content/RPG_WORLD.json`. Supply equal-width tile rows using registered symbols and a walkable spawn. Optional equal-size `collision` rows contain `0` (default) or `1` (blocked) and become a separate Phaser tilemap collision layer. Add a transition on the source map and an exit on the destination, keeping return spawns off transition tiles. Declare building-art rectangles and region labels independently from collision tiles. Run `python3 tools/build.py` first to strict-check/bundle the TypeScript, then `node tests/rpg-world.test.mjs` to validate maps, collision and reachability. Add explicit reachability assertions for new objects/NPCs and public-UI navigation through new entrances.

For a new terrain kind, add its walkability in data and Phaser Graphics texture generation in `src/rpg/phaser-world.ts`. Phaser owns tilemap rendering, physics/collisions, movement tweens, animation and follow cameras; add no parallel custom engine or lesson/assessment/XP checks there. Existing scene art is original Phaser-generated pixel textures, with no external runtime assets.

## Add or relocate an NPC

Add `{id,name,sprite,schedule,event}` to `npcs`. Each schedule entry has `{day,map,x,y}`; add another day entry to move the same character. Choose an unobstructed tile beside a reachable approach. For conditional variants, give placements separate stable IDs and named registry predicates. Do not place two simultaneously eligible NPCs on the same tile.

Create an event under `events` with the speaker, English dialogue lines and action definitions. Existing lesson IDs connect through an action such as:

```json
{"label":"Study at School","type":"lesson","lessonId":"2-school"}
```

The lesson adapter launches the existing lesson, pauses exploration and returns through the existing results/navigation path. Do not create a new vocabulary pool, teaching sentence list, reward store or custom answer evaluator. Pending Pashto dialogue stays English until reviewed and explicitly activated through the existing language workflow.

## Register another chapter

The inactive [Day 2 example](day2-registration.example.json) supplies a `days["2"]` entry and NPC schedule patches to merge with existing identities (not duplicate NPC IDs). A schedule entry may override `event`, because its fields overlay the NPC definition. It demonstrates a new configuration, opening story event, scheduled teacher, instructional event, existing lesson ID, daily challenge and completion condition. It is deliberately outside the build inputs. It does not enable Day 2 in this prototype.

For a future conversion branch:

1. Register the new chapter data, events and NPC placements; connect the chapter's opening event to its scripted trigger in the event adapter.
2. Raise `lastDay` and change the prior chapter's completion from terminal to nonterminal. The policy already resolves configured/allowed days and rejects unregistered chapters; its expansion test demonstrates a Day 2 registration without movement, collision or evaluation changes.
3. Replace the current Day 1-specific onboarding/objective/completion copy with approved chapter presentation. Extend condition predicates when new narrative concepts require them. The prototype UI's Day 1 visit labels, Home challenge dialogue and terminal summary remain profile presentation that should be generalized before a multi-day release.
4. Route the new opening story to its existing normal-route lesson/access rules. Keep the educational engine's early-challenge permission and challenge-start availability semantics intact.
5. Extend public UI, save/reload, reachability and once-only award tests. Rebuild and run the shared full verifier for a multi-day conversion.

The reusable policy, registry, schedules and action dispatch already separate this work from simulation and learning. Autonomous NPC movement or time-of-day schedules would need a bounded scheduling extension with collision-safe destinations; current schedules select stationary placements per day.

## Before Day 2

- Generalize chapter presentation and opening-event dispatch from this bounded Day 1 shell; add story-specific conditions as data-driven predicates.
- Add classroom/home interiors if narrative needs justify them; keep the Library reference shortcut.
- Exercise real iPhone Safari touch, Web Locks/local persistence, audio and focus interruption. Chromium viewport/CPU emulation is not hardware evidence.
- Consider an atomic envelope or revision token shared by world and education saves if seamless resume across abrupt closes is essential. Current pairing safely falls back to the village on mismatch.
- Preserve partial tutorial construction if exact tutorial-draft restoration is required; current unfinished tutorial arrangement restarts at the same step.
- Obtain needed language/recording review. Existing base/phrase approvals do not certify generated combinations, inflections, Laghman pronunciation or new dialogue.
- Replace/develop procedural art where useful, maintaining original or documented licensed assets and offline delivery.

## Typed boundary and build

Run `npm ci` once, then use the existing `python3 tools/build.py` / `--check` commands. `npm run typecheck` checks all new RPG systems in strict mode; `tools/build-rpg.mjs` bundles Phaser locally before Python embeds it into the static release. Only development requires Node/npm; GitHub Pages and offline play use the committed HTML. Extend discriminated `Action`, `WorldData`, `Chapter` and adapter interfaces in `src/rpg/types.ts` when adding new concepts. Keep educational JavaScript services authoritative and connect them through `EducationServices`, rather than copying evaluation/reward logic into TypeScript. See the [pipeline decision](TYPESCRIPT_PHASER_BUILD_PLAN.md).
