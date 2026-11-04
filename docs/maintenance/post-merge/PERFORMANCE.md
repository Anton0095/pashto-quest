# Post-merge performance report

Baseline release: `09a0d682c3c70a1d1327f1fe082c0e4c439d4b04b7e088160140cd728b9c7d19`.
Final release: `dac948d2a1e9fecc6dd36bc6c6b1996e35f24e56cf05687a29181f0022aeebaf`.

## Method and reproducibility

Run sequentially, with no verification suite or other browser benchmark competing for CPU:

```sh
node tools/rpg-performance.mjs --release frozen.html --output rpg.json --samples 20
node tools/performance-benchmark.mjs --release frozen.html --output curriculum.json --samples 20
python3 tools/audit-performance-report.py before.json after.json comparison.md
```

Host: INTEL(R) XEON(R) PLATINUM 8573C; Node v24.19.0; Chromium 154.0.8037.57. Same host/browser for each pair. Desktop is 1280px at normal CPU; mobile4x is a 375px viewport with CDP 4× slowdown. Neither is physical iPhone/Safari verification.

The RPG harness uses twenty local document reloads, twenty real house round trips and two-second idle frame windows in the village and house. Embedded assets and intercepted local HTTP navigation measure browser delivery/parsing/initialization, not internet download latency or a cold OS cache. Scene-ready is the observed Phaser initialization flag, not first-paint latency. Transition timings include the established 115ms tween. RPG p50/p95 use nearest-rank percentiles; raw [before](rpg-before.json) and [after](rpg-after.json) retain the reported distributions/counters. The larger educational matrix separately covers fourteen normal-route days at paces 0/12/24 for both CPU profiles, twenty operation samples and ten revision sessions. Its injected navigation is test-only; it is not a fourteen-day RPG playthrough.

## Build and asset sizes

| Metric | Before bytes | After bytes | Change |
|---|---:|---:|---:|
| Offline HTML | 5,246,845 | 4,609,414 | -12.149% |
| Minified Phaser/RPG JavaScript | 1,457,019 | 1,457,150 | +0.009% |
| Offline HTML, gzip | 2,200,131 | 1,728,591 | -21.43% |
| Five runtime portrait crops | 1,636,098 | 1,171,828 | -28.38% |

Gzip uses Python gzip with `mtime=0`. The 131-byte RPG JavaScript increase carries the confirmed stability guards; it is under 0.01%. Phaser itself remains unchanged. The offline payload reduction comes mainly from lossless portrait encoding, plus removal of the shipped old navigation renderer and dead presentation code. All five portraits retain identical decoded RGBA hashes and dimensions at both widths. Original screenshots/crop provenance remain available and are not bundled as runtime portraits. Encoding reduces payload size; no decoded-image memory reduction is claimed. [Exact sizes and checksums](sizes.json).

## Production RPG timings

Milliseconds are p50 / p95, twenty samples per cell.

| Profile | Document load before → after | Scene-ready before → after | House entrance before → after | House exit before → after | Indoor step before → after |
|---|---|---|---|---|---|
| desktop | 509.5 / 568.1 → 416.3 / 499.7 | 598.5 / 700.5 → 508.1 / 544.5 | 133.8 / 141.7 → 133.7 / 137.2 | 126.8 / 139.5 → 125.7 / 136.8 | 129.7 / 147.6 → 129.7 / 144.3 |
| mobile4x | 1917.2 / 3411.3 → 1560.6 / 2466.5 | 2118.8 / 4024.3 → 1762.3 / 3183.1 | 155.6 / 218.7 → 152.3 / 224.2 | 156.4 / 297.8 → 154.8 / 187.5 | 137.6 / 159.9 → 133.5 / 148.8 |

| Profile | Village FPS before → after | Village rAF p95 / max ms before → after | House FPS before → after | Village actor calls / frame before → after |
|---|---:|---|---:|---:|
| desktop | 59.5 → 60.3 | 16.7 / 50.1 → 16.7 / 16.8 | 59.9 → 60.7 | 3.0 → 1.0 |
| mobile4x | 27.8 → 58.9 | 33.3 / 1083.3 → 16.8 / 33.4 | 56.8 → 59.8 | 3.0 → 1.0 |

FPS/frame intervals are one bounded two-second diagnostic window per scene/profile, not repeated GPU-frame or sustained-device measurements. The village fixture is near NPC interaction checks; the house fixture has no nearby NPC and already required one actor lookup per frame. No universal frame-rate guarantee is inferred.

## Repeated UI and persistence work

Each dialogue sample performs 100 role updates with the same two character identities; twenty samples per profile. Labels must still change, while images should be reused. Fence timings await twenty unchanged-state commits of a small synthetic `same` payload and measure the fence/metadata operation, not an entire gameplay save.

