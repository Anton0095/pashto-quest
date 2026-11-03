# Paired curriculum performance measurements

Baseline release SHA-256: `09a0d682c3c70a1d1327f1fe082c0e4c439d4b04b7e088160140cd728b9c7d19`.
Final release SHA-256: `dac948d2a1e9fecc6dd36bc6c6b1996e35f24e56cf05687a29181f0022aeebaf`.

Each cell is median / p95 milliseconds from 20 sequential samples. Same host, Chromium, viewport, pace and route; mobile uses 375px and CDP 4× CPU slowdown. Profiles run sequentially, with no verification suite running concurrently. Cold eligibility means an eligibility-cache miss, not an OS/browser cold boot. Both releases use the same corrected test-only navigation harness. Save enqueue measures the synchronous call, not completion of asynchronous Web Locks/IndexedDB I/O. Browser-only index instrumentation adds overhead.

Raw [before](curriculum-before.json) and [after](curriculum-after.json) include all operation samples, cache invalidation, storage and heap observations. Initial boot/first-generation/opening values in those files are single observations, not latency distributions.

| Profile / pace / day | Cold eligibility before → after | Warm before → after | Selection before → after | New assessment before → after | Save enqueue before → after |
|---|---|---|---|---|---|
| desktop / 0 / 1 | 0.00 / 0.10 → 0.00 / 0.20 | 0.00 / 0.00 → 0.00 / 0.20 | 0.00 / 0.10 → 0.00 / 0.10 | 10.30 / 36.40 → 7.45 / 12.80 | 0.00 / 0.10 → 0.00 / 0.10 |
| desktop / 0 / 7 | 0.50 / 1.00 → 0.30 / 0.60 | 0.00 / 0.10 → 0.00 / 0.10 | 0.00 / 0.10 → 0.00 / 0.10 | 29.75 / 42.30 → 27.50 / 32.30 | 0.50 / 1.20 → 0.20 / 0.70 |
| desktop / 0 / 13 | 0.90 / 1.40 → 0.90 / 1.50 | 0.00 / 0.10 → 0.00 / 0.20 | 0.00 / 0.10 → 0.00 / 0.10 | 45.70 / 54.10 → 45.95 / 56.90 | 0.60 / 1.20 → 0.70 / 2.10 |
| desktop / 0 / 14 | 1.00 / 1.80 → 1.10 / 1.90 | 0.00 / 0.10 → 0.00 / 0.10 | 0.00 / 0.10 → 0.00 / 0.10 | 73.35 / 84.70 → 78.35 / 88.60 | 0.50 / 0.90 → 1.00 / 1.50 |
| desktop / 12 / 1 | 0.10 / 0.40 → 0.20 / 1.60 | 0.00 / 0.10 → 0.00 / 0.10 | 0.00 / 0.10 → 0.00 / 0.10 | 8.05 / 9.10 → 7.35 / 12.90 | 0.10 / 0.40 → 0.10 / 0.30 |
| desktop / 12 / 7 | 26.55 / 38.00 → 27.95 / 39.00 | 0.00 / 0.20 → 0.00 / 0.20 | 0.45 / 2.20 → 0.60 / 1.80 | 29.25 / 42.80 → 27.10 / 37.80 | 3.85 / 6.70 → 6.65 / 19.70 |
| desktop / 12 / 13 | 151.95 / 173.30 → 153.05 / 245.20 | 0.10 / 0.40 → 0.10 / 0.20 | 1.25 / 5.70 → 0.90 / 6.00 | 78.55 / 96.50 → 73.50 / 118.00 | 16.60 / 58.20 → 7.20 / 23.80 |
| desktop / 12 / 14 | 159.75 / 211.10 → 158.55 / 227.90 | 0.10 / 0.60 → 0.10 / 0.30 | 0.80 / 5.90 → 0.85 / 1.60 | 79.25 / 96.20 → 78.40 / 94.10 | 9.80 / 28.90 → 10.40 / 22.90 |
| desktop / 24 / 1 | 0.50 / 1.50 → 0.80 / 1.70 | 0.00 / 0.10 → 0.00 / 0.10 | 0.10 / 0.20 → 0.10 / 0.30 | 7.15 / 12.20 → 9.20 / 23.10 | 0.25 / 1.00 → 0.20 / 1.30 |
| desktop / 24 / 7 | 70.30 / 95.50 → 73.30 / 90.40 | 0.10 / 0.20 → 0.10 / 0.20 | 0.40 / 3.90 → 0.40 / 0.90 | 40.55 / 48.50 → 42.95 / 57.90 | 3.75 / 5.60 → 4.35 / 10.00 |
| desktop / 24 / 13 | 282.75 / 316.70 → 443.40 / 765.70 | 0.20 / 0.60 → 0.20 / 0.60 | 1.40 / 4.20 → 2.05 / 3.60 | 109.90 / 125.10 → 130.70 / 151.00 | 7.35 / 25.00 → 13.20 / 27.90 |
| desktop / 24 / 14 | 247.70 / 259.70 → 291.30 / 337.90 | 0.30 / 0.50 → 0.20 / 0.70 | 1.30 / 6.90 → 1.35 / 1.90 | 109.40 / 123.00 → 116.55 / 127.70 | 8.05 / 20.60 → 13.65 / 31.20 |
| mobile4x / 0 / 1 | 0.10 / 0.90 → 0.10 / 1.40 | 0.00 / 0.10 → 0.00 / 0.00 | 0.00 / 0.10 → 0.00 / 0.10 | 56.55 / 328.70 → 51.20 / 80.80 | 0.00 / 0.70 → 0.00 / 1.00 |
| mobile4x / 0 / 7 | 1.95 / 5.40 → 1.60 / 5.20 | 0.00 / 0.50 → 0.00 / 0.30 | 0.00 / 0.80 → 0.00 / 0.10 | 163.40 / 202.20 → 119.65 / 139.70 | 1.00 / 2.50 → 0.80 / 1.40 |
| mobile4x / 0 / 13 | 4.20 / 10.80 → 5.00 / 10.70 | 0.00 / 1.10 → 0.00 / 0.70 | 0.00 / 0.70 → 0.05 / 0.70 | 225.80 / 261.60 → 211.40 / 222.30 | 3.05 / 6.00 → 3.80 / 6.70 |
| mobile4x / 0 / 14 | 4.30 / 8.10 → 5.25 / 7.20 | 0.05 / 1.00 → 0.00 / 0.60 | 0.00 / 0.80 → 0.00 / 0.70 | 493.80 / 909.90 → 415.70 / 490.40 | 2.80 / 5.70 → 2.40 / 5.50 |
| mobile4x / 12 / 1 | 0.90 / 4.10 → 0.60 / 1.40 | 0.00 / 0.10 → 0.00 / 0.00 | 0.00 / 1.00 → 0.05 / 0.80 | 52.85 / 78.40 → 48.35 / 65.90 | 1.05 / 4.00 → 0.15 / 2.90 |
| mobile4x / 12 / 7 | 108.75 / 133.70 → 149.30 / 184.60 | 0.05 / 0.80 → 0.10 / 0.80 | 1.70 / 5.30 → 1.60 / 12.90 | 116.50 / 130.20 → 145.95 / 248.30 | 18.15 / 35.90 → 15.25 / 31.30 |
| mobile4x / 12 / 13 | 870.45 / 1127.40 → 744.75 / 1069.30 | 0.60 / 2.60 → 0.80 / 1.80 | 6.10 / 27.50 → 3.85 / 7.40 | 364.90 / 583.20 → 431.05 / 512.30 | 35.95 / 49.10 → 39.05 / 46.70 |
| mobile4x / 12 / 14 | 786.10 / 990.20 → 846.30 / 1747.00 | 0.70 / 2.80 → 0.20 / 4.30 | 3.55 / 9.30 → 5.65 / 13.30 | 427.55 / 591.00 → 398.65 / 577.80 | 52.90 / 72.60 → 50.30 / 69.20 |
| mobile4x / 24 / 1 | 4.50 / 11.00 → 3.10 / 6.00 | 0.00 / 0.10 → 0.00 / 0.10 | 0.05 / 0.70 → 0.10 / 1.20 | 41.00 / 58.10 → 40.25 / 55.30 | 1.35 / 4.50 → 1.30 / 2.70 |
| mobile4x / 24 / 7 | 433.00 / 546.60 → 450.10 / 803.90 | 0.45 / 1.10 → 0.80 / 2.50 | 4.95 / 17.00 → 6.15 / 14.30 | 269.35 / 426.70 → 266.55 / 325.30 | 35.55 / 41.50 → 18.60 / 31.90 |
| mobile4x / 24 / 13 | 1497.70 / 5695.50 → 1264.80 / 1794.50 | 0.95 / 1.60 → 0.90 / 1.70 | 9.85 / 21.20 → 6.50 / 33.70 | 648.05 / 856.10 → 557.05 / 608.80 | 45.20 / 63.00 → 42.30 / 49.00 |
| mobile4x / 24 / 14 | 1308.60 / 1540.60 → 1279.05 / 1548.00 | 0.90 / 2.30 → 1.10 / 4.10 | 7.35 / 18.60 → 10.00 / 56.60 | 694.30 / 778.90 → 616.65 / 1398.20 | 47.40 / 65.40 → 52.65 / 66.20 |

