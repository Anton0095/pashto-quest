import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {setup,answerCurrent} from './browser-fixture.mjs';
import {driver} from './rpg-week1-driver.mjs';
const data=JSON.parse(readFileSync('content/RPG_WORLD.json')),WORLD='pashto-quest-rpg-world-v1';
mkdirSync('docs/rpg/lesson-cleanup',{recursive:true});
for(const [width,height] of [[1920,1080],[1366,768],[390,844]].filter(([w])=>!process.env.CLEANUP_WIDTH||w===+process.env.CLEANUP_WIDTH)){
 const b=await setup({width,rpg:true,mobile:width===390,transform:h=>h.replace('// @TEST_HOOK','window.__entryFence=saveFence;window.__entryRPG=rpg; // @TEST_HOOK')});const p=b.page,d=driver(p);
 try{
  await p.setViewportSize({width,height});await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);
  async function fixture(day,position){
   await p.evaluate(async({day,position,WORLD,data})=>{const t=__test;t.state.session=null;t.state.progress=t.progression.fresh();t.state.progress.tutorialDone=true;t.state.progress.library.seed=123456;
    for(let d=1;d<day;d++)t.progression.completeChallengeOnce(t.state.progress,d,t.progression.getChallengeSpec(d).passCount);
    await t.storage.save();await __entryRPG.flush();
    const raw=localStorage.getItem(WORLD),w=JSON.parse(raw);Object.assign(w,{chapter:data.days[day].id,position,view:'world',lesson:null,educationFingerprint:null,flags:{started:true,metGuide:true},triggers:{welcome:true},routes:{}});delete w.dialogue;delete w.sleepIntent;
    const next=JSON.stringify(w);await navigator.locks.request(WORLD,()=>__entryFence.commit(WORLD,raw,next,()=>localStorage.getItem(WORLD),()=>{localStorage.setItem(WORLD,next);return true;}));
   },{day,position,WORLD,data});await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);await p.waitForTimeout(120);
   assert.equal(await p.locator('#rpgDialogue').isVisible(),false,'Spawn/location entry must not open dialogue');assert.equal(await p.locator('#lessonScreen').isVisible(),false);
  }
  const noDialogue=async()=>{assert.equal(await p.locator('#rpgDialogue').isVisible(),false);assert.equal(await p.evaluate(()=>__test.state.session),null);};
  await fixture(2,{map:'house',x:12,y:16,facing:'down'});await p.keyboard.press('ArrowDown');await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.map==='village');await noDialogue();
  await fixture(2,{map:'village',x:70,y:45,facing:'up'});await p.locator('#rpgInteract').click();assert((await p.locator('#rpgDialogue h2').innerText()).includes('Hameed'));
  await p.locator('#rpgDialogue').getByRole('button',{name:'Explore first',exact:true}).click();await noDialogue();
  await p.getByText('Quick travel',{exact:true}).click();for(const loc of ['residential','nature','business'])assert(await p.locator(`[data-destination=${loc}]`).isDisabled(),'Introductory lesson lock');
  await p.locator('[data-destination=school]').click();await p.locator('#teachPanel').waitFor();assert.equal(await p.locator('#rpgDialogue').isVisible(),false,'Quick travel starts without dialogue');assert.equal(await p.evaluate(()=>__test.state.session.id),'2-school');
  await p.locator('#navWorld').click();await noDialogue();
  await fixture(4,{map:'village',x:10,y:11,facing:'up'});await p.locator('#rpgInteract').click();await d.dialogue('Begin Day 4 Home lesson');await p.locator('#teachPanel').waitFor();assert.equal(await p.evaluate(()=>__test.state.session.id),'4-residential');await p.locator('#navWorld').click();await noDialogue();
  if(width===1920){
   const outcomes=[];
   for(const method of ['npc','quick']){
    await fixture(1,{map:'village',x:10,y:11,facing:'up'});
    if(method==='npc'){await p.locator('#rpgInteract').click();await d.dialogue('Study at Home');}
    else{await p.getByText('Quick travel',{exact:true}).click();await p.locator('[data-destination=residential]').click();}
    await p.locator('#teachPanel').waitFor();const required=await p.evaluate(()=>__test.state.session.required),position=await p.evaluate(()=>__entryRPG.position);
    await d.lesson({onStep:async()=>{const bad=await p.evaluate(()=>['lessonScreen','questionBody','quizFeedback','teachPanel','grammarPanel'].filter(id=>{const e=document.getElementById(id);return e.getClientRects().length&&(e.scrollHeight>e.clientHeight+2||e.scrollWidth>e.clientWidth+2);}));assert.deepEqual(bad,[]);}});
    await noDialogue();assert.deepEqual(await p.evaluate(()=>__entryRPG.position),position);
    outcomes.push(await p.evaluate(required=>({required,xp:__test.state.progress.xp,complete:__test.state.progress.complete['1-residential'],forms:Object.values(__test.state.progress.library.acquired).flatMap(r=>r.introducedFormIds).sort()}),required));
    await p.locator('#rpgInteract').click();while(await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).count())await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).click();assert(await p.locator('#rpgDialogue').getByRole('button',{name:'Review · Study at Home',exact:true}).count());assert.equal(await p.evaluate(()=>__test.state.session),null);await p.locator('#rpgDialogue').getByRole('button',{name:'Back to village',exact:true}).click();
   }
   assert.deepEqual(outcomes[0],outcomes[1],'NPC and direct Quick travel have identical lesson pools, progress, forms and XP');
  }
  await fixture(1,{map:'village',x:10,y:11,facing:'up'});await p.evaluate(()=>__test.challenge.startChallenge(1));
  for(let i=0;i<6;i++){
   const q=await p.evaluate(()=>{const t=__test,q=t.state.session.questions[t.state.session.index];return {...q,card:t.content.wordById[q.id]};});
   const wrong=i===0||q.kind==='word'&&q.unstudied&&!q.recognition;
   if(i===0)await p.locator('#choices button').filter({hasNotText:q.card.en[0].toUpperCase()+q.card.en.slice(1)}).first().click();else if(wrong){await p.locator('#unseenRecall').fill('deliberately incorrect');await p.getByRole('button',{name:'Submit meaning',exact:true}).click();}else await answerCurrent(p);
   const expected=(q.answerPs||q.card.ps)+` (${q.card.roman}) — `+(q.answerEnglish||q.card.en);
   assert.equal(await p.locator('#quizFeedback .answer-translation').textContent(),expected);
   assert.equal(await p.locator('#quizFeedback strong').innerText(),wrong?'✗ Incorrect':'✓ Correct');
   assert.equal(await p.locator('#quizFeedback').evaluate(e=>e.children.length),['construct','dialogue'].includes(q.kind)?3:2);
   if(width===1920){assert(await p.evaluate(()=>['lessonScreen','questionBody','quizFeedback'].every(id=>{const e=document.getElementById(id);return e.scrollHeight<=e.clientHeight+2&&e.scrollWidth<=e.clientWidth+2;})));}
   const next=await p.locator('#quizNext').boundingBox();assert(next.y+next.height<=height);assert.equal(await p.evaluate(()=>scrollY),0);
   if(i===0||i===5)await p.screenshot({path:`docs/rpg/lesson-cleanup/${i===0?'incorrect':'correct'}-${width}.png`,fullPage:true});
   await p.locator('#quizNext').click();
  }
  if(width===1920){
   await p.locator('#navWorld').click();await noDialogue();const pending=await p.evaluate(()=>JSON.stringify(__test.state.progress.activeChallenge.questions));
   await p.locator('#rpgMenuButton').click();await p.getByRole('button',{name:'Due review',exact:true}).click();await p.locator('#teachPanel').waitFor();assert.equal(await p.evaluate(()=>__test.state.session.mode),'review');await d.lesson();await noDialogue();assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress.activeChallenge.questions)),pending,'Review retains the paused challenge');
  }
  assert.deepEqual(b.errors,[]);console.log('PASS lesson cleanup',width,height,'manual Day2 entry/decline, locked/direct Quick travel, Day4 teacher, no return auto-dialogue, compact correct/incorrect actual-question feedback, desktop fit; NPC/Quick progress and XP parity at 1920');
 }finally{await b.close();}
}
