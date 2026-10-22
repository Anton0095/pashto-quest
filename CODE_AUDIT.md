# Code audit of reference game (Days 1–5 version)

**Reference file:** `reference/pashto_quest_days_1_5_narrative.html`, 162,074 bytes. Search by **function name**, not source line numbers: GitHub HEAD may differ.

The app is a self-contained HTML file with `GAME_DATA` (word objects with IDs; per-day `courses`, `loops`, `zones`) and client-side JavaScript. Progress is stored under `pashto-town-days-v1` in localStorage. Existing Days 1–5 and the skip button are present in this reference. The pending content/milestone work is not.

## Critical functions to change

| Existing function / data | Current behavior | Required change |
|---|---|---|
| `GAME_DATA.loops` and `GAME_DATA.courses` | Day 6 `we`, Day 7 `they` have generic lessons; some basic words already included | Retain and extend; use stable IDs and five relevant sentence targets per Day 6 and 7 location. Ensure any new words are mapped to correct course and week. |
| `villagePeople`, `peopleByName`, `peopleAt`, `roamingTeachers`, `teacherFor`, `setSpeaker`, `setDialogueSpeaker`, `showParticipants` | Four original NPCs; Day 5+ roaming partially implemented | Register Mina and her role; Day 6 lake opening with sisters; Day 7 market Edris. Make named speaker/addressee context accurate for all lesson/challenge turns. |
| `advancedScenes`, `dayGuidance`, `placeAccessible`, `navigatePlace` | Day 6/7 have generic open routes; Day 2–5 have normal-path gates | Make Lake first for Day 6, Market first for Day 7; other three places in free order after opening. Maintain immediate Skip. Hills belongs only to challenge scene, not `zones`/`zoneKeys`. |
| `dayCheckInReady`, `renderDayChallenge`, `renderSkipDayAction`, `renderWorld`, `townStories` | Day 6/7 generic 15-question descriptions | Specialized Hills and Ms Hameed exam descriptions, actor/context, challenge count, score and journey. |
| `specialDayChallenge`, `selectChallenge` | Special curated Day 4/5 (and Day 3); Day 6/7 fall back to generic 15-question set | Day 6 stable, contextual 15 questions and Day 7 distinct 25 question weekly set. No nonsense phrases; validate IDs, counts, variants and difficulty. |
| `startChallenge`, `showChallengeQuestion`, `nextQuestion`, `finishChallenge` | Hard-coded **15**, **12** and end index **14** in various paths | Dynamic `questions.length`, passing requirement `day===7 ? 20 : 12`, result summaries, buttons and repeat logic; preserve first-answer grading. |
| `finishChallenge`, `progress.challengeRewards` | New challenge pass +75 XP once; correct first-time question +5 XP | Retain optional existing rewards or rework consistently; add **one-time checkpoint catch-up XP** floors, Day 7 exam-version flag and title grant; no repeated XP farm. |
| `fresh`, `load`, `save`, `passedChallenge`, `allowed`, `allDone` | Older unversioned progress and `challenges['7']` passed flag | Add migration and explicit new exam-v2 passed state, preserve legitimate old clears Days 1–6. Do not graduate a legacy Day 7 15-question save. |
| `hud`, `finish`, `session.initialLevel` | 100 XP/level and `Level X · Town Resident` immediately | Use 200-XP thresholds, day caps, Newcomer/New Resident, accurately rendered banked XP, and milestone/level-up messaging. |
| `speak` | Attempts `audio/<id>.mp3` and browser Pashto voices | New words need speaker controls and verified pronunciation fallback. Don't claim a native recording exists. |

## Existing source constraints

- `zoneKeys` is `['house','river','market','school']`: must remain **four** entries. The lake is represented by the internal ID `river`. Use **Hills** as narrative `challengeScene`, not a zone.
- `completeRound(day)` checks the four daily lesson flags. Day 6/7 normal challenge after visits should use their own challenge action, not a fifth lesson or permanent extra requirement.
- `startWorld()` and the normal route must never automatically launch an introductory lesson before the user can choose Skip.
- `nextQuestion()` currently uses `session.index < 15` and `showChallengeQuestion()` uses `session.index === 14` for button text; these will break the extended exam if not refactored.
- Day 5 choice questions can award **zero question XP**; the daily milestone top-up must therefore be independent of question type, score mix and lesson attendance.
- The existing `makeChallengeChoices()` can show potentially equivalent sentence translations among distractors. Validate alternatives; don't penalize natural accepted regional forms.
- A Day 7 legacy `progress.challenges['7'].passed` is potentially present. `allDone` and all final status logic need version-aware graduation checks.
- User progress survives through `localStorage`; schema migration should be idempotent and should not require reset.
- Current HTML links to online reference pages, but core reading/quiz logic should remain functional offline. Audio is conditional on a local MP3 or installed Pashto TTS voice.

## Suggested code architecture (not a rewrite mandate)

1. `getChallengeSpec(day) → {questionCount, passCount, scene, title, leadingCharacter}` and render all state from `questions.length`.
2. `getCharacterStatus(progress)` as a pure function with testable XP thresholds, contiguous cleared-day cap and graduation.
3. `completeChallengeOnce(progress, day, score, examVersion)` as a well-tested atomic mutation: records pass, first-pass bonus, one-time top-up, unlock, graduation.
4. An authored `challengeScript[day]` with speaker/recipient/participants, rather than trying to infer every interlocutor from the four fixed locations.
5. A separate Day 6 Hills scene and Day 7 school graduation panel using existing styling, not a new permanent map route.

Do not change older save data on disk or reset localStorage in order to make tests pass; test with fresh and migrated profiles separately.
