# Pashto Quest — Week 1 Development Handoff for Codex

**Specification status:** 23 October 2026  
**Reference implementation:** `pashto_quest_days_1_5_narrative.html` (latest available supplied game build; verify against GitHub HEAD before changing source).  
**Development scope:** Finish Days 6–7, rebalance character levels/XP, implement Week 1 completion/title, and preserve the established Days 1–5 gameplay. This is a *specification*, not a claim that these items are already in the HTML.


> **Implementation companion documents:** `CODEX_TASK.md` (task), `XP_MILESTONE_SPEC.md` (approved milestone mathematics), `WEEK1_CONTENT_BLUEPRINT.md` (authored lessons and question scenarios), `CODE_AUDIT.md` (reference HTML functions), and `ACCEPTANCE_TESTS.md` (test contracts). Read together; the added companion documents are more detailed and supersede any purely illustrative pseudocode below where necessary.

## Implemented Week 1 update — 23 October 2026

The pending runtime requirements below are now implemented in `index.html`; the supplied reference remains unchanged. The design tables and companion documents remain the acceptance contract, while their original “to implement” labels describe the pre-change baseline.

- Day 6: Saleha/Mina lake opening with interactive speaker-group identification and sentence construction, five authored sentences per location, contextual vocabulary and the illustrated Hills-only final event (15 questions, 12 to pass).
- Day 7: Edris’s market opening and two-group practice, five authored sentences per location, separate Ms Hameed School exam with 25 unique items (five each: pronouns, verb forms, SOV, compounds, dialogue), 20 to pass and graduation dialogue.
- Newcomer/New Resident progression: 200-XP nominal levels, contiguous-day display caps, one-time checkpoint floors, explicit version-2 exam graduation, banked-XP messaging, atomic reward/pass persistence and idempotent legacy migration. Old generic Day 7 clears are retained as history and do not graduate the player.
- Days 1–5 records/courses, daily skipping, four map zones, SRS, offline text play and Pashto-only audio fallback are retained. Challenge counters, end conditions, results and replays use the active assessment length.
- Automated checks and browser flows are in `tests/week1.test.mjs`; execution details are in `tests/README.md` and `IMPLEMENTATION_NOTES.md`.

**Still outstanding before a language-certified release:** qualified native Laghman review and an actual verified audio pack. No MP3s are included. Existing duplicate historical ID `a-clean` remains unchanged to preserve earlier course/save identity; a separate deliberate migration is needed to disambiguate it. Alternate written pronouns `مونږ/موږ` and `تاسو/تاسې` normalize for grading; arbitrary alternate word orders remain unapproved. iPhone-specific file/storage/TTS behaviour still needs real-device verification. Week 2 is not implemented.

## Product identity and non-negotiables

Pashto Quest is a mobile-friendly, standalone HTML/CSS/JavaScript language-learning game set in a living village in **Laghman, Afghanistan**. The player is a new arrival; a recurring cast teaches vocabulary through relationships and locally meaningful contexts. Prefer Laghman usage. Preserve conventional Pashto orthography and existing speaker buttons; flag questionable regional pronunciation and translations for local native review. Week 1 teaches **present tense** only, moving through things/description, he/she, I, informal you, polite/plural you, we, and they.

The current explorable map has exactly **four locations**: Home, Market, Lake/River, School. The narrative world is larger. A hills outing on Day 6 is a **special challenge scene**, NOT a fifth free-roam map destination. From Day 5 on, characters can move among locations. All conversations and challenge questions must visibly identify (a) the current speaker and (b) the intended addressee when relevant.

For all seven days: **Day 1 requires only Muhammad Jan's initial four-greeting tutorial**. Once tutorial is complete, the daily final challenge is available immediately via Skip. On Days 2–7, the opening lesson is mandatory *only on the normal story route*; Skip bypasses all visits and forced lessons. Completing a challenge with **zero daily visits** is valid. Location progress must not be falsely marked complete by Skip.

## What exists in the reference HTML

