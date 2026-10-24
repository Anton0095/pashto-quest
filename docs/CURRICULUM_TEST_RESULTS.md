# Curriculum verification — 24 October 2026

## Scope and evidence

Started from audio branch `6fbc876`, with all existing audio restoration commits retained. The complete verification command is `python3 tools/verify.py`, including all six browser suites; quick checks alone are not the release evidence.

The first full development run completed **exit 0**, with logs at `/tmp/pashto-quest-checks-ujiys96x` and aggregate output `/tmp/curriculum-full-verification.log`. Subsequent full development replays also passed, including `/tmp/curriculum-release-verification.log` (`/tmp/pashto-quest-checks-4z7l51x0`) and `/tmp/curriculum-final-verification.log` (`/tmp/pashto-quest-checks-lj9ecd0n`). The final publication run is `/tmp/curriculum-publish-verification.log` (`/tmp/pashto-quest-checks-k3xq68lb`); its observed completion status is recorded below before publication.

| Check | Result |
|---|---|
| Standalone build parity and compiled JS syntax | PASS |
| Editable JS/tool/test syntax | PASS |
| Generated district inventory parity | PASS |
| Existing current-model, identity/form/SRS, XP and curriculum contract | PASS |
| Exact candidate selection, universal vocabulary, Day 1 guard, hypothetical capacity and phrase persistence model tests | PASS |
| Python language/classification/duplicate/phrase activation gates | PASS — 7 tests |
| Inherited audio regression tests plus new expression IDs, neural/delayed voice selection, warnings and cancellation | PASS — mocked APIs |
| Independent public UI at desktop/mobile, study scaffolds, XP/reload, review, incompatible/corrupt saves and offline-after-delivery | PASS |
| Detailed Week 1 normal/skip, all openings, thresholds, Hills, graduation and saved attempts | PASS |
| Detailed Week 2 grammar/dialogue, dud tiles, first-answer scoring, thresholds and saved attempts | PASS |
| Detailed Library vocabulary/pace/forms/grammar/reference/reload/offline | PASS |
| Fourteen-day matrix across all seven settings, normal and skip | PASS — 14 profiles, 392 normal visits, 196 assessments |
| New narrative browser suite at 1280px and 375px | PASS — all seven Day 1 settings, four contextual slots, every daily speaker/skip, visible active expressions, phrase recognition/SRS/reload, universal tab, real Day 2 action forms, unsafe older prompt restore, no unseen greeting acquisition, zero Memory Trail expression XP |
| Immutable content audit against audio-branch source | PASS — all 127 lemma IDs and all 223 complete form records retained unchanged; authored card meaning/IDs remain covered by the existing contract |
| Whitespace/diff checks | PASS |

Supplemental final checks: `node tests/narrative-greetings.test.mjs` (`/tmp/narrative-complete-state.log`), `python3 tools/verify.py --quick` (`/tmp/curriculum-final-model-checks.log`), `python3 tools/build.py --check`, `node tools/district-inventory.mjs --check` and `git diff --check`. The quick run is additional evidence and explicitly excludes browsers; it does not replace the full runs.

## Real playable inventory and observed gaps

There are **99 playable draft district lemmas**, plus **28 universal lemmas**, with **301 selected additions inactive** (78/73/71/79). None of the original 360 English candidates has become playable. Existing language is not certified native-approved.

The browser matrix reports assignments separately from learning/exposure. The table is actual in-browser normal/skip behaviour with the current default seed. It includes real lesson/grammar exposure and assessment selection, rather than treating the inventory tool's representative story-requirement simulation as identical to every UI route.

| Pace | Normal assigned / unfilled | First normal gap | Skip assigned / unfilled | First skip gap |
|---|---:|---:|---:|---:|
| 0 | 0 / 0 | None | 0 / 0 | None |
| 4 | 34 / 18 | Day 8 | 50 / 2 | Day 12 |
| 8 | 46 / 58 | Day 6 | 60 / 44 | Day 8 |
| 12 | 53 / 103 | Day 5 | 67 / 89 | Day 6 |
| 16 | 62 / 146 | Day 4 | 71 / 137 | Day 5 |
| 20 | 68 / 192 | Day 4 | 76 / 184 | Day 4 |
| 24 | 75 / 237 | Day 4 | 81 / 231 | Day 4 |

