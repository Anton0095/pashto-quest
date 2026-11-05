# Character expansion and living village

Implemented on `feature/character-expansion` from main `fa02231`, pending review and merge. The [approved cast specification](CHARACTER_EXPANSION.md) remains the narrative/design authority; [RPG_WORLD.json](../../content/RPG_WORLD.json) owns actual NPCs, chapter presence, English dialogue and activity configuration. [CHARACTER_PORTRAITS.json](../../content/CHARACTER_PORTRAITS.json) owns actual portrait files/provenance. [Architecture](RPG_ARCHITECTURE.md) maps the runtime services; [CURRICULUM](../../CURRICULUM.md) and [GAME_SPEC](../../GAME_SPEC.md) retain teaching and progression authority.

## Cast and art

Deena retains `saleha` and Medina retains `mina`, including event IDs, encounter flags and lesson/reward identities. Deena's new portrait and procedural world sprite show light brown hair and blue eyes. Medina retains her original portrait and young Afghan girl design without a hijab. Her Day 6 Lake introduction, sister relationship and Hills presence remain intact. Existing teachers, Day 5 gathering/relocations and Day 7 examination remain unchanged.

Bilal (`bilal`) stands on the lakeshore beside the dock approach, without occupying the dock. His optional conversation leads to hints about ripples/splashes; acknowledging them changes a story flag, so a later conversation mentions a shadow. The catch remains unidentified. Zamir (`zamir`) owns several stalls and inspects a four-stop Market circuit independently of Edris. Nayab, Sara, Omar, Afiya and Sanaa each have a stable identity, distinct portrait/clothing/hair and short walking/running routines in the School's open courtyard. They gather near a shared meeting point with separate starting delays, speeds and pauses. No ages, family ties, religious traits or romance are invented for these five children.

All seven additions are optional background residents on Days 1–7. They teach no new Pashto, add no district/quota, quest completion, assessment, XP or required visit. Their dialogue is English. Before the mandatory tutorial completes, the existing onboarding interaction guard still directs the player to Muhammad Jan.

The original screenshots remain in `public/assets/portraits/`, including historical filenames. The separate generated eight-portrait source atlas is [village-cast.png](../../public/assets/portraits/generated/village-cast.png). It was created with OpenAI image generation for this task, then prepared as separate cell crops, nearest-neighbour fits, transparent padding and binary-alpha edges. It is not a screenshot crop. Each new WebP records the actual source SHA-256, crop, preparation, file SHA-256 and Canvas-compatible RGBA digest. Transparent RGB bytes are normalised to zero for the latter; this avoids decoder-specific invisible RGB values. Retained source-crop metadata remains exact. Deena's former `assets/portraits/saleha.webp` and its screenshot remain available as historical source art, separate from the redesigned `deena.webp`.

The builder embeds twelve neutral WebP portraits for offline use; Phaser preloads them and the shared portrait component displays them. No runtime asset requests are required. World sprites are authored procedural 16×16 directional atlases in `phaser-world.ts`, with distinct palettes, hair, clothing details and shorter child silhouettes; they are not generated portrait crops or claimed screenshot extractions.

## Activity architecture

`activities.ts` owns only optional ambient movement state. `VillageScene.update` drives its bounded grid steps and visual interpolation alongside the existing player controller; there is no second loop, interval or NPC tween queue. Paths use the shared A* and walkability infrastructure. Example registry configuration:

```json
{
  "activity": {
    "zone": {"x": 23, "y": 41, "w": 6, "h": 8},
    "stops": [{"x": 24, "y": 41}, {"x": 28, "y": 41}, {"x": 28, "y": 46}, {"x": 24, "y": 48}],
    "stepMs": 260,
    "idleMs": 2400
  }
}
```

Stops and bounded public zones are authored, not free roaming. Paths exclude solid terrain and a two-tile neighbourhood around teaching placements across schedules, world objects, spawns, doors/transitions and reserved road approaches. Current and destination NPC tiles are reserved; the player's in-flight destination is reserved too. Actor bodies and animation positions update in place rather than rebuilding the group each step. Pathfinding runs when a pause ends or a blocked route needs another attempt, never continuously during idle frames.

