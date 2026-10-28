import assert from "node:assert/strict";
import { setup, tutorial, answerCurrent } from "./browser-fixture.mjs";
for (const width of [375, 1280]) {
  const b = await setup({ width });
  try {
    const p = b.page;
    await tutorial(p);
    await p.evaluate(() => __test.challenge.startChallenge(1));
    const qs = await p.evaluate(() => __test.state.session.questions);
    assert.equal(qs.length, 15);
    assert(
      !qs.some((q) => q.generated),
      "Skip may not construct from scheduled/unseen forms",
    );
    assert(qs.some((q) => q.adaptation));
    while (
      !(await p.evaluate(() => {
        const s = __test.state.session,
          q = s.questions[s.index];
        return q.kind === "word" && q.unstudied;
      }))
    ) {
      await answerCurrent(p);
      await p.locator("#quizNext").click();
    }
    const info = await p.evaluate(() => {
      const t = __test,
        q = t.state.session.questions[t.state.session.index];
      return { q, w: t.content.wordById[q.id], xp: t.state.progress.xp };
    });
    assert.equal(await p.locator("#quizPashto").innerText(), info.w.ps);
    assert.equal(
      await p.locator("#quizRoman").innerText(),
      info.w.roman + " · Not previously studied",
    );
    assert(
      !(await p
        .locator("#quizFeedback")
        .innerText()
        .then((t) => t.includes(info.w.en))),
    );
    await p.reload();
    assert.equal(
      await p.locator("#quizRoman").innerText(),
      info.w.roman + " · Not previously studied",
    );
    await answerCurrent(p);
    assert((await p.locator("#quizFeedback").innerText()).includes(info.w.en));
    assert.equal(
      await p.evaluate(() =>
        Object.values(__test.state.progress.library.acquired).reduce(
          (n, r) => n + r.introducedFormIds.length,
          0,
        ),
      ),
      0,
    );
    assert.deepEqual(b.errors, []);
    console.log(
      "PASS disclosure",
      width,
      "unseen words/phrases masked, generated-only skip deficit adaptation, first feedback reveals meaning, reload preserves direction, no form introductions",
    );
  } finally {
    await b.close();
  }
}
