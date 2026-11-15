import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {setup,answerCurrent} from './browser-fixture.mjs';
import {runtime,reset,study,plain} from './runtime-fixture.mjs';
const data=JSON.parse(readFileSync('content/RPG_WORLD.json')),WORLD='pashto-quest-rpg-world-v1';
mkdirSync('work/sleep-bilal',{recursive:true});
const profiles={};
for(let day=1;day<=7;day++){
 const t=runtime();reset(t);
 for(let d=1;d<day;d++){for(const loc of t.content.zoneKeys)study(t,d,loc);t.progression.completeChallengeOnce(t.state.progress,d,d===7?25:15);}
 // Prepare the day's other locations as a coherent fixture, leaving Lake's
 // actual lesson unfinished. The browser completes Lake with public controls.
 for(const loc of t.content.zoneKeys.filter(l=>l!=='nature'))study(t,day,loc);
 t.state.session=null;profiles[day]=plain(t.state.progress);
}
for(const width of [1280,390])for(const reduced of [false,true]){
 const b=await setup({width,mobile:width===390,rpg:true,transform:h=>h.replace('// @TEST_HOOK','window.__sleepRPG=rpg;window.__sleepFence=saveFence; // @TEST_HOOK')}),p=b.page;
 try{
  await p.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);
  async function fixture(day,{house=false,passed=false,position}={}){
   await p.evaluate(async({day,profile,house,passed,position,data,WORLD})=>{
    const t=__test;t.state.session=null;t.state.progress=profile;
    if(passed)t.progression.completeChallengeOnce(t.state.progress,day,t.progression.getChallengeSpec(day).passCount);
    await t.storage.save();await __sleepRPG.flush();const raw=localStorage.getItem(WORLD);
    const w={schemaVersion:1,chapter:data.days[day].id,position:position??(house?{map:'house',x:17,y:10,facing:'right'}:{map:'village',x:76,y:27,facing:'up'}),appearance:'neutral',flags:{started:true,metGuide:true},npcFlags:{},triggers:{},routes:{},view:'world',lesson:null,educationFingerprint:null};
    for(let d=1;d<=day;d++){const c=data.days[d];if(c.openingEvent)w.triggers[c.openingEvent]=true;if(d<day||passed){if(c.endingEvent)w.triggers[c.endingEvent]=true;if(c.routes){w.routes[c.id]='skip';w.triggers[c.routes.skip.event]=true;}}}
    const next=JSON.stringify(w);await navigator.locks.request(WORLD,()=>__sleepFence.commit(WORLD,raw,next,()=>localStorage.getItem(WORLD),()=>{localStorage.setItem(WORLD,next);return true;}));
   },{day,profile:profiles[day],house,passed,position,data,WORLD});
   await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);
  }
  const finishTransition=()=>p.locator('.rpg-transition').waitFor({state:'detached'});
  const close=()=>p.locator('#rpgDialogue').getByRole('button',{name:'Back to village',exact:true}).click();
  await fixture(2,{house:true,passed:true});
  const campaign=await p.evaluate(()=>JSON.stringify(__test.state.progress));
  await p.locator('#rpgInteract').click();await p.getByRole('button',{name:'Dream — Review previous lessons',exact:true}).click();
  if(!reduced){await p.locator('#dreamTransition').waitFor();assert.equal(await p.locator('#dreamTransition').getAttribute('data-kind'),'dream-enter');await p.screenshot({path:`work/sleep-bilal/dream-${width}.png`,fullPage:true});}
  await p.locator('#dreamMenu').waitFor({state:'visible'});await finishTransition();await p.locator('[data-dream-day="1"]').click();await p.locator('[data-dream-lesson="1-residential"]').click();await p.locator('#dreamExit').waitFor();
  assert(await p.evaluate(()=>!!__test.state.reviewCampaign));await p.locator('#dreamExit').click();if(!reduced)assert.equal(await p.locator('#dreamTransition').getAttribute('data-kind'),'dream-exit');await finishTransition();
  assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress)),campaign);assert.equal(await p.locator('#rpgCanvas').getAttribute('data-map'),'house');
  // A selection-only Dream exit uses the same reverse transition and Escape path.
  await p.locator('#rpgInteract').click();await p.getByRole('button',{name:'Dream — Review previous lessons',exact:true}).click();await p.locator('#dreamMenu').waitFor({state:'visible'});await finishTransition();await p.keyboard.press('Escape');await finishTransition();assert(!await p.locator('#dreamMenu').isVisible());
  assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress)),campaign);
  await p.getByText('Quick travel',{exact:true}).click();await p.locator('#quickSleep').evaluate(button=>{button.click();button.click();button.click();});
  if(!reduced){await p.locator('#sleepTransition').waitFor();assert.equal(await p.locator('#sleepTransition h2').innerText(),'DAY 3');await p.screenshot({path:`work/sleep-bilal/sleep-${width}.png`,fullPage:true});}
  await finishTransition();await p.waitForFunction(()=>document.querySelector('.rpg-day').textContent.includes('DAY 3 /'));
  assert.deepEqual(await p.evaluate(()=>__sleepRPG.position),{map:'house',x:17,y:10,facing:'left'});assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress)),campaign);
  await p.evaluate(()=>__sleepRPG.flush());await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);assert((await p.locator('.rpg-day').innerText()).includes('DAY 3 /'));assert.equal(await p.locator('.rpg-transition').count(),0);
  if(!reduced){
   await fixture(2,{house:true,passed:true});await p.getByText('Quick travel',{exact:true}).click();await p.locator('#quickSleep').click();await p.locator('#sleepTransition').waitFor();
   await p.evaluate(()=>__sleepRPG.flush());await p.reload();await p.waitForFunction(()=>document.querySelector('.rpg-day').textContent.includes('DAY 3 /'));await finishTransition();await p.evaluate(()=>__sleepRPG.flush());await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);assert((await p.locator('.rpg-day').innerText()).includes('DAY 3 /'));
  }
  if(reduced){assert.equal(await p.evaluate(()=>document.getAnimations().filter(a=>a.effect?.target?.closest?.('.rpg-transition')).length),0);console.log('PASS reduced-motion sleep/dream',width);continue;}
  for(let day=1;day<=7;day++){
   const spec=data.conversations.bilal.days[day];await fixture(day);
   if(day<=3){
    await p.locator('#rpgInteract').click();assert((await p.locator('#rpgDialogue .pashto-option').count())>0,'School already unlocks Bilal before Lake');await close();
   }
   await p.evaluate(day=>__test.lessons.begin(day+'-nature'),day);
   for(let n=0;await p.locator('#lessonScreen').isVisible();n++){
    assert(n<150,'Lake lesson stalled');
    if(await p.locator('#teachPanel').isVisible())await p.locator('#teachNext').click();
    else if(await p.locator('#grammarPanel').isVisible()){
     const demo=p.locator('#grammarPanel .sov-demo[data-example-id]:not([data-complete])');
     if(await p.locator('#grammarNext').isDisabled()){
      await p.evaluate(()=>{const s=__test.state.session;const d=document.querySelector('.sov-demo');if(d){const id=d.dataset.exampleId,c=__test.content.wordById[id]||__test.S.restoreId(__test.content.LIBRARY_DATA,__test.content.LIBRARY_DATA.sentenceFrames,id);for(const token of c.ps.replace(/[.!؟،]/g,'').split(/\s+/)){[...d.querySelectorAll('.word-tiles button:enabled')].find(b=>b.textContent===token)?.click();}[...d.querySelectorAll('button')].find(b=>b.textContent==='Check sentence')?.click();}});
     }
     await p.locator('#grammarNext').click();
    }else {await answerCurrent(p);await p.locator('#quizNext').click();}
   }
   await p.locator('#resultWorld').click();await p.locator('#rpgInteract').click();
   const before=await p.evaluate(async()=>{await __sleepRPG.flush();return JSON.stringify(__test.state.progress);});
   const correct=p.locator('[data-response-id]').filter({hasText:spec.response.pashto});assert.equal(await correct.count(),1,`Day ${day}`);assert((await p.locator('[data-response-id]').count())<=4);
   assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[spec.event].pashto.ps);assert(!(await p.locator('#rpgDialogue').innerText()).includes(data.events[spec.event].languageReview.englishReviewOnly));await p.getByRole('button',{name:'Hear Pashto',exact:true}).click();
   await correct.click();assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[spec.correctEvent].pashto.ps);
   await p.getByRole('button',{name:'Continue',exact:true}).click();assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[spec.conclusionEvent].pashto.ps);await close();
   assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress)),before);await p.locator('#rpgInteract').click();assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[spec.event].pashto.ps);await close();
   // Clear only the optional narrative cursor/seen flag for the alternate branch.
   await p.evaluate(async({ids,WORLD})=>{await __sleepRPG.flush();const raw=localStorage.getItem(WORLD),w=JSON.parse(raw);for(const id of ids)delete w.triggers[id];delete w.dialogue;const next=JSON.stringify(w);await navigator.locks.request(WORLD,()=>__sleepFence.commit(WORLD,raw,next,()=>localStorage.getItem(WORLD),()=>{localStorage.setItem(WORLD,next);return true;}));},{ids:[spec.event,spec.correctEvent,spec.incorrectEvent,spec.conclusionEvent],WORLD});await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);await p.locator('#rpgInteract').click();
   await p.locator('[data-response-id]').filter({hasNotText:spec.response.pashto}).first().click();assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[spec.incorrectEvent].pashto.ps);
   await p.evaluate(()=>__sleepRPG.flush());await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);await p.locator('#rpgInteract').click();assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[spec.incorrectEvent].pashto.ps);await p.getByRole('button',{name:'Continue',exact:true}).click();assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[spec.conclusionEvent].pashto.ps);
   await p.screenshot({path:`work/sleep-bilal/bilal-day${day}-${width}.png`,fullPage:true});await close();assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress)),before);
  }
  assert.deepEqual(b.errors,[]);console.log('PASS sleep/dream and authored conversations',width,'normal transitions, single advancement, interruption/reload, exact dream isolation; seven actual Lake lessons, intended replies, distinct reactions/conclusions, repeat and reaction reload, Pashto/audio only');
 }finally{await b.close();}
}
