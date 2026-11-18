# Milestone A — Week 1 Pashto language-review pack

**State: prepared for review, NOT linguistically approved.** This is a reviewer work package, not an importable language patch or a claim that any Pashto in the game has received independent certification.

**Frozen source baseline:** \`main\` commit \`ef23d11e3408d019060530aa94321332acda7c29\` (18 November 2026 inspection); generated release SHA-256 \`22ca88de9568a70e9abe6570808251704ee4a33d7e88de1177d36feb3cab4fbf\`. Every populated review worksheet has the source commit on each row. Refresh the worksheets against the newer commit if the lexicon, curriculum, dialogue or generation rules change. Do not silently carry verdicts to changed wording or forms.

## Scope and authority

This is the **Week 1 (Days 1–7)** language component of Milestone A. It covers taught bases, their recorded forms, School grammar concepts, fixed expressions, onboarding questions, Bilal's optional dialogue, productive sentence constructions, and initial pronunciation review. It is intentionally distinct from physical-device testing and beginner usability testing, which are companion Milestone A workstreams.

Read [LANGUAGE_REVIEW.md](../../LANGUAGE_REVIEW.md) before approving anything. The game's existing \`user_approved\` label approves scoped base entries and phrases **only**; it does not certify native Laghman speech, inflection, conjugation, naturalness, generated sentences, pronunciation, dialect or audio. \`native_approved\` requires genuine item-specific review evidence; neither a dictionary lookup nor passing automated tests supplies that evidence. Never overwrite author approval or mark unrelated forms as approved.

The target is Afghan Pashto appropriate to Laghman. Ask reviewers to distinguish **standard written Pashto**, **locally natural spoken Pashto**, and **acceptable alternatives**. Record genuine uncertainty rather than inferring morphology or dialect.

## Prepared materials

| File | What to review | Baseline queue |
| --- | --- | ---: |
| [WEEK1_LEXEME_REVIEW.csv](WEEK1_LEXEME_REVIEW.csv) | Canonical spelling, accurate English sense, romanisation and register for maximum-pace planned district vocabulary and early universal words | **183 rows** (168 district + 15 early universal) |
| [WEEK1_FORM_REVIEW.csv](WEEK1_FORM_REVIEW.csv) | Each recorded form of those 183 lemmas: morphology, meaning, evidence, eligibility and pronunciation | **343 form rows** (163 Week-1 productive-eligible, 168 Week-1 reference/nonproductive, 12 future/reference-only) |
| [WEEK1_NOUN_MORPHOLOGY_REVIEW.csv](WEEK1_NOUN_MORPHOLOGY_REVIEW.csv) | Singular/plural, countability, gender, case, alternative or dialect forms, and recorded unresolved evidence | **101 noun rows** |
| [WEEK1_FIXED_LANGUAGE_REVIEW.csv](WEEK1_FIXED_LANGUAGE_REVIEW.csv) | Seven daily expressions, two onboarding questions, 37 scripted Pashto events, and seven compiler-licensed Bilal intended replies | **53 entries** |
| [WEEK1_GRAMMAR_REVIEW.csv](WEEK1_GRAMMAR_REVIEW.csv) | Seven days of curriculum rules and corresponding Grammar Journal concepts | **32 entries** |
| [WEEK1_GENERATED_SENTENCE_REVIEW_TEMPLATE.csv](WEEK1_GENERATED_SENTENCE_REVIEW_TEMPLATE.csv) | Coverage target rows for the actual generated sentences captured from the game; these are **not** pre-approved or authored example sentences | **14 coverage-family targets** |
| [WEEK1_DAILY_CHECKLIST.md](WEEK1_DAILY_CHECKLIST.md) | Day-by-day pedagogical and linguistic acceptance checklist with source-derived dialogue examples | Seven days |
| [REVIEWER_PROTOCOL.md](REVIEWER_PROTOCOL.md) | Review method, verdicts, severity, provenance, correction route and sign-off | Process |
| [GENERATED_SENTENCE_SAMPLING.md](GENERATED_SENTENCE_SAMPLING.md) | Capture the exact rendered compiler outputs, forms and question contexts for human judgement | Protocol |
| [PRONUNCIATION_AND_AUDIO_REVIEW.md](PRONUNCIATION_AND_AUDIO_REVIEW.md) | Human pronunciation and physical-device evidence records | Protocol |
| [MILESTONE_A_LANGUAGE_GATE.md](MILESTONE_A_LANGUAGE_GATE.md) | Decision rules and sign-off template; separates readiness for internal testing from public-language approval | Gate |

## What the worksheets mean

- **Maximum-pace schedule:** district lemmas are the current *fresh-profile 24/day* projection from \`content/DISTRICT_INVENTORY_REPORT.json\`. Other paces, review histories, forced narrative encounters and shortcut routes can expose different items. The worksheet is a baseline, not a proof of exhaustive runtime exposure.
- **Universal entries:** the 15 extra entries come from \`content/VOCABULARY_REVIEW.csv\` with planned day 1–7 and \`district=universal\`; they are not part of the 24 district-lemma quota or necessarily taught at School.
- **Recorded forms:** all forms attached to those 183 lexemes were extracted from \`content/LIBRARY_LEXICON.json\` using stable \`formId\` values. \`WEEK1_PRODUCTIVE_ELIGIBLE\` means grammar-gate and composition-flag eligibility **in principle**, not that the player has seen the form or that a reviewer has verified it. \`WEEK1_REFERENCE_NONPRODUCTIVE\` and \`FUTURE_FORM_REFERENCE_ONLY\` are still visible reference candidates and must not be misrepresented as Week-1 productive teaching.
- **Morphology:** the noun worksheet reports the existing research audit's direct-plural field, even where that field says \`Unresolved\`. A recorded written plural is not automatically a native-approved Laghman plural; an unknown oblique or class does not acquire a guessed value.
- **Fixed dialogue:** the 37 authored Pashto-event records are separate from the seven compiler-licensed Bilal player replies. Some ambient/event records are conditional and have no single day assignment. Do not reclassify narrative speech as assessed vocabulary.
- **Generated sentences:** every sentence reviewed must be copied from an actual lesson/challenge/Library generation state, with seed/route/form bindings or reproducible game steps. This pack deliberately does **not** invent a frozen sentence bank.

## Review sequence

1. Confirm reviewer capability and the frozen commit; use pseudonymous reviewer codes in the public repository. Keep contact details and sensitive consent records privately.
2. Review Days 1–2 first: tutorial, School descriptions/SOV, associated bases/forms, greetings and Bilal replies.
3. Review Days 3–4: first/second singular verb forms and compound-clause naturalness.
4. Review Days 5–7: respectful/plural address, direct noun plurals, plural agreement, Hills dialogue, third plural and Week-1 assessment.
5. Capture and review **actual** generated sentences using the [sampling protocol](GENERATED_SENTENCE_SAMPLING.md); record \`formId\`, \`generatedId\`/proof, English target, grammar context and alternatives.
6. Review pronunciation and recordings independently; a visually correct written form or simulated TTS test is not a recording approval.
7. Triage every \`REVISE\`, \`REJECT\` or \`UNCERTAIN\` finding. Make code/content changes on a dedicated branch, retain old scoped owner approvals as historical records, rerun appropriate language/schema/generation and browser checks, then obtain reviewer confirmation for the *changed* item.
8. Complete the [release gate](MILESTONE_A_LANGUAGE_GATE.md). Do not batch-stamp all forms or sentences as \`native_approved\`.

## Source hierarchy and editing

Authoritative sources: \`content/LIBRARY_LEXICON.json\`, \`content/LEARNING_CURRICULUM.json\`, \`content/GRAMMAR_REFERENCE.json\`, \`content/NARRATIVE_EXPRESSIONS.json\`, \`content/TUTORIAL_PROMPTS.json\`, \`content/RPG_WORLD.json\`; mechanical counts and research provenance: \`content/GENERATION_AUDIT.json\` and \`docs/grammar/NOUN_MORPHOLOGY_RESEARCH.md\`.

The CSV files in this folder are **reviewer worksheets**. They are not runtime data and changing them does not update the game. \`content/VOCABULARY_REVIEW.csv\` is generated and must not be hand-edited. Approved corrections belong in the specific authoritative JSON and approval/evidence record, under the existing \`LANGUAGE_REVIEW.md\` rules, followed by regenerated reports and relevant tests. Do not create a second lexical authority here.

**Observed technical baseline:** the post-merge verification recorded 6,246/6,246 compiled instructional sentence surfaces across ten profiles. That demonstrates generation provenance, **not** spoken Pashto correctness. See [post-merge verification](../maintenance/POST_MERGE_MAIN_VERIFICATION.md) and [instructional delivery](../grammar/INSTRUCTIONAL_DELIVERY_REPORT.md).