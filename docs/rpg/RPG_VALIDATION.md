# TypeScript / Phaser validation

Branch: `feature/rpg-phaser-typescript`. Conversion base: `2c2f8f7aa0fa941d0f73b388451014243ff4888d` on the prior RPG branch. The original prototype starts from main `a28d02810fe39afa7a80618d27736b866c3c5bf9` (merged review PR #23). Main, the prior prototype branch and production Pages configuration are not modified by this conversion.

## Delivered behaviour

The default release uses Phaser **4.2.1**, the npm registry's current stable release, bundled locally with strict TypeScript RPG modules. Phaser owns tilemap layers/collision flags, Arcade terrain/NPC physics and interaction sensors, visible character movement, tweens, walk animation, follow cameras and Canvas rendering. The old custom JavaScript movement/rendering engine is removed. Original pixel artwork is generated as local Phaser textures.

The complete Day 1 prototype remains: introduction, authentic four-step Library tutorial, Home/Lake/Market/School lessons, reference Library, early 15-question challenge, failure/retry, genuine pass at 12+, and terminal completion. Existing HTML/CSS teaching and assessment panels render as overlays above the paused world. Character appearance, world state and educational progress remain separate. Day 2 stays unavailable, including restored future-day assessments.

Educational learning/generation/evaluation/progression JavaScript engines remain unchanged by this conversion. Vocabulary allocation/acquisition, sentence generation, questions/evaluation, construction/audio, progression/rewards and educational validation/I/O keep their existing authorities. App composition injects those services and the shared question helper into typed interfaces. The storage adapter now uses a shared TypeScript revision fence to close the cross-renderer cache race reproduced during verification; explicit resets wait for durable completion before reload. No replacement learning store, sentence list, scoring algorithm or save migration is introduced.

## Build and tests

- `npm ci` installs pinned development/build dependencies; players require none.
- `npm run typecheck` checks only the new RPG TypeScript with strict checking and negative contract fixtures.
- `python3 tools/build.py` invokes the TypeScript/esbuild step, then the existing offline Python assembler.
- `python3 tools/build.py --check` checks strict compilation, the bundled artifact and release synchronization.
- `node tests/rpg-world.test.mjs` checks declarative maps, reachability and invalid-position recovery using the compiled model.
- `node tests/rpg-persistence.test.mjs` checks the unchanged save keys/formats, competing writers, invalid state and configured chapter boundaries.
- `node tests/phaser-browser.test.mjs` passed at 375/1280px: actual Phaser tilemaps, terrain/NPC collision, four-direction movement, animation frames, follow camera, entrances/exits, paused HTML overlay, and synchronization of the saved tile/Phaser body after a same-map reset. A 375px DPR3 Chromium touch-emulated context passed pointer movement and dialogue.
- `node tests/rpg-browser.test.mjs` retains the full public-UI playthrough, all four authentic lessons (three generated default Home descriptions), Library, saved partial lesson construction, exact frozen/locked assessment restoration, appearance, reset/cancel, completion/reload, early failure/retry, invalid world recovery and inaccessible future-day saves.
- `node tests/save-fence-browser.test.mjs` checks deterministic stale cached reads, interrupted before/after writes, ambiguous write confirmation, unknown-byte preservation, failed-write retries, explicit reset, IndexedDB denial/recovery and the real incompatible-save reset UI.
- `node tests/rpg-concurrent-browser.test.mjs` runs four queued two-renderer write contests at each width, requiring exactly one winner while retaining the loser’s export and reload state.
- The full `python3 tools/verify.py` includes strict TypeScript, the unchanged fourteen-day/seven-pace educational regression matrix, both RPG browser suites and the exact-release delivery audit. The final integrated run exited 0: **137 checks passed, including all 21 browser suites**. The fourteen-day, seven-pace normal/skip matrix covered 392 visits, 196 assessments and 6,676 generated sentence surfaces. Both exact-release delivery audit steps passed. See [the complete verification log](verification.log).

Existing educational browser fixtures explicitly select their retained educational navigation profile; RPG/Phaser suites use the actual default release. Read-only saved JSON supplies the public-playthrough assessment oracle. A fixture-only fence hook installs post-playthrough invalid-position/future-day snapshots coherently; it does not submit answers, mutate live learning state or award scores. Gameplay and submissions use public controls; no runtime bridge fabricates RPG scores or rewards. The focused Phaser diagnostics are read-only and expose engine state, never educational mutations.

## Offline and iPhone Safari considerations

`index.html` contains Phaser, the RPG bundle, educational JavaScript and curriculum. There are no runtime dependency/CDN requests or dynamic module imports. Tests also run with non-navigation requests blocked. GitHub Pages can serve the committed static file directly. Phaser's Canvas renderer avoids reliance on a WebGL driver/context; Phaser audio is disabled, leaving existing educational audio and its user-gesture/fallback behaviour intact. Pointer capture/cancel handling, held-input reset, responsive camera dimensions and dynamic viewport overlay CSS support mobile use.

The environment has Chromium but no installed WebKit binary. Chromium viewport/touch/DPR emulation is **not** physical iPhone Safari verification. Safari touch gestures, browser lifecycle interruptions, actual speech voices/pronunciation and storage behaviour on real hardware remain untested. Coordinated saving requires Web Locks, IndexedDB and Web Crypto. IndexedDB contains revision hashes only, while schema-7 progress/world JSON stays in localStorage. Existing fail-closed saving/export warnings remain in place rather than silently weakening concurrent-save protection.

## Performance and limitations

Exact-build observations are recorded in [performance.json](performance.json), reproduced with `node tools/rpg-performance.mjs`. Twenty samples per profile measure local load, Phaser scene readiness, movement completion, map transitions and forced-GC heap/storage endpoints. Mobile uses 375px and 4× CPU throttle. Movement/transition observations include the intentional 115ms Phaser tween and report the next **committed tile**, not first-pixel input latency. A held direction starts at a 150ms cadence. Host verification activity can affect timings; measurements do not certify physical phone performance or absence of a long-duration memory leak.

Only the Library has an interior. NPC schedules select stationary daily placements; autonomous walking/time-of-day movement remains future work. Unfinished tutorial tile construction restarts at its current step, while ordinary lesson and challenge construction retain the existing exact snapshot behaviour. World/education stores are separate and position writes debounce by 180ms; abrupt termination can leave an older position or discard a stale transient lesson pairing while preserving educational knowledge. No native audio recording pack or new language certification is claimed.

## Play and extend

Players can serve the committed release using `python3 -m http.server 8000` and open `http://localhost:8000/`, without npm. Developers first run `npm ci`, then `python3 tools/build.py`. Use arrows/WASD or touch directions, E/Enter/Interact to talk, L for Library, and Escape for Menu. Complete the tutorial, explore the four districts in any order, and take Muhammad Jan's Home challenge whenever ready. A pass ends the prototype; there is no playable Day 2.

For Pages, use a separate preview source/site; production Pages settings remain unchanged. See [architecture](RPG_ARCHITECTURE.md), [build decision](TYPESCRIPT_PHASER_BUILD_PLAN.md), [expansion guide](RPG_EXPANSION_GUIDE.md) and the [inactive Day 2 data example](day2-registration.example.json). Before additional days, generalize chapter presentation/opening dispatch, supply approved story data and daily NPC placements, extend save/once-only-award coverage, and test physical Safari/audio. Movement/collision/rendering or educational evaluation should not need rewriting.

## Exact-build measurements

Release SHA-256: `b6c3e42f82caa8663c344a3ec64de2aa5333b733abfd25f2e6d04cc282d5cd13`. Release size: 2991327 bytes, including locally bundled Phaser and all curriculum. Phaser 4.2.1; Chromium 154.0.8037.57. The shared verifier was running on the same host, so these loopback observations include host contention and are not network/device guarantees.

| Profile | Load median / p95 | Phaser ready median / p95 | Tile commit median / p95 | Transition median / p95 | Heap before / after | Scene update objects before / after |
|---|---|---|---|---|---|---|
| desktop (1280px) | 373.1 / 427.6 ms | 570.3 / 646.4 ms | 125.8 / 138.4 ms | 132.9 / 140.7 ms | 6,886,096 / 8,179,372 bytes | 9 / 9 |
| mobile4x (375px) | 1324.7 / 2322.6 ms | 1887 / 3286 ms | 130.8 / 143.8 ms | 148 / 181.4 ms | 6,873,860 / 8,161,452 bytes | 9 / 9 |

Fresh localStorage remains 235 bytes for the world envelope and 391 bytes for educational progress. The two IndexedDB revision records contain 153 logical JSON bytes, excluding database overhead. Real lesson/assessment payloads grow with acquired material and frozen compiler proofs. After 40 moves/transitions, the scene update-list count stays exactly 9 in both profiles. Forced-GC heap rose by roughly 1.29MB over that warm-up sample; this is not a peak or a long-duration leak certification. The separate regression test also asserts unchanged scene update-list size across 20 repeated map changes.

## Revision coordination

The observed concurrency defect was a stale renderer cache, not duplicate XP/scoring logic. The revision fence reads and updates a serialized IndexedDB hash record under the existing origin-wide Web Lock, prepares a before/after hash journal, invokes the existing validated localStorage write and acknowledges a committed revision. No-op/failed/interrupted writes cannot silently advance a conflicting writer. If confirmation is ambiguous, either exact before/after image can be recovered; unknown data is preserved. Only explicit reset authorizes rebasing, and incompatible-save reset now awaits successful persistence before navigation. The metadata database contains no learning payloads and grows by storage namespace, not by question or attempt.
