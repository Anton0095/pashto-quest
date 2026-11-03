# Post-merge code audit and maintenance

Baseline: `main` at `63978a5` (PR #32), fetched before creating `maintenance/post-merge-cleanup`. The baseline release and all measurements are identified by SHA-256 in the attached JSON. Audit date: 3 November 2026, Australia/Sydney. No gameplay, vocabulary, grammar, narrative, dependency or reward redesign is included.

## Findings and disposition

| Severity | System | Finding and disposition |
|---|---|---|
| P0 | Runtime/save integrity | No confirmed critical defect found in the baseline automated checks and source audit. This is not a claim of exhaustive platform coverage. |
| P1 | Campaign/education | No confirmed high-severity defect found. Native pronunciation, linguistic naturalness and physical Safari remain outside the available verification environment. |
| P2 | Sleep/story integrity | A supported restored pass could advance while its alternate narrative and ending were still unacknowledged. Reproduced against the frozen baseline: Day 2 advanced to Day 3 with no route/ending flags. Sleep now resolves the existing narrative and uses the chapter director’s completion/next eligibility; grades and XP remain unchanged. |
| P2 | Async lifecycle | A pending home/dream-menu transfer could continue after disposal and call destroyed Phaser objects (`Cannot read properties of undefined (reading 'stop')`). Reproduced by delaying a real world commit. Async continuations now recheck disposal and remove the sleep overlay; already-authorized in-flight persistence is not silently cancelled. |
| P2 | Runtime architecture | The complete superseded DOM navigation renderer was embedded even though production entry points immediately delegated to Phaser. Moved it into the test-only educational navigation fixture; shipped navigation now delegates to the sole Phaser controller. Preserved the fourteen-day educational backend and its regression matrix. |
| P2 | Portrait performance | Every role update recreated both portraits, even with unchanged identities. Retain the image nodes while updating speaker/partner labels. Encode the derived crops as lossless WebP; retain the supplied source screenshots and crop provenance. Every decoded RGBA hash remains equal to the original PNG. |
| P2 | Frame work | Adjacent-actor checks repeatedly resolved all actors, and serialized complete future schedules every frame. Reuse the current frame's resolved actor list for interaction checks and exclude schedule metadata from the body signature. Automatic navigation still reads live occupancy. |
| P2 | Persistence cost | A no-op commit hashed the same snapshot three times. Share promises within that commit only. Revision-head transactions, stale-renderer rejection, pending-write recovery, Web Locks and explicit reset remain mandatory. |
| P2 | Performance tooling | The curriculum benchmark discarded its incoming transformed HTML, restoring production RPG boot and timing out on educational tutorial controls. Preserve the fixture transform. A second probe wrote directly to the coordinated save key and triggered correct conflict protection; move it to a temporary key, await saves and reject any phase with a persistence warning. Rerun the same corrected harness against both frozen releases. Failed/conflicted attempts supply no accepted performance result. |
| P3 | Presentation | Removed the hidden conversation-summary element/writers and unused duplicate-card CSS, unused `showParticipants`, retired preview-board cleanup/factory/reference no-ops and an overwritten completion-summary calculation. Dialogue context now uses the existing shared UI directly. |
| P3 | Lesson snapshots | Removed unused tutorial profile copies from fresh lessons. The player profile remains in canonical progress. Valid older format-7 lesson snapshots may retain those fields; validation accepts and then discards them without losing answers or XP. |
| P3 | Static checks/docs | Removed two unused TypeScript bindings and enabled compiler unused-binding checks. Corrected contradictory tutorial approval and chapter-transition descriptions; labelled historical architecture/expansion checkpoints instead of deleting useful records. The reusable performance report now reads provenance/paths from its inputs and labels asynchronous saves as enqueue timing, rather than repeating a hardcoded historical commit or implying completed I/O. |

## Application architecture and audit coverage

`index.html` is the generated offline application, assembled by `tools/build.py`. `src/app.js` composes the JavaScript educational services and strict TypeScript/Phaser world adapter; `generated/rpg.bundle.js` is a checked build artifact, not another application. No account, API service, dynamic source import or runtime curriculum fetch is required.

| System | Active authority and audit conclusion |
|---|---|
| Scenes, maps and NPCs | `src/rpg/phaser-world.ts` owns the single live Phaser scene, tilemaps, bodies, sensors, camera and tweens. Map transfers destroy old objects/maps/groups. `world-data.ts` validates collision/recovery and `content.ts` resolves current placements/events. House and exterior share the controller, not separate navigation implementations. |
| Movement | `movement.ts` arbitrates keyboard/D-pad and mouse/touch A* routes over the same Phaser stepper. It revalidates occupancy and map permissions. Modal/lesson visibility, blur, hidden documents, cancellation and relocation stop automatic routes and restore the last committed tile. |
| Dialogue/portraits | `content.ts` owns narrative messages; `ui.js` owns instructor, active speaker and response partner. `character-portraits.js` shares identity/texture loading with Phaser. No text or controls are baked into images. Body schedules remain available for identity/interaction; only their redundant serialization is omitted. |
| Activities | `lesson-ui.js`, `challenge-ui.js`, `tutorial-ui.js` and `library-ui.js` retain their meaningful session differences. `question-engine.js` validates answers; `construction-ui.js` owns indexed construction and sentence-level post-submit feedback/audio; `learning.js` applies transactions. No duplicate grading/XP engine was added. |
| Grammar | `sentence-engine.js` and `SENTENCE_FRAMES.json` retain finite feature/semantic constraints, introduced-form and grammar gates, typed negative constraints, lazy candidate display data and deterministic selection. Immutable lexical indexes and eligibility signatures already avoid unnecessary rebuilding. Existing complete-output digest tests remain authoritative; no rules, approved spellings, sentence banks or distractor policy were changed. |
| Vocabulary | `library-engine.js` remains the single acquisition/form/SRS/planning store. Lemmas count once; inflections use separate introduced form IDs. Daily frozen study pools preserve dream content. The 473 approved bases, eighteen fixed phrases, two separately approved onboarding questions, inactive candidates and later-day references remain intact. |
| Campaign | Educational progression owns genuine challenge passes, results, once-only XP and access; `chapters.ts`, `routes.ts` and `story.ts` own registered chapter/narrative eligibility and durable event cursors. Production registers Days 1–7; the educational engine supports fourteen days. Ordinary assessments remain 15 questions/pass 12; the Day 7 examination remains 25/pass 20. |
| Audio | `audio.js` retains one active request/player/utterance with cancellation epochs, delayed Pashto voice discovery, optional recording precedence and explicit fallback status. No recordings are currently bundled. Mocked voice tests establish control flow, not authentic pronunciation. |

Production no longer contains the old DOM navigation implementation. The existing hidden map scaffold and its Library-onboarding setup remain shared fixture/bootstrap markup; removing that scaffold would require a further coordinated fixture extraction. It is not an alternative movement or grading system. No later-day, candidate, linguistic attestation or provenance content was deleted merely because it is absent on Day 1.

Extension points remain data-driven chapter/event/schedule registration, bounded map validation, lexical forms/grammar frames and optional expression/recording manifests. Expanding the world beyond Day 7 still requires reviewed story registration and eligibility checks, not increasing a limit alone.

## Save integrity, sleep and dreams

Educational JSON remains schema **7** under `pashto-quest-rpg-education-v1`; world JSON remains schema **1** under `pashto-quest-rpg-world-v1`. IndexedDB contains hash/revision metadata, not another progress store. No schema bump, prototype migration, silent reset, new storage key or new reward identity was introduced. Unsupported or corrupt educational saves stay untouched pending explicit reset/export. Supported paused tutorial reconciliation remains functional.

The selected world chapter is separate from the pass record. A challenge pass never selects a new world chapter by itself. Bed and Quick Travel invoke the same serialized sleep function, which requires a genuine pass, completed narrative route/ending, chapter-director eligibility and no paused challenge retry. Older supported passes with pending acknowledgements reopen the existing story; they are neither regraded nor rewarded again. A persisted `{from,to}` intent protects interrupted sleep; boot resumes only a valid outstanding source transition and clears an already-applied intent. Transfer saves the destination before opening its narrative, and does not grant XP. No registered next day produces the existing review/explore message.

Dream practice uses the same activity engine with a disposable review clone. The original campaign pointer remains canonical for saving; review-only rewards are zero, challenges cannot launch and the selected campaign chapter is retained. Exit restores canonical progress and the house location. Bookshelf opens the same Library dialog as the toolbar; closing it retains position. No separate vocabulary, Library or SRS implementation was created. Profile submission is explicitly disabled during dreams, keeping global preferences out of the review clone.

Fresh lesson snapshots omit only the unused `profileName`/`profileGender` copies. Older supported snapshots are validated before those copies are discarded. The actual editable player profile, earned XP, response sets, frozen assessments, vocabulary and challenge records remain unchanged.

## Visual inspection

The actual `docs/design/house-interior-reference.png` and rendered [desktop house](../rpg/house/interior-1280.png) were visually inspected, not inferred from filenames. The left bookshelf, right bed, central rug/table/cushions, windows/decorations and bottom entrance remain unchanged by maintenance. Fine shading, exact textile motifs and the mockup's round table are approximated in the established tile art. The mockup's static menu labels are implemented as dynamic dialogs. No claim of pixel-identical reproduction is made.

## Baseline and final verification

Before source changes, `python3 tools/verify.py` passed **166 checks**, including strict TypeScript, JavaScript/release syntax, build consistency, schema/model/language/output contracts and all 28 browser suites. Baseline `npm audit --json` reported **zero vulnerabilities**. The repository has no standalone ESLint/lint script or instrumented line-coverage collector; no lint-pass or line-coverage percentage is invented. An additional unused-binding compiler check identified the two bindings now removed.

The [paired performance report](post-merge/PERFORMANCE.md) and [complete curriculum appendix](post-merge/CURRICULUM_PERFORMANCE.md) record comparable frozen releases, raw samples and limitations. All six corrected curriculum profiles passed their persistence/cache checks in both releases, including sixty successful revision sessions per release. The earlier conflicted diagnostic runs are excluded.

Offline HTML decreased from **5,246,845 to 4,609,414 bytes (12.1%)**; gzip decreased from **2,200,131 to 1,728,591 bytes (21.4%)**. The five lossless crops are 28.4% smaller with identical decoded pixels. In the production diagnostic, actor lookups near NPCs fell from three to one per frame, image creation during 2,000 role updates fell from 4,000 to zero, and twenty unchanged fence commits used twenty digests instead of sixty. Local document-load p50 was 509.5→416.3ms desktop and 1917.2→1560.6ms mobile4x. Transition latency and bounded retained-heap growth were similar; no heap reduction is claimed.

These gains do not establish a speedup for unmodified grammar algorithms. The full appendix contains mixed timing results, including slower cold-generation samples. Candidate pools and seeded output contracts remain unchanged. Shared-host variation prevents a reliable causal conclusion for those latency differences; no universal performance improvement is claimed.

Final `python3 tools/verify.py`: **168 passing checks, zero failures**, including all **29 browser suites**. Both seven-day public RPG routes completed, and the release-bound delivery report was regenerated only after the complete matrix passed. Final release SHA-256: `dac948d2a1e9fecc6dd36bc6c6b1996e35f24e56cf05687a29181f0022aeebaf`.

| Verification | Baseline | Final |
|---|---|---|
| TypeScript, source/release syntax, model/schema/language/output contracts, build consistency | Passed | Passed, with unused TypeScript bindings also rejected |
| Complete verifier | 166 checks passed | 168 checks passed |
| Browser suites | 28 passed | 29 passed |
| Dependency/security audit | 0 vulnerabilities | 0 vulnerabilities; dependencies unchanged |
| Current document links, Python tool compilation, final diff whitespace | Not a baseline acceptance metric | Passed |
| Six-profile paired curriculum benchmark | Inherited tooling defects identified | Corrected harness passes both frozen releases, including every coordinated save |
| Physical iPhone/Safari, hardware audio, other browser engines, exact GPU/allocation peaks | Unmeasured | Unmeasured |
| Standalone lint / instrumented line coverage | Not configured | Not configured; syntax/strict-type checks run, no coverage percentage claimed |

Raw [baseline checks](post-merge/baseline-checks.txt), [final checks](post-merge/final-checks.txt), [baseline dependency audit](post-merge/dependency-before.json) and [final dependency audit](post-merge/dependency-after.json) are retained. New regression cases reproduce the old narrative/sleep and pending-disposal defects; portrait checks compare original decoded pixels and retained node identity; fence checks retain stale no-op rejection while reducing hashing.

The existing suites cover all four tutorial cards, optional profile persistence, every implemented RPG day on normal/early-challenge routes, 15/12 challenges and 25/20 examination failure/retry, unstudied recall, exact question/lesson restoration, one-time rewards, teacher relocation and narrative openings/endings. House tests cover actual entrances/exits, collision, keyboard/pointer/touch, bookshelf/Library position, blocked sleep, consecutive days, duplicate actions, intent recovery/already-advanced saves, available-story bounds and a full isolated dream lesson. The fourteen-day educational matrix covers seven paces and both routes: 392 normal visits and 196 assessments. Concurrent/denied/corrupt-save tests preserve progress, and the four-question tutorial/profile and sentence-romanisation controls remain covered.

Historical maintenance and bounded-prototype screenshots were restored rather than overwritten by incidental test output. The current delivery demonstration and release-bound JSON/Markdown report retain the final run’s actual evidence. No source, dependency or generated release changed after the final verification.

## Remaining technical debt and limits

- Most educational code is intentionally JavaScript behind typed RPG boundaries. A wholesale TypeScript migration or new UI framework would exceed this maintenance task and obscure review.
- Late-day cold generation still enumerates substantial eligible pools. The paired timing distributions are mixed, so a causal latency regression/speedup is inconclusive. Changing the unmodified language engine without a demonstrated algorithmic defect would risk educational correctness. Warm-cache behavior, output identity and pool sizes remain protected by tests.
- Phaser is most of the minified RPG bundle. A custom stripped engine build would add compatibility/testing burden; no dependency replacement or speculative upgrade was justified by the clean dependency audit.
- The fixture/bootstrap map scaffold is retained pending a coordinated HTML/CSS extraction. The obsolete renderer itself no longer ships. Historical bounded-chapter fixtures remain useful extension/resume tests, rather than supported prototype save adapters.
- World and education saves are coordinated separate records; shutdown flush remains best effort. The revision fence protects competing renderers and ambiguous writes, not atomic browser termination.
- Linguistic form/grammar/combination naturalness and device speech quality remain provisional as documented. No approved language or narrative was changed.
- Physical iPhone Safari, hardware touch/audio, other browser engines, GPU frame timing and exact allocation peaks are unmeasured. Chromium mobile viewport/touch emulation and CPU throttling do not establish physical-device behavior. Finite transition runs cannot prove absence of all long-duration memory leaks.
