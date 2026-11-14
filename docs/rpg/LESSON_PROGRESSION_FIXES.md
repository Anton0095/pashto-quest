# Lesson and progression fixes — 6 November 2026

> Current ordering and tutorial policy: [School-first curriculum](../../CURRICULUM.md#daily-allocation) supersedes this checkpoint’s opening, optional-tutorial and equal-allocation rules. Historical validation below remains evidence for its recorded release.
This update remains on `feature/character-expansion` / PR #36 and does not merge automatically. Latest main `fa02231` is already an ancestor; the character expansion work is retained. The owner's latest instruction explicitly permits breaking old saves.

## Current behaviour

- **Names:** Deena / دینه / `deena`, Medina / مدینه / `madeena` are canonical in active lexicon forms, English senses, grammar feature evidence, examples, compiler speaker/recipient metadata and speech input. Stable lowercase IDs remain. The display-only substitution/answer-alias module is removed. Portrait source filenames and archived evidence retain their provenance. Current name spelling approval is recorded separately; pronunciation aids and inflected case forms remain provisional.
- **SOV:** Day 2's workshop mounts the shared indexed construction component using a real third-person transitive compiler clause from already introduced forms and unlocked grammar. It is guided, retryable and unscored. Success shows Pashto/English, coloured Subject/Object/Verb spans in RTL order and the existing full-sentence audio control. Continue then enters ordinary sentence practice. Library Grammar Journal exposes the same demonstration; without compatible studied material it explains the prerequisite instead of inventing a clause or unlocking vocabulary. It grants no XP/SRS grades.
- **Local teacher:** Workshop guidance uses the actual `teacherFor(day, location)` and current location/topic. Shared grammatical rules no longer borrow another location's narrative opening. Daily story openings remain character-specific.
- **Day 2:** School remains first. School immediately unlocks Home; Market/Lake are optional before or after Home. The normal finale uses the registered required pair, School/Home. Early challenge eligibility, 15 questions/pass 12, catch-up completion and once-only rewards remain unchanged. Other days retain their existing route policy.
- **Lesson vocabulary:** The lesson pool records noun/verb lemma identities not yet introduced when that visit starts, then confirms their first actual study belongs to this lesson (including interrupted visits). Generated instructional clauses must bind at least one of those identities; earlier visits, including the same day, do not qualify. Other bindings remain cumulative and licensed. Ordinary study excludes previously shown clauses. No new noun/verb means cumulative practice; no compatible clause means a bounded vocabulary/form fallback with an internal deficit reason, never unrelated or invented Pashto. The recorded lesson pool is reused for replay/Dream. Assessments and voluntary revision retain cumulative selection.
- **Pace:** Only 8, 12, 16, 20, 24 are selectable; 24 stays default. Day 14's internal zero-new-word plan remains, independently of the selected setting.
- **Have:** Day 2 Home replaces the newly assigned `to clean` with canonical `lemma:v-have`, **لرل / laral / to have**. The prior clean verb remains for Day 3 onward, including its later forms. Home has 101 district lemmas; other districts have 100 each, plus 73 universal identities: 474 total, with unchanged per-visit quotas. Syntax uses the existing transitive SOV frame, possession semantics, `have`/`has` English agreement and ownable objects; it is not treated as an auxiliary/progressive action. Six explicit present-imperfective forms are stored, not derived by a suffix algorithm.

## Language review

The owner supplied the infinitive, English sense and `laral`; only that base is user-approved. Finite forms are researched written-Pashto drafts, not native-certified:

| Person | Form | Pronunciation aid | First curriculum day |
|---|---|---|---|
| I | لرم | laram | 3 |
| Informal you | لرې | lare | 4 |
| He/she | لري | lari | 2 |
| We | لرو | laro | 6 |
| Polite/plural you | لرئ | laray | 5 |
| They | لري | lari | 7 |

Sources: [explicit لرل conjugation table](https://en.wiktionary.org/wiki/لرل), [Language Mentors introductory course, present-tense Have examples](https://storage.googleapis.com/wzukusers/user-17963676/documents/26e0ee6e754d439094148af2fcb8e048/4.%20Pashto-An%20Introductory%20Course_Teacher%20Edition_Final%20%28Updated%20Jun%203_2025%29.pdf), and [LingDocs present-tense grammar](https://grammar.lingdocs.com/verbs/present-verbs/). These are research references, not Laghman-speaker sign-off. The finite forms, pronunciation aids, possession combinations and new name case forms require human review.

`REVIEWED_LANGUAGE_UPDATES.json` identifies current name-revised spans and researched Have forms separately from the unchanged original authored archives. The builder validates those exact draft records; no full authored sentence bank is used as teaching fallback.

## Save boundary

Educational format **8** deliberately rejects format 7 and earlier, including retired 0/4 settings and previous name proofs. The existing incompatibility screen explains the format, preserves stored bytes and offers explicit export/reset. There is no migration, hidden pace conversion, automatic reset or old-name repair layer. New format-8 plans stay frozen after creation; world schema 1, NPC identities, coordinated writes and reward stores remain.

## Validation

Validation used one complete `python3 tools/verify.py` run, followed by targeted reruns of failed or affected components. The initial run had 189 passing components and eight failures from stale test assumptions (retired tutorial/pace controls, recognition openings/phrase distractors, current teacher names and moving-NPC navigation). Those harnesses were updated to exercise current public behaviour, without changing assessment answers, thresholds or gameplay to satisfy the tests. The full verifier was not repeated as a single command.

- `lesson-progression-fixes.test.mjs` and `lesson-progression-fixes-browser.test.mjs`: six fixes, actual first-study provenance including interrupted visits, current-lesson filtering/fallback, Have semantics/forms, four local teachers, immediate Home access and guided RTL SOV/roles/audio controls without XP/SRS at 1280×720 and 390×844. Both initial and successful demo states fit the viewport.
- `full-curriculum.test.mjs`: 14 days × five paces × normal/skip, 280 visits and 140 assessments; 4,436 independently observed sentence surfaces all compiler-generated. It checks the new-lesson binding rule, real guided demo completion, rendered language, form/grammar eligibility, frozen attempts and rewards. The maintained delivery report is tied to the actual final HTML fingerprint.
- Model regressions include all seven chapter registrations, routes/teachers, world/movement/house, canonical names and speech input, productive generation (18,591 independently checked bindings), current compiler-cache contract, curriculum/approval/schema, practical assessments, rewards/SRS and persistence.
- Browser regressions include current names, portraits, live villagers, lesson entry/full-screen layouts, shared construction, assessment activation/randomness/reload, Library, concurrent saves, save fences, lifecycle/disposal, isolated dreams and the Day 7 exam. All eight initially failing components passed their focused reruns. The public early-challenge route passed Days 1–7; `WEEK1_ROUTE=normal node tests/rpg-week1-browser.test.mjs` then passed the complete normal route through the examination, graduation and completed-day review controls (final 5,160 XP; early-challenge route 1,895 XP), with no browser errors. The normal harness acknowledges pending teacher follow-ups through public interactions before requesting a finale.
- `npm run typecheck`, rebuild/`python3 tools/build.py --check`, source/test/tool/compiled JavaScript syntax, curriculum/vocabulary/inventory/generation/delivery report checks, relative documentation links/anchors and `git diff --check`.

No new benchmark was requested or run. Historical reports, original language fixtures, benchmark numbers and the earlier generation-output contract remain unchanged; the current schema-8 compiler contract is separate. Browser checks use Chromium and touch emulation, not physical iPhone Safari or authentic speaker/audio validation. Native review remains pending for the forms described above.

The preceding delivery evidence is preserved as the [original report](../grammar/INSTRUCTIONAL_DELIVERY_BEFORE_LESSON_FIXES.md) and [original audit JSON](../grammar/attestations/DELIVERY_BEFORE_LESSON_FIXES.json). The original generation-output contract remains `tests/generation-output-contract.json`; the new contract is `tests/generation-output-contract-v8.json`. No historical benchmark figures were rewritten.

Separate current captures: [desktop SOV feedback](lesson-progression/sov-1280.png) and [mobile SOV feedback](lesson-progression/sov-390.png). Original release screenshots are unchanged.
