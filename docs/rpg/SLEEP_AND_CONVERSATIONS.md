# Sleep, Dream and authored Lake conversations

This follow-up preserves PR #36's Library, character art, onboarding, challenge planner, daily lesson flow, world schema 1 and educational schema 8. It replaces the earlier Bilal response sampler and the unstyled sleep delay. Previous validation and delivery reports retain their original release claims.

## Transitions

`src/rpg/transitions.ts` supplies one modal UI veil through the existing DOM/Phaser interface. It does not create a renderer, game loop or permanent animation state. Integer-edged moon, stars and clouds use CSS primitives and bounded Web Animations tracks.

Sleep fades to a dark night sky, displays the upcoming **DAY N**, commits the existing chapter/spawn transaction at darkness, then reveals the room. Its nominal animation phases total about one second. Dream uses a violet star/cloud scene to reveal the existing day/lesson selector; leaving the selector or a review lesson reverses the effect with an Awakening caption. The Menu's completed-day shortcut follows the same Dream entry. Bed and Quick Travel continue to share one sleep handler.

Reduced-motion users receive the same status and state changes without animated fades or drift. The modal and synchronous activity guards block repeat input. A single abort controller cancels active tracks and removes the veil on pagehide or disposal; there are no new animation timers. A failed save prevents advancement. Reload uses the existing durable `{from,to}` sleep intent: a source chapter resumes its one intended successor, while an already committed target does not advance again. Animation phase is never a progression authority.

Dream entry and exit reuse the existing disposable review copy and canonical campaign object. Selector state and visual effects are transient. Review-only lessons cannot write campaign XP, SRS, completion, vocabulary or chapter changes. Exit restores the same house position; reload restores the saved bedroom rather than a resumable dream. Dream transitions do not set the Lake conversation completion flags.

## Authored conversations with generated alternatives

`content/RPG_WORLD.json` now declares a reusable `conversations` registry. Each day specifies the character, authored opening/reactions/conclusion/repeat events, exact intended meaning and compiler ID, Lake prerequisite and distractor rules. `src/rpg/conversations.ts` resolves those specifications using the existing story director and sentence engine; it has no grading, acquisition or reward API.

The intended meaning is authored. Its selectable Pashto and pronunciation come from the exact matching **currently licensed compiler proposition**, rather than a new hardcoded answer bank. Up to three other compiler sentences serve as grammatically valid but contextually irrelevant alternatives. The sampler excludes the topic lemma (water on Day 1, fish thereafter), equivalent text and duplicate meanings. Smaller eligible pools produce fewer alternatives. A selected option opens Bilal's distinct acknowledgment or mild redirection, then a concluding narrative event. It does not merely end the interaction. Continue and Finish conversation are interface controls, not translations of spoken Pashto.

| Day | Intended licensed response | Reinforcement |
|---|---|---|
| 1 | اوبه سړې دي. / `oba saṛe dee.` | Lake description: the water is cold |
| 2 | دینه کب ویني. / `deena kab weeni.` | Named third-person present: Deena sees a fish |
| 3 | زه کب وینم. / `za kab weenum.` | First-person present |
| 4 | ته کب وینې. / `ta kab weeney.` | Informal singular you; first unusual-fish discussion |
| 5 | تاسې کب وینئ. / `taase kab weeney.` | Polite/plural you, with other villagers present |
| 6 | موږ کب وینو. / `moong kab weeno.` | We; Bilal and the player observe together |
| 7 | هغوی کب ویني. / `haghoy kab weenee.` | They; villagers observe while the mystery remains unresolved |

Days 1–3 additionally require a **physically completed corresponding Lake lesson**. Three narrative flags record that distinction because a passed daily challenge also sets ordinary location completion. Only the real standard-lesson result sets these flags; challenge activation/catch-up and Dream reviews cannot impersonate the visit. Bilal offers a short greeting before the prerequisite. Existing profiles without the physical-completion flag can complete a Lake review; no historical visit is invented or save reset performed.

The exact intended proposition must also be available. At lower vocabulary paces or with older frozen location plans, completing Lake may still leave a required word/form unavailable. Bilal then keeps the greeting rather than manufacturing or silently unlocking the response. Model coverage records the actual availability: 22 of 35 day/pace combinations had the target after the exercised material; 13 correctly retained the language guard. Default-pace browser checks complete all seven actual Lake lessons and exercise both response branches. The earlier bare-word mystery question and unrelated-response sampler are removed.

The story director's existing reaction/conclusion triggers mark an acknowledged exchange. An old simple-dialogue trigger under the same main event ID does not falsely complete the redesigned conversation. Later visits use a shorter repeat line. A saved reaction/conclusion cursor takes priority over the repeat so reload cannot silently replace the selected branch. Explicitly leaving a dialogue remains an intentional close. No XP, SRS grade, assessment answer or studied-form record is created by conversation or its audio. Deena's Lake lesson, daily challenge access and the seven-day RPG boundary remain unchanged.

