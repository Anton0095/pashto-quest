import assert from 'node:assert/strict';
import {setup} from './browser-fixture.mjs';
import {driver} from './rpg-week1-driver.mjs';
for(const width of [375,1280]){
 const b=await setup({width,mobile:width===375,rpg:true,bridge:false,offline:true,transform:h=>h.replace('// @TEST_HOOK','window.__portrait=identity=>ui.portrait(identity);window.__diag=()=>rpg.diagnostics();window.__week1Inspect=__diag; // @TEST_HOOK')});
 const p=b.page,d=driver(p);
 async function point(tile){return p.evaluate(tile=>{const c=document.getElementById('rpgCanvas'),r=c.getBoundingClientRect(),camera=__diag().camera;return{x:r.left+(tile.x*16+8-camera.x)*r.width/c.width,y:r.top+(tile.y*16+8-camera.y)*r.height/c.height};},tile);}
 async function select(tile){await p.locator('#rpgCanvas').scrollIntoViewIfNeeded();const at=await point(tile);if(width===375)await p.touchscreen.tap(at.x,at.y);else await p.mouse.click(at.x,at.y);}
 async function waitAt(tile){await p.waitForFunction(tile=>{const c=document.getElementById('rpgCanvas');return +c.dataset.x===tile.x&&+c.dataset.y===tile.y;},tile);}
 try{
  await p.locator('#startTutorial').click();await p.waitForFunction(()=>__diag()?.version);
  assert(await p.evaluate(()=>document.querySelector('.herochar').getBoundingClientRect().top>document.getElementById('rpgCanvas').getBoundingClientRect().bottom));
  assert.equal(await p.locator('header #xpPill,header #knownPill').count(),0);
  assert(await p.evaluate(()=>__portrait('Library').classList.contains('hidden')),'World objects do not request NPC portraits');
  assert(!await p.locator('#navLibrary').isVisible());
  await p.locator('#rpgMenuButton').click();assert(await p.locator('#rpgMenu #dialectGuide').isVisible());await p.getByRole('button',{name:'Resume village',exact:true}).click();
  await select({x:22,y:20});await waitAt({x:22,y:20});
  // A new tap during a tween replans from the committed grid position.
  await select({x:25,y:20});await select({x:21,y:20});await waitAt({x:21,y:20});
  await select({x:25,y:20});await p.keyboard.press('ArrowUp');await p.waitForTimeout(450);
  assert.notDeepEqual(await d.pos(),{map:'village',x:25,y:20},'Keyboard overrides pointer route');
  const before=await d.pos();await p.locator('[data-direction=down]').click();await p.waitForTimeout(200);assert.notDeepEqual(await d.pos(),before,'Touch arrows still move');
  await select({x:24,y:20});await p.locator('#rpgLibrary').click();const paused=await d.pos();await p.waitForTimeout(300);assert.deepEqual(await d.pos(),paused);await p.locator('#libraryClose').click();await p.waitForTimeout(300);assert.deepEqual(await d.pos(),paused,'Closing a modal does not restart an old route');
  // Select Jan's tile: path to an adjacent tile and automatically face/talk.
  await select({x:23,y:18});await p.locator('#rpgDialogue').waitFor();assert.equal(await p.locator('#rpgDialogue [data-character-id]').getAttribute('data-character-id'),'muhammad-jan');assert.equal(await p.locator('#rpgDialogue [data-portrait-status]').getAttribute('data-portrait-status'),'available');await p.getByRole('button',{name:'Back to village',exact:true}).click();
  await d.tutorial();
  await p.getByText('Quick travel',{exact:true}).click();
  assert.deepEqual(await p.locator('[data-destination]').allTextContents(),['Home','Lake','Market','School']);
  await p.locator('[data-destination=nature]').click();await p.locator('#rpgDialogue').waitFor();assert.equal(await p.locator('#rpgDialogue [data-character-id]').getAttribute('data-character-id'),'saleha');await p.getByRole('button',{name:'Back to village',exact:true}).click();
  await p.getByRole('button',{name:'Day 1 challenge',exact:true}).click();await p.locator('#quizPanel').waitFor();
  const order=await p.evaluate(()=>['quizPashto','quizRoman','quizSpeak','quizPrompt'].map(id=>document.getElementById(id).getBoundingClientRect().top));assert(order.every((y,i)=>i===0||y>=order[i-1]),'Pashto, transliteration, audio, instructions order');
  const options=await p.locator('#choices button[data-answer]').evaluateAll(bs=>bs.map(b=>({text:b.textContent,answer:b.dataset.answer})));
  for(const option of options)if(/^[a-z]/.test(option.answer))assert.equal(option.text[0],option.answer[0].toUpperCase());
  assert(!/\blemmas?\b/i.test(await p.locator('body').innerText()));assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));
  assert.deepEqual(b.errors,[]);console.log('PASS overhaul',width,'mouse/touch routing, interrupt, modal pause, NPC approach, shared portraits, map hierarchy, Menu, Quick travel and Pashto prompt');
 }finally{await b.close();}
}
