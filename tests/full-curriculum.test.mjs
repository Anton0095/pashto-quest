// Broad integration matrix; public-UI independence is tested separately.
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
const hook = `window.__matrix={fresh:progression.fresh,begin:lessons.begin,afterStudy:lessons.afterStudy,afterGrammar:lessons.afterGrammar,answer:lessons.answer,nextQuestion,startChallenge:challenge.startChallenge,answerChallenge:challenge.answerChallenge,wordById:content.wordById,week2Days:content.week2Days,get session(){return state.session},get progress(){return state.progress},reset(){state.progress=progression.fresh();state.session=null;state.day=1;storage.save()},day(day){state.day=day;world.startWorld()}};`;
const html = readFileSync("index.html", "utf8").replace("// @TEST_HOOK", hook),
  server = http.createServer((req, res) => {
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
  for (const pace of [0, 4, 8, 12, 16, 20, 24])
    for (const skip of [false, true]) {
      const trace = await page.evaluate(
        async ({ pace, skip }) => {
          const t = __matrix;
          t.reset();
          t.progress.library.requestedDailyTarget = pace;
          function lesson() {
            let guard = 0;
            while (
              !document
                .querySelector("#lessonScreen")
                .classList.contains("hidden")
            ) {
              if (++guard > 500) throw Error("Lesson stalled");
              const s = t.session;
              if (s.mode === "tutorial") {
                const area = document.querySelector("#tutorialInteraction");
                const click = text => [...area.querySelectorAll("button")].find(b => b.textContent === text).click();
                if (s.cardIndex === 0) click("Hello");
                else if (s.cardIndex === 1) { click("څنګه"); click("یې؟"); click("Check sentence"); }
                else if (s.cardIndex === 2) click("Prefer not to say");
                else { document.querySelector("#tutorialName").value = "Curriculum tester"; click("Use this name"); }
                t.afterStudy();
              } else if (["greeting", "lexical", "sentence"].includes(s.phase)) t.afterStudy();
              else if (s.phase === "grammar") {
                if (document.querySelector("#sovNext").disabled) {
                  const box = document.querySelector("#openingPractice");
                  for (const label of [
                    "The player and Mina",
                    "هغوی مڼې اخلي.",
                    "هغوی ډوډۍ پلوري.",
                  ]) {
                    const b = [...box.querySelectorAll("button")].find(
                      (b) => b.textContent === label && !b.disabled,
                    );
                    if (b) b.click();
                  }
                  for (const word of ["موږ", "یو", "ځای", "منډې", "وهو"]) {
                    const b = [...box.querySelectorAll("button")].find(
                      (b) => b.textContent === word && !b.disabled,
                    );
                    if (b) b.click();
                  }
                }
                if (document.querySelector("#sovNext").disabled)
                  throw Error("Grammar practice did not complete");
                t.afterGrammar();
              } else {
                t.answer(t.wordById[s.queue[0].id].en);
                t.nextQuestion();
              }
            }
          }
          t.begin("tutorial");
          lesson();
          const trace = [];
          for (let day = 1; day <= 14; day++) {
            t.day(day);
            if (!skip) {
              const first =
                day >= 8
                  ? t.week2Days[day].opening
                  : {
                      2: "school",
                      3: "nature",
                      4: "residential",
                      5: "school",
                      6: "nature",
                      7: "business",
                    }[day] || "residential";
              const route =
                day === 2
                  ? ["school", "nature", "business", "residential"]
                  : [
                      first,
                      ...["residential", "nature", "business", "school"].filter(
                        (p) => p !== first,
                      ),
                    ];
              for (const district of route) {
                t.begin(day + "-" + district);
                if (t.session?.id !== day + "-" + district)
                  throw Error("District inaccessible " + day + district);
                lesson();
                const plan = t.progress.library.plans[day],
                  assigned = plan.locationAssignments[district];
                if (assigned.some((id) => !t.progress.library.acquired[id]))
                  throw Error(
                    "Completed visit failed to expose assigned vocabulary",
                  );
                if (
                  !plan.contentGap &&
                  assigned.length !== (day === 14 ? 0 : pace / 4)
                )
                  throw Error("Wrong per-district quota");
              }
            }
            t.startChallenge(day);
            const n = day === 7 || day === 14 ? 25 : 15,
              pass = n === 25 ? 20 : 12;
            if (t.session.questions.length !== n)
              throw Error("Assessment length");
            for (let i = 0; i < n; i++) {
              // Audit the final pre-answer DOM after queued rendering/saving.
              await Promise.resolve();
              const q = t.session.questions[i],
                w = t.wordById[q.id],
                correct =
                  q.answerPs ||
                  q.correct ||
                  (q.kind === "construct"
                    ? w.ps
                    : q.direction === "ps-en"
                      ? w.en
                      : w.ps);
              if (q.kind === "word") {
                const roman = document.querySelector("#quizRoman").textContent;
                if (q.unstudied) {
                  if (q.direction !== "ps-en" || document.querySelector("#quizPashto").textContent !== w.ps ||
                      roman !== w.roman + " · Not previously studied" ||
                      ![...document.querySelectorAll("#choices button")].some((b) => b.textContent === w.en))
                    throw Error("Unstudied word reveals its answer or loses recognition support");
                } else if (roman !== (q.direction === "ps-en" ? w.roman : "Recall the Pashto expression"))
                  throw Error("Studied word presentation changed");
                if (document.querySelector("#choices .correct,#choices .wrong,#choices button:disabled"))
                  throw Error("Answer highlighted before submission");
              }
              t.answerChallenge(i < pass ? correct : "incorrect fixture");
              t.nextQuestion();
            }
            if (!t.progress.challenges[day]?.passed)
              throw Error("Day failed " + day);
            trace.push({
              day,
              assigned: Object.values(
                t.progress.library.plans[day].locationAssignments,
              ).flat(),
              gap: t.progress.library.plans[day].contentGap,
              visits: Object.keys(t.progress.complete).filter((id) =>
                id.startsWith(day + "-"),
              ).length,
              xp: t.progress.xp,
            });
          }
          return {
            trace,
            title: document.querySelector("#characterLevel").textContent,
            graduated: t.progress.challenges[7].passed,
            complete: t.progress.challenges[14].passed,
            bank: Object.keys(t.progress.library.acquired).length,
          };
        },
        { pace, skip },
      );
      const scheduled = new Set();
      for (const day of trace.trace) {
        assert.equal(day.visits, skip ? 0 : 4);
        assert(day.xp >= 0);
        for (const id of day.assigned) {
          assert(!scheduled.has(id));
          scheduled.add(id);
        }
        if (day.day === 14) assert.equal(day.assigned.length, 0);
        else if (!day.gap) assert.equal(day.assigned.length, pace);
      }
      assert(trace.graduated && trace.complete);
      assert.match(trace.title, /Level 10 · New Resident/);
      console.log(
        "PASS full curriculum",
        pace,
        skip ? "skip" : "normal",
        JSON.stringify(
          trace.trace.map((d) => ({
            day: d.day,
            assigned: d.assigned.length,
            gap: d.gap,
          })),
        ),
      );
    }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  server.close();
}
console.log(
  "PASS 14 full 14-day profiles at seven paces, 392 normal visits, 196 minimum-score assessments, explicit supply gaps",
);
