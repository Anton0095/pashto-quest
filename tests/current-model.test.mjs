import { models } from "./model-fixture.mjs";
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
  assert(E.setPace(p, target, 1).ok);
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
  E.setPace(p, 4, 1);
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
  day: 3,
  source: "lesson",
  location: "nature",
});
E.expose(p, sample, "exercise", {
  day: 3,
  source: "lesson",
  location: "nature",
});
assert.equal(E.summary(p, data).encountered, 1);
assert.equal(E.status(p.library.acquired[entry.lemmaId]), "introduced");
for (let i = 0; i < 3; i++) {
  const ctx = {
    day: i + 3,
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
  day: 5,
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
const html = read("index.html");
assert(
  !/const (GAME_DATA|WEEK2_DATA)=/.test(html),
  "No obsolete runtime projections",
);
const runtimeLibrary = JSON.parse(
  html.match(/const LIBRARY_DATA=(\{.*?\});/s)[1],
);
assert.equal(runtimeLibrary.curriculum.days.length, 14);
assert.equal(Object.keys(runtimeLibrary.curriculum.zones).length, 4);
const archived = JSON.parse(
  read("docs/grammar/attestations/WEEK1_AUTHORED.json"),
);
assert(
  archived.words.some((w) => w.id === "s3-house"),
  "Old sources remain evidence only",
);
const { activationProblems, inventory } = await import(
  "../tools/district-inventory.mjs"
);
const backlog = JSON.parse(read("content/DISTRICT_VOCABULARY_CANDIDATES.json"));
const promoted = backlog.candidates.filter((c) => c.promotedLemmaId);
assert.equal(promoted.length, 301);
assert(
  promoted.every(
    (c) =>
      c.reviewStatus === "provisional_playable" && c.userVerified === false,
  ),
);
assert(
  promoted.every((c) =>
    data.entries.some((e) => e.lemmaId === c.promotedLemmaId),
  ),
);
const report = inventory(data, backlog, read("src/library-engine.js"));
assert.equal(report.activatedContentLemmas, 400);
assert.equal(report.inactiveCandidates, 59);
assert.deepEqual(report.candidateDisposition, {
  promoted: 301,
  merged: 0,
  rejected: 59,
  replaced: 0,
});
assert.equal(report.byReviewStatus.user_approved, 473);
assert.equal(report.duplicateLemmaIds.length, 0);
assert(report.schedules.every((s) => s.days[13].assigned === 0));
console.log(
  "PASS current schema: seven pacing options, canonical districts, one form SRS, idempotent events, mastery, 14-day generated-only curriculum and inactive candidate gates",
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
  P.completeLessonOnce(progress, "1-residential", "standard", true, 1),
  25,
);
assert.equal(
  P.completeLessonOnce(progress, "1-residential", "standard", true, 1),
  0,
);
assert.equal(progress.xp, 35);
console.log(
  "PASS exact SRS intervals, not-due stability, wrong-answer due reset, invalid grades and once-only XP/completion transactions",
);
