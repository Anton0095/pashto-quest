import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';import {mkdirSync,readFileSync}from'node:fs';import{setup}from'./browser-fixture.mjs';import{driver,data}from'./rpg-week1-driver.mjs';
const portraitIds=Object.fromEntries(Object.entries(JSON.parse(readFileSync('content/CHARACTER_PORTRAITS.json','utf8')).characters).map(([id,c])=>[c.name,id]));
async function play(route){
 const width=route==='normal'?1280:375;
 const b=await setup({width,mobile:route==='skip',rpg:true,bridge:false,offline:true,transform:h=>h.replace('const audio = createAudio({',route==='skip'?"Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},getVoices(){return[];},speak(){throw Error('Unavailable');},addEventListener(){},removeEventListener(){}}});const audio = createAudio({":'const audio = createAudio({').replace('// @TEST_HOOK','window.__week1Inspect=()=>rpg.diagnostics();window.__inputLog=[];document.addEventListener("keydown",e=>{__inputLog.push({key:e.key,prevented:e.defaultPrevented,repeat:e.repeat,target:e.target.id,focus:document.hasFocus(),hidden:document.hidden});if(__inputLog.length>20)__inputLog.shift();}); // @TEST_HOOK')});const p=b.page,d=driver(p);
 try{
  await p.evaluate(()=>localStorage.setItem('pashto-town-days-v1','untouched-production'));await d.tutorial();
  for(let day=1;day<=7;day++){
   const c=data.days[day];assert((await p.locator('#rpgCanvas').getAttribute('data-map')));console.log('START',route,'day',day);
   if(day>1){
    await p.locator('#rpgDialogue').waitFor();if(day===2){await d.durable();const before=await p.locator('#rpgDialogue').innerText();await p.reload();await p.locator('#rpgDialogue').waitFor();assert.equal(await p.locator('#rpgDialogue').innerText(),before,'Opening dialogue resumes without duplicate dispatch');}
    if(day===6)assert((await p.locator('#rpgDialogue').innerText()).includes('Mina'));
    if(route==='normal'){await d.dialogue(`Begin Day ${day} ${{school:'School',nature:'Lake',residential:'Home',business:'Market'}[c.lessons.find(id=>id.endsWith({2:'school',3:'nature',4:'residential',5:'school',6:'nature',7:'business'}[day])).split('-')[1]]} lesson`);await d.lesson({reload:day===2});}
    else {await d.dialogue('Explore first');if(day===2){assert(await p.locator('[data-destination=school]').isEnabled());for(const loc of ['residential','nature','business'])assert(await p.locator('[data-destination='+loc+']').isDisabled(),'Quick travel preserves the School opening lock');}}
   }
   if(route==='normal'){
    for(const id of c.lessons){const loc=id.split('-')[1];
     if((await d.progress()).complete[`${day}-${loc}`])continue;
     const {npc,slot}=await d.lessonActor(id,day);await d.actor(npc.id,day);const event=slot.event??npc.event;await d.talk(data.events[event].actions.find(a=>a.type==='lesson'&&a.lessonId===`${day}-${loc}`).label);await d.lesson();console.log('PASS public lesson',day,loc);
    }
    const s=await d.progress();for(const id of c.lessons)assert(s.complete[id]);
   }else{const s=await d.progress();assert(c.lessons.every(id=>!s.complete[id]),'Skip creates no early visit completion');}
   if(day===6&&route==='normal')assert.equal(await p.locator('[data-destination=nature]').textContent(),'Hills');
   const hostMap=c.challenge.map??'village';await d.actor(c.challenge.npc,day,hostMap);
   if(day===2){
    // Stress the unresolved School interaction using the real completed/reloaded route.
    await d.actor('hameed',day);for(let i=0;i<6;i++){await p.locator('#rpgLibrary').click();await p.locator('#libraryClose').click();const before=await d.pos();await p.keyboard.press('ArrowUp');await p.waitForTimeout(180);assert.deepEqual(await d.pos(),before,'Ms Hameed blocks the attempted move before interaction');if(route==='skip')await p.locator('#rpgInteract').tap();else await p.keyboard.press('e');await p.locator('#rpgDialogue').waitFor();await p.locator('#rpgDialogue').getByRole('button',{name:'Back to village',exact:true}).click();}await d.durable();await p.reload();await p.locator('#worldScreen').waitFor();await p.locator('#rpgInteract:enabled').waitFor();await d.actor(c.challenge.npc,day,hostMap);
   }
   if(day===6){mkdirSync('work/overhaul',{recursive:true});await p.screenshot({path:`work/overhaul/hills-${route}.png`,fullPage:true});const xpBefore=(await d.progress()).xp;await d.mapTo('village',day);assert.equal((await d.pos()).map,'village','Walking exit from Hills works');await d.actor(c.challenge.npc,day,'hills');assert(!await p.locator('#rpgDialogue').isVisible(),'Completed arrival does not replay on re-entry');assert.equal((await d.progress()).xp,xpBefore);}
   if(day>1&&route==='normal'){
    const label=data.events[`day${day}-${{2:'residential',3:'business',4:'residential',5:'nature',6:'hills',7:'school'}[day]}`]?.actions.find(a=>a.type==='event'&&a.event===c.routes.normal.finale)?.label;
    assert(label);await p.locator('#rpgInteract').click();await d.dialogue(label);
    if([5,6,7].includes(day)){const speakers=[];while(await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).count()){speakers.push(await p.locator('#rpgDialogue h2').innerText());assert.equal(await p.locator('#rpgDialogue [data-character-id]').getAttribute('data-character-id'),portraitIds[speakers.at(-1).split(' → ')[0]]);await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).click();}speakers.push(await p.locator('#rpgDialogue h2').innerText());assert.equal(await p.locator('#rpgDialogue [data-character-id]').getAttribute('data-character-id'),portraitIds[speakers.at(-1).split(' → ')[0]]);assert(new Set(speakers).size>=2,'Multi-character scene');}
    if([5,7].includes(day)){mkdirSync('work/overhaul',{recursive:true});await p.screenshot({path:`work/overhaul/scene-day${day}.png`,fullPage:true});}
    await d.dialogue(`Start Day ${day} ${day===7?'examination':'challenge'}`);
   }else{
    await d.talk(`Day ${day} challenge · ${day===7?25:15} questions`);if(day>1)await d.dialogue('Start early challenge');
   }
   await p.locator('#quizPanel').waitFor();
   if(day===1&&route==='skip'){await p.locator('#quizSpeak').click();await p.waitForFunction(()=>document.getElementById('audioStatus').textContent.includes('Browser speech could not start'));}
   if(route==='skip'&&[3,7].includes(day)){await d.assessment(day,{fail:true,reload:true});assert(!(await d.progress()).challenges[day].passed);for(const id of c.lessons)assert(!(await d.progress()).complete[id]);await p.locator('#resultReplay').click();}
   await d.assessment(day,{reload:[2,6,7].includes(day)});let s=await d.progress();assert(s.challenges[day].passed);for(const id of c.lessons)assert(s.complete[id]);
   if(day>1)await d.dialogue(day===7?'Finish Week 1':`Finish Day ${day}`);
   await d.durable();let xp=(await d.progress()).xp;await p.reload();await p.locator('#resultScreen').waitFor();assert.equal((await d.progress()).xp,xp);assert(!await p.locator('#rpgDialogue').isVisible(),'Completed ending never reopens');
   if(day<7){
    await p.locator('#rpgCompletionExtra').getByRole('button',{name:'Go home',exact:true}).click();
    assert.equal((await d.pos()).map,'house');
    assert((await p.locator('.rpg-day').innerText()).includes('DAY '+day+' /'),'Challenge pass keeps the active day');
    if(!await p.locator('#quickSleep').isVisible())await p.getByText('Quick travel',{exact:true}).click();await p.locator('#quickSleep').click();
    await p.locator('#rpgDialogue').waitFor();await p.locator('#sleepTransition').waitFor({state:'detached'});
    await d.durable();assert.equal((await d.progress()).xp,xp,'Sleep awards no duplicate XP');const position=await d.pos();assert.deepEqual(position,{map:'house',x:17,y:10});
   }
   else{assert.equal(await p.locator('#rpgAdvance').count(),0);assert.equal(await p.locator('#resultHeading').innerText(),'Pashto Quest — Week 1 Complete');assert((await p.locator('#resultKnowledge').innerText()).includes('Level 10 · New Resident'));assert.equal(await p.locator('#resultXPLabel').innerText(),'Total XP');assert.equal(await p.locator('#resultKnowledgeLabel').innerText(),'Current level and title');assert.equal(s.challenges[7].best,25);assert(!s.challenges[8]);mkdirSync('work/overhaul',{recursive:true});await p.screenshot({path:`work/overhaul/graduation-${route}.png`,fullPage:true});await p.locator('#resultWorld').click();await p.locator('#rpgLibrary').click();await p.locator('#libraryClose').click();await d.durable();assert.equal((await d.progress()).xp,xp);}
   console.log('PASS public Week1',route,'day',day,'XP',(await d.progress()).xp);
  }
  // Completed-day selectors retain the active campaign chapter and canonical rewards.
  const finalXP=(await d.progress()).xp;
  for(const visit of [1,2,3,4,5,6,7,1,7]){
   await p.locator('#rpgMenuButton').click();
   if(!await p.getByRole('button',{name:'Dream Day '+visit,exact:true}).isVisible())await p.getByText('Dream — Review completed days',{exact:true}).click();
   await p.getByRole('button',{name:'Dream Day '+visit,exact:true}).click();await p.locator('#dreamMenu').waitFor();
   assert.equal(await p.locator('[data-dream-lesson]').count(),4);assert((await p.locator('.rpg-day').innerText()).includes('DAY 7 /'));
   await p.locator('#dreamMenu').getByRole('button',{name:'Return to house',exact:true}).click();
   assert.equal((await d.pos()).map,'house');assert.equal((await d.progress()).xp,finalXP);
  }
  await p.locator('#rpgMenuButton').click();await p.getByRole('button',{name:'Journey results',exact:true}).click();assert.equal(await p.locator('#resultHeading').innerText(),'Pashto Quest — Week 1 Complete');assert.equal(await p.locator('#rpgAdvance').count(),0);
  assert.equal(await p.evaluate(()=>localStorage.getItem('pashto-town-days-v1')),'untouched-production');assert.deepEqual(b.errors,[]);assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));
 }catch(error){console.error('Week1 route failure',route,await p.evaluate(()=>({diag:window.__week1Inspect(),focus:document.hasFocus(),hidden:document.hidden,inputLog:window.__inputLog,canvas:document.getElementById('rpgCanvas').dataset,dialog:document.getElementById('rpgDialogue').innerText,open:document.getElementById('rpgDialogue').open,world:localStorage.getItem('pashto-quest-rpg-world-v1')})));throw error;}finally{await b.close();}
}

// Keep CPU-heavy read-only answer oracles in separate Node loops, so one route
// cannot delay the other route's keyboard protocol while a key is held.
if(process.env.WEEK1_ROUTE)await play(process.env.WEEK1_ROUTE);
else{
 const outcomes=await Promise.allSettled(['normal','skip'].map(route=>new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[fileURLToPath(import.meta.url)],{env:{...process.env,WEEK1_ROUTE:route},stdio:'inherit'});
  child.on('error',reject);child.on('exit',(code,signal)=>code===0?resolve():reject(Error('Week1 '+route+' failed: '+(signal??code))));
 })));
 for(const outcome of outcomes)if(outcome.status==='rejected')throw outcome.reason;
}
