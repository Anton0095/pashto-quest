# Codex and ChatGPT project instructions

> **Integrated user approval (31 October 2026):** [approval record](content/USER_LANGUAGE_APPROVALS.json) records the original 473 base lemmas and 18 conventional phrases. نن (“today”) uses the subsequently supplied `nun`. This approves exact base spelling, listed senses and supplied transliteration; inflections, grammatical analyses, generated combinations, recordings and 59 excluded candidates remain outside its scope. No independent native certification is claimed.

Read `README.md` and this file first. Consult `GAME_SPEC.md` for mechanics, `CURRICULUM.md` for lessons/characters/vocabulary, `LANGUAGE_REVIEW.md` for Pashto/audio, and `tests/README.md` for verification **only when relevant**. `docs/reference/` contains historical editorial plans, not active instructions. Inspect current source to establish implemented behaviour; a discrepancy does not automatically redefine the product goal. See the [documentation roles](README.md#documentation-roles-and-precedence).

**Current lesson/character system:** Read [the character specification](docs/rpg/CHARACTER_EXPANSION.md) and [lesson/progression fixes](docs/rpg/LESSON_PROGRESSION_FIXES.md). Deena/Medina retain internal IDs `saleha`/`mina`, but current lexical forms/compiler metadata use owner-supplied `دینه`/`مدینه` directly. No display-alias compatibility layer remains. Educational save schema 9 deliberately rejects older saves; no migration or silent reset. Seven optional residents/ambient routines remain. Historical reports retain their original release claims.

## Single sources of authority

- Edit `src/` and playable `content/*.json`, never generated `index.html` directly. Regenerate with `python3 tools/build.py`.
- `content/LIBRARY_LEXICON.json`: precise lexical classes, explicit uncertainty, per-form grammar gates and curated stable-ID introductions. Authored `loop` is provenance, not a live lemma schedule.
- `src/library-engine.js`: one acquisition/form-introduction/SRS store and curated-order district planning.
- `src/sentence-engine.js` + `content/SENTENCE_FRAMES.json`: feature-constrained practice, introduced/unlocked forms and actually unlocked grammar only. Feature-constrained generated drafts are not native-certified.
- `src/progression.js`: current save factory, XP, results, milestones, reward identity and access rules.
- `src/question-engine.js`: answer evaluation and indexed tiles; `src/learning.js` applies practice transactions. UI renders outcomes.
- `src/save-schema.js`: current-save shape and compiler-proof validation. `src/storage.js`: Web Locks coordinated I/O with comparison and write inside the lock and active assessment snapshots. `src/app.js` only composes services and wires controls. Keep authored blueprints in content modules/JSON, apart from renderers.
- `content/LEARNING_CURRICULUM.json`: fixed English teaching sequence; every instructional clause is compiled from licensed forms/grammar unlocked by study or explicit challenge activation. `content/FIXED_PHRASES.json` is the current eighteen-expression exception register; additions follow [phrase review](docs/grammar/FIXED_PHRASE_EXCEPTIONS.md#expanding-the-register). The two separately owner-approved authored onboarding questions in `content/TUTORIAL_PROMPTS.json` are limited to their recorded tutorial contexts and never enter ordinary generation. Authored archives are evidence/fixtures only, never teaching fallbacks.
- Four district keys: `residential`, `nature`, `business`, `school`. Library offers reference and voluntary zero-XP practice; Hills is a permanent physical area within Nature, accessible after onboarding; see [the Day 6 invitation flow](docs/rpg/HILLS_EXPANSION.md).
- Preserve 14 curriculum days, characters, normal/skip paths and current learning states. Day 1 excludes lexical action verbs; Day 14 has zero compulsory new lemmas.
- Only **save schema 9** is supported. Do not add old-format migration/backfill/content-repair adapters or silent save resets. Unsupported/corrupt saves remain untouched until explicit user reset.
- Do not add duplicate SRS/XP stores or replay-farmable rewards. New assessments independently plan selection/construction/optional typing; typing defaults off and unstudied targets may use selection. Typed English recall keeps the English meaning hidden before submission; construction deliberately supplies a direct English sentence target.
- Incomplete language candidates and pending expressions remain inactive. Mechanically complete lexical drafts may be `provisional_playable` only with explicit provenance, `userVerified: false`, and no native-approval claim. No invented native Laghman approval or audio recordings.
- Preserve mobile/RTL interaction and candid audio fallback. Mocked browser testing is not physical-device verification.

## Change process

Use the existing review branch when one is specified. Do not merge or force-push without explicit authorisation. Follow the canonical [risk-based validation policy](tests/README.md#choose-validation-by-change-and-risk); historical reports and command examples do not require repeating their suites.

- Markdown-only changes: check wording, cross-document consistency, relative links/anchors and the final diff. Do not build, play through the game, run `verify.py` (including `--quick`), regenerate audits, refresh screenshots or benchmark.
- Runtime/content changes: run relevant focused checks while editing. Rebuild when inputs to the offline release change. Run the complete suite once on the final integrated state when shared learning, generation, progression, persistence or other broad contracts change. Repeat only for relevant subsequent changes, failures or unresolved concerns.
- Vocabulary/planner/frame changes: refresh affected curriculum, inventory and generation reports after rebuilding, as described in the validation policy. Do not manually change generated evidence or native-approval flags to make checks pass.

Report changed files, actual checks, reasons for omitted checks, material limitations and the PR link. Record task-specific handoffs in PRs, not new root-level Markdown files. Latest explicit user instructions govern task scope and validation; raise a material conflict rather than silently substituting an archived plan.

## Practical assessments and grammar reference

`content/GRAMMAR_REFERENCE.json` belongs to the read-only Library Grammar Journal. All concept explanations and worked analyses are readable without generation unlocks. New daily/weekly assessments must contain only word/phrase recall, sentence meaning/construction or contextual dialogue; insufficient sentence supply uses vocabulary/approved phrases, never English rule/category quizzes. Old grammar-question instructions are superseded. Earlier format-8 attempts are unsupported in schema 9; retain safe export/reset handling, with no migration or silent reset.

## Shared construction and challenge completion

`src/construction-ui.js` owns the indexed tile renderer, variant instructions, direct English target and success-only full-sentence audio across lesson/assessment/Library construction. No construction role-play or narrative reply instructions. `progression.activateChallenge` unlocks the current frozen four-location lesson material and grammar **before generating a new challenge**, via `LibraryEngine.unlockDayMaterial` and the shared lesson pool. Prefer current-day words in generated tasks while retaining cumulative revision. Activation changes availability, not actual study, grades, XP or visit completion. Record `challenge-start` provenance; record later physical study separately per form. First-pass rewards/completion remain once-only. Resumed snapshots keep their exact questions and show a notice when they predate activation-time generation. No reroll, fake mastery, future/reserve vocabulary or new Day-14 forms.

## Lesson presentation and entry

`src/answer-feedback.js` renders status plus actual Pashto, transliteration and English; evaluators own accepted alternatives. RPG lesson choices and direct Quick Travel share the guarded starter in `src/rpg/ui.ts`. Do not launch teacher dialogue on waking, map entry or lesson return. Opening/follow-up story content stays available through explicit NPC interaction. Intrinsic layout rows use one active overflow owner; avoid fixed feedback reservations and nested scrollers. Legacy tutorial profile/tile compatibility is intentionally removed: obsolete saves/drafts may be rejected, with no migration adapters.
