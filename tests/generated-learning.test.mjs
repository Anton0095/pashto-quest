import assert from "node:assert/strict";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { setup, school, tutorial, answerCurrent } from "./browser-fixture.mjs";
const b = await setup();
try {
  const { page } = b;
  await tutorial(page);
  await page.locator("#resultWorld").click();
  await school(page);
  await page.locator('.map-point[data-place="residential"]').click();
  const transcript = [];
  let guard = 0;
  while (await page.locator("#lessonScreen").isVisible()) {
    if (++guard > 100) throw Error("Day 1 lesson stalled");
    const s = await page.evaluate(() => {
      const t = __test,
        s = t.state.session,
        id = t.lessons.studyList()[s.cardIndex],
        c = t.content.wordById[id];
      return {
        phase: s.phase,
        id,
        card: c,
        phrase: t.content.LIBRARY_DATA.phrases.some((p) => p.id === id),
        grammar: t.state.progress.library.grammar,
        queue: s.queue.length,
      };
    });
    if (["greeting", "lexical", "sentence"].includes(s.phase)) {
      if (s.card)
        transcript.push({
          phase: s.phase,
          id: s.id,
          pashto: s.card.ps,
          english: s.card.en,
          origin:
            s.card.generated?.origin ||
            (s.phrase ? s.id : null) ||
            "lexical_form",
        });
      if (s.phase === "sentence") {
        assert(s.card.generated);
        assert(s.grammar["grammar-day-1"]);
        const check = await page.evaluate((id) => {
          const t = __test,
            c = t.content.wordById[id];
          return Object.values(c.generated.slots).every((r) =>
            t.state.progress.library.acquired[
              r.lemmaId
            ]?.availableFormIds.includes(r.formId),
          );
        }, s.id);
        assert(check);
        mkdirSync("docs/grammar/demonstration", { recursive: true });
        if (transcript.filter((t) => t.phase === "sentence").length === 1)
          await page.screenshot({
            path: "docs/grammar/demonstration/day1-generated-study.png",
            fullPage: true,
          });
      }
      await page.locator("#teachNext").click();
    } else if (s.phase === "grammar") {
      transcript.push({
        phase: "grammar",
        text: await page.locator("#grammarExplanation").innerText(),
      });
      await page.locator("#grammarNext").click();
    } else {
      const isBuild = await page.evaluate(
        () => __test.state.session.activeItem.kind === "construct",
      );
      if (isBuild) {
        if (!transcript.some((x) => x.phase === "construction-demo")) {
          await page.screenshot({
            path: "docs/grammar/demonstration/day1-construction.png",
            fullPage: true,
          });
          transcript.push({
            phase: "construction-demo",
            text: await page.locator("#quizPashto").innerText(),
          });
        }
      }
      await answerCurrent(page);
      await page.locator("#quizNext").click();
    }
  }
  const sentences = transcript.filter((t) => t.phase === "sentence");
  assert(sentences.length >= 2);
  assert.equal(sentences.length, new Set(sentences.map((t) => t.pashto)).size);
  const eligible=await page.evaluate(()=>__test.learning.availableSentences(1).map(c=>c.ps));
  for(const text of ['کور لوی دی.','دروازه خلاصه ده.','کړکۍ خلاصه ده.'])assert(eligible.includes(text));
  assert(sentences.every(c=>eligible.includes(c.pashto)));
  assert(
    transcript.findIndex((t) => t.phase === "grammar") >
      transcript.map((t) => t.phase).lastIndexOf("lexical"),
  );
  const summary = await page.evaluate(() => ({
    delivery: __test.learning.deliverySummary(),
    home: __test.state.progress.complete["1-residential"],
    assigned:
      __test.state.progress.library.plans[1].locationAssignments.residential,
    acquired: Object.keys(__test.state.progress.library.acquired),
  }));
  assert(summary.home);
  assert.equal(summary.assigned.length, 8);
  assert.equal(summary.delivery.generatedPercent, 100);
  assert(summary.acquired.every((id) => !id.startsWith("lemma:v-")));
  const variants = await page.evaluate(() => {
    const out = new Set();
    for (let seed = 1; seed < 30; seed++)
      for (const c of __test.learning.generatedPractice(1, seed, 2))
        out.add(c.ps);
    return [...out];
  });
  assert(variants.length >= 3);
  writeFileSync(
    "work/day1-after.json",
    JSON.stringify({ transcript, summary, variants }, null, 2),
  );
  for (const pace of [8]) {
    await page.evaluate((p) => {
      __test.reset(p);
      __test.state.progress.tutorialDone = true;
      (__test.studySchool(1),__test.lessons.begin("1-residential"));
    }, pace);
    await page.evaluate(() => {
      const t = __test;
      let n = 0;
      while (
        !document.querySelector("#lessonScreen").classList.contains("hidden")
      ) {
        if (++n > 100) throw Error("low pace stalled");
        const s = t.state.session;
        if (["greeting", "lexical", "sentence"].includes(s.phase))
          t.lessons.afterStudy();
        else if (s.phase === "grammar") t.lessons.afterGrammar();
        else {
          const x = s.queue[0],
            w = t.content.wordById[x.id];
          t.lessons.answer(x.kind === "construct" ? w.ps : w.en);
          t.nextQuestion();
        }
      }
    });
    const result = await page.evaluate(() => ({
      p: __test.state.progress.library.plans[1],
      d: __test.state.progress.library.deficits["1-residential"],
    }));
    assert.equal(result.p.locationAssignments.residential.length, ({8:2,12:4,16:5,20:6,24:8})[pace]);
    assert(result.d.available <= 3);
    assert.equal(result.d.missing,3-result.d.available);
  }
  assert.deepEqual(b.errors, []);
  console.log(
    "PASS real Day 1 Home: Library onboarding, eight Home quota lemmas after School, vocabulary -> grammar -> three generated descriptions -> tile construction, seed variation, low-pace deficits without extra lemmas, 100% generated sentence delivery, mobile screenshots",
  );
} finally {
  await b.close();
}
