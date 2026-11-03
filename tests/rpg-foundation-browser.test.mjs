import assert from 'node:assert/strict';
import {setup} from './browser-fixture.mjs';
for(const width of [375,1280]){
 const b=await setup({width,rpg:true,bridge:false,offline:true,transform:h=>h.replace('// @TEST_HOOK',"window.dispatchEvent(new Event('resize'));RPG_WORLD_DATA.events.welcome.messages=[{speaker:'Hidden',text:'Ineligible',condition:'afterTutorial'},...RPG_WORLD_DATA.events.welcome.lines.map((text,i)=>({speaker:i?'Saleha':'Muhammad Jan',text}))];window.__diag=()=>rpg.diagnostics();window.__flush=()=>rpg.flush();window.__dispose=()=>rpg.dispose(); // @TEST_HOOK")});const p=b.page;
 try{
  await p.locator('#startTutorial').click();await p.waitForFunction(()=>__diag()?.version);
  await p.keyboard.press('ArrowDown');await p.evaluate(()=>window.dispatchEvent(new Event('blur')));await p.waitForTimeout(220);
  assert.equal(await p.locator('#rpgCanvas').getAttribute('data-y'),'18','Blur cancels in-flight movement');
  assert((await p.evaluate(()=>__diag())).physicsPaused);await p.evaluate(()=>window.dispatchEvent(new Event('focus')));await p.waitForTimeout(160);
  await p.keyboard.press('ArrowDown');await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.y==='19');
  await p.locator('#rpgLibrary').click();await p.locator('#libraryClose').click();await p.waitForTimeout(160);await p.keyboard.press('ArrowUp');await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.y==='18');
  await p.locator('#rpgInteract').click();await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).click();await p.evaluate(()=>__flush());await p.reload();await p.locator('#rpgDialogue').waitFor();assert((await p.locator('#rpgDialogue').innerText()).includes('Use the arrows'),'Dialogue restores sequential message');assert.equal(await p.locator('#rpgDialogue h2').innerText(),'Saleha','Per-message speaker and conditional filtering');
  await p.locator('#rpgDialogue').getByRole('button',{name:'Back to village',exact:true}).click();
  const objects=(await p.evaluate(()=>__diag())).updateObjects;
  for(let i=0;i<12;i++){await p.locator('#rpgLibrary').click();await p.locator('#libraryClose').click();}
  assert.equal((await p.evaluate(()=>__diag())).updateObjects,objects);
  await p.setViewportSize({width:width===375?812:375,height:650});await p.waitForTimeout(100);assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));
  await p.evaluate(()=>__dispose());await p.evaluate(()=>{window.dispatchEvent(new Event('resize'));window.dispatchEvent(new Event('blur'));document.dispatchEvent(new Event('visibilitychange'));document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown'}));});assert.equal(await p.locator('#rpgDialogue,#rpgMenu').count(),0);assert.deepEqual(b.errors,[]);
  console.log('PASS foundation browser',width,'blur/focus, dialogue reload, repeated Library, orientation and disposed listeners');
 }finally{await b.close();}
}
const b=await setup({rpg:true,bridge:false,transform:h=>h.replace('const rpg = RPG_ENABLED ?',"const getContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...args){return this.id==='rpgCanvas'?null:getContext.apply(this,args)};const rpg = RPG_ENABLED ?")});
try{const p=b.page;await p.locator('#startTutorial').click();await p.getByText('Quick travel',{exact:true}).click();await p.getByRole('button',{name:'Begin Library tutorial',exact:true}).click();await p.locator('#tutorialInteraction button').getByText('Hello',{exact:true}).click();assert(await p.locator('#teachNext').isEnabled());assert.deepEqual(b.errors,[]);console.log('PASS recoverable Canvas failure keeps educational tutorial usable');}finally{await b.close();}
