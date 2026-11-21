# Week 1 owner-review correction and implementation handover (Days 1–7)

**Status:** The scoped runtime corrections are implemented. The worksheets retain their frozen review evidence. See the [implementation report](../maintenance/WEEK1_OWNER_LANGUAGE_IMPLEMENTATION.md) for validation, screenshots, scheduling and save compatibility.

**Review provenance:** ChatGPT project conversations 19 and 22 November 2026, documented in `DAY1_OWNER_REVIEW_2026-11-19.md` and `DAY2_OWNER_REVIEW_2026-11-22.md` through `DAY7_OWNER_REVIEW_2026-11-22.md`. Snapshot: `main` `ef23d11e3408d019060530aa94321332acda7c29`. PR #41 contains the reviewer worksheets. No unreviewed item must inherit `native_approved`.

## Owner corrections

| Day | Item | Exact stable identifier | Action |
| --- | --- | --- | --- |
| 1 | V17 Tree | `lemma:expansion:noun:tree` | Romanisation `ona` → **`wona`** on canonical base/citation. Keep `ونه` / Tree. Do not change plural/oblique forms automatically. |
| 1 | B01, B03 Bilal | `bilal-day-1`, `bilal-day-1-correct` | In exact dialogue romanisation replace **`jaheel` → `jheel`**; Pashto `جهیل` and English meanings unchanged. |
| 2 | V29 Brother | `lemma:expansion:noun:brother` | Romanisation `oror` → **`wror`** on canonical base/citation. Keep `ورور` / Brother. |
| 2 | V41 Flower | `lemma:expansion:noun:flower` | Romanisation `gl` → **`gul`** on canonical base/citation. Keep `ګل` / Flower. |
| 4 | V97 Parent | `lemma:expansion:noun:parent` | **Remove the separate Parent card from active curriculum/lessons/question pools.** Retain independent Day 1 Mother `lemma:expansion:noun:mother` (مور) and Father `lemma:expansion:noun:father` (پلار). Do not count either twice. Reconcile 24-lemma pacing fairly. |
| 5 | F07 Fish alternate plural | `lemma:n-fish:research:direct:plural:3aa8f716` | Remove **`کبونه` (kabúna / kabuna)** from active plural instruction, assessment and sentence-generation licensing. Retain **`lemma:n-fish:licensed:1` — `کبان` (kabaan)** as game-approved plural. Preserve historical research evidence separately without teaching the rejected alternate. |
| 6 | V143 Wife | `lemma:expansion:noun:wife` | Romanisation `mermn` → **`merman`** on canonical base/citation. Keep `مېرمن` / Wife. |
| 7 | V165 Weigh / To go | `lemma:expansion:verb:weigh` and `lemma:v-go` | **Preserve distinct senses/IDs for homophonous `تلل`.** The `weigh` form currently cannot generate new sentences; do not claim an existing generation bug. Add semantic-disambiguation checks in prompts, acceptance, distractors and future sentence generation, with contextual argument/valency evidence; do not invent/enable Weigh conjugations. |
| 7 | V178 Purse | `lemma:expansion:noun:purse`, `lemma:expansion:noun:purse:citation` | Change canonical Pashto `کڅوړه` → **`همياني`**, romanisation `ktsora` → **`humyani`**, English remains Purse. Keep distinct Bag `lemma:n-bag3` / کڅوړه and its approved forms; do not infer unreviewed Purse plural/case/gender. |

**Day 3:** all reviewed items approved, no changes.

## Original engineering handover

After PR #41 merges:

1. Create a **new branch from latest `main`**, e.g. `fix/week1-owner-language-corrections`. Read `LANGUAGE_REVIEW.md`, the Day 1–7 owner review logs, this handover and `tests/README.md`; confirm actual canonical fields before any writes.
2. Apply the exact approved edits in authoritative content (primarily `content/LIBRARY_LEXICON.json`, `content/RPG_WORLD.json`, related curriculum/approval registry as appropriate), **not** by editing generated CSVs alone. Preserve previous owner-approval historical evidence; add dated, item-scoped 2026-11-22/2026-11-19 correction records.
3. Exclude Parent and rejected Fish plural **through content/lesson/generation mechanisms**, not through superficial UI filters. Audit downstream `sourceMappings`, curriculum selection, questions, accepted-answer generation, compilation licenses, Library listings, assessment proofs and persistence. Confirm no accidental duplicate entries or dangling IDs, and report any resulting pace shortfall or replacement scheduling decision rather than silently generating a new word.
4. Treat To go / Weigh as **two independently meaningful lemmas that share a Pashto surface**. The current Weigh citation is `composition.enabled=false`; retain that safety boundary. Distinguish English questions and contexts, ensure the engine neither conflates senses nor marks a semantically supported response wrong, and add a regression for homograph/homophone collisions.
5. Keep exact scoped owner approval **separate** from truly native-certified language and actual audio. Do not blanket-approve new inflections, generated constructions, regional variants or recordings.
6. Regenerate derived inventories, review CSVs, language audit and offline `index.html` via documented scripts. Test source-versus-compiled release equality and all relevant baseline checks, including `python3 tools/verify.py` if feasible.
7. Run **targeted browser checks**: Day 1 Tree and Bilal intro, Day 2 Brother/Flower, Day 4 Parent removal while Mother/Father remain Day 1, Day 5 correct fish plural only, Day 6 Wife, Day 7 distinct Purse vs Bag and context-specific Go/Weigh behaviour, plus at least one early-challenge route and saved/reloaded game.
8. Record exact modified IDs, before/after display, reviewer evidence, changed hashes, tests, and unresolved issues in a PR. Do not auto-merge. If tests fail, fix or transparently document them before requesting merge.

## Review gates still open

The 343 recorded-form spreadsheet is not globally approved; only specific displayed Day 5 examples were explicitly reviewed. Noun gender/case/plural gaps outside those examples remain pending. Native Laghman independent review, generated-sentence naturalness/English consistency and physical-device audio validation remain separate Milestone A release blockers.

**Owner-review result:** seven days of displayed base vocabulary, greetings/Bilal dialogue and grammar explanations have been reviewed, with the specific changes above. This must not be interpreted as full language certification of the game.
