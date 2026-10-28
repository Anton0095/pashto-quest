# Pashto Quest verification

Run `python3 tools/verify.py` from the repository root with Python 3, Node.js, Playwright and Chromium. Browser suites honour `CHROMIUM_PATH` and the managed cloud runtime fallback. `--quick` explicitly excludes browsers and cannot refresh the measured delivery report. Edit sources and run `python3 tools/build.py` first; never edit the offline release directly.

| Suite | Contract |
|---|---|
| `p1-regression.test.mjs`, `p1-storage.test.mjs`, `p1-browser.test.mjs` | Studied-only choices, partial/skip/revision/reload, all 33 English grammar concepts and real prerequisites, uncued recall, quota/denial/no-op/intermittent writes, export/retry/recovery and corruption separation at 375/1280px |
| `generation-cache.test.mjs` | All fourteen complete card/dialogue and 20-seed payload digests match the pre-optimisation engine; one immutable lexical index, unlock invalidation and mutable/shallow-frozen data rebuilds |
| `cleanup-model.test.mjs`, `cleanup-browser.test.mjs` | All fourteen days retain people, scenes, story and access rules; 375/1280 UI truth, pace persistence/reset, filters, visiting teachers, frozen assessment counts, grammar catch-up, active-item audio and empty visits without XP |
| `productive-generation.test.mjs` | All 12 positive and 15 negative PR #21 grammar fixtures; every licensed binding, 1,000 deterministic selections, semantic/form/grammar exclusions |
| `generated-architecture.test.mjs` | No startup catalogue/authored runtime cards; real word → grammar → composition order; Day 1 Home; seven paces and normal/skip routes; no hidden introductions or repeated standard study texts |
| `generated-dialogue.test.mjs` | Six typed generated question/reply families, exact semantic joins, speaker referents, guided early dialogues, coordinated-clause syntax/provenance |
| `game-state.test.mjs` | Schema 7 generated snapshots, all 28 families including compound AST restore, partial/locked tiles, proof tampering rejection, score/reward locks and explicit reset |
| `generated-learning.test.mjs` | Real mobile tutorial and default Home: six lemmas, grammar after words, three generated study cards, shuffled indexed construction; pace 0/4 adaptation; committed demonstration screenshots |
| `resume-behaviour.test.mjs` | Offline HTML boot, partial/locked generated attempts, exact reload/retry, corrupt proof preservation and explicit reset |
| `challenge-disclosure.test.mjs` | No generated unknown-form clauses on fresh skip; explicit adaptations; unseen word/phrase meanings hidden before submission, including reload |
| `independent-browser.test.mjs` | Public controls without injected bridge: tutorial, actual Home study/construction, replay XP locks, Library, 375/1280 layouts and reload |
| `full-curriculum.test.mjs` | Fourteen days × seven paces × normal/skip; 392 visits and 196 assessments; independently checks rendered lesson/question/dialogue/feedback clauses against compiler and actual study; story/awards/exams |
| `curriculum-first.test.mjs`, `curriculum-schema.test.py` | All 473 identities/607 forms; provisional/native status, curated schedule, seven paces and study vs encounter |
| `current-model.test.mjs`, `curriculum-expansion.test.mjs`, `district-content.test.py` | Planner, identity/SRS, draft activation and candidate constraints |
| `audio.test.mjs` | Mocked MP3 preference, delayed Pashto voice discovery, fallback warnings and cancellation |

Full verification also checks all editable/compiled JavaScript syntax and generated release, vocabulary, curriculum, district and capacity reports. Only after all suites pass does `tools/delivery-audit.mjs --write` publish the measured browser observations. Its `--check` needs only committed files and verifies the release SHA-256; code changes require another complete run. `docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md` reports actual delivered sentence observations, excluding the six registered conventional phrases. Potential family/day counts and exact missing forms are separately reported in `GENERATION_COVERAGE.md`.

The browser matrix completes the rendered four-interaction tutorial before exercising lessons and assessments. Profiles that deliver no sentences are reported as N/A, never an invented 100%. No complete authored sentence bank, grammar model or fixed dialogue answer is loaded at runtime. Archived banks and `curriculum-contract.json` remain language evidence/fixtures, not normal teaching content. Test bridges exist only in injected test pages; the independent browser suite uses public controls.

Daily challenges remain 15 items/pass 12; Days 7/14 remain 25/pass 20. Skip never completes unseen visits or introduces forms; Day 1 has no lexical actions and Day 14 no new forms. Indexed tile duplicates, answer masking, retries, XP locks and current-save integrity are checked. Schema 7 alone is supported; incompatible/corrupt saves stay untouched until explicit reset.

Passing tests do not certify native Laghman translations, naturalness, pronunciation, recordings or physical iPhone Safari/Windows audio. All language remains provisional pending real reviewer evidence.

Performance runs separately with `node tools/performance-benchmark.mjs --samples 20 --output work/p1/performance.json`. Optional `--profile desktop|mobile4x`, `--pace 0|12|24` and `--release path/to/frozen.html` isolate reproducible runs. The browser-only index counters are injected by the harness; no production instrumentation ships. Ten review sessions each replay Day-14 Home, answer up to ten due items and visit a Library entry, using a synthetic 90-day advance to make review due. Heap figures are CDP JavaScript heap after forced GC; sampled pre-GC high water is explicitly not an exact allocation peak.
