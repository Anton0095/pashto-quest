# Expanding the RPG foundation

> Historical checkpoint document. Day limits, prototype controls and implementation status below describe its original checkpoint. Use [current architecture](RPG_ARCHITECTURE.md), [house/sleep/dream](HOUSE_SLEEP_DREAM.md) and the [post-merge audit](../maintenance/POST_MERGE_AUDIT.md) for the shipped game.

Use strict TypeScript adapters and data; keep Phaser as the live world engine and the JavaScript educational services as the learning authorities. The shipped `firstDay=lastDay=1` and terminal Day 1 remain unchanged.

## Maps and actors

Add rectangular tile rows, a safe spawn, transitions and optional same-size `collision` rows (`0`/`1`) under `maps`. Register allowed map IDs on each chapter. Terrain/collision, sensors, animation, camera and movement stay in Phaser. Building art and region labels do not replace collision data. Run build, map/reachability and Phaser browser checks after map changes.

NPC `id` identifies a placement; `characterId` identifies the person across placements/days. Muhammad Jan's conditional village/Library/Home placements share `muhammad-jan`. Deena keeps `saleha` when moving to School or Hills. Supply name, sprite, optional directional animation keys, interactionRange (1–3), base event and scheduled `{day,map,x,y,event?}` overrides. Optional `defaultLocation:{map,x,y,event?}` supplies a fallback only when no schedule exists for that day; a day-specific schedule overrides it without duplicating the identity. Register placement IDs in chapter `activeNPCs`; conditions can hide a placement. Use a walkable tile with a reachable approach, avoiding simultaneous overlaps. Character interaction flags use `characterId`, never educational completion.

Events contain a speaker, sequential `lines`, optional per-message `{speaker,text,condition}`, optional eligibility/once-only flag, `setFlags`, and typed actions. Conditions support named predicates plus `flag:name` and `not-flag:name`. Unknown conditions fail closed. Actions can launch lesson/challenge/reference, set a story flag, dispatch another event, return to exploration or show completion. A lesson action can specify `resumeEvent` for the conversation shown on return to the village. Events complete their once-only effects when an eligible action is chosen; backing out before choosing leaves the event replayable. This grants no XP or vocabulary. Story cursors/flags are world state; lesson results are educational state.

## Day 2 implementation walkthrough (inactive)

The [registration fixture](day2-registration.example.json) is excluded from release inputs. `rpg-foundation.test.mjs` merges it into an isolated registry and resolves its events without changing any movement, collision, rendering, sentence or assessment module.

1. **Register Day 2:** on a future content branch, merge `days["2"]` and `events` into the world data. Set Day 1 nonterminal with `nextChapter:"day-2"`, and raise `lastDay` only when reviewed content/tests are ready. `id`, curriculum `day`, display name/intro/objective, maps/spawn, prerequisites, active placements, optional lessons, mandatory events, opening/ending and terminal/next declarations are validated together.
2. **Opening:** use `openingMode:"automatic"` with `day2-school-opening`. This retains the documented Ms Hameed School workshop. Use `interaction` for a player-initiated opening like Day 1. A chapter trigger prevents repeating opening/ending dispatch after a saved reload.
3. **Ms Hameed at School:** append the fixture's Day 2 schedule to existing placement `hameed`, preserving `characterId`. Its scheduled event overrides the Day 1 School dialogue.
4. **School lesson:** the opening's `lessonId:"2-school"` calls the existing lesson service. It supplies grammar, vocabulary and generated content from the existing curriculum. If the normal story must require that visit, add a return event setting an explicit story flag/prerequisite, tested against actual lesson completion; never award a visit from dialogue alone.
5. **Other lessons:** register `2-residential`, `2-nature`, `2-business` and appropriate event actions. They are optional visits; existing early-challenge semantics remain intact.
6. **NPC schedule:** append the existing Jan/Deena/Edris placements for Day 2 (the fixture includes these). Add future relocations to their same identities; do not invent separate characters for each location.
7. **Challenge:** route the Home scheduled event to `{type:"challenge",day:2}`. Chapter conditions add story access constraints, while `learning.allowed` and the existing activation service retain authority over eligibility, frozen all-district material and scoring. Use the existing 15-question/pass-12 specification.
8. **Ending:** `day2-ending` supplies the summary after a genuine educational pass and any configured mandatory events. No event choice fabricates success.
9. **Day 3:** keep `nextChapter:"day-3"`. The Continue control only appears when that chapter is registered, active, meets prerequisites and the educational engine permits it. An unresolved next ID is safe and intentionally produces no advance. Register Day 3 before enabling this transition.
10. **Tests:** verify registration rejection, inactive cap, conditions, normal/skip opening requirements, relocation, lesson/dialogue return, frozen challenge restore, once-only rewards, interrupted pairing and explicit next selection. Add a full public Day 2 playthrough, then build and run the complete verifier. Preserve Day 1 and the fourteen-day educational matrix.

Day 2 needs reviewed narrative/content and end-to-end integration work, but no new core world or assessment engine. Later concepts should extend typed predicates/events only when a defined story requirement needs them.

## Persistence and release

Educational schema 7 and world schema 1 remain isolated from production saves. Optional world chapter/dialogue fields extend the current envelope; invalid optional story cursors are discarded, while invalid educational records stay untouched pending explicit reset. Shared construction/tutorial draft state uses the existing transient lesson snapshot. Mismatched world/educational fingerprints discard only the world draft. Web Locks plus the hash-only IndexedDB revision fence remain required; no migration or second score store is added.

Run `npm ci`, `npm run typecheck`, `python3 tools/build.py` and `python3 tools/build.py --check`. Players need only the committed offline HTML/static hosting. Additional dependencies and production Pages changes are unnecessary. Physical Safari/audio and lifecycle checks remain required before a mobile release claim.

For optional moving residents, use the bounded `activity` configuration described in [Living village](LIVING_VILLAGE.md). Historical registration JSON examples retain their original cast labels and are not production content.
