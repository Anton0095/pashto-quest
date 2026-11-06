# RPG multiday overhaul — implementation and audit

> Historical release evidence: original cast names, screenshots, counts and measurements below are retained. See [the subsequent character expansion](LIVING_VILLAGE.md) for Deena/Medina, the added villagers and its separate validation.


Branch `feature/rpg-multiday-overhaul`, based on main `5606c3602b90386e82cc8504d5e47818cc83d055`. The initial checkout was older; main was fetched and fast-forwarded before edits. No merge into main or hosting deployment is part of this change.

## A. Implementation summary

| Change | Status | Implementation / limit |
|---|---|---|
| 1. World first | Complete | Map precedes compact Level/title/XP/word progress. Menu contains collapsed regional/pronunciation notes and reset. Independent Library and Menu remain. |
| 2. Player terminology | Complete | Player labels use “word”; lemma IDs, counting, inflections and technical documentation remain unchanged. |
| 3. Pixel portraits | Complete | Five approved portraits extracted from supplied screenshots, registered by character ID, embedded offline and loaded through Phaser. Dynamic DOM dialogue/buttons, speaker switching and pixelated scaling verified at 375/1280px. |
| 4. Pashto first | Complete | Pashto recall presents Pashto → transliteration → audio → instructions → controls → feedback. Assessment metadata is compact; detail is collapsible. Reverse translation and construction retain their English source/target so the Pashto answer stays hidden. |
| 5. Capitalise English choices | Complete | Shared display formatter preserves original answer values and existing mixed capitals/acronyms. Lessons, assessments, optional expressions and Library use it. |
| 6. Quick travel | Complete | Location/character labels replace raw lesson IDs. Actor regions follow visiting teachers; Day 6 finale names Hills. The ordinary conversation dispatcher and lesson/skip guards apply. |
| 7. Click/tap movement | Complete in tested Chromium | A*, same animated stepper, terrain/extra collision/actor occupancy, camera conversion, rapid rerouting, manual override, NPC approach, clear interaction lines and overlay cancellation. Physical Safari remains untested. |
| 8. Multiday progression | Complete for Days 1–7 | Existing genuine-pass/ending/Continue transaction retained and tested. Day 7 becomes a nonterminal graduation milestone linked to Day 8; registering the next chapter enables transition without engine changes. Week 2 story remains unregistered. |

All eight changes are implemented. The five previously missing approved portraits were supplied on main (`da13112`) and integrated in the portrait follow-up. `content/CHARACTER_PORTRAITS.json` records the original file and crop rectangle for each character. Crops retain original pixels with transparent padding to 480×560; no resizing, smoothing or baked dialogue controls are used.

## Repository audit and discrepancies

The fetched main already contains a strict TypeScript/Phaser RPG and seven playable chapter registrations. The early Day 1 terminal configuration is retained only as an intentional historical test fixture. Replacing the current application or rebuilding educational progression would discard working systems. The actual remaining terminal restriction was Day 7; it is now a data-driven milestone. The current renderer, input/collision, dialogue, scheduling, save pairing, generation, assessment, XP and audio authorities are documented in [architecture](RPG_ARCHITECTURE.md).

The task mentions 15-question day challenges. Current approved mechanics specify 15/pass 12 for ordinary days and 25/pass 20 for the Week 1 examination. This change preserves both, including the weekly assessment's cumulative bank and Level 10/New Resident award.

Days 6/7 map hosts previously disagreed with existing curricular teachers: Saleha leads Day 6 Home and Day 7 School, Muhammad Jan leads Day 6 Market, and Ms Hameed leads Day 7 Lake. Conditional schedules and event speakers now match those bindings; the curriculum itself is unchanged. Day 5 Home/Market teachers already visited Lake, but dialogue incorrectly said “here at Home/Market”; it now names the visit and Quick travel names the actual Lake destination. Ms Hameed joins the Lake gathering after the four visits.

The initial task references supplied portrait mockups. They were initially absent; the portrait follow-up fetched them from main. The supplied dialogue screenshots are now the approved extraction sources. Day 1's three pending contextual expressions and English profile controls remain existing educational limitations; no new Pashto translations or approval claims were invented.

## B. Narrative verification matrix

“Grammar supported” below means compiler/model and gameplay evidence under the project's existing provisional conventions, not independent native certification. Normal openings are required before ordinary lesson access; explicit early challenges remain the established alternate path.