**Implemented (verify the repository really has the latest build):** single-file offline-capable lessons and quizzes; the four-location map; the four original NPCs Muhammad Jan, Edris, Saleha, Ms Hameed; initial guided greeting tutorial; localStorage progress and spaced-repetition vocabulary history; challenges with recall/translation/tile-based construction; Day 1–5 routes and narrative-specific 15-question assessments; skip-to-challenge; Day 2 expanded local vocabulary; Day 3 first-person/dinner-shopping story; Day 4 informal-you and compound-sentence story; Day 5 formal/plural-you and lakeside multi-speaker assessment; a preliminary four-location Day 6 (we) and Day 7 (they) curriculum with generic challenges; visible speaker/addressee labels for some later activities; pronunciation speaker buttons using Pashto MP3 if supplied, otherwise installed `ps-*` system voice where available. Audio **does not guarantee** working offline Pashto pronunciation without such a resource.

**Not yet implemented in this reference build:** Mina as a named character; Day 6 lake opening with the sisters; Day 6 hills challenge scene; Day 7 Edris's compulsory market opening; Day 7 extended 25-question Ms Hameed weekly examination; `Newcomer → New Resident` title milestone; new XP thresholds and day milestone guarantees. Do NOT report these as implemented until tests confirm them.

**Technical findings to address:** existing `hud()` displays `Level X · Town Resident` from the start and calculates level as `1 + Math.floor(progress.xp / 100)`. `finishChallenge()` currently awards 75 XP on first challenge pass; question rewards are normally 5 XP for novel correct question keys, but some Day 5 addressee-selection items do not award per-question XP. The code assumes all challenges contain exactly 15 questions in several places. Daily milestones, title and 25-question Week 1 assessment therefore need coordinated updates.

## Story/curriculum of Days 1–7

| Day | Main grammar | Required opening on normal route | Practice and narrative | Final challenge | Build status |
|---|---|---|---|---|---|
| **1 — Welcome** | Things: nouns, adjectives, `دی / ده / دي`, simple descriptions | Home: Muhammad Jan's four-greeting tutorial | Free roam to all four areas in any order; everyday objects/colours/descriptions | Muhammad Jan checks the player's knowledge at Home, **15 questions**, pass **12/15** | Implemented |
| **2 — Actions** | He/she: `هغه`; Pashto S–O–V order, third-person singular action verbs | School: Ms Hameed explains SOV | Then Market (Edris) and Lake (Saleha), either order; finish at Home (Muhammad Jan). Approximately **5 context-specific sentences per location** mixing new and Day 1 vocabulary | Muhammad Jan's Home check-in, **15**, pass **12** | Implemented |
| **3 — I** | `زه`; present first-person singular endings, contrast with he/she | Lake: Saleha teaches first-person verbs | Then Home, Market, School in any order. Introduce useful new vocabulary and recycle prior nouns/verbs | Edris's Market conversation buying produce for dinner, **15**, pass **12** | Implemented |
| **4 — Informal you** | `ته`; informal singular verb forms; compound clauses with `او` and I/you | Home: Muhammad Jan explains contrast to I | Then Market, Lake, School; keep socially appropriate interlocutors (player does **not** learn to address an elder as informal `ته`) | Warm, informal Home conversation **with Muhammad Jan**, **15**, pass **12**, focusing compound sentences | Implemented |
| **5 — Polite/plural you** | `تاسې` (possibly `تاسو` in local speech); polite singular and plural, conjugation, audience selection | School: Ms Hameed | Familiar people move around village; teach when to address Saleha as `ته`, adults/elders respectfully as `تاسې`, and multiple people as `تاسې` | Community gathering near Lake, **15**, pass **12**; multi-speaker identity/addressee essential | Implemented |
| **6 — We** | `موږ` (local spoken variant may be `مونږ`); first-person plural present verbs; explicit compound subject e.g. `مینا او زه` | Lake: Saleha introduces sister **Mina** and teaches how **Mina and I** is **we** | Home, Market and School free exploration, approximately **5 local sentences each** with mix of old and new vocabulary; actively contrast `موږ` (speaker included) and `تاسې` (addressed group) | A walk with Saleha and Mina in **the Hills**, a non-explorable story-only scene, **15**, pass **12** | **To implement** |
| **7 — They** | `هغوی`; third-person plural, compare against all learned pronouns and verb forms | Market: Edris points out other shoppers and asks what **they** do | Home, Lake and School visits to apply third-person plural and cumulative vocabulary in meaningful situations | **Ms Hameed's formal end-of-week examination at School**, **25**, pass **20** (80%) | **To implement** |

