# Pashto Quest Week 2 — Codex/GitHub patch preparation

This is **a development patch package, not a finished playable Week 2**. The patch contains a working code-injection script for the requested new interaction mechanics plus the complete Days 8–14 English/narrative lesson plan. **The playable repository is not modified by creating this package.** The new `dialogue` exercise type is dormant until Codex integrates validated Week 2 questions into the actual challenge bank and adds Week 2 days. The 140 sentence targets in the content file are **English intentions**, only 35 draft Pashto model sentences; the translations need review before full in-game use.

## Which GitHub branch?

Use `Anton0095/pashto-quest` **`codex/complete-week1-23850c7`**, because (as of the 23 October inspection) `main` is older and lacks Mina/Hills and the updated Week 1 exam. If Week 1 has since been merged, compare and use the *newer* merged version instead. Do not paste the older build over Codex work.

## Files

- `CODEX_TASK.md`: definitive task to give Codex, including Week 2 route, lessons, and score requirements.
- `ACCEPTANCE_TESTS.md`: QA expectations and full Week 1 regression protection.
- `patch/apply_week2_interactions.py`: strict source-to-source modification of the current Week 1 single-file HTML; does not change main until you run it.
- `patch/test_patch.py`: repeatable static/synthetic JS syntax and scoring checks.
- `examples/week2_dialogue_examples.json`: 12 draft, **not native-reviewed** conversation questions with answer/dud tiles and speaker/addressee details.
- `content/WEEK2_LESSON_DATA.json`: 7 days × 4 places × five sentence targets = 140 English targets; 35 provisional Pashto models.
- `content/WEEK2_DETAILED_LESSONS.md`: narrative dialogue, grammar and learning objectives for all seven days.
- `content/WEEK2_IMPLEMENTATION_NOTES.md`: earlier content-stage assumptions, superseded by CODEX_TASK.md on feature mechanics.

## Quick start: easiest workflow for a new GitHub user

1. Download and extract this ZIP locally.
2. Open your GitHub repository and switch to the **Week 1 Codex branch**, not old `main` (unless it has been merged since).
3. Upload the files into matching folders on that branch, or ask Codex to add these files to the repository from the ZIP.
4. Open a new Codex task with this repository selected. Paste: **“Read `CODEX_TASK.md` and implement it. First check whether the Week 1 branch is already merged and base changes on the newest existing game. Apply the supplied patch to `index.html` after verifying applicability; then integrate the Week 2 narrative lessons and question banks, review translations, run acceptance tests, and prepare a pull request. Do not overwrite Days 1–7, reset progress or force-push main.”**
5. Review the PR and the mobile/desktop playthrough before merging into main.

If Codex wants a direct script command: `python3 patch/apply_week2_interactions.py index.html --output index.week2-preview.html`; after review, `python3 patch/apply_week2_interactions.py index.html --in-place`. This script purposely **fails fast** if the repository's current HTML has incompatible changes; Codex must then port equivalent code manually.

## Important scope boundary

Do not silently unlock content with untranslated or unchecked Pashto. Do not invent a Week 2 XP leveling ladder yet. Maintain Week 1's Level 10 graduation and New Resident title. Extra features (inventory, new locations, dialogue branching, drag-and-drop animations) are not required and remain for later planning.
