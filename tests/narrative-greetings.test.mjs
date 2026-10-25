// Browser integration: fixtures prepare days; dialogue, controls and practice use real DOM events.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import http from 'node:http';
const require=createRequire(import.meta.url);
let chromium;
try { ({chromium}=require('playwright')) } catch { ({chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')) }
const narrative=JSON.parse(readFileSync('content/NARRATIVE_EXPRESSIONS.json','utf8'));
const hook=`window.__narrative={get progress(){return progress},get session(){return session},data:LIBRARY_DATA,E:LibraryEngine,begin,startWorld,selectChallenge,libraryLessonPool,save,restoreLibraryChallenge,fixture(day,pace=24){progress=fresh();progress.tutorialDone=true;progress.library.requestedDailyTarget=pace;for(let d=1;d<day;d++)completeChallengeOnce(progress,d,getChallengeSpec(d).passCount);selectedLoop=day;session=null;save();startWorld()}};`;
const html=readFileSync('index.html','utf8').replace('// @TEST_HOOK',hook);
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end(html)});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try {
 for(const width of [1280,375]) {
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.__spoken=[];window.__audioCancels=0;
   class Utterance {constructor(text){this.text=text}}
   Object.defineProperty(window,'SpeechSynthesisUtterance',{value:Utterance,configurable:true});
   Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'ps-AF',name:'Fixture Windows Pashto Neural'}],cancel(){window.__audioCancels++},speak(u){window.__spoken.push({text:u.text,voice:u.voice?.name});u.onstart?.()},addEventListener(){},removeEventListener(){}},configurable:true});
  });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  // Every supported pace, normal and skip question sets, authored mappings and dynamic pools.
  for(const pace of [0,4,8,12,16,20,24]) {
   await page.evaluate(pace=>__narrative.fixture(1,pace),pace);
   const audit=await page.evaluate(()=>{
    const t=__narrative, plan=t.E.ensurePlan(t.progress,t.data,1);
    const pools=['residential','nature','business','school'].map(d=>t.libraryLessonPool(1,d));
    const questions=t.selectChallenge(1);
    return {count:Object.values(plan.locationAssignments).flat().length, safe:[...pools.flat(),...questions.map(q=>q.id)].every(id=>t.E.cardAllowed(t.data,id,1)), acquired:Object.keys(t.progress.library.phrases)};
   });
   assert.equal(audit.count,pace);assert(audit.safe);assert.deepEqual(audit.acquired,[]);
   for(const phrase of narrative.expressions.filter(p=>p.day===1)) {
    await page.evaluate(loc=>__narrative.begin('1-'+loc),phrase.location);
    const card=page.locator('#lessonExpression [data-expression]');
    assert.equal(await card.getAttribute('data-expression'),phrase.id);
    assert.match(await card.innerText(),new RegExp(phrase.speaker,'i'));
    const acquired=await page.evaluate(id=>!!__narrative.progress.library.phrases[id],phrase.id);
    assert.equal(acquired,phrase.active);
    assert(!await page.evaluate(()=>Object.keys(__narrative.progress.library.acquired).some(id=>__narrative.data.entries.find(e=>e.lemmaId===id).partOfSpeech==='verb')));
   }
  }
  // First visible Home encounter, recognition, repeat display and current-schema reload.
  await page.evaluate(()=>__narrative.fixture(1));
  await page.locator('.map-point.residential').click();
  const welcome=page.locator('#lessonExpression [data-expression="phrase-d1-home-welcome"]');
  await welcome.getByRole('button',{name:'Welcome!',exact:true}).click();
  const first=await page.evaluate(()=>JSON.parse(JSON.stringify(__narrative.progress)));
  assert.equal(first.library.phrases['phrase-d1-home-welcome'].source,'lesson');
  assert.equal(first.library.units['phrase-d1-home-welcome'].stage,1);
  await page.evaluate(()=>{__narrative.startWorld();__narrative.begin('1-residential')});
  assert.deepEqual(await page.evaluate(()=>__narrative.progress.library.phrases),first.library.phrases);
  assert.equal(await page.evaluate(()=>__narrative.progress.xp),first.xp);
  await page.reload();
  assert.deepEqual(await page.evaluate(()=>__narrative.progress.library.phrases),first.library.phrases);
  assert.deepEqual(await page.evaluate(()=>__narrative.progress.library.units),first.library.units);
  // A current-schema Day 1 replay may coexist with an unlocked Day 2. Restoring
  // it must never briefly render/acquire an unseen morning greeting.
  await page.evaluate(()=>__narrative.fixture(1));
  await page.locator('#skipDayBtn').click();
  await page.evaluate(()=>{
    const t=__narrative, q={id:'v-read',kind:'word',direction:'ps-en'};
    t.progress.challenges[1]={best:12,attempts:1,passed:true};t.progress.xp=200;
    t.session.questions[0]=q;t.progress.library.plans[1].challengeQuestions[0]=q;
    t.session.locked=true;t.session.correctCount=1;t.session.answered=1;t.session.earned=5;t.session.submittedAnswer='To read';
    const e=t.data.entries.find(e=>e.lemmaId==='lemma:v-read');
    t.E.encounter(t.progress,t.data,{lemmaId:e.lemmaId,formId:e.forms[0].formId},{day:2,source:'lesson',location:'school'});
    t.save();
  });
  await page.reload();
  const restored=await page.evaluate(()=>({xp:__narrative.progress.xp,score:__narrative.session.correctCount,locked:__narrative.session.locked,safe:__narrative.E.cardAllowed(__narrative.data,__narrative.session.questions[0].id,1),history:!!__narrative.progress.library.acquired['lemma:v-read'],morning:!!__narrative.progress.library.phrases['phrase-day-2-opening']}));
  assert.deepEqual(restored,{xp:200,score:1,locked:true,safe:true,history:true,morning:false});
  // Day 2 greeting is immediately available while skip stays visible and works.
  await page.evaluate(()=>__narrative.fixture(2));
  const morning=page.locator('#dayExpression [data-expression="phrase-day-2-opening"]');
  assert.match(await morning.innerText(),/Ms Hameed/i);
  assert.equal(await morning.locator('[lang="ps"]').innerText(),'سهار مو پخیر!');
  assert(await morning.locator('[lang="ps"]').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=24),'Pashto remains readable on mobile');
  await morning.getByRole('button',{name:'🔊 Hear Good morning!',exact:true}).click();
  await page.waitForFunction(()=>window.__spoken.length>0);
  assert.equal(await page.evaluate(()=>window.__spoken.at(-1).text),'سهار مو پخیر!');
  const beforeDayNavigation=await page.evaluate(()=>window.__audioCancels);
  await page.locator('#chapterButtons .chapter').nth(0).click();
  assert(await page.evaluate(n=>window.__audioCancels>n,beforeDayNavigation));
  await page.locator('#chapterButtons .chapter').nth(1).click();
  await page.evaluate(()=>{speechSynthesis.getVoices=()=>[];speechSynthesis.speak=u=>u.onerror?.({error:'language-unavailable'})});
  await morning.getByRole('button',{name:'🔊 Hear Good morning!',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#dayExpression [role="status"]').textContent.includes('language-unavailable'));
  assert.match(await morning.locator('[role="status"]').innerText(),/⚠️/);
  // Audio failure cannot block the text recognition task below.
  await morning.getByRole('button',{name:'Good morning!',exact:true}).click();
  const beforeReviewXP=await page.evaluate(()=>__narrative.progress.xp);
  await page.evaluate(()=>{__narrative.progress.library.units['phrase-day-2-opening'].srsDueAt=0;__narrative.startWorld()});
  await page.locator('#reviewBtn').click();
  await page.locator('#teachNext').click();
  await page.locator('#choices').getByRole('button',{name:'Good morning!',exact:true}).click();
  await page.locator('#quizNext').click();
  assert.equal(await page.evaluate(()=>__narrative.progress.xp),beforeReviewXP,'Memory Trail must not award repeatable expression XP');
  assert.equal(await page.evaluate(()=>__narrative.progress.library.units['phrase-day-2-opening'].stage),2);
  await page.locator('#resultWorld').click();
  const morningState=await page.evaluate(()=>JSON.parse(JSON.stringify(__narrative.progress)));
  assert.equal(morningState.library.phrases['phrase-day-2-opening'].source,'day-opening');
  assert.equal(morningState.library.phrases['phrase-day-2-opening'].location,'school');
  await page.locator('#skipDayBtn').click();
  assert.equal(await page.evaluate(()=>__narrative.session.mode),'challenge');
  assert.equal(await page.locator('#lessonExpression [data-expression]').count(),0);
  await page.reload();
  assert.deepEqual(await page.evaluate(()=>__narrative.progress.library.phrases),morningState.library.phrases);
  assert.deepEqual(await page.evaluate(()=>__narrative.progress.library.units),morningState.library.units);
  // Normal route teaches two lexical identities and third-person forms, before later persons.
  await page.evaluate(()=>__narrative.fixture(2));
  await page.locator('.map-point.school').click();
  assert(await page.locator('#lessonExpression [lang="ps"]').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=24),'lesson guide must not shrink Pashto');
  assert.match(await page.locator('#sovExplanation').innerText(),/Dictionary forms: لوستل/);
  assert.match(await page.locator('#sovExplanation').innerText(),/same two words/);
  const verbs=await page.evaluate(()=>Object.entries(__narrative.progress.library.acquired).filter(([id])=>__narrative.data.entries.find(e=>e.lemmaId===id).partOfSpeech==='verb').map(([id,r])=>({id,forms:r.encounteredFormIds})));
  assert.equal(verbs.length,2);assert(verbs.every(v=>v.forms.length>=2));
  await page.evaluate(()=>{const t=__narrative,e=t.data.entries.find(e=>e.lemmaId==='lemma:w6-together');t.E.encounter(t.progress,t.data,{lemmaId:e.lemmaId,formId:e.forms[0].formId},{day:2,source:'lesson',location:'school'})});
  await page.locator('#navLibrary').click();
  await page.locator('[data-library-tab="phrases"]').click();
  await page.locator('[data-phrase="phrase-day-2-opening"]').getByRole('button',{name:'Pronunciation (if available)',exact:true}).click();
  const beforeEscape=await page.evaluate(()=>window.__audioCancels);
  await page.keyboard.press('Escape');
  await page.waitForFunction(n=>window.__audioCancels>n && !document.querySelector('#libraryDialog').open,beforeEscape); // Native close is dispatched asynchronously.
  await page.locator('#navLibrary').click();
  await page.locator('[data-library-tab="universal"]').click();
  assert.equal(await page.locator('#libraryEntries [data-lemma="lemma:w6-together"]').count(),1);
  await page.locator('[data-library-tab="vocabulary"]').click();
  assert.equal(await page.locator('#libraryEntries [data-lemma="lemma:w6-together"]').count(),0);
  await page.locator('[data-library-tab="pace"]').click();
  assert.match(await page.locator('#libraryBody').innerText(),/99 activated draft content lemmas/);
  assert(!/undefined/.test(await page.locator('#libraryBody').innerText()));
  await page.locator('#libraryClose').click();
  // All thirteen day openings and immediate shortcuts. Pending Pashto never enters acquisition.
  for(let day=2;day<=14;day++) {
   await page.evaluate(day=>__narrative.fixture(day),day);
   const phrase=narrative.expressions.find(p=>p.day===day);
   assert.equal(await page.locator('#dayExpression [data-expression]').getAttribute('data-expression'),phrase.id);
   assert.match(await page.locator('#dayExpression').innerText(),new RegExp(phrase.speaker,'i'));
   await page.locator('#skipDayBtn').waitFor({state:'visible'});
   if(!phrase.active) {
    assert.match(await page.locator('#dayExpression').innerText(),/pending translation/);
    assert.equal(await page.locator('#dayExpression button').count(),0);
    assert.equal(await page.evaluate(id=>!!__narrative.progress.library.phrases[id],phrase.id),false);
   }
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow day ${day} width ${width}`);
   await page.locator('#skipDayBtn').click();
   assert.equal(await page.evaluate(()=>__narrative.session.loop),day);
   if(day===14)assert.equal(await page.evaluate(()=>__narrative.progress.library.plans[14].requestedDailyTarget),0);
  }
  assert.deepEqual(errors,[]);await page.close();
  console.log(`PASS narrative ${width}px: seven paces, four Day 1 slots, first encounters/reload/SRS, Day 2 audio/action forms, all daily speakers and immediate skips; untranslated expressions stay inactive`);
 }
} finally {await browser.close();server.close()}
