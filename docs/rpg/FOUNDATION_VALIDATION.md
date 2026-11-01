# Foundation validation

Branch `feature/rpg-foundation`, from source `b726f01aae250dcec116ceb7ada1e64a5f8f3895`. The prototype still ends after a real Day 1 pass; Day 2 is inactive. Main and production Pages settings are unchanged. See [classified findings](FOUNDATION_AUDIT.md), [architecture](FOUNDATION_ARCHITECTURE.md) and the [Day 2 walkthrough](FOUNDATION_EXPANSION_GUIDE.md).

## Checks and evidence

Required setup/build commands: `npm ci`, `npm run typecheck`, `python3 tools/build.py`, `python3 tools/build.py --check`. The complete entry point is `python3 tools/verify.py`; it preserves all original educational/model/browser suites and adds the foundation suites. **Final integrated result: exit 0, 141 passing checks including all 22 browser suites.** The fourteen-day matrix covered 392 visits, 196 assessments and 6,676 generated sentence surfaces. Both exact-release delivery-audit steps passed. See [complete verification log](verification.log). The final inactive-fixture refinements were additionally checked with `node tests/rpg-foundation.test.mjs`; see [focused model log](foundation-model.log).

Focused coverage:

- `rpg-foundation.test.mjs`: chapter registration and invalid references; inactive Day 2 registration/event resolution; prerequisites; opening/ending dispatch; terminal/nonterminal next-chapter gating; stable identities, default locations and daily schedule overrides; conditional actions, persistent flags, once-only story effects and lesson return cursor; validated dialogue state and no-op world writes.
- `rpg-foundation-browser.test.mjs`: real Phaser blur/focus cancellation, sequential dialogue reload with conditional messages/speaker identity, repeated Library access with unchanged scene object count, viewport orientation, disposed global listeners/dialogs and usable tutorial after game-Canvas initialization failure.
- `rpg-browser.test.mjs`: independent public Day 1 route, four-step tutorial (partial tiles and recorded correct response restored), name/gender, all four lessons, three distinct Home descriptions, early challenge, failure/retry, frozen partial/locked challenge and completed lesson reload, Library, appearance, genuine completion/reload and inaccessible Day 2. Gameplay never fabricates answers, grades or rewards through a bridge; readonly saved JSON is the question oracle.
- `phaser-browser.test.mjs`: 375/1280px real tilemaps, four directions, terrain/NPC collision, animation/camera bounds, entrance cancellation by overlay, repeated transitions, same-map reset and optional collision layer; DPR3 pointer/touch emulation.
- `save-fence-browser.test.mjs` and `rpg-concurrent-browser.test.mjs`: deterministic stale renderer reads, interrupted/ambiguous writes, conflict preservation, explicit reset, denial/recovery and repeated two-renderer winner/loser contests.
- The unchanged educational matrix covers fourteen days, seven paces and normal/skip routes, grammar/vocabulary provenance, SRS, generation, assessment snapshots, feedback/audio controls, answer restrictions and once-only rewards. Pashto data is unchanged.

The RPG public playthrough uses public controls; position-only/corrupt/future-state fixtures are restricted to dedicated post-playthrough recovery or isolated physics cases. No fixture supplies successful learning results. New lifecycle hooks dispose the test instance or inspect Phaser; they do not ship in the release.

## Validation history

One exploratory run timed out on a disabled School interaction after the first three lessons. An isolated position-only check and a fresh full public playthrough at both widths passed; the cause was not established. Preliminary full runs were stopped when final code review found additional ending/draft/schedule corrections. Only the final completed integrated run is used as delivery evidence. No assertions were removed to accept the earlier timeout.

## Save/resume contract

Educational schema 7, world schema 1 and prototype namespaces remain unchanged. `pashto-town-days-v1` remains untouched in the default RPG. Web Locks and hash-only IndexedDB revision coordination remain in force. Optional world chapter/dialogue metadata is validated. Tutorial tile order, placement and lock now live in the existing lesson session snapshot, alongside supported lesson drafts. Active assessment questions, answers, proofs and first-answer locks remain solely in educational state.

Education commits before its paired world snapshot. A mismatched fingerprint or invalid lesson draft returns to exploration and retains valid educational knowledge/results. A valid active assessment has restore priority. Invalid positions recover to a safe tile; corrupt/incompatible educational records stay untouched until explicit reset. This is deterministic recovery across two stores, **not** an atomic two-store transaction. Visibility/pagehide persistence is best effort; abrupt process termination can still lose the latest unacknowledged tile/draft. Conflicts never silently merge or overwrite educational progress.

## Offline/mobile/accessibility

