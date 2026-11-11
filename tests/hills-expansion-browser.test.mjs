import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {setup,answerCurrent} from './browser-fixture.mjs';
import {runtime,reset,plain,study} from './runtime-fixture.mjs';
import {driver} from './rpg-week1-driver.mjs';
const data=JSON.parse(readFileSync('content/RPG_WORLD.json')),WORLD='pashto-quest-rpg-world-v1';
mkdirSync('work/hills',{recursive:true});
const model=runtime();reset(model);for(let d=1;d<=5;d++){for(const loc of model.content.zoneKeys)study(model,d,loc);model.progression.completeChallengeOnce(model.state.progress,d,15);}
const day6=plain(model.state.progress);
for(const width of [1280,390]){
 const b=await setup({width,mobile:width===390,rpg:true,transform:h=>h.replace('// @TEST_HOOK',`window.__hillsRPG=rpg;window.__hillsFence=saveFence;window.__week1Inspect=()=>rpg.diagnostics();const hc=PashtoRPG.VillageScene.prototype.create;PashtoRPG.VillageScene.prototype.create=function(){hc.call(this);window.__hillsScene=this;}; // @TEST_HOOK`)}),p=b.page,d=driver(p);
 try{
  await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);
  async function place(position,{day,profile,flags}={}){
   await p.evaluate(async({position,day,profile,flags,WORLD,data})=>{
    if(profile){__test.state.progress=profile;__test.state.session=null;await __test.storage.save();}
    await __hillsRPG.flush();const raw=localStorage.getItem(WORLD),w=JSON.parse(raw);
    if(day){w.chapter=data.days[day].id;w.flags={started:true,metGuide:true,...flags};w.triggers={};w.routes={};for(let i=1;i<=day;i++){if(!__test.progression.passedChallenge(__test.state.progress,i))continue;const c=data.days[i];if(c.openingEvent)w.triggers[c.openingEvent]=true;if(c.endingEvent)w.triggers[c.endingEvent]=true;if(c.routes){w.routes[c.id]='skip';w.triggers[c.routes.skip.event]=true;}}}
    Object.assign(w,{position,view:'world',lesson:null,educationFingerprint:null});delete w.dialogue;const next=JSON.stringify(w);
    await navigator.locks.request(WORLD,()=>__hillsFence.commit(WORLD,raw,next,()=>localStorage.getItem(WORLD),()=>{localStorage.setItem(WORLD,next);return true;}));
   },{position,day,profile,flags,WORLD,data});await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);
  }
  async function close(){await p.locator('#rpgDialogue').getByRole('button',{name:'Back to village',exact:true}).click();}
  async function finishLesson(){for(let n=0;await p.locator('#lessonScreen').isVisible();n++){
   assert(n<180);if(await p.locator('#teachPanel').isVisible())await p.locator('#teachNext').click();
   else if(await p.locator('#grammarPanel').isVisible()){
    if(await p.locator('#grammarNext').isDisabled())await p.evaluate(()=>{const demo=document.querySelector('.sov-demo[data-example-id]'),id=demo.dataset.exampleId,card=__test.content.wordById[id]||__test.S.restoreId(__test.content.LIBRARY_DATA,__test.content.LIBRARY_DATA.sentenceFrames,id);for(const token of card.ps.replace(/[.!؟،]/g,'').split(/\s+/)){[...demo.querySelectorAll('.word-tiles button:enabled')].find(b=>b.textContent===token)?.click();}[...demo.querySelectorAll('button')].find(b=>b.textContent==='Check sentence')?.click();});
    await p.locator('#grammarNext').click();
   }else{await answerCurrent(p);await p.locator('#quizNext').click();}
  }await p.locator('#resultWorld').click();assert(!await p.locator('#rpgDialogue').isVisible());}
  // Both actual tutorial paths unlock the northern route without visits or extra learning writes.
  for(const skip of [true,false]){
   if(!skip){const fresh=runtime();await place({map:'village',x:23,y:19,facing:'up'},{day:1,profile:plain(fresh.state.progress)});}
   if(skip){await p.locator('#rpgInteract').click();await d.dialogue('Skip tutorial');}
   else{await p.getByText('Quick travel',{exact:true}).click();await p.getByRole('button',{name:'Begin Library tutorial',exact:true}).click();for(const answer of ['Hello','How are you?','پښتو']){await p.locator('#tutorialInteraction button').getByText(answer,{exact:true}).click();await p.locator('#teachNext').click();}await p.locator('#tutorialName').fill('Muhammad Jan');await p.locator('#tutorialSaveName').click();await p.locator('#teachNext').click();await p.locator('#resultWorld').click();}
   await d.dialogue('Explore the village');await place({map:'village',x:46,y:2,facing:'up'});
   const before=await p.evaluate(async()=>{await __hillsRPG.flush();return JSON.stringify(__test.state.progress);});
   await d.pathTo({map:'village',x:46,y:0},1);assert.equal((await d.pos()).map,'hills');assert.deepEqual(await d.pos(),{map:'hills',x:32,y:45});
   await d.pathTo({map:'hills',x:32,y:47},1);assert.deepEqual(await d.pos(),{map:'village',x:46,y:2});assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress)),before);
  }
  // Real shared Sleep transfer begins Day 6 beside the bed, with quiet entry.
  await place({map:'house',x:17,y:10,facing:'right'},{day:5,profile:day6});await p.emulateMedia({reducedMotion:'reduce'});await p.getByText('Quick travel',{exact:true}).click();await p.locator('#quickSleep').click();await p.waitForFunction(()=>document.querySelector('.rpg-day').textContent.includes('DAY 6 /'));assert.deepEqual(await d.pos(),{map:'house',x:17,y:10});assert(!await p.locator('#rpgDialogue').isVisible());
  await place({map:'village',x:20,y:47,facing:'up'});await p.locator('#rpgInteract').click();await p.getByRole('button',{name:'Continue',exact:true}).click();assert((await p.locator('#rpgDialogue p').innerText()).includes('Go to Lake and speak with Deena'));await close();
  await place({map:'village',x:66,y:19,facing:'up'});assert(!await p.evaluate(()=>__hillsRPG.diagnostics().actors.some(n=>n.id==='mina')));
  await p.getByText('Quick travel',{exact:true}).click();await p.locator('[data-destination=nature]').click();assert(!await p.locator('#lessonScreen').isVisible(),'Quick travel offers the invitation before beginning Nature');assert(!(await p.locator('#rpgDialogue').innerText()).includes('younger sister Medina'));
  const beforeInvitation=await p.evaluate(()=>JSON.stringify(__test.state.progress));await p.getByRole('button',{name:"I'll meet you in the Hills",exact:true}).click();assert(!await p.locator('#lessonScreen').isVisible());assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress)),beforeInvitation);
  assert.equal(await p.evaluate(()=>__hillsRPG.registry.npcs(6,'village').filter(n=>['saleha','mina'].includes(n.characterId)).length),0);assert.equal(await p.evaluate(()=>__hillsRPG.registry.npcs(6,'hills').filter(n=>['saleha','mina'].includes(n.characterId)).length),2);
  await p.evaluate(()=>__hillsRPG.flush());await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);assert.equal(await p.evaluate(()=>__hillsRPG.registry.npcs(6,'hills').length),2);assert((await p.locator('[data-destination=nature]').textContent()).includes('Hills'));
  await place({map:'village',x:46,y:3,facing:'up'});await d.pathTo({map:'village',x:46,y:0},6);await d.pathTo({map:'hills',x:35,y:24},6);await p.locator('#rpgInteract').click();assert((await p.locator('#rpgDialogue p').innerText()).includes('younger sister Medina'));await p.getByRole('button',{name:'Continue',exact:true}).click();assert((await p.locator('#rpgDialogue h2').innerText()).includes('Medina'));await p.getByRole('button',{name:'Begin Day 6 Hills lesson',exact:true}).click();assert.equal(await p.evaluate(()=>__test.state.session.id),'6-nature');
  await finishLesson();assert.equal(await p.evaluate(()=>__test.state.progress.complete['6-nature']),true);assert.equal((await d.pos()).map,'hills');assert.equal(await p.evaluate(()=>__hillsRPG.registry.npcs(6,'hills').length),2);assert.equal(await p.locator('#lessonScreen').isVisible(),false,'finishing the lesson does not launch its challenge');
  // Medina starts the same lesson as a review; the acknowledged introduction is not repeated.
  await d.pathTo({map:'hills',x:38,y:24},6);await p.locator('#rpgInteract').click();assert(!(await p.locator('#rpgDialogue p').innerText()).includes('younger sister Medina'));const beforeReviewXP=await p.evaluate(()=>__test.state.progress.xp);await p.getByRole('button',{name:'Review · Study in the Hills · Nature',exact:true}).click();assert.equal(await p.evaluate(()=>__test.state.session.id),'6-nature');await finishLesson();assert.equal(await p.evaluate(()=>__test.state.progress.xp),beforeReviewXP);
  await p.screenshot({path:`work/hills/sisters-${width}.png`,fullPage:true});
  const completedXP=await p.evaluate(()=>__test.state.progress.xp);await p.evaluate(()=>__hillsRPG.flush());await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);assert.equal(await p.evaluate(()=>__test.state.progress.xp),completedXP);
  // Visible click/tap movement, camera follow, blocked scree and saved positions.
  await place({map:'hills',x:57,y:19,facing:'right'});
  async function select(tile){await p.locator('#rpgCanvas').scrollIntoViewIfNeeded();const at=await p.evaluate(tile=>{const c=document.getElementById('rpgCanvas'),r=c.getBoundingClientRect(),camera=__hillsRPG.diagnostics().camera;return{x:r.left+(tile.x*16+8-camera.x)*r.width/c.width,y:r.top+(tile.y*16+8-camera.y)*r.height/c.height};},tile);if(width===390)await p.touchscreen.tap(at.x,at.y);else await p.mouse.click(at.x,at.y);}
  await select({x:59,y:19});await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.x==='59');await p.locator('[data-direction=right]').press('Enter');await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.x==='60');await p.locator('[data-direction=right]').press('Enter');assert.equal((await d.pos()).x,60);await p.evaluate(()=>__hillsRPG.flush());await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);assert.deepEqual(await d.pos(),{map:'hills',x:60,y:19});assert(Number.isFinite(await p.evaluate(()=>__hillsRPG.diagnostics().camera.x)));
  await p.evaluate(()=>{const s=__hillsScene,cam=s.cameras.main;cam.stopFollow();cam.setBounds(0,0,1024,768);cam.setZoom(Math.min(cam.width/1024,cam.height/768));cam.centerOn(512,384);});await p.screenshot({path:`work/hills/overview-${width}.png`,fullPage:true});
  // Early challenge needs neither invitation nor visits; it uses physical Hills and frozen questions.
  await place({map:'house',x:17,y:10,facing:'right'},{day:6,profile:day6});await p.getByText('Quick travel',{exact:true}).click();await p.getByRole('button',{name:'Day 6 challenge',exact:true}).click();await p.getByRole('button',{name:'Start early challenge',exact:true}).click();await p.locator('#lessonScreen').waitFor();assert.equal(await p.evaluate(()=>__hillsRPG.position.map),'hills');assert.equal(await p.evaluate(()=>__test.state.session.questions.length),15);
  const frozen=await p.evaluate(()=>JSON.stringify(__test.state.session.questions));await answerCurrent(p);await p.evaluate(()=>__hillsRPG.flush());await p.reload();await p.locator('#lessonScreen').waitFor();assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.session.questions)),frozen);assert.equal(await p.evaluate(()=>__test.state.session.correctCount),1);await p.locator('#quizNext').click();
  while(await p.locator('#lessonScreen').isVisible()){await answerCurrent(p);await p.locator('#quizNext').click();}
  const completed=await p.evaluate(()=>({correct:__test.state.session.correctCount,done:__test.state.progress.complete,flag:JSON.parse(localStorage.getItem('pashto-quest-rpg-world-v1')).flags['day6-hills-invited']}));assert.equal(completed.correct,15);for(const loc of ['residential','nature','business','school'])assert(completed.done['6-'+loc]);assert(!completed.flag,'challenge pass does not fabricate an invitation');
  assert.deepEqual(b.errors,[]);console.log('PASS Hills browser',width,'both tutorials/north/south, Day5 sleep → Home, guidance, Lake-only invitation/quick guard/reload, physical Hills travel, sister introduction, either sister/shared lesson/review/quiet return, pointer/touch/D-pad/camera/scree/reload, early 15-item challenge/frozen resume/pass without invented invitation');
 }finally{await b.close();}
}
