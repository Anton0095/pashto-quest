import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {setup,answerCurrent} from './browser-fixture.mjs';
import {runtime,reset,study,plain} from './runtime-fixture.mjs';
const data=JSON.parse(readFileSync('content/RPG_WORLD.json')),WORLD='pashto-quest-rpg-world-v1';
mkdirSync('work/typing-bilal',{recursive:true});
const profiles={};
for(let day=1;day<=7;day++){
 const t=runtime();reset(t,8);for(let d=1;d<day;d++)t.progression.completeChallengeOnce(t.state.progress,d,t.progression.getChallengeSpec(d).passCount);
 profiles[day]={none:plain(t.state.progress)};
 study(t,day,'nature');t.state.session=null;profiles[day].lake=plain(t.state.progress);
}
for(const width of [1280,390]){
 const b=await setup({width,rpg:true,mobile:width===390,transform:h=>h.replace('// @TEST_HOOK','window.__typingRPG=rpg;window.__typingFence=saveFence; // @TEST_HOOK')}),p=b.page;
 try{
  async function fixture(day,route='none'){
   await p.evaluate(async({profile,day,route,data,WORLD})=>{
    const t=__test;t.state.progress=profile;t.state.session=null;
    if(route==='pass'||route==='failed')t.progression.completeChallengeOnce(t.state.progress,day,route==='pass'?t.progression.getChallengeSpec(day).passCount:0);
    await t.storage.save();await __typingRPG.flush();const raw=localStorage.getItem(WORLD);
    const w={schemaVersion:1,chapter:data.days[day].id,position:{map:'village',x:76,y:27,facing:'up'},appearance:'neutral',flags:{started:true,metGuide:true},npcFlags:{},triggers:{},routes:{},view:'world',lesson:null,educationFingerprint:null};
    for(let d=1;d<=day;d++){const c=data.days[d];w.triggers[c.openingEvent]=true;if(d<day||route==='pass'){w.triggers[c.endingEvent]=true;if(c.routes){w.routes[c.id]='skip';w.triggers[c.routes.skip.event]=true;}}}
    const next=JSON.stringify(w);await navigator.locks.request(WORLD,()=>__typingFence.commit(WORLD,raw,next,()=>localStorage.getItem(WORLD),()=>{localStorage.setItem(WORLD,next);return true;}));
   },{profile:profiles[day][route==='lake'?'lake':'none'],day,route,data,WORLD});
   await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);
  }
  for(let day=1;day<=7;day++)for(const route of ['none','failed','lake','pass']){
   const spec=data.conversations.bilal.days[day];await fixture(day,route);await p.locator('#rpgInteract').click();
   const eligible=route==='lake'||route==='pass';assert.equal(await p.locator('[data-response-id]').count()>0,eligible,`day ${day} ${route}`);
   if(!eligible){await p.getByRole('button',{name:'Back to village',exact:true}).click();continue;}
   assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[spec.event].pashto.ps);assert.equal(await p.locator('#rpgDialogue .rpg-dialogue-roman').innerText(),data.events[spec.event].pashto.roman);
   assert(!(await p.locator('#rpgDialogue').innerText()).includes(data.events[spec.event].languageReview.englishReviewOnly));await p.getByRole('button',{name:'Hear Pashto',exact:true}).click();
   const before=await p.evaluate(async()=>{await __typingRPG.flush();return JSON.stringify(__test.state.progress);});
   const wrong=p.locator('[data-response-id]').filter({hasNotText:spec.response.pashto});
   const inappropriate=route==='lake'&&await wrong.count()>0;
   if(inappropriate)await wrong.first().click();else await p.locator('[data-response-id]').filter({hasText:spec.response.pashto}).click();
   const reaction=inappropriate?spec.incorrectEvent:spec.correctEvent;assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[reaction].pashto.ps);
   await p.evaluate(()=>__typingRPG.flush());await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);await p.locator('#rpgInteract').click();assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[reaction].pashto.ps);
   await p.getByRole('button',{name:'Continue',exact:true}).click();assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[spec.conclusionEvent].pashto.ps);await p.getByRole('button',{name:'Back to village',exact:true}).click();
   await p.locator('#rpgInteract').click();assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[spec.repeatEvent].pashto.ps);await p.getByRole('button',{name:'Back to village',exact:true}).click();assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress)),before);
  }
  assert.deepEqual(b.errors,[]);console.log('PASS typing/Bilal browser',width,'all seven days × four eligibility routes, Pashto/audio, both reactions, reaction reload/repeat, no learning writes');
 }finally{await b.close();}
}
