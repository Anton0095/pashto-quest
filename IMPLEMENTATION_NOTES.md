# Week 1 implementation

Base: GitHub `main` commit `74b7c7e9e709cfe3ff4029077949b14d33b531bc`.

The pre-edit `index.html` compared identical with `reference/pashto_quest_days_1_5_narrative.html` using `cmp`. The historical reference remains unchanged (SHA-256 `f8798d9ae10d8bf946c0014717ee7b21a630d7f0ae30f3a3040e382d541d9252`). No reference replacement or framework/backend migration was performed.

## Delivered

- Saleha introduces Mina at the Day 6 lake opening. Staged dialogue teaches singular I, a named speaker-included compound subject, we and addressed-group you. Continuing the normal route requires a correct group identification and a first-person plural practice build. Other visits unlock afterward; Skip bypasses the opening immediately.
- Day 6 has five authored sentences at each of the four sites, contextual vocabulary and an illustrated Hills event with 15 first-answer questions, 12 required. Hills is not a map zone.
- Edris opens Day 7 at the market, contrasting customers/sellers, we/you all/they and shared third-person present endings. Two observed-group responses precede ordinary practice. The remaining sites unlock after the market lesson.
- Day 7 has five authored sentences per site and a separate School examination led by Ms Hameed. Its 25 unique items cover five pronoun, five verb-form, five SOV, five compound and five dialogue tasks. Twenty correct answers pass; nineteen do not.
- Dynamic question counters, Next/finish controls, scores, pass thresholds, result/retry text and audio lookup support both lengths. Speaker/response-recipient labels and Mina’s role/portrait remain visible.
- Progression uses 200 XP per nominal level, daily caps/floors, banked XP and Newcomer status. Only the new version-2 exam grants Level 10 and New Resident, with a once-only graduation message. One atomic save stores the pass, bonus, top-up, title eligibility and celebration flag. Replays can award only previously unearned question rewards, never repeated milestone/first-pass rewards.
- Save migration retains XP, SRS, completed visits, question rewards and Days 1–6. It reconciles contiguous historical floors once and retains old generic Day 7 results separately. The revised exam must be passed to graduate. Missing save fields and malformed numeric XP are normalized.
- All original 230 records and Days 1–5 course assignments are preserved. New lessons/assessment records have stable IDs; no existing ID/audio filename is renamed. Day 2 retains five sentence examples at every site. The four-zone map, skip controls, tutorial, review and offline text runtime remain.

## Verification

Commands and detailed coverage: `tests/README.md`. The application suite tests the actual inline runtime, not only the supplied fixture. It uses Chromium at 1280px and 390px and separately tests the pure milestone/migration functions against fixture expectations.

Mandatory zero-visit trace at both widths (first attempt per day, minimum passing scores):

| Day | Score | XP | Level | Title |
|---|---|---:|---:|---|
| 1 | 12/15 | 200 | 2 | Newcomer |
| 2 | 12/15 | 400 | 3 | Newcomer |
| 3 | 12/15 | 600 | 4 | Newcomer |
| 4 | 12/15 | 800 | 5 | Newcomer |
| 5 | 12/15 | 1,200 | 7 | Newcomer |
| 6 | 12/15 | 1,600 | 9 | Newcomer |
| 7 | 20/25 | 1,800 | 10 | New Resident |

Additional coverage includes all 28 normal lessons at both widths, all seven final scenes, grading boundaries, first-answer locking, idempotent replays, reload after every checkpoint, legacy 15-question Day 7 clears, 19/25 failure followed by 20/25 success, banked-XP caps, incomplete/malformed save fields, Memory Trail, missing audio, RTL, four map markers and viewport overflow. Screenshots of Hills/exam screens were visually inspected. Native linguistic accuracy is not established by automated answer selection.

Final execution: `node tests/check_handoff.mjs` passed fixture/document checks; `node tests/week1.test.mjs` passed **12 test groups**, including four full desktop/mobile gameplay contexts and a separate offline smoke context. Direct local-file navigation was explicitly **skipped** because Chromium returned `ERR_BLOCKED_BY_ADMINISTRATOR`; it is not counted as a pass. `git diff --check` passed.

Tested runtime SHA-256: `df058f9b3094708261a73e872477eb06f6e2e052cf4b90606e006c351866c2b9`.

## Remaining limitations and deferred work

- Native Laghman review remains necessary. `LANGUAGE_REVIEW.md` lists the added IDs and specific expressions/romanisations requiring review.
- No MP3 recordings are bundled. Missing audio reports unavailability; only an actual Pashto browser voice can act as fallback. No Laghman voice certification is claimed.
- Canonical sentence tile order remains required. Equivalent written pronouns `مونږ/موږ` and `تاسو/تاسې` normalize without collapsing person-specific verb forms; unrestricted alternate word orders are not approved.
- The pre-existing duplicate `a-clean` ID is retained to avoid silently changing Days 1–5 save/audio identity. A deliberate separate migration is still needed to disambiguate it.
- Managed Chromium blocks direct local `file://` navigation in this environment. Offline interaction is checked after delivery of the unmodified static page. Actual iPhone file opening, persistent storage and available Pashto voices require device testing.
- Week 2, additional map zones, accounts/backend persistence and new tense paradigms are not implemented.
