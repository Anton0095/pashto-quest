# Week 1 experience, levels and graduation — exact contract

**Approved design change:** At the end of the first week the player changes from **Newcomer** to **New Resident**. Levels **1–10** are attainable within seven days. A player skipping every optional location and passing only each daily challenge must reach **Level 10** after Ms Hameed's Week 1 examination.

## 1. Thresholds and floors

The internal XP balance is cumulative, non-negative, persisted, and never reduced through migration. The nominal level threshold is `200 × (level − 1)` XP. The displayed character level is additionally gated by the highest **contiguous successfully completed** daily challenges.

| First successful clearance | Guaranteed minimum total XP | Displayed level cap | Displayed title |
|---|---:|---:|---|
| Game begins / tutorial finished | 0 (no catch-up floor) | 1 | Newcomer |
| Day 1 · 12/15 | 200 | 2 | Newcomer |
| Day 2 · 12/15 | 400 | 3 | Newcomer |
| Day 3 · 12/15 | 600 | 4 | Newcomer |
| Day 4 · 12/15 | 800 | 5 | Newcomer |
| Day 5 · 12/15 | 1,200 | 7 | Newcomer |
| Day 6 · 12/15 | 1,600 | 9 | Newcomer |
| **Day 7 · 20/25 (new weekly exam)** | **1,800** | **10** | **New Resident** |

The Day 5 and Day 6 completions cross intermediate levels (6 and 8). If level-up UI is animated, acknowledge each crossing. Days 1–6 never unlock the final title; Week 1 max displayed level is 10 even if stored XP is higher than 1,800.

## 2. When to award XP

- Continue the existing first-correct answer / lesson / spaced-repetition rewards, subject to existing anti-repeat rules. The existing game currently provides **75 XP** as a first-time daily-challenge pass bonus. This may be retained as part of the milestone calculation.
- On the **first valid pass of each day's final challenge only**, after any usual earned XP and first-pass bonus, compute `topUp = max(0, XP_FLOOR[day] - totalXP)` and award that extra amount. Display both the baseline and any catch-up award honestly.
- If the player completed all lessons first and already exceeds the XP floor, the top-up is **zero**. Optional practice XP remains in their account; it is not penalized.
- A skipped day does not mark location visits as completed. A daily challenge pass unlocks the following day as normal and triggers its one-time XP floor.
- Failure awards only eligible normal first-time correct-answer XP, not a first-pass bonus, top-up, next-day unlock, promotion or New Resident title.
- A retry/replay of a previously passed challenge does **not** pay the first-clear bonus/top-up again. Existing question-level one-time rewards should remain uniquely keyed.
- If the player's stored XP is above the gated display cap, keep/bank excess XP. The HUD should state something like **“Next level unlocks after the next day challenge”**, not pretend XP has disappeared or incorrectly show a full bar as `0/200`.

## 3. Reference algorithm (Codex should adapt to the game's architecture)

```js
const XP_STEP = 200;
const XP_FLOORS = Object.freeze({ 1:200, 2:400, 3:600, 4:800, 5:1200, 6:1600, 7:1800 });
const LEVEL_CAPS = Object.freeze({ 0:1, 1:2, 2:3, 3:4, 4:5, 5:7, 6:9, 7:10 });
const CURRENT_WEEK1_EXAM_VERSION = 2;

function week1ExamCleared(p) {
  return p.week1ExamPassed === true && p.week1ExamVersion === CURRENT_WEEK1_EXAM_VERSION;
}

function highestClearedDay(p) {
  let d = 0;
  for (let next=1; next<=6; next++) {
    if (p.challenges?.[String(next)]?.passed === true) d = next;
    else break;
  }
  return d === 6 && week1ExamCleared(p) ? 7 : d;
}

function characterStatus(p) {
  const cleared = highestClearedDay(p);
  const xp = Math.max(0, Math.floor(Number(p.xp) || 0));
  const earnedLevel = 1 + Math.floor(xp / XP_STEP);
  const level = Math.min(earnedLevel, LEVEL_CAPS[cleared]);
  return {
    level,
    title: cleared === 7 && level >= 10 ? 'New Resident' : 'Newcomer',
    xp,
    xpToNominalNextLevel: Math.max(0, XP_STEP*level - xp),
    cappedByProgression: earnedLevel > LEVEL_CAPS[cleared]
  };
}

function applyFirstPassFloor(p, day) {
  // ONLY call if a newly passed, version-valid challenge has just been committed.
  // Prefer an atomic save of both the completion flag and milestone-award flag.
  p.milestoneAwarded ??= {};
  const key = `week1-day-${day}`;
  if (p.milestoneAwarded[key]) return 0;
  const bonus = Math.max(0, XP_FLOORS[day] - p.xp);
  p.xp += bonus;
  p.milestoneAwarded[key] = true;  // even when bonus is zero
  return bonus;
}
```

