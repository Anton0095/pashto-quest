# Extending the Week 1 RPG

Days 1–7 are playable on `feature/rpg-week1`. Day 7 is terminal and Day 8 remains inactive. Use the [implementation walkthrough](WEEK1_IMPLEMENTATION.md#adding-day-8-and-future-content) and [inactive Day 8 registration](day8-registration.example.json); the Week 1 model test registers that fixture, a new map and a new NPC using data only.

A normal teaching day needs a chapter ID/curriculum day, presentation, opening/return event, maps/spawn, scheduled stable characters, four existing lesson IDs, challenge host/map, normal finale, explicit early-challenge exposition, ending and next ID. Add these to the single `RPG_WORLD.json` registry. Only raise `lastDay`/change the previous terminal chapter after reviewed content and public route/resume tests pass. Keep the educational backend authoritative for lesson eligibility, activation, scoring, rewards and progression.

For a new location, declare rectangular tile/collision rows, safe spawn, incoming/outgoing transitions, region labels and object events. Add the map to the intended chapter's allowed maps. Test approaches, collisions, camera, event entry and return. Hills demonstrates an additional map belonging to an existing curriculum district; a map does not imply a new vocabulary quota.

For an NPC, retain `characterId` across placements/day schedules; use placement `id` to select coordinates/event overrides. Supply an existing original sprite or reviewed local art. Default locations are optional and are used only when that day has no explicit schedule. Keep lesson IDs/teacher bindings under their existing educational authority when characters relocate. Mina demonstrates introducing a stable person only when active chapter data includes her.

For group conversations, define `messages:[{speaker,listener,text,condition?}]`, eligible actions, optional once-only flags and linked events. Lesson actions can specify `resumeEvent`; challenge actions can declare the explicit route. Scene actions declare a validated position. Chapter `mapEvents` and objects use the same dispatcher. Use story flags for optional future quests, without adding a competing reward store or answer evaluator. Only existing licensed educational activities may grade Pashto.

Known predicates include onboarding, `allLessons`, `passed`/`notPassed`, `lesson:<id>` (delegating eligibility), `event:`/`not-event:` and `flag:`/`not-flag:`. Do not duplicate Day 2 or future access rules in event code. A route's story events and a lesson's actual completion are different facts.

Run `npm ci`, strict typecheck, build/check, registry/model/Phaser/public-route tests, then full verification for broad changes. Benchmark the exact artifact with `RPG_RELEASE=path/to/frozen.html node tools/rpg-performance.mjs` when comparing releases. Preserve historical audits; only the full successful verifier refreshes delivery measurements.

The [foundation expansion guide](FOUNDATION_EXPANSION_GUIDE.md) and inactive Day 2 example are historical compatibility references. They do not describe which days are active in this release. Physical Safari/device audio and new language approvals still require actual review.
