# Chromium performance baseline

Raw measurements: [before](performance-before.json), [after](performance-after.json), [fresh-process before](cold-before.json). [Every median, p95 and worst case](timings.csv).

Host: AMD EPYC 9V74 80-Core Processor; Linux x64; Node v24.19.0; Chromium 154.0.8037.57. Reported logical CPUs: 3. Observed cgroup quota: 2.0 CPUs; memory limit: 8192.00 MiB. Desktop: 1280 × 1000, normal CPU. Mobile: 375 × 1000, CDP 4× CPU slowdown. These are Linux Chromium measurements, not physical phone results.

Each profile completes the real tutorial and all fourteen normal-route days at pace 0, 12 or 24. Measurements occur after Days 1, 7, 13 and 14. Operations run sequentially with 20 samples; p95 is the nineteenth sorted sample and worst is the twentieth. Sub-millisecond timings approach Chromium’s clock resolution. The first-generation and challenge-open timings are single observations and have no claimed p95. Test-only wrappers count lexical-index calls/rebuilds and their elapsed time; this adds measurement overhead.

Cold eligibility means deleting the eligibility catalogue cache, while the process and immutable index may already be warm. Fresh-process first-generation timings below separately include the first lexical-index build. Catalogue explicitly enumerates the eligible base cards; warm eligibility adds applicable coordinated clauses. Study selection requests three cards. Challenge creation deletes only the frozen question list, then builds a complete 15/25-question assessment including save; the UI-open observation also renders the initial question. Dialogue time covers typed question/reply pairing. Storage write replaces the existing game key; complete-save includes serialization, active snapshot handling, writing and exact read-back confirmation.

Ten bounded review sessions each replay Day-14 Home, answer up to ten due review items, open a Library entry/example and return to town. A synthetic 90-day clock advance makes each session due without rewriting SRS. The harness yields between interaction blocks; it does not execute hundreds of learner actions in a single synchronous task.

Before release SHA-256: `23613e4ac6ec62751ae02c72967d16b2fbd0bc4246b376ecfd03185bbc3f8fe4` (commit `7c1fe36`). After: `d58f62d15e6087fa3463f337477583cddbdd5b7c8763343996af069555d1c5fe` (runtime commit `d41d34f`).

## Generation after the change

All values are **median / p95 milliseconds**. Full worst cases and index costs are in the CSV.

