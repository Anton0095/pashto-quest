import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {setup} from './browser-fixture.mjs';
const data=JSON.parse(readFileSync('content/RPG_WORLD.json')),WORLD='pashto-quest-rpg-world-v1';mkdirSync('work/characters',{recursive:true});
for(const width of [1280,390]){
 const b=await setup({width,rpg:true,mobile:width===390,offline:true,transform:h=>h.replace('// @TEST_HOOK','window.__castRPG=rpg;window.__castFence=saveFence;window.__castUI=ui; // @TEST_HOOK')}),p=b.page;
 try{
  await p.setViewportSize({width,height:width===390?844:900});await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);
  async function fixture(day,position,invited=false){
   await p.evaluate(async({day,position,invited,WORLD,data})=>{const t=__test;t.state.session=null;t.state.progress=t.progression.fresh();t.state.progress.tutorialDone=true;
    for(let d=1;d<day;d++)t.progression.completeChallengeOnce(t.state.progress,d,t.progression.getChallengeSpec(d).passCount);
    await t.storage.save();await __castRPG.flush();const raw=localStorage.getItem(WORLD),w=JSON.parse(raw);Object.assign(w,{chapter:data.days[day].id,position,view:'world',lesson:null,educationFingerprint:null,flags:{started:true,metGuide:true,...(invited?{'day6-hills-invited':true}:{})},triggers:{welcome:true},routes:{}});delete w.dialogue;delete w.sleepIntent;delete w.activities;
    const next=JSON.stringify(w);await navigator.locks.request(WORLD,()=>__castFence.commit(WORLD,raw,next,()=>localStorage.getItem(WORLD),()=>{localStorage.setItem(WORLD,next);return true;}));
   },{day,position,invited,WORLD,data});await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);await p.waitForTimeout(200);
  }
  const diag=()=>p.evaluate(()=>__castRPG.diagnostics());
  const close=()=>p.locator('#rpgDialogue').getByRole('button',{name:'Back to village',exact:true}).click();
  await fixture(3,{map:'village',x:23,y:45,facing:'right'});
  const initial=await diag();await p.waitForFunction(()=>__castRPG.diagnostics().actors.find(a=>a.id==='zamir')?.moving,{},{timeout:12000});
  const before=await p.evaluate(()=>JSON.stringify(__test.state.progress));
  const point=await p.evaluate(()=>{const d=__castRPG.diagnostics(),a=d.actors.find(a=>a.id==='zamir'),c=document.getElementById('rpgCanvas'),r=c.getBoundingClientRect();return {x:r.left+(a.visual.x*16+8-d.camera.x)*r.width/c.width,y:r.top+(a.visual.y*16+8-d.camera.y)*r.height/c.height};});
  if(width===390)await p.touchscreen.tap(point.x,point.y);else await p.mouse.click(point.x,point.y);
  await p.locator('#rpgDialogue').waitFor({state:'visible',timeout:10000});assert.match(await p.locator('#rpgDialogue h2').innerText(),/Zamir/);assert.match(await p.locator('#rpgDialogue p').innerText(),/several.*stalls/);
  const paused=await diag();await p.waitForTimeout(600);assert.deepEqual((await diag()).actors,paused.actors,'Dialogue freezes routines');assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress)),before,'Ambient conversation changes no educational records');
  await p.screenshot({path:`work/characters/zamir-${width}.png`,fullPage:true});await close();await p.keyboard.press('ArrowLeft');await p.waitForTimeout(200);await p.waitForFunction(()=>__castRPG.diagnostics().actors.find(a=>a.id==='zamir')?.moving,{},{timeout:12000});
  // Saved settled positions survive a paused reload; no extra idle write stream is needed.
  await p.locator('#rpgMenuButton').click();await p.waitForTimeout(100);const snapshot=await p.evaluate(async()=>{await __castRPG.flush();return JSON.parse(localStorage.getItem('pashto-quest-rpg-world-v1')).activities;});await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);const restored=await diag();for(const a of restored.actors.filter(a=>snapshot[a.id]))assert.deepEqual({x:a.x,y:a.y},{x:snapshot[a.id].x,y:snapshot[a.id].y});
  await fixture(3,{map:'village',x:76,y:27,facing:'up'});await p.locator('#rpgInteract').click();assert.match(await p.locator('#rpgDialogue h2').innerText(),/Bilal/);assert.equal(await p.locator('#rpgDialogue p').getAttribute('lang'),'ps');assert(await p.locator('#rpgDialogue .rpg-dialogue-roman').innerText());assert(!/catch|shadow|mysterious/i.test(await p.locator('#rpgDialogue p').innerText()));await close();
  await fixture(6,{map:'village',x:66,y:19,facing:'up'});await p.locator('#rpgInteract').click();assert.match(await p.locator('#rpgDialogue h2').innerText(),/Deena/);assert(!/sister Medina/.test(await p.locator('#rpgDialogue p').innerText()));await p.getByRole('button',{name:"I'll meet you in the Hills",exact:true}).click();
  await fixture(6,{map:'hills',x:35,y:24,facing:'up'},true);await p.locator('#rpgInteract').click();assert.match(await p.locator('#rpgDialogue p').innerText(),/younger sister Medina/);await p.getByRole('button',{name:'Continue',exact:true}).click();assert.match(await p.locator('#rpgDialogue h2').innerText(),/Medina/);assert.equal(await p.locator('#rpgDialogue .character-portrait').getAttribute('data-character-id'),'mina');await p.getByRole('button',{name:'Explore first',exact:true}).click();
  await p.getByText('Quick travel',{exact:true}).click();await p.locator('[data-destination=nature]').click();await p.locator('#teachPanel').waitFor();assert.equal(await p.evaluate(()=>__test.state.session.id),'6-nature');assert(!/Saleha|\bMina\b/.test(await p.locator('#lessonScreen').innerText()));await p.locator('#navWorld').click();
  await fixture(6,{map:'hills',x:38,y:24,facing:'up'},true);assert((await diag()).actors.some(a=>a.id==='mina'));await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.map==='hills');assert((await diag()).actors.some(a=>a.id==='saleha'));
  await fixture(4,{map:'village',x:68,y:49,facing:'up'});assert.deepEqual(await p.evaluate(()=>__castRPG.position),{map:'village',x:68,y:49,facing:'up'},'A vacated NPC starting tile must not reset the player position');await p.evaluate(()=>__castRPG.flush());await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);assert.equal((await p.evaluate(()=>__castRPG.position)).x,68);
  await fixture(4,{map:'village',x:73,y:54,facing:'up'});const start=await diag();await p.waitForTimeout(4500);const later=await diag();assert(later.actors.filter(a=>['nayab','sara','omar','afiya','sanaa'].includes(a.id)).some(a=>a.x!==start.actors.find(b=>b.id===a.id).x||a.y!==start.actors.find(b=>b.id===a.id).y));
  await p.screenshot({path:`work/characters/children-${width}.png`,fullPage:true});assert.equal(later.updateObjects,start.updateObjects,'Movement does not recreate actors');
  await p.evaluate(()=>__castUI.setConversation({instructorId:'Deena',speakerId:'Medina',partnerId:'Medina'}));assert.match(await p.locator('#speakerName').innerText(),/Deena/);assert.match(await p.locator('#participants').innerText(),/Medina/);assert.equal(await p.locator('#speakerIcon .character-portrait').getAttribute('data-character-id'),'saleha');
  assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));assert.equal(initial.colliders,later.colliders);assert.deepEqual(b.errors,[]);console.log('PASS living village',width,'offline cast, moving-target approach, pause/resume, routine reload, optional Bilal thread, sister introduction, lesson/Hills, child animation stability and old saved presentation names');
 }finally{await b.close();}
}
