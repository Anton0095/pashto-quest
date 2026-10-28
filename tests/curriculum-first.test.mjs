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
assert.equal(data.entries.length, 473);
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
const catalog = S.eligible(p, data, frames, 14);
assert(catalog.length > 1000);
assert(catalog.some((c) => c.ps === "کور نوی دی."));
assert(catalog.some((c) => c.ps === "کتاب لوی دی."));
assert(catalog.every((c) => Object.values(c.generated.slots).every((r) =>
  p.library.acquired[r.lemmaId].introducedFormIds.includes(r.formId))));
console.log("PASS curriculum-first: 473 identities, deliberate introductions/all paces, exposure vs introduction, productive unlocked form catalog");
