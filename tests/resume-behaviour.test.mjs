// Public controls and persisted state only; no injected runtime or grading helpers.
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
const html = readFileSync("index.html", "utf8");
const words = JSON.parse(
  readFileSync("tests/curriculum-contract.json", "utf8"),
).words;
const lexicon = JSON.parse(
  readFileSync("content/LIBRARY_LEXICON.json", "utf8"),
);
const phrases = JSON.parse(
  readFileSync("content/NARRATIVE_EXPRESSIONS.json", "utf8"),
).expressions;
const byId = Object.fromEntries(words.map((w) => [w.id, w]));
for (const e of lexicon.entries)
  byId["library-card:" + e.lemmaId] = {
    ps: e.forms[0].pashto,
    en: e.englishSenses[0],
  };
for (const p of phrases.filter((p) => p.active))
  byId[p.id] = { ps: p.pashto, en: p.english };
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
  const saved = () =>
    page.evaluate(() =>
      JSON.parse(localStorage.getItem("pashto-town-days-v1")),
    );
  await page.locator('[data-onboarding-pace="4"]').click();
  await page.locator("#startTutorial").click();
  await page
    .locator("#tutorialInteraction")
    .getByRole("button", { name: "Hello", exact: true })
    .click();
  await page.locator("#teachNext").click();
  for (const word of ["څنګه", "یې؟"])
    await page.locator(`.tutorial-tile[data-word="${word}"]`).click();
  await page
    .getByRole("button", { name: "Check sentence", exact: true })
    .click();
  await page.locator("#teachNext").click();
  await page.locator('[data-gender="unspecified"]').click();
  await page.locator("#teachNext").click();
  await page.locator("#tutorialName").fill("Resume tester");
  await page.locator("#tutorialSaveName").click();
  await page.locator("#teachNext").click();
  await page.locator("#resultWorld").click();
  let testedPartial = false,
    testedLocked = false;
  for (let day = 1; day <= 14; day++) {
    assert(
      await page.locator("#skipDayBtn").isEnabled(),
      `Day ${day} immediate skip`,
    );
    await page.locator("#skipDayBtn").click();
    const count = day === 7 || day === 14 ? 25 : 15;
    assert.equal((await saved()).activeChallenge.questions.length, count);
    for (let i = 0; i < count; i++) {
      const before = await saved(),
        s = before.activeChallenge,
        q = s.questions[i],
        card = byId[q.id];
      assert.equal(s.index, i);
      assert.equal(s.locked, false);
      assert.equal(
        Object.keys(before.complete).length,
        0,
        "skipping never creates visits",
      );
      const expected =
        q.answerPs ||
        q.correct ||
        (q.direction === "ps-en" ? card.en : card.ps);
      if (q.kind === "construct" || q.kind === "dialogue") {
        const tokens = expected
          .replace(/[.!؟،\u200c]/g, " ")
          .trim()
          .split(/\s+/);
        await page
          .locator("#wordTiles button")
          .filter({ hasText: new RegExp("^" + tokens[0] + "$") })
          .first()
          .click();
        if (!testedPartial) {
          const partial = await saved();
          await page.reload();
          const restored = await saved();
          assert.deepEqual(
            restored.activeChallenge.built,
            partial.activeChallenge.built,
          );
          assert.equal(await page.locator("#builtSentence button").count(), 1);
          assert.equal(restored.xp, partial.xp);
          assert.deepEqual(restored.library.acquired, partial.library.acquired);
          // Pausing and resuming preserves the same attempt and placed tile.
          await page.locator("#navWorld").click();
          await page
            .getByRole("button", {
              name: `Resume paused Day ${day} challenge`,
              exact: true,
            })
            .click();
          assert.equal(
            (await saved()).activeChallenge.attemptId,
            partial.activeChallenge.attemptId,
          );
          assert.deepEqual(
            (await saved()).activeChallenge.built,
            partial.activeChallenge.built,
          );
          testedPartial = true;
        }
        for (const word of tokens.slice(1))
          await page
            .locator("#wordTiles button:enabled")
            .getByText(word, { exact: true })
            .first()
            .click();
        await page.locator("#checkBuild").click();
      } else if (day === 1 && i === 0) {
        await page
          .locator("#choices button")
          .filter({ hasNotText: expected })
          .first()
          .click();
      } else {
        const choices = page.locator("#choices button");
        if (q.kind === "address")
          await choices.filter({ hasText: expected + " ·" }).click();
        else await choices.getByText(expected, { exact: true }).click();
      }
      const answered = await saved();
      assert.equal(answered.activeChallenge.locked, true);
      assert.equal(answered.activeChallenge.answered, i + 1);
      assert.equal(
        answered.activeChallenge.correctCount,
        i + 1 - (day === 1 ? 1 : 0),
      );
      if (!testedLocked) {
        await page.reload();
        const restored = await saved();
        assert.equal(restored.xp, answered.xp);
        assert.equal(
          restored.activeChallenge.correctCount,
          answered.activeChallenge.correctCount,
        );
        assert.deepEqual(
          restored.library,
          answered.library,
          "locked restore must not practise again",
        );
        assert.equal(await page.locator("#choices button:enabled").count(), 0);
        assert(
          (await page.locator("#quizFeedback").innerText()).includes(expected),
        );
        testedLocked = true;
      }
      await page.locator("#quizNext").click();
    }
    const result = await saved();
    assert.equal(result.activeChallenge, undefined);
    assert.equal(result.challenges[day].best, count - (day === 1 ? 1 : 0));
    assert.equal(result.challenges[day].attempts, 1);
    assert(result.challenges[day].passed);
    assert.equal(Object.keys(result.complete).length, 0);
    await page.reload();
    assert.equal(
      (await saved()).challenges[day].best,
      result.challenges[day].best,
    );
    if (day === 7 || day === 14)
      assert.match(
        await page.locator("#characterLevel").innerText(),
        /Level 10.*New Resident/,
      );
    console.log(
      `PASS public Day ${day}: immediate skip, ${count} submissions, score, saved results, reload`,
    );
  }
  assert(testedPartial && testedLocked);
  // Boot the exact generated artifact with no network access after delivery.
  // Managed Chromium blocks file:// URLs, so keep a local origin for storage.
  const offline = await browser.newPage({
      viewport: { width: 375, height: 900 },
    }),
    requests = [];
  offline.on("pageerror", (e) => errors.push(e.message));
  offline.on("request", (r) => {
    if (!r.url().startsWith("file:")) requests.push(r.url());
  });
  await offline.goto(`http://127.0.0.1:${server.address().port}`);
  requests.length = 0;
  await offline.context().setOffline(true);
  await offline.setContent(html);
  await offline.locator("#startTutorial").click();
  await offline
    .locator("#tutorialInteraction")
    .getByRole("button", { name: "Hello", exact: true })
    .click();
  assert(await offline.locator("#teachNext").isEnabled());
  assert.deepEqual(
    requests,
    [],
    "offline release must not fetch runtime code or curriculum",
  );
  await offline.close();
  assert.deepEqual(errors, []);
  console.log(
    "PASS public partial tiles, pause/resume, locked feedback, no duplicate SRS/XP, fourteen-day skip progression",
  );
} finally {
  await browser.close();
  server.close();
}
