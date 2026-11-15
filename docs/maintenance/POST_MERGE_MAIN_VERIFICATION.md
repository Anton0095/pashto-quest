# Post-merge main branch verification

Verification date: 16 November 2026 (Australia/Sydney). Repository: `Anton0095/pashto-quest`. Branch: `audit/post-merge-main-verification`; PR targets `main`, with no automatic merge.

## Baseline and tested release

PR #39 was confirmed merged before release verification began (merge time `2026-11-15T23:11:28Z`). The latest fetched main was `09420add0f4e4996f21f888187d0632504617963`. Git ancestry confirmed the merge commits for PR #37 (`fd9e7cb25a70c8292fdaa0e413bf80a7c58512a1`), PR #38 (`e564bcf628330f9dbea0283616e38c85a06dba47`) and PR #39 are present.

| Artifact | Merged main | Corrected verification state |
| --- | --- | --- |
| Commit | `09420add0f4e4996f21f888187d0632504617963` | `38f462e8274aa82689e903a1ca014ea2a359a37f` |
| `index.html` SHA-256 | `7e3e777c51325e004d5952779e56ce6e379b62d6dcceb48dac1f4b3ca2a98df4` | `22ca88de9568a70e9abe6570808251704ee4a33d7e88de1177d36feb3cab4fbf` |
| `generated/rpg.bundle.js` SHA-256 | `6c78834c20501756e0991a45abf68b4d13daff9ddd4bfb16cf7162898deb7861` | Same |

The integrated run used the exact corrected release bytes recorded above. Test synchronization was subsequently corrected at `d8eb3ae0f95cf9080f47a2459e7a232708ce28fb`, then checked by the focused suite and JavaScript syntax check. Later test/report/delivery-evidence commits do not change runtime inputs. No gameplay, curriculum, lexical form, approval flag, test assertion or dependency was changed.

## Environment

Managed Debian GNU/Linux 13 x86-64 cloud environment, Linux `6.18.57`; Python `3.12.14`, Node `24.19.0`, npm `11.9.0`, TypeScript `7.0.2`, esbuild `0.28.2`, Phaser `4.2.1`, Playwright `1.62.1`, Chromium `154.0.8037.57` at `/usr/bin/chromium`. The container has a two-CPU quota. Browser suites use local HTTP/offline harnesses and Chromium desktop/mobile touch emulation. Public Week 1 journeys submit answers through real controls and use saved question data as a read-only oracle; they inject no grades, completion or rewards. Educational Days 8–14 use the explicit test-only educational navigation fixture, not unregistered production RPG chapters.

`npm ci` initially failed because npm's default `/home/agent/.npm/_cacache` was unavailable. `npm ci --cache /workspace/pashto-quest/work/npm-cache` succeeded (six packages). This environment setup failure changed no dependency lockfile.

## Findings and corrections

| Severity | Category | Finding, reproduction and correction |
| --- | --- | --- |
| Medium | Compiled asset consistency | On fetched main, run `python3 tools/build.py --check`: exits 1 with `Stale release: run python3 tools/build.py`. PR #39 changed the first comment of `src/lesson-ui.js` without rebuilding the HTML that embeds that source verbatim. Ran `python3 tools/build.py`; an independent full-file comparison confirms the sole HTML difference is that exact comment. RPG bundle unchanged. The existing build-equality regression check now passes. No new mirror test was warranted. |
| Low | Test synchronization | `save-fence-browser.test.mjs` intermittently evaluated `__test` before the page initialized after explicit incompatible-save reset (`ReferenceError: __test is not defined`, former line 43). The app correctly saves then calls `location.reload()`. An unchanged focused rerun passed, exposing the timing dependence. The test now awaits reset navigation/load and bridge readiness before retaining all schema-9, warning, byte-preservation, race and recovery assertions. Fixed focused suite and syntax check pass; no persistence code or assertion changed. |
| Low | Active documentation | `tests/README.md` still described 614 forms and 280 visits in its suite table. Corrected to 667 forms and 350 visits (280 normal + 70 compulsory shortcut School), matching the lexicon and actual matrix assertions. |
| Low | Active documentation | `GAME_SPEC.md` still said Library preference changes never affect frozen attempts, contradicting its current answer-language section and implementation. Clarified conversion of unanswered typing slots with unchanged targets, completed answers, score and construction; re-enabling affects future activities. |
| Low | Active documentation | An older `GAME_SPEC.md` paragraph still put all grammar after word/form study. Clarified the School concept-before-dependent-flashcards exception and later workshop order, consistent with the corrected PR #39 paragraph and source comment. |