Every Day 1 maximum plan has **24 distinct nouns/adjectives, six per district**. Day 14 always has zero compulsory assigned lemmas. Completing every story/exam remains possible at every setting despite these explicit supply gaps; no duplicate or untranslated candidate is counted as a new Pashto lemma.

The theoretical current shortage for 312 assignments is at least **213** (312 − 99), before incidental/reservation/district constraints. The browser's normal route actually leaves **237** scheduled introductions unfilled, and the skip route **231**. This is why the release does not claim sustained intensive pacing is supported.

The separate identity-only projection assumes all 301 selected additions become distinct, complete, approved entries. It schedules all **312** introductions with **375** distinct content identities encountered including the declared fixed story requirements. This is a planner projection, not linguistic verification or an activation of missing Pashto. The synthetic boundary test independently checks 22 incidental entries per district; 23 each yields exactly four missing introductions and would require one additional reviewed entry per district.

## First-encounter, duplicate and save safeguards

- Universal reclassification retains stable IDs/forms and existing acquisition/SRS records. Universal/phrase/inflection identities never enter the district quota pool. One global lemma identity prevents cross-district duplicate-new counts.
- Frozen safe assignments remain stable. Older schema-4 universal/Day 1 action assignments are excluded from teaching without deleting history. Unsafe saved questions are replaced while preserving score, first-answer lock and XP.
- Phrase acquisition occurs only when actual active dialogue is rendered. Pending English-only slots, plans and reference target records never mark Pashto acquired. Reload restores active assessments before any hidden map opening can acquire an unseen greeting.
- Character quotes, pronunciation and optional recognition share one phrase ID. First visible exposure creates an unpractised stage-zero/due-now unit, so skipping optional recognition still leaves the phrase available for later review. Phrase progress uses the existing scheduler and survives reload. Repeated dialogue and Library/Memory Trail phrase practice award zero expression XP; original tutorial rewards and existing lexical review remain intact.

## Findings corrected during implementation

The inherited audio branch's older Week 1 browser assertion still waited for a pre-restoration exact missing-audio message. The initial run timed out there after the gameplay assertions passed. Browser assertions now check actual explicit fallback/error warnings; deterministic audio tests separately verify Pashto voice selection and rejection of unrelated languages. No pronunciation success is inferred from merely attempting speech.

New test development also caught case-transform and absent-optional-container assumptions in the test assertions; these were corrected without weakening curriculum checks. Visual inspection found the lesson guide's paragraph style making nested Pashto too small at 375px. An explicit dialogue Pashto size override fixes it. First-encounter testing prompted the restore-before-opening fix, and review testing guards against expression XP in Memory Trail and verifies encountered-but-unpractised phrases remain queued. Escape cancellation tests wait for the browser’s asynchronous native dialog close event; an immediate assertion was timing-dependent and was corrected to wait for the actual event.

## Untested or blocked

- **Linguistic:** 301 selected district additions, 40 universal semantic targets, three Day 1 Pashto expressions and twelve later daily expressions still require translation/identity/grammatical review. All new and existing active language still requires native Laghman review. Welcome and Good morning are only provisionally active from the user's exact supplied wording.
- **Source verification:** the request is recorded as the supplied wording's provenance. An exact independent bibliographic citation for Good morning was not provided; external phrasebook requests were blocked by HTTP proxy 403. No fabricated citation or native approval is recorded.
- **Devices:** no physical Windows device or iPhone Safari was tested. Mocked Windows-style neural voice selection and desktop/mobile Chromium do not establish native-device pronunciation compatibility.
- **Audio assets:** no verified MP3 pack is bundled. Selection and failed-file fallback are automated tests, not verification of a recording's pronunciation.
- **Offline:** offline-after-delivery passes. Managed Chromium can block direct `file://`; that test skip is reported separately from a game failure.
- **Preview hosting:** local generated-release playback is tested. The external raw.githack preview host cannot be verified from this environment because the proxy returns 403; opening the committed `index.html` locally remains available.

Final publication run: **PASS, exit 0**, `python3 tools/verify.py`; all six browser suites and all model/audio/activation/syntax/parity checks completed. Aggregate log: `/tmp/curriculum-publish-verification.log`; individual logs: `/tmp/pashto-quest-checks-k3xq68lb`. The final real-browser assignment/gap matrix matches the table above.
