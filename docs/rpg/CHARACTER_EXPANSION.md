# Character and village-life expansion — approved design (6 November 2026)

**Status: runtime/art implemented on `feature/character-expansion`, pending review/merge.** This document remains the canonical cast and behaviour specification. See [Living village](LIVING_VILLAGE.md) for the implementation, assets, save behaviour, actual validation, limits and owner-approved Pashto name spellings. `content/RPG_WORLD.json` remains the authority for actual NPCs/events; `content/CHARACTER_PORTRAITS.json` owns actual portrait assets. Days 8–14 RPG registrations and Bilal's catch reveal remain future work.

See the [current dialogue and Nayab follow-up](QUEST_IMPROVEMENTS.md) for superseding narrative, gender/design and verification details.

## Character identity changes (mandatory)

| New visible name | Existing ID | Previous name | Narrative role | Visual direction |
| --- | --- | --- | --- | --- |
| **Deena** | `saleha` until a coordinated migration is safe | Saleha | Young Afghan woman, main Lake/nature teacher; older sister of Medina | **Light brown hair and blue eyes**; recognisably Afghan clothing/visual style. Hair colour must actually be visible in the redesigned portrait/sprite. |
| **Medina** | `mina` until a coordinated migration is safe | Mina | Deena's younger sister, approximately ten, introduced in Day 6 and present in later scenes | Retain existing young Afghan girl design direction and no hijab unless newly approved. |

Use **Deena** and **Medina** consistently in all player-visible labels, dialogue, role strings, spoken references, chapter summaries, lessons, generated presentation, descriptions, menus and current documentation. Preserve the sister relationship and Day 3/5/6/8/10/13 teaching roles. Do **not** make Deena and Medina different NPCs from their earlier identities or duplicate their progress. Prefer retaining internal `saleha` and `mina` IDs for stable references/save compatibility unless a coherent migration and full call-site update is demonstrably safer. Do not expose obsolete names in the UI. Historical checkpoint/archive documents may retain original wording, but should carry a clear pointer to this current design rather than being rewritten as if historical tests occurred under new names.

## New villagers (mandatory)

| Character | Proposed stable ID | Role, personality / appearance | Presence and interactions |
| --- | --- | --- | --- |
| **Bilal** | `bilal` | Young Afghan fisherman, dark brown hair, brown eyes. Searching for **a mysterious catch**. | Typically by the Lake and dock; can be approached for conversations that progressively hint at his search. Keep the identity of the catch unresolved for now; do not invent a canonical answer or force a quest completion. |
| **Zamir** | `zamir` | Afghan businessman who **owns multiple market stalls**. | Walks around the Market inspecting his stalls, pausing at different stands. Interactable when stationary and moving; his patrol should look purposeful. Distinct from Edris, who remains a trader. |
| **Nayab** | `nayab` | Young Afghan girl with dark braids, rust tunic and green vest | Participates in a group of children playing in public, walkable village areas. |
| **Sara** | `sara` | Village child; appearance not yet specified | Same playing group; varied, age-appropriate activity and idle dialogue. |
| **Omar** | `omar` | Village child; appearance not yet specified | Same playing group; varied, age-appropriate activity and idle dialogue. |
| **Afiya** | `afiya` | Village child; appearance not yet specified | Same playing group; varied, age-appropriate activity and idle dialogue. |
| **Sanaa** | `sanaa` | Village child; appearance not yet specified | Same playing group; varied, age-appropriate activity and idle dialogue. |

The five children are **five distinct persistent characters**, not interchangeable crowd sprites. They can play, walk short routes and interact with each other in village courtyards/open paths, but must not permanently block doors, the home bed route, lesson-giver access, the dock, transitions, reserved road barriers or player navigation. No unrequested family relationships, definitive ages, religious traits, story secrets, or romance plots should be added. Keep portraits and dialogue age-appropriate.

## Narrative integration and chapter continuity

