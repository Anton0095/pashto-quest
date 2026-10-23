# Codex task — Pashto Quest Week 2 (Days 8–14)

**Target repository:** `Anton0095/pashto-quest` (private)
**Starting point:** `codex/complete-week1-23850c7` has the Day 6 hills / Day 7 end-of-week work. Its `index.html` blob was `52f32000fda071676f88fbf2a4a4468f66ac3f0f` when inspected on 23 October 2026. **DO NOT base Week 2 on `main` while it lacks these updates.** Compare current branch content first; if Week 1 has since been merged, use newer `main`. Do not force-push or overwrite more recent changes.

## User-approved objectives

1. **New interactive question format from Day 8:** NPC asks a meaningful Pashto question addressed to the player; player builds the answer, not a translation of a displayed declarative sentence. For example, Saleha beside the lake asks **ته څه څښې؟** (What do you drink?) and the expected starter reply is **زه اوبه څښم.** (I drink water). Make speaker and addressee unambiguous. Questions should logically support their expected answer; avoid open questions with several equally plausible answers unless alternatives are explicitly accepted.
2. **Dud/distractor Pashto tiles from Day 8:** Each dialogue question and any optional Day 8+ `construct` question may have the required answer tiles plus at least two extra plausible tokens; do NOT force all visible tiles to be selected. The correct answer must omit distractors, including when a classic Day 8+ construction question has a `duds` array. Some distractors should test conjugation (`څښم` vs `څښې`), number or demonstratives, not merely irrelevant nouns. The selection can be undone or cleared before Check; only the *first submitted answer* counts. Keep duplicate word instances distinct by index. Correct score checks the selected ordered words after harmless punctuation/spacing normalization, with an allowlist for truly equivalent answers.
3. **Readable Pashto at EVERY quiz surface:** Display Pashto in mixed English/Pashto question stems and choice buttons in large legible Arabic-script type, visually comparable to previous large question text. Respect RTL, preserve large touch targets and wrapping on phones. No innerHTML insertion from user/content strings. Keep English at normal size.
4. **Integrate the approved Week 2 lesson plan** from `content/WEEK2_LESSON_DATA.json` and `content/WEEK2_DETAILED_LESSONS.md`. Day 8–14 topics: demonstratives; plurals; location; ownership; question words; adverbs; cumulative scavenger-hunt review. A story opening at the specified location is compulsory *on the normal path*, but **Skip to Final Challenge** is always available from the start of each day. Four explorable locations only. Day 8–13: 4 locations × five contextual sentences, 15-question daily assessment at 12/15. Day 14: 25 questions at 20/25. Preserve dialogue labels and moving villagers from Day 5. No new inventory/game-map mechanics; scavenger hunt is a dialogue/quiz narrative.
5. **Preserve Week 1 and XP milestones:** Keep Newcomer → New Resident at Level 10 after passing Ms Hameed's Week 1 exam, *including skip-only Day 1–7*. Unlock Day 8 only with valid Week 1 completion. Week 2 XP progression is **not yet agreed**; prevent incorrect weekly graduation resets, collisions or retroactive title loss. Propose Week 2 level schedule separately rather than inventing one.
6. **Language accuracy:** Target spoken Pashto in Laghman, Afghanistan. Keep standard spelling, mark uncertain variants for native review, never fake native audio. English semantic targets are authoritative; draft Pashto models are **NOT locally verified**. Before enabling a new day as a production-quality lesson, complete and linguistically review its Pashto, romanization and plausible distractors. Do not silently present 140 English sentence targets as 140 translated/verified Pashto sentences.

## Patch to apply first

The patcher `apply_week2_interactions.py` targets the Codex Week 1 HTML and adds:
- `kind: 'dialogue'` question rendering, tile-bank generation and scoring/feedback, with optional `acceptedPs`;
- `duds` tokens with no requirement to consume every tile;
- large Pashto glyphs in mixed-language prompts and choices;
- safety and existing score/XP compatibility using new deduplication key `week2-dialogue:<day>:<question_id>`.

Run in the repository root:

```bash
python3 patch/apply_week2_interactions.py index.html --output index.week2-preview.html
# Inspect diff, test, then write in place only when satisfied:
python3 patch/apply_week2_interactions.py index.html --in-place
```

Patcher has strict anchors and aborts without touching the input if source differs. If the source has moved, manually port the same functionality instead of forcing blind replacement. Do NOT commit generated `.bak` backups. To use dialogue questions, extend the application's `selectChallenge(day)` to include `kind:'dialogue'` objects sourced from the reviewed content. `examples/week2_dialogue_examples.json` shows the schema; its 12 *illustrative, unverified* questions are **not** a full production question pool. Only mark a question active after checking the Pashto and context.

## Design decision: mixed exercise types

Retain word recall, Pashto recognition, sentence recall and classic guided sentence construction alongside conversational responding. Grow the proportion of dialogue items across Week 2:

| Day | Minimum interactive replies in 15-question daily challenge |
|---|---:|
| 8 | 4 |
| 9 | 5 |
| 10 | 6 |
| 11 | 6 |
| 12 | 7 |
| 13 | 8 |
| 14 | At least 12 of the 25 questions |

For early Week 2 the English question gloss can be visible as a scaffold. It should become less prominent later, especially in the Day 14 cumulative assessment. Use optional hint affordance only if it reuses an existing pattern; no dependence on a new hint system. Each dialogue question should be a valid answer to what that NPC actually asks; do not simply rename translation cards to 'conversations'.

## Week 2 narrative flow (implement in full)

| Day | Mandatory opening on normal route | Four-place context | Challenge narrative |
|---|---|---|---|
| 8 | Saleha at the Lake: near/far this/that | Lake objects; Market produce; School books; Home doors | Saleha asks what the player points to |
| 9 | Edris at Market: plural nouns, small counts | Produce, classroom books, fish/birds, household items | Edris's stock-taking conversation |
| 10 | Mina by Lake: missing notebook, here/there/where | Places described around all four zones | Help Mina locate her notebook through dialogue |
| 11 | Muhammad Jan at Home: whose/my/your/our | Identify owner of familiar objects | Return belongings through conversation |
| 12 | Ms Hameed at School: who/what/which/where/how many | Ask NPCs practical questions | Classroom interview / questions and replies |
| 13 | Saleha & Mina at Lake: today/quickly/slowly/always/sometimes/together | Contextual everyday routines | Discuss activities with the sisters |
| 14 | Muhammad Jan at Home: revision hunt | Four established zones, dialogue-based clues | Ms Hameed's 25-turn Week 2 examination, 20 required |

Use the `lesson_data` JSON fields (day, opening, locations, grammar, models) to author actual lessons. Keep game content separate from implementation where practical, but preserve the offline single-file deployment. Save keys must remain backwards compatible. Avoid introducing an extra explorable Hills or scavenger-hunt map location.

## Acceptance criteria

- See `ACCEPTANCE_TESTS.md`.
- New source browser preview works offline on desktop/mobile; no network needed for text and quiz (pronunciation as currently available).
- Existing Week 1 day 1–7 normal and skip-only paths and XP milestones still work.
- No changes pushed to repository `main` without review. If working in branch, open a PR against `main` only after Week 1 basis is reconciled; otherwise PR into the correct ancestor.
- Report exact files, tests run, screenshots and any remaining linguistically unverified Pashto expressions.
