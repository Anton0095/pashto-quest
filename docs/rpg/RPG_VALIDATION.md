# Week 1 RPG validation

> Historical release evidence: original cast names, screenshots, counts and measurements below are retained. See [the subsequent character expansion](LIVING_VILLAGE.md) for Deena/Medina, the added villagers and its separate validation.


Branch `feature/rpg-week1`, source `04891a4a96e4bd8041361836ec57831958e832ba`. The current default release is Days 1–7; Day 7 is terminal and Day 8 remains inaccessible. Historical [foundation validation](FOUNDATION_VALIDATION.md), [foundation audit](FOUNDATION_AUDIT.md) and their logs retain their recorded release scope.

## Verification

The required `npm ci`, `npm run typecheck`, `python3 tools/build.py` and `python3 tools/build.py --check` commands were run. **Final `python3 tools/verify.py`: exit 0, 147 passing checks including all 23 browser suites.** Both delivery-audit write/check steps passed. The fourteen-day matrix covered 392 visits, 196 assessments and 6,676 generated sentence surfaces. [Complete verification log](week1-verification.log); [both seven-day public routes and chapter-transfer observations](week1-gameplay.log). No original educational assertion was removed. The fourteen-day/seven-pace normal/skip educational matrix remains intact.

Focused additions:

- `rpg-week1.test.mjs` validates all seven registered chapters, normal/skip event resolution, education-gated advancement, terminal/next rules, host/map references, NPC identity/Mina timing, per-day reachability, Hills round trips and the Day 8 cap. It also merges the inactive Day 8 fixture and registers a new map/person through data only.
- `rpg-week1-browser.test.mjs` plays all seven days through real Phaser/native HTML controls. Desktop normal play completes the actual opening and four district lessons each day; mobile DPR3 early play skips visits through explicit alternate events. It checks failures/retries, partial/locked assessment reload, opening dialogue reload, lesson construction reload, interrupted advancement, Day 5 multi-speaker gathering, Hills entry/return, the 25-question Week 1 exam, genuine Level 10/New Resident and terminal reload. Completed-day history now opens the Dream selector, preserving the active chapter and rewards. See the current [house/sleep/dream checks](HOUSE_SLEEP_DREAM.md).
- The public driver reads saved frozen question snapshots as its answer oracle and submits through actual controls. It never injects scores, correct responses, XP, visits or graduation through a runtime bridge. Read-only Phaser diagnostics provide object/camera state. Garbage collection diagnostics do not alter learning records.
- Historical Day 1 model/public tests now use `tests/fixtures/rpg-day1.json` via an HTML data override, keeping their original terminal-Day-1 assertions. They explicitly verify historical configuration compatibility. The new Week 1 routes independently test the actual shipped registry.
- Foundation lifecycle tests now dispatch a deterministic resize before Phaser READY, proving that startup viewport changes are safe. Existing Phaser movement/collision/camera/transition/overlay tests, save-fence/concurrent-writer tests and all educational suites remain.

## Defects and investigation

1. **Reproduced P1: wrong chapter after pass.** The educational challenge UI selects its next teaching day after a genuine first pass. The old RPG adapter then resolved the new chapter during the previous day's result. A separate selected RPG chapter now remains fixed until durable Continue; educational rewards/progression remain untouched.
2. **Reproduced P1: pre-boot resize.** A mobile viewport event called `ScaleManager.resize` before its canvas was initialized, throwing “Cannot set properties of undefined (setting width)”. The same error is reproduced by a deterministic pre-READY resize. The wrapper now waits for its canvas/READY and ignores destroyed state; the focused reproduction passes without errors.
3. **P2 integration/usability:** ineligible lesson actions previously closed dialogue and silently failed inside the existing educational guard. Choices now ask the authoritative `learning.placeAccessible` predicate. The normal public route follows actual prerequisites, including Day 2 School then Market/Lake before Home.
4. **P3 summary presentation:** completion labels now identify total XP and current level/title, and reloaded chapter headings reflect the selected chapter. Ordinary learning result labels reset through the existing overlay lifecycle.
5. **School timeout:** normal Day 1 and daily School lessons, repeated Ms Hameed dialog opening/closing, Library-before-interaction, near-School reload and desktop keyboard/mobile touch are covered. The original isolated School-disabled timeout has no reproduced causal diagnosis; no speculative School-specific fix is claimed. Existing generic map/overlay/focus/movement regression coverage remains. This remains a P2 observation to monitor on devices.

An early test-helper check assumed compacted inactive educational history had the same byte fingerprint as the stored envelope; that assumption was removed in favor of waiting for the actual saved XP and world debounce. No educational assertions or production storage guarantees were relaxed. One integrated parallel Week 1 run timed out waiting for an expected tile while the other route completed. The driver now explicitly foregrounds/focuses the game and waits for active physics, and each route runs its read-only oracle in a separate Node process. Exact position assertions and genuine public input remain; no School-specific causal fix is claimed. Preliminary gameplay runs exposed the two real integration bugs above; only the completed integrated verifier supplies fresh delivery evidence.

