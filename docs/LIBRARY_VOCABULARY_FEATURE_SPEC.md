# Pashto Quest — Library, cumulative vocabulary and personalised learning

**Status:** Approved design for Codex implementation; **NOT IMPLEMENTED** by this handover.  
**Prepared:** 24 October 2026.  
**Repository:** Anton0095/pashto-quest.  
**Recommended integration baseline:** `codex/week2-development` as inspected on 24 October 2026; re-check HEAD before editing. `main` already contains merged Week 1.  
**Scope:** New always-available Library, lemma-based word bank, adjustable daily new-word quota, grammar journal, Day 1 narrative relocation and house handover, and compatible lessons/challenges across Days 1–14. Preserve existing completed features.

## 1. Product objective

The game begins with **zero acquired lexical entries**. Its four teaching locations gradually introduce distinct vocabulary items. All later lessons, sentence constructions, dialogue exercises, SRS and assessments reuse the player's accumulated vocabulary plus context-appropriate new entries. The fifth location, **Library**, is a non-lesson reference hub available throughout the game. A new player meets Muhammad Jan at the Library, chooses a learning pace, and completes the greeting tutorial there. The first daily challenge culminates in Muhammad Jan awarding the player their own home.

This is a data-driven, rule-based curriculum. It must work without any LLM API, web connection or runtime JSON fetch; do not fabricate Pashto utterances or audio.

## 2. Five locations, four teaching stops

- **Library:** fifth explorable/map location, accessible before and after lessons and challenges, on every Day 1–14 (and future days). It **never** counts as a daily teaching location, daily required visit, XP farming opportunity, or a fifth step of any four-location loop. Can be opened during a challenge as a non-destructive reference overlay or by returning without losing saved challenge state. If challenge reference is intentionally restricted during a graded examination, keep Library accessible as a location and clearly explain the restriction; never erase the attempt.
- **Home, Market, Lake, School:** continue as the four teaching stops. Preserve the existing mandatory opening location on the *normal route* for each day from Day 2 onward, the named cast, mobile map, multi-character interactions, lesson content and skip route. The Hills on Day 6 stays story-only.
- Library UI must offer **Vocabulary Bank**, **Grammar Journal**, **Learning Pace**, and an optional **Useful Expressions / Greetings** page. Support mobile touch, keyboard navigation, visible focus, readable RTL Pashto, English gloss and romanisation.

## 3. Definition of one vocabulary word

Use a **lexical entry / dictionary lemma ID** as the unit of count, not an orthographic token, English gloss, conjugation or hypothetical triliteral root.