Days 6–7 should use the same normal-path pattern as recent days: an opening forced on the narrative route, other three locations in free order, and a final scene after visits. **The challenge remains selectable immediately on both days** and does not require the opening visit. On Day 6 the final hills scene is accessed by the challenge button, not by adding a map marker. On Day 7 a normal school practice visit and the final exam with Ms Hameed are separate events.

### Character continuity and vocabulary logic

- **Muhammad Jan:** older, friendly and respected village leader; Home is his usual base. Day 1 tutorial and check-in, Day 2 check-in, Day 4 lesson and conversation. Model respectful address when the player addresses an elder.
- **Edris:** personable village grocer; Market is his base. Day 3 dinner-shopping assessment; **Day 7 opens at the Market**, observing other customers as the natural context for `they`.
- **Saleha:** fellow student; Lake is her base. Day 3 first-person singular introduction; **Day 6 introduces her sister Mina**.
- **Mina:** newly introduced on Day 6, Saleha's younger sister; energetic and social. Distinct avatar/name/role, participates in group activities and the Hills event. She remains a named member of the cast.
- **Ms Hameed:** teacher of Pashto for arrivals; School base. Day 2 SOV lesson, Day 5 respectful/plural second person, **Day 7 weekly examination**.

Characters must not become stationary NPCs again after Day 5. Keep distinct `speaker`/`recipient` metadata, names and avatars when two or more NPCs appear. Questions must use syntactically **and semantically coherent** sentences (never nonsense such as “the door ran”). Recycle useful vocabulary from previous days while adding 3–5 setting-specific nouns/verbs per location where feasible. Focus on Laghmani Afghan Pashto, no invented claims of native verification.

### Day 6 examples (translation drafts; native review needed)

- `زه منډې وهم.` — I run.
- `مینا او زه یو ځای منډې وهو.` — Mina and I run together.
- `موږ یو ځای منډې وهو.` — We run together.
- `موږ ښوونځي ته ځو.` — We go to school.
- `تاسې ښوونځي ته ځئ.` — You all go to school.

Teach that verb person/number changes; a compound subject containing the speaker requires a first-person plural verb. `We` includes the speaker; plural `you` addresses the listener(s). The Hills challenge can ask who walks together, what “we” do, and what the sisters (“you both”) do, while keeping every grammatical example present-tense rather than introducing future-tense trip planning.

### Day 7 weekly examination design (25 items)

Suggested balanced question groups: **5 pronoun identification**, **5 verb-form/conjugation**, **5 SOV sentence recalls/constructions**, **5 meaningful compound sentences**, **5 applied multi-speaker conversation turns**. Reuse Day 1–7 vocabulary with plausible context. Track first-try correctness and require **20/25**. Ms Hameed is the visible examiner, but other characters can speak within applied scenarios with explicit labels and recipients. A wrong/fail attempt must not award the Week 1 title or milestone; retries allowed.

## Week 1 XP, Level 1–10, and New Resident milestone — implement

### Invariants

1. Start **Level 1 · Newcomer** with 0 XP. Do not display “Town Resident” or “New Resident” before the Week 1 exam is passed.
2. Use **200 total XP per level** for Week 1: Level `n` ordinarily requires `200 × (n - 1)` XP; hence **Level 10 requires 1,800 total XP**.
3. Story progression limits the **displayed** level even if XP from thorough practice is high. The highest displayed level is controlled by the latest cleared daily challenge; **Level 10 cannot be shown before the newly implemented Day 7 weekly assessment has been passed**. XP beyond a current cap is retained, not discarded.
4. Passing a day challenge **for the first time** guarantees a cumulative XP *floor*, independent of whether any locations were visited and independent of question types/rewards. Continue awarding normal question/lesson XP, but apply a one-time **catch-up XP award** when necessary.
5. No daily/weekly first-pass or checkpoint catch-up XP can be re-awarded on a retry or replay. Don't permit easy repeat-lesson XP farming to leap the progression gate. Keep spaced repetition functional.
6. Upon *passing the new 25-question Week 1 exam*, grant the floor of **1,800 total XP**, unlock **Level 10**, change title to **New Resident**, and show a specific Week 1 graduation narrative from Ms Hameed. This works even if the player **skipped all optional visits on all seven days**.
7. Levels beyond 10 are a future chapter, not unlocked accidentally by grinding Day 1–7. Keep excess XP banked for later content or display the Week 1 cap, without inventing a Week 2.

### Recommended checkpoint schedule

