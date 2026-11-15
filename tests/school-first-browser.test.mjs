import assert from 'node:assert/strict';
import {mkdirSync,readFileSync} from 'node:fs';
import {setup} from './browser-fixture.mjs';
import {driver} from './rpg-week1-driver.mjs';
mkdirSync('work/school-first',{recursive:true});
for(const [width,day] of [[1280,1],[1280,2],[1280,3],[1280,6],[375,1],[375,6]]){
 const fixture=day===1?'':`if(!state.progress.tutorialDone){state.progress=progression.fresh();state.progress.tutorialDone=true;for(let d=1;d<${day};d++)progression.completeChallengeOnce(state.progress,d,progression.getChallengeSpec(d).questionCount);state.day=${day};}RPG_WORLD_DATA.firstDay=${day};`;
 const b=await setup({width,mobile:width===375,rpg:true,offline:true,transform:h=>h.replace('const rpg = RPG_ENABLED ?',fixture+'const rpg = RPG_ENABLED ?').replace('// @TEST_HOOK','window.__week1Inspect=()=>rpg.diagnostics(); // @TEST_HOOK')});
 const p=b.page,d=driver(p);
 try{
  await p.setViewportSize({width,height:width===375?812:900});
  if(day===1)await d.tutorial();else await p.locator('#rpgCanvas').waitFor();
  const quick=async()=>{if(!await p.locator('[data-destination=school]').isVisible())await p.getByText('Quick travel',{exact:true}).click();};
  await quick();for(const loc of ['residential','nature','business'])assert(await p.locator(`[data-destination=${loc}]`).isDisabled());
  assert.equal(await p.getByRole('button',{name:'Skip to daily challenge',exact:true}).count(),0);
  const blocked=await p.evaluate(day=>{const t=__test,before=t.state.session;t.lessons.begin(day+'-residential');t.challenge.startChallenge(day);return t.state.session===before&&!t.state.progress.activeChallenge;},day);assert(blocked,'Shared direct starters preserve School gate');
  // Before School, NPC conversation stays available without completing a lesson.
  await d.actor('jan-home',day);await p.locator('#rpgInteract').click();while(await p.getByRole('button',{name:'Continue',exact:true}).count())await p.getByRole('button',{name:'Continue',exact:true}).click();
  assert((await p.locator('#rpgDialogue').innerText()).match(/Visit .+ — Ms Hameed — حمید first/));
  assert.equal(await p.locator('#rpgDialogue').getByRole('button',{name:'Study at Home',exact:true}).count(),0);
  await p.locator('#rpgDialogue').getByRole('button',{name:'Back to village',exact:true}).click();
  assert(!(await d.progress()).complete[day+'-school']);
  await quick();await p.locator('[data-destination=school]').click();await p.locator('#lessonScreen').waitFor();
  await d.lesson({onStep:async()=>{assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));}});
  const afterSchool=await d.progress();assert(afterSchool.complete[day+'-school']);for(const loc of ['residential','nature','business'])assert(!afterSchool.complete[day+'-'+loc]);
  await quick();for(const loc of ['residential','nature','business'])assert(await p.locator(`[data-destination=${loc}]`).isEnabled());
  assert(await p.getByRole('button',{name:'Skip to daily challenge',exact:true}).isVisible());
  const study=async loc=>{await quick();await p.locator(`[data-destination=${loc}]`).click();await p.locator('#teachPanel').waitFor();await d.lesson();};
  if(day===1||day===3)for(const loc of ['business','nature','residential'])await study(loc);
  if(day===2)await study('residential');
  if(day===6){
   await quick();await p.locator('[data-destination=residential]').click();await p.locator('#rpgDialogue').waitFor();await d.dialogue("I'll meet you in the Hills");
   await study('residential');assert.equal((await d.pos()).map,'hills','Home teaching can move to Hills without becoming Nature');
   assert(!(await d.progress()).complete['6-nature']);
  }
  await quick();const allDone=(day===1||day===3);
  await p.getByRole('button',{name:allDone?'Day '+day+' challenge':'Skip to daily challenge',exact:true}).click();
  if(day>1)await d.dialogue(allDone?'Start Day '+day+' challenge':'Start early challenge');
  await p.locator('#quizPanel').waitFor();
  if(day===2||day===6){await d.assessment(day,{fail:true});const failed=await d.progress();assert(!failed.challenges[day].passed);assert(failed.complete[day+'-school']);assert(!failed.complete[day+'-nature']&&!failed.complete[day+'-business']);
   const skipped=await p.evaluate(day=>{const t=__test;return ['nature','business'].flatMap(loc=>t.state.progress.library.plans[day].locationAssignments[loc]).map(id=>({id,banked:t.E.inBank(t.state.progress,id)}));},day);
   assert(skipped.every(word=>!word.banked));await p.locator('#resultWorld').click();await p.locator('#rpgLibrary').click();
   for(const {id} of skipped)assert.equal(await p.locator('[data-lemma="'+id+'"]').count(),0,'Failure does not award skipped Bank entries');
   await p.locator('#libraryClose').click();await quick();await p.getByRole('button',{name:'Skip to daily challenge',exact:true}).click();await p.locator('#quizPanel').waitFor();}
  await d.assessment(day,{reload:true});if(day>1)await d.dialogue('Finish Day '+day);await d.durable();
  const passed=await d.progress();for(const loc of ['school','residential','nature','business'])assert(passed.complete[day+'-'+loc]);
  const xp=passed.xp;await p.reload();await p.locator('#resultScreen').waitFor();assert.equal((await d.progress()).xp,xp);
  await p.screenshot({path:`work/school-first/day-${day}-${width}.png`});
  await p.getByRole('button',{name:'Go home',exact:true}).click();await quick();await p.locator('#quickSleep').click();await p.waitForFunction(day=>document.querySelector('.rpg-day')?.textContent.includes('DAY '+(day+1)+' /'),day);await p.locator('#sleepTransition').waitFor({state:'detached'});await d.durable();
  assert((await p.locator('.rpg-day').innerText()).includes('DAY '+(day+1)+' /'));assert.equal((await d.progress()).xp,xp);
  await quick();assert(await p.locator('[data-destination=school]').isEnabled());for(const loc of ['residential','nature','business'])assert(await p.locator(`[data-destination=${loc}]`).isDisabled());
  assert.deepEqual(b.errors,[]);console.log('PASS School-first browser',width,day,'NPC/direct/Quick gates, real lessons, challenge, reload, rewards, sleep and next-day School');
 }catch(e){console.error('School-first browser failure',day,width,await p.locator('body').innerText(),b.errors);throw e;}finally{await b.close();}
}
