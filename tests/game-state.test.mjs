// Public domain APIs: no DOM, substring extraction of functions, or second grading implementation.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const read = (path) => readFileSync(path, "utf8");
const html = read("index.html");
const context = Object.fromEntries(
  ["GAME_DATA", "WEEK2_DATA", "LIBRARY_DATA", "NARRATIVE_DATA"].map((name) => [
    name,
    JSON.parse(
      html.match(new RegExp("const " + name + "=(\\{.*?\\});", "s"))[1],
    ),
  ]),
);
const modules = [
  "library-engine",
  "sentence-engine",
  "content",
  "progression",
  "question-engine",
  "storage",
  "learning",
  "assessment-content",
  "questions",
];
const runtime = vm.runInNewContext(
  modules.map((name) => read("src/" + name + ".js")).join("\n") +
    `
 const content = createContent(GAME_DATA,WEEK2_DATA,LIBRARY_DATA,NARRATIVE_DATA);
 const progression = createProgression(content,LibraryEngine);
 const state = {progress:progression.fresh(),session:null,day:1};
 let raw = null;
 const backend = {getItem(){return raw},setItem(key,value){raw=value}};
 const storage = createStorage({state,content,progression,backend});
 const learning = createLearning({state,content,progression});
 const questions = createQuestions({state,content,progression,storage});
 ({content,progression,state,storage,learning,questions,E:LibraryEngine,Q:QuestionEngine,backend});
`,
  context,
);
const {
  content,
  progression: P,
  state,
  storage,
  learning,
  questions,
  Q,
} = runtime;
const clone = (value) => JSON.parse(JSON.stringify(value));
function reset(day = 1) {
  state.progress = P.fresh();
  state.progress.tutorialDone = true;
  state.session = null;
  state.day = day;
  for (let d = 1; d < day; d++)
    P.completeChallengeOnce(state.progress, d, d === 7 ? 20 : 12);
}
function attempt(items) {
  state.session = {
    mode: "challenge",
    loop: state.day,
    questions: items,
    index: 0,
    answered: 0,
    correctCount: 0,
    earned: 0,
    attemptId: ++state.progress.library.attemptSequence,
    locked: false,
    built: [],
  };
}
// Every authored question kind uses one evaluator, including intentionally accepted dialogue alternatives.
assert(
  Q.evaluate(
    { kind: "word", direction: "ps-en" },
    { ps: "سلام", en: "Hello" },
    "Hello",
  ),
);
assert(
  !Q.evaluate(
    { kind: "word", direction: "ps-en" },
    { ps: "سلام", en: "Hello" },
    "Goodbye",
  ),
);
assert(
  Q.evaluate(
    { kind: "word", direction: "en-ps" },
    { ps: "سلام", en: "Hello" },
    "سلام",
  ),
);
for (const kind of ["choice", "address"]) {
  assert(Q.evaluate({ kind, correct: "تاسې" }, null, "تاسو"));
  assert(!Q.evaluate({ kind, correct: "تاسې" }, null, "ته"));
}
assert(
  Q.evaluate(
    { kind: "construct" },
    { ps: "موږ یو ځای منډې وهو." },
    "مونږ یو ځای منډې وهو",
  ),
);
assert(
  !Q.evaluate(
    { kind: "construct" },
    { ps: "موږ یو ځای منډې وهو." },
    "وهو منډې ځای یو موږ",
  ),
);
for (const day of content.WEEK2_DATA.days)
  for (const q of day.dialogues) {
    assert(Q.evaluate(q, null, q.answerPs));
    assert(!Q.evaluate(q, null, q.duds.join(" ")));
  }
// Frozen assessments remain stable through storage on each of the fourteen unlocked days.
for (let day = 1; day <= 14; day++) {
  reset(day);
  const first = questions.selectChallenge(day);
  assert.equal(first.length, day === 7 || day === 14 ? 25 : 15);
  storage.save();
  state.progress = storage.load();
  assert.deepEqual(clone(questions.selectChallenge(day)), clone(first));
  assert(storage.currentSave(state.progress));
}
// First-submission lock protects the score, one SRS event and once-only rewards.
reset(2);
attempt([
  { kind: "word", direction: "ps-en", id: "library-card:lemma:n-window" },
]);
const target = content.wordById[state.session.questions[0].id];
assert(learning.submitChallenge(target.en).correct);
const locked = JSON.stringify(state);
assert.equal(learning.submitChallenge("wrong"), null);
assert.equal(JSON.stringify(state), locked);
assert.equal(state.session.correctCount, 1);
assert.equal(
  state.progress.library.acquired["lemma:n-window"].totalAttempts,
  1,
);
const xp = state.progress.xp;
attempt([{ kind: "word", direction: "ps-en", id: target.id }]);
learning.submitChallenge(target.en);
assert.equal(
  state.progress.xp,
  xp,
  "same question replay cannot repeat its reward",
);
attempt([{ kind: "word", direction: "ps-en", id: target.id }]);
assert(!learning.submitChallenge("wrong").correct);
assert.equal(state.session.correctCount, 0);
assert.equal(
  state.progress.library.acquired["lemma:n-window"].forms[
    content.LIBRARY_DATA.sourceMappings[target.id][0].formId
  ].stage,
  0,
);
// Lesson retries share the same evaluator and records; first accuracy cannot be repaired retroactively.
state.session = {
  mode: "standard",
  loop: 2,
  loc: "residential",
  queue: [{ id: target.id, retries: 0 }],
  firstAsked: new Set(),
  passed: new Set(),
  firstCorrect: 0,
  answered: 0,
  earned: 0,
  attemptId: ++state.progress.library.attemptSequence,
  locked: false,
};
assert(!learning.submitLesson("wrong").correct);
assert.equal(state.session.queue[0].retries, 1);
assert.equal(learning.submitLesson(target.en), null);
state.session.locked = false;
assert(learning.submitLesson(target.en).correct);
assert.equal(state.session.firstCorrect, 0);
assert.equal(state.session.queue.length, 0);
// Current partial tile attempts round-trip without exposure, grading or extra SRS/XP events.
reset(2);
const items = questions.selectChallenge(2),
  build = items.findIndex((q) => q.kind === "construct");
