import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {setup,answerCurrent} from './browser-fixture.mjs';
import {data,driver} from './rpg-week1-driver.mjs';
const WORLD='pashto-quest-rpg-world-v1',EDU='pashto-quest-rpg-education-v1';
for(const width of [1280,375]){
 const b=await setup({width,mobile:width===375,rpg:true,transform:h=>h.replace('// @TEST_HOOK','window.__week1Inspect=()=>rpg.diagnostics();window.__fence=saveFence;window.__ui=ui; // @TEST_HOOK')});
 const p=b.page,d=driver(p);
 try{
  async function fixture({day=1,passed=0,position={map:'house',x:12,y:15,facing:'up'},intent}={}){
   await p.evaluate(async({day,passed,position,intent,data,WORLD})=>{
    const t=__test;t.state.session=null;t.state.progress=t.progression.fresh();t.state.progress.tutorialDone=true;
    for(let n=1;n<=passed;n++)t.progression.completeChallengeOnce(t.state.progress,n,t.progression.getChallengeSpec(n).questionCount);
    await t.storage.save();
    const raw=localStorage.getItem(WORLD),w={schemaVersion:1,chapter:data.days[day].id,position,appearance:'neutral',flags:{started:true,metGuide:true},npcFlags:{},triggers:{},view:'world',lesson:null,educationFingerprint:null,...(intent?{sleepIntent:intent}:{})};
    for(const c of Object.values(data.days).filter(c=>c.day<=day))if(c.openingEvent)w.triggers[c.openingEvent]=true;
    await navigator.locks.request(WORLD,()=>__fence.commit(WORLD,raw,JSON.stringify(w),()=>localStorage.getItem(WORLD),()=>{localStorage.setItem(WORLD,JSON.stringify(w));return true;}));
   },{day,passed,position,intent,data,WORLD});
   await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);await p.locator('#worldScreen').waitFor();
  }
  const activeDay=()=>p.locator('.rpg-day').innerText();
  async function closeDialog(){await p.locator('#rpgDialogue').getByRole('button',{name:'Back to village',exact:true}).click();}
  async function bed(action){await d.pathTo({map:'house',x:17,y:10},Number((await activeDay()).match(/DAY (\d+)/)[1]));await p.locator('#rpgInteract').click();await d.dialogue(action);}
  async function clickTile(x,y){
   await p.waitForTimeout(180);const camera=await p.evaluate(()=>__week1Inspect().camera);
   const c=p.locator('#rpgCanvas'),bounds=await c.boundingBox(),size=await c.evaluate(c=>({w:c.width,h:c.height}));
   const point={x:bounds.x+(x*16+8-camera.x)*bounds.width/size.w,y:bounds.y+(y*16+8-camera.y)*bounds.height/size.h};
   assert(point.x>=bounds.x&&point.x<bounds.x+bounds.width&&point.y>=bounds.y&&point.y<bounds.y+bounds.height,'Target is visible');
   if(width===375)await p.touchscreen.tap(point.x,point.y);else await p.mouse.click(point.x,point.y);
  }
  // Public, actual entrance/exit, map and collision controls.
  await p.locator('#startTutorial').click();await fixture({position:{map:'village',x:9,y:8,facing:'up'}});
  await p.locator('#rpgCanvas').focus();await p.keyboard.press('ArrowUp');await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.map==='house');
  assert.deepEqual(await d.pos(),{map:'house',x:12,y:15});
  await d.pathTo({map:'house',x:12,y:17},1);assert.deepEqual(await d.pos(),{map:'village',x:9,y:8});
  await p.waitForTimeout(180);await p.keyboard.press('ArrowUp');await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.map==='house');
  assert.equal(await p.locator('#quickSleep').count(),0,'No next-day action before a pass');
  await bed('Sleep — Begin the next day');assert((await p.locator('#rpgDialogue').innerText()).includes('required challenge'));await closeDialog();assert((await activeDay()).includes('DAY 1 /'));
  const blocked=await d.pos();await p.waitForTimeout(180);await p.keyboard.press('ArrowRight');await p.waitForTimeout(200);assert.deepEqual(await d.pos(),blocked,'Bed footprint blocks keyboard movement');
  // Pointer/touch navigation and object approach use existing Phaser controller.
  await clickTile(16,11);await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.x==='16'&&document.getElementById('rpgCanvas').dataset.y==='11');
  await clickTile(20,8);await p.locator('#rpgDialogue').waitFor();assert((await p.locator('#rpgDialogue').innerText()).includes('Dream'));await closeDialog();
  await d.pathTo({map:'house',x:7,y:8},1);await clickTile(4,7);await p.locator('#rpgDialogue').waitFor();await d.dialogue('Open Library');await p.locator('#libraryDialog').waitFor();
  const shelf=await d.pos();await p.locator('[data-library-tab=profile]').click();assert.equal(await p.locator('#playerProfileName').inputValue(),'Player');assert.equal(await p.locator('#playerProfileGender').inputValue(),'unspecified');
  await p.locator('#playerProfileName').fill('Laghman learner');await p.locator('#playerProfileGender').selectOption('female');await p.locator('#libraryProfile button').click();await p.locator('#profileFeedback').getByText('Profile saved.',{exact:true}).waitFor();
  await p.locator('#libraryClose').click();assert.deepEqual(await d.pos(),shelf);await d.durable();await p.reload();await p.locator('#rpgCanvas[data-map=house]').waitFor();
  assert.deepEqual(await d.pos(),shelf);assert.equal((await d.progress()).playerProfile.name,'Laghman learner');assert.equal((await d.progress()).playerProfile.gender,'female');
  // Pixel-art screenshots of the actual playable scene, not design mockups.
  await d.pathTo({map:'house',x:12,y:9},1);mkdirSync('docs/rpg/house',{recursive:true});await p.screenshot({path:`docs/rpg/house/interior-${width}.png`,fullPage:true});
  await fixture({passed:1});await p.evaluate(()=>__test.challenge.startChallenge(1));await p.locator('#quizPanel').waitFor();await p.locator('#navWorld').click();
  await bed('Sleep — Begin the next day');assert((await p.locator('#rpgDialogue').innerText()).includes('paused challenge'));await closeDialog();assert((await activeDay()).includes('DAY 1 /'));assert((await d.progress()).activeChallenge);
  await fixture({passed:1});const beforeSleep=await d.progress();assert((await activeDay()).includes('DAY 1 /'),'A recorded pass does not auto-advance');
  await bed('Dream — Review previous lessons');await p.locator('#dreamMenu').waitFor();assert.deepEqual(await p.locator('[data-dream-day]').evaluateAll(bs=>bs.map(b=>b.dataset.dreamDay)),['1']);
  await p.locator('[data-dream-day="1"]').click();await p.locator('[data-dream-lesson="1-residential"]').click();await p.locator('#lessonScreen').waitFor();assert((await p.locator('#lessonEyebrow').innerText()).includes('DREAM'));
  const campaign=await p.evaluate(k=>localStorage.getItem(k),EDU),dayBefore=await activeDay(),worldBefore=await p.evaluate(k=>localStorage.getItem(k),WORLD);
  let count=0,constructed=0;
  while(await p.locator('#lessonScreen').isVisible()){
   assert(++count<150,'Dream lesson must finish');assert.equal(await p.locator('.sentence-scene').count(),0);
   if(await p.locator('#teachPanel').isVisible())await p.locator('#teachNext').click();
   else if(await p.locator('#grammarPanel').isVisible())await p.locator('#grammarNext').click();
   else{
    const construction=await p.locator('#constructionPanel').isVisible();
    if(construction)assert.equal(await p.locator('#quizFeedback .sentence-roman').count(),0,'No full romanisation before submit');
    await answerCurrent(p);
    if(construction){assert((await p.locator('#quizFeedback .sentence-roman').innerText()).length>0);constructed++;}
    await p.locator('#quizNext').click();
   }
  }
  assert(constructed>0);assert.equal(await p.evaluate(k=>localStorage.getItem(k),EDU),campaign);assert.equal(await p.evaluate(k=>localStorage.getItem(k),WORLD),worldBefore);assert.equal(await activeDay(),dayBefore);
  assert.equal(await p.locator('#resultXP').innerText(),'+0');await p.locator('#resultWorld').click();assert.equal((await d.pos()).map,'house');assert.deepEqual(await d.progress(),beforeSleep);
  // Reload discards an unfinished dream while restoring the exact house tile.
  await bed('Dream — Review previous lessons');await p.locator('#dreamMenu').waitFor();await p.locator('[data-dream-day="1"]').click();await p.locator('[data-dream-lesson="1-residential"]').click();await p.reload();await p.locator('#worldScreen').waitFor();assert.equal((await d.pos()).map,'house');assert.equal(await p.locator('#dreamExit').count(),0);
  // Shared bed/Quick Travel transition, repeated clicks and interrupted intent.
  await bed('Sleep — Begin the next day');await p.waitForFunction(()=>document.querySelector('.rpg-day').textContent.includes('DAY 2 /'));await p.locator('#sleepTransition').waitFor({state:'detached'});assert.equal((await d.progress()).xp,beforeSleep.xp);await d.dialogue('Explore first');
  assert.equal((await d.progress()).challenges[2],undefined);await p.reload();await p.locator('#worldScreen').waitFor();assert((await activeDay()).includes('DAY 2 /'));
  // Interrupt a real shared sleep after its marker is durable, before its animation finishes.
  await fixture({passed:1});await p.getByText('Quick travel',{exact:true}).click();await p.locator('#quickSleep').click();
  await p.waitForFunction(k=>!!JSON.parse(localStorage.getItem(k)).sleepIntent,WORLD);await p.reload();
  await p.waitForFunction(()=>document.querySelector('.rpg-day').textContent.includes('DAY 2 /'));await p.locator('#sleepTransition').waitFor({state:'detached'});
  assert.deepEqual(await d.pos(),{map:data.days[2].start.map,x:data.days[2].start.x,y:data.days[2].start.y},'Quick Travel and bed wake at the same chapter spawn');
  await d.dialogue('Explore first');await d.durable();assert.equal((await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),WORLD)).sleepIntent,undefined);
  await fixture({day:2,passed:2});await p.getByText('Quick travel',{exact:true}).click();await p.locator('#quickSleep').evaluate(b=>{b.click();b.click();b.click();});await p.waitForFunction(()=>document.querySelector('.rpg-day').textContent.includes('DAY 3 /'));await p.locator('#sleepTransition').waitFor({state:'detached'});assert(!await p.locator('#quickSleep').isVisible());await d.dialogue('Explore first');
  await fixture({day:2,passed:2,intent:{from:2,to:3}});await p.waitForFunction(()=>document.querySelector('.rpg-day').textContent.includes('DAY 3 /'));await p.locator('#sleepTransition').waitFor({state:'detached'});await d.dialogue('Explore first');await d.durable();await p.reload();await p.locator('#worldScreen').waitFor();assert((await activeDay()).includes('DAY 3 /'));
  await fixture({day:3,passed:2});assert((await activeDay()).includes('DAY 3 /'),'Existing already-advanced save remains on its active day');
  await fixture({day:7,passed:7});await bed('Sleep — Begin the next day');assert((await p.locator('#rpgDialogue').innerText()).includes('available story'));assert((await activeDay()).includes('DAY 7 /'));await closeDialog();
  // A valid older in-progress tutorial with a blank profile resumes after defaulting.
  await fixture();
  await p.evaluate(async({WORLD})=>{
    const t=__test;t.lessons.begin('tutorial');const lesson=JSON.parse(JSON.stringify(t.state.session,(_key,v)=>v instanceof Set?[...v]:v));
    Object.assign(lesson,{cardIndex:3,required:['g-hello','g-how','tutorial-gender','tutorial-name'],passed:['g-hello','g-how','tutorial-gender'],firstAsked:['g-hello','g-how','tutorial-gender'],earned:30});
    t.state.progress.playerProfile.name='';await t.storage.save();const education=JSON.stringify(t.state.progress);
    let hash=2166136261;for(let i=0;i<education.length;i++)hash=Math.imul(hash^education.charCodeAt(i),16777619);
    const raw=localStorage.getItem(WORLD),w=JSON.parse(raw);Object.assign(w,{view:'lesson',lesson,educationFingerprint:(hash>>>0).toString(16)+':'+education.length});
    await navigator.locks.request(WORLD,()=>__fence.commit(WORLD,raw,JSON.stringify(w),()=>localStorage.getItem(WORLD),()=>{localStorage.setItem(WORLD,JSON.stringify(w));return true;}));
  },{WORLD});
  await p.reload();await p.locator('#lessonScreen').waitFor();assert((await p.locator('#teachCount').innerText()).includes('CARD 3/4'));
  assert.equal(await p.locator('#teachPashto').innerText(),'ته کومه ژبه زده کوې؟');assert.equal(await p.evaluate(()=>__test.state.session.earned),30);assert.equal(await p.evaluate(()=>__test.state.progress.playerProfile.name),'Player');
  await p.locator('#navWorld').click();await fixture({day:7,passed:7});
  // Reusable participant roles render one/two portraits dynamically, without redundant cards.
  await p.evaluate(()=>{__test.lessons.begin('1-residential');__ui.setConversation({instructorId:'Muhammad Jan',speakerId:'Saleha',partnerId:'Saleha'});});
  assert.equal(await p.locator('#speakerIcon [data-character-id]').getAttribute('data-character-id'),'muhammad-jan');assert.equal(await p.locator('#participants [data-character-id]').getAttribute('data-character-id'),'saleha');assert((await p.locator('#participants').innerText()).includes('speaking'));
  await p.evaluate(()=>__ui.setConversation({instructorId:'Muhammad Jan',speakerId:'Muhammad Jan',partnerId:'Muhammad Jan'}));assert.equal(await p.locator('#participants [data-character-id]').count(),0);assert(!await p.locator('#addressTarget').isVisible());
  assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));assert.deepEqual(b.errors,[]);
  console.log('PASS house/sleep/dream',width,'entrance/exit, keyboard/pointer/touch, collisions, shared Library/profile, blocked sleep, consecutive days, duplicate taps, reload recovery, terminal boundary, isolated full dream and portraits');
 }catch(error){await p.screenshot({path:'work/house-failure.png',fullPage:true});console.error(await p.evaluate(()=>({dialog:document.querySelector('dialog[open]')?.textContent,day:document.querySelector('.rpg-day')?.textContent,errors:window.__test?.storage.problem,physics:__week1Inspect(),position:document.getElementById('rpgCanvas').dataset,world:localStorage.getItem('pashto-quest-rpg-world-v1')})));throw error;}finally{await b.close();}
}