| Profile | Pace | Day | Catalogue | Cold eligibility | Warm eligibility | Select 3 | Challenge | Dialogues |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| desktop | 0 | 1 | 0.00 / 0.30 | 0.00 / 0.10 | 0.00 / 0.00 | 0.00 / 0.10 | 1.45 / 1.80 | 0.10 / 0.30 |
| desktop | 0 | 7 | 0.30 / 0.60 | 0.20 / 0.40 | 0.00 / 0.10 | 0.00 / 0.10 | 8.30 / 10.90 | 0.10 / 0.20 |
| desktop | 0 | 13 | 0.70 / 4.40 | 0.60 / 0.90 | 0.00 / 0.10 | 0.00 / 0.10 | 6.65 / 7.50 | 0.10 / 0.20 |
| desktop | 0 | 14 | 0.65 / 1.10 | 0.75 / 1.00 | 0.00 / 0.10 | 0.05 / 0.20 | 7.20 / 8.30 | 0.10 / 0.40 |
| desktop | 12 | 1 | 0.10 / 0.80 | 0.20 / 1.00 | 0.00 / 0.10 | 0.00 / 0.10 | 18.30 / 20.90 | 0.15 / 0.20 |
| desktop | 12 | 7 | 22.25 / 26.10 | 22.15 / 27.10 | 0.60 / 0.70 | 0.80 / 1.50 | 55.65 / 64.00 | 0.50 / 1.00 |
| desktop | 12 | 13 | 140.85 / 154.90 | 140.35 / 147.00 | 0.75 / 1.10 | 1.70 / 3.20 | 80.00 / 85.20 | 2.00 / 4.50 |
| desktop | 12 | 14 | 141.40 / 158.30 | 139.25 / 163.40 | 0.70 / 1.10 | 0.90 / 1.30 | 117.30 / 149.20 | 1.00 / 1.20 |
| desktop | 24 | 1 | 0.45 / 1.00 | 0.35 / 0.50 | 0.00 / 0.10 | 0.00 / 0.10 | 11.15 / 12.50 | 0.10 / 0.30 |
| desktop | 24 | 7 | 63.35 / 67.00 | 62.70 / 66.80 | 0.60 / 0.80 | 0.80 / 1.00 | 82.45 / 87.50 | 0.70 / 1.00 |
| desktop | 24 | 13 | 263.00 / 295.30 | 260.50 / 290.40 | 0.95 / 1.40 | 1.40 / 1.80 | 138.25 / 164.10 | 1.90 / 3.90 |
| desktop | 24 | 14 | 266.15 / 288.90 | 256.25 / 297.20 | 0.90 / 1.20 | 1.50 / 3.70 | 218.30 / 254.30 | 1.80 / 2.10 |
| mobile4x | 0 | 1 | 0.00 / 0.70 | 0.00 / 0.90 | 0.00 / 0.00 | 0.00 / 0.10 | 7.30 / 9.10 | 0.30 / 1.90 |
| mobile4x | 0 | 7 | 1.05 / 3.60 | 0.95 / 2.70 | 0.00 / 0.60 | 0.00 / 0.70 | 44.15 / 47.40 | 0.10 / 0.80 |
| mobile4x | 0 | 13 | 3.00 / 5.20 | 2.95 / 4.20 | 0.05 / 0.30 | 0.00 / 0.80 | 27.90 / 31.60 | 0.10 / 1.00 |
| mobile4x | 0 | 14 | 4.15 / 12.80 | 3.05 / 5.40 | 0.00 / 0.80 | 0.10 / 0.80 | 37.50 / 45.50 | 0.10 / 1.00 |
| mobile4x | 12 | 1 | 0.40 / 4.40 | 0.10 / 2.00 | 0.00 / 0.00 | 0.00 / 0.10 | 106.55 / 130.50 | 0.15 / 1.90 |
| mobile4x | 12 | 7 | 127.50 / 145.70 | 135.35 / 158.50 | 2.50 / 4.30 | 3.95 / 5.80 | 277.45 / 312.30 | 1.35 / 4.30 |
| mobile4x | 12 | 13 | 749.65 / 852.30 | 768.35 / 859.90 | 6.35 / 9.40 | 7.50 / 14.40 | 475.20 / 522.80 | 7.60 / 13.00 |
| mobile4x | 12 | 14 | 718.95 / 792.40 | 746.25 / 772.90 | 3.95 / 5.30 | 5.60 / 6.70 | 673.90 / 747.60 | 5.05 / 11.10 |
| mobile4x | 24 | 1 | 2.45 / 4.70 | 1.70 / 5.80 | 0.00 / 0.10 | 0.00 / 0.70 | 63.20 / 71.20 | 0.50 / 1.60 |
| mobile4x | 24 | 7 | 359.00 / 421.20 | 341.05 / 360.30 | 4.05 / 6.40 | 4.45 / 6.60 | 446.15 / 566.40 | 3.35 / 7.30 |
| mobile4x | 24 | 13 | 1367.25 / 1663.00 | 1355.35 / 1627.90 | 4.90 / 6.30 | 9.70 / 13.30 | 720.50 / 774.20 | 12.45 / 21.30 |
| mobile4x | 24 | 14 | 1399.25 / 1556.70 | 1386.15 / 1638.50 | 5.70 / 8.60 | 7.60 / 12.60 | 1226.45 / 1412.40 | 8.10 / 10.30 |

## Fresh-process first generation

Single first-generation observations, milliseconds. These are separate from the 20-sample cache-miss measurements.

| Profile | Pace | Before | After |
|---|---:|---:|---:|
| desktop | 0 | 1.60 | 1.90 |
| desktop | 12 | 2.70 | 5.50 |
| desktop | 24 | 3.20 | 3.50 |
| mobile4x | 0 | 6.60 | 6.10 |
| mobile4x | 12 | 9.30 | 19.90 |
| mobile4x | 24 | 13.60 | 14.70 |

## One targeted optimisation

The compiler shares a WeakMap index only for immutable lexical roots and evidence. Mutable and shallow-frozen editorial inputs rebuild; changing player forms or grammar still invalidates eligibility. The cache has no player state or random state. No catalogue, selection, sentence, dialogue or scoring algorithm was changed. The regression contract checks byte-identical complete card and dialogue payloads and twenty seeded selections per day, all fourteen days.

