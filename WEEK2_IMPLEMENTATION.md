# Week 2 implementation and verification

## Basis and scope

Started on `codex/week2-development` from uploaded `feature/week2` commit `76c6c75`, whose parent includes the completed Week 1 merge on `main` (`15102d1`). Its game matches the completed Week 1 blob `52f32000fda071676f88fbf2a4a4468f66ac3f0f` from `23850c7`. No older HTML reference was substituted. No force-push or direct change to `main` is part of this delivery.

**Status: implemented development preview, language review pending.** All new content remains explicitly draft. The original content package has only 35 model phrases; it is not described as 140 verified translations. The separate runtime bank now provides authored drafts for all 140 targets and 48 contextual NPC-question replies, with review metadata and approximate romanization for lesson cards.

## Changes

- Applied the supplied interaction patch first, inspected the preview diff, then integrated it. Fixed the tile renderer's remaining construct-only guard so dialogue banks actually render.
- Added indexed answer/dud tile banks, unused-tile submission, Undo/Clear/removal, first-submission locking, response feedback, scoped equivalent-answer support and once-per-day/question dialogue XP keys. No unreviewed alternatives are enabled.
- Added large isolated RTL Pashto to mixed prompts/choices and feedback using text nodes, while English remains normal size. The final Week 2 exam's English gloss is less prominent.
- Integrated all Days 8–14: demonstratives, plurals/counts, locations, possession, question words, adverbs and cumulative village review. Each day has its named opening, contextual vocabulary, four five-sentence lessons, moving participants and an immediate Skip route. No inventory or additional map locations were added.
- Daily challenges contain 15 turns/12 required; Day 14 contains 25/20. Dialogue reply counts are **4, 5, 6, 6, 7, 8, 12**, mixed with recall, recognition and guided constructions with duds.
- Day 8 requires legitimate Week 1 completion. Existing save key, XP, SRS, visits, challenge rewards and graduation state are retained. Days 8–14 never invoke Week 1 floors or first-pass bonuses. Existing answer/lesson rewards are banked while Level 10 · New Resident remains capped; a separate unapproved XP proposal is documented.
- Added editable `content/WEEK2_RUNTIME.json` and a repeatable offline embedding/check tool. Browsers require only `index.html`, never JSON fetches or a backend.

## Executed validation

- `python3 patch/test_patch.py`: passed supplied patch-fixture, JavaScript syntax, tile and response-normalization checks.
- `node --check /tmp/pashto-week2-full.js`: extracted full app scripts parsed successfully.
- `python3 tools/embed_week2.py --check`: passed; embedded data matches the editable bank.
- `node tests/check_handoff.mjs`: passed original fixture/document checks; this is not substituted for gameplay testing.
- `node tests/week1.test.mjs`: **12 test groups passed**, including fresh minimum-score skip-only progression, all normal lessons at desktop/mobile widths, migration, replay rewards, scoring boundaries, SRS, safe unavailable audio and offline interaction. Direct `file://` navigation was explicitly skipped because managed Chromium blocks it.
- `node tests/week2.test.mjs`: **passed** content/baseline tests and both **1280px / 375px** browser runs. Each run covers all seven minimum-score skip-only days, 11/15 and 19/25 failures followed by valid retries, reloads, replays, every normal lesson, four map markers, explicit teachers/recipients, duplicated answer words, unused duds, tile edits, first-word RTL placement, overflow, text-only mixed-script rendering and offline replies. The old Week 1 flags and Level 10 title remain intact.
- The completed Week 1 words/courses/loops hash matches its saved baseline; original cards and lesson assignments are unchanged. The existing `a-clean` collision was not silently renamed.
- `git diff --check`: passed.

Screenshots captured from the final browser tests: [desktop Week 2 exam](qa/week2-desktop.png), [375px dialogue and dud tiles](qa/week2-mobile.png). Chromium viewport testing is not an actual iPhone/Safari test.

## Remaining review and intentional deferrals

Qualified Laghman review, including spelling, inflection, naturalness, romanization, distractors and valid alternative responses, is still required before calling this a production-quality language release. See [review inventory](content/WEEK2_REVIEW.md). No native sign-off or audio recordings are included or claimed. Real-device local-file/storage/TTS behaviour remains unverified.

No Week 2 level/title schedule is activated. [The separate XP proposal](content/WEEK2_XP_PROPOSAL.md) is a design option for later approval, not implemented behaviour. No Week 3, inventory, new map node, login or backend was introduced.

Tested standalone runtime SHA-256: `9846621c36096ba44e915cacb5dcb2c713be91c41c15a70b0d3dc46932cb5ca9`.

## Publication

The implementation is published on `codex/week2-development`. Automatic draft PR creation targeting `main` was attempted with `gh pr create --draft` and blocked by `Post https://api.github.com/graphql: Forbidden`; a read-only repository API request was also denied. Git push succeeds, but available API access does not permit opening the PR in this environment. `main` is unchanged and no force-push was used.

[Open the comparison / PR form](https://github.com/Anton0095/pashto-quest/compare/main...codex/week2-development?expand=1). The title and complete proposed description are in [PULL_REQUEST_WEEK2.md](PULL_REQUEST_WEEK2.md).