## Authorized Day 2 material and frozen snapshots

The owner explicitly approved bringing the existing third-person “see” material into Day 2 Lake while retaining first person on Day 3. The existing `lemma:v-see` base and `present:2` form now become eligible on Day 2, with curated priority before the other Day 2 Lake verbs. Pashto, senses, pronunciation aids, evidence and approval flags are unchanged; `وینم` remains Day 3 and informal/plural forms retain their later gates. No new morphology was invented.

The exact spelling **دینه** follows the existing owner-approved name register, rather than the illustrative **دینا** in the task. Existing pronunciation aids likewise take precedence over illustrative `wini`/`winam`.

Moving availability changes the compiler card's earliest-day metadata. The lexicon records the exact prior scheduling days, and `restoreCard` accepts that prior day only when it recomputes from those explicit same-form records. All body/proof comparisons remain exact; the stored snapshot is never rewritten. This preserves supported schema-8 frozen questions, choices, grades and rewards without accepting old save formats, broad content repairs or new answer variants. A compact prior-schedule fixture checks round-trip preservation. The previous schema-8 generation digest contract is retained separately; the current contract and affected curriculum/inventory/capacity reports are regenerated from the authorized data.

## Language review

All new fixed NPC openings, reactions, conclusions and repeats are **editorial narrative drafts**, explicitly `userVerified: false`. They are not native-approved phrase exceptions, instructional unlocks or an assessment bank. The human review inventory records their exact Pashto, transliteration and review-only English in [the speech review CSV](sleep-conversations/language-review.csv). No native reviewer or recording is invented.

Native review is still needed for the new narrative questions, acknowledgments, mild redirection, imperatives, past/future constructions, mystery wording and their synchronized pronunciation aids. The intended response forms are already licensed by existing exact-form evidence, but their morphology, grammar and composed naturalness retain the game's existing provisional status. The owner's approval of moving a lesson day does not certify language. No unrelated synonyms or unreviewed spelling variants are accepted.

The shared portrait/dialogue component renders Pashto and transliteration immediately underneath, with Hear Pashto and the existing recording/device-voice fallback. Review-only English is never rendered as Bilal's speech or response translation. Other characters retain their existing presentation. Physical device voices, Laghman pronunciation and iPhone Safari remain unverified.

## Validation scope

The user requested targeted automated checks rather than another whole-week playthrough. New model/browser suites cover the transition lifecycle, normal/reduced motion, duplicate sleep input, committed/interrupted reload, Dream selector/review exits, permanent-state isolation, actual Lake prerequisites, intended responses, both reactions/conclusions, shorter repeats and saved reaction resumption. Existing focused house/sleep/dream, persistence, practical assessment, grammar/approval/schema and generation cache checks cover affected authorities. The practical assessment model checks all fourteen days and five paces; this is not another seven-day manual route.

The earlier full browser delivery matrix/report is retained for its recorded HTML fingerprint and does not measure this release. No historical report hash or screenshots are rewritten to imply otherwise. New running-game captures and actual command outcomes accompany this follow-up. Chromium desktop/mobile emulation and lightweight animation observations do not establish physical-device performance or hardware audio.

Passed focused checks: new authored-conversation models across five paces/seven days; 1280/390px browser checks completing all seven actual Lake lessons and both branches; normal/reduced-motion Sleep/Dream/reload checks; isolated transition lifecycle/duplicate/cancellation checks; existing house/sleep/dream browsers at 1280/375px; previous quest feature regression; all fourteen-day/five-pace practical-assessment models; generation-cache payload/invalidation checks; lesson/progression and narrative models; TypeScript, build consistency, curriculum/schema/approval checks and affected report consistency. No complete verifier or full fourteen-day browser delivery matrix was rerun, following the task's targeted-validation instruction. The preceding delivery report intentionally retains its earlier fingerprint.

Isolated Chromium effect observations: normal durations 666–1243 ms; maximum 18 transient DOM nodes and 16 active animation tracks; sampled p95 frame interval 17 ms. Reduced motion has zero animation tracks. No veil/tracks remained after cancellation. These are local desktop/mobile-emulated UI-effect observations, not physical-device benchmarks.

Separate current captures: [night transition](sleep-conversations/sleep-1280.png), [Dream transition](sleep-conversations/dream-390.png), [Bilal choices, desktop](sleep-conversations/bilal-choices-1280.png), [Bilal choices, mobile emulation](sleep-conversations/bilal-choices-390.png), [Bilal conclusion](sleep-conversations/bilal-conclusion-390.png). The transition captures show the actual dark phase. Choice captures use a coherent configured day/Lake-completion fixture; the new browser suite independently completes the actual lessons. [Effect measurements](sleep-conversations/transition-observations.json) and [command outcomes](sleep-conversations/validation.txt) record their scope.