| Profile | 100 role updates p50 / p95 ms before → after | Images created, 2,000 updates | Digests, 20 no-op commits | Fence p50 / p95 ms before → after |
|---|---|---:|---:|---|
| desktop | 11.3 / 22.7 → 0.9 / 2.3 | 4,000 → 0 | 60 → 20 | 1.0 / 5.8 → 1.0 / 5.4 |
| mobile4x | 44.0 / 83.3 → 3.5 / 6.9 | 4,000 → 0 | 60 → 20 | 15.1 / 45.4 → 14.7 / 44.2 |

No revision-head check or unchanged-save CAS protection was removed. Independent stale-renderer, ambiguous-write, failure/retry and reset regressions still apply.

## Retained JavaScript heap and scene objects

CDP heap values are after forced GC, in bytes. These exclude total browser/GPU/native image memory and are not allocation peaks.

| Profile | Heap before / after 20 round trips, baseline | Heap before / after 20 round trips, final | Delta baseline → final | Live update objects baseline / final |
|---|---:|---:|---:|---|
| desktop | 7,602,484 / 8,681,712 | 7,572,056 / 8,667,584 | +1,079,228 → +1,095,528 | 9→9 / 9→9 |
| mobile4x | 7,580,828 / 8,700,472 | 7,564,240 / 8,661,728 | +1,119,644 → +1,097,488 | 9→9 / 9→9 |

Both runs retain approximately 1.1 MB more JS heap after the bounded warm-up/transition run; no heap reduction or zero-leak claim is made. The raw files also record ten-cycle checkpoints. Live Phaser update-object counts do not grow. Longer endurance testing and exact allocation peaks remain unmeasured.

## Deterministic generation diagnostic

Synthetic disposable fixtures activate/pass fourteen educational days; this does not activate future RPG story content. Day 1/7/14 pool counts and seeded complete-question payload hashes are identical before/after. No sentence-engine, grammar, distractor or language data was changed. Milliseconds below are p50 / p95 from twenty samples.

| Profile / day | Cold eligibility before → after | New challenge before → after |
|---|---|---|
| desktop / 1 | 1.0 / 1.7 → 0.9 / 2.0 | 8.1 / 14.2 → 7.6 / 11.2 |
| desktop / 7 | 88.9 / 207.2 → 84.6 / 128.3 | 32.4 / 50.8 → 30.5 / 47.5 |
| desktop / 14 | 338.3 / 546.0 → 248.4 / 366.3 | 74.0 / 98.6 → 47.5 / 60.9 |
| mobile4x / 1 | 2.7 / 5.5 → 5.2 / 17.2 | 29.5 / 36.9 → 34.9 / 49.7 |
| mobile4x / 7 | 382.6 / 433.8 → 399.7 / 542.4 | 144.9 / 196.3 → 107.4 / 135.9 |
| mobile4x / 14 | 1578.2 / 2862.1 → 1468.2 / 1589.4 | 375.8 / 492.5 → 327.2 / 427.0 |

Small-operation timings vary on this shared host: mobile Day 1 cold eligibility is 2.7→5.2ms and challenge creation 29.5→34.9ms in this pair, while larger late-day measurements and document loads improve. Their observed ranges overlap; the unchanged engine/output contracts do not establish a causal grammar-speed change. No optimization or universal improvement is claimed for those unmodified algorithms.

The broader matrix also contains materially slower observations (for example, desktop pace-24 Day 13 cold p50 282.75→443.40ms and mobile pace-12 Day 14 cold p95 990.20→1747.00ms). These are disclosed rather than averaged away. The generator source is unchanged, but this shared-host run cannot establish whether timing shifts are caused by scheduling/GC, surrounding UI work or another factor. The causal latency comparison is inconclusive; further dedicated profiling would be needed before changing the engine.

The complete six-profile curriculum comparison is in [the appendix](CURRICULUM_PERFORMANCE.md), with raw [before](curriculum-before.json) and [after](curriculum-after.json). It retains every operation sample and storage/GC observations. These are diagnostic controlled routes, separate from the complete functional playthroughs.

## Console observations and unmeasured areas

Both production benchmark pairs recorded Chromium’s blocked `beforeunload` confirmation notice when automation reloaded a frame without a user gesture. This is an artifact of synthetic reloads during asynchronous saving, not an uncaught application exception. Both benchmark pairs contain zero page errors. The separately reproduced pending-disposal TypeError is a pre-existing defect fixed and covered by the new regression. Physical Safari/iPhone, real-device pronunciation, internet throughput, exact GPU frame time and allocation peaks were not measured. No line-coverage percentage is available.
