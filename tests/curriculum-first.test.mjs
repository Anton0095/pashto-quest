import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const data = JSON.parse(readFileSync("content/LIBRARY_LEXICON.json", "utf8"));
const frames = JSON.parse(readFileSync("content/SENTENCE_FRAMES.json", "utf8"));
const { E, S } = vm.runInNewContext(
  readFileSync("src/library-engine.js", "utf8") +
    "\n" +
    readFileSync("src/sentence-engine.js", "utf8") +
    ";({E:LibraryEngine,S:SentenceEngine})",
);
const plain = (x) => JSON.parse(JSON.stringify(x));
assert.equal(data.entries.length, 128);
assert(data.entries.every((e) => e.partOfSpeech !== "grammar"));
const dark = data.entries.find((e) => e.lemmaId === "lemma:a-dark");
assert.equal(dark.introduction.day, 5);
for (const pace of E.presets) {
  const p = { library: E.state() },
    seen = new Set();
  p.library.requestedDailyTarget = pace;
  for (let day = 1; day <= 14; day++) {
    const plan = E.ensurePlan(p, data, day),
      frozen = JSON.stringify(plan);
    for (const [district, ids] of Object.entries(plan.locationAssignments)) {
      assert(ids.length <= (day === 14 ? 0 : pace / 4));
      assert.equal(
        plan.shortfalls[district],
        (day === 14 ? 0 : pace / 4) - ids.length,
      );
      const ranks = ids.map((id) => data.entries.find((e) => e.lemmaId === id));
      for (const e of ranks) {
        assert(!seen.has(e.lemmaId));
        seen.add(e.lemmaId);
        assert(e.introduction.day <= day);
        assert.equal(e.introduction.district, district);
        if (day === 1) assert.notEqual(e.partOfSpeech, "verb");
      }
    }
    p.library.seed++;
    assert.equal(JSON.stringify(E.ensurePlan(p, data, day)), frozen);
  }
}
const p = { library: E.state() };
assert.equal(S.eligible(p, data, frames, 14).length, 0);
for (let d = 1; d <= 14; d++) E.unlock(p, d, "fixture");
// Encountering is not introducing: skipped assessments and workshop examples must never license generation.
for (const source of ["challenge", "grammar-model"])
  for (const e of data.entries)
    for (const f of e.forms)
      E.encounter(
        p,
        data,
        { lemmaId: e.lemmaId, formId: f.formId },
        { day: 14, source },
      );
assert.equal(S.eligible(p, data, frames, 14).length, 0);
assert.equal(
  E.dueForms(p, data).length,
  0,
  "incidental examples are not due individual-form study",
);
for (const e of data.entries)
  for (const f of e.forms)
    E.encounter(
      p,
      data,
      { lemmaId: e.lemmaId, formId: f.formId },
      { day: 14, source: "lesson", introduce: true },
    );
assert.equal(S.eligible(p, data, frames, 14).length, 9);
const variants = new Set();
for (let seed = 0; seed < 10000; seed++) {
  const cards = S.select(p, data, frames, 14, 2, seed);
  assert.equal(cards.length, 2);
  assert.notEqual(cards[0].id, cards[1].id);
  assert.deepEqual(plain(cards), plain(S.select(p, data, frames, 14, 2, seed)));
  for (const c of cards) {
    variants.add(c.ps);
    const f = frames.frames.find((f) => f.id === c.generated.frameId),
      b = f.bindings.find((b) => b.id === c.generated.bindingId);
    assert.equal(c.ps, b.output.pashto);
    assert.equal(c.en, b.output.english);
    for (const r of Object.values(c.generated.slots))
      assert(
        p.library.acquired[r.lemmaId].introducedFormIds.includes(r.formId),
      );
  }
}
assert.equal(variants.size, 9);
assert(variants.has("کور نوی دی."));
assert(variants.has("کتاب لوی دی."));
const frame = frames.frames[0],
  binding = frame.bindings[0];
for (const [key, value] of [
  ["gender", "feminine"],
  ["number", "plural"],
  ["case", "oblique"],
  ["person", 2],
]) {
  const bad = structuredClone(data);
  const ref = binding.slots.noun;
  const form = bad.entries
    .find((e) => e.lemmaId === ref.lemmaId)
    .forms.find((f) => f.formId === ref.formId);
  form.morphology[key] = value;
  assert.equal(S.compose(bad, frame, binding), null);
}
for (const change of [
  "missingRoman",
  "unseenForm",
  "lockedGrammar",
  "futureDay",
]) {
  const a = structuredClone(data),
    b = plain(p);
  const ref = binding.slots.noun,
    e = a.entries.find((e) => e.lemmaId === ref.lemmaId),
    f = e.forms.find((f) => f.formId === ref.formId);
  if (change === "missingRoman") f.romanisation = null;
  if (change === "unseenForm")
    b.library.acquired[ref.lemmaId].introducedFormIds = [];
  if (change === "lockedGrammar") delete b.library.grammar["grammar-day-1"];
  if (change === "futureDay") f.firstAllowedDay = 15;
  assert(
    !S.eligible(b, a, frames, 14).some(
      (c) => c.generated.bindingId === binding.id,
    ),
  );
}
console.log(
  "PASS curriculum-first: 128 identities, deliberate introductions/all paces, exposure vs introduction, 20,000 licensed compositions, nine variants, determinism and adversarial agreement/case/unlock tests",
);
