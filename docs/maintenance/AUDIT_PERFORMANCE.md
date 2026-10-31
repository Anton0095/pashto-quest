# Audit performance measurements

Corrected/refactored baseline: commit `697a4f5`, frozen release SHA-256 `acefc5312c87831a1111d14eef00642546e6057b62b255563b3428a051cf19bd`.
Optimised release SHA-256: `c813ab6b543ddf58333cce13f6443432ada7c6075d46af6cc08138be6db3242b`.

Each cell is median / p95 milliseconds from 20 sequential samples. Same host, Chromium, viewport, pace and route; mobile uses 375px and CDP 4× CPU slowdown. Profiles run sequentially, with no verification suite running concurrently. Cold eligibility means an eligibility-cache miss, not an OS/browser cold boot. Both versions use the corrected harness, which completes review study before answering and bounds the due pool to ten items. The complete save sample is an unchanged-state save; the optimised version can avoid its write. Changed responses remain synchronous and are covered by persistence/resume tests. Browser-only instrumentation adds index timing overhead. The shared container has a 2-CPU cgroup quota and 8 GiB memory limit; logical CPU/model and browser version are recorded in the raw reports.

Raw [before](audit/performance-before.json) and [after](audit/performance-after.json) include every sample, section size, opening time, initial boot, cache invalidation and heap observations.