| Profile / pace | Day 14 save bytes before → after | After ten revisions bytes before → after | Day 14 JS heap bytes after GC before → after |
|---|---|---|---|
| desktop / 0 | 176,918 → 177,248 | 228,679 → 229,241 | 7,342,168 → 7,341,136 |
| desktop / 12 | 1,258,600 → 1,257,771 | 1,326,250 → 1,324,034 | 21,103,420 → 21,095,804 |
| desktop / 24 | 1,508,917 → 1,513,541 | 1,577,161 → 1,581,608 | 26,884,804 → 26,913,336 |
| mobile4x / 0 | 177,099 → 176,806 | 228,801 → 228,899 | 7,406,800 → 7,367,308 |
| mobile4x / 12 | 1,261,092 → 1,258,811 | 1,327,269 → 1,326,191 | 20,385,024 → 20,463,792 |
| mobile4x / 24 | 1,515,490 → 1,512,202 | 1,582,931 → 1,579,915 | 26,378,492 → 26,298,124 |

Save sizes are UTF-8 bytes; raw reports also contain UTF-16 estimates. Stochastic assessment draws can change snapshot sizes slightly. Ten revisions are a bounded stress sample, not a lifetime storage guarantee. JS heap is CDP after forced GC; pre-GC samples are not exact peaks. CPU throttling does not verify physical phones or native audio. Sub-millisecond differences include timer quantisation; shared-host timing changes alone do not establish a causal speedup or regression.

Full catalogue, dialogue, serialization and write-only distributions are in the raw reports. Separate fourteen-day card/dialogue and 20-seed output contracts protect content identity and selection independently of timing. No reduced candidate pool is accepted as a performance improvement.