A pointer/touch selection holds a moving target at its last committed tile while the existing player controller approaches. Nearby residents also pause to avoid walking into the player, and new steps leave a one-tile buffer around the player and the player’s destination. An artificially surrounding saved group yields an escape tile. Dialogue, Learning Mode, blur and hidden tabs use the existing activity guard; unfinished ambient steps return to the committed tile and animations stop. Exploration resumes the routine. Directional input/new destinations release selection. Map relocation cancels flights and paths; scene shutdown removes the existing pointer listener and releases Phaser resources. There are no ambient timers/listeners to leak.

## Saves and educational boundaries

Education schema 7, world schema 1 and coordinated storage keys remain unchanged. World state gains optional `activities`, keyed by persistent NPC ID, containing the settled tile/map, facing, stop/turn and remaining idle delay. Existing valid saves without that field use authored placements. Validation bounds the optional records; unsafe or occupied routine tiles recover within the activity zone, leaving the player and education records intact. Player recovery uses settled live NPC positions, so standing on a vacated routine starting tile does not reset the player to spawn. Reset clears routines deliberately with the campaign reset. No old-format migration or silent progress reset is introduced.

Only the active map's routines advance; there is no offline or off-map time simulation. Paths and unfinished steps are transient. Settled states are captured through ordinary world saves, map transfer and lifecycle flushes; ambient motion alone produces no independent save stream. A sudden unflushed shutdown can restore an earlier routine position, subject to the existing best-effort/two-store persistence limits. Exact animation phase is not restored.

Supported frozen assessments retain their exact compiler proofs, questions, choices, scores and rewards. Historical name spans remain exact inside immutable lexical evidence and compiler proofs. The owner-approved `CHARACTER_NAMES.json` register renders current Pashto, English and pronunciation aids across teaching surfaces; indexed tiles/choice values still refer to the same stored forms. Typed English recall maps the current visible name to its existing identity before the unchanged evaluator. No proof is rewritten or regraded. Approval records, source filenames and archival fixtures retain their original names as evidence.

The educational backend still covers Days 1–14; the playable RPG registers Days 1–7. Week 2 cast references use the new names but require additional narrative/map/event registration before becoming RPG chapters. Challenge completion grants educational completion/access; it does not advance the active RPG chapter. Explicit sleep still requires a genuine pass, narrative acknowledgements, successor eligibility and no paused retry. Day 7 retains its boundary. Dream practice still runs in a disposable copy with no persistent XP, SRS, unlocks or campaign progression.

## Verification and limits

The change uses targeted model/browser validation rather than another complete multi-day playthrough. Historical educational-delivery and benchmark reports retain their recorded hashes, observations and original cast; they do not measure this release. New screenshots are separate from earlier evidence.

Passed checks:

- `npm run typecheck`, `python3 tools/build.py`, `python3 tools/build.py --check`, source/compiled JavaScript syntax and final diff checks.
- `character-expansion.test.mjs`: seven-day simulations, all seven added identities, moving occupancy/reservations, teacher/transition approaches, selected-target holds, settled reload and invalid optional-state recovery; current-format frozen assessment metadata/proofs restore byte-for-byte.
- `rpg-week1`, `rpg-movement`, `rpg-narrative-audit`, `village-redesign`, `rpg-persistence`, `rpg-foundation`, `daily-flow`, `house-sleep-dream` and `presentation` models: chapter boundaries, both route policies, teaching roles/Day 5 relocation, Day 6/Hills, collision/recovery, sleep and isolated dream rules.
- `practical-assessment.test.mjs`: 196 attempts across fourteen days/seven paces/both routes, 392 model visits, unchanged thresholds, licensed content, frozen restoration and retired snapshot preservation. `productive-generation`, `generation-cache`, `game-state`, `approved-sentences`, `curriculum-expansion`, `cleanup-model` and `concurrent-save` model checks also passed. The recorded pre-optimisation generation payload digests remain exact.
- `character-expansion-browser.test.mjs`: desktop 1280px and mobile/touch 390px, moving Zamir approach, pause/resume, settled routine reload, Bilal's repeat conversation, Deena/Medina introduction, Lake lesson/Hills entry, children moving with stable actor counts, old saved role-label aliases and no horizontal overflow/browser errors.
- `portraits-browser.test.mjs`: all twelve embedded portraits at 375/1280px, actual decoded pixel hashes, dynamic roles, offline decode and pixelated rendering.
- `phaser-browser`, `rpg-foundation-browser`, `rpg-maintenance-browser`, `house-sleep-dream-browser`: desktop/mobile terrain and NPC collision, camera/transitions, overlay/blur pause, quiet dialogue reload with explicit resumption, repeated Library and disposal, restored story/sleep gates, pending-commit disposal and a complete disposable dream lesson with unchanged campaign bytes.
- `rpg-early-exam-browser.test.mjs`: actual 25-question Day 7 early exam from visiting Ms Hameed, exact locked reload, pass/graduation and reward lock.
- `approved-language.test.py`, curriculum/generation audit checks and district inventory checks. Only current inventory participant labels required regeneration. Base lexical evidence and the earlier lemma/phrase approval records remain exact. The subsequent name-spelling approval is separate; frames, compiler, evaluator, learning, educational progression, schema validation and storage remain unchanged.
- Relative documentation links/anchors across current and changed Markdown files.

