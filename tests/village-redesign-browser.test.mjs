import assert from 'node:assert/strict';
import {setup} from './browser-fixture.mjs';
const WORLD='pashto-quest-rpg-world-v1',EDU='pashto-quest-rpg-education-v1';
for(const width of [375,1280]){
 const b=await setup({width,mobile:width===375,rpg:true,offline:true,transform:h=>h.replace('// @TEST_HOOK','window.__villageFence=saveFence;window.__villageInspect=()=>rpg.diagnostics(); // @TEST_HOOK')});
 const p=b.page;
 try{
 await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);
 await p.evaluate(async()=>{__test.state.progress.tutorialDone=true;__test.state.progress.xp=321;await __test.storage.save();});
 async function position(x,y){
  await p.evaluate(async({x,y,WORLD})=>{await __test.storage.settled();const raw=localStorage.getItem(WORLD),w=JSON.parse(raw);Object.assign(w,{chapter:'day-1',position:{map:'village',x,y,facing:'up'},flags:{started:true,metGuide:true},triggers:{welcome:true},view:'world',lesson:null});delete w.dialogue;const next=JSON.stringify(w);await navigator.locks.request(WORLD,()=>__villageFence.commit(WORLD,raw,next,()=>localStorage.getItem(WORLD),()=>{localStorage.setItem(WORLD,next);return true;}));},{x,y,WORLD});
  await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);await p.waitForTimeout(250);
 }
 const pos=()=>p.locator('#rpgCanvas').evaluate(c=>({x:+c.dataset.x,y:+c.dataset.y}));
 async function step(key){await p.keyboard.press(key);await p.waitForTimeout(200);}
 // A supported save landing in the new lake recovers without altering education.
 const education=await p.evaluate(k=>localStorage.getItem(k),EDU);await position(75,13);assert.deepEqual(await pos(),{x:22,y:18});assert.equal(await p.evaluate(k=>localStorage.getItem(k),EDU),education);
 // Actual Phaser dock movement and water collision, independent of model checks.
 await position(71,23);await step('ArrowUp');assert.deepEqual(await pos(),{x:71,y:22});await step('ArrowLeft');assert.deepEqual(await pos(),{x:70,y:22});await step('ArrowLeft');assert.deepEqual(await pos(),{x:70,y:22});
 // The two remaining future roads have solid, visible barriers before their map boundaries.
 for(const [x,y,key]of [[93,32,'ArrowRight'],[46,61,'ArrowDown']]){await position(x,y);await step(key);assert.deepEqual(await pos(),{x,y});}
 assert.deepEqual(b.errors,[]);console.log('PASS redesigned village browser',width,'dock, water, two road barriers, old-position recovery and unchanged educational bytes');
 }finally{await b.close();}
}
