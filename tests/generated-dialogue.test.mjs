import assert from "node:assert/strict";
import { runtime, reset, study } from "./runtime-fixture.mjs";
const t = runtime();
reset(t);
for (let d = 1; d <= 13; d++) {
  t.state.day = d;
  for (const p of t.content.zoneKeys) study(t, d, p);
  t.progression.completeChallengeOnce(t.state.progress, d, d === 7 ? 25 : 15);
}
const pool = t.learning.availableSentences(13),
  pairs = t.S.dialogues(pool, t.content.LIBRARY_DATA, 12);
const families = new Set(),
  equal = (a, b, slot) =>
    assert.equal(
      a.generated.slots[slot].formId,
      b.generated.slots[slot].formId,
    );
for (const pair of pairs) {
  const { prompt: q, answer: a } = pair;
  assert.equal(a.generated.origin, "productive_engine");
  if (!q) {
    assert.equal(pair.family, "guided_scene");
    assert(pair.scene.includes(a.en));
    continue;
  }
  families.add(pair.family);
  assert.equal(q.generated.origin, "productive_engine");
  assert.equal(pair.scene, "Scene: " + a.en);
  if (pair.family === "what_object_question") {
    equal(q, a, "subject");
    equal(q, a, "verb");
    assert(
      q.generated.subjects.every((s) => s.person === 3),
      "Question/response must not silently switch first-person referents",
    );
  } else if (pair.family === "who_subject_question") {
    equal(q, a, "noun");
    equal(q, a, "verb");
    const r = a.generated.slots.subject;
    assert.equal(t.content.libraryEntries[r.lemmaId].partOfSpeech, "noun");
  } else {
    equal(q, a, "noun");
    if (pair.family === "which_question") equal(q, a, "adjective");
    if (pair.family === "whose_question") equal(q, a, "demonstrative");
    if (pair.family === "how_many_question") equal(q, a, "location");
  }
  for (const card of [q, a])
    for (const r of Object.values(card.generated.slots))
      assert(
        t.state.progress.library.acquired[r.lemmaId].introducedFormIds.includes(
          r.formId,
        ),
      );
}
assert.deepEqual(
  [...families].sort(),
  [
    "where_question",
    "which_question",
    "whose_question",
    "how_many_question",
    "what_object_question",
    "who_subject_question",
  ].sort(),
);
const composites = pool.filter(
  (c) => c.generated.family === "coordinated_present",
);
assert(composites.length > 1);
for (const c of composites) {
  assert(c.generated.subjects.some((s) => s.person === 1 || s.person === 2));
  assert(c.ps.includes(" او "));
  assert(c.en.includes(", and "));
  const restored = t.S.restoreCard(
    t.content.LIBRARY_DATA,
    t.content.LIBRARY_DATA.sentenceFrames,
    c,
  );
  assert.equal(restored.ps, c.ps);
}
console.log(
  "PASS generated dialogue: six Pashto question/reply families with matching referents, predicates, objects, owners/count/location; no first-person role flip; early guided scenes; licensed whole-clause coordination and AST replay",
);