The preliminary full-verifier invocation reached the build failure and five other passing checks, then was explicitly stopped during productive-generation testing once the mismatch was isolated. It is not counted as a completed baseline suite. The complete, unrestricted `python3 tools/verify.py` was restarted after rebuilding; its results below are the integrated corrected-state evidence. No `--quick`, skipped failing suite or weakened expected result was substituted. The completed integrated run contains the test synchronization failure described above; its corrected focused rerun is reported separately rather than relabelling the original run green. Since that later change affects only test waiting, no shared runtime logic changed and a second complete matrix was unnecessary.

## Automated verification

The complete unrestricted `python3 tools/verify.py` finished: **238 passing command checks, one failing command check, exit 1**. All **190 static/model/syntax checks** and **48 of 49 browser suites** passed in that invocation. The one failure was the reset-navigation test race described above; both the unchanged diagnostic rerun and the corrected focused rerun passed. `node --check tests/save-fence-browser.test.mjs` also passed after the fix.

Final coverage therefore has passing results for all 190 nonbrowser checks and all 49 browser suites, plus successful delivery-audit write/check commands. This is combined full-run and focused-rerun evidence, not a claim that a second complete verifier invocation exited 0. No runtime input changed after the full run; the later test-only wait correction required focused validation, not another fourteen-day matrix.

Because the verifier correctly withheld automatic delivery publication after the one failed test command, `node tools/delivery-audit.mjs --write` and `--check` were executed explicitly only after the remaining full run and corrected focused suite succeeded. Both passed and record the measured 6,246 observations against the corrected release fingerprint.

The production rebuild succeeded. The integrated verifier covers strict TypeScript including unused bindings; editable/compiled JavaScript syntax; lexical/content/curriculum schemas and approvals; current release/RPG bundle equality; curriculum/vocabulary/district/generation audits; compiler proofs and save schemas; all registered model and browser suites. The exact expanded command results appear in the appendix.

## Seven-day RPG verification

Passed complete real public RPG desktop normal (1280px) and mobile early-challenge (375px, touch emulation) journeys. Neither journey uses a grading/reward bridge.

| Day | Desktop normal | Mobile early challenge | Main checkpoint |
| --- | --- | --- | --- |
| 1 | Passed | Passed | Four-interaction tutorial, School, lessons/shortcut, first daily pass |
| 2 | Passed | Passed | School-first SOV, lesson/challenge reload and sleep |
| 3 | Passed | Passed | First-person progression; shortcut failure/retry |
| 4 | Passed | Passed | Teacher/story continuation and once-only completion |
| 5 | Passed | Passed | Plural-day lessons/activation, relocated teachers and gathering |
| 6 | Passed | Passed | Lake/Hills storyline and transitions; frozen challenge reload |
| 7 | Passed | Passed | 25-question examination, shortcut failure/retry, graduation, reward locks |

Both routes preserved the campaign day until sleep, restored results without a duplicate ending conversation, and retained terminal Day 7 during completed-day review. Final recorded XP was 5,410 normal / 2,419 shortcut; different practice histories legitimately award different practice XP.