| Profile / pace / day | Cold eligibility before → after | Warm before → after | Selection before → after | New assessment before → after | Complete save before → after |
|---|---|---|---|---|---|
| desktop / 0 / 1 | 0.00 / 0.10 → 0.10 / 0.20 | 0.00 / 0.00 → 0.00 / 0.00 | 0.00 / 0.10 → 0.00 / 0.10 | 1.15 / 1.60 → 1.80 / 7.00 | 0.00 / 0.10 → 0.00 / 0.10 |
| desktop / 0 / 7 | 0.30 / 0.50 → 0.30 / 0.70 | 0.00 / 0.10 → 0.00 / 0.10 | 0.00 / 0.10 → 0.00 / 0.10 | 6.95 / 7.80 → 7.15 / 7.60 | 0.35 / 0.60 → 0.20 / 0.30 |
| desktop / 0 / 13 | 0.60 / 0.90 → 0.60 / 2.50 | 0.00 / 0.20 → 0.00 / 0.10 | 0.00 / 0.10 → 0.00 / 0.10 | 3.35 / 4.20 → 3.40 / 5.70 | 0.60 / 1.00 → 0.50 / 1.30 |
| desktop / 0 / 14 | 0.60 / 1.00 → 0.65 / 1.00 | 0.05 / 0.10 → 0.00 / 0.10 | 0.00 / 0.10 → 0.00 / 0.10 | 4.10 / 6.00 → 4.20 / 4.70 | 0.70 / 0.80 → 0.50 / 0.80 |
| desktop / 12 / 1 | 0.20 / 0.30 → 0.10 / 0.20 | 0.00 / 0.10 → 0.00 / 0.10 | 0.00 / 0.10 → 0.00 / 0.10 | 16.85 / 17.70 → 17.65 / 20.40 | 0.20 / 0.30 → 0.10 / 0.20 |
| desktop / 12 / 7 | 24.10 / 26.60 → 16.00 / 17.80 | 0.60 / 0.90 → 0.00 / 0.10 | 1.00 / 2.00 → 0.20 / 0.70 | 49.55 / 55.00 → 38.05 / 45.20 | 7.75 / 33.70 → 3.15 / 6.00 |
| desktop / 12 / 13 | 149.20 / 169.90 → 101.85 / 119.30 | 0.70 / 1.00 → 0.05 / 0.20 | 1.00 / 1.50 → 0.70 / 1.00 | 64.95 / 73.70 → 60.35 / 73.30 | 12.75 / 34.10 → 6.25 / 9.50 |
| desktop / 12 / 14 | 143.95 / 156.50 → 94.35 / 102.50 | 0.75 / 1.20 → 0.10 / 0.10 | 0.90 / 1.10 → 0.55 / 0.80 | 106.45 / 135.60 → 92.60 / 102.10 | 16.85 / 44.40 → 7.80 / 15.80 |
| desktop / 24 / 1 | 0.40 / 0.80 → 0.40 / 0.70 | 0.00 / 0.00 → 0.00 / 0.10 | 0.00 / 0.10 → 0.00 / 0.10 | 10.55 / 11.80 → 10.70 / 11.50 | 0.50 / 0.80 → 0.20 / 0.40 |
| desktop / 24 / 7 | 65.35 / 70.00 → 46.40 / 50.00 | 0.70 / 0.90 → 0.05 / 0.10 | 0.90 / 1.00 → 0.45 / 2.90 | 69.35 / 80.00 → 62.80 / 66.40 | 8.95 / 27.20 → 3.00 / 3.70 |
| desktop / 24 / 13 | 296.50 / 343.90 → 185.50 / 203.70 | 0.90 / 1.40 → 0.10 / 0.20 | 1.30 / 2.90 → 1.00 / 6.20 | 139.30 / 175.50 → 109.45 / 121.30 | 16.20 / 42.60 → 5.60 / 9.70 |
| desktop / 24 / 14 | 285.75 / 311.50 → 177.70 / 198.40 | 1.10 / 1.80 → 0.10 / 0.20 | 1.55 / 3.60 → 0.85 / 5.30 | 201.75 / 239.30 → 172.30 / 189.20 | 18.90 / 40.80 → 6.40 / 25.60 |
| mobile4x / 0 / 1 | 0.00 / 1.00 → 0.00 / 0.80 | 0.00 / 0.00 → 0.00 / 0.00 | 0.00 / 0.10 → 0.00 / 0.40 | 6.05 / 7.80 → 6.00 / 7.40 | 0.35 / 1.00 → 0.00 / 0.80 |
| mobile4x / 0 / 7 | 0.80 / 1.90 → 0.90 / 2.60 | 0.00 / 0.10 → 0.00 / 0.10 | 0.00 / 0.10 → 0.00 / 0.10 | 32.75 / 38.50 → 32.40 / 37.80 | 1.10 / 1.80 → 0.80 / 1.70 |
| mobile4x / 0 / 13 | 3.25 / 5.70 → 3.95 / 6.20 | 0.10 / 0.70 → 0.00 / 0.70 | 0.10 / 0.80 → 0.00 / 0.80 | 19.90 / 22.60 → 16.70 / 21.50 | 3.80 / 5.80 → 1.80 / 2.80 |
| mobile4x / 0 / 14 | 3.05 / 4.00 → 2.80 / 3.40 | 0.00 / 0.90 → 0.00 / 0.60 | 0.10 / 0.90 → 0.00 / 0.60 | 23.85 / 29.60 → 18.50 / 23.60 | 3.40 / 5.40 → 2.00 / 3.20 |
| mobile4x / 12 / 1 | 0.25 / 1.90 → 0.60 / 6.00 | 0.00 / 0.10 → 0.00 / 0.50 | 0.00 / 1.30 → 0.00 / 0.20 | 83.40 / 113.90 → 72.50 / 88.40 | 1.00 / 2.00 → 0.25 / 1.20 |
| mobile4x / 12 / 7 | 126.75 / 133.30 → 80.40 / 90.70 | 3.45 / 5.30 → 0.00 / 0.80 | 3.40 / 6.90 → 0.50 / 4.80 | 238.00 / 274.80 → 196.00 / 231.40 | 27.55 / 30.30 → 10.80 / 13.10 |
| mobile4x / 12 / 13 | 766.75 / 886.40 → 501.05 / 576.40 | 4.40 / 6.70 → 0.20 / 0.90 | 6.30 / 8.80 → 2.95 / 5.70 | 368.50 / 395.90 → 309.30 / 329.30 | 59.10 / 68.20 → 24.85 / 30.40 |
| mobile4x / 12 / 14 | 712.50 / 792.20 → 468.80 / 504.60 | 5.25 / 8.20 → 0.20 / 1.10 | 6.05 / 8.20 → 3.75 / 8.60 | 591.15 / 713.10 → 513.30 / 576.80 | 58.00 / 63.30 → 26.40 / 34.80 |
| mobile4x / 24 / 1 | 2.05 / 4.10 → 2.20 / 3.70 | 0.00 / 0.10 → 0.00 / 0.20 | 0.00 / 0.10 → 0.05 / 1.00 | 47.15 / 56.20 → 51.70 / 57.20 | 2.30 / 3.70 → 1.25 / 2.70 |
| mobile4x / 24 / 7 | 331.50 / 364.10 → 246.60 / 258.50 | 3.35 / 4.20 → 0.10 / 1.00 | 4.40 / 5.90 → 2.45 / 11.10 | 375.35 / 396.80 → 338.40 / 360.80 | 33.25 / 37.30 → 13.60 / 17.00 |
| mobile4x / 24 / 13 | 1320.70 / 1438.10 → 965.10 / 1058.20 | 3.90 / 6.00 → 1.25 / 3.40 | 6.10 / 7.50 → 6.85 / 12.20 | 642.10 / 705.10 → 677.25 / 777.90 | 64.75 / 84.30 → 32.70 / 40.20 |
| mobile4x / 24 / 14 | 1367.80 / 1473.40 → 902.75 / 1006.40 | 4.00 / 5.00 → 0.85 / 1.30 | 7.45 / 14.10 → 3.70 / 7.70 | 1120.40 / 1241.10 → 1009.20 / 1096.40 | 74.50 / 87.30 → 31.95 / 36.90 |

