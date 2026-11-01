#!/usr/bin/env python3
"""Summarise paired audit benchmark JSON without changing historical reports."""
import json
import math
from pathlib import Path
import statistics
import sys

before, after = [json.loads(Path(path).read_text()) for path in sys.argv[1:3]]
out = Path(sys.argv[3])
def distribution(values):
    ordered = sorted(values)
    return f'{statistics.median(ordered):.2f} / {ordered[math.ceil(.95*len(ordered))-1]:.2f}'

def profile_key(profile):
    return profile['mode'], profile['pace']

assert before['samples'] == after['samples'] == 20
assert before['host'] == after['host']
pairs = dict((profile_key(p), p) for p in before['profiles'])
assert len(pairs) == len(after['profiles']) == 6
lines = ['# Audit performance measurements', '',
         'Corrected/refactored baseline: commit `697a4f5`, frozen release SHA-256 `' + before['releaseSha256'] + '`.',
         'Optimised release SHA-256: `' + after['releaseSha256'] + '`.', '',
         'Each cell is median / p95 milliseconds from 20 sequential samples. Same host, Chromium, viewport, pace and route; mobile uses 375px and CDP 4× CPU slowdown. Profiles run sequentially, with no verification suite running concurrently. Cold eligibility means an eligibility-cache miss, not an OS/browser cold boot. Both versions use the corrected harness, which completes review study before answering and bounds the due pool to ten items. The complete save sample is an unchanged-state save; the optimised version can avoid its write. Changed responses remain synchronous and are covered by persistence/resume tests. Browser-only instrumentation adds index timing overhead. The shared container has a 2-CPU cgroup quota and 8 GiB memory limit; logical CPU/model and browser version are recorded in the raw reports.', '',
         'Raw [before](audit/performance-before.json) and [after](audit/performance-after.json) include every sample, section size, opening time, initial boot, cache invalidation and heap observations.', '',
         '| Profile / pace / day | Cold eligibility before → after | Warm before → after | Selection before → after | New assessment before → after | Complete save before → after |',
         '|---|---|---|---|---|---|']
growth = []
for a in after['profiles']:
    b = pairs[profile_key(a)]
    assert a['browser'] == b['browser']
    assert not a['errors'] and not b['errors']
    assert [d['day'] for d in a['days']] == [1,7,13,14]
    for bd, ad in zip(b['days'], a['days']):
        assert bd['poolSize'] == ad['poolSize']
        assert ad['cacheIdentityRetained'] and ad['grammarInvalidation']
        assert ad['formInvalidation'] is True or (ad['day'] == 1 and a['pace'] == 0 and ad['formInvalidation'] is None)
        cells = [f"{a['mode']} / {a['pace']} / {ad['day']}"]
        for key in ['coldEligibility','warmEligibility','studySelection','challengeCreation','completeSave']:
            cells.append(distribution(bd['metrics'][key]['timesMs']) + ' → ' + distribution(ad['metrics'][key]['timesMs']))
        lines.append('| ' + ' | '.join(cells) + ' |')
    br, ar = b['repeatedRevision'], a['repeatedRevision']
    assert len(br) == len(ar) == 10 and all(not r['saveProblem'] for r in br+ar)
    growth.append(f"| {a['mode']} / {a['pace']} | {b['days'][-1]['storage']['utf8Bytes']:,} → {a['days'][-1]['storage']['utf8Bytes']:,} | {br[-1]['utf8Bytes']:,} → {ar[-1]['utf8Bytes']:,} | {b['days'][-1]['heapAfterGC']['usedSize']:,} → {a['days'][-1]['heapAfterGC']['usedSize']:,} |")
lines += ['', '| Profile / pace | Day 14 save bytes before → after | After ten revisions bytes before → after | Day 14 JS heap bytes after GC before → after |', '|---|---|---|---|'] + growth
lines += ['', 'Save sizes are UTF-8 bytes; raw reports also contain UTF-16 storage estimates. Completed-event metadata is bounded by protected attempts. Delivery summaries remain bounded by distinct content/surface/mode identities, so new sentence identities intentionally still add evidence. Ten revisions are a bounded stress sample, not a lifetime storage guarantee. JS heap is CDP after forced GC; sampled pre-GC values do not establish an exact peak or total allocations. CPU throttling and desktop emulation do not verify physical phones or native audio. Small sub-millisecond differences include timer quantisation and shared-host noise; these are observations, not universal speed guarantees.', '', 'Deferred metadata still carries cache/context overhead: any retained-heap increase in the table is an explicit tradeoff for lower cold/warm latency, not an allocation-peak improvement claim. The rejected first accessor trial used 23.5 MB at desktop pace-12 Day 14 versus the baseline’s 14.7 MB; it is excluded from the final paired samples.', '', 'Full catalogue, dialogue, serialization and write-only distributions are in the raw reports. The fourteen-day card/dialogue and 20-seed contract compares exact payload hashes separately from timing, preventing reduced pools or changed selection from masquerading as speedups.', '']
out.write_text('\n'.join(lines))
print('WROTE', out)
