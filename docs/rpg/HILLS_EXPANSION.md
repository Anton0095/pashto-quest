# Permanent Hills and Day 6 invitation

Hills is now a 64×48 physical map within **Nature**, open on Days 1–7 immediately after completing or skipping the tutorial. The four educational districts, selected daily pace, frozen allocations, generated grammar, learning records and reward rules are unchanged. Entering Hills and viewing incidental scenery grant neither vocabulary nor XP.

## Connections and landscape

The existing village northern path reaches `(46,0)` and enters Hills at its southern trail `(32,45)`. The Hills exit `(32,47)` returns to the village at `(46,2)`. The former eastern Hills spur is retired; Home and Library entrances remain unchanged. The village's east and south future roads remain blocked.

The Hills trail winds through grassy slopes to the east. Loose scree at the eastern edge blocks the future route; there is no undefined destination or off-map crossing. A marker explains the obstruction. The southern marker explains the return path and Nature affiliation.

`RPG_WORLD.json` defines the terrain, rocks/trees, transitions, reserved route, markers and actor locations. `hills-art.ts` bakes a cached pixel landscape into the existing Phaser world: spring grass and wildflowers, rolling shaded slopes, exposed dirt and rock, shrubs, scattered trees, layered distant ridges, birds and a grazing goat/sheep. Wildlife is static incidental scenery, with no learning IDs, physics actors, rewards or extra animation loop. No settlement or new building is added. The existing terrain collision, A*, camera, keyboard, pointer/touch and directional controls remain authoritative. The new map has 2,611 connected walkable tiles.

## Day 6 flow

1. Sleep begins Day 6 beside the existing bed at Home, with quiet entry. Muhammad Jan's optional guidance directs the player to Deena at Lake. His existing Day 6 Market teaching role is retained.
2. Deena waits alone at Lake. Her invitation explains the northern trail and offers **I'll meet you in the Hills** or **Explore first**. It starts no lesson and teleports nobody. Declining leaves a repeat invitation available.
3. Accepting uses the existing story flag `day6-hills-invited`. Deena's Lake placement ends; her Hills placement and Medina's first Day 6 placement become eligible. They never occupy both maps simultaneously.
4. Walk north into Hills. The first interaction with either sister presents Deena's introduction of her younger sister Medina and the idea of doing things together. This acknowledged introduction is once-only. Map arrival itself remains quiet.
5. Either sister offers the same existing `6-nature` lesson. It teaches the existing first-person plural, compound subjects and contrasts through the unchanged curriculum/compiler. Completing it returns quietly to the saved approach near the sisters, without starting a challenge.
6. Both sisters remain in Hills afterward. Deena also offers the unchanged `6-residential` **Home course** there after Nature, retaining her curriculum teaching role while satisfying the requested permanent Hills presence. This is the same educational Home requirement, not a new Nature allocation or a fifth course. Muhammad Jan remains at Market and Ms Hameed at School.

Quick Travel resolves the current teacher placement. Before acceptance, Nature takes the player to the Lake invitation rather than bypassing it with a fabricated lesson action. After acceptance, it can begin the Nature course in Hills through the existing guarded starter. Relocated Home and Nature buttons retain distinct course labels. Quick Travel may bypass the physical journey; the ordinary NPC route uses the invitation, northern trail and sister interaction.

The 15-item/pass-12 Day 6 challenge remains available early, without invitation or visits. Its declared physical map is Hills. The existing challenge launcher uses the host's approach when present, otherwise the map's safe spawn, without setting invitation or introduction flags. A successful early pass retains the existing four-location completion behavior without inventing actual study or duplicate rewards. Frozen questions and locked responses resume unchanged. The normal four-course finale and later events remain available; finishing a lesson does not launch the challenge automatically.

## Scheduling, saves and cleanup

Stable IDs remain `saleha`/`mina`; appearances, names and the sister relationship are unchanged. Day 6 placements depend on the durable narrative flag, not educational completion. Finishing Nature therefore cannot send Deena back to Lake or remove Medina. Day 7 resumes the existing schedules. No new progression, SRS or reward store is introduced.

Education schema 8 and world schema 1 retain their existing keys and revision coordination. Invitation flags, acknowledged introduction triggers, dialogue cursors, position and lesson pairing use existing persistence. A save before the invitation restores Deena alone; a save afterward restores both sisters in Hills. Supported existing educational records and frozen attempts are preserved. Invalid or newly blocked coordinates use the existing safe-position recovery; no migration or silent educational reset is added. Previously acknowledged Day 6 event IDs remain acknowledged.

Functional verification passed before cleanup at commit `8b63433`. The subsequent focused cleanup:

- Shares `availableMaps()` between Phaser transitions, explicit travel and world-entry recovery, using optional map conditions.
- Resolves one eligible schedule per NPC placement before filtering by map, preventing duplicate copies even if schedule conditions overlap accidentally.
- Resolves shared introductory participants through one event lookup instead of repeated registry reads.
- Removes the unused old `day6-residential` and `day6-after-opening` narrative events; the educational Home lesson ID remains unchanged.
- Distinguishes relocated course labels and registers the new regression suites with the verifier.

No learning engine, planner, lexicon, frame or curriculum JSON changed. No broad architectural rewrite was performed.

## Verification and limits

Functional checks passed before cleanup: strict TypeScript, production build, 12 focused model suites and five desktop/mobile browser suites. The same 17 suites passed after cleanup, plus three additional model regressions (`authored-conversations`, `typing-bilal`, `generation-cache`), with additional schedule-overlap, Hills keyboard/camera and distinct-course-label checks. TypeScript, build consistency, affected/compiled syntax and unchanged educational-source checks passed. Final outcomes are recorded in [the validation record](hills/validation.txt).

The focused browser suite completes both real tutorial routes; crosses north/south without educational writes; sleeps from Day 5 into Home; checks guidance, the invitation/Quick Travel guard and reload; walks physically into Hills; introduces Medina; completes/reviews the shared lesson through each sister without duplicate XP; checks quiet return, pointer/touch/D-pad movement, collision, camera and saved position; and passes the early 15-item challenge with frozen reload and no invented invitation. Existing house/sleep/dream, village collision/recovery, cast/routines and onboarding/settings/Bilal regressions cover surrounding behavior. Model checks retain all seven chapters' access, teaching roles, reward boundaries and map approaches.

Running-game captures: [Hills overview, desktop](hills/overview-1280.png), [mobile emulation](hills/overview-390.png), [sisters, desktop](hills/sisters-1280.png), [mobile emulation](hills/sisters-390.png). The overview uses a test-only camera zoom; normal gameplay follows the player. These are procedural game renders, not generated reference images.

The eastern trail has no destination yet; expanding it requires a registered map, safe two-way transitions and tests. Wildlife is decorative rather than simulated. Chromium desktop/mobile emulation does not establish physical-device Safari or hardware audio behavior. No new Pashto wording, morphology approval or recording is claimed. Prior language-review limitations remain.

No full seven-day public playthrough, fourteen-day browser delivery matrix or performance benchmark was run, following the requested focused scope. The maintained full-route driver was adapted for the new Day 6 sequence and typed controls, but no complete-route pass is claimed. Existing delivery fingerprints, measurements and historical captures remain evidence for their recorded release and were not refreshed.