| Requirement | Verification coverage |
| --- | --- |
| Tutorial and independent typing | Public four-interaction tutorial, tutorial-specific typing/opt-out, independent Pashto/English combinations, conversion and reload in tutorial/lesson/challenge/dream contexts. |
| School-first; optional lesson order; grammar gates | Seven-day journeys complete School before normal/shortcut entry. School-first model covers all six optional orders, five paces and fourteen days; public focused suites check NPC, direct and Quick Travel rejection and moved-teacher guidance. |
| Form acknowledgement and Library | Desktop/mobile RPG reload an unacknowledged flashcard with exact card/pool restored and no taught flag; later acknowledgement is recorded. Library shows taught and reference-only forms without granting study/unlocks. |
| Day 5 plurals | Fourteen-day plural model asserts actual noun plural flashcards begin on Day 5, current-person verbs on Days 2–7, licensed plural-first introduction and taught-only ordinary generated practice. The public normal route completes all Day 5 lessons. |
| Names, Bilal and guidance | Bilingual/group labels and stable portrait IDs; School/Lake/pass eligibility on all seven days; repeat success/incorrect responses, durable completion tick and zero optional-conversation XP. Shared guidance follows live teacher location. |
| Dialogue interruption | Real keyboard and mouse/touch initiation dismiss ordinary conversation and move the player at 1280/375px; required acknowledgements remain protected. |
| Challenges and results | Real 15-item daily and 25-item Day 7 exams; shortcut failures/retries; missing visits remain incomplete on failure and complete on first pass; result reload locks rewards and opens no duplicate completion conversation. |
| Sleep, Day 6 and Day 7 | Public routes return home, sleep and wake beside bed at `{map: house, x: 17, y: 10}`; Day 6 Lake/Hills introduction and transitions; Day 7 examination, Level 10/New Resident and locked production Day 8. |
| Reload and replay accounting | Partial lessons/cards, exact active questions/tiles/first-answer locks and results restore; repeated submissions, passed-day exploration and dreams cannot duplicate campaign XP/rewards/mastery credit. |

The complete Week 1 routes pair desktop normal (1280px) with mobile shortcut (375px); focused suites exercise both routes and shared controls at desktop/mobile widths. This is automated public-interface play, not a claim of a separate human or physical-device playthrough. Newly captured mobile flashcard, desktop Library and desktop Bilal guidance images were also visually inspected.

## Fourteen-day educational verification

Passed the complete rendered fourteen-day matrix on the corrected release fingerprint.

Five paces (8/12/16/20/24), normal and explicit shortcut, all Days 1–14: ten profiles, 350 lesson visits and 140 assessments. Each shortcut includes compulsory School. The matrix independently reconstructs observed sentence proofs, compares rendered Pashto/English/romanisation, checks licensed form/grammar bindings, first-answer locks, completion, thresholds and graduation. The School-first model passed 1,680 lessons across all six optional orders. Model suites extend the rendered matrix with distinct identity allocation, preferred-class exhaustion/redistribution, six optional orders, finite-first/plural-first forms, frozen form selection/lesson pools, reference versus study, SRS and Day 14's zero compulsory lemmas/forms.

Challenge sizes remain 15/pass 12 except Days 7/14 at 25/pass 20. Activation licenses the frozen current-day four-location material before generation without claiming acknowledgement, mastery or grades. A successful pass banks skipped vocabulary and awards eligible completion once. Small licensed pools adapt explicitly to vocabulary/approved phrases. Productive generation passed 12 positive and 15 negative research fixtures, 22,022 independently checked bindings and 1,473 seeded variants. All-family restore/tampering checks also reject unsupported person, number, gender, case, semantics, tenses and guessed morphology.

All **6,246/6,246** observed curricular sentence surfaces were compiler-generated (100%); zero authored curricular fallback sentences. The 18 designated expressions and two contextual onboarding questions remain outside that sentence denominator. Counts are observations in this run, not a fixed inventory or a naturalness certification.

| Pace | Normal observed sentences | Shortcut observed sentences | Visits normal / shortcut | Assessments normal / shortcut |
| --- | --- | --- | --- | --- |
| 8 | 744 | 438 | 56 / 14 | 14 / 14 |
| 12 | 778 | 483 | 56 / 14 | 14 / 14 |
| 16 | 768 | 458 | 56 / 14 | 14 / 14 |
| 20 | 828 | 473 | 56 / 14 | 14 / 14 |
| 24 | 808 | 468 | 56 / 14 | 14 / 14 |

