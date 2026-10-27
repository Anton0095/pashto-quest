// Browser integration: greetings are the FIRST study cards in each location
// and the FIRST real question in that day's fixed-length challenge.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import http from "node:http";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright")); }
const narrative = JSON.parse(readFileSync("content/NARRATIVE_EXPRESSIONS.json", "utf8"));
const hook = `window.__narrative = {
  get progress(){return state.progress}, get session(){return state.session},
  data:content.LIBRARY_DATA, E:LibraryEngine, begin:lessons.begin, startWorld:world.startWorld,
  selectChallenge:questions.selectChallenge, libraryLessonPool:learning.libraryLessonPool, save:storage.save, afterStudy:lessons.afterStudy, answerChallenge:challenge.answerChallenge,
  fixture(day, pace=20) {
    state.progress=progression.fresh(); state.progress.tutorialDone=true;
    state.progress.library.requestedDailyTarget=pace;
    for(let d=1;d<day;d++) progression.completeChallengeOnce(state.progress,d,progression.getChallengeSpec(d).passCount);
    state.day=day; state.session=null; storage.save(); world.startWorld();
  }
};`;
const html = readFileSync("index.html","utf8").replace("// @TEST_HOOK",hook);
const server = http.createServer((req,res)=>{
  res.setHeader("Content-Type","text/html;charset=utf-8");res.end(html);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const browser = await chromium.launch({
  executablePath:process.env.CHROMIUM_PATH||"/usr/bin/chromium",
  args:["--no-sandbox"],
});
try {
  for (const width of [1280,375]) {
    const page=await browser.newPage({viewport:{width,height:900}}), errors=[];
    page.setDefaultTimeout(60000);
    page.on("pageerror",e=>errors.push(e.message));
    await page.addInitScript(()=>{
      window.__spoken=[];
      class Utterance { constructor(text){this.text=text;} }
      Object.defineProperty(window,"SpeechSynthesisUtterance",{value:Utterance,configurable:true});
      Object.defineProperty(window,"speechSynthesis",{
        value:{getVoices:()=>[{lang:"ps-AF",name:"Fixture Pashto"}],
          cancel(){},addEventListener(){},removeEventListener(){},
          speak(u){window.__spoken.push(u.text);u.onstart?.();}},
        configurable:true,
      });
    });
    await page.goto(`http://127.0.0.1:${server.address().port}`);

    // New greetings are independent of all seven daily lexical quotas.
    for (const pace of [0,4,8,12,16,20,24]) {
      await page.evaluate(p=>__narrative.fixture(1,p),pace);
      const audit=await page.evaluate(()=>{
        const t=__narrative,plan=t.E.ensurePlan(t.progress,t.data,1);
        const pools=["residential","nature","business","school"]
          .map(loc=>t.libraryLessonPool(1,loc));
        return {
          quota:Object.values(plan.locationAssignments).flat().length,
          first:pools.map(x=>x[0]),
          challenge:t.selectChallenge(1).map(q=>q.id),
          acquired:Object.keys(t.progress.library.phrases),
        };
      });
      assert.equal(audit.quota,pace);
      assert.deepEqual(audit.first,Array(4).fill("phrase-d1-home-welcome"));
      assert.equal(audit.challenge.length,15);
      assert.equal(audit.challenge[0],"phrase-d1-home-welcome");
      assert.deepEqual(audit.acquired,[],"Planning cannot acquire expressions");
      for (const loc of ["residential","nature","business","school"]) {
        await page.evaluate(l=>__narrative.begin("1-"+l),loc);
        assert.equal(await page.evaluate(()=>__narrative.session.phase),"greeting");
        assert.equal(await page.locator("#teachPashto").innerText(),"ښه راغلاست");
        assert.equal(await page.locator("#teachEnglish").innerText(),"Welcome!");
        assert.match(await page.locator("#teachCount").innerText(),/TODAY'S GREETING/);
        assert.equal(await page.locator("#lessonExpression [data-expression]").count(),0);
        const phrase=await page.evaluate(()=>__narrative.progress.library.phrases["phrase-d1-home-welcome"]);
        assert.equal(phrase.source,"lesson");
      }
      const acquired=await page.evaluate(()=>__narrative.progress.library.acquired);
      assert(Object.keys(acquired).every(id=>
        !id.startsWith("phrase-")),"Phrases must not enter the lexical bank");
    }

    // Skipping all locations makes the greeting the first assessed item, but
    // does not disclose its English meaning before the answer.
    await page.evaluate(()=>__narrative.fixture(1));
    await page.locator("#skipDayBtn").click();
    assert.equal(await page.evaluate(()=>__narrative.session.questions.length),15);
    assert.equal(await page.evaluate(()=>__narrative.session.questions[0].id),"phrase-d1-home-welcome");
    assert.match(await page.locator("#quizRoman").innerText(),/Not previously studied/);
    assert.equal(await page.locator("#quizPashto").innerText(),"ښه راغلاست");
    assert.equal(await page.locator("#quizPrompt").innerText(),"What does this greeting mean?");
    const beforeXP=await page.evaluate(()=>__narrative.progress.xp);
    await page.locator("#choices").getByRole("button",{name:"Welcome!",exact:true}).click();
    assert.equal(await page.evaluate(()=>__narrative.progress.xp),beforeXP,"Fixed greetings grant no XP");
    assert.equal(await page.evaluate(()=>__narrative.progress.library.units["phrase-d1-home-welcome"].stage),1);
    await page.reload();
    assert.equal(await page.evaluate(()=>__narrative.progress.library.units["phrase-d1-home-welcome"].stage),1);

    // Day 2 is announced narratively but its answer is taught first at School,
    // not revealed or acquired automatically merely by opening the town map.
    await page.evaluate(()=>__narrative.fixture(2));
    assert.match(await page.locator("#dayExpression").innerText(),/Ms Hameed/);
    assert(!await page.evaluate(()=>!!__narrative.progress.library.phrases["phrase-day-2-opening"]));
    const pool2=await page.evaluate(()=>["school","nature","business","residential"].map(
      loc=>__narrative.libraryLessonPool(2,loc)[0]));
    assert.deepEqual(pool2,Array(4).fill("phrase-day-2-opening"));
    await page.locator(".map-point.school").click();
    assert.equal(await page.evaluate(()=>__narrative.session.phase),"greeting");
    assert.equal(await page.locator("#teachPashto").innerText(),"سهار مو پخیر!");
    assert.equal(await page.locator("#teachEnglish").innerText(),"Good morning!");
    await page.locator("#teachSpeak").click();
    await page.waitForFunction(()=>window.__spoken.includes("سهار مو پخیر!"));
    await page.locator("#teachNext").click();
    assert.equal(await page.evaluate(()=>__narrative.session.phase),"grammar");
    assert.match(await page.locator("#sovExplanation").innerText(),/Dictionary forms: لوستل/);
    assert.equal(await page.evaluate(()=>__narrative.progress.library.phrases["phrase-day-2-opening"].source),"lesson");

    await page.evaluate(()=>__narrative.fixture(2));
    await page.locator("#skipDayBtn").click();
    assert.equal(await page.evaluate(()=>__narrative.session.questions[0].id),"phrase-day-2-opening");
    assert.match(await page.locator("#quizRoman").innerText(),/Not previously studied/);
    assert.equal(await page.locator("#quizPashto").innerText(),"سهار مو پخیر!");

    // Days 3–14 keep untranslated targets inactive until linguistic approval.
    for (let day=3;day<=14;day++) {
      await page.evaluate(d=>__narrative.fixture(d),day);
      const phrase=narrative.expressions.find(p=>p.day===day);
      assert(!phrase.active);
      assert.equal(await page.locator("#dayExpression [data-expression]").count(),0);
      assert.equal(await page.evaluate(id=>!!__narrative.progress.library.phrases[id],phrase.id),false);
      assert(await page.locator("#skipDayBtn").isVisible());
      await page.locator("#skipDayBtn").click();
      assert.equal(await page.evaluate(()=>__narrative.session.loop),day);
      assert(!await page.evaluate(id=>__narrative.session.questions.some(q=>q.id===id),phrase.id));
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),
        "Horizontal overflow on Day "+day);
    }
    assert.deepEqual(errors,[]);
    await page.close();
    console.log("PASS greeting-first curriculum",width,"px: seven paces, four locales, skip/quiz, SRS and pending translations");
  }
} finally { await browser.close();server.close(); }
