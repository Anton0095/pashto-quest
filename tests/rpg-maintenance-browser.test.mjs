import assert from 'node:assert/strict';
import {setup} from './browser-fixture.mjs';
const WORLD='pashto-quest-rpg-world-v1';
for(const width of [375,1280]){
 const b=await setup({width,mobile:width===375,rpg:true,transform:h=>h.replace('// @TEST_HOOK','window.__rpg=rpg;window.__fence=saveFence; // @TEST_HOOK')});
 const p=b.page;
 try{
  // A supported pass restored before alternate-story acknowledgement must not bypass it.
  await p.evaluate(async()=>{
   const t=__test;t.state.progress.tutorialDone=true;for(let day=1;day<=2;day++)t.progression.completeChallengeOnce(t.state.progress,day,15);await t.storage.save();
   const key='pashto-quest-rpg-world-v1',raw=localStorage.getItem(key),w={schemaVersion:1,chapter:'day-2',position:{map:'house',x:12,y:15,facing:'up'},appearance:'neutral',flags:{started:true,metGuide:true},npcFlags:{},triggers:{'day2-opening':true},view:'world',lesson:null,educationFingerprint:null};
   await navigator.locks.request(key,()=>__fence.commit(key,raw,JSON.stringify(w),()=>localStorage.getItem(key),()=>{localStorage.setItem(key,JSON.stringify(w));return true;}));
  });
  await p.reload();await p.locator('#worldScreen').waitFor();
  const before=await p.evaluate(()=>({xp:__test.state.progress.xp,challenges:JSON.stringify(__test.state.progress.challenges)}));
  await p.getByText('Quick travel',{exact:true}).click();await p.locator('#quickSleep').click();await p.locator('#rpgDialogue').waitFor();
  assert((await p.locator('.rpg-day').innerText()).includes('DAY 2 /'));assert((await p.locator('#rpgDialogue').innerText()).includes('Acknowledge the alternate story route'));
  await p.getByRole('button',{name:'Acknowledge the alternate story route',exact:true}).click();
  await p.locator('#quickSleep').click();await p.getByRole('button',{name:'Finish Day 2',exact:true}).waitFor();
  assert((await p.locator('.rpg-day').innerText()).includes('DAY 2 /'),'Pending ending is presented before transfer');
  await p.getByRole('button',{name:'Finish Day 2',exact:true}).click();await p.getByRole('button',{name:'Go home',exact:true}).click();
  if(!await p.locator('#quickSleep').isVisible())await p.getByText('Quick travel',{exact:true}).click();await p.locator('#quickSleep').click();
  await p.waitForFunction(()=>document.querySelector('.rpg-day').textContent.includes('DAY 3 /'));await p.locator('#sleepTransition').waitFor({state:'detached'});
  assert.deepEqual(await p.evaluate(()=>({xp:__test.state.progress.xp,challenges:JSON.stringify(__test.state.progress.challenges)})),before,'Acknowledgement and sleep never fabricate grades/rewards');
  assert(!await p.locator('#rpgDialogue').isVisible(),'Wake does not auto-open a lesson');await p.evaluate(()=>__rpg.flush());
  // Dispose while a world commit is pending; its continuation must not reopen a removed dialog.
  await p.evaluate(()=>{
   const commit=__fence.commit.bind(__fence);let delayed=false;
   __fence.commit=async(...args)=>{if(!delayed&&args[0]==='pashto-quest-rpg-world-v1'){delayed=true;await new Promise(resolve=>{window.__release=resolve;});}return commit(...args);};
  });
  await p.locator('#rpgMenuButton').click();await p.getByText('Dream — Review completed days',{exact:true}).click();await p.getByRole('button',{name:'Dream Day 1',exact:true}).click();await p.waitForFunction(()=>window.__release);
  await p.evaluate(()=>__rpg.dispose());await p.waitForTimeout(250);await p.evaluate(()=>__release());await p.waitForTimeout(500);
  assert.equal(await p.locator('#rpgDialogue,#rpgMenu,#dreamMenu,#sleepTransition').count(),0);assert.deepEqual(b.errors,[]);
  console.log('PASS maintenance',width,'restored story/ending gates, genuine-pass sleep, unchanged rewards and pending-commit disposal');
 }finally{await b.close();}
}
