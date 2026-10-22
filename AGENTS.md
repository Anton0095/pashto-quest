# Codex project instructions — Pashto Quest

## First read
Read `GAME_SPEC.md`, `README.md`, and the existing `index.html` **before modifying anything**. Read the status legend in `GAME_SPEC.md`. It describes a *working prototype*, not instructions to implement every proposal.

## Preserve this handoff
- **Do not modify source code, data, game behaviour or assets unless the user explicitly requests implementation.** This transfer task is documentation-only.
- Treat `index.html` as the **single authoritative playable source**. `history/` is read-only historical context, not a collection of scripts to combine.
- When asked to implement a feature, make the smallest practical change preserving existing daily progression, historical content and user data. Do not rewrite into a framework or add a backend unless specifically requested.
- After **any future** code changes, report exactly what was implemented, what remains proposed, and tests run; update `GAME_SPEC.md` accordingly.

## Must-preserve product decisions
- Setting: learner lives in a village in **Laghman, Afghanistan**. Prioritise regional Afghan Pashto with standard written Pashto, not automatic Pakistani/Kandahari substitutions; flag local variation for qualified review.
- Present-tense spiral: Day 1 things/it; Day 2 he/she and S–O–V; Day 3 I; Day 4 informal singular you; **Day 5 polite/plural you**; **Day 6 we**; Day 7 they.
- Characters: **Muhammad Jan** (village elder/guide), **Edris** (grocer), **Saleha** (fellow student/friend), **Ms Hameed** (teacher). Do not invent familial relationships. Identify speaker and intended recipient in dialogue.
- **Day 4:** Muhammad Jan may call the learner **ته**, but the learner must not be made to address this elder informally; target peers for player-authored informal you. Include compound I/you clauses.
- **Day 5:** school lesson by Ms Hameed on **تاسې**, lakeside challenge with multiple named interlocutors, choosing **ته** vs **تاسې** based on peer/elder/group.
- Tutorial is compulsory **only on Day 1**. Day 1 challenge skip after tutorial; Days 2+ skip available **immediately** while preserving optional normal routes. Daily pass always requires **12/15** on a **15-turn** challenge.
- Mobile/offline text game remains usable without hosting. If audio is unavailable, never silently use a non-Pashto synthetic voice; verify and label recordings accurately.

## Quality controls
- Check all four locations, narrator/participant identification, RTL Pashto, challenge/retry logic, 7-day advancement and mobile display in `qa/SMOKE_TESTS.md`.
- An existing duplicate `a-clean` content ID is documented. Do not silently rename it without migrating saved-state IDs and related audio filenames.
- Do not claim audio files are included or that a native Laghman speaker has approved content unless those events actually occurred.
