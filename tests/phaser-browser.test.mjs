import assert from 'node:assert/strict';
import {readFileSync}from'node:fs';
import {setup}from'./browser-fixture.mjs';
for(const width of [375,1280]){
 const b=await setup({width,rpg:true,bridge:false,offline:true,transform:h=>h.replace('// @TEST_HOOK','window.__phaserDiagnostics=()=>rpg.diagnostics();window.__fixtureFence=saveFence; // @TEST_HOOK')});
 const p=b.page;
 try{
  await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser==='4.2.1');
  const pos=()=>p.locator('#rpgCanvas').evaluate(c=>({x:+c.dataset.x,y:+c.dataset.y,map:c.dataset.map}));
  const move=async(key,x,y)=>{await p.waitForTimeout(160);await p.keyboard.press(key);await p.waitForFunction(([x,y])=>+document.getElementById('rpgCanvas').dataset.x===x&&+document.getElementById('rpgCanvas').dataset.y===y,[x,y]);};
  const initial=await pos();await p.keyboard.press('ArrowRight');await p.waitForTimeout(180);assert.deepEqual(await pos(),initial,'Phaser NPC collision');
  const camera=await p.evaluate(()=>__phaserDiagnostics().camera);
  const animated=p.waitForFunction(()=>__phaserDiagnostics().moving&&Number(__phaserDiagnostics().frame)%2===1);await p.waitForTimeout(160);await p.keyboard.press('ArrowDown');await animated;await p.waitForFunction(()=>+document.getElementById('rpgCanvas').dataset.y===19);const afterCamera=await p.evaluate(()=>__phaserDiagnostics().camera);assert(afterCamera.y>camera.y,'Phaser camera follows');assert(await p.locator('#rpgInteract').isDisabled(),'Interaction requires adjacency, not diagonal distance');
  await move('ArrowLeft',21,19);await move('ArrowUp',21,18);await move('ArrowRight',22,18);
  await p.locator('#rpgInteract').click();await p.keyboard.down('ArrowDown');await p.waitForTimeout(350);await p.keyboard.up('ArrowDown');assert.deepEqual(await pos(),initial);assert(await p.evaluate(()=>__phaserDiagnostics().physicsPaused));
  await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).click();await p.locator('#rpgDialogue').getByRole('button',{name:'I will meet you at the Library',exact:true}).click();
  async function placeFixture(position){await p.waitForTimeout(300);await p.evaluate(async position=>{const k='pashto-quest-rpg-world-v1',current=localStorage.getItem(k),w=JSON.parse(current);w.position=position;w.view='world';await navigator.locks.request(k,()=>__fixtureFence.commit(k,current,JSON.stringify(w),()=>localStorage.getItem(k),()=>{localStorage.setItem(k,JSON.stringify(w));return true;}));},position);await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser==='4.2.1');}
  await placeFixture({map:'village',x:92,y:60,facing:'up'});const size=await p.locator('#rpgCanvas').evaluate(c=>({w:c.width,h:c.height}));await p.waitForFunction(({w,h})=>{const c=__phaserDiagnostics().camera;return c.x===1536-w&&c.y===1024-h;},size);
  await placeFixture({map:'village',x:60,y:8,facing:'right'});await p.keyboard.press('ArrowRight');await p.waitForTimeout(200);assert.equal((await pos()).x,60,'Phaser tilemap water collision');assert((await p.evaluate(()=>__phaserDiagnostics())).colliders>=2);
  await placeFixture({map:'village',x:24,y:16,facing:'up'});await p.keyboard.press('ArrowUp');await p.keyboard.press('l');await p.locator('#libraryDialog').waitFor({state:'visible'});await p.waitForTimeout(220);assert.deepEqual(await pos(),{map:'village',x:24,y:16},'Opening Library cancels an in-flight entrance step');assert.deepEqual((await p.evaluate(()=>__phaserDiagnostics())).player,{x:24,y:16});await p.locator('#libraryClose').click();await p.waitForTimeout(160);await p.keyboard.press('ArrowUp');await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.map==='library');
  await p.waitForTimeout(160);await p.keyboard.press('ArrowDown');await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.map==='village');
  await p.waitForTimeout(180);const baselineObjects=(await p.evaluate(()=>__phaserDiagnostics())).updateObjects;
  for(let i=0;i<10;i++){
   await p.waitForTimeout(160);await p.keyboard.press('ArrowUp');await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.map==='library');
   await p.waitForTimeout(160);await p.keyboard.press('ArrowDown');await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.map==='village');
  }
  await p.waitForTimeout(180);assert.equal((await p.evaluate(()=>__phaserDiagnostics())).updateObjects,baselineObjects,'Map transitions release Phaser groups/update-list entries');
  // Re-enter Library, approach the tutorial NPC, and verify the HTML overlay retains the world.
  await p.waitForTimeout(160);await p.keyboard.press('ArrowUp');await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.map==='library');
  await move('ArrowLeft',5,8);await move('ArrowUp',5,7);await move('ArrowUp',5,6);await move('ArrowRight',6,6);
  await p.locator('#rpgInteract').click();await p.getByRole('button',{name:'Begin Library tutorial',exact:true}).click();
  assert(await p.locator('#lessonScreen').isVisible());assert(await p.locator('#worldScreen').isVisible());assert(await p.evaluate(()=>getComputedStyle(document.getElementById('lessonScreen')).position==='fixed'));
  const paused=await pos();await p.keyboard.press('ArrowDown');await p.waitForTimeout(200);assert.deepEqual(await pos(),paused);assert(await p.evaluate(()=>__phaserDiagnostics().physicsPaused));
  assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));assert.deepEqual(b.errors,[]);
  console.log('PASS Phaser',width,'real tilemap, Arcade terrain/NPC collision, 4-way movement, camera, transitions, paused HTML overlay and offline bundle');
  await p.locator('#navWorld').click();p.once('dialog',d=>d.accept());await p.locator('#rpgMenuButton').click();await p.locator('#resetProgress').click();await p.locator('#startTutorial').click();await p.waitForFunction(()=>__phaserDiagnostics().player.x===22&&__phaserDiagnostics().player.y===18);assert.deepEqual(await pos(),{x:22,y:18,map:'village'},'Same-map reset synchronizes the Phaser body and save');
  if(width===375){
   const context=await b.browser.newContext({viewport:{width:375,height:812},deviceScaleFactor:3,isMobile:true,hasTouch:true});
   const touch=await context.newPage();const touchErrors=[];touch.on('pageerror',e=>touchErrors.push(e.message));await touch.goto(b.url);
   await touch.locator('#startTutorial').tap();await touch.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser==='4.2.1');
   await touch.locator('[data-direction=down]').tap();await touch.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.y==='19');
   await touch.locator('[data-direction=up]').tap();await touch.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.y==='18');
   await touch.locator('#rpgInteract').tap();assert(await touch.locator('#rpgDialogue').isVisible());assert.deepEqual(touchErrors,[]);await context.close();
   console.log('PASS Phaser touch emulation: 375px, DPR3, pointer capture and dialogue; not physical Safari');
  }
 }finally{await b.close();}
}

const layered=JSON.parse(readFileSync('content/RPG_WORLD.json','utf8'));
layered.maps.village.collision=layered.maps.village.tiles.map(row=>'0'.repeat(row.length));
layered.maps.village.collision[19]='0'.repeat(22)+'1'+'0'.repeat(layered.maps.village.tiles[0].length-23);
const extra=await setup({width:375,rpg:true,bridge:false,transform:h=>h.replace(/const RPG_WORLD_DATA=(\{.*?\});/s,()=> 'const RPG_WORLD_DATA='+JSON.stringify(layered)+';').replace('// @TEST_HOOK','window.__extraDiagnostics=()=>rpg.diagnostics(); // @TEST_HOOK')});
try{
 const p=extra.page;await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser==='4.2.1');
 await p.keyboard.press('ArrowDown');await p.waitForTimeout(250);assert.equal(await p.locator('#rpgCanvas').getAttribute('data-y'),'18');assert.equal(await p.evaluate(()=>__extraDiagnostics().colliders),3);
 await p.keyboard.press('ArrowLeft');await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.x==='21');assert.deepEqual(extra.errors,[]);
 console.log('PASS Phaser optional collision layer blocks walkable terrain without changing tile art');
}finally{await extra.close();}
