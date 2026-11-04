# Afghan village layout and rendering

The playable village is a 96×64 rectangular map on the existing 16-pixel movement grid. The supplied `public/assets/Afghan Village Hub Pixel Map.png` was visually inspected for its adobe compounds, irrigated greenery, lake, school, textile stalls and three barred roads. It is a reference, not a background or collision mask.

## Layout

- Northwest: walled residential compound, gardens, a well, shaded roof terraces, pottery and textiles. The existing Home doorway remains at (9,7); the existing Library entrance remains at (24,15).
- Northeast: irregular lake, shallow shoreline highlights, reeds, stones, floating plants and an accessible wooden dock. A narrower river leaves the eastern boundary above the reserved east road. Water is impassable.
- Southwest: open market aisles, striped woven awnings, baskets, crates and adobe buildings. Edris's ordinary placement is (20,46).
- Southeast: a school directly below the lake, with a formal central entrance, blue geometric trim and a walled teaching courtyard. Ms Hameed's ordinary placement is (70,44).
- Central packed-earth crossroads connect all districts. The separate Hills spur is at (94,34), below the east-road reservation. Existing chapter access still governs Hills.

The north, east and south roads terminate at visible barriers and signs. `reservedExits` records identity, boundary coordinate, direction and reachable approach; these are preparations, not active destinations. A physical map does not create a fifth teaching district or vocabulary quota.

## Authorities and layers

`content/RPG_WORLD.json` owns rectangular terrain rows, solid tile identities, optional collision rows, regions, buildings, scenery, transitions, chapter starts and conditional NPC placements. `world-data.ts` validates terrain/spawns/transitions and recovers invalid positions. `movement.ts` plans on the same walkability and actor occupancy used by the Phaser stepper; no second movement engine was added.

`village-art.ts` draws deterministic pixel art from that registry. Ground, paving, water, shoreline, walls and barriers bake into one 1536×1024 texture. Building/prop textures are generated once per variant and reused on subsequent visits. Foreground sprites use their ground footpoint for depth ordering; buildings and market counters remain solid terrain. Textures belong to the Phaser game and are released on disposal. The covered village tilemap is hidden from drawing while retaining its collision data, avoiding a redundant terrain render behind the opaque baked ground. No atlas or reference-image download is needed in the offline release. Existing actor sprites, portraits, house art and other interiors are reused.

`phaser-world.ts` retains the terrain physics layer, optional collision overlay, actor bodies, camera follow, movement tween, pointer routing and map lifecycle. It selects village artwork only for maps with the new scenery definitions; historical test profiles retain their original rendering path.

Educational content, quotas, XP, grading, SRS and challenge activation stay in their existing JavaScript authorities. Registered RPG chapters remain Days 1–7. A pass enables educational completion/access; chapter advancement still requires explicit sleep, narrative acknowledgements, an eligible successor and no paused retry. Dreams remain disposable practice without persistent campaign learning or rewards.

## Existing saves

Education schema 7 and world schema 1, storage keys and revision coordination are unchanged. Existing walkable positions remain valid. A position made impassable by the redesign deterministically recovers to that map's configured safe spawn (or its existing row-major safe-tile fallback). The village collision overlay also excludes disconnected decorative margins and tiles beyond the future-road barriers, so recovery cannot strand a player in an isolated walkable pocket. This uses the established `world-data.recover` path; no old-format adapter, educational reset, XP recalculation or invented study is involved. House/Library/Hills coordinates are unchanged except the Hills return arrival in the village.

## Registering another map

1. Add a unique key under `maps`, with equal-width terrain rows of any rectangular dimensions, safe `spawn`, `transitions`, `regions` and `buildings`. Optional `collision` rows must match terrain dimensions. Use registered tile symbols; scenery must visually match solid geometry.
2. Add outgoing transitions `{x,y,to,spawn:{x,y}}` on reachable walkable tiles. Register the destination map and safe arrival first, and add its return transition. The existing transition type and controller work across different dimensions.
3. Add the map to the appropriate chapters' `maps` allowlists. Use existing chapter eligibility, event conditions and schedules for story restrictions; register object events and stable NPC identities with safe approaches.
4. To activate a reserved road, remove its barrier, replace its `reservedExits` entry with ordinary transition data and supply reviewed destination content. Do not increase curriculum quotas or chapter limits merely because a map exists.
5. Run registry/model reachability, collision, recovery and browser transition/route tests; inspect camera and footpoint overlap at desktop/mobile sizes. Rebuild with `python3 tools/build.py`. See [current architecture](RPG_ARCHITECTURE.md) and [validation policy](../../tests/README.md#choose-validation-by-change-and-risk).

## Running-game captures

These show the actual Phaser game, including a test-only camera overview of the complete map. The reference image is not used for these captures.

![Complete village](village/complete.png)

| District | Desktop | Mobile-sized camera |
|---|---|---|
| Residential | [View](village/residential-1280.png) | [View](village/residential-375.png) |
| Lake | [View](village/lake-1280.png) | [View](village/lake-375.png) |
| Market | [View](village/market-1280.png) | [View](village/market-375.png) |
| School | [View](village/school-1280.png) | [View](village/school-375.png) |

The procedural art interprets the reference at the established logical scale; it does not reproduce its dense illustrated shading or every textile motif. Mobile captures and checks use Chromium viewport/touch emulation, not physical iPhone Safari. Historical release reports and measurements remain evidence for their recorded builds.
