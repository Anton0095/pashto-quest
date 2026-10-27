import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import http from "node:http";
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({
    chromium,
  } = require("/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"));
}
const hook = `window.__composition={state,content,learning,questions,lessons,challenge,progression,storage,reset(){state.progress=progression.fresh();state.progress.tutorialDone=true;state.progress.library.requestedDailyTarget=24;state.session=null;state.day=1;world.startWorld()}};`;
const html = readFileSync("index.html", "utf8").replace("// @TEST_HOOK", hook);
const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/html;charset=utf-8");
  res.end(html);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 900 } }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const result = await page.evaluate(() => {
    const t = __composition;
    t.reset();
    const reviewOnly = t.learning.libraryLessonPool(14, "residential");
    if (reviewOnly.some((id) => id.startsWith("library-card:")))
      throw Error(
        "Day 14 introduced skipped universal lemmas as new vocabulary",
      );
    t.reset();
    let generated = 0;
    for (const location of ["residential", "nature", "business", "school"]) {
      t.lessons.begin("1-" + location);
      let guard = 0;
      while (
        !document.querySelector("#lessonScreen").classList.contains("hidden")
      ) {
        if (++guard > 400) throw Error("Lesson stalled");
        const s = t.state.session;
        if (["greeting", "lexical", "sentence"].includes(s.phase)) {
          const id = t.lessons.studyList()[s.cardIndex],
            w = t.content.wordById[id];
          if (w.generated) {
            generated++;
            for (const r of Object.values(w.generated.slots))
              if (
                !t.state.progress.library.acquired[
                  r.lemmaId
                ]?.introducedFormIds.includes(r.formId)
              )
                throw Error("Unstudied generated form");
          }
          t.lessons.afterStudy();
        } else if (s.phase === "grammar") t.lessons.afterGrammar();
        else {
          t.lessons.answer(t.content.wordById[s.queue[0].id].en);
          document.querySelector("#quizNext").click();
        }
      }
    }
    const selections = JSON.parse(
      JSON.stringify(t.state.progress.library.plans[1].generatedPractice),
    );
    for (const location of Object.keys(selections)) {
      t.lessons.begin("1-" + location);
      t.learning.prepareSentences(t.state.session);
      if (
        JSON.stringify(t.state.session.generatedPractice.map((c) => c.id)) !==
        JSON.stringify(selections[location])
      )
        throw Error(
          "Completed visit rerolled generated practice after later unlocks",
        );
    }
    const candidates = t.learning.generatedPractice(1, 1, 200);
    t.challenge.startChallenge(1);
    return {
      generated,
      candidates: candidates.map((c) => c.ps),
      questions: JSON.parse(JSON.stringify(t.state.session.questions)),
    };
  });
  assert(result.generated > 0);
  assert(result.candidates.includes("کور نوی دی."));
  assert(result.candidates.includes("کتاب لوی دی."));
  assert(result.questions.some((q) => q.generated));
  const before = await page.evaluate(() => ({
    questions: __composition.state.session.questions,
    xp: __composition.state.progress.xp,
    library: __composition.state.progress.library,
  }));
  await page.reload();
  assert.deepEqual(
    await page.evaluate(() => __composition.state.session.questions),
    before.questions,
  );
  assert.equal(
    await page.evaluate(() => __composition.state.progress.xp),
    before.xp,
  );
  // Submit to the first generated prompt; its exact card, options and provenance survive a locked reload.
  async function submitCurrent() {
    const info = await page.evaluate(() => {
      const t = __composition,
        s = t.state.session,
        q = s.questions[s.index],
        w = t.content.wordById[q.id];
      return {
        kind: q.kind,
        answer:
          q.correct ||
          (q.kind === "construct"
            ? w.ps
            : q.direction === "ps-en"
              ? w.en
              : w.ps),
      };
    });
    if (info.kind === "construct") {
      for (const token of info.answer
        .replace(/[.!؟،]/g, "")
        .split(/\s+/)
        .filter(Boolean))
        await page
          .locator("#wordTiles button:enabled")
          .getByText(token, { exact: true })
          .first()
          .click();
      await page.locator("#checkBuild").click();
    } else
      await page
        .locator("#choices button")
        .getByText(info.answer, { exact: true })
        .click();
  }
  while (
    !(await page.evaluate(
      () =>
        __composition.state.session.questions[__composition.state.session.index]
          .generated,
    ))
  ) {
    await submitCurrent();
    await page.locator("#quizNext").click();
  }
  await submitCurrent();
  const locked = await page.evaluate(() => ({
    session: __composition.state.session,
    xp: __composition.state.progress.xp,
    library: __composition.state.progress.library,
  }));
  await page.reload();
  assert.equal(
    await page.evaluate(() => __composition.state.session.locked),
    true,
  );
  assert.equal(
    await page.evaluate(() => __composition.state.progress.xp),
    locked.xp,
  );
  assert.deepEqual(
    await page.evaluate(() => __composition.state.progress.library),
    locked.library,
  );
  // Retrying freezes every question/choice/tile order, rather than drawing a different exam.
  const frozen = await page.evaluate(
    () => __composition.state.session.questions,
  );
  await page.evaluate(() => __composition.challenge.startChallenge(1));
  assert.deepEqual(
    await page.evaluate(() => __composition.state.session.questions),
    frozen,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS generated practice: real Day 1 study unlocks, new compositions, frozen options/provenance, unanswered and locked reload, stable retry, mobile UI",
  );
} finally {
  await browser.close();
  server.close();
}
