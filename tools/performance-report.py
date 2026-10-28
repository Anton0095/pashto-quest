#!/usr/bin/env python3
"""Render committed raw Chromium benchmark measurements; never extrapolate samples."""
import argparse
import csv
import json
import math
from pathlib import Path
from statistics import median

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--directory', default='docs/maintenance/p1')
args = parser.parse_args()
root = Path(args.directory)
before = json.loads((root / 'performance-before.json').read_text())
after = json.loads((root / 'performance-after.json').read_text())
cold = json.loads((root / 'cold-before.json').read_text())
key = lambda p: (p['mode'], p['pace'])
old = {key(p): p for p in before['profiles']}
old_cold = {key(p): p for p in cold['profiles']}
assert len(old) == len(after['profiles']) == len(old_cold) == 6
for phase in (before, after):
    for p in phase['profiles']:
        assert [d['day'] for d in p['days']] == [1, 7, 13, 14]
        assert len(p['repeatedRevision']) == 10
        assert not p['errors']
        assert all(not r['saveProblem'] for r in p['repeatedRevision'])
        assert all(d['cacheIdentityRetained'] and d['grammarInvalidation'] and d['formInvalidation'] is not False for d in p['days'])
        for d in p['days']:
            assert all(len(m['timesMs']) == 20 for m in d['metrics'].values())

def stats(values):
    values = sorted(values)
    return median(values), values[math.ceil(len(values) * .95)-1], values[-1]

def ms(d, op):
    a, b, _ = stats(d['metrics'][op]['timesMs'])
    return f'{a:.2f} / {b:.2f}'

def mib(n):
    return f'{n/1048576:.2f}'

with (root / 'timings.csv').open('w') as f:
    writer = csv.writer(f)
    writer.writerow(['phase','profile','pace','day','operation','samples','median_ms','p95_ms','worst_ms','median_index_calls','median_index_rebuilds','median_index_ms'])
    for label, phase in [('before', before), ('after', after)]:
        for p in phase['profiles']:
            for d in p['days']:
                for op, m in d['metrics'].items():
                    writer.writerow([label,p['mode'],p['pace'],d['day'],op,len(m['timesMs']),*[round(v,3) for v in stats(m['timesMs'])],median(m['indexCalls']),median(m['indexRebuilds']),round(median(m['indexMs']),3)])

lines = ['# Chromium performance baseline', '',
'Raw measurements: [before](performance-before.json), [after](performance-after.json), [fresh-process before](cold-before.json). [Every median, p95 and worst case](timings.csv).', '',
f"Host: {after['host']['cpu']}; Linux {after['host']['arch']}; Node {after['host']['node']}; Chromium {after['profiles'][0]['browser']}. Reported logical CPUs: {after['host']['cpus']}. Observed cgroup quota: {after['host'].get('cpuQuota', 'unrecorded')} CPUs; memory limit: {mib(after['host']['memoryLimitBytes']) + ' MiB' if after['host'].get('memoryLimitBytes') else 'unrecorded'}. Desktop: 1280 × 1000, normal CPU. Mobile: 375 × 1000, CDP 4× CPU slowdown. These are Linux Chromium measurements, not physical phone results.", '',
'Each profile completes the real tutorial and all fourteen normal-route days at pace 0, 12 or 24. Measurements occur after Days 1, 7, 13 and 14. Operations run sequentially with 20 samples; p95 is the nineteenth sorted sample and worst is the twentieth. Sub-millisecond timings approach Chromium’s clock resolution. The first-generation and challenge-open timings are single observations and have no claimed p95. Test-only wrappers count lexical-index calls/rebuilds and their elapsed time; this adds measurement overhead.', '',
'Cold eligibility means deleting the eligibility catalogue cache, while the process and immutable index may already be warm. Fresh-process first-generation timings below separately include the first lexical-index build. Catalogue explicitly enumerates the eligible base cards; warm eligibility adds applicable coordinated clauses. Study selection requests three cards. Challenge creation deletes only the frozen question list, then builds a complete 15/25-question assessment including save; the UI-open observation also renders the initial question. Dialogue time covers typed question/reply pairing. Storage write replaces the existing game key; complete-save includes serialization, active snapshot handling, writing and exact read-back confirmation.', '',
'Ten bounded review sessions each replay Day-14 Home, answer up to ten due review items, open a Library entry/example and return to town. A synthetic 90-day clock advance makes each session due without rewriting SRS. The harness yields between interaction blocks; it does not execute hundreds of learner actions in a single synchronous task.', '',
f"Before release SHA-256: `{before['releaseSha256']}` (commit `7c1fe36`). After: `{after['releaseSha256']}` (runtime commit `d41d34f`).", '',
'## Generation after the change', '', 'All values are **median / p95 milliseconds**. Full worst cases and index costs are in the CSV.', '',
'| Profile | Pace | Day | Catalogue | Cold eligibility | Warm eligibility | Select 3 | Challenge | Dialogues |', '|---|---:|---:|---:|---:|---:|---:|---:|---:|']
for p in after['profiles']:
    for d in p['days']:
        lines.append(f"| {p['mode']} | {p['pace']} | {d['day']} | " + ' | '.join(ms(d,op) for op in ['catalogue','coldEligibility','warmEligibility','studySelection','challengeCreation','dialogues'])+' |')