## Persistence and educational integrity

Educational schema 7/world schema 1, prototype isolation and the Web Locks/IndexedDB revision fence remain. A transfer persists the completed chapter, target spawn and opening in order; it never calls an XP/reward method. Reload may restore the previous committed result or target spawn. Confirmed story events do not replay; unacknowledged work can still be lost across abrupt termination. Paired lesson/tutorial drafts and exact active assessment snapshots retain their existing validation; corrupt/incompatible education remains untouched until explicit reset. World/education are separate transactions, with deterministic safe fallback rather than a false atomicity claim.

Normal finale and skip route are distinct stored facts. A pass's once-only location catch-up cannot fabricate a played normal finale. All four district assignments feed the existing assessment activation. Hills is Nature, not another quota. Day 5/7 peace phrases, grammar/speaker/listener bindings, SRS, unseen-word restrictions, feedback, construction, audio and all fourteen educational days retain their original authorities. No Pashto wording, translation bank or approval status was changed.

## Performance

Before/after runs use frozen exact HTML (`RPG_RELEASE`) with 20 local reload samples after initial navigation (browser launch is excluded) at desktop 1280px and mobile 375px/4× CPU throttle. The benchmark records load, scene readiness, committed tile/map transitions (including the 115ms tween), forced-GC heap endpoints, localStorage and logical revision metadata size, and scene update objects. Public history transfers additionally observe repeated chapter changes; their logged timings include the fixed 300ms durability wait and automation overhead, so they are not pure transfer latency. Exact artifacts/results are listed below when complete. Host contention means timings do not isolate code causation; these are neither physical-device results nor peak heap nor long-duration leak certification.

## Browser and remaining limits

Physical iPhone Safari and device voices remain **unverified**. Chromium mobile/DPR/touch/CPU emulation does not establish Safari compatibility. The environment has no installed WebKit binary; no WebKit success is claimed. Remaining manual checks: portrait/landscape and enlarged/RTL text; pointer cancel/held movement during interruptions; virtual name keyboard open/dismiss; overlay focus/VoiceOver; BFCache/background/foreground and storage eviction/denial/conflicts; correct-user-gesture audio, missing voices and actual pronunciation review.

All code/curriculum/Phaser remain locally bundled for offline static hosting/GitHub Pages. No deployment setting changed. Stationary NPC placements, procedural art and separate store commits remain explicit limits. Days 8–14 need reviewed RPG narrative/route registrations and public gameplay tests; their educational capabilities were retained, not activated in the RPG.

## Exact-release benchmark

Foundation: `a89171407411b6418fac5a7500c6f5b8965bc4fa646073458b39a3b6e42b5ab2`, 3001116 bytes. Week 1: `da8457d2e0a5abfee5a201675350c2d1ae0dd9831d8dbe1eb44b336cd45496ea`, 3035726 bytes. [Before JSON](week1-performance-before.json), [after JSON](week1-performance-after.json). Twenty samples per profile, Chromium 154.0.8037.57. Frozen artifacts ensure both profiles use their recorded release.

| Profile | Metric | Foundation median / p95 | Week 1 median / p95 |
|---|---|---|---|
| desktop | initialLoad | 208.2 / 355.9 ms | 205.8 / 249.8 ms |
| desktop | sceneReady | 332.5 / 479.3 ms | 303.5 / 350.2 ms |
| desktop | movement | 129.2 / 131.9 ms | 130.1 / 132.5 ms |
| desktop | mapTransition | 131 / 140.5 ms | 131.7 / 139.9 ms |
| mobile4x | initialLoad | 930.5 / 1255.1 ms | 884.7 / 1523.3 ms |
| mobile4x | sceneReady | 1308.7 / 1743.5 ms | 1249.6 / 2025.2 ms |
| mobile4x | movement | 133.7 / 222.8 ms | 134.1 / 147.4 ms |
| mobile4x | mapTransition | 159.2 / 301.4 ms | 150.5 / 178 ms |

desktop: scene objects 9 → 9; heap 7,012,856 → 8,315,652 bytes; storage `{"pashto-quest-rpg-world-v1": 253, "pashto-quest-rpg-education-v1": 391, "revisionHeads": 2, "revisionValuesJsonBytes": 153}`.

mobile4x: scene objects 9 → 9; heap 7,017,776 → 8,301,384 bytes; storage `{"pashto-quest-rpg-world-v1": 253, "pashto-quest-rpg-education-v1": 391, "revisionHeads": 2, "revisionValuesJsonBytes": 153}`.

Release growth: 34610 bytes, with no new dependency. The final runs were sequential after verification; earlier contended timings were excluded. Differences remain subject to host/browser variance and do not certify physical-device performance. The public Week 1 suite also reports same-chapter object counts and forced-GC heap/storage after repeated completed-chapter transfers; compare the same chapter rather than assuming equal actor counts across different days.
