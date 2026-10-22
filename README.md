# Pashto Quest — Codex transfer

**Start here.** This directory is a handoff of the latest recovered Pashto Town HTML game plus documentation. **The game itself has not been changed.**

## Run the game

Open **`index.html`** in a modern desktop browser. On iPhone you can transfer this HTML file to Files and open it in a supported browser/Shortcuts flow; exact file access and save behaviour depend on iOS and browser. No installation, web host, Node, npm or online account is needed for text/quiz play.

**Audio notice:** Speaker buttons are wired but **no actual Pashto MP3 pack is included**. Playback works only if you later add a valid `audio/<id>.mp3` pack or the device has its own true Pashto browser voice. Audio cannot be promised offline from the current package.

## Transfer to ChatGPT Codex

1. Download and extract **`Pashto_Quest_Codex_Transfer.zip`** in a normal local folder (e.g., `Pashto-Quest`).
2. Open that extracted folder in Codex.
3. Ask Codex: *“Read `AGENTS.md` and `GAME_SPEC.md` and inspect `index.html`. This is an existing prototype. Do not change any source until I request a specific feature. Summarise the current implementation and the next priority.”*
4. When you decide on a feature, specify it and ask Codex to change only that scope and run the relevant tests from `qa/SMOKE_TESTS.md`.

## What's in the bundle

| File / folder | Purpose |
|---|---|
| `index.html` | **Authoritative playable game; unchanged copy** |
| `GAME_SPEC.md` | Detailed story, characters, language curriculum, challenges, implementation status and proposed backlog |
| `AGENTS.md` | Coding assistant guardrails and source precedence |
| `audio_manifest.json` | Planned audio-file path for each original content record; **no MP3s** |
| `audio/README.md` | How to supply and validate future audio |
| `qa/SMOKE_TESTS.md` | Regression/acceptance test checklist |
| `history/*.html` | Recoverable earlier versions; **archive only** |
| `TRANSFER_MANIFEST.json` | Hashes verifying transfer copies |

The bundled HTML's inline scripts and styles require no other runtime file; audio is the only referenced optional local asset folder. The source contains 230 lexical/sentence records, with a known duplicate ID `a-clean` recorded in the spec (not changed).

## Status clarification

**Already present:** Basic Day 1–7 game, location lessons, character guidance, skip-to-challenge, 15-question daily checkpoints, Day 3 shopping, Day 4 informal-you compound-sentence tasks, Day 5 multiple-audience politeness check, local progress and review UI.

**Still proposals / not completed:** Native-reviewed Laghman pronunciations and real audio recordings, richer narrative Days 6–7, fuller conversations, more robust variation-aware assessments. See status labels in `GAME_SPEC.md`.