lines += ['', '## Fresh-process first generation', '', 'Single first-generation observations, milliseconds. These are separate from the 20-sample cache-miss measurements.', '', '| Profile | Pace | Before | After |', '|---|---:|---:|---:|']
for p in after['profiles']:
    lines.append(f"| {p['mode']} | {p['pace']} | {old_cold[key(p)]['days'][0]['trueColdFirstGenerationMs']:.2f} | {p['days'][0]['trueColdFirstGenerationMs']:.2f} |")
lines += ['', '## One targeted optimisation', '',
'The compiler shares a WeakMap index only for immutable lexical roots and evidence. Mutable and shallow-frozen editorial inputs rebuild; changing player forms or grammar still invalidates eligibility. The cache has no player state or random state. No catalogue, selection, sentence, dialogue or scoring algorithm was changed. The regression contract checks byte-identical complete card and dialogue payloads and twenty seeded selections per day, all fourteen days.', '',
'| Profile | Pace | Day | Warm eligibility before → after (median ms) | Challenge before → after (median ms) | Challenge index rebuilds before → after |', '|---|---:|---:|---:|---:|---:|']
for p in after['profiles']:
    if not p['pace']: continue
    for d in p['days']:
        if d['day'] == 1: continue
        b = next(b for b in old[key(p)]['days'] if b['day'] == d['day'])
        med = lambda x,op: median(x['metrics'][op]['timesMs'])
        lines.append(f"| {p['mode']} | {p['pace']} | {d['day']} | {med(b,'warmEligibility'):.2f} → {med(d,'warmEligibility'):.2f} | {med(b,'challengeCreation'):.2f} → {med(d,'challengeCreation'):.2f} | {median(b['metrics']['challengeCreation']['indexRebuilds']):g} → {median(d['metrics']['challengeCreation']['indexRebuilds']):g} |")
lines += ['', 'Repeated warm availability retained the same base cache in every profile/day. Every tested form change and grammar change invalidated eligibility (no-form profiles are N/A for form invalidation). All measured after-phase warm operations perform zero index rebuilds; the immutable index is first built during first generation. The compiler contract independently observed one index build across all fourteen days and draws. Cold catalogue timing is not claimed to improve: several observed late mobile medians were higher after the change (for example, default Day 13 1,154.90 → 1,367.25 ms). The measured benefit is repeated warm eligibility and challenge creation; catalogue enumeration remains a separate bottleneck. Timing distributions and raw observations are retained rather than attributing every cross-run difference to the cache.', '',
'## JavaScript memory', '',
'All values below are **MiB**. Initial and day/review values use `Runtime.getHeapUsage.usedSize` after forced garbage collection. The sampled high-water column is the largest pre-GC heap at measurement boundaries. **Exact instantaneous peak allocation during a compiler call was not captured**; this sampled value is a lower bound, not a claimed peak. Browser RSS, GPU memory and physical mobile memory were not measured.', '',
'| Profile | Pace | Initial | Day 1 | Day 7 | Day 13 | Day 14 | Sampled high water | After 10 review sessions |', '|---|---:|---:|---:|---:|---:|---:|---:|---:|']
for p in after['profiles']:
    ds = p['days']
    lines.append(f"| {p['mode']} | {p['pace']} | {mib(p['initialHeap']['usedSize'])} | " + ' | '.join(mib(d['heapAfterGC']['usedSize']) for d in ds) + f" | {mib(max(d['heapBeforeGC']['usedSize'] for d in ds))} | {mib(p['repeatedRevision'][-1]['heap']['usedSize'])} |")