## Saves and persistence

Passed current-save model/restore, corruption/conflict, concurrent-browser and public reload checks. The save-fence browser check passed after the test synchronization correction; its application assertions were retained.

Educational schema 9 is the sole accepted format; world position schema 1 remains independent. Current lesson/card acknowledgements, frozen plans and assessment/compiler proofs restore. Earlier formats and corrupt data are rejected without overwriting stored bytes until explicit reset/export. Dedicated model/browser suites cover coordinated Web Locks, revision-fence stale-renderer races, competing tabs, ambiguous writes, same-tab coalescing, no-op writes, quota/denial/retry/export, proof tampering and once-only practice/reward events. No migration, old-proof repair or parallel SRS/XP store was introduced.

## Documentation consistency and previous findings 2–7

Reviewed `README.md`, `GAME_SPEC.md`, `CURRICULUM.md`, `LANGUAGE_REVIEW.md`, `AGENTS.md`, `tests/README.md` and the current [dialogue/morphology overhaul](../rpg/DIALOGUE_MORPHOLOGY_OVERHAUL.md), with source/data and the current generated reports as the implementation evidence.

| Previous audit finding | Recheck |
| --- | --- |
| 2 — Days 5–9 grammar sequence | Active sequence correctly puts noun plurals on Day 5 and quantity/plural consolidation on Day 9. Days 6/7 continue plural-person agreement. |
| 3 — GAME_SPEC save format | Schema 9, explicit reset of unsupported saves, independent world schema 1. |
| 4 — Current inventory | Independent JSON count: 474 identities (401 district + 73 universal), 667 recorded forms, 215 composition-eligible; 254 nouns. Main content/review documents agree. One stale test-guide table cell was corrected in this branch. Generation has 28 atomic plus one composite template across 28 families. |
| 5 — Obsolete schema-8 fixture claims | Active test descriptions use schema 9; remaining mentions identify removed or historical fixtures, not supported migration paths. |
| 6 — `nun` and obsolete `nan` proof repair | Current approval/pronunciation is `nun`; earlier proofs are rejected, with no backfill compatibility claim. Approval/proof regression suites cover the boundary. |
| 7 — School grammar before forms | Primary corrected paragraph and source comment remain correct. This branch also removes the contradictory older GAME_SPEC generalisation and synchronises the generated copy of the corrected comment. |

Generated curriculum, vocabulary, district and capacity reports are checked from their actual inputs. Release-bound delivery evidence is refreshed only by the successful complete matrix/verifier, not by editing its fingerprint. Historical overhaul/maintenance and benchmark reports retain their original release hashes and results; those hashes are not evidence for this corrected release. Days 8–14 narrative/maps/events and Bilal's catch reveal remain future features, not current playable content.

Local relative link destinations and anchors in the seven reviewed active/current documents were checked: 131 links, zero failures. Including this report, the final check passed 132 local links/anchors with zero failures. `git diff --check` passed. Incidental screenshot overwrites from test execution were restored; historical reports and performance figures were not rewritten.

## Linguistic and platform limits

The 473 original bases plus owner-requested Have base, and 18 conventional phrases, have scoped owner approval; two onboarding questions have separate contextual approval. This does not approve inflections, grammatical analyses, combinations, pronunciation or audio. The noun research audits 254 nouns: 53 added stable forms, 28 productive and 25 reference-only; 209 nouns retain unresolved plural evidence. Unknown forms/features remain excluded. Numbers four/five remain isolated word/reference targets until productive quantity evidence exists. No missing form was invented to suppress a warning.

Bilingual name/narrative drafts and dictionary-attested inflections need qualified Laghman naturalness/dialect review. No native-reviewed MP3 pack is bundled. Mocked speech tests establish selection/cancellation/fallback behavior only. Physical iPhone Safari, other browser engines, actual hardware touch and Windows/device speech quality remain unverified. No performance benchmark or line-coverage percentage is claimed by this functional audit.

