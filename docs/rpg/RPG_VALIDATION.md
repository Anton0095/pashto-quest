# RPG validation and delivery

Source branch: `feature/rpg-prototype`. Base: `a28d02810fe39afa7a80618d27736b866c3c5bf9`, the latest main commit verified through GitHub and a successful `git fetch origin`. Review PR #23 is merged in that base. No main ref, production save or Pages setting is changed.

## Implemented and reused

The default offline release contains an original pixel-art Laghman village, camera-following four-direction movement, terrain/NPC collision, a Library interior, touch controls and explicit NPC interaction. English story dialogue connects the existing four-step tutorial, all four complete Day 1 lessons, the authoritative Library and the existing 15-question/pass-12 challenge. Successful completion displays the real score, total XP/level and unlocked vocabulary, then ends the prototype. Players can return to the village or review the Library; reset is explicit and isolated.

New systems are map rendering/simulation, adjacency interactions, declarative NPC/event registry, dialogue sequencing, chapter policy, world persistence and RPG presentation/adapters. Existing lexical acquisition, vocabulary pace, productive sentence generation, question evaluation, shared construction/audio, progression/rewards, SRS, educational validation and Library remain authoritative. Existing educational presentation gained resumable lesson rendering; storage gained a configurable key. No curriculum or language inventory was replaced.

## Verification

The commands and terminal full-suite result are recorded below. Screenshots are real browser captures from the default RPG public-control playthrough.

- `python3 tools/build.py`: offline release regenerated from authoritative sources.
- `python3 tools/build.py --check`: synchronized.
- `git diff --check`: clean.
- `node tests/rpg-world.test.mjs`: passed movement, water/wall/NPC collision, interaction range, doors/exits, camera bounds, spawn recovery, map/registry validation and reachability.
- `node tests/rpg-persistence.test.mjs`: passed isolated keys, competing-writer rejection, malformed world/lesson recovery, Day 2 denial and an inactive data-driven expansion policy example.
- `node tests/rpg-browser.test.mjs`: passed at 375 and 1280px: intro, actual walking and touch controls, four tutorial activities, all four authentic location lessons, three distinct default Home descriptions, reference Library, partial lesson construction/reload, frozen partial and locked assessment/reload, score locks, appearance separate from gender, completion/reload, reset, early challenge failure/retry, honest visit state, production-save sentinel preservation and the terminal chapter boundary.
- `python3 tools/verify.py`: exited 0; all 135 reported checks passed. This is the full workflow, not `--quick`.

The existing fourteen-day/seven-pace matrix uses the retained educational navigation profile to cover shared learning/generation/progression contracts. The separate default-RPG public-control test runs without an injected runtime bridge; its read-only saved-JSON oracle supplies expected assessment answers, while all gameplay/answer submissions use visible controls. The delivery audit labels the profile distinction explicitly. No test sets the RPG completion score or awards through a test bridge.

## Measured performance

The exact release fingerprint, sample distributions and browser version are in [performance.json](performance.json). Run `node tools/rpg-performance.mjs` to reproduce the local diagnostic. The benchmark uses 20 initial reloads, 20 input-to-render observations and 20 alternating Library/exterior transitions per profile. Desktop is 1280px; mobile is 375px with 4× CPU throttle. It measures local Chromium on the managed host, not remote network or physical phone speed. Heap measurements are forced-GC endpoints, not allocation peaks or proof that no long-duration leak exists.

The exact-build measured figures appear below. The initial world envelope is about 235 bytes and a fresh educational save about 391 bytes. Lesson/assessment saves grow with real acquired material and frozen question proofs, as in the underlying game. World movement changes no educational answers, XP or SRS. The rendering loop draws only after state changes; listeners are registered once per app instance and no new loop is created by repeated map transitions.

## Known limitations

- Physical iPhone/mobile Safari, actual touch hardware, OS speech voices and pronunciation quality are untested. Chromium responsive/touch controls and CPU emulation are the recorded evidence.
- Existing optional audio uses available Pashto assets/device voices and retains its candid fallback. No native recording pack or new native-language certification is claimed.
- Only the Library has an interior. Other teaching locations use appropriate outdoor lesson points and courtyards. Art is intentionally compact procedural pixel art.
- NPC placements change by declarative day schedules; autonomous walking and time-of-day movement are not implemented.
- World and educational writes are separate. On mismatched transient lesson pairing, recovery returns to the village while preserving educational knowledge; world position writes debounce by 180ms. Abrupt process termination can lose the last unsaved movement/draft change.
- An unfinished tutorial tile arrangement restarts at the same tutorial step after reload. Completed tutorial responses, ordinary lesson construction and active challenge construction have their documented restoration behaviour.
- The branch stops at Day 1. The inactive Day 2 example documents configuration and the expansion guide identifies remaining chapter-presentation work; it is excluded from the build.

## Play and expand

Checkout `feature/rpg-prototype`, run `python3 tools/build.py`, then `python3 -m http.server 8000` from the checkout and open `http://localhost:8000/`. Use arrows/WASD or touch directions, E/Enter/Interact to talk, L for Library, Escape for Menu. Choose appearance in Menu. Complete Muhammad Jan's Library tutorial, visit Home/Lake/Market/School in any order, then take his Home challenge whenever ready. At least 12/15 completes the prototype. Local HTTP or HTTPS is recommended for browser save coordination.

For GitHub Pages, deploy the generated branch release to a separate preview site/branch. This work does not change the production Pages source. Do not merge merely to preview. Before Day 2, generalize chapter copy/opening-event dispatch, add approved story conditions and schedules, test additional transitions/awards, consider atomic world/education pairing if needed, and perform real Safari/audio checks. See [architecture](RPG_ARCHITECTURE.md), [expansion instructions](RPG_EXPANSION_GUIDE.md) and the [inactive example](day2-registration.example.json).

## Exact-build measurements

Release SHA-256: `f704e1791213266b1761b8ce2967578d7bc3dc91b58fb0247c85e88b236d4236`. Release size: 1595089 bytes, 44,452 bytes (2.87%) above the 1,550,637-byte main-branch base. Chromium 154.0.8037.57. The shared verifier was running on the same host, so host contention can affect these local distributions; these are observations, not a hardware or network guarantee.

| Profile | Load median / p95 | Movement median / p95 | Transition median / p95 | Heap before / after |
|---|---|---|---|---|
| desktop (1280px) | 403.2 / 635.9 ms | 15.6 / 35.4 ms | 12.3 / 25.6 ms | 2,649,512 / 2,776,220 bytes |
| mobile4x (375px) | 1673.5 / 2483.2 ms | 22 / 69.2 ms | 13.6 / 28.8 ms | 2,643,872 / 2,770,548 bytes |

The deterministic movement cadence is one tile per 150ms while held; the latency figures measure input dispatch to the next observed rendered position, separately from that cadence. Mobile uses a smaller camera viewport to keep sprites readable. After 40 moves/transitions, forced-GC heap grew by approximately 127KB in both profiles; this is a bounded sample, not a long-duration leak certification.

## Final integrated result

`python3 tools/verify.py` exited **0**. All 135 reported checks passed, including all 18 browser suites and both delivery-audit commands. The fourteen-day/seven-pace educational matrix covered 392 district visits and 196 assessments; the default RPG public-control suite passed at both 375 and 1280px, including early failure/retry, invalid world recovery, cancelled reset and a preserved but inaccessible valid future-day assessment fixture.

The exact command/result log is [verification.log](verification.log). Build synchronization, final JavaScript syntax, world/persistence regressions and `git diff --check` also passed after the last runtime edits. No physical-device behaviour is inferred from these results.
