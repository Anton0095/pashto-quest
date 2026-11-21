# Reviewer protocol and linguistic decision records

This protocol implements the approval boundaries in [LANGUAGE_REVIEW.md](../../LANGUAGE_REVIEW.md). **No review has yet been performed by preparing these documents.** Each worksheet is a staging record; it does not directly change the game, an existing approval or a player's learning record.

## Who reviews

Use a reviewer who is fluent in Pashto, literate in the conventional script, and capable of judging the intended English meaning and grammatical context. Prefer a reviewer familiar with spoken Laghman/Afghan Pashto. A second independent reviewer or linguistic adjudicator is required for disputed forms and high-impact changes to Week-1 instruction.

Record a **reviewer code**, date, declared familiarity with Laghman, and any limitation (for example, written-standard competence but no local accent judgement). Store private contact details and recording consent separately; do not publish a person's identity without their permission.

A native speaker can provide direct language judgement; dictionary entries and grammatical references are supporting evidence. Do not treat automated sentence compilation, audio synthesis or the project's prior `user_approved` owner sign-off as independent linguistic certification.

## What to check on every item

| Axis | Native reviewer question |
| --- | --- |
| Script and orthography | Is the exact Pashto spelling appropriate? Is the canonical written form separate from colloquial alternatives? |
| Meaning | Does the given English precisely match this exact Pashto form and situation, including number/person/politeness? |
| Pronunciation | Is the romanisation a reproducible beginner aid for the intended spoken variant? Does any available audio actually say the text? |
| Morphology | Is gender, number, case, person, tense/aspect, transitivity, agreement and form label correct? Is any feature merely guessed? |
| Syntax and valency | Does the verb accept these arguments? Are SOV, noun phrases, postpositions, coordination and spatial/case frames valid? |
| Naturalness | Would a Laghman speaker plausibly say this to this person in this village scene? Does the English preserve its pragmatic force? |
| Variation | Are multiple forms possible? Which is taught as canonical, which may be accepted, and how are they conditioned by register/dialect? |
| Learning suitability | Is the form understandable with grammar already taught? Can a learner distinguish this choice from the distractors? |

For nouns, explicitly separate direct singular, direct plural, oblique singular and oblique plural. Recognise countability, inherently plural nouns and senses that do not have an ordinary plural. Do not replace unknown entries with a default masculine/singular/plural form.

For verbs, check exact attested finite forms and stems individually. Do not extrapolate all paradigms from endings alone, especially irregular or compound verbs. A lemma may be introduced through a finite form; a citation form is not automatically its first lesson card.

For generated sentences, inspect actual `formId` bindings and sentence family plus the original target/gloss; correct surface spelling alone is not enough if the generated meaning or collocation is wrong.

## Worksheet decision values

- `PENDING` — not reviewed yet. This is the default of every populated review row.
- `ACCEPT` — the reviewed **exact wording/form/context** is acceptable with item-specific evidence; it does not automatically approve other conjugations or combinations.
- `REVISE` — the item is substantially usable but needs an exact specified correction and a new review after that change.
- `REJECT` — the item is unsafe to teach or a false translation/form; disable the affected production use pending a replacement and review.
- `UNCERTAIN` — reviewer cannot certify this sense, local dialect, case or pronunciation; request additional evidence or a second reviewer, and preserve provisional restrictions.

For an accepted alternative, use `ACCEPT` and record the canonical taught form, acceptable variant(s), reason, speaker/register conditions and whether the learner should be expected to produce or merely recognise the variant. Do not turn optional variants into automatic accepted quiz answers without deliberate evaluation rules.

## Severity and escalation

| Severity | Meaning | Action |
| --- | --- | --- |
| `S0` critical | Wrong grammar/meaning is being positively taught, scored as correct, or repeated in essential tutorials/exams | Block public release and affected learning path until fixed and native-rechecked |
| `S1` high | Serious unnatural/misleading form, wrong agreement or subject, bad translation, or frequent pronunciation failure | Fix before Week-1 public learning release; mark affected forms/tasks unapproved |
| `S2` medium | Register inconsistency, romanisation ambiguity, minor lexical nuance, a restricted but correctly flagged missing form | Track correction and evidence; do not claim blanket certification |
| `S3` low | Typographical or presentation-only wording with no meaning/learning impact | Bundle with next editorial update |

A reviewed but **unresolved** form remains provisional and cannot acquire `native_approved` merely because the ticket is assigned or a dictionary link exists.

## How to conduct a review session

1. Confirm the worksheet's `source_commit` matches the content being reviewed; otherwise regenerate and diff affected IDs before continuing.
2. Open [Week 1 daily checklist](WEEK1_DAILY_CHECKLIST.md), locate the corresponding `lemmaId`, `formId`, phrase ID, event ID or generated sentence proof.
3. Observe the full player-facing context: day, teacher/speaker, listener, lesson stage, exact Pashto text, transliteration, English target and (if available) actual audio.
4. Read the form and meaning independently, then compare to the supplied gloss and grammatical labels. Note whether the meaning changes across dialect/register.
5. Enter a decision, requested correction, accepted variants, source evidence, reviewer code, date and issue ID. Do not delete the original source fields.
6. For any disagreement or uncertainty, capture the actual screenshot/source, exact form or generated ID, the competing judgements, and the reason for the second review.
7. A developer implements accepted corrections in authoritative JSON on a separate branch and runs the relevant tests. Another reviewer pass compares the resulting **new** string and formId to the correction.
8. The release owner verifies closed issues and signs the [language gate](MILESTONE_A_LANGUAGE_GATE.md). Neither the CSV nor an issue comment is itself a production approval.

## Language issue record template

Copy this record into a GitHub issue for each related group of defects (or a review log linked from it):

> **Issue ID / severity:**   
> **Source commit / reviewed build:**   
> **Day, district and screen:**   
> **Stable ID(s) / formId(s) / generated proof:**   
> **Speaker / addressee / relationship / register:**   
> **Original Pashto / romanisation / English:**   
> **Observed audio / device (if relevant):**   
> **Problem and evidence:**   
> **Corrected Pashto / English / romanisation / features:**   
> **Accepted alternatives and constraints:**   
> **Evidence reference or recording ID:**   
> **Reviewer code and decision date:**   
> **Implementing PR / changed source records:**   
> **Regression checks / native re-review:**   
> **Final status and approval scope:**   

For generated sentences include the exact bindings and sentence family. For a changed base approved by the project owner, preserve the original approval history and obtain appropriate new scoped owner/editorial confirmation; do not silently rewrite `USER_LANGUAGE_APPROVALS.json`.

## Language-review decision versus game unlock

There are **three separate dimensions**:

1. **Editorial:** provisional, user-approved base, genuinely native-approved exact form/context, or rejected.
2. **Mechanical:** whether the sentence engine has adequate evidence to generate using a form.
3. **Player learning:** whether the player has encountered, formally acknowledged, practised or mastered that form and unlocked the prerequisite grammar.

Do not let a change in one dimension silently modify the other two. Reviewing a form does not grant it to a player; exposing a form in the Library does not certify its pronunciation; generated sentence success does not establish naturalness.

For release criteria use [Milestone A language gate](MILESTONE_A_LANGUAGE_GATE.md).