| Profile / pace | Day 14 save bytes before → after | After ten revisions bytes before → after | Day 14 JS heap bytes after GC before → after |
|---|---|---|---|
| desktop / 0 | 150,408 → 134,836 | 229,370 → 190,533 | 4,006,672 → 4,153,868 |
| desktop / 12 | 1,235,952 → 1,183,902 | 1,344,678 → 1,250,852 | 14,727,892 → 14,282,944 |
| desktop / 24 | 1,466,226 → 1,405,453 | 1,576,728 → 1,473,472 | 20,839,192 → 19,370,524 |
| mobile4x / 0 | 150,408 → 134,836 | 229,370 → 190,533 | 4,027,996 → 4,175,048 |
| mobile4x / 12 | 1,235,952 → 1,183,902 | 1,344,678 → 1,250,852 | 14,750,028 → 14,311,556 |
| mobile4x / 24 | 1,466,226 → 1,405,453 | 1,576,728 → 1,473,472 | 20,819,304 → 19,333,180 |

Save sizes are UTF-8 bytes; raw reports also contain UTF-16 storage estimates. Completed-event metadata is bounded by protected attempts. Delivery summaries remain bounded by distinct content/surface/mode identities, so new sentence identities intentionally still add evidence. Ten revisions are a bounded stress sample, not a lifetime storage guarantee. JS heap is CDP after forced GC; sampled pre-GC values do not establish an exact peak or total allocations. CPU throttling and desktop emulation do not verify physical phones or native audio. Small sub-millisecond differences include timer quantisation and shared-host noise; these are observations, not universal speed guarantees.

Deferred metadata still carries cache/context overhead: any retained-heap increase in the table is an explicit tradeoff for lower cold/warm latency, not an allocation-peak improvement claim. The rejected first accessor trial used 23.5 MB at desktop pace-12 Day 14 versus the baseline’s 14.7 MB; it is excluded from the final paired samples.

Full catalogue, dialogue, serialization and write-only distributions are in the raw reports. The fourteen-day card/dialogue and 20-seed contract compares exact payload hashes separately from timing, preventing reduced pools or changed selection from masquerading as speedups.