## Unresolved issues and recommendation

No confirmed unresolved Critical or High software defect. The release-equality failure, test synchronization defect and active-document contradictions found during this audit are corrected.

| Severity | Unresolved item | Classification / next action |
| --- | --- | --- |
| Critical | None confirmed | No open critical defect from this verification. |
| High | None confirmed | No open high defect from this verification. |
| Medium | Native/dialect and morphology review, including 209 unresolved noun plurals | Known linguistic evidence limitation; obtain qualified item-specific review, retain exclusions and provisional flags. Not a demonstrated generator defect. |
| Medium | Physical Safari/touch and real-device speech/recordings | Unverified platform/audio coverage; conduct manual device playtesting and pronunciation review. Chromium emulation does not close it. |
| Low | No single exit-0 verifier invocation after the test-only wait fix | Evidence limitation: complete run plus successful focused correction, with all 49 browser suites passing across those runs. A future release can obtain a clean single-command baseline. No production input was changed by the test fix. |

**Recommendation: ready for manual playtesting**, and suitable for continued development within the seven-day RPG/fourteen-day educational boundary. Prioritise native linguistic review and physical-device playtesting. Register reviewed Week 2 story/maps/events before exposing RPG Days 8–14; the educational backend alone is not a playable Week 2. Bilal's catch reveal remains future narrative work, not a regression.

Changed files: `index.html` (generated comment synchronization), `GAME_SPEC.md` and `tests/README.md` (factual documentation), `tests/save-fence-browser.test.mjs` (navigation waiting), `content/INSTRUCTIONAL_DELIVERY_AUDIT.json` and `docs/grammar/INSTRUCTIONAL_DELIVERY_REPORT.md` (tool-generated release-bound evidence), and this report.

## Exact integrated command results

Setup/build and additional checks (from the repository root):

```text
git fetch origin main                                      PASS
git switch -c audit/post-merge-main-verification origin/main PASS
npm ci                                                     FAIL: default cache unavailable
npm ci --cache /workspace/pashto-quest/work/npm-cache        PASS
python3 tools/build.py                                     PASS
python3 tools/verify.py                                    preliminary run stopped after stale build identified
python3 tools/verify.py                                    completed: 238 PASS / 1 FAIL, exit 1
node tests/save-fence-browser.test.mjs                      PASS: unchanged diagnostic rerun
node --check tests/save-fence-browser.test.mjs               PASS: corrected test
node tests/save-fence-browser.test.mjs                      PASS: corrected test
node tools/delivery-audit.mjs --write                       PASS
node tools/delivery-audit.mjs --check                       PASS
python3 work/post-merge-verification/check-doc-links.py     PASS: ad hoc local link/anchor inspection
git diff --check                                           PASS
```

The local link helper checks relative destinations and GitHub-style heading anchors; it is an audit scratch script, not a new repository dependency. The original stale-build reproduction was `python3 tools/build.py --check` on fetched main. The completed integrated invocation expanded to these exact results (the original failure is retained):

<details>
<summary>All 239 integrated command results</summary>

