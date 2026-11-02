# TypeScript and Phaser build decision

Inspected before implementation: the prototype at `2c2f8f7aa0fa941d0f73b388451014243ff4888d` uses a Python assembler with explicit JavaScript module order, embedded curriculum, no package manifest, browser-local saves and a generated single-file `index.html`. Its educational authorities and fourteen-day regression fixture can be retained. The custom `rpg-world-engine.js`/`rpg-renderer.js` are replaced, not wrapped underneath Phaser.

The proposed minimum change was recorded before implementation: pin Phaser plus TypeScript/esbuild, check only the RPG TypeScript with `strict: true`, bundle Phaser and that entry point locally, then let the existing Python assembler embed the result. Keep all educational JavaScript, HTML/CSS interfaces, save keys/validation and shared regression tests. No application framework, development server framework, runtime CDN, TypeScript migration of educational engines, or server database is needed.

The npm registry identified **Phaser 4.2.1** as its current stable `latest` release, distinct from alpha/beta tags. It supports Canvas, tilemaps and Arcade Physics, and the focused integration tests verify those APIs. `package.json` pins Phaser 4.2.1, TypeScript 7.0.2 and esbuild 0.28.2; `package-lock.json` pins transitive resolution/integrity. Third-party MIT notices are committed under `licenses/` and preserved in the bundled code.

## Build flow

```text
npm ci                              # developer setup only
python3 tools/build.py
  -> node tools/build-rpg.mjs
     -> tsc --noEmit                 # strict; only src/rpg/**/*.ts
     -> esbuild src/rpg/index.ts     # Phaser + RPG, browser IIFE, Safari 15 target
        -> generated/rpg.bundle.js
     -> esbuild src/rpg/model.ts     # DOM/Phaser-free test model
        -> work/rpg-model.cjs        # ignored test artifact
  -> existing Python validation/embedding
     -> index.html                  # all code/curriculum bundled locally
```

`python3 tools/build.py --check` recompiles in memory and checks both the tracked RPG bundle and generated HTML. It does not silently update either release artifact. Compiler errors stop the build before packaging. `npm run typecheck` is also the first full-verification check. Contract fixtures with `@ts-expect-error` verify that illegal reward actions, string coordinates and string challenge days stay rejected; no RPG file disables type checking or uses an explicit `any` escape.

Only developers need Node/npm or installed packages. Players and GitHub Pages need the committed static `index.html`; it contains Phaser, the RPG bundle and educational modules. No dynamic imports, module loader, runtime asset server or dependency downloads are introduced. The generated bundle escapes script closing tags before HTML embedding. Existing MP3/device speech behaviour is unchanged.

## Ownership

Phaser owns tilemap layers and collision flags, Arcade bodies/colliders and sensor queries, visible sprite positions, movement tweens, walk animations, camera bounds/tracking, scene updates and Canvas rendering. The TypeScript adapter owns grid intent, content registration, event dispatch, pause state, save coordination and calls into educational services. Its data validator performs safe-spawn/reachability validation only; it does not act as a second live movement/rendering engine.

The existing HTML lesson, assessment and result panels remain above a visible, paused Phaser world. Library and dialogue use native modal dialogs. Phaser audio is disabled so it cannot replace or compete with the educational audio service. Canvas rendering, integer pixels, pointer capture/cancel handling, responsive camera sizes and dynamic viewport CSS are selected for portable mobile behaviour. These decisions do not establish physical Safari verification; current evidence is Chromium plus mobile/touch emulation.

## Additional persistence work required by verification

The full browser suite reproduced an existing cross-renderer race: both queued writers could report success because the second renderer still read an older localStorage cache after the first write. Event-loop delays did not reliably close it. Preserving the requested save guarantee therefore required a small shared TypeScript revision fence and a storage-adapter call, beyond the originally proposed build changes.

`save-fence.ts` keeps only SHA-256 hashes/pending commit metadata in browser IndexedDB, serialized under the existing Web Lock. Progress remains the existing validated localStorage JSON; no learning engine, score store, save schema or server database is introduced. Exact before/after recovery handles interrupted writes, arbitrary bytes remain untouched, denial fails closed with Retry/Export, and only explicit reset rebases a revision. A dedicated deterministic cached-read test and repeated real two-tab tests cover this issue. Raw regression fixtures update payload and coordination metadata together.
