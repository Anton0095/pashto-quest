import { readFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
import http from "node:http";
import vm from "node:vm";
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
const bank = JSON.parse(
  readFileSync(
    new URL("../content/WEEK2_RUNTIME.json", import.meta.url),
    "utf8",
  ),
);
const plan = JSON.parse(
  readFileSync(
    new URL("../content/WEEK2_LESSON_DATA.json", import.meta.url),
    "utf8",
  ),
);
const minimum = { 8: 4, 9: 5, 10: 6, 11: 6, 12: 7, 13: 8, 14: 12 };
const embedded = JSON.parse(html.match(/const WEEK2_DATA=(\{.*?\});/s)[1]);
assert.deepEqual(embedded, bank);
const data = JSON.parse(html.match(/const GAME_DATA\s*=\s*(\{.*?\});/s)[1]);
console.log(
  "PASS current canonical Week 1 content; independent curriculum contract checked separately",
);
assert.equal(bank.days.length, 7);
assert.equal(
  bank.days.flatMap((d) => d.lessons.flatMap((l) => l.cards)).length,
  140,
);
const ids = new Set();
for (const day of bank.days) {
  const spec = plan.days.find((d) => d.day === day.day);
  assert.equal(day.lessons.length, 4);
  assert.deepEqual(
    day.lessons.flatMap((l) => l.cards.map((c) => c.english)),
    Object.values(spec.locations).flat(),
  );
  for (const l of day.lessons) {
    assert.equal(l.cards.length, 5);
    for (const c of l.cards) {
      assert(!ids.has(c.id));
      ids.add(c.id);
      assert(
        c.pashto &&
          c.romanization &&
          c.speaker &&
          c.recipient &&
          c.review_refs.length,
      );
      assert.equal(c.status, "needs_native_review");
      assert(/[\u0600-\u06ff]/.test(c.pashto));
    }
  }
  assert(day.dialogues.length >= minimum[day.day]);
  for (const q of day.dialogues) {
    assert(!ids.has(q.id));
    ids.add(q.id);
    assert(q.promptPs.endsWith("؟"));
    assert(
      q.answerPs && q.answerEnglish && q.context && q.speaker && q.recipient,
    );
    assert.equal(q.nativeReviewed, false);
    assert.deepEqual(q.acceptedPs, []);
  }
}
const helpers = html.slice(
  html.indexOf("/* Only the display text changes."),
  html.indexOf("function buildTiles("),
);
const api = vm.runInNewContext(
  helpers +
    ";({getAnswerTiles,isDialogueAnswerCorrect,normalizePashtoResponse})",
);
for (const d of bank.days)
  for (const q of d.dialogues) {
    const t = api.getAnswerTiles(q.answerPs, q.duds);
    assert(t.filter((x) => x.dud).length >= 2);
    assert(
      api.isDialogueAnswerCorrect(
        q,
        " " + q.answerPs.replaceAll(" ", "  ") + " ",
      ),
    );
    assert(!api.isDialogueAnswerCorrect(q, q.duds.join(" ")));
  }
const repeated = api.getAnswerTiles("زه ورو ورو ځم.", ["ژر", "ځې"]);
assert.equal(repeated.filter((x) => x.word === "ورو").length, 2);
assert.equal(new Set(repeated.map((t) => t.index)).size, repeated.length);
assert(
  api.isDialogueAnswerCorrect(
    { answerPs: "زه اوبه څښم.", acceptedPs: ["اوبه څښم."] },
    "اوبه څښم",
  ),
);
assert(
  !api.isDialogueAnswerCorrect({ answerPs: "زه اوبه څښم." }, "زه کتاب څښم"),
);
console.log(
  "PASS content: 140 exact semantic targets, full draft Pashto/romanization, 48 contextual replies, distinct tiles and normalization",
);
const hook = `window.__test={get progress(){return progress},get session(){return session},wordById,zoneKeys,week2Days,selectChallenge,characterStatus,allowed,placeAccessible,getAnswerTiles,getDialogueTiles,buildTiles,answerChallenge,showChallengeQuestion,renderMixedPashto,save,setProgress(p){progress={...fresh(),...p,saveSchemaVersion:4,library:p.library||LibraryEngine.state()};save();hud();startWorld()},select(day){selectedLoop=day;startWorld()}};`;
const served = html.replace("// @TEST_HOOK", hook);
const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(served);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const graduate = () => ({
  saveSchemaVersion: 4,
  xp: 1800,
  tutorialDone: true,

  complete: {},
  challenges: Object.fromEntries(
    Array.from({ length: 7 }, (_, i) => [
      i + 1,
      {
        passed: true,
        best: i === 6 ? 20 : 12,
        attempts: 1,
      },
    ]),
  ),
});
const getP = (page) =>
  page.evaluate(() => JSON.parse(JSON.stringify(__test.progress)));
async function clickText(page, selector, text) {
  await page.locator(selector).evaluateAll((bs, text) => {
    const b = bs.find((b) => b.textContent === text && !b.disabled);
    if (!b) throw Error("Cannot select " + text);
    b.click();
  }, text);
}
async function answer(page, correct) {
  const info = await page.evaluate(() => {
    const s = __test.session,
      q = s.questions[s.index],
      w = __test.wordById[q.id],
      build = ["dialogue", "construct"].includes(q.kind);
    return {
      build,
      kind: q.kind,
      expected:
        q.kind === "dialogue"
          ? q.answerPs
          : q.correct || (q.direction === "ps-en" ? w.en : w.ps),
      tokens: build
        ? __test
            .buildTiles(w || null, q)
            .filter((t) => !t.dud)
            .map((t) => t.word)
        : null,
      duds: build
        ? __test
            .buildTiles(w || null, q)
            .filter((t) => t.dud)
            .map((t) => t.word)
        : [],
    };
  });
  if (info.build) {
    if (correct) {
      for (const token of info.tokens)
        await clickText(page, "#wordTiles button", token);
    } else if (info.duds.length)
      await clickText(page, "#wordTiles button", info.duds[0]);
    else
      for (const token of [...info.tokens].reverse())
        await clickText(page, "#wordTiles button", token);
    if (info.tokens.length >= 2 && correct) {
      assert(
        await page.locator("#builtSentence button").evaluateAll((bs) => {
          const a = bs[0].getBoundingClientRect(),
            b = bs[1].getBoundingClientRect();
          return (
            a.top < b.top || (Math.abs(a.top - b.top) < 2 && a.left > b.left)
          );
        }),
        "Pashto first word should be at the right",
      );
    }
    assert(await page.locator("#checkBuild").isEnabled());
    if (info.duds.length)
      assert(
        (await page.locator("#wordTiles button:not(:disabled)").count()) >= 2,
      );
    await page.locator("#checkBuild").click();
    assert.equal(
      await page.locator("#wordTiles button:not(:disabled)").count(),
      0,
    );
  } else {
    if (correct) await clickText(page, "#choices button", info.expected);
    else
      await page
        .locator("#choices button")
        .evaluateAll(
          (bs, expected) => bs.find((b) => b.textContent !== expected).click(),
          info.expected,
        );
  }
  const count = await page.evaluate(() => __test.session.correctCount);
  await page.evaluate(
    (expected) => __test.answerChallenge(expected),
    info.expected,
  );
  assert.equal(
    await page.evaluate(() => __test.session.correctCount),
    count,
    "Second submission changed score",
  );
}
async function assessment(page, score) {
  const n = await page.evaluate(() => __test.session.questions.length);
  for (let i = 0; i < n; i++) {
    assert.match(
      await page.locator("#quizCounter").innerText(),
      new RegExp(`${i + 1}/${n}`),
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    assert.match(await page.locator("#speakerName").innerText(), /speaking/);
    assert.match(await page.locator("#addressTarget").innerText(), /Player/);
    if (i === n - 1)
      assert.match(await page.locator("#quizNext").innerText(), /See results/);
    else
      assert(!/See results/.test(await page.locator("#quizNext").innerText()));
    if (
      await page.evaluate(
        () =>
          __test.session.questions[__test.session.index].kind === "dialogue",
      )
    ) {
      assert.equal(
        await page.locator("#quizPashto").getAttribute("dir"),
        "rtl",
      );
      assert(await page.locator("#quizSpeak").isHidden());
    }
    await answer(page, i < score);
    await page.locator("#quizNext").click();
  }
  assert.equal(
    await page.locator("#resultAccuracy").innerText(),
    `${score}/${n}`,
  );
}
async function lesson(page) {
  let guard = 0;
  while (await page.locator("#resultScreen").isHidden()) {
    if (++guard > 180) throw Error("Lesson did not finish");
    const phase = await page.evaluate(() => __test.session.phase);
    if (phase === "grammar") await page.locator("#sovNext").click();
    else if (["lexical", "sentence"].includes(phase))
      await page.locator("#teachNext").click();
    else {
      const expected = await page.evaluate(
        () => __test.wordById[__test.session.queue[0].id].en,
      );
      await clickText(page, "#choices button", expected);
      await page.locator("#quizNext").click();
    }
  }
  await page.locator("#resultWorld").click();
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
    const old = graduate();
    old.challenges[7].passed = false;
    old.challenges[7].best = 19;
    await page.evaluate((p) => __test.setProgress(p), old);
    assert.equal(await page.evaluate(() => __test.allowed(8)), false);
    await page.evaluate((p) => __test.setProgress(p), graduate());
    const week1 = await getP(page);
    assert.equal(await page.evaluate(() => __test.allowed(8)), true);
    await page.evaluate(() => __test.select(8));
    // Empty, Undo, Clear, removal and the starter response with unused duds.
    await page.locator("#skipDayBtn").click();
    assert(await page.locator("#checkBuild").isDisabled());
    await clickText(page, "#wordTiles button", "کتاب");
    await page.locator("#undoTile").click();
    assert(await page.locator("#checkBuild").isDisabled());
    await clickText(page, "#wordTiles button", "زه");
    await page.locator("#builtSentence button").click();
    assert(await page.locator("#checkBuild").isDisabled());
    await clickText(page, "#wordTiles button", "زه");
    await page.locator("#clearTiles").click();
    assert(await page.locator("#checkBuild").isDisabled());
    for (const token of ["زه", "کتاب", "څښم"])
      await clickText(page, "#wordTiles button", token);
    await page.locator("#checkBuild").click();
    assert.equal(await page.evaluate(() => __test.session.correctCount), 0);
    assert.equal(
      (await getP(page)).rewards["week2-dialogue:8:w2-d8-reply-1"],
      undefined,
    );
    await page.evaluate(() => __test.select(8));
    for (let day = 8; day <= 14; day++) {
      assert.equal(await page.locator(".map-point:not(.library)").count(), 4);
      assert(await page.locator("#skipDayBtn").isVisible());
      await page.locator("#skipDayBtn").click();
      assert(
        await page.evaluate(
          ({ day, minimum }) => {
            const q = __test.session.questions;
            return (
              q.filter((x) => x.kind === "dialogue").length >= minimum &&
              ["word", "sentence", "construct"].every((k) =>
                q.some((x) => x.kind === k),
              )
            );
          },
          { day, minimum: minimum[day] },
        ),
      );
      const spec = { count: day === 14 ? 25 : 15, pass: day === 14 ? 20 : 12 };
      await assessment(page, spec.pass - 1);
      assert.equal((await getP(page)).challenges[day].passed, false);
      assert.equal(
        await page.evaluate((d) => __test.allowed(d + 1), day),
        false,
      );
      await page.locator("#resultReplay").click();
      await assessment(page, spec.pass);
      const state = await getP(page);
      assert(state.challenges[day].passed);
      assert(Number.isFinite(state.xp));
      assert.deepEqual(state.challenges[7], week1.challenges[7]);
      assert.equal(state.challenges[7].best, 20);
      assert.equal(state.challenges[7].passed, true);

      assert.equal(
        Object.keys(state.complete).filter((id) => /^\d+-/.test(id)).length,
        0,
      );
      assert.deepEqual(
        await page.evaluate(() => ({
          level: __test.characterStatus(__test.progress).level,
          title: __test.characterStatus(__test.progress).title,
        })),
        { level: 10, title: "New Resident" },
      );
      if (process.env.TEST_ARTIFACTS) {
        mkdirSync(process.env.TEST_ARTIFACTS, { recursive: true });
        await page.screenshot({
          path: `${process.env.TEST_ARTIFACTS}/week2-day${day}-result-${width}.png`,
          fullPage: true,
        });
      }
      await page.reload();
      assert.equal((await getP(page)).xp, state.xp);
      if (day < 14) assert(await page.locator("#skipDayBtn").isVisible());
    }
    // Correct identical replies cannot be rewarded on replay; no first-pass bonus or Week 1 reset.
    await page.evaluate(() => __test.select(14));
    const before = await getP(page);
    await page.locator("#startChallenge").click();
    await assessment(page, 20);
    assert.equal((await getP(page)).xp, before.xp);
    assert.deepEqual((await getP(page)).challenges[7], before.challenges[7]);
    console.log(
      `PASS ${width}px: skip-only Days 8–14, minimum scores, 11/15 and 19/25 failures, title/XP safety, reload and replay`,
    );
    // All 28 normal-route lessons with the specified teacher first and arbitrary other visit order.
    await page.evaluate((p) => __test.setProgress(p), graduate());
    for (const spec of bank.days) {
      const day = spec.day;
      await page.evaluate((d) => __test.select(d), day);
      assert.deepEqual(
        await page.evaluate(
          (d) => __test.zoneKeys.filter((z) => __test.placeAccessible(d, z)),
          day,
        ),
        [spec.opening],
      );
      for (const place of [
        spec.opening,
        ...["school", "residential", "business", "nature"].filter(
          (z) => z !== spec.opening,
        ),
      ]) {
        await page.locator(".map-point." + place).click();
        if (place === spec.opening) {
          assert(await page.locator("#sovPanel").isVisible());
          assert.match(
            await page.locator("#speakerName").innerText(),
            new RegExp(spec.lessons.find((l) => l.location === place).teacher),
          );
        }
        await lesson(page);
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
      if (day === 14)
        assert.match(
          await page.locator("#speakerName").innerText(),
          /Ms Hameed/,
        );
      if (process.env.TEST_ARTIFACTS && [8, 13, 14].includes(day)) {
        await page.screenshot({
          path: `${process.env.TEST_ARTIFACTS}/week2-dialogue-day${day}-${width}.png`,
          fullPage: true,
        });
      }
      await assessment(page, day === 14 ? 25 : 15);
      await page.locator("#resultWorld").click();
    }
    assert.deepEqual((await getP(page)).challenges[7], week1.challenges[7]);
    assert((await getP(page)).library.acquired["lemma:n-door"]);
    // Mixed text stays text, with large isolated Pashto. Never create user/content HTML elements.
    await page.evaluate(() => {
      __test.renderMixedPashto(
        document.querySelector("#quizPrompt"),
        "Meaning of منډې وهل? <img src=x onerror=alert(1)>",
      );
    });
    assert.equal(await page.locator("#quizPrompt img").count(), 0);
    assert(await page.locator("#quizPrompt .inline-pashto").count());
    assert(
      (await page
        .locator("#quizPrompt .inline-pashto")
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))) >= 25,
    );
    await context.setOffline(true);
    await page.evaluate(() => __test.select(8));
    await page.locator("#startChallenge").click();
    await answer(page, true);
    assert.equal(await page.locator("#quizPashto").getAttribute("lang"), "ps");
    assert.equal(errors.length, 0, errors.join("\n"));
    await context.close();
    console.log(
      `PASS ${width}px: 28 normal lessons, named openings, 25-turn final, mixed-script safety, offline replies`,
    );
  }
} finally {
  await browser.close();
  server.close();
}
console.log(
  "PASS Week 2 application acceptance suite; native review and audio validation remain unperformed.",
);
