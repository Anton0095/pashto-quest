import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {setup} from './browser-fixture.mjs';
import {driver,data} from './rpg-week1-driver.mjs';
mkdirSync('work/dialogue-morphology',{recursive:true});
for(const width of [1280,375]){
 const b=await setup({width,mobile:width===375,rpg:true,transform:h=>h.replace('// @TEST_HOOK','window.__week1Inspect=window.__rpgInspect=()=>rpg.diagnostics(); // @TEST_HOOK')});const p=b.page,d=driver(p);
 try{
  await d.tutorial();if(!await p.locator('[data-destination=school]').isVisible())await p.getByText('Quick travel',{exact:true}).click();await p.locator('[data-destination=school]').click();let checked=false;
  await d.lesson({onStep:async()=>{
   if(checked||!await p.locator('#teachPanel').isVisible())return;
   const card=await p.evaluate(()=>{const t=__test,s=t.state.session,id=s.studyWords[s.cardIndex];if(s.phase!=='lexical')return null;const r=t.content.LIBRARY_DATA.sourceMappings[id]?.[0];return r?{id,form:r.formId,taught:t.E.formallyTaught(t.state.progress,r.formId),index:s.cardIndex,pool:s.studyWords}:null;});
   if(!card)return;checked=true;assert(!card.taught);await p.screenshot({path:`work/dialogue-morphology/flashcard-${width}.png`});
   await d.durable();await p.reload();await p.locator('#teachPanel').waitFor();
   const restored=await p.evaluate(form=>({taught:__test.E.formallyTaught(__test.state.progress,form),index:__test.state.session.cardIndex,pool:__test.state.session.studyWords}),card.form);
   assert.deepEqual(restored,{taught:false,index:card.index,pool:card.pool});
  }});assert(checked);
  await p.locator('#rpgLibrary').click();await p.locator('#libraryEntries details').first().locator('summary').click();const text=await p.locator('#libraryEntries').textContent();assert(text.includes('Flashcard acknowledged: Day 1'));assert(text.includes('Reference only · not formally taught'));await p.screenshot({path:`work/dialogue-morphology/library-${width}.png`});await p.locator('#libraryClose').click();
  await d.actor('bilal',1);await p.locator('#rpgInteract').click();assert.match(await p.locator('#rpgDialogue h2').innerText(),/Bilal — بلال/);
  const spec=data.conversations.bilal.days[1];await p.locator('[data-response-id]').filter({hasText:spec.response.pashto}).click();await d.dialogue('Back to village');await d.durable();
  let xp=(await d.progress()).xp;await p.reload();await p.locator('#rpgInteract:enabled').waitFor();await p.locator('#rpgInteract').click();assert.match(await p.locator('#rpgDialogue h2').innerText(),/^✓ /);assert(await p.locator('[data-response-id]').filter({hasText:spec.response.pashto}).count());
  // Response buttons retain their exact Pashto label; choose an alternative if available.
  const wrong=p.locator('[data-response-id]').filter({hasNotText:spec.response.pashto});
  if(await wrong.count()){await wrong.first().click();assert.match(await p.locator('#rpgDialogue').innerText(),/له دینې سره خبرې وکړه/);await p.screenshot({path:`work/dialogue-morphology/bilal-${width}.png`});await d.dialogue('Back to village');await p.locator('#rpgInteract').click();}
  const before=await d.pos();
  const step=await p.evaluate(({data,before})=>{const map=data.maps[before.map];return [{key:'ArrowLeft',x:before.x-1,y:before.y},{key:'ArrowRight',x:before.x+1,y:before.y},{key:'ArrowDown',x:before.x,y:before.y+1}].find(t=>data.tiles[map.tiles[t.y]?.[t.x]]?.walkable&&!data.npcs.some(a=>a.schedule.some(s=>s.day===1&&s.map===before.map&&s.x===t.x&&s.y===t.y)));},{data,before});
  assert(step);await p.keyboard.press(step.key);await p.waitForTimeout(250);assert(!await p.locator('#rpgDialogue').isVisible());assert.notDeepEqual(await d.pos(),before,'initiating keyboard input moves');
  await d.actor('bilal',1);await p.locator('#rpgInteract').click();
  const click=await p.evaluate(data=>{const c=document.getElementById('rpgCanvas'),canvas=c,box=canvas.getBoundingClientRect(),diag=__rpgInspect(),map=data.maps[c.dataset.map],x=+c.dataset.x,y=+c.dataset.y;for(const [dx,dy] of [[-2,0],[2,0],[0,2],[0,-2]]){const tx=x+dx,ty=y+dy;if(!data.tiles[map.tiles[ty]?.[tx]]?.walkable)continue;const sx=box.x+(tx*16+8-diag.camera.x)*box.width/canvas.width,sy=box.y+(ty*16+8-diag.camera.y)*box.height/canvas.height;if(sx>box.x&&sx<box.right&&sy>box.y&&sy<box.bottom)return {x:sx,y:sy};}return null;},data);
  assert(click);const start=await d.pos();if(width===375)await p.touchscreen.tap(click.x,click.y);else await p.mouse.click(click.x,click.y);await p.waitForTimeout(500);assert(!await p.locator('#rpgDialogue').isVisible());assert.notDeepEqual(await d.pos(),start,'initiating pointer input moves');
  await d.durable();assert.equal((await d.progress()).xp,xp,'Bilal repetition and reference grant no XP');assert.deepEqual(b.errors,[]);console.log('PASS actual RPG form acknowledgement/reload/Library, bilingual repeatable School-unlocked Bilal and keyboard/'+(width===375?'touch':'mouse')+' dialogue interruption',width);
 }finally{await b.close();}
}
