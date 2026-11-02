/* Default RPG release: all gameplay actions use public UI. Read-only save JSON is the assessment oracle. */
import {withDay1} from './rpg-profile-fixture.mjs';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {setup} from './browser-fixture.mjs';
import {runtime,beginAttempt,correctAnswer} from './runtime-fixture.mjs';
const data=JSON.parse(readFileSync('tests/fixtures/rpg-day1.json','utf8'));
const oracle=runtime(),EDU='pashto-quest-rpg-education-v1',WORLD='pashto-quest-rpg-world-v1';
for(const width of [375,1280]) {
 const b=await setup({width,rpg:true,bridge:false,offline:true,transform:h=>withDay1(h).replace("// @TEST_HOOK","window.__fixtureFence=saveFence;window.__rpgInspect=()=>({physics:rpg.diagnostics(),position:rpg.position,actors:rpg.registry.npcs(1,rpg.position.map)}); // @TEST_HOOK")});const p=b.page;
 let tutorialDone=false;
 try {
  // A production save sentinel must survive every RPG write and reset untouched.
  await p.evaluate(()=>localStorage.setItem('pashto-town-days-v1','production-save-sentinel'));
  const pos=()=>p.locator('#rpgCanvas').evaluate(c=>({map:c.dataset.map,x:Number(c.dataset.x),y:Number(c.dataset.y)}));
  async function durable(){await p.waitForFunction(key=>{const s=localStorage.getItem(key);return s&&JSON.parse(s).xp===Number(document.getElementById('xpPill').textContent.match(/\d+/)[0]);},EDU);await p.waitForTimeout(240);}
  async function progress(){await durable();return p.evaluate(k=>JSON.parse(localStorage.getItem(k)),EDU);}
  async function walk(x,y) {
   const start=await pos(),map=data.maps[start.map],npcs=data.npcs.flatMap(n=>{if(n.condition==='beforeTutorial'&&tutorialDone || n.condition==='afterTutorial'&&!tutorialDone)return [];return n.schedule.filter(s=>s.map===start.map);});
   const queue=[{x:start.x,y:start.y,path:[]}],seen=new Set([start.x+','+start.y]);let path;
   for(let i=0;i<queue.length;i++){const q=queue[i];if(q.x===x&&q.y===y){path=q.path;break;}for(const [dir,dx,dy]of[['ArrowUp',0,-1],['ArrowDown',0,1],['ArrowLeft',-1,0],['ArrowRight',1,0]]){const nx=q.x+dx,ny=q.y+dy,k=nx+','+ny;if(seen.has(k)||!data.tiles[map.tiles[ny]?.[nx]]?.walkable||npcs.some(n=>n.x===nx&&n.y===ny))continue;if(map.transitions.some(t=>t.x===nx&&t.y===ny)&&!(nx===x&&ny===y))continue;seen.add(k);queue.push({x:nx,y:ny,path:[...q.path,dir]});}}
   assert(path,'No public walk route');
   let expected={...start};
   for(const key of path){
    const [dx,dy]={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[key];
    expected={...expected,x:expected.x+dx,y:expected.y+dy};const entrance=data.maps[expected.map].transitions.find(t=>t.x===expected.x&&t.y===expected.y);
    if(entrance)expected={map:entrance.to,...entrance.spawn};
    await p.waitForTimeout(160);await p.keyboard.press(key);
    await p.waitForFunction(e=>{const c=document.getElementById('rpgCanvas');return c.dataset.map===e.map&&+c.dataset.x===e.x&&+c.dataset.y===e.y;},expected);
   }
   const end=await pos();if(!map.transitions.some(t=>t.x===x&&t.y===y))assert.deepEqual([end.x,end.y],[x,y]);
  }
  async function talk(label){await p.locator('#rpgInteract').click();await p.locator('#rpgDialogue').getByRole('button',{name:label,exact:true}).click();}
  async function tutorial(){
   await p.locator('#startTutorial').click();
   const start=await pos();await p.locator('[data-direction=down]').click();await p.waitForFunction(y=>+document.getElementById('rpgCanvas').dataset.y===y,start.y+1);await p.locator('[data-direction=up]').click();await p.waitForFunction(y=>+document.getElementById('rpgCanvas').dataset.y===y,start.y);assert.deepEqual(await pos(),start);
   const before=await pos();p.once('dialog',d=>d.dismiss());await p.locator('#rpgMenuButton').click();await p.locator('#resetProgress').click();assert(await p.locator('#worldScreen').isVisible());assert.deepEqual(await pos(),before,'Cancelled reset preserves world');await p.locator('#rpgInteract').click();
   await p.keyboard.down('ArrowDown');await p.waitForTimeout(350);await p.keyboard.up('ArrowDown');assert.deepEqual(await pos(),before,'Dialogue freezes movement');
   await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).click();
   await p.locator('#rpgDialogue').getByRole('button',{name:'I will meet you at the Library',exact:true}).click();
   await walk(24,15);assert.equal((await pos()).map,'library');await walk(6,6);
   await talk('Begin Library tutorial');
   await p.locator('#tutorialInteraction button').getByText('Hello',{exact:true}).click();await p.locator('#teachNext').click();
   await p.locator('#tutorialInteraction button').getByText('څنګه',{exact:true}).click();
   await durable();const tutorialDraft=await p.locator('#tutorialInteraction .built-sentence').innerText();await p.reload();await p.locator('#tutorialInteraction .built-sentence').waitFor();assert.equal(await p.locator('#tutorialInteraction .built-sentence').innerText(),tutorialDraft,'Exact tutorial tile draft restores');
   for(const text of ['یې؟','Check sentence'])await p.locator('#tutorialInteraction button').getByText(text,{exact:true}).click();
   await durable();const tutorialXP=(await progress()).xp;await p.reload();await p.locator('#teachNext:enabled').waitFor();assert.equal((await progress()).xp,tutorialXP,'Correct tutorial reload never scores twice');
   await p.locator('#teachNext').click();await p.locator('#tutorialInteraction button').getByText('Prefer not to say',{exact:true}).click();await p.locator('#teachNext').click();
   await p.locator('#tutorialName').fill('RPG learner');await p.locator('#tutorialSaveName').click();await p.locator('#teachNext').click();tutorialDone=true;
   assert((await progress()).tutorialDone);await p.locator('#resultWorld').click();await walk(6,9);assert.equal((await pos()).map,'village');
  }
  const known=new Map();
  async function finishLesson({reload=false}={}) {
   let guard=0,reloaded=false,generated=0;
   while(await p.locator('#lessonScreen').isVisible()) {
    assert(++guard<120,'Lesson stalled');
    if(await p.locator('#teachPanel').isVisible()){
     const ps=await p.locator('#teachPashto').innerText(),en=await p.locator('#teachEnglish').innerText();known.set(ps,en);
     if((await p.locator('#teachType').innerText()).toLowerCase()==='generated sentence')generated++;
     await p.locator('#teachNext').click();
    }else if(await p.locator('#grammarPanel').isVisible())await p.locator('#grammarNext').click();
    else {
     if(await p.locator('#constructionPanel').isVisible()){
      const en=await p.locator('#quizPashto').innerText(),ps=[...known].find(([_ps,gloss])=>gloss===en)?.[0];assert(ps,en);
      const tokens=ps.replace(/[.!؟،]/g,'').split(/\s+/);
      for(const [i,token]of tokens.entries()){
       await p.locator('#wordTiles button:enabled').getByText(token,{exact:true}).first().click();
       if(reload&&!reloaded&&i===0){await durable();const before=await p.locator('#builtSentence').innerText();await p.reload();await p.locator('#constructionPanel').waitFor({state:'visible'});assert.equal(await p.locator('#builtSentence').innerText(),before);reloaded=true;}
      }
      await p.locator('#checkBuild').click();
     }else {const ps=await p.locator('#quizPashto').innerText();assert(known.has(ps),ps);await p.locator('#choices button').getByText((known.get(ps)).replace(/^(\s*["“'‘(\[]*)([a-z])/, (_,prefix,c)=>prefix+c.toUpperCase()), {exact:true}).click();}
     await p.locator('#quizNext').click();
    }
   }
   return generated;
  }
  function answerFor(q){const w=oracle.content.wordById[q.id];return q.answerPs||q.correct||(q.direction==='en-ps'?w.ps:w.en);}
  async function assessment({fail=false,reload=false}={}) {
   let reloaded=false;
   for(let i=0;i<15;i++){
    const saved=await progress();assert(saved.activeChallenge);oracle.content.restoreGenerated(saved);
    const q=saved.activeChallenge.questions[saved.activeChallenge.index];
    if(q.unstudied){assert(!(await p.locator('#choices').innerText()).includes(answerFor(q)));await p.locator('#unseenRecall').fill(fail?'deliberately incorrect':answerFor(q));await p.getByRole('button',{name:'Submit meaning',exact:true}).click();}
    else if(['construct','dialogue'].includes(q.kind)){
     if(fail){const tiles=p.locator('#wordTiles button:enabled');while(await tiles.count()){await tiles.last().click();if(q.duds?.length)break;}}
     else for(const token of answerFor(q).replace(/[.!؟،]/g,'').split(/\s+/).filter(Boolean))await p.locator('#wordTiles button:enabled').getByText(token,{exact:true}).first().click();
     if(reload&&!reloaded){await durable();const before=(await progress()).activeChallenge;await p.reload();await p.locator('#quizPanel').waitFor({state:'visible'});const after=(await progress()).activeChallenge;assert.deepEqual(after.questions,before.questions);assert.deepEqual(after.built,before.built);reloaded=true;}
     await p.locator('#checkBuild').click();
    }else {const choices=p.locator('#choices button');if(fail){const labels=await choices.evaluateAll(bs=>bs.map(b=>b.dataset.answer));await choices.nth(Math.max(0,labels.findIndex(t=>t!==answerFor(q)))).click();}else await choices.getByText((answerFor(q)).replace(/^(\s*["“'‘(\[]*)([a-z])/, (_,prefix,c)=>prefix+c.toUpperCase()), {exact:true}).click();}
    if(reload&&i===3){await durable();const before=(await progress()).activeChallenge;const xp=(await progress()).xp;await p.reload();await p.locator('#quizPanel').waitFor({state:'visible'});const after=(await progress()).activeChallenge;assert(after.locked);assert.equal(after.correctCount,before.correctCount);assert.equal((await progress()).xp,xp);assert.deepEqual(after.questions,before.questions);}
    await p.locator('#quizNext').click();
   }
  }
  await tutorial();
  // Appearance and menu are independent of English gender preference.
  await p.locator('#rpgMenuButton').click();await p.locator('[data-appearance="feminine"]').click();await p.getByRole('button',{name:'Resume village',exact:true}).click();
  assert.equal((await progress()).playerProfile.gender,'unspecified');
  await walk(10,11);await talk('Study at Home');assert.equal(await finishLesson({reload:true}),3,'Authentic default Home generates three descriptions');await p.locator('#resultWorld').click();
  await walk(38,12);await talk('Study at the Lake');await finishLesson();await p.locator('#resultWorld').click();
  await walk(11,29);await talk('Study at the Market');await finishLesson();await p.locator('#resultWorld').click();
  await walk(39,28);await talk('Study at School');await finishLesson();await p.locator('#resultWorld').click();
  for(const loc of ['residential','nature','business','school'])assert((await progress()).complete['1-'+loc]);
  const position=await pos();await durable();await p.reload();await p.locator('#worldScreen').waitFor({state:'visible'});assert.deepEqual(await pos(),position);assert.equal(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).appearance,WORLD),'feminine');
  await p.locator('#rpgLibrary').click();assert((await p.locator('#libraryBody').innerText()).includes('Vocabulary Bank'));await p.locator('[data-library-tab="grammar"]').click();assert((await p.locator('#libraryBody').innerText()).includes('Grammar Journal'));await p.locator('#libraryClose').click();
  await walk(10,11);await talk('Day 1 challenge · 15 questions');await assessment({reload:true});assert((await progress()).challenges[1].passed);
  assert.equal(await p.locator('#resultHeading').innerText(),'Pashto Quest — RPG Prototype Complete');assert((await p.locator('#resultDescription').innerText()).includes('You have successfully completed Day 1.'));
  const completedXP=(await progress()).xp;await durable();await p.reload();assert.equal(await p.locator('#resultHeading').innerText(),'Pashto Quest — RPG Prototype Complete');assert.equal((await progress()).xp,completedXP,'Reload does not repeat awards');
  mkdirSync('docs/rpg/screenshots',{recursive:true});await p.screenshot({path:`docs/rpg/screenshots/completion-${width}.png`,fullPage:true});
  await p.locator('#resultWorld').click();await p.screenshot({path:`docs/rpg/screenshots/village-${width}.png`,fullPage:true});
  // No chapter navigation or future-day restoration is exposed.
  assert.equal(await p.locator('#chapterButtons').count(),0);assert.equal((await progress()).challenges[2],undefined);
  p.once('dialog',d=>d.accept());await p.locator('#rpgMenuButton').click();await p.locator('#resetProgress').click();tutorialDone=false;await tutorial();
  await walk(10,11);assert.equal(Object.keys((await progress()).complete).filter(id=>id.startsWith('1-')).length,0);
  await talk('Day 1 challenge · 15 questions');await assessment({fail:true,reload:true});assert(!(await progress()).challenges[1].passed);assert.equal(Object.keys((await progress()).complete).filter(id=>id.startsWith('1-')).length,0);
  await p.locator('#resultReplay').click();await assessment();const pass=await progress();assert(pass.challenges[1].passed);for(const loc of ['residential','nature','business','school'])assert(pass.complete['1-'+loc]);
  assert.equal(await p.evaluate(()=>localStorage.getItem('pashto-town-days-v1')),'production-save-sentinel');
  assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),'Mobile overflow');
  // Bad world coordinates recover independently of real completed educational progress.
  const stable=await progress();
  await p.evaluate(async k=>{const current=localStorage.getItem(k),w=JSON.parse(current);w.position={map:'unavailable',x:999,y:-2};w.view='world';await navigator.locks.request(k,()=>__fixtureFence.commit(k,current,JSON.stringify(w),()=>localStorage.getItem(k),()=>{localStorage.setItem(k,JSON.stringify(w));return true;}));},WORLD);
  await p.reload();await p.locator('#worldScreen').waitFor({state:'visible'});assert.equal((await pos()).map,'village');
  const recovered=await progress();assert.equal(recovered.xp,stable.xp);assert.deepEqual(recovered.challenges,stable.challenges);assert.deepEqual(recovered.library.acquired,stable.library.acquired);
  // A valid schema-7 future-day fixture must never make that day playable in this profile.
  const future=runtime();future.state.progress.tutorialDone=true;beginAttempt(future,1);
  for(const q of future.state.session.questions){future.state.session.locked=false;future.learning.submitChallenge(correctAnswer(future,q));future.state.session.index++;}
  future.progression.completeChallengeOnce(future.state.progress,1,15);beginAttempt(future,2);
  const futureRaw=future.storage.snapshot();assert(future.storage.currentSave(JSON.parse(futureRaw)));
  await p.evaluate(async([key,raw])=>{const current=localStorage.getItem(key);await navigator.locks.request(key,()=>__fixtureFence.commit(key,current,raw,()=>localStorage.getItem(key),()=>{localStorage.setItem(key,raw);return true;}));},[EDU,futureRaw]);await p.reload();await p.locator('#worldScreen').waitFor({state:'visible'});
  assert(!await p.locator('#lessonScreen').isVisible(),'Future saved challenge is not opened');assert.equal((await progress()).activeChallenge.loop,2,'Unavailable snapshot is preserved, not regraded or rerolled');
  assert.deepEqual(b.errors,[]);
  console.log('PASS RPG public UI',width,'tutorial, all four authentic lessons, Home 3 descriptions, movement/touch controls, Library, frozen partial/locked challenge reload, lesson reload, appearance, completion/reload, early failure/retry, save isolation, Day 2 boundary');
 } catch(error){console.error('Public RPG failure',await p.evaluate(()=>({position:document.getElementById('rpgCanvas').dataset,inspection:window.__rpgInspect(),hidden:document.hidden,focus:document.hasFocus(),dialogs:[...document.querySelectorAll('dialog[open]')].map(d=>d.id),world:localStorage.getItem('pashto-quest-rpg-world-v1'),objective:document.getElementById('rpgObjective').textContent})));throw error;} finally{await b.close();}
}
