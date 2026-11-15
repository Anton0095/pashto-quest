import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {setup} from './browser-fixture.mjs';
const WORLD='pashto-quest-rpg-world-v1',label='Laghman Hills - South Saykanda';
mkdirSync('work/hills-entrances',{recursive:true});
for(const width of [1280,390]){
 const b=await setup({width,mobile:width===390,rpg:true,transform:html=>html.replace('// @TEST_HOOK','window.__entranceRPG=rpg;window.__entranceFence=saveFence; // @TEST_HOOK')}),p=b.page;
 try{
  await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);
  await p.evaluate(async()=>{__test.state.progress.tutorialDone=true;await __test.storage.save();await __entranceRPG.flush();});
  async function place(position){
   await p.evaluate(async({position,WORLD})=>{await __entranceRPG.flush();const raw=localStorage.getItem(WORLD),w=JSON.parse(raw);Object.assign(w,{chapter:'day-1',position,flags:{started:true,metGuide:true},triggers:{welcome:true},view:'world',lesson:null});delete w.dialogue;const next=JSON.stringify(w);await navigator.locks.request(WORLD,()=>__entranceFence.commit(WORLD,raw,next,()=>localStorage.getItem(WORLD),()=>{localStorage.setItem(WORLD,next);return true;}));},{position,WORLD});
   await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);
  }
  for(let lane=0;lane<5;lane++){
   await place({map:'village',x:44+lane,y:1,facing:'up'});
   const before=await p.evaluate(async()=>{await __entranceRPG.flush();return JSON.stringify(__test.state.progress);});
   await p.locator('[data-direction=up]').press('Enter');
   await p.waitForFunction(x=>{const c=document.getElementById('rpgCanvas');return c.dataset.map==='hills'&&+c.dataset.x===x&&+c.dataset.y===45;},30+lane);
   await p.locator('[data-direction=down]').press('Enter');await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.y==='46');
   await p.locator('[data-direction=down]').press('Enter');
   await p.waitForFunction(x=>{const c=document.getElementById('rpgCanvas');return c.dataset.map==='village'&&+c.dataset.x===x&&+c.dataset.y===2;},44+lane);
   assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress)),before,'all lanes preserve educational state');
  }
  await place({map:'hills',x:30,y:44,facing:'up'});
  await p.screenshot({path:`work/hills-entrances/sign-${width}.png`,fullPage:true});
  await p.locator('#rpgInteract').click();assert.equal(await p.locator('#rpgDialogue p').innerText(),label);await p.locator('#rpgDialogue').getByRole('button',{name:'Back to village',exact:true}).click();
  await p.evaluate(()=>__entranceRPG.flush());await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);await p.locator('#rpgInteract').click();assert.equal(await p.locator('#rpgDialogue p').innerText(),label);
  assert.deepEqual(b.errors,[]);console.log('PASS Hills entrances',width,'all five lanes in both directions, matching safe arrivals, zero educational writes and exact wooden-sign wording/reload');
 }finally{await b.close();}
}
