# Pashto Quest verification

## Choose validation by change and risk

Choose checks for the changed behaviour and its dependencies. Full verification includes browser playthroughs across fourteen days, seven paces and normal/skip routes; it is intentionally substantial and is not the default file-review operation.

| Change | Required validation |
|---|---|
| Markdown only; no runtime, data, build or test changes | Review wording, document roles, terminology, relative links/anchors and the final Markdown-only diff. No build, `verify.py`, `--quick`, gameplay, audit regeneration, screenshots or benchmarks. |
| Isolated presentation or local behaviour | Run the relevant focused suite(s), syntax/build checks when their inputs change, and affected mobile/desktop UI checks. Escalate to full verification if shared controls or broad contracts are affected. |
| Shared learning, answer evaluation, generation, planner, progression, save schema or persistence | Use targeted regressions during editing, then run full verification once on the final integrated state. |
| Lexicon, curriculum, planner or frame data | Validate schemas and affected eligibility/generation contracts; rebuild and regenerate affected curriculum, inventory and generation audits. Run full verification for changes to shared learning or generated delivery. |
| Performance claim or requested performance work | Measure affected profiles against a reproducible baseline. Run the complete benchmark matrix for broad performance work; benchmarks are separate from functional checks. |

Do not repeat a full baseline or full suite for each file, commit or documentation edit. Repeat after relevant subsequent changes, failures or unresolved concerns. `--quick` excludes browsers but still runs substantial model/generation checks; it is not a lightweight Markdown check. Explicit user instructions can narrow or expand validation; report any resulting evidence limits honestly.

A release-bound delivery report must match the exact HTML fingerprint. Refreshing that report requires the complete successful browser matrix; never edit its hash or observations by hand. When a focused change does not warrant a full matrix, keep previous measurements identified as evidence for their recorded release, and disclose that they do not validate the new release. Do not claim that an earlier report is fresh or passing if its fingerprint no longer matches.

Record actual commands/results and why broader checks were unnecessary or omitted. Historical logs, check counts and benchmark figures are dated evidence, not instructions to rerun those checks.

## Suite reference

When full verification is warranted, run `python3 tools/verify.py` from the repository root with Python 3, Node.js, Playwright and Chromium. Browser suites honour `CHROMIUM_PATH` and the managed cloud runtime fallback. `--quick` explicitly excludes browsers and cannot refresh the measured delivery report. When release inputs change, edit sources and run `python3 tools/build.py` first; never edit the offline release directly.

| Suite | Contract |
|---|---|
| `narrative-feedback.test.mjs` | Shared answer feedback and narrative context at mobile/desktop widths |
| `audit-compaction.test.mjs` | 400 attempts preserve counts/SRS/XP, retired replay rejection, paused exact snapshots, schema-7 compatibility and unchanged-save write avoidance |
| `audit-save.test.mjs`, `audit-tabs.test.mjs` | Nested schema-7 rejection without overwriting raw data; public two-tab tutorial/pace conflict and reload |
| `audit-teaching.test.mjs`, `audit-teaching-browser.test.mjs` | Construction retries, seeded duds, explicit English alternatives, refreshed new attempts and frozen paused drafts, teacher/listener contexts, optional expression feedback and two open Library exercises answered in reverse order with no XP at both widths |
| `approval-status.test.py`, `approval-status.test.mjs` | Synthetic-only canonical native approval evidence and consistent audit/inventory counts; real records unchanged |
| `p1-regression.test.mjs`, `p1-storage.test.mjs`, `p1-browser.test.mjs` | Studied-only choices, partial/skip/revision/reload, all 33 English grammar concepts and real prerequisites, uncued recall, quota/denial/no-op/intermittent writes, export/retry/recovery and corruption separation at 375/1280px |
| `generation-cache.test.mjs` | All fourteen complete card/dialogue and 20-seed payload digests match the pre-optimisation engine; one immutable lexical index, deferred/frozen candidate payload parity, unlock invalidation and mutable/shallow-frozen data rebuilds |
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

Full verification also checks all editable/compiled JavaScript syntax and generated release, vocabulary, curriculum, district and capacity reports. Only after all suites pass does `tools/delivery-audit.mjs --write` publish the measured browser observations. Its `--check` needs only committed files and verifies the release SHA-256; refreshing the report after release changes requires another complete run. Focused changes follow the policy above and must disclose any retained report’s older fingerprint. `docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md` reports actual delivered sentence observations, excluding the eighteen registered conventional phrases. Potential family/day counts and exact missing forms are separately reported in `GENERATION_COVERAGE.md`.

The browser matrix completes the rendered four-interaction tutorial before exercising lessons and assessments. Profiles that deliver no sentences are reported as N/A, never an invented 100%. No complete authored sentence bank, grammar model or fixed dialogue answer is loaded at runtime. Archived banks and `curriculum-contract.json` remain language evidence/fixtures, not normal teaching content. Test bridges exist only in injected test pages; the independent browser suite uses public controls.

Daily challenges remain 15 items/pass 12; Days 7/14 remain 25/pass 20. Skip never completes unseen visits or introduces forms; Day 1 has no lexical actions and Day 14 no new forms. Indexed tile duplicates, answer masking, retries, XP locks and current-save integrity are checked. Schema 7 alone is supported; incompatible/corrupt saves stay untouched until explicit reset.

Passing tests do not certify native Laghman translations, naturalness, pronunciation, recordings or physical iPhone Safari/Windows audio. Base wording and eighteen phrases are owner-approved; inflections, grammar, naturalness and native certification remain separate.

Performance runs separately with `node tools/performance-benchmark.mjs --samples 20 --output work/p1/performance.json`. Optional `--profile desktop|mobile4x`, `--pace 0|12|24` and `--release path/to/frozen.html` isolate reproducible runs. The browser-only index counters are injected by the harness; no production instrumentation ships. Ten review sessions each replay Day-14 Home, answer up to ten due items and visit a Library entry, using a synthetic 90-day advance to make review due. Heap figures are CDP JavaScript heap after forced GC; sampled pre-GC high water is explicitly not an exact allocation peak.

The [audit remediation](../docs/maintenance/AUDIT_REMEDIATION.md) and [paired benchmark report](../docs/maintenance/AUDIT_PERFORMANCE.md) record the PR #23 run separately from earlier historical results; they are not measurements of every later documentation revision. `python3 tools/audit-performance-report.py before.json after.json output.md` checks matching profiles, browser/host, sample counts, candidate counts, cache invalidation and revision warnings before reporting median/p95 distributions.

`approved-language.test.py` checks exact base/phrase approvals, `nun`, excluded candidates and scoped evidence. `approved-sentences.test.mjs` checks new pronunciation, exact prior attested snapshot display and Day-5/7 responses. `concurrent-save.test.mjs` and `concurrent-save-browser.test.mjs` cover two writers queued before comparison, losing-tab export/reload and same-tab coalescing. Browser persistence callers that need durability await `storage.save()` or `storage.settled()`; a click alone is not a completed disk write.

`choice-quality.test.mjs` covers same-lesson/mixed-POS priority, Day-1 backup without acquisition, accepted-sense/variant exclusions, all 33 single-answer grammar concepts and frozen legacy ambiguity/scoring. `choice-quality-browser.test.mjs` checks shared highlighting, Library accepted answers/no XP, exact frozen-choice reload and unchanged locked historical scores at 375/1280px. This focused follow-up does not refresh the previous release-bound delivery report or benchmark claims.