Phaser 4.2.1 and all code/curriculum remain embedded in the committed offline HTML. The existing Python assembler and pinned TypeScript/esbuild pipeline remain the build; no additional dependency or hosting service was introduced. GitHub Pages can serve the static release. Players need no npm/runtime dependency download. Phaser remains the only live world renderer/collision/movement engine.

Native keyboard/touch controls, focus indicators, RTL/LTR construction, audio-optional learning, viewport CSS and pointer cancellation are retained. A compact Learning access disclosure exposes the same educational adapters if rendering fails. Phaser audio stays disabled; existing gesture-triggered educational audio remains authoritative.

Physical iPhone Safari and device voices remain **UNVERIFIED**. Chromium viewport/CPU/DPR/touch emulation is not Safari evidence. The installed Playwright package has no WebKit browser binary (nor Firefox); WebKit automation was therefore not run. No WebKit success is inferred. Remaining manual checks:

1. Current iPhone Safari portrait/landscape: held D-pad, pointer cancellation, diagonal prevention, dialogue proximity, exits/entrances and camera after rotation.
2. Name keyboard open/dismiss, dynamic viewport, long English/Pashto text, visible focus, VoiceOver reading/focus order and enlarged text.
3. Library/Menu/lesson transitions, background/foreground while moving, phone interruption, BFCache/back navigation, reload during partial tutorial and locked challenge.
4. Private mode, denied/full/evicted storage, Web Locks/IndexedDB/Web Crypto failure, concurrent tabs, failed save Retry/Export and explicit incompatible-save reset.
5. User-gesture audio playback, missing Pashto voice, device mute/interruption and pronunciation/intelligibility with a qualified reviewer. No native-reviewed MP3 pack is claimed.

## Performance

Same-host before/after runs use `node tools/rpg-performance.mjs`: 20 samples for desktop 1280px and mobile 375px with 4× CPU throttle; local loopback Chromium. Measurements include HTML parse/startup, Phaser readiness, completed tile/transition (including the intentional 115ms tween), forced-GC heap endpoints, localStorage bytes, logical revision metadata size and scene object counts. They are neither first-pixel latency nor peak heap nor a long-duration leak certification. Host contention differs across runs; timing changes do not isolate code causation. The comparison below is generated from actual JSON artifacts.

## Expansion readiness

The inactive Day 2 fixture registers the real `2-school`/other district lesson IDs, Ms Hameed opening and scheduled characters, challenge and ending through the same chapter/event services. No movement, rendering, collision, sentence or assessment changes are needed to register it. A full Day 2 release still requires reviewed narrative integration (including required workshop semantics), Day 3 registration before advancement, all route/resume tests, and physical-device review. Stationary daily placements and Library-only interior remain explicit limits.

## Exact-build comparison

Baseline: `b6c3e42f82caa8663c344a3ec64de2aa5333b733abfd25f2e6d04cc282d5cd13` (2991327 bytes). Foundation: `a89171407411b6418fac5a7500c6f5b8965bc4fa646073458b39a3b6e42b5ab2` (3001116 bytes). Chromium 154.0.8037.57. [Before JSON](foundation-performance-before.json), [after JSON](foundation-performance.json).

| Profile | Metric | Before median / p95 | After median / p95 |
|---|---|---|---|
| desktop | initialLoad | 233.6 / 471.3 ms | 298.8 / 377.6 ms |
| desktop | sceneReady | 370.8 / 583.6 ms | 475.8 / 576.8 ms |
| desktop | movement | 129.2 / 132.3 ms | 128.2 / 146.5 ms |
| desktop | mapTransition | 132.7 / 142.7 ms | 133.3 / 144.5 ms |
| mobile4x | initialLoad | 904.1 / 1398.2 ms | 1065 / 1641.5 ms |
| mobile4x | sceneReady | 1262.5 / 1944.9 ms | 1470.6 / 2216.1 ms |
| mobile4x | movement | 127 / 142.8 ms | 132.3 / 145.1 ms |
| mobile4x | mapTransition | 159.5 / 210.9 ms | 149.1 / 170.6 ms |

desktop scene objects: 9 → 9; forced-GC heap 6,904,980 → 8,202,020 bytes. Storage endpoints: `{"pashto-quest-rpg-world-v1": 253, "pashto-quest-rpg-education-v1": 391, "revisionHeads": 2, "revisionValuesJsonBytes": 153}`.

mobile4x scene objects: 9 → 9; forced-GC heap 6,920,140 → 8,191,224 bytes. Storage endpoints: `{"pashto-quest-rpg-world-v1": 253, "pashto-quest-rpg-education-v1": 391, "revisionHeads": 2, "revisionValuesJsonBytes": 153}`.

Release size increased by 9789 bytes with no new dependency. Host contention differs between runs; these timings do not isolate code causation or certify phone performance. Scene counts remain stable. Repeated Library access is also checked by the lifecycle suite; no-op world-write counts are checked by the model suite.