Some retained tests still expected the preceding release's automatic dialogue reopening, removed `.sentence-roman` feedback element or presence of the three removed pending onboarding slots. Their expectations were corrected to the current quiet-entry/feedback/exclusion rules; no gameplay or language data was changed to satisfy them. Contemporary cast assertions use Deena/Medina; historical fixtures and digest baselines stay exact.

The embedded HTML grows from 4,647,534 bytes to approximately 6.04 MB because it includes the additional portraits and routines. This is an artifact-size observation, not a new startup/frame-rate benchmark.

The two full seven-day public playthroughs and fourteen-day browser delivery/benchmark matrices were deliberately not repeated: the task requests focused checks, the shared compiler/evaluator/progression/storage remain unchanged, and the targeted seven-day registry/teacher models, 196-assessment matrix and actual Day 7 browser exam cover the relevant boundaries. Historical reports were not refreshed or claimed as current performance evidence.

| Running-game capture | Image |
|---|---|
| Deena's new portrait through Phaser | [Desktop](living-village/deena-1280.png) |
| Moving market owner interaction | [Desktop](living-village/market-1280.png) |
| Courtyard children | [Mobile-sized](living-village/children-390.png) |
| Bilal's optional lake conversation | [Mobile-sized](living-village/bilal-390.png) |
 Chromium desktop/mobile emulation does not establish physical iPhone Safari, hardware audio or long-duration low-memory performance. Bilal's catch reveal, broader roaming, new districts, offline routine simulation and playable Days 8–14 remain outside this implementation.

## Approved name spellings

The owner supplied **مدینه** for Medina and **دینه** for Deena on 5 November 2026. [CHARACTER_NAMES.json](../../content/CHARACTER_NAMES.json) records the exact replies, stable people/lemma IDs, previous evidence tokens and current name surfaces; [USER_LANGUAGE_APPROVALS.json](../../content/USER_LANGUAGE_APPROVALS.json) links this narrowly scoped approval. New spelling approval does not certify pronunciation, case analysis, composed sentences or audio.

`character-names.js` replaces only whole registered name tokens in Pashto/English and the provisional pronunciation aids. It is a presentation of the same named people, not a new lemma, grammatical rule, reward or SRS store. Existing lexical attestations and frozen proofs remain exact, so valid saves need no migration or reset. Both new and resumed questions render the supplied names. Indexed construction/choice values retain their original identities; typed current English names resolve to those same identities before grading. Library search uses the visible names. Speech synthesis receives current Pashto; an old-name recording is not replayed for changed text.

The supplied base spelling is used literally, including within existing possessive/compound chunks. No new inflected spelling is invented or declared approved. Case usage and `madeena`/`deena` pronunciation aids remain editorial/provisional; Library name entries state that limitation. The earlier evidence retains its original grammar analyses for review.

`character-names.test.mjs` checks exact supplied spellings, whole-token boundaries, pronunciation/approval scope and stable underlying forms. `character-names-browser.test.mjs` passes at 1280/390px: both current names in real typed recall and locked reload, unchanged frozen questions/XP locks, real licensed construction through displayed name tiles, unchanged proof bytes, feedback, Library search and mocked speech text. The actual 25-question Day 7 early-exam browser check also passes with current labels. Game-state, existing-save, approvals, audio, generation digest and build checks pass. Historical generation-output digests remain exact; no benchmark or delivery-report history was rewritten.

Running-game spelling captures: [Medina, mobile-sized](living-village/medina-spelling-390.png) and [Deena, desktop](living-village/deena-spelling-1280.png).
