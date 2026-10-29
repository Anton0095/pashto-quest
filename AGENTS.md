# Codex and ChatGPT project instructions

Read `README.md` and this file first. Consult `GAME_SPEC.md` for mechanics, `CURRICULUM.md` for lessons/characters/vocabulary, `LANGUAGE_REVIEW.md` for Pashto/audio, and `tests/README.md` for verification **only when relevant**. `docs/reference/` contains historical editorial plans, not active instructions. Inspect current source to establish implemented behaviour; a discrepancy does not automatically redefine the product goal. See the [documentation roles](README.md#documentation-roles-and-precedence).

## Single sources of authority

- Edit `src/` and playable `content/*.json`, never generated `index.html` directly. Regenerate with `python3 tools/build.py`.
- `content/LIBRARY_LEXICON.json`: precise lexical classes, explicit uncertainty, per-form grammar gates and curated stable-ID introductions. Authored `loop` is provenance, not a live lemma schedule.
- `src/library-engine.js`: one acquisition/form-introduction/SRS store and curated-order district planning.
- `src/sentence-engine.js` + `content/SENTENCE_FRAMES.json`: feature-constrained practice, introduced forms and actually unlocked grammar only. Feature-constrained generated drafts are not native-certified.
- `src/progression.js`: current save factory, XP, results, milestones, reward identity and access rules.
- `src/question-engine.js`: answer evaluation and indexed tiles; `src/learning.js` applies practice transactions. UI renders outcomes.
- `src/save-schema.js`: current-save shape and compiler-proof validation. `src/storage.js`: conflict-aware I/O (not atomic across tabs) and active assessment snapshots. `src/app.js` only composes services and wires controls. Keep authored blueprints in content modules/JSON, apart from renderers.
- `content/LEARNING_CURRICULUM.json`: fixed English teaching sequence; every instructional clause is compiled after actual form study and grammar unlocks. `content/FIXED_PHRASES.json` is the current six-expression exception register; additions follow [phrase review](docs/grammar/FIXED_PHRASE_EXCEPTIONS.md#expanding-the-register). Authored archives are evidence/fixtures only, never teaching fallbacks.
- Four district keys: `residential`, `nature`, `business`, `school`. Library is reference-only; Hills is a Nature scene.
- Preserve 14 curriculum days, characters, normal/skip paths and current learning states. Day 1 excludes lexical action verbs; Day 14 has zero compulsory new lemmas.
- Only **save schema 7** is supported. Do not add old-format migration/backfill/content-repair adapters or silent save resets. Unsupported/corrupt saves remain untouched until explicit user reset.
- Do not add duplicate SRS/XP stores, replay-farmable rewards, or reveal unseen vocabulary's English meaning before answer submission.
- Incomplete language candidates and pending expressions remain inactive. Mechanically complete lexical drafts may be `provisional_playable` only with explicit provenance, `userVerified: false`, and no native-approval claim. No invented native Laghman approval or audio recordings.
- Preserve mobile/RTL interaction and candid audio fallback. Mocked browser testing is not physical-device verification.

## Change process

Use the existing review branch when one is specified. Do not merge or force-push without explicit authorisation. Follow the canonical [risk-based validation policy](tests/README.md#choose-validation-by-change-and-risk); historical reports and command examples do not require repeating their suites.

- Markdown-only changes: check wording, cross-document consistency, relative links/anchors and the final diff. Do not build, play through the game, run `verify.py` (including `--quick`), regenerate audits, refresh screenshots or benchmark.
- Runtime/content changes: run relevant focused checks while editing. Rebuild when inputs to the offline release change. Run the complete suite once on the final integrated state when shared learning, generation, progression, persistence or other broad contracts change. Repeat only for relevant subsequent changes, failures or unresolved concerns.
- Vocabulary/planner/frame changes: refresh affected curriculum, inventory and generation reports after rebuilding, as described in the validation policy. Do not manually change generated evidence or native-approval flags to make checks pass.

Report changed files, actual checks, reasons for omitted checks, material limitations and the PR link. Record task-specific handoffs in PRs, not new root-level Markdown files. Latest explicit user instructions govern task scope and validation; raise a material conflict rather than silently substituting an archived plan.
