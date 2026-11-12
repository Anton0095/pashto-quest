import { readFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import http from "node:http";
export const displayCharacterText=value=>String(value??'');
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({
    chromium,
  } = require("/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"));
}
export const hook = `window.__test={names:{text:value=>String(value??'')},state,audio,content,progression,learning,questions,lessons,challenge,grammar,storage,world,library,E:LibraryEngine,S:SentenceEngine,Q:QuestionEngine,nextQuestion,reset(pace=24){state.progress=progression.fresh();state.progress.library.requestedDailyTarget=pace;state.session=null;state.day=1;storage.resetProblem();storage.save();ui.view('introScreen')},day(day){state.day=day;world.startWorld()}};`;
export async function setup({
  width = 375,
  mobile = false,
  rpg = false,
  bridge = true,
  offline = false,
  htmlPath = "index.html",
  transform = (html) => html,
} = {}) {
  mkdirSync("work", { recursive: true });
  let html = transform(readFileSync(htmlPath, "utf8").replace("const RPG_ENABLED=true;", `const RPG_ENABLED=${rpg};`)).replace(
    "// @TEST_HOOK",
    bridge ? hook : "",
  );
  if(!rpg) html=html.replace('  const world = createWorld({',
    readFileSync(new URL('./fixtures/education-navigation.js',import.meta.url),'utf8')+'\n  const world = createEducationalNavigation({');
  const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "text/html;charset=utf-8");
    res.end(html);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({ viewport: { width, height: 1000 }, ...(mobile?{isMobile:true,hasTouch:true,deviceScaleFactor:3}:{}) }),
    errors = [], errorStacks = [];
  page.on("pageerror", (e) => {errors.push(e.message);errorStacks.push(e.stack);});
  const url = "http://127.0.0.1:" + server.address().port;
  if (offline) {
    await page.route("**/*", (route) =>
      route.request().isNavigationRequest()
        ? route.fulfill({ status: 200, contentType: "text/html", body: html })
        : route.abort(),
    );
  }
  await page.goto(url);
  return {
    page,
    browser,
    server,
    errors,
    errorStacks,
    url,
    async close() {
      await browser.close();
      await new Promise((r) => server.close(r));
    },
  };
}
export async function tutorial(page) {
  await page.locator("#startTutorial").click();
  await page
    .locator("#tutorialInteraction button")
    .getByText("Hello", { exact: true })
    .click();
  await page.locator("#teachNext").click();
  for (const text of ["How are you?"])
    await page
      .locator("#tutorialInteraction button")
      .getByText(text, { exact: true })
      .click();
  await page.locator("#teachNext").click();
  await page
    .locator("#tutorialInteraction button")
    .getByText("پښتو", { exact: true })
    .click();
  await page.locator("#teachNext").click();
  await page.locator("#tutorialName").fill("Muhammad Jan");
  await page.locator("#tutorialSaveName").click();
  await page.locator("#teachNext").click();
}
export async function answerCurrent(page) {
  const q = await page.evaluate(() => {
    const t = __test,
      s = t.state.session,
      q = s.mode === "challenge" ? s.questions[s.index] : s.activeItem,
      w = t.content.wordById[q.id];
    return {
      kind: q.kind,
      answerFormat:q.answerFormat,
      mode:s.mode,
      unstudied: q.unstudied,
      recognition: q.recognition,
      answer:
        q.answerPs ||
        q.correct ||
        (q.kind === "construct" ? w.ps : q.direction === "en-ps" ? w.ps : w.en),
    };
  });
  if (q.answerFormat === "type" || (!q.answerFormat && q.unstudied && !q.recognition)) {
    await page.locator(q.mode === "challenge" ? "#unseenRecall" : "#lessonRecall").fill(displayCharacterText(q.answer));
    await page.getByRole("button", {name:/^Submit (meaning|answer)$/,exact:true}).click();
  } else if (["construct", "dialogue"].includes(q.kind)) {
    for (const token of q.answer
      .replace(/[.!؟،]/g, "")
      .split(/\s+/)
      .filter(Boolean))
      await page
        .locator("#wordTiles button:enabled")
        .getByText(displayCharacterText(token), { exact: true })
        .first()
        .click();
    await page.locator("#checkBuild").click();
  } else if (q.kind === "address")
    await page
      .locator("#choices button")
      .filter({ hasText: displayCharacterText(q.answer) })
      .first()
      .click();
  else
    await page
      .locator("#choices button")
      .getByText(displayCharacterText(q.answer).replace(/^(\s*["“'‘(\[]*)([a-z])/, (_,prefix,c)=>prefix+c.toUpperCase()), {exact:true})
      .click();
}
