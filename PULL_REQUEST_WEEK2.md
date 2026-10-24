# Add Week 2 draft lessons, dialogue replies and progression

The uploaded Week 2 package was not connected to the playable game. This integrates Days 8–14 on the completed Week 1 baseline: 140 authored draft sentence cards with romanization, contextual vocabulary and 48 NPC question/reply puzzles, mixed with recognition and guided construction.

Apply the supplied interaction patch, fix its construct-only tile-renderer guard, allow unused dud tiles and indexed duplicate words, and render mixed Pashto/English safely at readable sizes. Keep immediate skipping, all four map locations, existing saves, Level 10/New Resident and Week 1 graduation. Week 2 has no new level schedule or milestone bonuses; a separate unapproved XP proposal is included.

### Validation

- Supplied patch tests, full-app JavaScript parsing, embedding parity and package checks passed.
- Week 1: 12 test groups passed, including fresh minimum-score skip-only progression, normal routes and save/XP regression checks.
- Week 2: content/baseline tests and full browser flows passed at 1280px and 375px, covering all 28 lessons, all seven minimum-score skip-only challenges, failure/retry, replay, RTL/dud tiles, save/title preservation and offline replies.
- Screenshots: [desktop](https://github.com/Anton0095/pashto-quest/blob/codex/week2-development/qa/week2-desktop.png), [mobile](https://github.com/Anton0095/pashto-quest/blob/codex/week2-development/qa/week2-mobile.png).

### Review before release

This is a development preview. Every new Pashto item remains needs_native_review; no local speaker sign-off, verified alternate response or audio recording is claimed. See content/WEEK2_REVIEW.md. Direct file navigation is blocked by managed Chromium policy; real-device iPhone file/storage/TTS validation remains outstanding. WEEK2_IMPLEMENTATION.md records the baseline, implementation and tests.