[items[0], items[build]] = [items[build], items[0]];
attempt(items);
state.session.tileSequence = Q.buildTiles(
  content.wordById[items[0].id],
  items[0],
  2,
).map((t) => t.index);
state.session.built = [state.session.tileSequence[0]];
storage.save();
const saved = JSON.stringify(state.progress);
assert(storage.currentSave(state.progress));
state.progress = storage.load();
assert.equal(JSON.stringify(state.progress), saved);
const corrupt = clone(state.progress);
corrupt.activeChallenge.built = [0, 0];
assert(!storage.currentSave(corrupt));
const unsafe = clone(state.progress);
unsafe.library.plans[2].locationAssignments.residential.push("unknown-lemma");
assert(!storage.currentSave(unsafe));
// Invalid Day 1 action assignments are rejected, never repaired in place.
reset(1);
questions.selectChallenge(1);
const actionPlan = clone(state.progress);
actionPlan.library.plans[1].locationAssignments.school[0] = "lemma:v-read";
assert(!storage.currentSave(actionPlan));
// Every new grammar family survives partial-tile save/retry with its full provenance.
reset(14);
for (let day=1; day<=13; day++) runtime.E.unlock(state.progress, day, "fixture");
for (const e of content.LIBRARY_DATA.entries) for (const f of e.forms)
  runtime.E.encounter(state.progress, content.LIBRARY_DATA,
    {lemmaId:e.lemmaId,formId:f.formId}, {day:13,source:"lesson",introduce:true});
const generatedFamilies = [...new Set(content.LIBRARY_DATA.generatedCatalog.map(c=>c.generated.family))];
for (const family of generatedFamilies) {
  const card = content.LIBRARY_DATA.generatedCatalog.find(c=>c.generated.family===family);
  const list = questions.selectChallenge(14);
  list[0] = {id:card.id,kind:"construct",direction:"en-ps",generated:clone(card)};
  list[0].tileSequence = Q.buildTiles(card,list[0],14).map(t=>t.index).reverse();
  state.progress.library.plans[14].challengeQuestions = clone(list);
  attempt(list);
  state.session.tileSequence = clone(list[0].tileSequence);
  state.session.built = [state.session.tileSequence[0]];
  storage.save();
  assert(storage.currentSave(state.progress), family);
  const frozen = JSON.stringify(state.progress);
  state.progress = storage.load();
  assert.equal(JSON.stringify(state.progress), frozen, family);
  assert.deepEqual(clone(questions.selectChallenge(14)),clone(list), family);
  const badSlots = clone(state.progress);
  const slot = Object.keys(badSlots.activeChallenge.questions[0].generated.generated.slots)[0];
  badSlots.activeChallenge.questions[0].generated.generated.slots[slot].formId += ":different";
  assert(!storage.currentSave(badSlots), "changed slots with unchanged text must be rejected");
  const badRoman = clone(state.progress);
  badRoman.activeChallenge.questions[0].generated.roman = "unattested pronunciation";
  assert(!storage.currentSave(badRoman), "full pronunciation snapshot must match");
}
assert(generatedFamilies.length > 9);
console.log("PASS all-family generated persistence:",generatedFamilies.length,"families, exact text/gloss/tiles/romanisation/provenance, stable retry, tampering rejected");
// Old formats are rejected rather than adapted; explicit reset is required to replace raw storage.
const old = JSON.stringify({ ...state.progress, saveSchemaVersion: 4 });
runtime.backend.setItem(null, old);
state.session = null;
state.progress = storage.load();
assert(storage.problem);
storage.save();
assert.equal(runtime.backend.getItem(), old);
storage.resetProblem();
state.progress = P.fresh();
storage.save();
assert.equal(JSON.parse(runtime.backend.getItem()).saveSchemaVersion, 6);
console.log(
  "PASS domain APIs: all question kinds, fourteen frozen assessments, first-answer transactions, shared SRS/XP, retries, current partial saves, invalid/old save rejection and explicit reset",
);