Level requirements (inclusive): 1=0, 2=200, 3=400, 4=600, 5=800, 6=1,000, 7=1,200, 8=1,400, 9=1,600, 10=1,800 XP.

| Cleared challenge | Minimum cumulative XP after first pass | Highest level unlocked | Status |
|---|---:|---:|---|
| None (tutorial completed) | No special XP floor; preserve tutorial-earned XP | **1** | Newcomer |
| Day 1 | **200** | **2** | Newcomer |
| Day 2 | **400** | **3** | Newcomer |
| Day 3 | **600** | **4** | Newcomer |
| Day 4 | **800** | **5** | Newcomer |
| Day 5 | **1,200** | **7** | Newcomer |
| Day 6 | **1,600** | **9** | Newcomer |
| Day 7 weekly examination | **1,800** | **10** | **New Resident** |

Levels 6 and 8 are passed through when clearing Days 5 and 6 respectively; level-up animation, if any, should announce all attained levels in order. The larger checkpoint increases reflect the added grammar complexity and establish a hard Week 1 milestone. Optional learning XP can exceed these floors but must not bypass the *displayed level caps*.

### Deterministic algorithm (illustrative pseudocode)

```js
const XP_PER_LEVEL = 200;
const XP_FLOORS = {1:200, 2:400, 3:600, 4:800, 5:1200, 6:1600, 7:1800};
const LEVEL_CAPS = {0:1, 1:2, 2:3, 3:4, 4:5, 5:7, 6:9, 7:10};

function clearedChapterDays(progress) {
  // Count contiguous first-pass clears on Days 1–6.
  let day = 0;
  for (let d = 1; d <= 6 && progress.challenges[String(d)]?.passed; d++) day = d;
  // Old saves with a previously passed 15-question Day 7 challenge
  // MUST NOT be treated as having passed the new 25-question exam.
  return progress.week1ExamPassed === true ? 7 : day;
}

function grantFirstPassMilestone(progress, day) {
  // Invoke exactly once when the relevant newly passed challenge is committed.
  // Existing question XP and existing first-pass bonus may already be included.
  const topUp = Math.max(0, XP_FLOORS[day] - progress.xp);
  progress.xp += topUp;
  return topUp;  // Include this in visibly awarded XP.
}

function currentCharacter(progress) {
  const cleared = clearedChapterDays(progress);
  const earnedLevel = 1 + Math.floor(Math.max(0, progress.xp) / XP_PER_LEVEL);
  const level = Math.min(earnedLevel, LEVEL_CAPS[cleared]);
  return {level, title: cleared === 7 && level >= 10 ? 'New Resident' : 'Newcomer'};
}
```

**Important implementation nuances:** Keep challenge first-pass flag and milestone reward atomic (persist together) to prevent double rewards. The Day 7 completion flag must mean **the new 25-question exam**, not an existing 15-question Day 7 quiz saved under `challenges['7']`. Keep an explicit `week1ExamPassed`/`week1ExamVersion` or equivalent. A pass is determined by 12/15 for Days 1–6 and 20/25 on Day 7; replace all hard-coded `15`, `12`, counters, result labels, challenge breakdowns, render paths and Next button conditions with `questions.length` and a day-specific passing-score function. If a player accumulates more XP than a gated level permits, show a clear “Complete the next day/weekly assessment to advance” message, not an incorrect `0/200` progress bar.

### Save-data migration

Retain `xp`, `tutorialDone`, `stats`, lesson completions, and legitimate Day 1–6 challenge passes from localStorage. Introduce versioned save schema fields for `week1ExamPassed`, XP milestone grants and Week 1 graduation. On loading prior saves, apply **at most one** non-repeatable checkpoint-floor reconciliation for already cleared Days 1–6; this should never lower XP. An older saved Day 7 generic 15-question pass must **not** silently grant the new graduation title; present Ms Hameed's revised exam for completion. Existing cleared days and progress should not reset.

## Media, accessibility, gameplay presentation

