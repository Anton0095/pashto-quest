import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  runtime,
  reset,
  study,
  beginAttempt,
  correctAnswer,
  plain,
} from "./runtime-fixture.mjs";
const t = runtime(),
  { content: c } = t;
assert(!c.LIBRARY_DATA.generatedCatalog);
assert(!Object.values(c.wordById).some((c) => c.type === "sentence"));
assert(
  !("words" in c) && !("courses" in c),
  "No empty authored delivery adapters",
);
assert(
  !/const (GAME_DATA|WEEK2_DATA)=/.test(readFileSync("index.html", "utf8")),
);
assert(!c.LIBRARY_DATA.lessonSentenceTargets);
assert(!c.LIBRARY_DATA.generationAttestations);
assert(!readFileSync("index.html", "utf8").includes("fixed_authored_fallback"));
assert(c.LIBRARY_DATA.entries.every((e) => !e.examples));
assert(
  !c.LIBRARY_DATA.grammar,
  "Grammar journal uses the canonical curriculum",
);
const exceptions = c.LIBRARY_DATA.phrases;
assert.equal(exceptions.length, 6);
assert(exceptions.every((p) => p.exceptionReason && p.kind === "fixed_phrase"));
assert(!c.wordById["s3-house"]);
assert(!c.wordById["w2-d12-school-2"]);
reset(t);
const home = study(t, 1, "residential"),
  cards = home.studySentences.map((id) => c.wordById[id]);
assert(cards.length >= 2);
assert.equal(new Set(cards.map((c) => c.ps)).size, cards.length);
assert(cards.some((c) => c.ps === "کور لوی دی."));
assert(cards.some((c) => c.ps === "دروازه خلاصه ده."));
assert(cards.some((c) => c.ps === "کړکۍ خلاصه ده."));
assert.equal(
  Object.values(t.state.progress.library.plans[1].locationAssignments).flat()
    .length,
  24,
);
const assigned = new Set(
  t.state.progress.library.plans[1].locationAssignments.residential,
);
assert.deepEqual(
  [
    ...new Set(
      cards.flatMap((c) =>
        Object.values(c.generated.slots).map((r) => r.lemmaId),
      ),
    ),
  ].filter((id) => !assigned.has(id)),
  [],
);
assert(
  !Object.keys(t.state.progress.library.acquired).some(
    (id) => c.libraryEntries[id].partOfSpeech === "verb",
  ),
);
const variants = new Set();
for (let seed = 1; seed <= 30; seed++)
  for (const x of t.learning.generatedPractice(1, seed, 2)) variants.add(x.ps);
assert(variants.size >= 3);
for (const x of cards) {
  assert.equal(x.generated.origin, "productive_engine");
  assert(x.generated.slots.noun);
  assert(x.generated.slots.adjective);
}
const before = t.learning.deliverySummary();
assert.equal(before.generatedPercent, 100);
const lessons = new Set();
for (const pace of t.E.presets)
  for (const skip of [false, true]) {
    reset(t, pace);
    const seen = new Set();
    for (let day = 1; day <= 14; day++) {
      t.state.day = day;
      if (!skip)
        for (const place of c.zoneKeys) {
          const s = study(t, day, place);
          lessons.add(pace + ":" + day + ":" + place);
          for (const id of s.studySentences) {
            const card = c.wordById[id];
            assert(card.generated);
            assert(!seen.has(card.ps), "Unscheduled sentence reuse");
            seen.add(card.ps);
          }
        }
      const before14 = Object.values(t.state.progress.library.acquired).reduce(
        (n, r) => n + r.introducedFormIds.length,
        0,
      );
      const qs = beginAttempt(t, day);
      assert.equal(qs.length, day === 7 || day === 14 ? 25 : 15);
      const targetTexts = [];
      for (const q of qs) {
        const card = c.wordById[q.id];
        if (card?.type === "sentence") {
          assert(q.generated);
          assert.equal(q.generated.generated.origin, "productive_engine");
          targetTexts.push(card.ps);
          t.learning.surface(q.id, "assessment-target");
        }
        if (q.promptPs) {
          assert(q.promptGenerated);
          assert.equal(q.promptPs, q.promptGenerated.ps);
          t.learning.surface(q.promptGenerated.id, "dialogue-prompt");
        }
        const s = t.state.session;
        t.learning.submitChallenge(correctAnswer(t, q));
        assert.equal(t.learning.submitChallenge("second"), null);
        s.index++;
        s.locked = false;
      }
      assert.equal(
        targetTexts.length,
        new Set(targetTexts).size,
        "No duplicate complete answer texts within an assessment",
      );
      if (skip) assert.equal(qs.filter((q) => q.generated).length, 0);
      if (day === 14)
        assert.equal(
          Object.values(t.state.progress.library.acquired).reduce(
            (n, r) => n + r.introducedFormIds.length,
            0,
          ),
          before14,
        );
      t.state.session.finished = true;
      t.progression.completeChallengeOnce(t.state.progress, day, qs.length);
    }
    const summary = t.learning.deliverySummary();
    assert.equal(
      summary.generatedPercent,
      summary.instructionalSentences ? 100 : null,
    );
    assert(t.progression.characterStatus(t.state.progress).level === 10);
  }
assert.equal(lessons.size, 392);
// Source evidence is not a playable alias; invented targets and unseen forms fail at the surface boundary.
reset(t);
assert.throws(() => t.learning.surface("s3-house", "study"));
const forged = plain(t.learning.generatedPractice(1, 1, 1)[0] || cards[0]);
forged.id += ":fake";
forged.ps = "کور نوی دی.";
assert.throws(
  () => c.registerGenerated(forged),
  "An origin label alone must not certify an authored or forged body",
);
const unintroduced = Object.values(c.wordById).find(
  (c) => c.generated?.family === "present_transitive",
);
assert(unintroduced);
assert.throws(() => t.learning.surface(unintroduced.id, "study"));
for (const pace of [0, 4]) {
  reset(t, pace);
  const s = study(t, 1, "residential");
  assert(s.studySentences.length < 2);
  assert(s.generationDeficit.missing > 0);
  assert.equal(
    t.state.progress.library.plans[1].locationAssignments.residential.length,
    pace / 4,
  );
}
console.log(
  "PASS generated-only architecture: Day 1 Home >=2, three pairings, 392 model visits / 196 assessments, every day/pace/skip, no authored targets, no unseen forms, explicit low-pace adaptation",
);
