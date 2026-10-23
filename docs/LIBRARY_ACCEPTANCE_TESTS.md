# Library & vocabulary engine — Codex acceptance / regression contract

**Applies to working code after implementation.** These are required tests, NOT results from the documentation-only handover. Do not report as passed unless executed.

| ID | Scenario / steps | Required outcome |
|---|---|---|
| LIB-01 | Fresh game launches, before tutorial | Library accessible; acquired content-lemma bank empty; four existing teaching locations remain on map; empty states work |
| LIB-02 | Open Library several times each day including before finishing visits | Does not increment visits, complete a lesson, grant XP or end a day; state persists |
| LIB-03 | New game greeting tutorial | Starts with Muhammad Jan at Library, preserves four greetings and progress flag; pace choice stored; Skip available only when tutorial finished |
| LIB-04 | Select 8/12/16/20/24 pace | Per location exactly 2/3/4/5/6 **new distinct lemma IDs** among completed locations; daily target and displayed figures agree |
| LIB-05 | Seven fully normal standard days with adequate curated lexicon | 20 new unique content lemmas scheduled daily; 140 distinct new content lemmas after all four lessons each day, excluding separate greeting phrases; never count inflected forms twice |
| LIB-06 | Same verb taught as I see / you see / he sees | One lemma in bank; forms are separate and visible only after encountered; grammar practice not counted as three new vocabulary words |
| LIB-07 | Noun singular/plural and adjective agreement variations | Remain same counted lemma; real lexical derivatives/homonyms with separate approved IDs not collapsed by English gloss |
| LIB-08 | Complete only Market then Skip that day's challenge | No Home/Lake/School visit or scheduled words silently marked learned; encounter status arises only from displayed challenge items/actual answers |
| LIB-09 | Day 1 tutorial then immediate skip, pass 12/15 | Muhammad Jan's Library challenge awards house and first-pass XP exactly once; Day 2 unlocks; 0 daily teaching visits valid |
| LIB-10 | Fail Day 1 at 11/15; then retry and succeed | No house before success; home awarded once after pass; no double pass XP/rewards |
| LIB-11 | Fresh player first enters Home before Day 1 home award | Home is explorable as Muhammad Jan's residence/showing, not erroneously shown as owned by player |
| LIB-12 | Day 1 first pass on normal route | Home becomes player's residence, with later narrative retained; Muhammad Jan still appears in proper stories |
| LIB-13 | Pace changed after one or more daily locations | Already generated and completed day content unchanged; new pace applies to next unstarted day only; UI says when |
| LIB-14 | Refresh midway through lesson/day or replay lesson | Same ordered assignment and wording; no reroll, missing entries, or duplicate vocabulary/XP credit |
| LIB-15 | Open learned lexeme card | Shows Pashto, romanisation, English, part of speech, encountered forms, reviewed examples and available audio; view alone earns no practice/mastery |
| LIB-16 | Learn/practise/master words with several forms | Status correctly progresses based on actual attempts/SRS; counts are by distinct lemma IDs and persist |
| LIB-17 | Grammar Journal after Day 3 normal lessons | Only actually encountered rules accessible (SOV, first person etc. as legitimately taught); unearned future grammar hidden/locked |
| LIB-18 | Immediate Skip across Days 2–14 | Challenge playable even from empty/limited acquired bank; does not fake four visits or all vocab; proper challenge source tracking |
| LIB-19 | Legacy save after genuine Day 1 pass | `homeGranted` migrated true without replay/re-award; old tutorial, XP, SRS and completed days preserved |
| LIB-20 | Legacy save Day 1 tutorial done but challenge unpassed | No forced replay of greetings; new home-award challenge remains possible; legacy completed locations retained |
| LIB-21 | Legacy save completed Days 1–14 or Week 1 graduate | Existing XP, title gate, `week1ExamPassed`, challenge rewards, SRS and saved lessons unchanged; default future pace 20 |
| LIB-22 | Existing Week 1 milestone and Week 2 completion tests | Level caps, Day 7 Week 1 graduation, Day 8–14 question types and Week 2 capped title survive |
| LIB-23 | Day 7 or Day 14 quiz | Exactly 25 items/20 to pass; other regular days exactly 15/12; question counter, tile response and grading correct |
| LIB-24 | Insufficient human-reviewed content for 24/day | UI blocks unsupported pace or reports supported alternative accurately; no fabricated Pashto, disguised repetition or false counts |
| LIB-25 | Open on 375px mobile and 1280px desktop, keyboard navigation | Five map options visible and usable, library cards expandable, Pashto RTL readable, controls/touch focus accessible |
| LIB-26 | No network, audio asset or installed Pashto voice | Text/quiz/library continue offline; audio degrades gracefully without false prerecorded-speech claim |
| LIB-27 | Reload after challenge partially completed, then enter Library and return | Challenge answer/progress either safely resumable or explicitly paused; no erased state or duplicate question-score credits |
| LIB-28 | Tests against Week 2 embedded content | `python3 tools/embed_week2.py --check` passes, or documented equivalent after intentional pipeline migration |

## Test traces

**Pace allocation:** for each of 8, 12, 16, 20, 24, start fresh, finish four distinct locations and assert (a) location new-lemma quotas; (b) no cross-location duplicate IDs; (c) total equals pace; (d) unseen inflections do not inflate count; (e) settings effective only next day.

**Skip-only Week 1:** Fresh game, four greetings at Library; 0/4 visits; Day 1 first pass at exactly 12/15; receive home, XP floor 200 and Level 2 Newcomer; skip Days 2–6 minimum passing marks for unchanged XP floors; pass revised Day 7 at exactly 20/25, receive at least 1800 XP / Level 10 New Resident. Library never counts as a visit.

**Skip-only Week 2:** Start valid Week 1 graduate. Skip opening lessons Days 8–14; all challenges and Week 2 dialogue/distractor tiles work, with no fabricated learned-word records, no automatic Week 2 level schedule, and 20/25 needed on Day 14.

**Legacy migration:** Test pre-upgrade saves with (1) empty new install; (2) tutorialDone only; (3) Day 1 passed and 0 visits; (4) Days 1–6 passed; (5) old generic Day 7 pass but no revised Week 1 graduation flag; (6) newly graduated Week 1; (7) partially/completely finished Week 2. Re-run migration twice and reload to prove idempotence and no loss/re-award.

**Meaningfulness:** Check each generated sentence against part-of-speech, valency, animate subject, agreement, person and gender restrictions. Proper NPC speaker/addressee metadata; no “door runs” equivalent. Machine checks do not replace Laghman native-speaker review.

## Commands to consider on the Week 2 baseline

- `python3 tools/embed_week2.py --check`
- `python3 patch/test_patch.py`
- `node tests/week1.test.mjs`
- `node tests/week2.test.mjs`
- New `tests/library-vocabulary.test.mjs` or equivalent, covering unit logic + browser flows.
- `git diff --check`

Run those which are available on the chosen branch; report each executed command, pass/fail/skipped outcomes, actual commit SHA and limitations (especially iPhone Safari testing and native language/audio verification).
