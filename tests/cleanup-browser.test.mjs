import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { setup, tutorial } from "./browser-fixture.mjs";
const contract = JSON.parse(readFileSync("tests/world-contract.json", "utf8"));
const captures = [];
mkdirSync("docs/maintenance/cleanup", { recursive: true });
mkdirSync("work/cleanup", { recursive: true });
for (const width of [375, 1280]) {
  const b = await setup({ width });
  const p = b.page;
  try {
    const status = p.locator("#onboardingPaceFeedback");
    assert.match(await status.innerText(), /24\/day.*6 per teaching location/);
    assert.match(
      await p.locator("#onboardingPace").innerText(),
      /Default: 24\/day.*6 per teaching location/,
    );
    assert.equal(
      await p
        .locator('[data-onboarding-pace="24"]')
        .getAttribute("aria-pressed"),
      "true",
    );
    await p.screenshot({
      path: `docs/maintenance/cleanup/after-pace-${width}.png`,
      fullPage: true,
    });
    for (const target of [0, 4, 24]) {
      await p.locator(`[data-onboarding-pace="${target}"]`).click();
      assert.match(
        await status.innerText(),
        new RegExp(`${target}/day.*${target / 4} per teaching location`),
      );
      await p.reload();
      assert.match(
        await status.innerText(),
        new RegExp(`${target}/day.*${target / 4} per teaching location`),
      );
      assert.equal(
        await p
          .locator(`[data-onboarding-pace="${target}"]`)
          .getAttribute("aria-pressed"),
        "true",
      );
    }
    await p.locator("#navLibrary").click();
    const actual = await p.locator("#libraryPos option").evaluateAll((es) =>
      es
        .map((e) => e.value)
        .filter(Boolean)
        .sort(),
    );
    const expected = await p.evaluate(() =>
      [
        ...new Set(
          __test.content.LIBRARY_DATA.entries.map((e) => e.partOfSpeech),
        ),
      ].sort(),
    );
    assert.deepEqual(actual, expected);
    assert(!actual.includes("grammar"));
    assert(
      expected.includes("numeral") &&
        expected.includes("demonstrative") &&
        expected.includes("interrogative") &&
        expected.includes("adposition") &&
        expected.includes("conjunction"),
    );
    assert.equal(await p.locator('#libraryDay option[value="0"]').count(), 0);
    await p.keyboard.press("Escape");
    await p.waitForFunction(() => document.activeElement.id === "navLibrary");
    await p.locator("#navLibrary").click();
    await p.locator('[data-library-tab="pace"]').click();
    await p.locator('[data-pace="4"]').click();
    assert.match(
      await p.locator("#libraryPaceFeedback").innerText(),
      /Selected 4\/day, starting Day 1/,
    );
    await p.locator("#libraryClose").click();
    assert.match(await status.innerText(), /4\/day.*1 per teaching location/);
    p.once("dialog", (d) => d.accept());
    await p.locator("#resetProgress").click();
    assert.match(await status.innerText(), /24\/day.*6 per teaching location/);
    assert(
      await p
        .locator(".map-point:not(.library)")
        .evaluateAll((es) =>
          es.every((e) => e.disabled && !e.classList.contains("done")),
        ),
    );
    await tutorial(p);
    await p.locator("#resultWorld").click();
    assert(!/0\/0/.test(await p.locator("#placeCards").innerText()));
    await p.locator("#navLibrary").click();
    await p.locator('[data-library-tab="pace"]').click();
    await p.locator('[data-pace="4"]').click();
    assert.match(
      await p.locator("#libraryPaceFeedback").innerText(),
      /starting Day 2/,
    );
    assert.equal(
      await p.evaluate(
        () => __test.state.progress.library.plans[1].requestedDailyTarget,
      ),
      24,
    );
    await p.locator("#libraryClose").click();
    // The quiz's Speak button must stay attached to the current item after queue.shift().
    await p.locator('.map-point[data-place="residential"]').click();
    await p.evaluate(() => {
      const t = __test;
      let guard = 0;
      while (t.state.session.phase !== "quiz") {
        if (++guard > 60) throw Error("Home phases stalled");
        if (t.state.session.phase === "grammar") t.lessons.afterGrammar();
        else t.lessons.afterStudy();
      }
      const id = t.state.session.activeItem.id,
        w = t.content.wordById[id];
      window.__expectedSpoken = id;
      t.audio.speak = (id) => {
        window.__spoken = id;
      };
      t.lessons.answer(w.en);
    });
    await p.locator("#quizSpeak").click();
    assert(await p.evaluate(() => window.__spoken === window.__expectedSpoken));
    for (const [day, location] of [
      [6, "residential"],
      [7, "nature"],
      [10, "nature"],
    ]) {
      const old = contract.days[day - 1],
        lesson = old.lessons.find((x) => x.location === location);
      await p.evaluate(
        ({ day, location, opening }) => {
          const t = __test;
          t.reset();
          t.state.progress.tutorialDone = true;
          for (let prior = 1; prior < day; prior++)
            t.progression.completeChallengeOnce(
              t.state.progress,
              prior,
              prior === 7 ? 25 : 15,
            );
          t.state.day = day;
          t.state.progress.complete[day + "-" + opening] = true;
          t.lessons.begin(day + "-" + location);
        },
        { day, location, opening: old.opening },
      );
      assert.equal(
        await p.locator("#speakerName").innerText(),
        lesson.teacher + " · speaking",
      );
      assert(
        (await p.locator("#guideMessage").innerText()).startsWith(
          lesson.teacher + ": “",
        ),
      );
      assert(
        (await p.locator("#addressTarget").innerText()).includes(
          lesson.teacher + " → Player",
        ),
      );
      for (const person of lesson.participants)
        assert((await p.locator("#participants").innerText()).includes(person));
      if (day === 6)
        await p.screenshot({
          path: `docs/maintenance/cleanup/after-teacher-${width}.png`,
          fullPage: true,
        });
    }
    await p.evaluate(() => __test.challenge.startChallenge(7));
    const assessment = await p.evaluate(() => ({
      questions: __test.state.session.questions,
      caption: document.getElementById("lessonDescription").textContent,
    }));
    assert.match(assessment.caption, /25 turns.*20\/25 to pass/);
    const grammarCount = assessment.questions.filter(
      (q) => q.kind === "choice",
    ).length;
    assert(assessment.caption.includes(`${grammarCount} English grammar`));
    assert(
      !/5 pronouns|5 verb forms|5 SOV|5 compounds|5 dialogues/.test(
        assessment.caption,
      ),
    );
    assert.equal(
      await p.locator("#grammarSpeak,#sovDiagram,#dialectVariant").count(),
      0,
    );
    // A valid current learner may reach a later day with missed earlier workshops.
    // No grammar is unlocked by merely preparing plans or opening the map.
    await p.evaluate(() => {
      const t = __test;
      t.reset(0);
      t.state.progress.tutorialDone = true;
      for (let day = 1; day < 14; day++)
        t.progression.completeChallengeOnce(
          t.state.progress,
          day,
          day === 7 ? 25 : 15,
        );
      t.day(14);
      if (Object.keys(t.state.progress.library.grammar).length)
        throw Error("Map unlocked unseen grammar");
      const pool = t.learning.libraryLessonPool(14, "residential");
      if (pool.length) throw Error("Injected fallback into empty lesson");
      window.__emptyXP = t.state.progress.xp;
      t.lessons.begin("14-residential");
    });
    assert(await p.locator("#grammarPanel").isVisible());
    assert.equal(
      await p.locator("#grammarExplanation").evaluate((e) => e.tagName),
      "DIV",
    );
    const headings = await p
      .locator("#grammarExplanation h4")
      .allTextContents();
    assert.equal(headings.length, 14);
    assert.deepEqual(
      await p.evaluate(() =>
        Object.keys(__test.state.progress.library.grammar).sort(),
      ),
      Array.from({ length: 14 }, (_, i) => "grammar-day-" + (i + 1)).sort(),
    );
    assert.equal(
      await p
        .locator("#grammarExplanation")
        .evaluate((e) => e.querySelectorAll("p h4,p p").length),
      0,
    );
    await p.locator("#grammarNext").click();
    assert(await p.locator("#resultScreen").isVisible());
    assert.match(
      await p.locator("#resultDescription").innerText(),
      /no practice XP was awarded/,
    );
    assert(
      await p.evaluate(
        () =>
          __test.state.progress.xp === window.__emptyXP &&
          __test.state.progress.complete["14-residential"],
      ),
    );
    assert.equal(await p.locator("#resultXP").innerText(), "+0");
    const phraseIds = await p.evaluate(() =>
      Object.values(__test.state.progress.library.deliveries)
        .filter((d) => d.kind === "fixed_phrase")
        .map((d) => d.id),
    );
    assert.deepEqual(phraseIds, []);
    const overflow = await p.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 2,
    );
    assert(!overflow);
    captures.push({
      width,
      pos: actual,
      assessment: assessment.caption,
      grammarCatchUpHeadings: headings.length,
      emptyLessonXP: 0,
    });
    assert.deepEqual(b.errors, []);
    console.log(
      `PASS cleanup UI ${width}px: truthful 24/6 default, 0/4 persistence, canonical POS/day filters, frozen pace, moved teachers, actual assessment counts, active-item audio, visible grammar catch-up and zero-XP empty visits`,
    );
  } finally {
    await b.close();
  }
}
writeFileSync(
  "work/cleanup/after-ui.json",
  JSON.stringify(captures, null, 2) + "\n",
);