```text
PASS npm run typecheck
PASS python3 tools/build.py --check
PASS python3 tools/curriculum-audit.py --check
PASS python3 tools/vocabulary-review.py --check
PASS python3 tests/curriculum-schema.test.py
PASS node tests/curriculum-first.test.mjs
PASS node tests/productive-generation.test.mjs
PASS node tests/generated-architecture.test.mjs
PASS node tests/generated-dialogue.test.mjs
PASS node tools/generation-audit.mjs --check
PASS node tools/district-inventory.mjs --check
PASS node tests/cleanup-model.test.mjs
PASS node tests/current-model.test.mjs
PASS node tests/game-state.test.mjs
PASS node tests/audio.test.mjs
PASS node tests/curriculum-expansion.test.mjs
PASS python3 tests/district-content.test.py
PASS python3 tests/noun-research.test.py
PASS node tests/form-lifecycle.test.mjs
PASS node tests/plural-curriculum.test.mjs
PASS node tests/dialogue-overhaul.test.mjs
PASS node tests/typing-languages.test.mjs
PASS node tests/school-first.test.mjs
PASS node tests/hills-expansion.test.mjs
PASS node tests/typing-bilal.test.mjs
PASS node tests/quest-improvements.test.mjs
PASS node tests/authored-conversations.test.mjs
PASS node --check tests/fixtures/education-navigation.js
PASS node tests/village-redesign.test.mjs
PASS node tests/daily-flow.test.mjs
PASS node tests/house-sleep-dream.test.mjs
PASS node tests/rpg-foundation.test.mjs
PASS node tests/rpg-week1.test.mjs
PASS node tests/lesson-progression-fixes.test.mjs
PASS node tests/character-expansion.test.mjs
PASS node tests/character-names.test.mjs
PASS node tests/rpg-narrative-audit.test.mjs
PASS node tests/rpg-movement.test.mjs
PASS node tests/presentation.test.mjs
PASS node tests/rpg-world.test.mjs
PASS node tests/rpg-persistence.test.mjs
PASS node tests/assessment-randomness.test.mjs
PASS node tests/challenge-activation.test.mjs
PASS node tests/construction-completion.test.mjs
PASS node tests/p1-regression.test.mjs
PASS node tests/p1-storage.test.mjs
PASS node tests/generation-cache.test.mjs
PASS node tests/audit-save.test.mjs
PASS node tests/audit-teaching.test.mjs
PASS node tests/audit-compaction.test.mjs
PASS python3 tests/approved-language.test.py
PASS node tests/practical-assessment.test.mjs
PASS node tests/choice-quality.test.mjs
PASS node tests/concurrent-save.test.mjs
PASS node tests/approved-sentences.test.mjs
PASS python3 tests/approval-status.test.py
PASS node tests/approval-status.test.mjs
PASS node --check src/answer-feedback.js
PASS node --check src/app.js
PASS node --check src/assessment-content.js
PASS node --check src/audio.js
PASS node --check src/challenge-ui.js
PASS node --check src/character-portraits.js
PASS node --check src/construction-ui.js
PASS node --check src/content.js
PASS node --check src/grammar-ui.js
PASS node --check src/learning.js
PASS node --check src/lesson-ui.js
PASS node --check src/library-engine.js
PASS node --check src/library-ui.js
PASS node --check src/narrative-ui.js
PASS node --check src/progression.js
PASS node --check src/question-engine.js
PASS node --check src/questions.js
PASS node --check src/save-schema.js
PASS node --check src/sentence-engine.js
PASS node --check src/sov-demo.js
PASS node --check src/storage.js
PASS node --check src/tutorial-ui.js
PASS node --check src/typed-answer-ui.js
PASS node --check src/ui.js
PASS node --check src/world-ui.js
PASS node --check tools/build-rpg.mjs
PASS node --check tools/capture-village.mjs
PASS node --check tools/delivery-audit.mjs
PASS node --check tools/district-inventory.mjs
PASS node --check tools/generation-audit.mjs
PASS node --check tools/performance-benchmark.mjs
PASS node --check tools/rpg-performance.mjs
PASS node --check tools/village-render-performance.mjs
PASS node --check tests/approval-status.test.mjs
PASS node --check tests/approved-flow-browser.test.mjs
PASS node --check tests/approved-sentences.test.mjs
PASS node --check tests/assessment-randomness-browser.test.mjs
PASS node --check tests/assessment-randomness.test.mjs
PASS node --check tests/audio.test.mjs
PASS node --check tests/audit-compaction.test.mjs
PASS node --check tests/audit-save.test.mjs
PASS node --check tests/audit-tabs.test.mjs
PASS node --check tests/audit-teaching-browser.test.mjs
PASS node --check tests/audit-teaching.test.mjs
PASS node --check tests/authored-conversations.test.mjs
PASS node --check tests/browser-fixture.mjs
PASS node --check tests/challenge-activation.test.mjs
PASS node --check tests/challenge-disclosure.test.mjs
PASS node --check tests/character-expansion-browser.test.mjs
PASS node --check tests/character-expansion.test.mjs
PASS node --check tests/character-names-browser.test.mjs
PASS node --check tests/character-names.test.mjs
PASS node --check tests/choice-quality-browser.test.mjs
PASS node --check tests/choice-quality.test.mjs
PASS node --check tests/cleanup-browser.test.mjs
PASS node --check tests/cleanup-model.test.mjs
PASS node --check tests/concurrent-save-browser.test.mjs
PASS node --check tests/concurrent-save.test.mjs
PASS node --check tests/construction-completion-browser.test.mjs
PASS node --check tests/construction-completion.test.mjs
PASS node --check tests/current-model.test.mjs
PASS node --check tests/curriculum-expansion.test.mjs
PASS node --check tests/curriculum-first.test.mjs
PASS node --check tests/daily-flow-browser.test.mjs
PASS node --check tests/daily-flow.test.mjs
PASS node --check tests/daily-lesson-browser.test.mjs
PASS node --check tests/dialogue-overhaul.test.mjs
PASS node --check tests/form-dialogue-browser.test.mjs
PASS node --check tests/form-lifecycle.test.mjs
PASS node --check tests/full-curriculum.test.mjs
PASS node --check tests/fullscreen-learning-browser.test.mjs
PASS node --check tests/game-state.test.mjs
PASS node --check tests/generated-architecture.test.mjs
PASS node --check tests/generated-dialogue.test.mjs
PASS node --check tests/generated-learning.test.mjs
PASS node --check tests/generation-cache.test.mjs
PASS node --check tests/hills-entrances-browser.test.mjs
PASS node --check tests/hills-expansion-browser.test.mjs
PASS node --check tests/hills-expansion.test.mjs
PASS node --check tests/house-sleep-dream-browser.test.mjs
PASS node --check tests/house-sleep-dream.test.mjs
PASS node --check tests/independent-browser.test.mjs
PASS node --check tests/lesson-cleanup-browser.test.mjs
PASS node --check tests/lesson-progression-fixes-browser.test.mjs
PASS node --check tests/lesson-progression-fixes.test.mjs
PASS node --check tests/location-assessment-browser.test.mjs
PASS node --check tests/locked-guidance-browser.test.mjs
PASS node --check tests/model-fixture.mjs
PASS node --check tests/narrative-feedback.test.mjs
PASS node --check tests/p1-browser.test.mjs
PASS node --check tests/p1-regression.test.mjs
PASS node --check tests/p1-storage.test.mjs
PASS node --check tests/phaser-browser.test.mjs
PASS node --check tests/plural-curriculum.test.mjs
PASS node --check tests/portraits-browser.test.mjs
PASS node --check tests/practical-assessment-browser.test.mjs
PASS node --check tests/practical-assessment.test.mjs
PASS node --check tests/presentation.test.mjs
PASS node --check tests/productive-generation.test.mjs
PASS node --check tests/quest-improvements-browser.test.mjs
PASS node --check tests/quest-improvements.test.mjs
PASS node --check tests/resume-behaviour.test.mjs
PASS node --check tests/rpg-browser.test.mjs
PASS node --check tests/rpg-concurrent-browser.test.mjs
PASS node --check tests/rpg-early-exam-browser.test.mjs
PASS node --check tests/rpg-foundation-browser.test.mjs
PASS node --check tests/rpg-foundation.test.mjs
PASS node --check tests/rpg-maintenance-browser.test.mjs
PASS node --check tests/rpg-movement.test.mjs
PASS node --check tests/rpg-narrative-audit.test.mjs
PASS node --check tests/rpg-overhaul-browser.test.mjs
PASS node --check tests/rpg-persistence.test.mjs
PASS node --check tests/rpg-profile-fixture.mjs
PASS node --check tests/rpg-transitions-browser.test.mjs
PASS node --check tests/rpg-week1-browser.test.mjs
PASS node --check tests/rpg-week1-driver.mjs
PASS node --check tests/rpg-week1.test.mjs
PASS node --check tests/rpg-world.test.mjs
PASS node --check tests/runtime-fixture.mjs
PASS node --check tests/save-fence-browser.test.mjs
PASS node --check tests/school-first-browser.test.mjs
PASS node --check tests/school-first.test.mjs
PASS node --check tests/sleep-conversations-browser.test.mjs
PASS node --check tests/tutorial-profile-browser.test.mjs
PASS node --check tests/tutorial-typing-default-browser.test.mjs
PASS node --check tests/two-column-browser.test.mjs
PASS node --check tests/typing-bilal-browser.test.mjs
PASS node --check tests/typing-bilal.test.mjs
PASS node --check tests/typing-languages-browser.test.mjs
PASS node --check tests/typing-languages.test.mjs
PASS node --check tests/village-redesign-browser.test.mjs
PASS node --check tests/village-redesign.test.mjs
PASS compiled release syntax
PASS node tests/tutorial-typing-default-browser.test.mjs
PASS node tests/typing-languages-browser.test.mjs
PASS node tests/locked-guidance-browser.test.mjs
PASS node tests/form-dialogue-browser.test.mjs
PASS node tests/hills-entrances-browser.test.mjs
PASS node tests/hills-expansion-browser.test.mjs
PASS node tests/school-first-browser.test.mjs
PASS node tests/typing-bilal-browser.test.mjs
PASS node tests/rpg-transitions-browser.test.mjs
PASS node tests/lesson-progression-fixes-browser.test.mjs
PASS node tests/character-names-browser.test.mjs
PASS node tests/character-expansion-browser.test.mjs
PASS node tests/quest-improvements-browser.test.mjs
PASS node tests/sleep-conversations-browser.test.mjs
PASS node tests/assessment-randomness-browser.test.mjs
PASS node tests/location-assessment-browser.test.mjs
PASS node tests/construction-completion-browser.test.mjs
PASS node tests/choice-quality-browser.test.mjs
PASS node tests/approved-flow-browser.test.mjs
PASS node tests/concurrent-save-browser.test.mjs
PASS node tests/audit-teaching-browser.test.mjs
PASS node tests/audit-tabs.test.mjs
PASS node tests/practical-assessment-browser.test.mjs
PASS node tests/narrative-feedback.test.mjs
PASS node tests/p1-browser.test.mjs
PASS node tests/cleanup-browser.test.mjs
PASS node tests/generated-learning.test.mjs
PASS node tests/resume-behaviour.test.mjs
PASS node tests/challenge-disclosure.test.mjs
PASS node tests/independent-browser.test.mjs
PASS node tests/full-curriculum.test.mjs
PASS node tests/phaser-browser.test.mjs
PASS node tests/rpg-concurrent-browser.test.mjs
FAIL node tests/save-fence-browser.test.mjs
PASS node tests/rpg-foundation-browser.test.mjs
PASS node tests/rpg-browser.test.mjs
PASS node tests/rpg-overhaul-browser.test.mjs
PASS node tests/rpg-early-exam-browser.test.mjs
PASS node tests/portraits-browser.test.mjs
PASS node tests/house-sleep-dream-browser.test.mjs
PASS node tests/tutorial-profile-browser.test.mjs
PASS node tests/rpg-maintenance-browser.test.mjs
PASS node tests/daily-flow-browser.test.mjs
PASS node tests/daily-lesson-browser.test.mjs
PASS node tests/two-column-browser.test.mjs
PASS node tests/fullscreen-learning-browser.test.mjs
PASS node tests/lesson-cleanup-browser.test.mjs
PASS node tests/village-redesign-browser.test.mjs
PASS node tests/rpg-week1-browser.test.mjs
```

</details>