- Verb variants of the *same lexeme* (e.g. user's illustrative “lorem” = I see / “loree” = you see) count **once**; record person/number/tense and approved Pashto forms separately under the verb's ID. They are only examples of the concept, not approved local pronunciations.
- Singular/plural and grammatical case/number forms of the same noun or gender/number agreement forms of the same adjective also count **once**.
- Distinct lexical derivatives or homonyms with independent meanings may be distinct entries even when sharing historical roots. Use explicit canonical `lemmaId` rather than unreliable text-stemming or English-string matching. Irregular stems and compound verbs belong to their actual approved lemma.
- Count concrete nouns, lexical verbs, adjectives and meaningful adverbs toward the **new vocabulary quota**. Pronouns, particles, copulas, agreement markers and newly taught grammatical inflections belong in the grammar inventory; they may be browsed but must not consume a content-lemma quota. Maintain a transparent `countsTowardDailyQuota` flag for edge cases.
- Assign stable unique IDs; deduplicate across all days/locations, legacy content and saved games. Multiple meanings of one lemma may have multiple senses with review metadata.
- Pashto script, romanisation, audio and all grammatical forms require Laghman/Afghanistan-oriented human review. Preserve standard orthography if regional pronunciation is uncertain; mark `needsReview`. Never treat unreviewed translations or machine TTS as native-verified.

## 4. Adjustable daily quota

At Day 1 Library onboarding Muhammad Jan asks how many **new unique content lemmas** to introduce per completed day. Offer accessible presets:

| Daily target | Home | Market | Lake | School | Label |
|---:|---:|---:|---:|---:|---|
| 8 | 2 | 2 | 2 | 2 | Gentle |
| 12 | 3 | 3 | 3 | 3 | Steady |
| 16 | 4 | 4 | 4 | 4 | Moderate |
| **20 (default)** | **5** | **5** | **5** | **5** | Standard |
| 24 | 6 | 6 | 6 | 6 | Intensive |

- All players follow identical day numbers, major grammar topics, story beats, NPCs and assessment pass thresholds.
- Give each completed teaching location its location-specific share of **new, never-before-encountered content lemmas**. Tutorial greetings/idiomatic expressions are stored separately and do not silently inflate the daily content-lemma quota.
- Presets should be reversible at Library. Store `requestedDailyTarget`; freeze `effectiveDailyTarget` **when a new day begins** (or before its first lesson), and apply changes to the **next unstarted day**, with explicit UI feedback. Never mutate the current day's already selected lessons after a settings change.
- Generate/persist a deterministic day/location plan from curated content and a stable seed; a reload/revisit cannot re-roll an assignment or double-credit roots.
- Each teaching location retains the existing five contextual sentence targets as the **minimum standard storyline**. Adjust the supplementary vocabulary cards and target substitutions across 2–6 new lemmas per location; every assigned new lemma must be meaningfully introduced. Do not silently turn unreviewed generated combinations into production Pashto.
- At a selected pace, if the reviewed content pool is insufficient, **do not reuse existing entries as 'new'**, do not synthesize unverified content, and do not silently misreport the quota. Show the available safe pace, let the player choose a supported pace, or flag a development-content gap for review. Codex must author/curate sufficient distinct candidates before exposing a higher preset.
- A full normal day at 20/day introduces 20 scheduled unique content lemmas; fully completing 7/14 days targets 140/280 such entries *if content supply supports it*. This is an exposure target, not a claim of mastery. Skips, partial visits and separate phrases change the actual acquired-bank total.

## 5. Vocabulary data contract

Implement an extensible data model (field names below illustrative; adapt to current code rather than duplicating state).

**Lexicon entry:**
- `lemmaId` (immutable identifier), `displayLemmaPs`, `romanisation`, `englishSenses[]`, `partOfSpeech`, `semanticTags[]`, `suitableLocations[]`, `countsTowardDailyQuota`, `reviewStatus`.
- `forms[]`: stable `formId`, `pashto`, `romanisation`, `englishGloss`, `morphology` (person/number/tense/gender as applicable), `audioAssetId?`, `reviewStatus`, `prerequisiteGrammarIds[]`.
- `examples[]`: IDs, English targets, reviewed Pashto sentence, allowed substitutions, semantic roles, speaker/addressee, grammatical constraints and `reviewStatus`.
- `sourceContentIds[]` / aliases for existing Week 1 and Week 2 lesson cards, so migration can resolve legacy records by stable mapping. **Do not rely on the historical duplicate `a-clean` ID** as a globally unique lookup.

**Player acquisition record, keyed by `lemmaId`:**
- `firstEncounteredDay`, `firstEncounteredSource` (tutorial, lesson, challenge, review), `encounteredFormIds[]`, `practisedFormIds[]`, `correctAttempts`, `totalAttempts`, `srsDueAt` or a reference to existing SRS, `masteredAt?`.
- Statuses: **unencountered**, **introduced**, **practised**, **mastered**. They reflect actual event history; a day advance, skipped location or planned assignment alone is not acquisition.
- One lexeme may have different form-level competence. Opening a Library detail page never automatically marks a word as practised or mastered.
- Bank summary shows distinct **encountered / practised / mastered lemmas**, not counts of inflected forms; allow browsing/filtering all acquired words by part of speech, location, day and revision need.

**Lesson plan / events:**
- Save `day`, `effectiveDailyTarget`, `locationAssignments` (ordered IDs), `planVersion`, `sourceContentVersion` and stable random seed. Separate **scheduled** from **encountered** from **mastered**.
- Event writes are idempotent, particularly on refresh, replays, language-form variants, skip and test retries.
- Keep current `progress` object, localStorage key, Week 1 XP floors/level caps, `week1ExamPassed` milestone, SRS history, question reward keys and Week 2 capped XP intact; evolve with schema-versioned migration rather than resetting data.

## 6. Vocabulary-driven synthesis

- Build a local curriculum planner that selects reviewed sentences/dialogue templates matching **current day's grammar**, concrete NPC/setting and safe semantic tags (e.g. an agent capable of running; a market item that can be purchased). Pashto syntax and morphology must be generated with reviewed constructions, not English word-order substitution.
- A generated lesson uses exactly its assigned new lemmas together with a mix of prior acquired lemmas (prioritise spaced/due review). If player has little prior vocabulary, use simple curated starter templates; with larger banks, choose more varied but **grammatically valid** material.
- Explain unfamiliar grammatical forms before requiring them. Record newly encountered form IDs even if the lemma is already known. A new conjugation of a known verb exercises grammar, never spends another new-word slot.
- Preserve English-to-Pashto and Pashto-to-English practice, recognition/recall, tile construction, speaker/addressee labels, Week 2 dialogue-answer and dud-tile mechanics, appropriate RTL rendering and SRS/feedback.
- Maintain an explicit “curriculum vocabulary bank” of curated entries versus the **player's acquired bank**; do not conflate all candidate words in source JSON with words the user has learned.
- Offline runtime content must be bundled in `index.html`, including Week 2 bank synchronized through `python3 tools/embed_week2.py` or its updated replacement. No runtime fetch is permitted.

## 7. Library interface requirements

**Vocabulary Bank**
- Search and sort acquired entries; show lemma in Pashto, romanisation, English and part of speech, plus current status.
- Click/tap each entry for approved forms already encountered, their grammatical labels, example sentence(s), audio buttons where available, SRS/review indication, and earliest lesson context. No unexplained unearned conjugations.
- Permit reviewing a word voluntarily; ensure reward gating prevents infinite XP farming. Optional review can affect practice status only if the player attempts an exercise.
- Make explicit distinction between “20 new words scheduled today” and “12 actually encountered” when relevant.

**Grammar Journal**
- Separate page of day-linked grammar **rules the player has actually learned/encountered** (Day 1 simple descriptions; Day 2 SOV & he/she; Day 3 I; Day 4 informal you; Day 5 formal/plural you; Day 6 we; Day 7 they; Week 2 demonstratives, plurals/counts, here/there/where, possession, question words, adverbs and Day 14 review).
- Each unlocked rule has a human-readable explanation, reviewed Pashto examples, transliteration, English gloss, relevant inflections, speaker/addressee conventions and linked lemmas. Locked/not-yet-learned rules may be shown as titles but must not reveal lesson contents.
- Grammar unlocking must use actual lesson exposure or correctly demonstrated challenge encounters. Day number, challenge skip or award alone does **not** unlock unseen rules.
- Preserve culturally respectful pronoun usage and Laghman review flags.

**Learning Pace**
- Show current/effective vs upcoming pace, four-location breakdown, and when a change will apply. Compatible with touch, keyboard and screen readers.
- Library is usable even when no vocabulary/grammar has been acquired; show an inviting empty state.

## 8. Day 1 story migration and house award

**New players:**
1. Start at the Library (new fifth map location), meet friendly elder **Muhammad Jan** and complete the **existing four-greeting tutorial** there, using existing Pashto content and tutorial-complete flag. Preserve Day 1 forced tutorial and immediate Skip availability *after* tutorial; Library is always reachable.
2. Muhammad asks for one of the supported daily new-word quotas. Persist the answer before normal village exploration. Greeting formulas appear in a useful-expressions/phrase area; do not mistake four phrases for four unique lemmas toward the daily target.
3. Explore Home, Market, Lake and School on the normal path, using the personalised lesson planner. **Before home award**, the Home map location is Muhammad Jan's home / a home he shows the new arrival; no access is removed.
4. Day 1's existing Muhammad Jan **15-question/12-to-pass** final conversation is framed as settling into the village and being given the player's house. Set its scene at the **Library or a Library-linked handover** (not the player's home before ownership).
5. On **first successful Day 1 challenge only**, show Muhammad Jan handing over the house key, persist `homeGranted=true` atomically with the original Day 1 pass/XP checkpoint and unlock Day 2. Home becomes the **player's residence**, with appropriate later dialogue/location descriptions. Home remains usable in every daily loop and Muhammad Jan can continue to visit/teach there. Do not add inventory mechanics solely for this; key can be narrative/illustrative.
6. On challenge failure, do not award a home/key, advance day, or grant first-pass XP. Retries remain supported. A Day 1 skip after the Library tutorial should go straight to the Day 1 challenge without any lesson visits and still permit home award on pass.

**Existing saves:**
- `tutorialDone` remains valid; don't replay a forced Library tutorial if already completed.
- Existing save with legitimate Day 1 passed: derive/set `homeGranted=true` exactly once without replaying Day 1 challenge or XP; reveal home status non-disruptively.
- Existing Day 1 tutorial completed but challenge unpassed: move future challenge scene to Library; keep progress/visits and still require challenge pass for home award.
- Preserve all valid later clears, Week 1 graduation, Week 2 progress, XP, existing SRS and form stats. Migrate old acquisition from known card/question IDs conservatively. Never fake lessons/forms/mastery merely because a later day has been unlocked.
- Default prior saves to **20/day** unless they explicitly choose another setting; the setting affects **future unstarted days**, not already completed days.

## 9. Challenges and bypass compatibility

- Existing first-week Days 1–6: 15 questions, **12** to pass. **Day 7 is the 25-question Week 1 exam, 20 to pass**, preserving Level 10/New Resident graduation.
- Days 8–13: 15 questions, **12** to pass; **Day 14 is the 25-question Week 2 exam, 20 to pass**. Preserve the existing Week 2 NPC dialogue and distractor-tile designs.
- Daily challenges select an appropriate mix of current scheduled targets, previously acquired vocabulary and older SRS-due material; suggested for 15-question days: six current, five recent and four older/contextual grammar, *when enough banked material exists*. Adapt safely for novice/skip-only states without empty or duplicate quizzes, while ensuring grammar/story objectives and genuine grade difficulty remain.
- A skipped lesson or location **is not completed**, its scheduled words are **not marked learned**, and the Library does not incorrectly show them. Skip-only questions may expose new words as encountered through the challenge prompt/answer feedback, tracked with `source=challenge`; correct performed answers can earn practice credit. Merely assigning words to an unvisited location never counts.
- Full skip-only completion must remain viable on Days 1–14; create a deterministic curated fallback assessment for zero-bank cases (the existing banked question data is a candidate). Don't block on “not enough learned roots”; don't silently mark all the day's assigned words acquired.
- Don't change challenge length/pass score, XP milestones, graduation titles or no-double-reward guarantees.

## 10. Implementation boundaries and quality gates

- **Do not overwrite** the existing `CODEX_TASK.md`, `AGENTS.md`, `GAME_SPEC.md`, `index.html`, `content/WEEK2_RUNTIME.json` or tests just to deposit this specification. Those files may later be changed intentionally by Codex as part of implementation on a new working branch.
- Use stable IDs and human-review flags; no false native-verified pronunciation or TTS promises. Audio buttons may degrade gracefully where no verified offline asset exists.
- Load/save without introducing a new backend or internet dependency. Library content survives reloads, iPhone Safari where local storage works, and desktop offline usage.
- Keep all current scenes, narrative chronology after Day 1, accessibility, mobile layouts, progress gates, Week 1 / Week 2 QA coverage and XP invariant intact.
- Actual implementation must add unit/browser tests and a migration plan; distinguish tests actually run from planned tests.

## 11. Deliverable definition

Codex should produce working modified `index.html`, curated lexicon and grammar reference source data (with review metadata), deterministic vocabulary-to-lesson planner, state migration, new Library map/view, Day 1 narrative adjustments, updated/regression tests and a concise changelog. Preserve the single-file distributable output; make source data editable separately when practical. Codex should push implementation to **a new branch**, open a draft PR if permitted, never force-push or automatically merge to `main`. Implement only after reading the companion task and acceptance specification.