`xpToNominalNextLevel` is not a HUD specification when progression capped. Render a separate, accurate locked-level explanation instead; support banked XP. Avoid using `progress.challenges['7'].passed` alone to set Day 7 completion or to mark the game finished.

## 4. New exam and old save data

The existing single-file HTML stores `progress` under localStorage key `pashto-town-days-v1`. Its `challenges['7']` may contain a **legacy generic 15-question challenge pass**. That must NOT count as Week 1 graduation.

**Recommended fields** on the existing progress object:

```json
{
  "saveSchemaVersion": 2,
  "xp": 0,
  "milestoneAwarded": {},
  "week1ExamVersion": null,
  "week1ExamPassed": false,
  "week1GraduationSeen": false
}
```

Migration:

1. Preserve pre-existing XP, vocabulary statistics, SRS stages, tutorial flag, correctly completed lessons, Day 1–6 challenge completion records and unique question rewards.
2. Normalize invalid stored XP to at least zero and guard against malformed JSON, missing fields, NaN and duplicate old flags.
3. For a previous build that has Days 1–6 legitimately cleared, reconcile its highest **contiguous** Day 1–6 first-clear milestone exactly once. This may increase XP but cannot reduce it. Mark these milestone records as reconciled in the same save transaction.
4. If `challenges['7'].passed` originates from the earlier generic challenge, preserve the result as historical if desired, but ensure that `passedChallenge(7)`, `allDone()`, Day 7 UI, graduation and Level 10 require **`week1ExamVersion===2 && week1ExamPassed===true`**. The player must take the new 25-question test.
5. A newly cleared Day 7 exam atomically sets `week1ExamVersion: 2`, `week1ExamPassed: true`, current Day 7 challenge record (best/attempts/passed), the one-time milestone flag, 1,800-XP minimum, and graduation eligibility.
6. Do not replay the old title or milestone animation on reload. Use a persisted `week1GraduationSeen` flag only for once-only celebration UI, not as the actual grant condition.
7. Do not change the localStorage key unnecessarily or lose previously earned vocabulary progress on upgrade.

## 5. The milestone presentation

- **Before exam:** Level `1–9` (gated by day), title **Newcomer** on the character panel and HUD. A player may have banked XP but not yet an unlocked level.
- **Passing the Week 1 assessment:** show “Week 1 complete”, Ms Hameed's congratulatory dialogue, **Level 10 unlocked**, and a prominent but accessible “New Resident” title reveal. Show earned XP and one-time top-up honestly.
- **After graduation:** HUD reads `Level 10 · New Resident`; title persists after refresh. Do not present Week 2 quests or artificially create a fifth map zone.
- **Failing 19/25:** remain Newcomer, no Level 10, no graduation event. Allow revision and retries.
- **Repeat 25/25 after prior pass:** no further title/graduation/top-up, though normal review functionality can remain.

## 6. Required proof

Implement automated unit tests for `characterStatus`, `highestClearedDay`, migrated progress, one-time XP floors and Week 1 exam versioning. End-to-end browser tests must exercise **Day 1 tutorial + seven skip-only challenge clears at minimum pass scores**. See `ACCEPTANCE_TESTS.md` and `tests/acceptance_fixtures.json`.