- **Days 1–2:** Introduce new background residents naturally (if present) without interrupting Muhammad Jan's tutorial or Ms Hameed's mandated School opening. Children provide atmospheric village activity rather than required lessons.
- **Day 3:** **Deena** remains the Lake lesson-giver (first-person `I`). Bilal discusses everyday fishing here; the mysterious fish is first mentioned on Day 4; his optional conversation must not gate Deena or Edris's market challenge.
- **Day 4:** Muhammad Jan remains the Home teacher. Existing Day 4 challenge remains intact.
- **Day 5:** **Deena** participates in the Lake gathering and the established teacher/character movement. Background children and Bilal/Zamir remain optional and do not change the formal/plural `you` objective.
- **Day 6:** **Deena introduces Medina**, her younger sister. Preserve the Lake lesson, Hills group activity and established `we` grammar objective.
- **Day 7:** Edris remains the Market opener and Ms Hameed the weekly examiner. Zamir may patrol independently but must not intercept Edris's interaction or school examination.
- **Days 8–14 (future playable chapters):** Retain the approved educational sequence. All references formerly saying Saleha/Mina should read Deena/Medina. Week 2 NPC events remain *proposed*, not shipped solely because this documentation lists them.
- Bilal's mysterious catch is an **optional, expandable recurring story hook**, first hinted at by the Lake. Do not write a specific reveal, add inaccessible maps or force a new quest/reward/assessment system at this stage.
- Zamir's market inspection and the children's play are **ambient schedules**, not curriculum districts, mandatory teaching visits, graded challenges or XP sources.

## Visual and movement implementation requirements

1. Build game-compatible pixel-art NPC sprites and portraits consistent with the existing Afghan village aesthetics and Phaser rendering. For the renamed characters, do not merely change display text: Deena's new light brown hair / blue eyes must be represented in her portrait, and Medina must be correctly named in hers. Existing user-provided art should be preserved as source provenance; never relabel an unchanged old image as proof of the redesigned appearance.
2. Register portrait paths and corresponding provenance accurately in `content/CHARACTER_PORTRAITS.json`; do not fabricate screenshot crops, SHA digests, ownership, or origin of newly authored assets. If assets are created, identify their actual source and rebuild bundle. Provide legible sprites at existing scale, including five visually distinguishable children.
3. Put each new NPC in `content/RPG_WORLD.json` with one persistent `characterId` and appropriately scoped per-chapter placement(s) and event(s). Maintain the four existing teaching district IDs; ambient NPCs do not affect lesson eligibility or allocation.
4. Implement **moving NPCs** via the existing TypeScript/Phaser world/movement infrastructure, not a second game loop. Zamir traverses a short safe market inspection circuit with pauses at stalls; children use short wandering/play patterns in appropriate public spaces. Bilal can be relatively stationary or move briefly along the lakeside/dock as safe. NPCs must be interactable while moving: safe approach, stop/pause and resume; no impossible collision/interactions or runaway pathfinding.
5. Avoid crowding mobile-sized maps; protect navigation routes, teacher approaches, spawn/return positions and barriers. Ensure movement timers/listeners are cleaned up between maps/chapters and on load/reload.
6. Use optional and contextually suitable dialogue. No unsupported Pashto should be invented or certified. If new Pashto expressions are necessary, they require the existing phrase/language review gate. English narrative dialogue can convey the story without adding new grammatical teaching content.

## Save, QA and scope

- Prefer preserving current character IDs `saleha` and `mina` internally so existing event references, chapter flags and saved positions remain meaningful. If a deliberate identity migration is chosen, update *all* links, event references, portrait lookup and persistence validation together. **No silent save reset**. If incompatibility is unavoidable, document it explicitly and provide a deliberate user-facing handling strategy.
- Do not change daily lesson ordering, pass thresholds, SRS, XP, reward identity, pronoun pedagogy or Day 7 graduation.
- Test all Day 1–7 chapter registrations, opening lessons/challenges, Day 5 relocation, Day 6 sister introduction/Hills, Day 7 exam, skip route, existing saves and reload, NPC movement/interactions and desktop/mobile collision/reachability. Run the repository's targeted checks and build; capture any known limitations accurately.
- Historical reports/blueprints and screenshots are records of old releases. Do not silently edit them or claim past validation covers these new NPCs. Update living docs and add a new change-specific implementation/validation note.

## Implementation handoff

Create a **new branch from latest `main`** for the runtime/asset work; do not implement this expansion directly on `main`. Follow `AGENTS.md`, `GAME_SPEC.md`, `CURRICULUM.md`, `docs/rpg/RPG_ARCHITECTURE.md`, `docs/rpg/VILLAGE_REDESIGN.md` and `tests/README.md`, plus this specification. Build and submit a PR for review.
