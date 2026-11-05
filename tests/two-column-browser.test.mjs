import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {setup} from './browser-fixture.mjs';
mkdirSync('docs/rpg/two-column',{recursive:true});
for(const [width,height] of [[1920,1080],[1366,768],[1280,720],[768,1024],[390,844]]){
 const b=await setup({width,rpg:true,mobile:width===390,transform:h=>h.replace('// @TEST_HOOK','window.__layoutDiagnostics=()=>rpg.diagnostics(); // @TEST_HOOK')});const p=b.page;
 try{
  await p.setViewportSize({width,height});await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.querySelector('#rpgCanvas')?.dataset.phaser);
  const pos=()=>p.locator('#rpgCanvas').evaluate(c=>({x:+c.dataset.x,y:+c.dataset.y}));
  const initial=await pos();const world=await p.locator('#rpgCanvas').boundingBox(),side=await p.locator('.rpg-sidebar').boundingBox();
  assert(width>1000?side.x>=world.x+world.width:side.y>=world.y+world.height);
  const ratio=await p.locator('#rpgCanvas').evaluate(c=>c.width/c.height);assert(Math.abs(world.width/world.height-ratio)<.01);
  const bounded=async selector=>{const box=await p.locator(selector).boundingBox(),context=await p.locator('#rpgContext').boundingBox();assert(box.x>=context.x-1&&box.x+box.width<=context.x+context.width+1);assert(box.y>=context.y-1&&box.y+box.height<=context.y+context.height+1);};
  await p.keyboard.press('ArrowRight');await p.waitForTimeout(190);assert.deepEqual(await pos(),initial,'NPC collision');
  const camera=await p.evaluate(()=>__layoutDiagnostics().camera);await p.keyboard.press('ArrowDown');await p.waitForFunction(()=>document.querySelector('#rpgCanvas').dataset.y==='19');
  assert((await p.evaluate(()=>__layoutDiagnostics().camera)).y>camera.y,'Camera follows movement');
  async function clickTile(x,y){const point=await p.locator('#rpgCanvas').evaluate((c,{x,y})=>{const b=c.getBoundingClientRect(),camera=__layoutDiagnostics().camera;return {x:b.x+(x*16+8-camera.x)*b.width/c.width,y:b.y+(y*16+8-camera.y)*b.height/c.height};},{x,y});if(width===390)await p.touchscreen.tap(point.x,point.y);else await p.mouse.click(point.x,point.y);}
  await clickTile(initial.x,initial.y);await p.waitForFunction(({x,y})=>{const c=document.querySelector('#rpgCanvas');return +c.dataset.x===x&&+c.dataset.y===y;},initial);
  await p.locator('#rpgInteract').click();await bounded('#rpgDialogue');assert(await p.locator('#rpgDialogue .portrait').count()||await p.locator('#rpgDialogue .rpg-dialogue-portrait').isVisible());
  assert.deepEqual(await p.locator('#rpgCanvas').boundingBox(),world,'Dialogue leaves the world in place');
  await p.screenshot({path:`docs/rpg/two-column/dialogue-${width}.png`});
  await p.keyboard.press('ArrowDown');await p.waitForTimeout(180);assert.deepEqual(await pos(),initial,'Modal interaction pauses world movement');await p.keyboard.press('Escape');
  await p.locator('#rpgMenuButton').click();await bounded('#rpgMenu');await p.locator('#rpgMenu').getByRole('button',{name:'Resume village',exact:true}).click();
  await p.locator('#rpgLibrary').click();await bounded('#libraryDialog');await p.locator('#libraryClose').click();assert(await p.locator('#rpgLibrary').evaluate(e=>e===document.activeElement),'Library restores focus');
  await p.getByText('Quick travel',{exact:true}).click();assert(await p.getByRole('button',{name:'Begin Library tutorial',exact:true}).isVisible());
  if(width===1366){for(const size of [{width:590,height:820},{width:1280,height:720},{width,height}]){await p.setViewportSize(size);await p.waitForTimeout(120);const box=await p.locator('#rpgCanvas').boundingBox(),ratio=await p.locator('#rpgCanvas').evaluate(c=>c.width/c.height);assert(Math.abs(box.width/box.height-ratio)<.01);await clickTile(initial.x,initial.y+1);await p.waitForFunction(()=>document.querySelector('#rpgCanvas').dataset.y==='19');await clickTile(initial.x,initial.y);await p.waitForFunction(()=>document.querySelector('#rpgCanvas').dataset.y==='18');}}
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight&&scrollY===0));assert.deepEqual(b.errors,[]);
  console.log('PASS two-column layout',width,height,'aspect ratio, keyboard/pointer/touch mapping, collision/camera, right-panel portraits/dialogue, focus/escape, Menu/Library/Quick travel and responsive resize');
 }finally{await b.close();}
}
