import { readFileSync } from "node:fs";
import vm from "node:vm";
export const plain = (x) => JSON.parse(JSON.stringify(x));
export function runtime() {
  const html = readFileSync("index.html", "utf8");
  const context = Object.fromEntries(
    ["LIBRARY_DATA", "NARRATIVE_DATA"].map((n) => [
      n,
      JSON.parse(
        html.match(new RegExp("const " + n + "=(\\{.*?\\});", "s"))[1],
      ),
    ]),
  );
  const modules = [
    "library-engine",
    "sentence-engine",
    "content",
    "progression",
    "question-engine",
    "learning",
    "assessment-content",
    "questions",
    "storage",
  ];
  return vm.runInNewContext(
    modules.map((n) => readFileSync("src/" + n + ".js", "utf8")).join("\n") +
      `
 const content=createContent(LIBRARY_DATA,NARRATIVE_DATA),progression=createProgression(content,LibraryEngine);
 const state={progress:progression.fresh(),session:null,day:1};let raw=null;
 const backend={getItem(){return raw},setItem(k,v){raw=v}},storage=createStorage({state,content,progression,backend});
 const learning=createLearning({state,content,progression}),questions=createQuestions({state,content,progression,storage});
 ({content,progression,state,storage,backend,learning,questions,E:LibraryEngine,S:SentenceEngine,Q:QuestionEngine});`,
    context,
  );
}
export function reset(t, pace = 24) {
  t.state.progress = t.progression.fresh();
  t.state.progress.tutorialDone = true;
  t.state.progress.library.requestedDailyTarget = pace;
  t.state.session = null;
  t.state.day = 1;
  t.storage.resetProblem();
}
export function study(t, day, place) {
  t.state.day = day;
  const pool = t.learning.libraryLessonPool(day, place);
  const s = (t.state.session = {
    id: day + "-" + place,
    mode: "standard",
    loc: place,
    loop: day,
    attemptId: ++t.state.progress.library.attemptSequence,
    required: [...pool],
    queue: pool.map((id) => ({ id, retries: 0, kind: "word" })),
    studySentences: [],
    firstAsked: new Set(),
    firstCorrect: 0,
    passed: new Set(),
    answered: 0,
    earned: 0,
    locked: false,
  });
  for (const id of pool) {
    t.learning.surface(id, "study");
    t.learning.libraryExpose(id, "lesson");
  }
  for (let d = 1; d <= day; d++)
    t.E.unlock(t.state.progress, d, "visible-workshop-fixture");
  t.learning.prepareSentences(s);
  for (const id of s.studySentences) t.learning.surface(id, "study");
  while (s.queue.length) {
    const item = s.queue[0],
      w = t.content.wordById[item.id];
    s.locked = false;
    t.learning.submitLesson(item.kind === "construct" ? w.ps : w.en);
  }
  t.progression.completeLessonOnce(
    t.state.progress,
    s.id,
    "standard",
    true,
    s.required.length,
  );
  return s;
}
export function beginAttempt(t, day) {
  const items = t.questions.selectChallenge(day);
  t.state.day = day;
  t.state.session = {
    id: "challenge-" + day,
    mode: "challenge",
    loc: null,
    loop: day,
    questions: items,
    index: 0,
    answered: 0,
    correctCount: 0,
    earned: 0,
    attemptId: ++t.state.progress.library.attemptSequence,
    locked: false,
    built: [],
  };
  return items;
}
export function correctAnswer(t, q) {
  const w = t.content.wordById[q.id];
  return (
    q.answerPs ||
    q.correct ||
    (q.kind === "construct" ? w.ps : q.direction === "ps-en" ? w.en : w.ps)
  );
}
