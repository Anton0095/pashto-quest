import assert from "node:assert/strict";
import { setup, tutorial } from "./browser-fixture.mjs";
for (const width of [375, 1280]) {
  const b = await setup({ width, bridge: false });
  try {
    const p = b.page;
    await tutorial(p);
    await p.locator("#resultWorld").click();
    await p.locator('.map-point[data-place="residential"]').click();
    const known = new Map();
    let generated = 0;
    async function finishVisit() {
      let guard = 0;
      while (await p.locator("#lessonScreen").isVisible()) {
        if (++guard > 100) throw Error("Public controls stalled");
        if (await p.locator("#teachPanel").isVisible()) {
          const ps = await p.locator("#teachPashto").innerText(),
            en = await p.locator("#teachEnglish").innerText();
          known.set(ps, en);
          if (
            (await p.locator("#teachType").textContent()).toLowerCase() ===
            "generated sentence"
          )
            generated++;
          await p.locator("#teachNext").click();
        } else if (await p.locator("#grammarPanel").isVisible())
          await p.locator("#grammarNext").click();
        else {
          const build = await p.locator("#constructionPanel").isVisible(),
            prompt = await p.locator("#quizPashto").innerText();
          if (build) {
            const ps = [...known].find(([ps, en]) => en === prompt)?.[0];
            assert(ps, prompt);
            for (const word of ps.replace(/[.!؟،]/g, "").split(/\s+/))
              await p
                .locator("#wordTiles button:enabled")
                .getByText(word, { exact: true })
                .first()
                .click();
            await p.locator("#checkBuild").click();
          } else {
            const meaning = known.get(prompt);
            assert(meaning, prompt);
            await p
              .locator("#choices button")
              .getByText(meaning, { exact: true })
              .click();
          }
          await p.locator("#quizNext").click();
        }
      }
    }
    await finishVisit();
    assert(generated >= 2);
    const getXP = async () => {
      // Public UI and durable save must agree before comparing replay rewards.
      await p.waitForFunction(() => JSON.parse(localStorage.getItem("pashto-town-days-v1")).xp === Number(document.getElementById("xpPill").textContent.match(/\d+/)[0]));
      return p.evaluate(() => JSON.parse(localStorage.getItem("pashto-town-days-v1")).xp);
    };
    const xp = await getXP();
    await p.locator("#resultReplay").click();
    await finishVisit();
    assert.equal(await getXP(), xp, "Explicit replay cannot farm rewards");
    await p.locator("#navLibrary").click();
    await p.locator('[data-library-tab="grammar"]').click();
    assert(
      (await p.locator("#libraryBody").innerText()).includes("Grammar Journal"),
    );
    await p.locator('[data-library-tab="phrases"]').click();
    assert(
      (await p.locator("#libraryBody").innerText()).includes("How are you?"),
    );
    await p.locator('[data-library-tab="pace"]').click();
    assert((await p.locator("#libraryBody").innerText()).includes("24"));
    await p.locator("#libraryClose").click();
    assert.equal(await getXP(), xp);
    const overflow = await p.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2,
    );
    assert(!overflow, "Horizontal overflow");
    await p.reload();
    assert.equal(await getXP(), xp);
    assert.deepEqual(b.errors, []);
    console.log(
      "PASS independent public controls",
      width,
      "tutorial, actual Home study and construction, explicit replay/no XP farming, generated journal/phrase register/pace, reload and responsive layout",
    );
  } finally {
    await b.close();
  }
}
