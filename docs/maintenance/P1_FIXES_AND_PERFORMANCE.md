# P1 fixes and performance verification

This follows the [cross-system review of PR #22](https://github.com/Anton0095/pashto-quest/pull/22#issuecomment-6461034748), against `bf657f3f58c9079dddaff56b958a3a12369d434c`. Work stays on `feat/productive-pashto-generation`; no merge is authorised. The sentence compiler and curriculum were retained. Its only algorithm-independent performance change shares an immutable lexical index.

## Original reproductions

The tests were written and run **before production edits**. Each issue was reproduced independently using the current runtime/model, rather than inferred from the review.

| Issue | Command on the original source | Actual result | Captured evidence |
|---|---|---|---|
| P1-A | `node tests/p1-regression.test.mjs A` | Exit 1. After Home alone, House choices included **Root, Forest, Mechanic**. None of those forms was introduced. | [Original output](p1/reproduce-A.txt) |
| P1-B | `node tests/p1-regression.test.mjs B` | Exit 1. Pace 0 produced ten grammar tasks with **one distinct prompt**, all claiming Day 1 grammar despite no visited workshop. | [Original output](p1/reproduce-B.txt) |
| P1-C | `node tests/p1-regression.test.mjs C` | Exit 1. A throwing quota backend returned **undefined** and exposed no persistence warning, while XP remained only in memory. | [Original output](p1/reproduce-C.txt) |

The `A`, `B` and `C` test entry modes remain available. The original A draw was random, so the exact offending words can differ; the absence of a study guard was deterministic. The baseline test file was added before the correction and subsequently extended with further cases.

## Corrections and exact ownership

### Vocabulary disclosure

`src/questions.js` now requires individual form introduction for distractors, separately from day eligibility. Planning is not study. An encountered or practised form does not become a distractor merely because it has a record; mastery also does not bypass formal introduction for productive generation. Previously introduced forms remain available in revision. Studied fixed phrases use their separate phrase records. Same-text/case variants are deduplicated, and shortage slots use explicitly neutral responses rather than fabricated translations.

An unstudied target cannot disclose its own definition through the correct multiple-choice option either. `src/challenge-ui.js` uses uncued English recall or a scored “I don’t know — reveal meaning” action. It shows the definition only after submission. Skipping therefore offers no translation clue and does not introduce a lexical form. `src/question-engine.js` accepts the stored gloss with case/outer-space normalization. The typed draft, unknown flag, direction, options, first answer and score survive save/resume; a retry cannot alter the first score.

`src/library-ui.js`, `src/narrative-ui.js` and `src/tutorial-ui.js` now use that same selector for optional form practice, expression practice and the tutorial. Explicit reference/study cards still show their own target meaning. They cannot disclose other unseen translations through their distractors. `src/app.js` injects the shared service; it does not create a second vocabulary store.

### Grammar assessment

`content/GRAMMAR_ASSESSMENT.json` contains **33 English-only concepts** tied to Days 1–13. Day 14 reviews them. `src/questions.js` composes application prompts, rotates concepts and contexts, and freezes shuffled alternatives in the question snapshot. Alternatives represent role, order, person, number, gender, case and semantic-question mismatches, rather than the former recurring “invent a form” statements. No Pashto sentence is authored or introduced by this bank.

Recall tasks select only concepts whose workshops the player actually visited. With no workshop visited, the task visibly supplies a **Day 1 reference** and identifies itself as a guided rule check. This supports pace 0 and full skips without claiming unaided mastery of later rules. `src/learning.js` no longer lets assessment metadata grant workshop grammar. A correct guided answer cannot unlock Day 2 or any future construction. A guided score contributes to the unchanged challenge pass requirement; it is not a claim that all future Pashto constructions have been learned.

Lengths, passing counts, first-answer locks and rewards remain 15/pass 12 or 25/pass 20. Vocabulary quotas, form prerequisites and the workshop catch-up sequence remain unchanged. `tools/build.py` embeds and validates the English bank, including distinct options and no Pashto text.

### Persistence failures

`src/storage.js` lazily accesses browser storage inside its error boundary, detects write/read-back failures, returns success/failure and exposes persistence status separately from incompatible/corrupt-save rejection. Progress remains in memory. A failed startup read prevents overwriting unread existing data on recovery; the player can export this tab, then reload the original save. There is no silent reset or old-save migration.

`src/app.js` and `src/app.css` provide a nonblocking warning, Retry and JSON Export. Retry clears the warning only after the exact payload is confirmed in storage. The export includes the latest active challenge snapshot. `src/challenge-ui.js`, `src/library-ui.js` and `src/narrative-ui.js` use truthful “recorded”/“selected” wording where durability is not established. Successful challenge saving is claimed only after a confirmed save. Export is a backup; an import UI was not added.

The save schema remains **7**. Generated proofs, frozen presentation, tile state, XP/SRS/reward locks and corrupt-save preservation retain their existing validation. Typed drafts receive additional shape/length validation.

### Revision and measured index sharing

Repeated-review benchmarking reproduced a separate crash: `src/lesson-ui.js` tried to resolve a district name for revision's null location. Revision guidance now names Memory Trail, with no change to study or scoring.

The before measurements established repeated lexical-index construction as a real cost: pace-12 Day-7 challenge creation rebuilt it **481 times**, using a median **35.85 ms** of the **76.50 ms** creation time. `src/content.js` freezes build-time lexical entries/evidence. `src/sentence-engine.js` shares an index through a WeakMap for immutable roots, including shallow compiler views of the same lexicon. Mutable and shallow-frozen editorial data still rebuild. The player eligibility signature still observes form and grammar changes. No stems, inflections, translations, rules, combination ordering or random choices were changed.

The byte-level contract checks every complete available-card payload, every dialogue payload and twenty seeded selections on each of all fourteen days against the unoptimised engine. It also checks both unlock invalidations and mutable inputs. The existing 1,000-seed linguistic tests remain.

## Regression coverage

- `tests/p1-regression.test.mjs`: original three reproductions; Day 1 Home; encounter/introduction separation; partial days; prior-study revision; all fourteen skipped days at all seven paces; frozen choices after reload; all 33 grammar concepts; 0/4-pace prerequisite sets; no assessment grammar grants; eight Day-1 concepts, 400 seeded answer-position samples and seventeen independent role/agreement expectations.
- `tests/p1-storage.test.mjs`: quota, denied and unavailable storage; intermittent/no-op writes; exact recovery/resume; memory preservation; unread existing data; export; corruption distinct from persistence failure; explicit reset.
- `tests/p1-browser.test.mjs`: actual Home before other districts; optional Library choices; unseen recall/reveal and first-score penalty; typed/locked reload; visible guided reference without unlock; mock quota/intermittent/denied storage; **native Chromium quota exhaustion** and retry/reload; actual JSON download; responsive nonblocking warning at 375/1280px; due revision rendering.
- `tests/generation-cache.test.mjs` and `tests/generation-output-contract.json`: pre-optimisation output parity and safe cache reuse/invalidation.
- `tests/full-curriculum.test.mjs`: adds distractor/uncued-target and grammar-prerequisite checks to the existing fourteen-day, seven-pace, normal/skip browser matrix.
- `tests/browser-fixture.mjs` supports uncued controls and explicit release transforms for measurement. `tools/verify.py` runs all new regression suites along with every existing suite. Measurement wrappers never enter the release.

## Performance evidence and reproduction

See the [complete performance report](p1/PERFORMANCE.md), [all timing statistics](p1/timings.csv) and raw JSON linked there. It records desktop and mobile 4× CPU, paces 0/12/24, Days 1/7/13/14, twenty timing samples, actual heap/storage sizes and ten bounded review/Library sessions. It distinguishes fresh-process first generation from an eligibility-cache miss, and sampled high water from an unavailable exact instantaneous allocation peak.

Recreate the before release without changing this branch:

```sh
mkdir -p work/p1
git show 7c1fe36:index.html > work/p1/pre-optimisation.html
node tools/performance-benchmark.mjs --release work/p1/pre-optimisation.html --samples 20 --output work/p1/performance-before.json
node tools/performance-benchmark.mjs --release work/p1/pre-optimisation.html --cold-only --samples 20 --output work/p1/cold-before.json
node tools/performance-benchmark.mjs --samples 20 --output work/p1/performance-after.json
python3 tools/performance-report.py --directory work/p1
```

The final command renders the new measurements under `work/p1`. Without `--directory`, it renders the committed raw measurements under `docs/maintenance/p1`. Timing variation between runs is expected. The before/after releases and compiler payload hashes are explicit, so behavioural parity is independently testable.

## Verification results

`python3 tools/verify.py` finished with **exit 0: 74 PASS, 0 FAIL**, including all seven browser suites. [Complete command log](p1/verification.txt); [P1 regressions](p1/regression-results.txt), [storage](p1/storage-results.txt), [browser/native-quota tests](p1/browser-results.txt), [compiler parity](p1/cache-results.txt) and [linguistic regressions](p1/linguistic-results.txt).

| Command | Actual exit |
|---|---:|
| `python3 tools/verify.py` | 0 |
| `node tests/p1-regression.test.mjs` | 0 |
| `node tests/p1-storage.test.mjs` | 0 |
| `node tests/p1-browser.test.mjs` | 0 |
| `node tests/generation-cache.test.mjs` | 0 |
| `python3 tools/build.py --check` | 0 |
| `node tools/performance-benchmark.mjs --release work/p1/pre-optimisation.html --samples 20 --output work/p1/performance-before.json` | 0 |
| `node tools/performance-benchmark.mjs --release work/p1/pre-optimisation.html --cold-only --samples 20 --output work/p1/performance-cold-before.json` | 0 |
| `node tools/performance-benchmark.mjs --samples 20 --output work/p1/performance-after.json` | 0 |
| `python3 tools/performance-report.py` | 0 |
| `python3 -m py_compile tools/performance-report.py` | 0 |

The final matrix completed **392 normal visits and 196 assessments**, covering all fourteen days, all seven paces, and normal/skip profiles. It checked actual rendered choices, compiled sentences, dialogue, grammar prerequisites, first answers, XP/SRS/reward locks, narrative progression and weekly pass requirements. Resume, corrupt-save preservation, audio mocks, offline boot and mobile controls passed.

**Day 1 demonstration:** after Muhammad Jan’s default Home lesson, six district lemmas and the required individual form are studied before grammar, then the engine supplies three distinct descriptions:

- کړکۍ خلاصه ده. — The window is open.
- کور لوی دی. — The house is big.
- دروازه خلاصه ده. — The door is open.

These are actual compiler outputs recorded by the browser, not teaching-bank fallbacks. [Generated study](../grammar/demonstration/day1-generated-study.png) and [construction](../grammar/demonstration/day1-construction.png) captures remain available. [Uncued recall at 375px](p1/uncued-recall-375.png) and [the nonblocking save warning](p1/save-failure-375.png) demonstrate the new paths; 1280px captures are in the same directory.

The [release-fingerprinted delivery audit](../grammar/INSTRUCTIONAL_DELIVERY_REPORT.md) measured **4,650 / 4,650 = 100% genuinely generated Pashto instructional sentence surfaces**, with zero authored sentence fallbacks. The six designated fixed expressions are excluded; zero-sentence profiles are N/A. Isolated vocabulary/forms and English grammar/narrative scaffolding are separate from Pashto clause delivery. All 12 positive and 15 negative research cases, 16,649 independently checked bindings, 1,000 seeds and the additional all-day compiler contracts passed.

Earlier complete runs exited 1 while updating two test assumptions: an old UI assertion expected “Saved” instead of the deliberate “Selected” label, and a new substring assertion mistook “I” in the generic “I don’t know” control for a translation option. The assertions now check the actual intended UI/answer labels. No failing final checks remain. Physical-device/voice testing and exact instantaneous allocation peaks remain unavailable, as explicitly described in the performance report; they are not represented as passing tests.

## Remaining debt and limits

| Priority | Finding | Evidence/status and treatment |
|---|---|---|
| P0 | None established by this scoped work | This is not a whole-project security audit. |
| P1 | Three reported issues and revision crash | Fixed and regression-tested; final verification above. |
| P2 | Late cold catalogue enumeration and synchronous full saves | Confirmed by measurements. Index sharing is the only performance optimisation; further changes need parity/durability evidence. |
| P2 | Persistent delivery/event/frozen-history growth | Confirmed by actual byte growth. Retained for provenance, SRS and reward/resume integrity; no speculative deletion or lossy compaction. |
| P2 | Uncued recall uses the stored English gloss | Case/outer whitespace accepted; broader synonyms are not invented or inferred. Additional accepted meanings need editorial evidence. |
| P2 | Fixed-order dud tiles | Existing predictable first-two selection retained. This was a separate review finding, outside the requested three-P1 scope. |
| P2 | Generation participation is narrower than the full vocabulary bank | Existing coverage/missing-form reports remain authoritative. No unsupported morphology was added to increase counts. |
| P2 | No bundled native Pashto MP3 pack; native review remains provisional | Audio and warning paths retained. Physical iPhone Safari, Windows voice quality and real Safari quota behaviour remain unexecuted here. |
| P3 | Potential indefinite heap retention or concurrent artifact races | Not established by the bounded measurements/verification. Known catalogue/registry consumers were preserved. |

The linguistic source evidence, archived attestations, provisional review flags, compiler rules/frames, vocabulary inventory, narrative, characters, rewards, story progression, reference Library, audio fallback and offline architecture remain intact. No merge was performed.
