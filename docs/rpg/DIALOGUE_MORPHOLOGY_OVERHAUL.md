# Dialogue and morphology overhaul

Phase 1: central bilingual display names preserve internal identities and portrait lookup. New written names are display-only provisional records, with per-record review status; they do not acquire lexical approval. Muhammad Jan, Edris, Deena and Medina reuse existing lexical spellings. Other names require character-specific review; Bilal/Hameed/Zamir have attested name spellings in https://www.pashtovoa.com/a/1880565.html.

Bilal accepts School, Lake or challenge eligibility, permits repeat responses, and records successful days independently in world flags without educational rewards. The incorrect-response narrative uses an explicitly provisional imperative redirect and a live navigation action to Deena. Its compound imperative analysis follows https://www.lingdocs.com/blog/pashto-compound-verbs/ and the Heston dictionary grammatical sketch; no native Laghman certification or assessment licence is claimed.

Ordinary conversations are nonmodal and can be dismissed through the shared movement path. Tutorial, chapter opening/ending acknowledgements and active assessments remain protected. Ending text remains on results; chapter ending effects are acknowledged there rather than through an extra completion conversation.

Focused milestone checks: strict TypeScript, rebuilt release, seven-day Bilal eligibility/repeat model, and shared bilingual lesson identity/review reward lock in a browser. Full integrated validation follows the morphology phases.

## Individual forms (Phase 3)

Educational schema 9 distinguishes encountered forms, generation availability and acknowledged flashcard study. `formUnlocks[formId].studiedDay/studiedLesson` records formal teaching; existing per-form SRS remains authoritative. Previewing an unacknowledged flashcard or reading Library reference never grants formal study. The first acknowledged eligible form introduces its lemma once, including finite-first verbs; every recorded form then becomes reference-readable. Voluntary reference practice changes only its practice/SRS record. Challenge activation/pass grants availability without manufacturing acknowledgement or mastery.

Plans freeze `firstFormSelections`, `studyPools`, generated activity IDs/proofs and grammar dependencies. RPG lesson snapshots retain the exact card index and acknowledged form IDs. School's concept acknowledgement precedes dependent flashcards; compulsory generated practice uses formally taught forms only. Additional inflections are capped at four per lesson; Day 14 adds none. Assessment lexical targets resolve to available forms, rather than assuming a citation form was taught.

Focused checks: `form-lifecycle.test.mjs`, `challenge-activation.test.mjs`, noun audit, typing regression and strict TypeScript/build. New dictionary plurals also carry explicit English count semantics; no Pashto stem or suffix is generated.

## Revised curriculum (Phase 4)

Days 1–4 retain description/equative, SOV/third singular, first singular and informal second singular/coordination. Day 5 now explicitly teaches polite/plural second person and noun plurals. Days 6–7 continue first/third plural and plural agreement before the Week 1 exam. Days 8–13 teach demonstratives, numbers 1–5/quantity consolidation, spatial/case constructions, possession, questions and adverbs. Day 14 remains cumulative with no compulsory new lemmas or forms.

Direct noun plurals and their evidenced adjective agreement forms now depend on `grammar-day-5`. Quantity frames/numerals still depend on Day 9; case and ownership requirements remain separate. A live form gate reads grammar prerequisites plus explicit curriculum restrictions; `firstAllowedDay` remains a derived audit projection, rather than a second schedule tied to an authored lemma day. Plural-first nouns require an already taught compatible plural adjective, with semantic agreement. Numbers four/five lack productive construction evidence and remain isolated word study/reference.

## Integration coverage (Phase 5)

`form-dialogue-browser.test.mjs` drives the real RPG tutorial and School on desktop/mobile, checks an unacknowledged card across reload, reads Library future-form status, repeats School-unlocked Bilal with a durable tick, and initiates movement from ordinary dialogue. `rpg-week1-browser.test.mjs` retains public normal/shortcut playthroughs and now remembers all actually displayed glosses for a Pashto spelling, rather than assuming one spelling has one form/context. Portrait assertions check the stable English identity within the bilingual header. Lesson-pool deduplication uses the stable form identity, so citation and form aliases cannot teach the same form twice in a visit. Full final-suite results are recorded below after cleanup.