- Clearly visible identity of **speaker**, **player**, **addressee**, and **other participants** throughout all seven days, including multi-character challenges. Names and portraits should not rely on colour alone.
- Responsive phone/desktop interactions; Pashto lines right-to-left with correct Unicode; English/transliteration left-to-right. Maintain click-to-hear buttons for new Day 6/7 expressions.
- Pronunciation: use validated Pashto audio files when provided; only `ps-*` browser voices as fallback. Never substitute unrelated-language speech. Standard Afghan pronunciation is not automatically authentic to Laghman; keep review caveat.
- Existing four-location exploration, spaced repetition, achievements and Save/Reset flows should continue to work. The game must remain usable for reading and quizzes without network; audio may depend on installed Pashto voices or bundled MP3 files.
- Avoid brittle shuffling that constructs ungrammatical or semantically absurd phrases. Use manually authored/validated sentence banks with stable IDs and explicit speaker/recipient/context.

## Required Codex acceptance tests

1. **Fresh skip-only, worst-case score:** complete four-greeting tutorial; each Day 1–6 challenge passes exactly **12/15** and Day 7 passes exactly **20/25**; visit **0/4** optional locations per day. Verify next day unlocked, XP floor reached for each day, Level 10 and **New Resident** awarded **only** after the final exam.
2. **Early title restriction:** complete many lessons/reviews before Day 7, even enough to exceed 1,800 stored XP. Displayed level remains at most 9 and title remains **Newcomer** until passing the new weekly exam.
3. **Failure/retry:** scoring 11/15 on Days 1–6 or 19/25 on Day 7 does not unlock next day, grant milestone, or change title. Retry and pass grants milestone exactly once. Challenge replay cannot farm first-pass XP.
4. **Day 6 normal route:** lake and Saleha/Mina lesson first; then Home/Market/School in arbitrary order; final challenge in Hills scene only after normal-route visits; Skip can trigger Hills scene immediately. Hills not displayed as fifth map node.
5. **Day 7 normal route:** Edris's Market lesson first; Home/Lake/School free exploration; Ms Hameed's School exam after all visits; Skip opens her exam immediately. 25-question counter, score, responses and finish conditions all use 25, not 15.
6. **Narrative language:** explicit subject groups (`Mina and I` → `we`), `we` versus `you all` distinction, `they` at a busy market; every speaker/addressee is labelled. All examples are meaningful and present tense. Check grammar/orthography/transliteration with a Laghman speaker before final release.
7. **Regression:** Days 1–5 unchanged in sequencing, narrative and 15-question pass marks; Day 2 has its expanded sentence sets; Day 3 still ends with Edris; Day 4 at home; Day 5 lakeside gathering; Skip usable from the start of Days 2–7 and right after Day 1 tutorial.
8. **Persistence:** refresh during/after successful checkpoints; no lost progress or duplicated XP. Migrate earlier progress and ensure a legacy Day 7 15-question clear does not falsely unlock the new graduation.
9. **UX:** desktop/mobile challenge button accessible, multi-person dialogues legible, speaker icons show honest Pashto-audio availability, milestone/title visible in avatar/HUD and final congratulation screen.

## Implementation order for Codex

1. Back up or branch from GitHub HEAD; compare HEAD with the latest standalone HTML reference, merge **only** missing changes, and do not overwrite newer repository code.
2. Refactor challenge count/pass threshold and persistence first (15 on Days 1–6; 25 on Day 7). Add robust first-pass rewards and save migration.
3. Add XP level floors, 200 XP/level, level caps and Newcomer/New Resident status. Test skip-only before adding narrative.
4. Implement Mina, Day 6 lake opening, mixed-vocabulary lessons and hills final scene (no new explorable map location).
5. Implement Day 7 Edris market opening, third-person plural lessons and Ms Hameed's 25-question exam.
6. Validate all challenge banks for grammatical and semantic correctness, all speakers, and the Week 1 graduation dialogue.
7. Run automated logic tests and hands-on mobile/desktop flow checks. Commit changed files with a clear summary of implemented features and any native-review issues.

**Out of scope:** Week 2, a fifth explorable map location, new tenses, server persistence/login, changing established Day 1–5 narrative or replacing the existing visual design.

## Paste into Codex

> Read `GAME_SPEC.md` and inspect the current repository version of Pashto Quest. Implement the **pending** Week 1 items, especially Day 6's Saleha/Mina storyline and Hills challenge, Day 7's Edris opening and 25-question Ms Hameed examination, and the specified XP/level/title system. Preserve implemented Days 1–5 features and immediate challenge skipping. Do not confuse the generic older Day 7 clear with the new weekly examination. Run the acceptance tests in the spec, fix regressions, and report files changed, tests performed, and any translation/pronunciation content needing Laghmani native review.
