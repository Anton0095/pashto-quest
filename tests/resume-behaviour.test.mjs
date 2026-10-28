import assert from "node:assert/strict";
import { setup, tutorial, answerCurrent } from "./browser-fixture.mjs";
const b = await setup({ offline: true });
try {
  const p = b.page;
  await tutorial(p);
  await p.evaluate(() => __test.lessons.begin("1-residential"));
  await p.evaluate(() => {
    const t = __test;
    let guard = 0;
    while (
      !document.querySelector("#lessonScreen").classList.contains("hidden")
    ) {
      if (++guard > 120) throw Error("Home stalled");
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
    t.challenge.startChallenge(1);
  });
  while (
    (await p.evaluate(
      () => __test.state.session.questions[__test.state.session.index].kind,
    )) !== "construct"
  ) {
    await answerCurrent(p);
    await p.locator("#quizNext").click();
  }
  const token = await p.locator("#wordTiles button").first().innerText();
  await p
    .locator("#wordTiles button")
    .getByText(token, { exact: true })
    .first()
    .click();
  const snapshot = await p.evaluate(() => ({
    s: __test.state.session,
    xp: __test.state.progress.xp,
    p: __test.state.progress.library,
  }));
  await p.reload();
  assert.deepEqual(await p.evaluate(() => __test.state.session), snapshot.s);
  assert.equal(await p.evaluate(() => __test.state.progress.xp), snapshot.xp);
  // Complete the saved indexed puzzle through the visible controls.
  await p.locator("#clearTiles").click();
  await answerCurrent(p);
  const locked = await p.evaluate(() => ({
    s: __test.state.session,
    xp: __test.state.progress.xp,
    events: __test.state.progress.library.events,
  }));
  await p.reload();
  assert.deepEqual(await p.evaluate(() => __test.state.session), locked.s);
  assert.equal(await p.evaluate(() => __test.state.progress.xp), locked.xp);
  assert.deepEqual(
    await p.evaluate(() => __test.state.progress.library.events),
    locked.events,
  );
  const frozen = await p.evaluate(() => __test.state.session.questions);
  await p.evaluate(() => __test.challenge.startChallenge(1));
  assert.deepEqual(
    await p.evaluate(() => __test.state.session.questions),
    frozen,
  );
  // Corrupt slots without changing text: reject the stored attempt instead of repairing it.
  await p.evaluate(() => {
    const key = "pashto-town-days-v1",
      v = JSON.parse(localStorage.getItem(key));
    const q = v.activeChallenge.questions.find((q) => q.generated);
    const slot = Object.keys(q.generated.generated.slots)[0];
    q.generated.generated.slots[slot].formId += ":wrong";
    localStorage.setItem(key, JSON.stringify(v));
  });
  const raw = await p.evaluate(() =>
    localStorage.getItem("pashto-town-days-v1"),
  );
  await p.reload();
  assert(await p.locator("#saveCompatibility").isVisible());
  assert.equal(
    await p.evaluate(() => localStorage.getItem("pashto-town-days-v1")),
    raw,
  );
  assert.deepEqual(b.errors, []);
  console.log(
    "PASS offline generated assessment: partial/locked tiles, exact question/context/choice/provenance restore, retry stability, no duplicate XP/SRS, corrupt proof preserved until explicit reset",
  );
} finally {
  await b.close();
}