## Targeted cleanup (Phase 6)

Removed the shared typing-setting migration and pairing adapter, historical generated-card day/romanisation repair, retired English-rule assessment UI/archive handling, old schema-8 acceptance fixtures, and Bilal's `conversationCompleted`/`alreadySpoken` gate. Teacher navigation text now comes from the shared progression/location guidance; challenge-action filtering stays separate. Removed the redundant post-result conversation branch. Stable form IDs, approval records, dictionary evidence, current frozen proofs, active narrative/maps, SRS/XP transactions, audio and cross-tab coordination remain. Generation digest coverage has a new schema-9 contract; prior contracts remain identifiable historical evidence.

The independent world position format stays at version 1; lesson snapshots are restored only when paired with a valid schema-9 educational fingerprint and pass current lesson validation. Incompatible educational data is preserved behind explicit export/reset handling. No migration or silent reset is performed.

## Browser-driven corrections

Integration found duplicate citation/form aliases in a lesson, disappearing guidance during sequential dialogue, and a sentence-card label incorrectly inherited from its first lexical slot. Pools now deduplicate by form identity; a persistent guidance panel precedes teacher speech; sentence labels stay distinct from form introductions. After a pass the initial teacher speech contains only return-home guidance, while review and optional event actions remain available. Composite character labels format each canonical name bilingually. The Library distinguishes reference-only, assessment-activated and acknowledged forms, alongside mastery/SRS status.

Regression fixtures now acknowledge School concepts and form cards explicitly, test finite-first Have rather than assuming an infinitive, reject obsolete pronunciation proofs, and verify each route’s frozen form selections instead of assuming identical study histories. Normal/shortcut lemma allocations, scoring, reward locks and current frozen-proof checks remain asserted.

## Final verification

The full `python3 tools/verify.py` run completed with 238 passing checks and one stale cleanup UI fixture. That fixture was corrected to assert canonical bilingual names and acknowledgement-before-grammar unlock, then `node tests/cleanup-browser.test.mjs` passed at both 375px and 1280px. Its syntax check also passed. No runtime/release inputs changed after the matrix, and no verification failures remain.

- All fourteen educational days × five vocabulary paces × normal/shortcut: 350 rendered lesson visits and 140 assessments.
- Real public RPG Days 1–7: desktop normal and mobile shortcut journeys, including failed attempts/retries, reloads, Hills, sleep, graduation and reward locks.
- Focused desktop/mobile form acknowledgement/reload/Library, bilingual/group labels, repeatable Bilal success, moved teachers and keyboard/mouse/touch dialogue interruption.
- Strict TypeScript, compiled/source JavaScript syntax, current build equality, noun/curriculum schemas, generation/district audits, SRS, storage conflicts and frozen proofs.
- `node tools/delivery-audit.mjs --write` and `--check`: 6,131/6,131 observed instructional sentences compiler-generated; zero authored curricular fallback sentences, with the existing 18 explicit phrase exceptions kept separate.

Physical iPhone Safari/native-device pronunciation remain unverified. Release SHA-256: `7e3e777c51325e004d5952779e56ce6e379b62d6dcceb48dac1f4b3ca2a98df4`.

## Review captures

Current release captures, separate from historical screenshots:

- [Bilingual repeatable Bilal dialogue](dialogue-morphology/bilal-dialogue-desktop.png)
- [Mobile form-introduction card](dialogue-morphology/form-introduction-mobile.png)
- [Library form history and reference status](dialogue-morphology/library-form-history.png)
- [Day 5 plural flashcard](dialogue-morphology/day5-plural-form.png)
- [Day 5 generated plural activity](dialogue-morphology/day5-plural-sentence.png)
- [Graduation results without another conversation](dialogue-morphology/graduation-results.png)
