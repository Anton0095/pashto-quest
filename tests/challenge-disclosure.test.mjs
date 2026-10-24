// Fixture hooks prepare state; assertions and submissions exercise the rendered UI.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import http from 'node:http';
const require=createRequire(import.meta.url);
let chromium;
try {({chromium}=require('playwright'))} catch {({chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))}
const hook=`window.__disclosure={get progress(){return progress},get session(){return session},wordById,E:LibraryEngine,data:LIBRARY_DATA,save,showChallengeQuestion,fixture(day,studied=false){progress=fresh();progress.tutorialDone=true;progress.library.requestedDailyTarget=24;for(let d=1;d<day;d++)completeChallengeOnce(progress,d,getChallengeSpec(d).passCount);selectedLoop=day;session=null;if(studied){const e=LIBRARY_DATA.entries.find(e=>e.lemmaId==='lemma:n-window');LibraryEngine.encounter(progress,LIBRARY_DATA,{lemmaId:e.lemmaId,formId:e.forms[0].formId},{day,source:'lesson',location:'residential'})}save();startWorld()},focus(direction,origin='scheduled-scaffold'){const s=session,q={id:'library-card:lemma:n-window',lemmaId:'lemma:n-window',kind:'word',direction,vocabularyOrigin:origin,comment:'Scheduled word, not yet studied: use the meaning and answer options.'};s.index=0;s.questions[0]=q;showChallengeQuestion();return wordById[q.id]}};`;
const html=readFileSync('index.html','utf8').replace('// @TEST_HOOK',hook);
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end(html)});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try {
 for(const width of [1280,375]) {
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.__spoken=[];
   class Utterance {constructor(text){this.text=text}}
   Object.defineProperty(window,'SpeechSynthesisUtterance',{value:Utterance,configurable:true});
   Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'ps-AF',name:'Test Pashto Neural'}],cancel(){},speak(u){window.__spoken.push({text:u.text,voice:u.voice?.name});u.onstart?.()},addEventListener(){},removeEventListener(){}},configurable:true});
  });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  async function assertUnanswered(word) {
   assert.equal(await page.locator('#quizPashto').innerText(),word.ps);
   const roman=await page.locator('#quizRoman').innerText();
   assert(roman.includes(word.roman),`missing transliteration: ${roman}`);
   assert(roman.includes('Not previously studied'));
   for(const selector of ['#quizRoman','#quizPrompt','#quizFeedback','#guideMessage'])
    assert(!(await page.locator(selector).innerText()).includes(word.en),`${selector} reveals ${word.en}`);
   assert.equal(await page.locator('#choices button').getByText(word.en,{exact:true}).count(),1);
   assert.equal(await page.locator('#choices .correct,#choices .wrong,#choices button:disabled').count(),0);
   assert(await page.locator('#quizSpeak').isVisible());
   assert.equal(await page.evaluate(()=>__disclosure.session.locked),false);
   assert.equal(await page.evaluate(()=>__disclosure.session.correctCount),0);
  }
  for(const direction of ['ps-en','en-ps']) {
   await page.evaluate(()=>__disclosure.fixture(1));
   await page.locator('#skipDayBtn').click();
   const word=await page.evaluate(direction=>__disclosure.focus(direction),direction);
   await assertUnanswered(word);
   await page.locator('#quizSpeak').click();
   await page.waitForFunction(ps=>window.__spoken.some(s=>s.text===ps),word.ps);
   const before=await page.evaluate(()=>JSON.parse(JSON.stringify(__disclosure.progress)));
   await page.reload();
   await assertUnanswered(word);
   assert.deepEqual(await page.evaluate(()=>__disclosure.progress.library.acquired),before.library.acquired);
   assert.equal(await page.evaluate(()=>__disclosure.progress.xp),before.xp);
   // A schema-4 attempt saved before this fix has no presentation flag.
   await page.evaluate(direction=>{
    const raw=JSON.parse(localStorage.getItem('pashto-town-days-v1'));
    delete raw.activeChallenge.questions[0].unstudied;
    raw.activeChallenge.questions[0].direction=direction;
    localStorage.setItem('pashto-town-days-v1',JSON.stringify(raw));
   },direction);
   await page.reload();
   await assertUnanswered(word);
   await page.locator('#choices').getByRole('button',{name:word.en,exact:true}).click();
   assert.equal(await page.evaluate(()=>__disclosure.session.correctCount),1,'skipping incurs no automatic score penalty');
   assert.equal(await page.evaluate(()=>__disclosure.session.locked),true);
   assert((await page.locator('#quizFeedback').innerText()).includes(word.en));
   const locked=await page.evaluate(()=>JSON.parse(JSON.stringify(__disclosure.progress)));
   await page.reload();
   assert.equal(await page.evaluate(()=>__disclosure.session.correctCount),1);
   assert.equal(await page.evaluate(()=>__disclosure.session.locked),true);
   assert.equal(await page.evaluate(()=>__disclosure.progress.xp),locked.xp);
   assert.deepEqual(await page.evaluate(()=>__disclosure.progress.library.acquired),locked.library.acquired);
   assert((await page.locator('#quizFeedback').innerText()).includes(word.en));
   await page.evaluate(()=>__disclosure.focus('en-ps'));
   assert.equal(await page.locator('#quizPashto').innerText(),word.en,'a word learned through feedback can use the normal reverse question');
  }
  // A wrong submission reveals feedback and locks exactly once.
  await page.evaluate(()=>__disclosure.fixture(2));
  await page.locator('#skipDayBtn').click();
  const wrongWord=await page.evaluate(()=>__disclosure.focus('en-ps','authored-fallback'));
  await assertUnanswered(wrongWord);
  await page.locator('#choices button').filter({hasNotText:wrongWord.en}).first().click();
  assert.equal(await page.evaluate(()=>__disclosure.session.correctCount),0);
  assert((await page.locator('#quizFeedback').innerText()).includes(wrongWord.en));
  assert.equal(await page.locator('#choices button:enabled').count(),0);
  // Actual prior lesson exposure retains both normal question directions.
  for(const direction of ['ps-en','en-ps']) {
   await page.evaluate(()=>__disclosure.fixture(2,true));
   await page.locator('#skipDayBtn').click();
   const word=await page.evaluate(direction=>__disclosure.focus(direction,'encountered'),direction);
   assert.equal(await page.locator('#quizPashto').innerText(),direction==='ps-en'?word.ps:word.en);
   assert.equal(await page.locator('#quizRoman').innerText(),direction==='ps-en'?word.roman:'Recall the Pashto expression');
   assert(!(await page.locator('#quizRoman').innerText()).includes('Not previously studied'));
  }
  // Immediate skip remains available with no visits, on every unlocked day.
  for(let day=2;day<=14;day++) {
   await page.evaluate(day=>__disclosure.fixture(day),day);
   await page.locator('#skipDayBtn').click();
   assert.equal(await page.evaluate(()=>__disclosure.session.loop),day);
   assert.equal(await page.evaluate(()=>Object.keys(__disclosure.progress.complete).length),0);
  }
  assert.deepEqual(errors,[]);await page.close();
  console.log(`PASS disclosure ${width}px: unstudied directions, normal choices/audio, unanswered reload, correct/wrong locks, saved SRS/score/XP, studied words, immediate Days 2–14 skips`);
 }
}finally{await browser.close();server.close()}
