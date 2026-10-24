// Public UI only: no injected runtime bridge and no production progression/grading helpers.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
const html = readFileSync("index.html", "utf8"),
  server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "text/html;charset=utf-8");
    res.end(html);
  });
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
let savedCurrent;
try {
  for (const width of [1280, 375]) {
    const context = await browser.newContext({
        viewport: { width, height: 900 },
      }),
      page = await context.newPage(),
      meanings = new Map();
    const errors = [];
    page.on("pageerror", (e) => {
      errors.push(e.message);
      console.log("PAGEERROR", e.stack);
    });
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.locator('[data-onboarding-pace="4"]').click();
    await page.locator("#startTutorial").click();
    async function finish() {
      let steps = 0;
      while (await page.locator("#resultScreen").isHidden()) {
        assert(++steps < 250, "public lesson stalls");
        if (await page.locator("#teachPanel").isVisible()) {
          meanings.set(
            (await page.locator("#teachPashto").innerText()).trim(),
            await page.locator("#teachEnglish").innerText(),
          );
          await page.locator("#teachNext").click();
        } else if (await page.locator("#sovPanel").isVisible()) {
          await page.locator("#sovNext").click();
        } else {
          const text = (await page.locator("#quizPashto").innerText()).trim(),
            expected = meanings.get(text);
          assert(
            expected,
            "quiz asks content absent from displayed study cards: " + text,
          );
          await page
            .getByRole("button", { name: expected, exact: true })
            .click();
          await page.locator("#quizNext").click();
        }
      }
    }
    await finish();
    await page.locator("#resultWorld").click();
    const home = page
      .locator(".map-point")
      .filter({ has: page.locator("b", { hasText: "Home" }) });
    await home.click();
    await finish();
    await page.locator("#resultWorld").click();
    const storage = () =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("pashto-town-days-v1")),
      );
    let saved = await storage();
    assert.equal(
      Object.values(saved.library.plans[1].locationAssignments).flat().length,
      4,
    );
    assert(Object.keys(saved.library.acquired).length > 0);
    const before = saved.xp;
    await home.click();
    await finish();
    saved = await storage();
    assert.equal(saved.xp, before, "completed not-due replay must not farm XP");
    await page.reload();
    assert.equal((await storage()).xp, saved.xp);
    await page.locator("#navLibrary").click();
    assert.match(await page.locator("#libraryBody").innerText(), /encountered/);
    await page.keyboard.press("Escape");
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.clock.setFixedTime(new Date(Date.now() + 31 * 86400000));
    await page.reload();
    await page.locator("#reviewBtn").click();
    await finish();
    await page.locator("#resultWorld").click();
    await context.setOffline(true);
    await page.locator("#navLibrary").click();
    await page.locator("#libraryClose").click();
    savedCurrent = await storage();
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      "PASS independent public UI",
      width,
      "pace 4, study/quiz, acquisition, replay, reload, Library, RTL/mobile/offline",
    );
  }
  for (const incompatible of [
    JSON.stringify({ saveSchemaVersion: 3, xp: 999 }),
    JSON.stringify({ saveSchemaVersion: 4, xp: 0 }),
    "{broken",
    JSON.stringify({
      ...savedCurrent,
      challenges: { 7: { best: 19, passed: true, attempts: 1 } },
    }),
  ]) {
    const context = await browser.newContext(),
      page = await context.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.evaluate(
      (value) => localStorage.setItem("pashto-town-days-v1", value),
      incompatible,
    );
    await page.reload();
    assert(await page.locator("#saveCompatibility").isVisible());
    assert.equal(
      await page.evaluate(() => localStorage.getItem("pashto-town-days-v1")),
      incompatible,
    );
    await page
      .getByRole("button", {
        name: "Reset incompatible save and start",
        exact: true,
      })
      .click();
    await page.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem("pashto-town-days-v1"))
          .saveSchemaVersion === 4,
    );
    await page.reload();
    assert.equal(await page.locator("#saveCompatibility").count(), 0);
    await context.close();
  }
  console.log(
    "PASS independent incompatible/corrupt save preservation, explicit reset, and current-version reload",
  );
} finally {
  await browser.close();
  server.close();
}
