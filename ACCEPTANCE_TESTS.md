# Codex acceptance and regression tests

These checks must validate the **modified game itself**. The included `tests/check_handoff.mjs` only verifies this package's specification fixture consistency and is not game evidence.

## Automated logic tests (must add to repository)

| ID | Setup / action | Expected result |
|---|---|---|
| XP-01 | Fresh progress: `xp=0`, no challenges | `Level 1 · Newcomer` |
| XP-02 | Day 1–6 first clear at minimum score, skip all optional lessons | Cumulative XP floors 200,400,600,800,1200,1600; level caps 2,3,4,5,7,9 |
| XP-03 | Day 7 NEW 25-question exam, 20 correct; no visits ever | XP at least 1,800; `Level 10 · New Resident` |
| XP-04 | Plenty of optional/review XP (`xp>1800`) before new exam | Display remains `Newcomer`, level at most 9 |
| XP-05 | First pass is repeated many times | Never re-award first-pass 75 XP/top-up, title or graduation |
| XP-06 | A failed day (11/15) or weekly exam (19/25) | No pass flag, no catch-up XP, no next-day unlock, no title change |
| XP-07 | Save with cleared Days 1–6 and XP below thresholds | Idempotent one-time migration reconciles appropriate floor; does not reset vocabulary/SRS |
| XP-08 | Old save `challenges['7'].passed=true` from 15-question generic quiz | Not treated as new 25-question exam pass, not Level 10, title remains Newcomer |
| XP-09 | Refresh just after first-pass mutation | Persisted XP, pass, awards and graduate state consistent; no double top-up |
| XP-10 | One player with normal lessons, one skip-only player | Both can graduate Week 1; optional visit progress reflects actual visits |

## Browser flows (desktop and mobile sizes)

1. **Day 1:** fresh player completes Muhammad Jan's four greetings; Skip immediately starts his 15-turn challenge with `0/4` optional location visits. Passing exactly 12/15 unlocks Day 2; checkpoint grants at least 200 XP, Level 2.
2. **Day 2:** Skip before school lesson. The 15-turn challenge works, 12/15 unlocks Day 3 and XP>=400. A second fresh playthrough follows **School → Market/Lake either order → Home → Muhammad Jan**. Check the expanded five-sentence lessons at each place.
3. **Day 3:** Skip before Saleha lesson; dinner-shopping challenge with Edris available and passable. Normal route is Lake/Saleha → remaining three areas → Edris's dinner conversation, with contextual first-person grammar.
4. **Day 4:** Skip before Muhammad Jan lesson. Normal route Home first; Market/Lake/School in any order; final conversation at Home. Respectful relationship is maintained: player isn't required to call elder Muhammad Jan informal `ته`. Compound clauses contain appropriate pronouns and verbs.
5. **Day 5:** School/Ms Hameed opening or instant Skip. At lakeside multi-character assessment, name both speaker and addressee. `ته` for familiar singular listener, `تاسې` for respectful individual and groups. No XP exploit from address-choice questions.
6. **Day 6:** Lake must be first on normal route with named Saleha and **Mina**, then Home/Market/School. Day 6 final challenge opens **Hills story scene** with both sisters, exactly 15 turns and threshold 12. Hills is not listed on explorable map, neither on desktop nor phone. Skip direct to Hills works with zero visits.
7. **Day 7:** Edris at Market must open normal route, showing several shoppers (group subject). Home/Lake/School can then be visited. Ms Hameed conducts separate **25-turn School exam**. Skip direct to exam without Edris intro also works. 19/25 fails, 20/25 passes, end button appears only after question 25.
8. **Graduation:** after Day 7 valid pass show title reveal **Newcomer → New Resident**, Level 10, Ms Hameed congrats and total XP; refresh persists status and does not replay first-clear XP. User can replay lessons/challenges without farming level rewards.
9. **Existing systems:** SRS/memory trail, flashcards and audio buttons work for old/new words. Pashto is RTL, UI works on phone, buttons have readable labels/contrast and tap area.
10. **Semantic QA:** no nonsensical action/object combinations, speaker/addressee consistent, plural subject correct, proper Pashto script/diacritics/variants handled fairly. Review with a native Laghman speaker when possible; document unresolved cases.

## Mandatory skip-only progression trace

Fresh `XP=0`, no optional visits; tutorial, Day 1–6 12/15 passes, and Day 7 20/25 pass:

| Step | Min XP | Displayed level | Title | Graded length/pass |
|---|---:|---:|---|---|
| Tutorial | tutorial-earned XP only | 1 | Newcomer | 4 greetings, not daily assessment |
| Day 1 passed | 200 | 2 | Newcomer | 15/12 |
| Day 2 passed | 400 | 3 | Newcomer | 15/12 |
| Day 3 passed | 600 | 4 | Newcomer | 15/12 |
| Day 4 passed | 800 | 5 | Newcomer | 15/12 |
| Day 5 passed | 1,200 | 7 | Newcomer | 15/12 |
| Day 6 passed | 1,600 | 9 | Newcomer | 15/12 |
| **Day 7 passed** | **1,800** | **10** | **New Resident** | **25/20** |

When a normal lesson adds additional XP, the total can exceed a floor; hence check `actualXP >= minXP` and the **capped level**, not strict equality.

## Delivery / reporting from Codex

Report which tests were executed, which passed/failed, and which were not run; do not invent browser evidence. Include fresh and legacy-save tests. State the exact version/commit tested. If an auto-generated Pashto phrase or pronunciation remains unverified, list it as a content review item, not as tested native-language accuracy.
