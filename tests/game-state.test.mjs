import assert from "node:assert/strict";
import {
  runtime,
  reset,
  study,
  beginAttempt,
  correctAnswer,
  plain,
} from "./runtime-fixture.mjs";
const t = runtime();
reset(t);
study(t, 1, "residential");
const qs = beginAttempt(t, 1);
const i = qs.findIndex((q) => q.kind === "construct");
assert(i >= 0);
[qs[0], qs[i]] = [qs[i], qs[0]];
t.state.session.tileSequence = plain(qs[0].tileSequence);
t.state.session.built = [qs[0].tileSequence[0]];
t.storage.save();
assert(t.storage.currentSave(t.state.progress));
const saved = JSON.stringify(t.state.progress);
t.state.progress = t.storage.load();
assert.equal(JSON.stringify(t.state.progress), saved);
const answer = correctAnswer(t, qs[0]),
  xp = t.state.progress.xp;
assert(t.learning.submitChallenge(answer).correct);
const after = t.state.progress.xp;
assert(after >= xp);
assert.equal(t.learning.submitChallenge(answer), null);
assert.equal(t.state.progress.xp, after);
t.storage.save();
assert(t.storage.currentSave(t.state.progress));
const bad = plain(t.state.progress);
bad.activeChallenge.questions[0].generated.roman = "invented";
assert(!t.storage.currentSave(bad));
const altered = plain(t.state.progress);
const slot = Object.keys(
  altered.activeChallenge.questions[0].generated.generated.slots,
)[0];
altered.activeChallenge.questions[0].generated.generated.slots[slot].formId +=
  "wrong";
assert(!t.storage.currentSave(altered));
const dup = plain(t.state.progress);
dup.activeChallenge.built = [0, 0];
assert(!t.storage.currentSave(dup));
reset(t);
for (let d = 1; d <= 14; d++) {
  t.state.day = d;
  for (const place of t.content.zoneKeys) study(t, d, place);
  t.progression.completeChallengeOnce(
    t.state.progress,
    d,
    d === 7 || d === 14 ? 25 : 15,
  );
}
const families = new Set(
  t.learning.availableSentences(14).map((c) => c.generated.family),
);
assert(families.has("coordinated_present"));
for (const family of families) {
  const card = t.content.registerGenerated(
      t.learning
        .availableSentences(14)
        .find((c) => c.generated.family === family),
    ),
    list = beginAttempt(t, 14);
  list[0] = {
    id: card.id,
    kind: "construct",
    direction: "en-ps",
    generated: plain(card),
  };
  t.state.session.tileSequence = t.Q.buildTiles(card, list[0], 14).map(
    (t) => t.index,
  );
  t.state.session.built = [0];
  t.storage.save();
  assert(t.storage.currentSave(t.state.progress), family);
  const full = JSON.stringify(t.state.progress);
  t.state.progress = t.storage.load();
  assert.equal(JSON.stringify(t.state.progress), full, family);
}
// A cold load must preserve SRS even if an equivalent frame occurs first in plans.
const equivalentPool = t.S.catalog(
  t.content.LIBRARY_DATA,
  t.content.LIBRARY_DATA.sentenceFrames,
);
const original = equivalentPool.find(
  (c) => c.generated.frameId === "together-compound",
);
const equivalent = equivalentPool.find(
  (c) => c.id !== original.id && c.ps === original.ps && c.en === original.en,
);
assert(equivalent);
const firstRuntime = runtime();
firstRuntime.content.registerGenerated(original);
firstRuntime.content.registerGenerated(equivalent);
const stored = {
  library: {
    units: { [original.id]: { stage: 2, correctAttempts: 1 } },
    plans: { 6: { generatedPracticeCards: { nature: [plain(equivalent)] } } },
  },
};
const coldRuntime = runtime();
assert(coldRuntime.content.restoreGenerated(stored));
assert.equal(
  coldRuntime.E.cardStat(
    stored,
    coldRuntime.content.LIBRARY_DATA,
    equivalent.id,
  ).stage,
  2,
  "Restoring a later equivalent snapshot must not split the practiced meaning's SRS",
);
const milestone = t.progression.completeChallengeOnce(t.state.progress, 14, 25);
assert(!milestone.firstPass);
const old = JSON.stringify({ ...t.state.progress, saveSchemaVersion: 6 });
t.backend.setItem(null, old);
t.state.session = null;
t.state.progress = t.storage.load();
assert(t.storage.problem);
t.storage.save();
assert.equal(t.backend.getItem(), old);
t.storage.resetProblem();
t.state.progress = t.progression.fresh();
t.storage.save();
assert.equal(JSON.parse(t.backend.getItem()).saveSchemaVersion, 7);
assert(
  t.Q.evaluate({ kind: "construct" }, { ps: "کور لوی دی." }, "کور لوی دی"),
);
assert(
  !t.Q.evaluate({ kind: "construct" }, { ps: "کور لوی دی." }, "دی لوی کور"),
);
console.log(
  "PASS state: schema 7, partial/locked generated snapshots, all " +
    families.size +
    " families including composite AST restoration, slots/romanisation/tile tamper rejection, first-answer lock, non-farmable XP, cold-load shared-meaning SRS and explicit old-save reset",
);
