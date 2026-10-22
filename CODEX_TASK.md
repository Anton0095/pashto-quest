# Codex implementation task — finish Week 1

Implement the **pending requirements** for Pashto Quest's first seven days using the current GitHub repository as the source of truth. Read the other documents in this package before editing the app. `reference/pashto_quest_days_1_5_narrative.html` is a known earlier version with Days 1–5, not an authoritative replacement for GitHub HEAD.

## Implement

1. **Day 6 (new narrative):** normal route begins at Lake/River with Saleha, who introduces her sister Mina. Explicitly teach `I` → `Mina and I` → `we / موږ` and first-person plural present-tense verb morphology, distinguishing speaker-included `we` from addressed-group `you all / تاسې`. After the introductory lesson allow Home, Market and School practice in any order. Five meaningful sentences per site are specified in `WEEK1_CONTENT_BLUEPRINT.md`. The normal-route final challenge is an illustrated/story scene in the **Hills** with Saleha and Mina; it is not a map zone. Fifteen questions, twelve correct to pass.
2. **Day 7 (new narrative):** normal route begins at Market with Edris describing shoppers and groups using `they / هغوی`. Then Home, Lake and School in any order. Final examination at School with Ms Hameed: **25 questions, 20 to pass**, all seven days' pronouns, verb forms, SOV, compounds and meaningful reused vocabulary. This is a special end-of-week event with graduation dialogue, not the old generic 15-question quiz.
3. **Character mobility and dialogue:** add Mina to person registry, avatars and role tags; keep roaming character schedules. Every conversation and question names its actual speaker and intended player addressee (and other participants where relevant); don't imply another character speaks when it is a question prompt authored by Ms Hameed.
4. **XP and title:** replace the existing naive 100-XP-per-level `Town Resident` display with the complete progression contract in `XP_MILESTONE_SPEC.md`. The pass of Day 7's **new** examination unlocks **Level 10 · New Resident**. Earlier status is **Newcomer**, beginning at Level 1. Passing daily assessments alone, with zero optional visits, supplies one-time catch-up XP to the respective floors. Preserve earned optional XP without bypassing milestone-based display caps.
5. **Save compatibility and question engine:** use dynamic length/pass mark; update counters, `Next`, button text, scoring, result text, retries and audio. Add save migration that does not mistake a legacy Day 7 generic clear for passing the new 25-question exam; preserve previous XP and Day 1–6 progress. Repeat clears must not yield repeated milestone XP.
6. **Regression:** Days 1–5 implemented content, Day 2's 20 sentence examples, Day 3 dinner conversation, Day 4 Muhammad Jan conversation, Day 5 lake gathering, the four-zone map, SRS reviews, offline readability and the daily skip affordance all remain working.

## Required delivery from Codex

- Changed app files committed (or a clearly described patch), including tests where the repo supports them.
- Evidence of running the test scenarios in `ACCEPTANCE_TESTS.md`, especially 0-visit minimum-score runs for **all seven days** and a 25-question Day 7 score of exactly 20/25.
- Clear changelog showing implemented versus intentionally deferred items.
- List of Pashto expressions/transliterations needing a local Laghman native speaker's review; note actual audio availability rather than asserting it is included.

## Done when

A fresh player can complete just the tutorial and daily challenges (no optional visits), pass Days 1–6 at 12/15 and Day 7 at 20/25, and be shown **Level 10 · New Resident** only upon the successful new weekly assessment. The same milestone cannot be unlocked early by farming XP, replays or importing an old Day 7 completion flag. The normal Day 6 and Day 7 narrative routes and five-sentence lessons also work.
