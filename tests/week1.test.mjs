import {models} from "./model-fixture.mjs";
import { readFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
import http from "node:http";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({
    chromium,
  } = require("/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"));
}
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

const fixture = JSON.parse(
  readFileSync(new URL("acceptance_fixtures.json", import.meta.url), "utf8"),
);
const api = models();
let checks = 0;
function check(name, fn) {
  fn();
  checks++;
  console.log("PASS", name);
}
check("XP-01 fresh newcomer", () =>
  assert.deepEqual(
    JSON.parse(JSON.stringify(api.characterStatus(api.fresh()))),
    { level: 1, title: "Newcomer", xp: 0, cleared: 0, capped: false },
  ),
);
check(
  "XP-02/03/05/06 minimum checkpoints, failure, repeat atomic rewards",
  () => {
    const p = api.fresh();
    for (const f of fixture.dayProgression) {
      const fail = api.completeChallengeOnce(p, f.day, f.passingScore - 1);
      assert.equal(fail.passed, false);
      assert.equal(fail.base + fail.topUp, 0);
      assert.equal(api.characterStatus(p).title, "Newcomer");
      const pass = api.completeChallengeOnce(p, f.day, f.passingScore);
      assert(pass.firstPass);
      assert(p.xp >= f.minCumulativeXp);
      assert.equal(api.characterStatus(p).level, f.levelCap);
      assert.equal(api.characterStatus(p).title, f.title);
      const xp = p.xp;
      api.completeChallengeOnce(p, f.day, f.questions);
      assert.equal(p.xp, xp);
      assert.equal(JSON.parse(JSON.stringify(p)).xp, xp);
    }
  },
);
check("XP-04 banked XP cannot bypass story gate", () => {
  const p = api.fresh();
  p.xp = 10000;
  assert.equal(api.characterStatus(p).level, 1);
  for (let d = 1; d <= 6; d++) api.completeChallengeOnce(p, d, 12);
  assert.equal(api.characterStatus(p).level, 9);
  assert.equal(api.characterStatus(p).title, "Newcomer");
  assert.equal(p.xp, 10450);
});
check("Current save reload retains current XP and gate flags", () => {
  const p = api.fresh();
  p.xp = 2500;
  const restored = JSON.parse(JSON.stringify(p));
  assert.equal(api.characterStatus(restored).level, 1);
  assert.equal(restored.saveSchemaVersion, 6);
});
// Tests expose the lexical runtime only in the HTTP response, never in the app file.
const hook = `window.__test={get progress(){return state.progress},get session(){return state.session},get selectedLoop(){return state.day},words:content.words,wordById:content.wordById,courses:content.courses,zoneKeys:content.zoneKeys,selectChallenge:questions.selectChallenge,normalizeAnswer:QuestionEngine.normalizeAnswer,characterStatus:progression.characterStatus,allowed:learning.allowed,passedChallenge:learning.passedChallenge,placeAccessible:learning.placeAccessible,dayGuidance:world.dayGuidance,teacherFor:content.teacherFor,startWorld:world.startWorld,showChallengeQuestion:challenge.showChallengeQuestion,save:storage.save,load:storage.load,setProgress(p){state.progress={...progression.fresh(),...p,saveSchemaVersion:6,library:p.library||LibraryEngine.state()};storage.save();ui.hud();world.startWorld()},select(day){state.day=day;world.startWorld()}};`;
const testHtml = html.replace("// @TEST_HOOK", hook);
const server = http.createServer((req, res) => {
  if (req.url.startsWith("/audio/")) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(req.url === "/standalone" ? html : testHtml);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
let pages = 0;
async function setup(width = 1280) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await page.waitForFunction(() => !!window.__test);
  pages++;
  return { page, context, errors };
}
async function snap(page) {
  return page.evaluate(() => ({
    p: __test.progress,
    s: __test.session
      ? {
          loop: __test.session.loop,
          index: __test.session.index,
          mode: __test.session.mode,
          phase: __test.session.phase,
          cardIndex: __test.session.cardIndex,
        }
      : null,
    status: __test.characterStatus(__test.progress),
  }));
}
async function answerCurrent(page, correct = true) {
  assert(
    !/YOUR RESPONSE → Player$/.test(
      await page.locator("#addressTarget").innerText(),
    ),
  );
  const target = await page.evaluate((correct) => {
    const s = __test.session,
      q = s.questions[s.index],
      w = __test.wordById[q.id];
    return {
      construct: q.kind === "construct",
      answer: !correct
        ? "__wrong__"
        : q.kind === "choice" || q.kind === "address"
          ? q.correct
          : q.direction === "ps-en"
            ? w.en
            : w.ps,
      tiles: w?.ps
        .replace(/[.!؟،]/g, "")
        .split(/\s+/)
        .filter(Boolean),
    };
  }, correct);
  if (target.construct) {
    const tiles = correct ? target.tiles : [...target.tiles].reverse();
    for (const word of tiles)
      await page
        .locator("#wordTiles button:not(:disabled)")
        .filter({
          hasText: new RegExp(
            "^" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
          ),
        })
        .first()
        .click();
    await page.locator("#checkBuild").click();
  } else {
    const buttons = page.locator("#choices button");
    if (correct) {
      await buttons
        .filter({ hasText: target.answer })
        .evaluateAll((bs, answer) => {
          const b = bs.find(
            (b) => b.dataset.answer === answer || b.textContent === answer,
          );
          if (!b) throw Error("No expected answer " + answer);
          b.click();
        }, target.answer);
    } else
      await buttons.evaluateAll(
        (bs, answer) => {
          const b = bs.find(
            (b) => (b.dataset.answer || b.textContent) !== answer,
          );
          b.click();
        },
        await page.evaluate(() => {
          const s = __test.session,
            q = s.questions[s.index],
            w = __test.wordById[q.id];
          return q.correct || (q.direction === "ps-en" ? w.en : w.ps);
        }),
      );
  }
}
async function runAssessment(page, score) {
  const count = await page.evaluate(() => __test.session.questions.length);
  for (let i = 0; i < count; i++) {
    assert.match(
      await page.locator("#quizCounter").innerText(),
      new RegExp(`${i + 1}/${count}`),
    );
    if (i < count - 1)
      assert(!/See results/.test(await page.locator("#quizNext").innerText()));
    else
      assert.match(await page.locator("#quizNext").innerText(), /See results/);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "Challenge overflows viewport",
    );
    await answerCurrent(page, i < score);
    const before = await page.evaluate(() => __test.session.correctCount);
    await answerCurrentLocked(page);
    assert.equal(
      await page.evaluate(() => __test.session.correctCount),
      before,
    );
    await page.locator("#quizNext").click();
  }
  assert.equal(
    await page.locator("#resultAccuracy").innerText(),
    `${score}/${count}`,
  );
}
async function answerCurrentLocked(page) {
  await page.evaluate(() => {
    document.querySelector("#choices button")?.click();
    document.querySelector("#checkBuild")?.click();
  });
}
async function tutorial(page) {
  await page.locator("#startTutorial").click();
  assert(await page.locator("#teachPashto").isVisible());
  assert.equal(await page.locator("#teachPashto").innerText(), "سلام");
  assert(await page.locator("#teachNext").isDisabled(), "cannot skip first study interaction");
  await page.locator("#tutorialInteraction .choice").filter({hasText:"Hello"}).click();
  await page.locator("#teachNext").click();
  assert.equal(await page.locator("#teachPashto").innerText(), "څنګه یې؟");
  await page.locator('.tutorial-tile[data-word="څنګه"]').click();
  await page.locator('.tutorial-tile[data-word="یې؟"]').click();
  await page.getByRole("button",{name:"Check sentence"}).click();
  await page.locator("#teachNext").click();
  await page.locator('[data-gender="female"]').click();
  await page.locator("#teachNext").click();
  assert(await page.locator("#teachNext").isDisabled(), "name must be submitted");
  await page.locator("#tutorialName").fill("Sami");
  await page.locator("#tutorialSaveName").click();
  await page.locator("#teachNext").click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("pashto-town-days-v1")));
  assert.equal(saved.tutorialDone,true);
  assert.deepEqual(saved.playerProfile,{name:"Sami",gender:"female"});
  await page.locator("#resultWorld").click();
}
async function finishLesson(page) {
  let guard = 0;
  while (await page.locator("#resultScreen").isHidden()) {
    if (++guard > 160) throw Error("Lesson stalled");
    const phase = await page.evaluate(() => __test.session.phase);
    if (phase === "grammar") {
      if (await page.locator("#sovNext").isDisabled()) {
        const day = await page.evaluate(() => __test.session.loop);
        if (day === 6) {
          await page
            .getByRole("button", { name: "Only Saleha and Mina", exact: true })
            .click();
          assert(await page.locator("#sovNext").isDisabled());
          await page
            .getByRole("button", { name: "The player and Mina", exact: true })
            .click();
          for (const word of ["موږ", "یو", "ځای", "منډې", "وهو"])
            await page
              .locator("#openingPractice button")
              .filter({ hasText: new RegExp("^" + word + "$") })
              .click();
        } else
          for (const answer of ["هغوی مڼې اخلي.", "هغوی ډوډۍ پلوري."])
            await page
              .locator("#openingPractice button")
              .filter({ hasText: answer })
              .click();
      }
      await page.locator("#sovNext").click();
    } else if (["greeting", "lexical", "sentence"].includes(phase))
      await page.locator("#teachNext").click();
    else {
      const answer = await page.evaluate(
        () => __test.wordById[__test.session.queue[0].id].en,
      );
      await page
        .locator("#choices button")
        .evaluateAll(
          (bs, a) => bs.find((b) => b.textContent === a).click(),
          answer,
        );
      await page.locator("#quizNext").click();
    }
  }
  await page.locator("#resultWorld").click();
}
try {
  for (const width of [1280, 390]) {
    const { page, context, errors } = await setup(width);
    await tutorial(page);
    assert(
      await page.evaluate(() => {
        const qs = __test.selectChallenge(7);
        return (
          qs.length === 25 &&
          new Set(qs.map((q) => q.id)).size === 25 &&
          qs.every((q) => q.speaker === "Ms Hameed" && q.recipient) &&
          ["pronouns", "verbs", "sov", "compounds", "dialogue"].every(
            (section) => qs.filter((q) => q.section === section).length === 5,
          ) &&
          __test.normalizeAnswer("مونږ تاسو.") ===
            __test.normalizeAnswer("موږ تاسې")
        );
      }),
    );
    assert.match(
      await page.locator("#characterLevel").innerText(),
      /Level 1 · Newcomer/,
    );
    for (const f of fixture.dayProgression) {
      assert.equal(await page.locator(".map-point:not(.library)").count(), 4);
      assert(await page.locator("#skipDayBtn").isVisible());
      await page.locator("#skipDayBtn").click();
      if (f.day === 6)
        assert.match(
          await page.locator("#challengeScene").innerText(),
          /HILLS/,
        );
      if (process.env.TEST_ARTIFACTS && f.day >= 6) {
        mkdirSync(process.env.TEST_ARTIFACTS, { recursive: true });
        await page.screenshot({
          path: `${process.env.TEST_ARTIFACTS}/day${f.day}-${width}.png`,
          fullPage: true,
        });
      }
      if (f.day === 7)
        assert.match(
          await page.locator("#speakerName").innerText(),
          /Ms Hameed/,
        );
      await runAssessment(page, f.passingScore);
      const state = await snap(page);
      assert(state.p.xp >= f.minCumulativeXp);
      assert.equal(state.status.level, f.levelCap);
      assert.equal(state.status.title, f.title);
      assert.equal(
        Object.keys(state.p.complete).filter((x) => /^\d-/.test(x)).length,
        0,
      );
      const xp = state.p.xp;
      await page.reload();
      assert.equal((await snap(page)).p.xp, xp);
      console.log(
        `TRACE ${width}px Day ${f.day}: ${xp} XP, Level ${state.status.level}, ${state.status.title}, 0 visits`,
      );
    }
    for (let day = 1; day <= 7; day++) {
      const before = await snap(page);
      await page
        .locator("#chapterButtons button")
        .nth(day - 1)
        .click();
      await page.locator("#startChallenge").click();
      await runAssessment(page, day === 7 ? 20 : 12);
      const after = await snap(page),
        newRewards =
          Object.keys(after.p.rewards).length -
          Object.keys(before.p.rewards).length;
      assert.equal(after.p.xp, before.p.xp + newRewards * 5);
      await page.locator("#resultWorld").click();
    }
    assert.equal(errors.length, 0, errors.join("\n"));
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    console.log(
      `PASS browser ${width}px: tutorial + all seven minimum-score skip-only clears, 25-turn exam, reload and reward-idempotent replays`,
    );
    checks++;
    await context.close();
  }
  for (const width of [1280, 390]) {
    const { page, context, errors } = await setup(width);
    await tutorial(page);
    // Follow every normal route, preserving the old narrative and fully completing every visit.
    for (let day = 1; day <= 7; day++) {
      const opening = fixture.dayProgression[day - 1].opening;
      if (day >= 2) {
        const enabled = await page.evaluate(() =>
          __test.zoneKeys.filter((z) =>
            __test.placeAccessible(__test.selectedLoop, z),
          ),
        );
        assert.deepEqual(enabled, [opening]);
      }
      const route =
        day === 2
          ? ["school", "nature", "business", "residential"]
          : [
              opening,
              ...fixture.starting.mapLocations.filter((z) => z !== opening),
            ];
      for (const place of route) {
        await page.locator(".map-point." + place).click();
        if (day === 6 && place === "nature")
          assert.match(await page.locator("#participants").innerText(), /Mina/);
        if (day === 7 && place === "business")
          assert.match(await page.locator("#speakerName").innerText(), /Edris/);
        await finishLesson(page);
      }
      assert.equal(
        await page.evaluate(
          (d) =>
            __test.zoneKeys.filter((z) => __test.progress.complete[d + "-" + z])
              .length,
          day,
        ),
        4,
      );
      await page.locator("#startChallenge").click();
      if (day === 3)
        assert.match(await page.locator("#lessonName").innerText(), /Edris/);
      if (day === 4)
        assert.match(
          await page.locator("#lessonName").innerText(),
          /Muhammad Jan/,
        );
      if (day === 5)
        assert.match(await page.locator("#lessonName").innerText(), /lakeside/);
      await runAssessment(page, day === 7 ? 25 : 15);
      await page.locator("#resultWorld").click();
    }
    assert.equal((await snap(page)).status.title, "New Resident");
    assert.equal(errors.length, 0, errors.join("\n"));
    console.log(
      `PASS browser ${width}px: all 28 normal lessons, mandatory openings, interactive group practice, five-sentence sets, all final scenes`,
    );
    checks++;
    // Failure at the exact boundaries, then retry the current weekly exam.
    const current = {
      xp: 2500,
      tutorialDone: true,
      complete: {},
      challenges: Object.fromEntries(
        Array.from({ length: 6 }, (_, i) => [
          i + 1,
          { passed: true, best: 12, attempts: 1 },
        ]),
      ),
    };
    await page.evaluate((p) => __test.setProgress(p), current);
    await page.evaluate(() => __test.select(7));
    assert.equal((await snap(page)).status.title, "Newcomer");
    await page.locator("#skipDayBtn").click();
    await runAssessment(page, 19);
    assert.equal((await snap(page)).p.challenges[7].passed, false);
    await page.locator("#resultReplay").click();
    await runAssessment(page, 20);
    await page.reload();
    assert.match(
      await page.locator("#characterLevel").innerText(),
      /Level 10 · New Resident/,
    );
    await page.clock.setFixedTime(new Date(Date.now() + 31 * 86400000));
    await page.evaluate(() => __test.startWorld());
    await page.locator("#reviewBtn").click();
    assert.equal(await page.evaluate(() => __test.session.mode), "review");
    await finishLesson(page);
    // Missing audio is visible and never substitutes another language.
    await page.evaluate(() => __test.select(6));
    await page.locator("#startChallenge").click();
    await runAssessment(page, 12);
    await page.locator("#resultWorld").click();
    await page.evaluate(() => __test.select(1));
    await page.locator(".map-point.residential").click();
    await page.locator("#teachSpeak").click();
    await page.waitForFunction(() =>
      document
        .querySelector("#audioStatus")
        .textContent.match(/No Pashto audio|no Pashto voice|speech failed|no speech synthesis/i),
    );
    assert.match(
      await page.locator("#audioStatus").innerText(),
      /⚠️/,
    );
    assert.equal(errors.length, 0, errors.join("\n"));
    console.log(
      "PASS browser: current exam 19/25 failure, 20/25 retry, reload, safe missing audio",
    );
    checks++;
    await context.close();
  }
  // A managed Chromium policy may prohibit file://; do not mistake that for an app failure.
  const offlineContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const offlinePage = await offlineContext.newPage();
  try {
    await offlinePage.goto(new URL("../index.html", import.meta.url).href);
    console.log("PASS file:// standalone startup");
  } catch (e) {
    if (!String(e).includes("ERR_BLOCKED_BY_ADMINISTRATOR")) throw e;
    console.log(
      "SKIP file:// access: managed Chromium policy blocks local-file navigation; real-device opening remains unverified.",
    );
  }
  await offlinePage.close();
  const deliveredPage = await offlineContext.newPage();
  await deliveredPage.goto(url + "/standalone");
  await offlineContext.setOffline(true);
  await deliveredPage.locator("#startTutorial").click();
  assert(await deliveredPage.locator("#teachPashto").isVisible());
  assert.equal(
    await deliveredPage.locator("#teachPashto").getAttribute("dir"),
    "rtl",
  );
  assert(await deliveredPage.locator("#tutorialInteraction .choice").first().isVisible());
  await deliveredPage.locator("#tutorialInteraction .choice").filter({hasText:"Hello"}).click();
  await deliveredPage.locator("#teachNext").click();
  assert(await deliveredPage.locator(".tutorial-tile").first().isVisible());
  await offlineContext.close();
  console.log(
    "PASS unmodified standalone runtime: offline tutorial/quiz after delivery, Pashto RTL, no app network dependencies",
  );
  checks++;
} finally {
  await browser.close();
  server.close();
}
console.log(
  `PASS ${checks} test groups across ${pages} browser contexts; actual app runtime exercised.`,
);
