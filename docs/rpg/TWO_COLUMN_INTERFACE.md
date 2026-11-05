# Two-column RPG interface

The RPG uses a CSS Grid world/sidebar layout above 1000 CSS pixels. The world receives approximately 65% of the width; the sidebar receives approximately 35%, with a 390px minimum for readable activities. At 1000px and below, the world sits above the sidebar. This breakpoint leaves room for the map plus a usable learning panel, rather than two narrow columns.

The sidebar keeps day/title, Level, XP, word encounters, Library and Menu visible. Its contextual area hosts exploration controls/Quick travel, the existing lesson and result elements, and native dialogue/Library/Menu/dream dialogs. Learning keeps the world in place and pauses movement through the existing activity rules. Native dialogs retain modal focus, Escape and existing focus restoration while their transparent backdrops keep the map visible. The same behavior applies when the layout is stacked.

`src/rpg/layout.ts` owns DOM placement and observes container dimensions, without storing gameplay state. It moves the existing learning/result nodes and return-to-world control rather than duplicating them. Supporting teacher/listener, scene and audio notes remain available in the existing expandable lesson details. `src/rpg/ui.ts` owns the normal activity lifecycle. `src/app.css` owns the grid, bounded contextual panels, readable Pashto, internal overflow and feedback/Next footer. Long feedback scrolls internally; the success-only sentence-audio control appears near the top so it remains accessible. Study continuation uses an internal sticky footer.

`src/rpg/phaser-world.ts` fits the canvas within its container while preserving the logical aspect ratio and pixel rendering. A container resize updates display size; crossing the existing narrow viewport threshold also updates Phaser's logical size and camera bounds. Pointer coordinates still pass through the displayed canvas bounds and Phaser camera. ResizeObserver callbacks run on container-size changes, rather than every animation frame, and are disconnected during disposal.

The educational engine, translations, challenge ordering, yellow meaning controls, daily spawn/guidance rules, save formats and reward identities are unchanged by this layout follow-up. Ordinary resumption still retains position. Existing frozen challenges retain their exact questions.

## Focused validation

| Viewport | Behavior | Captures |
|---|---|---|
| 1920×1080 | Two columns | [Challenge](two-column/meaning-1920.png), [dialogue](two-column/dialogue-1920.png) |
| 1366×768 | Two columns | [Challenge](two-column/meaning-1366.png), [study](two-column/study-1366.png), [dialogue](two-column/dialogue-1366.png) |
| 1280×720 | Two columns | [Challenge](two-column/meaning-1280.png), [dialogue](two-column/dialogue-1280.png) |
| 768×1024 | Stacked | [Challenge](two-column/meaning-768.png), [dialogue](two-column/dialogue-768.png) |
| 390×844 | Stacked, touch emulation | [Challenge](two-column/meaning-390.png), [dialogue](two-column/dialogue-390.png) |

The focused tests cover keyboard and pointer movement, NPC collision, camera follow, touch coordinates, repeated resizing between narrow/wide logical sizes, unchanged canvas placement during dialogue/learning, portraits, native dialog bounds, focus/Escape, Library/Menu/Quick travel and page overflow. A complete tutorial and challenge run at every listed size. Desktop/laptop checks complete a real Home lesson, including study, grammar, generated sentences, word/construction answers, feedback and return. The challenge integration also checks full-sentence audio, stable Next position, the shared yellow meaning style, both sleep entry points, Day 2 spawn/resume/guidance, and Day 4's required lesson.

Existing Phaser and portrait regressions provide offline rendering, terrain/collision layers, map transitions, reset, touch controls, portrait pixels and fallback coverage. Targeted daily-flow, RPG foundation/persistence, sleep/dream and audio model checks protect the prior fixes. Strict TypeScript, release rebuild/synchronization, JavaScript syntax and documentation links are also checked. See [validation output](two-column/validation.txt).

This is a presentation change with focused integration coverage. The full fourteen-day browser delivery matrix and benchmarks were not rerun; historical reports and their release-specific results remain unchanged. No standalone lint command exists in this repository. Chromium viewport/touch emulation and mocked audio do not establish physical-device Safari behavior or native pronunciation. Very short or narrow viewports require internal activity scrolling; the document itself remains stationary at the tested sizes.