lines += ['',
'The eligible catalogue intentionally retains one base array for the current eligibility signature. The new weak lexical index references existing frozen entries/forms; it does not retain player profiles. The chosen-card registry, frozen questions, provenance and SRS owners intentionally remain available for exact resume and revision. Ten bounded sessions are a short retention sample, not proof against an indefinite leak. Persistent audit/event growth below is confirmed; no unbounded eligibility-cache history was found in source.', '',
'## Persisted progress', '',
'UTF-8 bytes measure exported JSON. UTF-16 bytes count two bytes per string code unit as a conservative localStorage budgeting estimate; browser quota accounting varies. Sizes after completed days exclude the active attempt, whose actual opening snapshot is also in the raw data. Frozen question/history and generated-card snapshots remain in day plans. No native quota failure occurred in these benchmark profiles.', '',
'| Profile | Pace | Day 1 UTF-8 bytes | Day 7 UTF-8 bytes | Day 14 UTF-8 bytes | Day 14 UTF-16 bytes | After 10 sessions UTF-8 bytes | Growth UTF-8 bytes |', '|---|---:|---:|---:|---:|---:|---:|---:|']
for p in after['profiles']:
    ds=p['days'];r=p['repeatedRevision'][-1]
    lines.append(f"| {p['mode']} | {p['pace']} | {ds[0]['storage']['utf8Bytes']:,} | {ds[1]['storage']['utf8Bytes']:,} | {ds[-1]['storage']['utf8Bytes']:,} | {ds[-1]['storage']['utf16Bytes']:,} | {r['utf8Bytes']:,} | {r['utf8Bytes']-ds[-1]['storage']['utf8Bytes']:,} |")
lines += ['', 'Day-14 storage components (UTF-8 bytes). Snapshot bytes are a **subset of plans**, not an additional amount to sum.', '', '| Profile | Pace | Plans | Generated/question snapshots | Delivery records | Practice-event locks | SRS units + acquired forms | Active exam at opening |', '|---|---:|---:|---:|---:|---:|---:|---:|']
for p in after['profiles']:
    d=p['days'][-1];s=d['storage'];c=s['librarySections']
    lines.append(f"| {p['mode']} | {p['pace']} | {c['plans']:,} | {s['generatedAndQuestionSnapshotBytes']:,} | {c['deliveries']:,} | {c['events']:,} | {c['units']+c['acquired']:,} | {d['activeChallengeSnapshotBytes']:,} |")
lines += ['', '## Serialization and synchronous saving', '', 'Day-14 **median / p95 ms**; all days and worst cases are in the CSV.', '', '| Profile | Pace | JSON serialization | Write only | Complete verified save |', '|---|---:|---:|---:|---:|']
for p in after['profiles']:
    d=p['days'][-1]
    lines.append(f"| {p['mode']} | {p['pace']} | " + ' | '.join(ms(d,op) for op in ['serialisation','storageWriteOnly','completeSave']) + ' |')
lines += ['',
'The native Chromium test filled 10,432,866 UTF-16 filler bytes alongside the existing game save before retry failed at both widths; quota accounting should not be inferred for other browsers from this single origin. Quota risk: the default completed profile already occupies several MiB under UTF-16 budgeting, and events/delivery evidence continues to grow during revision. A 5-MiB conservative budget has limited headroom; real limits depend on browser/origin/policy. The browser regression separately fills native Chromium localStorage to quota, observes the warning, removes filler and verifies retry/reload. Synthetic Safari/iPhone quota estimates are not physical Safari evidence.', '',
'## Ranked remaining work', '',
'1. **Confirmed CPU cost:** late-game cold catalogue enumeration remains the largest generation operation. Index sharing improves warm work but does not reduce licensed combinations or the enumeration algorithm. Further optimisation is justified on throttled mobile; prototype cached constraint buckets or unchanged-eligibility reuse with the existing byte-level contracts before changing delivery.',
'2. **Confirmed synchronous I/O cost:** complete verified saves serialize/write/read substantial progress repeatedly. Evaluate measured coalescing only if first-answer locks, typed drafts, tile positions and close/reload durability remain exact. No save debouncing or loss of integrity was introduced here.',
'3. **Confirmed persistent growth:** audit deliveries, practice-event reward locks and frozen histories accumulate. Investigate compact immutable references or bounded audit summaries separately. Do not discard score/SRS/provenance evidence merely to reduce size.',
'4. **Unconfirmed long-run heap concern:** these bounded review samples do not establish an indefinite leak. Retained catalogues and chosen-card registries have known runtime consumers; no speculative removal was made.', '',
'An early synchronous stress attempt was killed (exit 137); it did not produce a complete benchmark and was discarded. The final yielding, ten-item review harness completed all six profiles before and after. Those interrupted attempts are not counted as passing runs or used to invent peak-memory figures.', '']
(root / 'PERFORMANCE.md').write_text('\n'.join(lines))
print('Rendered performance report and timing CSV from complete raw measurements')
