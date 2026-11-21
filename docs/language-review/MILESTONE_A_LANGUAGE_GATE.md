# Milestone A — Week 1 language acceptance gate and sign-off

**Initial state: OPEN / NOT REVIEWED.** This is a release-control document, not an attestation. The review queues were populated from commit `ef23d11e3408d019060530aa94321332acda7c29`; none of the new review worksheets contains an independent native-language approval.

Milestone A comprises **language correctness**, **actual-device pronunciation**, **learner-facing usability**, and **technical release validation**. This file controls only the language portion and its dependencies. Closing the language gate does not by itself close all of Milestone A.

## Gate levels

| Gate | What it means | Current disposition |
| --- | --- | --- |
| `A0 — Pack prepared` | Reviewed-scope and exact source-derived queues exist; forms and narrative IDs trace to the repository; no approval implied | **Prepared in this documentation branch; pending merge** |
| `A1 — Internal language playtest` | High-risk Day 1–7 content has been sampled/reviewed, known provisional material clearly identified, active S0/S1 findings isolated or fixed; human testers told language is not yet certified | **Not signed off** |
| `A2 — Week 1 native-language approved` | Every active, reachable Week-1 teaching/assessment/fixed-language item is reviewed or explicitly disabled; sampled generation coverage and adjudications are complete; native review evidence is recorded at exact IDs | **Not signed off** |
| `A3 — Public release language gate` | A2 plus required native audio/physical-device results, reviewed build fingerprint, clean automated release baseline and closed high-impact language issues | **Not signed off** |

`A1` supports **controlled internal playtesting only**, not public claims of verified Pashto.

## Required evidence to close A2

- [ ] **Coverage:** Reconcile the 183-lemma schedule queue (168 fresh maximum-pace district introductions + 15 early universals) against actual Week-1 routes/paces and collect any additional active lemmas exposed by the game. No incorrect assumption that 24/day is the only available pace.
- [ ] **Exact forms:** Review all Week-1 productive-eligible records from the 343-row form queue, checking spelling, gloss, morphology, pronunciation aid and prerequisites. Triage the 168 Week-1 reference/nonproductive forms separately because players can still read them in the Library. Do not certify the 12 future/reference-only forms as Week-1 productive.
- [ ] **Noun morphology:** Review the 101 Week-1 nouns and their source-listed plural/case gaps, focusing first on Day 5 direct plurals, agreement and countability. For every unresolved form, either obtain valid evidence or leave it excluded with the unresolved flag intact.
- [ ] **Fixed language:** Independently review the 53 source-derived Week-1 narrative/tutorial/Bilal/phrase records, including the exact speaker/addressee, script, English sense, romanisation and colloquial acceptability. Do not apply the prior owner approval of seven expressions to the rest of a scene.
- [ ] **Grammar:** Review all 32 curriculum/Grammar Journal records for Days 1–7 and at least one real teaching example per concept relevant to a productive sentence.
- [ ] **Generated language:** Capture actual text and proof/bindings across all 14 Week-1 family coverage targets, with at least three distinct genuine examples per family where delivered; complete the extra Day 5 plural and Week 1 exam sampling in [the protocol](GENERATED_SENTENCE_SAMPLING.md).
- [ ] **Alternatives and distractors:** Check that deliberately allowed variants preserve the target meaning and that distractor/incorrect options are wrong *in context*. Alternative pronouns, genders and word orders must not be blindly accepted.
- [ ] **Narrative alignment:** Inspect Deena/Medina speaker identity, Bilal's seven-day exchanges, greetings/formality, Hill introduction and Day 7 conclusion for local naturalness and consistency with English context.
- [ ] **Provenance:** Every `ACCEPT` decision needed for certification has reviewer code/date and real evidence; changed records have been re-reviewed after the exact correction. A reviewer’s unsourced bulk acceptance is not enough.
- [ ] **Defect resolution:** Zero unresolved active `S0` and `S1` language issues affecting the reviewed learning route. `S2/S3` items are explicitly dispositioned with owner, rationale and deadline.
- [ ] **Source integrity:** Corrections are merged into authoritative content and the proper approval/evidence records; generated CSVs/reports are regenerated using their tools. A worksheet alone must not trigger runtime status changes.
- [ ] **Regression:** Relevant vocabulary, morphology, sentence generation, assessment and browser tests pass on the corrected release; no newly introduced fake forms, changed pass rules or broken save proofs.

## Requirements to close A3

- [ ] A2 signed off against an exact corrected release commit and SHA-256.
- [ ] Compulsory Week-1 pronunciation material recorded/reviewed or an explicitly accepted accessibility-equivalent non-audio mode is documented; do not advertise TTS as a native-reviewed recording.
- [ ] Required real iPhone/Android/desktop checks have actual device/voice logs and no unresolved misleading pronunciation failures.
- [ ] Beginner usability reviewers verify that the introduced form, its English meaning and listening control are discoverable; technical provenance remains accessible without obstructing teaching.
- [ ] One complete integrated verification command exits zero on the final runtime/review state, or the release manager explicitly records and signs an exception with focused rerun evidence.
- [ ] Release manager verifies no critical/high issue remains and signs off a specific immutable build, not a moving branch name.

## Evidence ledger

| Evidence | Link / commit / date / reviewer | Status |
| --- | --- | --- |
| Baseline content | `ef23d11e3408d019060530aa94321332acda7c29` | Snapshot frozen |
| Week-1 word/form worksheets | `docs/language-review/WEEK1_*_REVIEW.csv` | Prepared; decisions pending |
| Native reviewer qualifications and scope | *Not supplied* | Open |
| Native word/form/noun judgments | *Not supplied* | Open |
| Fixed expressions, tutorial and Bilal judgments | *Not supplied* | Open |
| Grammar/actual generated-sentence judgments | *Not supplied* | Open |
| Physical-audio/recording evidence | *Not supplied* | Open |
| Correction issues and change PRs | *Not supplied* | Open |
| Reviewed corrected release fingerprint | *Not supplied* | Open |
| Release manager sign-off | *Not supplied* | Open |

## Sign-off record — copy into the release decision

> **Gate requested:** A1 / A2 / A3  
> **Current code commit and generated index.html SHA-256:**  
> **Reviewed queue/sentence sample IDs and counts:**  
> **Native reviewer code(s), scope and date:**  
> **Written-standard vs Laghman local-variant decisions:**  
> **Accepted corrections and merged PRs:**  
> **Open S0/S1/S2/S3 language issues and dispositions:**  
> **Pronunciation/audio device evidence:**  
> **Full regression command, exit code and focused reruns:**  
> **Limitations explicitly communicated to players/testers:**  
> **Reviewer approval (scope-limited; references):**  
> **Project/release-manager approval and date:**  
> **Final decision: PASS / CONDITIONAL INTERNAL ONLY / BLOCKED:**  

The default is **BLOCKED for public-language certification** until real review evidence is supplied. The existing engineering verification remains valuable but cannot by itself change that decision.