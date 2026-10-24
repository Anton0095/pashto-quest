import { readFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";
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
const data = JSON.parse(
  readFileSync(
    new URL("../content/LIBRARY_LEXICON.json", import.meta.url),
    "utf8",
  ),
);
const engine = readFileSync(
  new URL("../src/library-engine.js", import.meta.url),
  "utf8",
);
const bank = JSON.parse(
  readFileSync(
    new URL("../content/WEEK2_RUNTIME.json", import.meta.url),
    "utf8",
  ),
);
const game = JSON.parse(html.match(/const GAME_DATA\s*=\s*(\{.*?\});/s)[1]);
const helpers = readFileSync(
  new URL("../src/progression.js", import.meta.url),
  "utf8",
);
const api = vm.runInNewContext(
  engine +
    "\n" +
    helpers +
    ";({E:LibraryEngine,fresh,completeChallengeOnce,characterStatus,getChallengeSpec})",
  {
    LIBRARY_DATA: data,
    week2Days: Object.fromEntries(bank.days.map((d) => [d.day, d])),
  },
);
const plain = (x) => JSON.parse(JSON.stringify(x));
let groups = 0;
function check(name, fn) {
  fn();
  groups++;
  console.log("PASS", name);
}
const fresh = () => api.fresh();
const refs = (id) => data.sourceMappings[id];
check(
  "LIB-04/13/14: all seven pace allocations are distinct, even, stable and frozen",
  () => {
    for (const target of [0, 4, 8, 12, 16, 20, 24]) {
      const p = fresh(),
        allocationData = { ...data, storyRequirements: {} };
      assert(api.E.setPace(p, allocationData, target, 1).ok);
      const plan = api.E.ensurePlan(p, allocationData, 1);
      for (const ids of Object.values(plan.locationAssignments))
        assert.equal(ids.length, target / 4);
      assert.equal(
        new Set(Object.values(plan.locationAssignments).flat()).size,
        target,
      );
      assert.deepEqual(plain(api.E.ensurePlan(plain(p), data, 1)), plain(plan));
      const previous = plain(plan);
      api.E.setPace(p, data, 8, 1);
      assert.deepEqual(plain(p.library.plans[1]), previous);
      assert.equal(Object.keys(p.library.acquired).length, 0);
    }
  },
);
check(
  "LIB-05/24: actual content shortage is explicit; no fabricated 140/280-word claim",
  () => {
    const p = fresh(),
      all = new Set();
    let gaps = 0;
    for (let day = 1; day <= 14; day++) {
      const plan = api.E.ensurePlan(p, data, day);
      for (const id of Object.values(plan.locationAssignments).flat()) {
        assert(!all.has(id));
        all.add(id);
      }
      if (plan.contentGap) {
        gaps++;
        assert.equal(plan.effectiveDailyTarget, null);
      } else
        assert.equal(
          Object.values(plan.locationAssignments).flat().length,
          day === 14 ? 0 : 20,
        );
    }
    assert(gaps > 0);
    assert(
      all.size <= data.entries.filter((e) => e.countsTowardDailyQuota).length,
    );
    assert(data.entries.every((e) => e.reviewStatus === "needsReview"));
    assert.equal(api.E.supported(p, data, 15).length, 0);
  },
);
check(
  "LIB-06/07/15/16: explicit lemma families, hidden forms, actual attempts and spaced mastery",
  () => {
    const p = fresh(),
      verb = data.entries.find((e) => e.lemmaId === "lemma:v-see"),
      forms = verb.forms
        .filter((f) => f.morphology.tense === "present")
        .slice(0, 3);
    assert.equal(forms.length, 3);
    for (const f of forms)
      api.E.encounter(
        p,
        data,
        { lemmaId: verb.lemmaId, formId: f.formId },
        { day: 3, source: "lesson", location: "nature" },
      );
    assert.equal(api.E.summary(p, data).encountered, 1);
    assert.equal(api.E.status(p.library.acquired[verb.lemmaId]), "introduced");
    const sample = {
      ...data,
      sourceMappings: {
        exercise: forms.map((f) => ({
          lemmaId: verb.lemmaId,
          formId: f.formId,
        })),
      },
    };
    for (let i = 0; i < 3; i++) {
      const context = {
        day: 3 + i,
        source: "review",
        location: "library",
        eventId: "attempt:" + i,
        now: 100000000 + i * 10 * 86400000,
      };
      assert(api.E.practise(p, sample, "exercise", true, context));
      assert.equal(api.E.practise(p, sample, "exercise", true, context), false);
    }
    assert.equal(api.E.status(p.library.acquired[verb.lemmaId]), "mastered");
    assert.equal(api.E.summary(p, data).mastered, 1);
    for (const id of ["n-book", "n-books"])
      api.E.expose(p, data, id, {
        day: 7,
        source: "lesson",
        location: "school",
      });
    assert.equal(api.E.summary(p, data).encountered, 2);
    assert.equal(
      p.library.acquired["lemma:n-book"].encounteredFormIds.length,
      2,
    );
    const extra = verb.forms.find(
      (f) => !forms.some((x) => x.formId === f.formId),
    );
    api.E.encounter(
      p,
      data,
      { lemmaId: verb.lemmaId, formId: extra.formId },
      { day: 6, source: "lesson", location: "nature" },
    );
    assert.notEqual(api.E.status(p.library.acquired[verb.lemmaId]), "mastered");
    assert.equal(refs("a-clean")[0].lemmaId, "lemma:a-clean");
    assert.equal(
      new Set(data.entries.map((e) => e.lemmaId)).size,
      data.entries.length,
    );
  },
);
check("Home award is atomic and replay-safe in current schema", () => {
  const p = fresh();
  api.completeChallengeOnce(p, 1, 11);
  assert(!p.homeGranted);
  api.completeChallengeOnce(p, 1, 12);
  assert(p.homeGranted);
  assert.equal(p.xp, 200);
  api.completeChallengeOnce(p, 1, 15);
  assert.equal(p.xp, 200);
});
check(
  "Day 1 contextual targets: five existing authored sentences per location",
  () => {
    const known = new Set(
      game.words.filter((w) => w.type === "sentence").map((w) => w.id),
    );
    for (const ids of Object.values(data.lessonSentenceTargets[1])) {
      assert.equal(ids.length, 5);
      assert.equal(new Set(ids).size, 5);
      for (const id of ids) assert(known.has(id));
    }
  },
);
check("LIB-17: grammar unlock follows exposure, not schedule or pass", () => {
  const p = fresh();
  api.E.ensurePlan(p, data, 3);
  assert.equal(Object.keys(p.library.grammar).length, 0);
  api.E.unlock(p, 3, "lesson");
  assert(p.library.grammar["grammar-day-3"]);
  assert(!p.library.grammar["grammar-day-4"]);
});
const hook = `window.__libraryTest={get progress(){return progress},get session(){return session},get selectedLoop(){return selectedLoop},E:LibraryEngine,data:LIBRARY_DATA,entries:libraryEntries,words,wordById,zoneKeys,begin,startWorld,openLibrary,closeLibrary,afterStudy,afterGrammar,answer,nextQuestion,answerChallenge,showChallengeQuestion,buildTiles,save,getChallengeSpec,setProgress(p){progress={...fresh(),...p,saveSchemaVersion:4,library:p.library||LibraryEngine.state()};session=null;save();hud();startWorld()},select(day){selectedLoop=day;startWorld()},startChallenge};`;
const served = html.replace("// @TEST_HOOK", hook);
const server = http.createServer((req, res) => {
  if (req.url.startsWith("/audio/")) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(served);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const getP = (page) =>
  page.evaluate(() => JSON.parse(JSON.stringify(__libraryTest.progress)));
async function tutorial(page) {
  await page.locator("#startTutorial").click();
  assert.match(await page.locator("#lessonName").innerText(), /Library/);
  for (let i = 0; i < 4; i++) await page.locator("#teachNext").click();
  await page.evaluate(() => {
    const t = __libraryTest;
    while (t.session.queue.length) {
      t.answer(t.wordById[t.session.queue[0].id].en);
      t.nextQuestion();
    }
  });
  await page.locator("#resultWorld").click();
}
async function finishLesson(page) {
  await page.evaluate(() => {
    const t = __libraryTest;
    let n = 0;
    while (
      t.session &&
      !document.querySelector("#lessonScreen").classList.contains("hidden")
    ) {
      if (++n > 350) throw Error("Lesson stalled");
      const s = t.session;
      if (["lexical", "sentence"].includes(s.phase)) t.afterStudy();
      else if (s.phase === "grammar") {
        if (document.querySelector("#sovNext").disabled)
          throw Error("Unexpected interactive opening");
        t.afterGrammar();
      } else if (s.queue.length) {
        t.answer(t.wordById[s.queue[0].id].en);
        t.nextQuestion();
      } else t.nextQuestion();
    }
  });
}
async function assessment(page, score) {
  await page.evaluate((score) => {
    const t = __libraryTest,
      n = t.session.questions.length;
    for (let i = t.session.index; i < n; i++) {
      const q = t.session.questions[t.session.index],
        w = t.wordById[q.id];
      let a =
        q.answerPs ||
        q.correct ||
        (q.kind === "construct" ? w.ps : q.direction === "ps-en" ? w.en : w.ps);
      if (i >= score) a = "Incorrect answer";
      t.answerChallenge(a);
      t.nextQuestion();
    }
  }, score);
}
try {
  for (const width of [1280, 375]) {
    const context = await browser.newContext({
        viewport: { width, height: 900 },
      }),
      page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    assert.equal(await page.locator(".map-point:visible").count(), 5);
    assert.equal(await page.locator(".map-point:not(.library)").count(), 4);
    assert(await page.locator("#skipDayBtn").isHidden());
    const before = await getP(page);
    await page.locator("#navLibrary").click();
    assert.match(
      await page.locator("#libraryBody").innerText(),
      /bank is empty/,
    );
    await page.locator('[data-library-tab="grammar"]').click();
    assert.equal(await page.locator("#libraryBody details").count(), 14);
    assert.equal(await page.locator('#libraryBody [lang="ps"]').count(), 0);
    await page.keyboard.press("Escape");
    assert.deepEqual(await getP(page), before);
    for (const target of [0, 4, 8, 12, 16, 20, 24]) {
      await page.locator(`[data-onboarding-pace="${target}"]`).click();
      const selected = await getP(page);
      assert.equal(selected.library.requestedDailyTarget, target);
      assert(!selected.library.plans[1]);
    }
    assert(await page.locator('[data-onboarding-pace="8"]').isEnabled());
    await page.locator('[data-onboarding-pace="20"]').click();
    assert.equal((await getP(page)).library.requestedDailyTarget, 20);
    await tutorial(page);
    assert(await page.locator("#skipDayBtn").isVisible());
    assert.equal(Object.keys((await getP(page)).library.acquired).length, 0);
    assert.equal(Object.keys((await getP(page)).library.phrases).length, 4);
    assert.match(
      await page.locator(".map-point.residential b").innerText(),
      /Muhammad Jan/,
    );
    // Partial route: actual exposures only, with no phantom visits/acquisition for scheduled locations.
    await page.locator(".map-point.business").click();
    await finishLesson(page);
    let partial = await getP(page);
    assert(partial.complete["1-business"]);
    assert(!partial.complete["1-residential"]);
    const assignments = partial.library.plans[1].locationAssignments;
    assert.equal(assignments.business.length, 5);
    for (const id of assignments.business) assert(partial.library.acquired[id]);
    assert(assignments.residential.some((id) => !partial.library.acquired[id]));
    await page.locator("#resultWorld").click();
    await page.locator("#navLibrary").click();
    const unchanged = await getP(page);
    await page
      .locator("#libraryEntries details")
      .first()
      .locator("summary")
      .click();
    assert.deepEqual(await getP(page), unchanged);
    await page.locator('[data-library-tab="pace"]').click();
    const supportedPace = page
      .locator("#libraryBody button[data-pace]:not(:disabled)")
      .first();
    if (await supportedPace.count()) {
      await supportedPace.click();
      assert.match(
        await page.locator("#libraryPaceFeedback").innerText(),
        /Day 2/,
      );
    } else
      assert.match(
        await page.locator("#libraryBody").innerText(),
        /No complete quota/,
      );
    assert.deepEqual(
      (await getP(page)).library.plans[1],
      partial.library.plans[1],
    );
    await page.locator("#libraryClose").click();
    await page.locator("#skipDayBtn").click();
    assert.match(await page.locator("#challengeScene").innerText(), /LIBRARY/);
    await assessment(page, 11);
    assert(!(await getP(page)).homeGranted);
    await page.locator("#resultReplay").click();
    // Submit one answer, reload, inspect Library, resume without score/reward duplication.
    await page.evaluate(() => {
      const t = __libraryTest,
        q = t.session.questions[0],
        w = t.wordById[q.id];
      t.answerChallenge(
        q.correct ||
          (q.kind === "construct"
            ? w.ps
            : q.direction === "ps-en"
              ? w.en
              : w.ps),
      );
    });
    const mid = await getP(page);
    const answerCount = await page.evaluate(
      () => __libraryTest.session.answered,
    );
    await page.reload();
    assert.equal(
      await page.evaluate(() => __libraryTest.session.answered),
      answerCount,
    );
    assert.equal((await getP(page)).xp, mid.xp);
    await page.locator("#navLibrary").click();
    await page.locator("#libraryClose").click();
    assert.equal(
      await page.evaluate(() => __libraryTest.session.answered),
      answerCount,
    );
    await page.locator("#quizNext").click();
    await assessment(page, 12);
    assert((await getP(page)).homeGranted);
    assert.match(
      await page.locator("#resultDescription").innerText(),
      /key to your own home/,
    );
    const awarded = await getP(page);
    await page.locator("#resultReplay").click();
    await assessment(page, 12);
    assert.equal((await getP(page)).xp, awarded.xp);
    await page.locator("#resultWorld").click();
    assert.match(
      await page.locator(".map-point.residential b").innerText(),
      /Your Home/,
    );
    // An unsubmitted construction and a paused attempt also survive reload and map navigation.
    await page.evaluate(() => {
      const t = __libraryTest;
      t.startChallenge(1);
      const index = t.session.questions.findIndex(
        (q) => q.kind === "construct",
      );
      t.session.index = index;
      t.showChallengeQuestion();
    });
    await page.locator("#wordTiles button").first().click();
    const pending = await page.evaluate(() => ({
      index: __libraryTest.session.index,
      built: [...__libraryTest.session.built],
      xp: __libraryTest.progress.xp,
    }));
    await page.reload();
    assert.equal(
      await page.evaluate(() => __libraryTest.session.index),
      pending.index,
    );
    assert.deepEqual(
      await page.evaluate(() => __libraryTest.session.built),
      pending.built,
    );
    assert.equal((await getP(page)).xp, pending.xp);
    await page.locator("#navWorld").click();
    await page
      .getByRole("button", { name: "Resume paused Day 1 challenge" })
      .click();
    assert.deepEqual(
      await page.evaluate(() => __libraryTest.session.built),
      pending.built,
    );
    await page.evaluate(() => {
      const t = __libraryTest;
      t.session.finished = true;
      delete t.progress.activeChallenge;
      t.save();
      t.startWorld();
    });
    // All requested Day 1 assignments are introduced on the normal route, without altering stories.
    for (const target of [0, 4, 8, 12, 16, 20, 24]) {
      await page.evaluate((target) => {
        const t = __libraryTest,
          p = { tutorialDone: true, library: t.E.state() };
        p.library.requestedDailyTarget = target;
        t.setProgress(p);
        t.select(1);
      }, target);
      for (const place of ["residential", "business", "nature", "school"]) {
        await page.locator(".map-point." + place).click();
        await finishLesson(page);
        await page.locator("#resultWorld").click();
      }
      const p = await getP(page),
        plan = p.library.plans[1];
      assert.equal(plan.effectiveDailyTarget, target);
      for (const ids of Object.values(plan.locationAssignments)) {
        assert.equal(ids.length, target / 4);
        for (const id of ids) assert(p.library.acquired[id]);
      }
      assert.equal(
        api.E.tallies(p, data, 1).actuallyEncounteredScheduledLemmas.length,
        target,
      );
      assert.equal(
        Object.keys(p.complete).filter((k) => /^1-/.test(k)).length,
        4,
      );
      assert(!p.complete["1-library"]);
      await page.evaluate(() => __libraryTest.startChallenge(1));
      assert(
        await page.evaluate(() =>
          __libraryTest.session.questions
            .filter((q) => q.kind === "word")
            .every((q) =>
              ["encountered", "due-review"].includes(q.vocabularyOrigin),
            ),
        ),
      );
      await assessment(page, 12);
      await page.locator("#resultWorld").click();
    }
    await page.locator("#navLibrary").click();
    await page.locator("#librarySearch").fill("book");
    const entries = await page.locator("#libraryEntries").innerText();
    assert(/book/i.test(entries));
    await page.locator("#librarySearch").fill("no-such-entry");
    assert.match(
      await page.locator("#libraryEntries").innerText(),
      /No entries match/,
    );
    await page.locator("#librarySearch").fill("");
    const detail = page.locator("#libraryEntries details").first();
    await detail.locator("summary").click();
    const pronunciation = detail
      .getByRole("button", {
        name: "Pronunciation (if available)",
        exact: true,
      })
      .first();
    if (await pronunciation.count()) {
      await pronunciation.click();
      await page.waitForFunction(() =>
        document
          .querySelector("#libraryAudioStatus")
          .textContent.includes("No Pashto audio available"),
      );
    }
    const lemma = await detail.getAttribute("data-lemma");
    const beforePractice = await getP(page);
    await detail
      .getByRole("button", { name: "Practise an encountered form" })
      .click();
    const gloss = await page.evaluate((id) => {
      const t = __libraryTest,
        e = t.entries[id],
        r = t.progress.library.acquired[id];
      return e.forms.find((f) => r.encounteredFormIds.includes(f.formId))
        .englishGloss;
    }, lemma);
    await detail.getByRole("button", { name: gloss, exact: true }).click();
    assert.equal((await getP(page)).xp, beforePractice.xp);
    assert.equal(
      (await getP(page)).library.acquired[lemma].totalAttempts,
      beforePractice.library.acquired[lemma].totalAttempts + 1,
    );
    await page.locator("#libraryClose").click();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.locator("#navLibrary").focus();
    await page.keyboard.press("Enter");
    assert(await page.locator("#libraryDialog").isVisible());
    await page.keyboard.press("Escape");
    assert.equal(
      await page
        .locator("#navLibrary")
        .evaluate((e) => e === document.activeElement),
      true,
    );
    await context.setOffline(true);
    await page.locator("#navLibrary").click();
    await page.locator('[data-library-tab="grammar"]').click();
    assert(await page.locator("#libraryBody details").count());
    await page.locator("#libraryClose").click();
    if (process.env.TEST_ARTIFACTS) {
      mkdirSync(process.env.TEST_ARTIFACTS, { recursive: true });
      await page.locator("#navLibrary").click();
      await page.screenshot({
        path: `${process.env.TEST_ARTIFACTS}/library-${width}.png`,
        fullPage: true,
      });
      await page.locator("#libraryClose").click();
    }
    // Content exhaustion must not loop between an empty lexical phase and the opening grammar.
    await page.evaluate(() => {
      const t = __libraryTest,
        p = {
          tutorialDone: true,
          xp: 1800,

          challenges: Object.fromEntries(
            Array.from({ length: 12 }, (_, i) => [
              i + 1,
              {
                passed: true,
                best: i === 6 ? 20 : 12,
                attempts: 1,
              },
            ]),
          ),

          library: t.E.state(),
        };
      p.library.plans[1] = {
        day: 1,
        locationAssignments: {
          residential: t.data.entries
            .filter((e) => e.countsTowardDailyQuota)
            .map((e) => e.lemmaId),
        },
        planVersion: 1,
      };
      t.setProgress(p);
      t.select(13);
      t.begin("13-nature");
    });
    await finishLesson(page);
    assert((await getP(page)).complete["13-nature"]);
    assert((await getP(page)).library.plans[13].contentGap);
    for (const target of [0, 4, 8, 12, 16, 20, 24]) {
      await page.evaluate((target) => {
        const t = __libraryTest,
          p = { tutorialDone: true, library: t.E.state() };
        p.library.requestedDailyTarget = target;
        t.setProgress(p);
        t.select(1);
        t.startChallenge(1);
      }, target);
      await assessment(page, 12);
      const skipped = await getP(page);
      assert(skipped.homeGranted);
      assert.equal(
        Object.keys(skipped.complete).filter((id) => /^1-/.test(id)).length,
        0,
      );
      assert.equal(skipped.library.plans[1].effectiveDailyTarget, target);
      assert.equal(skipped.challenges[1].best, 12);
    }
    assert.equal(errors.length, 0, errors.join("\n"));
    await context.close();
    groups++;
    console.log(
      `PASS LIB browser ${width}px: fresh map, pace, phrases, partial visits, home failure/retry/replay, challenge reload, all seven normal-day paces and honest content gaps, reference without rewards, search, keyboard and offline`,
    );
  }
} finally {
  await browser.close();
  server.close();
}
console.log(
  `PASS ${groups} Library test groups. Full 140/280 content quota and native Laghman/iPhone review remain unavailable; content gaps are explicit.`,
);
