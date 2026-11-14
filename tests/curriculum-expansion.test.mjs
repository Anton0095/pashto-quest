import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const read = (p) => readFileSync(p, "utf8");
const data = JSON.parse(read("content/LIBRARY_LEXICON.json"));
const backlog = JSON.parse(read("content/DISTRICT_VOCABULARY_CANDIDATES.json"));
const narrative = JSON.parse(read("content/NARRATIVE_EXPRESSIONS.json"));
const E = vm.runInNewContext(read("src/library-engine.js") + ";LibraryEngine");
const places = ["residential", "nature", "business", "school"];
const fresh = () => ({ library: E.state() });
const byId = Object.fromEntries(data.entries.map((e) => [e.lemmaId, e]));
const counts = (entries) =>
  Object.fromEntries(
    places.map((d) => [
      d,
      entries.filter((e) => e.primaryDistrict === d).length,
    ]),
  );
assert.deepEqual(counts(data.entries.filter((e) => e.countsTowardDailyQuota)), {
  residential: 101,
  nature: 100,
  business: 100,
  school: 100,
});
assert.deepEqual(
  counts(backlog.candidates.filter((e) => e.selectedForExpansion)),
  { residential: 78, nature: 73, business: 71, school: 79 },
);
assert.equal(
  backlog.candidates.filter((c) => c.selectedForExpansion).length,
  301,
);
const selected = (en, pos) =>
  backlog.candidates.find(
    (e) => e.englishLemma === en && e.partOfSpeech === pos,
  ).selectedForExpansion;
assert(selected("snow", "noun"));
assert(!selected("snow", "verb"));
assert(selected("answer", "verb"));
assert(!selected("answer", "noun"));
assert(selected("lock", "noun") && selected("lock", "verb"));
const universal = data.entries.filter((e) => e.vocabularyClass === "universal");
assert.equal(universal.length, 73);
assert(
  universal.every(
    (e) =>
      !e.countsTowardDailyQuota && places.every((d) => E.matchesPlace(e, d)),
  ),
);
assert(
  backlog.candidates
    .filter((e) => e.selectedForExpansion)
    .every(
      (e) =>
        e.countsTowardDailyQuota &&
        e.reviewStatus === "provisional_playable" &&
        e.userVerified === false &&
        byId[e.promotedLemmaId],
    ),
);
for (const pace of E.presets) {
  const p = fresh();
  assert(E.setPace(p, pace, 1).ok);
  const plan = E.ensurePlan(p, data, 1),
    ids = Object.values(plan.locationAssignments).flat();
  assert.equal(new Set(ids).size, pace);
  for (const district of places) {
    assert.equal(plan.locationAssignments[district].length, E.quotas(1,pace)[district]);
    assert(
      plan.locationAssignments[district].every((id) =>
        ["noun", "adjective"].includes(byId[id].partOfSpeech),
      ),
    );
  }
  assert.equal(E.ensurePlan(p, data, 14).requestedDailyTarget, 0);
}
// Day 1 candidates are vocabulary/forms, never an authored sentence list.
const day1 = data.entries.filter(
  (e) => e.introduction.day === 1 && e.countsTowardDailyQuota,
);
assert(day1.length >= 24);
assert(day1.every((e) => ["noun", "adjective"].includes(e.partOfSpeech)));
const verb = byId["lemma:v-read"],
  ref = { lemmaId: verb.lemmaId, formId: verb.forms[0].formId };
const p = fresh();
assert.equal(E.encounter(p, data, ref, { day: 1, source: "lesson" }), null);
assert.equal(Object.keys(p.library.acquired).length, 0);
E.encounter(p, data, ref, { day: 2, source: "lesson", location: "school" });
assert(p.library.acquired[verb.lemmaId]);
// Reclassified entries and forms preserve their records and never consume quota again.
const u = byId["lemma:w6-together"],
  uref = { lemmaId: u.lemmaId, formId: u.forms[0].formId };