| Profile | Pace | Day | Warm eligibility before → after (median ms) | Challenge before → after (median ms) | Challenge index rebuilds before → after |
|---|---:|---:|---:|---:|---:|
| desktop | 12 | 7 | 3.00 → 0.60 | 76.50 → 55.65 | 481 → 0 |
| desktop | 12 | 13 | 2.80 → 0.75 | 92.65 → 80.00 | 238 → 0 |
| desktop | 12 | 14 | 2.80 → 0.70 | 143.45 → 117.30 | 436 → 0 |
| desktop | 24 | 7 | 3.00 → 0.60 | 104.60 → 82.45 | 481 → 0 |
| desktop | 24 | 13 | 3.10 → 0.95 | 165.70 → 138.25 | 238 → 0 |
| desktop | 24 | 14 | 3.40 → 0.90 | 239.60 → 218.30 | 436 → 0 |
| mobile4x | 12 | 7 | 15.75 → 2.50 | 370.70 → 277.45 | 481 → 0 |
| mobile4x | 12 | 13 | 14.85 → 6.35 | 500.20 → 475.20 | 238 → 0 |
| mobile4x | 12 | 14 | 16.20 → 3.95 | 822.35 → 673.90 | 436 → 0 |
| mobile4x | 24 | 7 | 14.10 → 4.05 | 528.05 → 446.15 | 481 → 0 |
| mobile4x | 24 | 13 | 19.60 → 4.90 | 791.70 → 720.50 | 238 → 0 |
| mobile4x | 24 | 14 | 18.50 → 5.70 | 1331.00 → 1226.45 | 436 → 0 |

Repeated warm availability retained the same base cache in every profile/day. Every tested form change and grammar change invalidated eligibility (no-form profiles are N/A for form invalidation). All measured after-phase warm operations perform zero index rebuilds; the immutable index is first built during first generation. The compiler contract independently observed one index build across all fourteen days and draws. Cold catalogue timing is not claimed to improve: several observed late mobile medians were higher after the change (for example, default Day 13 1,154.90 → 1,367.25 ms). The measured benefit is repeated warm eligibility and challenge creation; catalogue enumeration remains a separate bottleneck. Timing distributions and raw observations are retained rather than attributing every cross-run difference to the cache.

## JavaScript memory

All values below are **MiB**. Initial and day/review values use `Runtime.getHeapUsage.usedSize` after forced garbage collection. The sampled high-water column is the largest pre-GC heap at measurement boundaries. **Exact instantaneous peak allocation during a compiler call was not captured**; this sampled value is a lower bound, not a claimed peak. Browser RSS, GPU memory and physical mobile memory were not measured.

| Profile | Pace | Initial | Day 1 | Day 7 | Day 13 | Day 14 | Sampled high water | After 10 review sessions |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| desktop | 0 | 1.59 | 3.03 | 3.55 | 3.76 | 3.83 | 10.08 | 3.90 |
| desktop | 12 | 1.59 | 3.35 | 5.52 | 11.87 | 12.05 | 12.18 | 12.17 |
| desktop | 24 | 1.59 | 3.45 | 7.62 | 17.20 | 17.45 | 86.48 | 17.71 |
| mobile4x | 0 | 1.60 | 3.04 | 3.56 | 3.77 | 3.84 | 5.77 | 3.92 |
| mobile4x | 12 | 1.61 | 3.37 | 5.54 | 11.83 | 12.02 | 116.38 | 12.17 |
| mobile4x | 24 | 1.61 | 3.46 | 7.58 | 17.19 | 17.42 | 152.21 | 17.65 |

The eligible catalogue intentionally retains one base array for the current eligibility signature. The new weak lexical index references existing frozen entries/forms; it does not retain player profiles. The chosen-card registry, frozen questions, provenance and SRS owners intentionally remain available for exact resume and revision. Ten bounded sessions are a short retention sample, not proof against an indefinite leak. Persistent audit/event growth below is confirmed; no unbounded eligibility-cache history was found in source.

## Persisted progress

UTF-8 bytes measure exported JSON. UTF-16 bytes count two bytes per string code unit as a conservative localStorage budgeting estimate; browser quota accounting varies. Sizes after completed days exclude the active attempt, whose actual opening snapshot is also in the raw data. Frozen question/history and generated-card snapshots remain in day plans. No native quota failure occurred in these benchmark profiles.