| Day | Narrative / opening | Lessons / grammar | NPCs and locations | Challenge | Transition |
|---|---|---|---|---|---|
| 2 | School / Ms Hameed; approved Good morning first | Four existing lessons; first actions and productive third-person SOV | School first, Market/Lake, then Home | Muhammad Jan at Home, 15/12 | Pass, ending and durable Continue → 3 |
| 3 | Lake / Saleha; approved daily expression | First-person singular subject and evidenced present forms | Saleha at Lake, Edris at Market | Dinner/produce conversation, 15/12 | → 4 |
| 4 | Home / Muhammad Jan | Informal singular you, I/you contrast, productive coordinated clauses | Home opening and final conversation | Informal conversation, 15/12 | → 5 |
| 5 | School / Ms Hameed; peace greeting/response | Formal/plural you, informal contrast, existing audience contexts | Edris/Jan at Lake; Ms Hameed joins after visits; changing dialogue speakers | Lake gathering, 15/12 | → 6 |
| 6 | Lake / Saleha and Mina; individual Mina identity | First-person plural and compound subjects under documented conventions | Saleha then visits Home; Jan visits Market; Saleha/Mina together in Hills | Hills within Nature, 15/12 | → 7 |
| 7 | Market / Edris; peace response | Third-person plural plus cumulative Week 1 forms/grammar | Ms Hameed at Lake then School for exam; Saleha teaches School | Ms Hameed's weekly exam, 25/20; graduation recorded | Nonterminal link to 8; fixture-tested registration, no live Day 8 story yet |

The default-pace model audit finds productive examples for each intended person/number and Day 4 coordination. Existing full curriculum tests cover all seven paces, normal/early paths, current-day coverage, genuine study versus activation and limited-supply adaptation. Low paces may use vocabulary/approved phrase practice when evidence is insufficient; they do not acquire extra words or static sentence substitutes. Normal and skip public Week 1 routes test the full sequence, including failed/retried challenges, unfinished/unvisited material, exact refresh and saved rewards.

## Changed source groups

- RPG movement/interaction and chapter UI: `src/rpg/movement.ts`, `phaser-world.ts`, `ui.ts`, `content.ts`, `types.ts`, `model.ts` and `content/RPG_WORLD.json`.
- Shared presentation: `src/character-portraits.js`, `content/CHARACTER_PORTRAITS.json`, `src/ui.js`, `src/app.html`, `src/app.css`, and the lesson/challenge/Library/expression/world renderers. The educational engines listed below are unchanged.
- Assembly/verification: `tools/build.py`, `tools/verify.py`, the delivery-audit description, generated RPG bundle/offline HTML and refreshed release-bound delivery evidence.
- Tests/documentation: five new focused suites, public Week 1 route/portrait/relocation assertions, existing UI-test adaptations for formatted labels/collapsible context, updated architecture/expansion/README material and current [mobile](overhaul/mobile-preview.png)/[desktop](overhaul/desktop-preview.png) captures.

## Educational integration and saves

The educational engines remain authoritative: `library-engine.js`, `sentence-engine.js`, `question-engine.js`, `learning.js`, `questions.js`, `progression.js` and `audio.js` are unchanged. No second XP/SRS store, question evaluator, sentence bank or vocabulary schedule is added. Challenges still activate frozen four-location material before generation, distinguish availability from study and hide unstudied word-recall meanings until submission. Once-only rewards, original word locations, pace 0–24, grammar/form licensing and success-sentence audio remain.

Educational schema 7 and world schema 1 are unchanged. No migration or silent reset is needed. Existing RPG keys remain isolated from `pashto-town-days-v1`. World cursors, routes, chapter/position and paired lesson drafts use the existing coordinated persistence. Automatic movement routes are ephemeral; refresh restores the last committed tile. Invalid/unsupported educational saves remain untouched. Web Locks/revision fencing and visible retry/export remain; two separately committed stores are not an atomic shutdown transaction.

## C. Issues and remaining limitations

| Severity | Finding / disposition |
|---|---|
| P0 | No unresolved gameplay/progression corruption found by the reported checks. Save-failure and conflict paths retain the existing visible failure handling. |
| P1 — resolved | All five approved portraits are now extracted and integrated through Phaser; the missing-art blocker is closed. |
| P1 — fixed | Day 6/7 map teachers disagreed with the approved curriculum. Completion-conditioned placements and event identities now match actual instructors; the early weekly-exam invitation follows Ms Hameed while she visits Lake. |
| P2 — fixed | Day 5 visiting teachers named the wrong physical locations; Quick travel exposed raw lesson IDs. Actual destination names now reflect scenes. |
| P2 | Actual iPhone Safari/WebKit device input, audio quality, lifecycle and storage eviction are not verified here. No bundled native-reviewed MP3 pack is added. |
| P2 | Independent native review of inflections, generated language and pronunciation remains outstanding. Existing base/phrase approvals do not certify those. |
| P3 | Days 8–14 have educational content but need reviewed RPG chapter/event/schedule registrations and integrated routes. A nonterminal Day 7 link and inactive Day 8 example support that work. |

## D. Testing evidence