E.encounter(p, data, uref, { day: 6, source: "lesson", location: "nature" });
const record = JSON.stringify(p.library.acquired[u.lemmaId]);
E.encounter(p, data, uref, { day: 7, source: "lesson", location: "business" });
assert.equal(JSON.stringify(p.library.acquired[u.lemmaId]), record);
assert.equal(E.summary(p, data).encountered, 1);
// A generated plan stays frozen on reload; current code never rewrites authored assignments.
const planned = fresh();
const frozen = JSON.stringify(E.ensurePlan(planned, data, 1));
assert.equal(
  JSON.stringify(E.ensurePlan(JSON.parse(JSON.stringify(planned)), data, 1)),
  frozen,
);
// Missing suitable inventory is explicit; no repeated or unreviewed filler.
const insufficient=fresh(),empty={...data,entries:[]};
const gap=E.ensurePlan(insufficient,empty,3);
assert(gap.contentGap);assert.equal(gap.effectiveDailyTarget,null);
assert.deepEqual(JSON.parse(JSON.stringify(gap.shortfalls)),{residential:4,business:13,nature:7,school:0});
assert.equal(E.ensurePlan(insufficient,empty,14).requestedDailyTarget,0);
// Pending phrase slots are explicit editorial targets, never acquired by a plan.
assert.equal(narrative.expressions.length, 14);
assert.equal(narrative.expressions.filter((e) => e.active).length, 14);
assert.equal(narrative.expressions.filter((e) => e.day === 1).length, 1);
const speakers = [
  "Ms Hameed",
  "Deena",
  "Muhammad Jan",
  "Ms Hameed",
  "Medina",
  "Edris",
  "Deena",
  "Edris",
  "Medina",
  "Muhammad Jan",
  "Ms Hameed",
  "Deena",
  "Muhammad Jan",
];
for (let day = 2; day <= 14; day++)
  assert.equal(
    narrative.expressions.find((e) => e.day === day).speaker,
    speakers[day - 2],
  );
const morning = narrative.expressions.find((e) => e.day === 2);
assert.equal(morning.pashto, "سهار مو پخیر!");
const activeData = {
  ...data,
  phrases: [...data.phrases, ...narrative.expressions.filter((e) => e.active)],
  cardTypes: { [morning.id]: "greeting" },
};
const phraseProgress = fresh();
E.ensurePlan(phraseProgress, activeData, 2);
assert.deepEqual(Object.keys(phraseProgress.library.phrases), []);
E.expose(phraseProgress, activeData, morning.id, {
  day: 2,
  source: "day-opening",
  location: "school",
});
assert.equal(E.cardStat(phraseProgress, activeData, morning.id).stage, 0);
assert.equal(E.cardStat(phraseProgress, activeData, morning.id).srsDueAt, 0);
const encounter = JSON.parse(JSON.stringify(phraseProgress.library.phrases[morning.id]));
E.expose(phraseProgress, activeData, morning.id, {
  day: 2,
  source: "lesson",
  location: "school",
});
assert.deepEqual(
  JSON.parse(JSON.stringify(phraseProgress.library.phrases[morning.id])),
  {...encounter, studiedDay:2},
  "actual study is added without replacing the original encounter provenance",
);
E.practise(phraseProgress, activeData, morning.id, true, {
  day: 2,
  source: "review",
  eventId: "phrase-answer",
  now: 100,
});
const reloaded = JSON.parse(JSON.stringify(phraseProgress));
assert.equal(E.cardStat(reloaded, activeData, morning.id).stage, 1);
assert.equal(Object.keys(reloaded.library.acquired).length, 0);
assert(
  narrative.expressions
    .filter((e) => !e.active)
    .every((e) => !activeData.phrases.some((a) => a.id === e.id)),
);
const maximum = fresh();
maximum.library.requestedDailyTarget = 24;
const actualAssigned = new Set();
for (let day = 1; day <= 13; day++) {
  const plan = E.ensurePlan(maximum, data, day);
  assert.equal(plan.contentGap, false);
  for (const d of places) assert.equal(plan.locationAssignments[d].length, E.quotas(day,24)[d]);
  for (const id of Object.values(plan.locationAssignments).flat()) {
    assert(!actualAssigned.has(id));
    actualAssigned.add(id);
  }
}
assert.equal(actualAssigned.size, 312);
assert.equal(E.ensurePlan(maximum, data, 14).requestedDailyTarget, 0);
console.log(
  "PASS curriculum expansion: 401 district lemmas, all five paces, action guards, frozen plans, 312 introductions, reserves, honest phrase slots, persistent SRS",
);

const universalTargets = JSON.parse(
  read("content/UNIVERSAL_TEACHING_TARGETS.json"),
);
assert.equal(universalTargets.targets.length, 40);
assert(
  universalTargets.targets.every(
    (t) =>
      t.active &&
      t.status === "provisional_playable" &&
      t.userVerified === false &&
      byId[t.lemmaId],
  ),
);
const inventoryReport = JSON.parse(
  read("content/DISTRICT_INVENTORY_REPORT.json"),
);
assert.equal(inventoryReport.targetProjection.scheduled, 312);
assert.equal(inventoryReport.targetProjection.missingScheduled, 0);
assert(
  inventoryReport.targetProjection.days
    .slice(0, 13)
    .every((d) => places.every((p) => d.perDistrict[p] === E.quotas(d.day,24)[p])),
);
console.log(
  "PASS 40 universal semantic targets linked to explicit provisional identities",
);
const reviewCsv = read("content/VOCABULARY_REVIEW.csv").trim().split(/\r?\n/);
assert.equal(reviewCsv.length, data.entries.length + 1);
assert(
  reviewCsv[0].includes("userVerified") &&
    reviewCsv[0].includes("nativeReviewStatus"),
);
