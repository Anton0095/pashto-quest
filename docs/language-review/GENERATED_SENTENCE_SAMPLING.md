# Capturing generated Week 1 sentences for human review

This protocol reviews **actual instructional outputs**, not proposed translations or sentences copied from archived authored lessons. The current sentence engine composes clauses from licensed forms and frames; its 6,246 observed surfaces in the last regression matrix were all compiler-generated. That is a **provenance measurement**, not validation of grammar, pronunciation or Laghman naturalness.

Use [WEEK1_GENERATED_SENTENCE_REVIEW_TEMPLATE.csv](WEEK1_GENERATED_SENTENCE_REVIEW_TEMPLATE.csv) as the coverage index, and add one review row per **captured actual instance**. The included 14 rows name source-derived target grammar families but do not contain invented Pashto examples.

## Capture protocol

For each reviewed generated sentence, record:

- Current commit/release fingerprint, day, vocabulary pace, route (normal or School→early challenge), and, where possible, frozen plan seed/assessment attempt or exact repeat steps.
- The screen/teacher/speaker/addressee: School, Home, Lake/Nature, Market, Library, dialogue, lesson construction, selection, typed recall or daily challenge.
- Exact rendered Pashto, romanisation, English target and question prompt; capture screenshot or machine-readable question/proof **without changing the generated answer**.
- Generated sentence ID/proof, family, stable `lemmaId` and `formId` bindings, morphology features and prerequisite School grammar when accessible.
- Player's current taught/unlocked forms, because a correct sentence generated from a form the player has not been taught is a distinct educational defect.
- Human verdict and correction, accepted alternatives, evidence, reviewer code/date and issue ID.

Do not replace an awkward output with an ideal sentence before a reviewer sees the actual game output. Do not treat same Pashto spelling with different subjects/English glosses as automatically equivalent.

## Minimum Week-1 coverage

**Source-derived core family targets from `content/LEARNING_CURRICULUM.json`:**

| Day | Family targets | Essential human review dimensions |
| --- | --- | --- |
| 1 | `equative_descriptor` | Masculine/feminine, inherent plural, noun–adjective–equative, natural collocations |
| 2 | `present_transitive`, `present_attributive` | Third singular, SOV, verb object/valency, named female subject |
| 3 | `present_transitive`, `present_intransitive` | First singular finite forms, correct subject, transitivity |
| 4 | `coordinated_present`, `present_transitive`, `present_attributive` | Familiar singular `ته`, coordination, semantic coherence |
| 5 | `present_transitive` | Polite/plural `تاسې`, appropriate audience, person agreement |
| 6 | `present_joint_action`, `present_compound_predicate` | Inclusive `موږ`, compound subjects and predicates |
| 7 | `present_transitive`, `present_compound_transitive`, `coordinated_present` | Third plural `هغوی`, cumulative agreement, 25-question exam |

**Extra mandatory boundary samples** (in addition to the family rows):

- Day 1: at least one masculine singular, one feminine singular and one inherently plural noun description (e.g. source noun `اوبه`), using actual rendered cards.
- Day 2: the same licensed action contrasted with later first-/second-person forms where possible, without introducing unlicensed forms early.
- Day 4: at least two compound clauses that are individually grammatical but need a native naturalness check as a pair.
- **Day 5:** at least eight distinct actual samples involving newly introduced noun plurals, explicit plural agreement or respectful/plural second person; include a plural-first lemma if the generator makes one eligible. Review direct versus oblique and noun countability separately.
- Day 6: at least three current `موږ`/joint-action contexts, including the Hills story context where available.
- Day 7: include question, construction and response samples from the actual 25-question exam, covering varied pronouns and plural semantics.
- Across Week 1: at least one normal route and one early-challenge route, two vocabulary paces (include 24/day as a high-load stress case), and more than one deterministic seed for generated variety.

**Suggested review volume:** begin with *at least three distinct real outputs per source-derived family target*, plus the boundary samples, then expand where mistakes or disagreement concentrate. This is risk-based sampling, **not** certification of every possible sentence or the full 6,246 observed instances. Track reviewed unique proof IDs, not just total clicks.

## How to create a repeatable sample

Use the existing public game and test harness read-only or the game's frozen assessment/proof records. For a sample generated through a normal lesson, finish School before opening other location lessons. Capture form-flashcard acknowledgment state. For an early challenge, explicitly mark activation-only forms and **do not** claim these were studied.

Avoid writing a second sentence generator or hardcoded sample bank. If a tool exports samples, its output must preserve the actual active compiler's wording, semantic bindings and prerequisites, and be reproducible from the saved seed/release. Do not author Pashto in the sampling script.

A source-derived grammar target can legitimately have no actual sentence under a given seed/pace. Mark `NOT_DELIVERED` with the profile and reason; choose another valid profile or explain the coverage gap. Never fabricate a passing example to fill the sample.

## Questions for the reviewer

1. Is the complete sentence grammatically possible and **natural in this scene**?
2. Is its English translation exactly equivalent, including subject, number, gender, politeness, quantity and action?
3. Are collocations sensible (e.g. what people do with fish, baskets, chairs or doors)?
4. Is the speaker referring to themself, listener, an observed group or a named participant correctly?
5. Are noun/adjective, verb/person and case/postposition features compatible?
6. Are alternate Pashto phrasings acceptable in this exact context? Should the game teach one and accept others?
7. Would this appear to a learner before the necessary School concept and form flashcard, or only in an explicit early challenge?
8. If the answer is a distractor, is it genuinely wrong rather than merely an acceptable variant?

File `S0/S1` issues for false target meanings, wrong conjugation or incorrect answers being awarded credit. Fix them in the authoritative lexicon/frame/evaluator, not by editing the reviewer CSV. Re-capture the corrected generated output and obtain explicit native re-review.