Before the portrait follow-up, the clean `python3 tools/verify.py` run exited **0: 158 successful checks, zero failures**. It includes all models, JavaScript/compiled syntax, strict TypeScript, build/report checks and all browser suites. The [complete command log](overhaul/verification.log) and [public normal/early Week 1 gameplay log](overhaul/week1-gameplay.log) are committed alongside the evidence.

| Commands executed | Final result |
|---|---|
| `git fetch origin main` | Passed; base `5606c36` |
| `npm ci --cache /workspace/work/npm-cache --no-audit --no-fund` | Existing locked dependencies installed; no dependency changes |
| `npm run typecheck` | Passed |
| `python3 tools/build.py` and `python3 tools/build.py --check` | Passed; generated offline release matches sources |
| `node tests/rpg-movement.test.mjs`, `node tests/presentation.test.mjs`, `node tests/rpg-narrative-audit.test.mjs` | Passed, including early invitations at the current challenge host |
| `node tests/rpg-overhaul-browser.test.mjs` and `node tests/rpg-early-exam-browser.test.mjs` | Passed; mouse/touch and resumable Day 7 exam fixture |
| `python3 tools/verify.py` | Passed all 158 checks; 392 educational visits and 196 assessments across fourteen days/seven paces/normal and early routes; full public Day 1–7 normal and early routes |
| `node tools/delivery-audit.mjs --write` and `node tools/delivery-audit.mjs --check` | Passed as final verifier steps; current release-bound observations regenerated |
| `git diff --check` and changed-document link checks | Passed |

The normal public route completes the actual tutorial, all seven days’ lessons, assessments and map travel. The early route explicitly skips visits and assesses their material without claiming physical study. They check mandatory openings, visiting teachers, multi-speaker portrait identities, Day 6 Hills naming, failed/retried early challenges, hidden unstudied recall, exact lesson/assessment refresh, saved day transitions, graduation and once-only XP. The early route explicitly disables usable speech playback and still completes Week 1. The development-only Day 7 fixture independently covers the visiting teacher's early invitation, all 25 submissions, reload and graduation without adding a production skip control.

Current [Hills](overhaul/hills.png) and [graduation](overhaul/graduation.png) captures come from that normal gameplay sequence. Historical maintenance/foundation screenshots were restored after test side effects; current grammar demonstrations and the new overhaul captures are retained.

Tested offline HTML SHA-256: `f0d45cc1166d31e7d5b4c2458ac97f65b855d9765107d4fd6d860e80deaa36a4`. Runtime source/artifact hashes remained unchanged throughout the final clean run. The regenerated instructional audit independently observed 6,676 generated sentence surfaces, with the eighteen fixed-expression exceptions excluded. This is mechanical delivery evidence, not native certification.

There is no configured lint script; strict TypeScript and existing JavaScript syntax checks are the available static checks. Browser coverage is Chromium desktop and mobile/touch emulation, not actual iPhone Safari/WebKit. Physical device lifecycle/storage eviction and native pronunciation were not tested. Audio engine tests mock recordings/voices; the browser early route confirms playback failure does not block progression.

## E. Days 8–14 next steps

Register Day 8's reviewed opening/return/finale/skip/ending and character schedules from the inactive example, raise `lastDay`, then add Days 9–14 against existing curriculum teachers and goals. Preserve Day 14's zero-new-forms rule, 25-question final and Level 10/title rules. Check teacher/scene consistency, incoming/outgoing map paths, greeting licensing, hidden unstudied recall, failed/early routes, exact paused snapshots, reload and first-pass rewards for each registration. Extend the same public gameplay sequence into Week 2 and run actual Safari/device checks before claiming that coverage.

## Approved portrait follow-up

Main `da13112` supplied five full dialogue screenshots. Each 455×532 crop uses `[90,310,545,842]` and transparent padding to a consistent 480×560 canvas, preserving the original pixels. Optimized PNGs live under `assets/portraits/`; source screenshots remain under `public/assets/portraits/`. Character IDs are `edris`, `saleha`, `hameed`, `muhammad-jan` and `mina`.

The builder embeds the extracted files. Phaser's scene preload uses `Loader.image` with character/expression texture keys; the shared DOM portrait component receives the decoded texture sources from the Phaser texture manager. Loading/error states remain explicit, and Canvas failure retains the accessible DOM-image fallback. Dialogue text, buttons and layouts are never part of the extracted asset. CSS `image-rendering:pixelated` prevents browser smoothing.

This isolated presentation follow-up uses focused validation: production build/check, strict TypeScript, presentation model, all-five-speaker portrait tests at mobile/desktop widths, foundation lifecycle/Canvas fallback and overhaul mouse/touch/interface regressions. The earlier 158-check full run and its release hash above remain evidence for that earlier release; the portrait follow-up does not claim a refreshed full fourteen-day delivery matrix or physical Safari coverage. Current portrait captures are linked as [mobile](overhaul/portrait-375.png) and [desktop](overhaul/portrait-1280.png).
