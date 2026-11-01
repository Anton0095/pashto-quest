# Foundation audit and delivery

Source: `feature/rpg-phaser-typescript` at `b726f01aae250dcec116ceb7ada1e64a5f8f3895`. Working branch: `feature/rpg-foundation`. Main and production deployment settings are outside this change.

## Initial findings

| Severity | Finding and evidence | Resolution |
|---|---|---|
| P0 | No reproduced catastrophic educational data loss or scoring defect. | Preserve existing authorities and regression coverage. |
| P1 | `ui.ts` advertised configurable opening events but never dispatched them; chapter display, district visit keys, completion totals and challenge captions assumed Day 1. | Validated chapter director, opening modes, ending dispatch, configured presentation, curriculum day and next-chapter resolution. |
| P1 | `dispose()` removed only key listeners, leaving blur/resize/visibility/click/input handlers, dialogs and mutated service methods installed. | Abort scoped global listeners, remove dialogs/controls, restore all wrapped service methods and profile policy; guard pending persistence after disposal. |
| P1 | Blur cleared a held direction but did not make the world inactive, so an in-flight tween could commit while focus was lost. | Focus participates in the active predicate; Phaser cancels uncommitted motion while inactive, restores the body to its committed tile and resumes on focus. |
| P2 | Tutorial standalone construction owned its draft only in the DOM component, so a world snapshot could not preserve tile order/placement. | Shared construction accepts an optional draft/onChange; tutorial keeps it in the existing lesson session and world snapshot validator checks its permutation/indices and rejects a lock without a recorded response. |
| P2 | Dialogue could sequence lines but had no durable cursor, linked events, persistent event effects or return target after a lesson. | Typed story director with conditional messages/actions, flags, once-only completion and lesson return event. |
| P2 | NPC placement ID doubled as character identity (Muhammad Jan has three conditional placements). | Add stable `characterId`, retain placement IDs for schedules; validate consistent names, support optional default locations overridden by daily schedules, and use character identity for interaction history. |
| P2 | World writes rewrote identical JSON and rejected lock promises could poison subsequent queued saves. | Skip identical writes; catch lock rejection, report failure and permit a subsequent retry. |
| P2 | Rendering failure could leave educational content inaccessible from the RPG controls. | Compact keyboard-accessible Learning access disclosure calls the same educational adapters; Canvas startup/context loss reports the fallback. |
| P3 | Old `RPGWorldEngine` import aliases implied a second engine after the Phaser conversion. | Removed aliases; static validation is named `RPGWorldData`. |

The audit covered the required project/product/language/validation/build documents, all RPG TypeScript, world JSON, the offline assembler/bundler, shared construction/tutorial/lesson/challenge/storage/navigation modules and their service boundaries. No unrelated educational JavaScript was converted to TypeScript. Existing overlapping map/building data have different rendering/collision purposes and were retained. The existing question, vocabulary/SRS, sentence, audio and progression logic needs no replacement.

Implementation review also caught an early version of the new ending adapter closing interactive dialogues immediately. The final adapter renders one-line summaries in results while preserving sequential/interactive ending choices and effects. This was corrected before final verification, rather than classified as a defect in the source branch.

## Residual issues

- **P2: separate world/education transactions.** Educational saves settle before a world draft is paired by fingerprint. If abrupt closure leaves an older or mismatched world snapshot, the draft is discarded and the player returns to a safe village position; valid educational knowledge, rewards and frozen active challenge remain authoritative. Visibility/pagehide saves are best effort, not a browser shutdown guarantee. Never resurrect an unpaired draft or merge conflicting learning records.
- **P2: device evidence.** Physical iPhone Safari, interruption/eviction behaviour and speech quality require the manual matrix in the validation report. Chromium touch tests do not certify them.
- **P2: narrative coverage.** Days 2–14 still need approved story configuration, placements, appropriate mandatory story flags and public gameplay tests. The Day 2 example is inactive. No new Pashto or approval status was introduced.
- **P2: isolated interaction timeout.** One exploratory public run timed out with School interaction disabled. A position-only reproduction and a fresh complete mobile/desktop playthrough passed; no causal fix is claimed for that isolated observation. Retain the failure diagnostics and monitor repeated/device playthroughs. The final integrated verification result is reported separately.
- **P3: bounded presentation/assets.** Daily placements are stationary; only the Library has an interior. The prototype uses original procedural art. These remain explicit scope limits.

No P0/P1 issue is intentionally deferred. Full verification and measured comparison are recorded in [validation](RPG_VALIDATION.md), including any failed checks that remain unresolved at delivery.
