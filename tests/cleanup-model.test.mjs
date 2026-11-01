import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runtime, plain, reset } from "./runtime-fixture.mjs";
const t = runtime(),
  { content: c, progression: P, E } = t;
const contract = JSON.parse(readFileSync("tests/world-contract.json", "utf8"));
for (const old of contract.days) {
  const day = old.day,
    spec = P.getChallengeSpec(day);
  for (const key of ["questionCount", "passCount", "scene"])
    assert.equal(spec[key], old.challenge[key]);
  if (old.challenge.title) assert.equal(spec.title, old.challenge.title);
  assert.equal(c.teacherFor(day, null, "challenge").name, old.challengeTeacher);
  assert.equal(c.dayById[day].story || null, old.story);
  for (const lesson of old.lessons) {
    assert.equal(
      c.teacherFor(day, lesson.location, "standard").name,
      lesson.teacher,
    );
    assert.deepEqual(
      plain(c.peopleAt[day][lesson.location]),
      lesson.participants,
    );
  }
  reset(t);
  for (let prior = 1; prior < day; prior++)
    P.completeChallengeOnce(t.state.progress, prior, prior === 7 ? 25 : 15);
  for (const location of c.zoneKeys)
    assert.equal(
      P.placeAccessible(t.state.progress, day, location),
      day === 1 || location === old.opening,
    );
  t.state.progress.complete[`${day}-${old.opening}`] = true;
  for (const location of c.zoneKeys)
    assert.equal(
      P.placeAccessible(t.state.progress, day, location),
      day !== 2 || location !== "residential",
    );
  if (day === 2) {
    t.state.progress.complete["2-business"] = true;
    t.state.progress.complete["2-nature"] = true;
    assert(P.placeAccessible(t.state.progress, 2, "residential"));
  }
}
reset(t, 0);
t.state.day = 14;
assert.deepEqual(
  plain(t.learning.libraryLessonPool(14, "residential")),
  ["phrase-day-14-opening"],
  "The approved daily phrase is available without new Day-14 lemmas",
);
const xp = t.state.progress.xp;
assert.equal(
  P.completeLessonOnce(t.state.progress, "14-residential", "standard", true, 0),
  0,
);
assert(
  t.state.progress.complete["14-residential"],
  "An empty visit must not strand route progression",
);
assert.equal(t.state.progress.xp, xp, "No completion XP without practice");
assert(!("sovSeen" in P.fresh()) && !("personIntros" in P.fresh()));
assert(t.storage.currentSave(P.fresh()));
assert.equal(P.SAVE_VERSION, 7, "Cleanup alone does not reset current users");
const first = c.LIBRARY_DATA.entries[0];
assert.equal(
  E.encounter(
    t.state.progress,
    c.LIBRARY_DATA,
    { lemmaId: first.lemmaId, formId: first.forms[0].formId },
    { day: 0, source: "lesson" },
  ),
  null,
  "Day 0 is phrases, not lexical introductions",
);
console.log(
  "PASS cleanup model: all fourteen days preserve routes, teachers, participants, story, challenge destinations/counts; empty visits give no XP; schema 7 retained; no lexical Day-0 records",
);

// Historical fixtures protect linguistic evidence without loading it as playable content.
const historical = JSON.parse(
  readFileSync("tests/curriculum-contract.json", "utf8"),
).words;
const sources = new Map(
  JSON.parse(
    readFileSync("docs/grammar/attestations/WEEK1_AUTHORED.json", "utf8"),
  ).words.map((card) => [card.id, card]),
);
for (const day of JSON.parse(
  readFileSync("docs/grammar/attestations/WEEK2_AUTHORED.json", "utf8"),
).days)
  for (const card of [
    ...day.vocabulary,
    ...day.lessons.flatMap((lesson) => lesson.cards),
  ])
    sources.set(card.id, {
      ps: card.pashto,
      roman: card.romanization,
      en: card.english,
    });
for (const card of historical) {
  assert(sources.has(card.id));
  for (const field of ["ps", "roman", "en"])
    assert.equal(
      sources.get(card.id)[field],
      card[field],
      card.id + ":" + field,
    );
}
console.log(
  `PASS preserved bilingual evidence: all ${historical.length} historical contract records remain exact in the archives`,
);