| Profile | Pace | Day 1 UTF-8 bytes | Day 7 UTF-8 bytes | Day 14 UTF-8 bytes | Day 14 UTF-16 bytes | After 10 sessions UTF-8 bytes | Growth UTF-8 bytes |
|---|---:|---:|---:|---:|---:|---:|---:|
| desktop | 0 | 17,028 | 130,875 | 318,753 | 634,398 | 383,000 | 64,247 |
| desktop | 12 | 49,724 | 763,359 | 1,610,110 | 3,203,162 | 1,704,809 | 94,699 |
| desktop | 24 | 90,463 | 907,726 | 1,851,434 | 3,685,430 | 1,947,905 | 96,471 |
| mobile4x | 0 | 17,028 | 130,875 | 318,753 | 634,398 | 383,000 | 64,247 |
| mobile4x | 12 | 49,724 | 763,359 | 1,610,110 | 3,203,162 | 1,704,809 | 94,699 |
| mobile4x | 24 | 90,463 | 907,726 | 1,851,434 | 3,685,430 | 1,947,905 | 96,471 |

Day-14 storage components (UTF-8 bytes). Snapshot bytes are a **subset of plans**, not an additional amount to sum.

| Profile | Pace | Plans | Generated/question snapshots | Delivery records | Practice-event locks | SRS units + acquired forms | Active exam at opening |
|---|---:|---:|---:|---:|---:|---:|---:|
| desktop | 0 | 177,902 | 168,821 | 58,434 | 6,910 | 44,624 | 20,526 |
| desktop | 12 | 711,150 | 678,032 | 474,141 | 15,553 | 331,769 | 52,787 |
| desktop | 24 | 735,354 | 697,312 | 571,100 | 18,932 | 438,516 | 53,073 |
| mobile4x | 0 | 177,902 | 168,821 | 58,434 | 6,910 | 44,624 | 20,526 |
| mobile4x | 12 | 711,150 | 678,032 | 474,141 | 15,553 | 331,769 | 52,787 |
| mobile4x | 24 | 735,354 | 697,312 | 571,100 | 18,932 | 438,516 | 53,073 |

## Serialization and synchronous saving

Day-14 **median / p95 ms**; all days and worst cases are in the CSV.

| Profile | Pace | JSON serialization | Write only | Complete verified save |
|---|---:|---:|---:|---:|
| desktop | 0 | 0.90 / 1.10 | 0.70 / 1.10 | 2.40 / 2.90 |
| desktop | 12 | 5.60 / 9.90 | 9.00 / 10.60 | 19.30 / 50.30 |
| desktop | 24 | 6.30 / 9.60 | 8.45 / 10.80 | 21.20 / 53.00 |
| mobile4x | 0 | 5.45 / 7.70 | 3.30 / 4.90 | 9.75 / 12.50 |
| mobile4x | 12 | 35.90 / 39.70 | 27.80 / 36.10 | 69.25 / 87.10 |
| mobile4x | 24 | 40.60 / 48.40 | 40.30 / 48.40 | 85.40 / 104.50 |

The native Chromium test filled 10,432,866 UTF-16 filler bytes alongside the existing game save before retry failed at both widths; quota accounting should not be inferred for other browsers from this single origin. Quota risk: the default completed profile already occupies several MiB under UTF-16 budgeting, and events/delivery evidence continues to grow during revision. A 5-MiB conservative budget has limited headroom; real limits depend on browser/origin/policy. The browser regression separately fills native Chromium localStorage to quota, observes the warning, removes filler and verifies retry/reload. Synthetic Safari/iPhone quota estimates are not physical Safari evidence.

## Ranked remaining work

1. **Confirmed CPU cost:** late-game cold catalogue enumeration remains the largest generation operation. Index sharing improves warm work but does not reduce licensed combinations or the enumeration algorithm. Further optimisation is justified on throttled mobile; prototype cached constraint buckets or unchanged-eligibility reuse with the existing byte-level contracts before changing delivery.
2. **Confirmed synchronous I/O cost:** complete verified saves serialize/write/read substantial progress repeatedly. Evaluate measured coalescing only if first-answer locks, typed drafts, tile positions and close/reload durability remain exact. No save debouncing or loss of integrity was introduced here.
3. **Confirmed persistent growth:** audit deliveries, practice-event reward locks and frozen histories accumulate. Investigate compact immutable references or bounded audit summaries separately. Do not discard score/SRS/provenance evidence merely to reduce size.
4. **Unconfirmed long-run heap concern:** these bounded review samples do not establish an indefinite leak. Retained catalogues and chosen-card registries have known runtime consumers; no speculative removal was made.

An early synchronous stress attempt was killed (exit 137); it did not produce a complete benchmark and was discarded. The final yielding, ten-item review harness completed all six profiles before and after. Those interrupted attempts are not counted as passing runs or used to invent peak-memory figures.
