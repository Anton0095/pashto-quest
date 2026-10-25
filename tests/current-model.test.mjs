import {models} from "./model-fixture.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const read = (p) => readFileSync(p, "utf8"),
  data = JSON.parse(read("content/LIBRARY_LEXICON.json"));
const E = vm.runInNewContext(read("src/library-engine.js") + ";LibraryEngine");
const current = () => ({ library: E.state() });
const canonical = ["residential", "nature", "business", "school"];
assert.deepEqual([...E.places].sort(), [...canonical].sort());
for (const target of [4, 8, 12, 16, 20, 24]) {
  const p = current();
  assert(E.setPace(p, data, target, 1).ok);
  const day = E.ensurePlan(p, data, 1);
  assert.equal(Object.values(day.locationAssignments).flat().length, target);
  for (const [district, ids] of Object.entries(day.locationAssignments)) {
    assert.equal(ids.length, target / 4);
    for (const id of ids)
      assert(
        data.entries
          .find((e) => e.lemmaId === id)
          .suitableDistricts.includes(district),
      );
  }
  const frozen = JSON.stringify(day);
  E.setPace(p, data, 4, 1);
  assert.equal(JSON.stringify(day), frozen);
  assert.equal(Object.keys(p.library.acquired).length, 0);
  assert.equal(E.ensurePlan(p, data, 14).effectiveDailyTarget, 0);
}
const entry = data.entries.find((e) => e.lemmaId === "lemma:v-see"),
  form = entry.forms[0],
  ref = { lemmaId: entry.lemmaId, formId: form.formId },
  p = current();
const sample = {
  ...data,
  cardTypes: { exercise: "verb" },
  sourceMappings: { exercise: [ref] },
};
E.expose(p, sample, "exercise", {
  day: 2,
  source: "lesson",
  location: "nature",
});
E.expose(p, sample, "exercise", {
  day: 2,
  source: "lesson",
  location: "nature",
});
assert.equal(E.summary(p, data).encountered, 1);
assert.equal(E.status(p.library.acquired[entry.lemmaId]), "introduced");
for (let i = 0; i < 3; i++) {
  const ctx = {
    day: i + 2,
    source: "review",
    location: "school",
    eventId: "attempt" + i,
    now: 100 + i * 10 * 86400000,
  };
  assert(E.practise(p, sample, "exercise", true, ctx));
  assert.equal(E.practise(p, sample, "exercise", true, ctx), false);
}
assert.equal(E.status(p.library.acquired[entry.lemmaId]), "mastered");
const recorded = E.cardStat(p, sample, "exercise");
assert.equal(recorded.totalAttempts, 3);
assert.equal(
  Object.keys(p.library.units).length,
  0,
  "no mirrored lexical card state",
);
E.practise(p, sample, "exercise", false, {
  day: 4,
  source: "review",
  location: "business",
  eventId: "wrong",
  now: 9999999999,
});
assert.equal(E.cardStat(p, sample, "exercise").stage, 0);
assert.equal(E.status(p.library.acquired[entry.lemmaId]), "practised");
assert.equal(
  JSON.stringify(JSON.parse(JSON.stringify(p)).library),
  JSON.stringify(p.library),
);
const html = read("index.html"),
  game = JSON.parse(html.match(/const GAME_DATA=(\{.*?\});/s)[1]),
  contract = JSON.parse(read("tests/curriculum-contract.json"));
const expected = new Map(contract.words.map((w) => [w.id, w]));
assert.equal(expected.size, contract.words.length);
assert.equal(game.words.length, expected.size);
assert.equal(new Set(game.words.map((w) => w.id)).size, game.words.length);
for (const w of game.words) {
  const projection = Object.fromEntries(
    ["id", "ps", "roman", "en", "loop"].map((k) => [k, w[k]]),
  );
  assert.deepEqual(
    projection,
    Object.fromEntries(
      Object.entries(expected.get(w.id)).filter(([key]) => key !== "type"),
    ),
  );
  assert(canonical.includes(w.place) || w.loop === 0);
}
assert.equal(game.loops.length, 14);
assert.equal(Object.keys(game.courses).length, 56);
for (const [id, ids] of Object.entries(game.courses)) {
  assert(/^\d+-(residential|nature|business|school)$/.test(id));
  for (const card of ids) assert(game.words.some((w) => w.id === card));
}
const { activationProblems, inventory } = await import(
  "../tools/district-inventory.mjs"
);
const backlog = JSON.parse(read("content/DISTRICT_VOCABULARY_CANDIDATES.json"));
assert(
  backlog.candidates.every(
    (c) =>
      activationProblems(c).length > 0 && c.countsTowardDailyQuota === false,
  ),
);
const report = inventory(data, backlog, read("src/library-engine.js"));
assert.equal(report.activatedContentLemmas, 99);
assert.equal(report.inactiveCandidates, 360);
assert.equal(report.eligibleForPromotion, 0);
assert.equal(report.duplicateLemmaIds.length, 0);
assert(report.schedules.every((s) => s.days[13].assigned === 0));
console.log(
  "PASS current schema: seven pacing options, canonical districts, one form SRS, idempotent events, mastery, intact 14-day content contract and inactive candidate gates",
);

const P = models();
const progress = P.fresh(),
  untouched = JSON.stringify(progress);
for (const score of [-1, 16, Infinity, 0.5])
  assert.throws(
    () => P.completeChallengeOnce(progress, 1, score),
    /Invalid assessment score/,
  );
assert.equal(JSON.stringify(progress), untouched);

const oneDay = 86400000,
  first = E.schedule(undefined, true, 1000);
assert.equal(first.stage, 1);
assert.equal(first.srsDueAt, 1000 + oneDay);
const early = E.schedule(first, true, 1001);
assert.equal(early.stage, 1);
assert.equal(early.srsDueAt, first.srsDueAt);
const next = E.schedule(early, true, first.srsDueAt + 1);
assert.equal(next.stage, 2);
assert.equal(next.srsDueAt, first.srsDueAt + 1 + 3 * oneDay);
const missed = E.schedule(next, false, first.srsDueAt + 2);
assert.equal(missed.stage, 0);
assert.equal(missed.srsDueAt, first.srsDueAt + 2);
assert.equal(P.awardXP(progress, "fixture-skill", 10), 10);
assert.equal(P.awardXP(progress, "fixture-skill", 10), 0);
assert.equal(
  P.completeLessonOnce(progress, "1-residential", "standard", true),
  25,
);
assert.equal(
  P.completeLessonOnce(progress, "1-residential", "standard", true),
  0,
);
assert.equal(progress.xp, 35);
console.log(
  "PASS exact SRS intervals, not-due stability, wrong-answer due reset, invalid grades and once-only XP/completion transactions",
);
