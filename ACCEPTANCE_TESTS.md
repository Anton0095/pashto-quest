# Week 2 acceptance and regression tests

## Patch safety / formatting

- [ ] Confirm current `index.html` contains Day 6 Mina + Hills and Day 7 25-question examination; reject outdated `main` HTML.
- [ ] Run `python3 patch/test_patch.py` (fixture insertion, Node JS parser, tile logic); verify `node --check` passes on script extracted from patched full HTML.
- [ ] Original Week 1 `construct` questions still require all their original answer tiles. Starting Day 8, `dialogue` and explicitly authored `construct` questions with a `duds` array permit unused distractors.
- [ ] A mixed prompt `Saleha asks: What does منډې وهل mean?` displays the Pashto term much larger than the surrounding English text. All-Pashto multiple-choice choices and the tile bank are similarly large, including at 375px wide.
- [ ] RTL rendering places the first selected Pashto word at the right and wraps rather than clipping.
- [ ] All display text is installed via text nodes/textContent (never raw question HTML).

## Dialogue-mode scoring

- [ ] Speaker clearly identified; prompt is an actual *question*; player assembles appropriate *answer*. In lake example: `ته څه څښې؟` → `زه اوبه څښم.`
- [ ] Bank has ≥2 authored distractors; distractors cannot be identical to required tokens, repeated, or multiword tokens. Plausible distractors such as wrong verb person are included.
- [ ] `زه` → `اوبه` → `څښم` is accepted even though two or more words remain unused. `زه` → `کتاب` → `څښم` rejected; `ته` + second-person verb form also rejected for a first-person reply when unlicensed.
- [ ] Duplicate correct tokens (where a sentence requires them) can be selected separately and scored; each tile is identified by its *index* rather than its text.
- [ ] Remove/Undo/Clear works before Check. Check is disabled if no tile chosen. Once submitted, response is locked and first score counts.
- [ ] Spaces and final punctuation do not change scoring; incorrect word order/person does. `acceptedPs` alternative answers are scored only when explicitly authored and native-reviewed.
- [ ] XP for a correct first-time dialogue question is awarded at most once per unique day+question ID, even on challenge replay. Wrong attempts do not grant XP. Completing all challenges via Skip does not auto-complete optional visits.
- [ ] Optional Pashto speech button only appears when an actual prompt audio ID maps to a playable resource; no false assurance of recorded native voice.

## Narrative and progression

- [ ] Days 8–14 follow defined grammatical sequence in Week 2 content bank, with named NPCs at their narrative opening location.
- [ ] Days 8–13 contain five contextual sentence targets for each of four locations (20/day); Day 14 is cumulative with 20 sentence targets; all locally reviewed before declaring full release.
- [ ] Day 8 only unlocks after genuine Week 1 examination and New Resident milestone; old generic Day 7 records cannot bypass.
- [ ] Days 8–14 Skip is visible immediately without completing opening lessons and challenges run with 0/4 visited, but regular route begins at specified teacher/location.
- [ ] Day 8–13 challenge size 15, pass 12. Day 14 challenge size 25, pass 20. Retrying does not grant previous first-pass XP twice.
- [ ] Week 2 locale/grammar: relevant nouns/verbs work semantically (no 'door ran'); Pashto and English target each other faithfully; plural agreement and speaker/recipient correct.
- [ ] Existing four explorable map locations remain. No new inventory/physics/game-mode dependency.
- [ ] Week 1 7-day progression, character roles, proper title/level, Day 3 dinner quiz, Day 4 compound sentences, Day 5 respectful you, Day 6 hills and Day 7 weekly examination pass unaffected.
