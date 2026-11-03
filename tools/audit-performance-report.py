#!/usr/bin/env python3
"""Summarise paired six-profile benchmark JSON without historical claims or extrapolation."""
import json
import math
from pathlib import Path
from os.path import relpath
import statistics
import sys

before_path, after_path, out = map(Path, sys.argv[1:4])
before, after = [json.loads(path.read_text()) for path in (before_path, after_path)]

def distribution(values):
    ordered = sorted(values)
    assert len(ordered) == 20
    return f'{statistics.median(ordered):.2f} / {ordered[math.ceil(.95*len(ordered))-1]:.2f}'

def profile_key(profile):
    return profile['mode'], profile['pace']

assert before['samples'] == after['samples'] == 20
assert before['host'] == after['host']
assert before['method'] == after['method']
pairs = {profile_key(p): p for p in before['profiles']}
assert len(pairs) == len(after['profiles']) == 6
assert set(pairs) == {profile_key(p) for p in after['profiles']}
lines = ['# Paired curriculum performance measurements', '',
         'Baseline release SHA-256: `' + before['releaseSha256'] + '`.',
         'Final release SHA-256: `' + after['releaseSha256'] + '`.', '',
         'Each cell is median / p95 milliseconds from 20 sequential samples. Same host, Chromium, viewport, pace and route; mobile uses 375px and CDP 4× CPU slowdown. Profiles run sequentially, with no verification suite running concurrently. Cold eligibility means an eligibility-cache miss, not an OS/browser cold boot. Both releases use the same corrected test-only navigation harness. Save enqueue measures the synchronous call, not completion of asynchronous Web Locks/IndexedDB I/O. Browser-only index instrumentation adds overhead.', '',
         f'Raw [before]({relpath(before_path, out.parent)}) and [after]({relpath(after_path, out.parent)}) include all operation samples, cache invalidation, storage and heap observations. Initial boot/first-generation/opening values in those files are single observations, not latency distributions.', '',
         '| Profile / pace / day | Cold eligibility before → after | Warm before → after | Selection before → after | New assessment before → after | Save enqueue before → after |',
         '|---|---|---|---|---|---|']
growth = []
for a in after['profiles']:
    b = pairs[profile_key(a)]
    assert a['browser'] == b['browser']
    assert not a['errors'] and not b['errors']
    assert [d['day'] for d in a['days']] == [d['day'] for d in b['days']] == [1,7,13,14]
    for bd, ad in zip(b['days'], a['days']):
        assert bd['poolSize'] == ad['poolSize']
        for p, d in [(a, ad), (b, bd)]:
            assert d['cacheIdentityRetained'] and d['grammarInvalidation']
            assert d['formInvalidation'] is True or (d['day'] == 1 and p['pace'] == 0 and d['formInvalidation'] is None)
        cells = [f"{a['mode']} / {a['pace']} / {ad['day']}"]
        for key in ['coldEligibility','warmEligibility','studySelection','challengeCreation','completeSave']:
            cells.append(distribution(bd['metrics'][key]['timesMs']) + ' → ' + distribution(ad['metrics'][key]['timesMs']))
        lines.append('| ' + ' | '.join(cells) + ' |')
    br, ar = b['repeatedRevision'], a['repeatedRevision']
    assert len(br) == len(ar) == 10 and all(not r['saveProblem'] for r in br+ar)
    growth.append(f"| {a['mode']} / {a['pace']} | {b['days'][-1]['storage']['utf8Bytes']:,} → {a['days'][-1]['storage']['utf8Bytes']:,} | {br[-1]['utf8Bytes']:,} → {ar[-1]['utf8Bytes']:,} | {b['days'][-1]['heapAfterGC']['usedSize']:,} → {a['days'][-1]['heapAfterGC']['usedSize']:,} |")
lines += ['', '| Profile / pace | Day 14 save bytes before → after | After ten revisions bytes before → after | Day 14 JS heap bytes after GC before → after |', '|---|---|---|---|'] + growth
lines += ['', 'Save sizes are UTF-8 bytes; raw reports also contain UTF-16 estimates. Stochastic assessment draws can change snapshot sizes slightly. Ten revisions are a bounded stress sample, not a lifetime storage guarantee. JS heap is CDP after forced GC; pre-GC samples are not exact peaks. CPU throttling does not verify physical phones or native audio. Sub-millisecond differences include timer quantisation; shared-host timing changes alone do not establish a causal speedup or regression.', '', 'Full catalogue, dialogue, serialization and write-only distributions are in the raw reports. Separate fourteen-day card/dialogue and 20-seed output contracts protect content identity and selection independently of timing. No reduced candidate pool is accepted as a performance improvement.', '']
out.write_text('\n'.join(lines))
print('WROTE', out)
