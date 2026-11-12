import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {setup,answerCurrent} from './browser-fixture.mjs';
import {runtime,reset,study,plain} from './runtime-fixture.mjs';
const data=JSON.parse(readFileSync('content/RPG_WORLD.json')),WORLD='pashto-quest-rpg-world-v1';
mkdirSync('work/typing-bilal',{recursive:true});
const profiles={};
for(let day=1;day<=7;day++){
 const t=runtime();reset(t,8);for(let d=1;d<day;d++)t.progression.completeChallengeOnce(t.state.progress,d,t.progression.getChallengeSpec(d).passCount);
 profiles[day]={none:plain(t.state.progress)};
 study(t,day,'nature');t.state.session=null;profiles[day].lake=plain(t.state.progress);
}
for(const width of [1280,390]){
 const b=await setup({width,rpg:true,mobile:width===390,transform:h=>h.replace('// @TEST_HOOK','window.__typingRPG=rpg;window.__typingFence=saveFence; // @TEST_HOOK')}),p=b.page;
 try{
  async function fixture(day,route='none'){
   await p.evaluate(async({profile,day,route,data,WORLD})=>{
    const t=__test;t.state.progress=profile;t.state.session=null;
    if(route==='pass'||route==='failed')t.progression.completeChallengeOnce(t.state.progress,day,route==='pass'?t.progression.getChallengeSpec(day).passCount:0);
    await t.storage.save();await __typingRPG.flush();const raw=localStorage.getItem(WORLD);
    const w={schemaVersion:1,chapter:data.days[day].id,position:{map:'village',x:76,y:27,facing:'up'},appearance:'neutral',flags:{started:true,metGuide:true},npcFlags:{},triggers:{},routes:{},view:'world',lesson:null,educationFingerprint:null};
    for(let d=1;d<=day;d++){const c=data.days[d];w.triggers[c.openingEvent]=true;if(d<day||route==='pass'){w.triggers[c.endingEvent]=true;if(c.routes){w.routes[c.id]='skip';w.triggers[c.routes.skip.event]=true;}}}
    const next=JSON.stringify(w);await navigator.locks.request(WORLD,()=>__typingFence.commit(WORLD,raw,next,()=>localStorage.getItem(WORLD),()=>{localStorage.setItem(WORLD,next);return true;}));
   },{profile:profiles[day][route==='lake'?'lake':'none'],day,route,data,WORLD});
   await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);
  }
  await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);
  let shared;
  for(const skip of [false,true]){
   if(skip){await p.evaluate(async()=>{__test.reset();await __typingRPG.flush();});await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);}
   await p.getByText('Quick travel',{exact:true}).click();await p.getByRole('button',{name:'Begin Library tutorial',exact:true}).click();
   for(const text of ['Hello','How are you?','پښتو']){await p.locator('#tutorialInteraction button').getByText(text,{exact:true}).click();await p.locator('#teachNext').click();}
   await p.locator('#tutorialName').fill('wrong');await p.locator('#tutorialSaveName').click();assert(await p.locator('#teachNext').isDisabled());assert.equal(await p.evaluate(()=>__test.state.progress.enableTypingChallenges),false);
   const before=await p.evaluate(()=>({xp:__test.state.progress.xp,library:JSON.stringify(__test.state.progress.library)}));
   if(skip){await p.evaluate(()=>__test.state.progress.enableTypingChallenges=true);await p.getByRole('button',{name:'I cannot type',exact:true}).click();assert.equal(await p.evaluate(()=>__test.state.session.passed.has('tutorial-guide-name')),false);assert.equal(await p.evaluate(()=>__test.state.progress.xp),before.xp);}
   else{await p.locator('#tutorialName').fill('Muhammad Jan');await p.locator('#tutorialName').press('Enter');assert.equal(await p.evaluate(()=>__test.state.progress.enableTypingChallenges),true);await p.locator('#teachNext').click();}
   assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress.library)),before.library);
   assert.equal(await p.evaluate(()=>__test.state.progress.enableTypingChallenges),!skip);assert.equal(await p.evaluate(()=>__test.state.progress.tutorialDone),true);
   await p.locator('#resultWorld').click();const lines=[];
   while(await p.getByRole('button',{name:'Continue',exact:true}).count()){lines.push(await p.locator('#rpgDialogue p').innerText());await p.getByRole('button',{name:'Continue',exact:true}).click();}
   lines.push(await p.locator('#rpgDialogue p').innerText());if(shared)assert.deepEqual(lines,shared);else shared=lines;
   await p.getByRole('button',{name:'Explore the village',exact:true}).click();await p.evaluate(()=>__typingRPG.flush());await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);
   await p.locator('#rpgLibrary').click();await p.locator('[data-library-tab=profile]').click();assert.equal(await p.locator('#enableTypingChallenges').isChecked(),!skip);await p.locator('#libraryClose').click();
  }
  await fixture(1);
  await p.evaluate(()=>{__test.state.progress.enableTypingChallenges=true;(__test.studySchool(1),__test.challenge.startChallenge(1));});
  let skipped=false,frozen,skippedIndex;
  while(await p.locator('#lessonScreen').isVisible()){
   if(!skipped&&await p.locator('#unseenRecall').count()){
    frozen=await p.evaluate(()=>JSON.stringify(__test.state.session.questions));skippedIndex=await p.evaluate(()=>__test.state.session.index);
    const before=await p.evaluate(()=>({xp:__test.state.progress.xp,stat:JSON.stringify(__test.E.cardStat(__test.state.progress,__test.content.LIBRARY_DATA,__test.state.session.questions[__test.state.session.index].id))}));
    await p.getByRole('button',{name:'I cannot type',exact:true}).click();
    assert.equal(await p.evaluate(()=>__test.state.session.index),skippedIndex+1);assert.equal(await p.evaluate(()=>__test.state.progress.xp),before.xp);
    assert.equal(await p.evaluate(i=>JSON.stringify(__test.E.cardStat(__test.state.progress,__test.content.LIBRARY_DATA,__test.state.session.questions[i].id)),skippedIndex),before.stat);
    await p.evaluate(()=>__typingRPG.flush());await p.reload();await p.locator('#lessonScreen').waitFor();
    assert.deepEqual(await p.evaluate(()=>__test.state.session.skippedQuestions),[skippedIndex]);assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.session.questions)),frozen);assert.equal(await p.evaluate(()=>__test.state.progress.enableTypingChallenges),true);skipped=true;continue;
   }
   await answerCurrent(p);await p.locator('#quizNext').click();
  }
  assert(skipped);assert.equal(await p.locator('#resultAccuracy').innerText(),'14/15');const passXP=await p.evaluate(()=>__test.state.progress.xp);
  await p.evaluate(()=>__typingRPG.flush());await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);assert.equal(await p.evaluate(()=>__test.state.progress.xp),passXP);
  // Ordinary lesson uses the same no-credit transaction and advances without changing preference.
  await fixture(1);await p.evaluate(()=>{__test.state.progress.enableTypingChallenges=true;__test.state.progress.library.requestedDailyTarget=24;(__test.studySchool(1),__test.lessons.begin('1-residential'));});
  for(let n=0;!await p.locator('#lessonRecall').count();n++){
   assert(n<100);if(await p.locator('#teachPanel').isVisible())await p.locator('#teachNext').click();else if(await p.locator('#grammarPanel').isVisible())await p.locator('#grammarNext').click();else{await answerCurrent(p);await p.locator('#quizNext').click();}
  }
  const lesson=await p.evaluate(()=>({id:__test.state.session.activeItem.id,xp:__test.state.progress.xp,answered:__test.state.session.answered,stat:JSON.stringify(__test.E.cardStat(__test.state.progress,__test.content.LIBRARY_DATA,__test.state.session.activeItem.id))}));
  await p.getByRole('button',{name:'I cannot type',exact:true}).click();assert.equal(await p.evaluate(()=>__test.state.progress.xp),lesson.xp);assert.equal(await p.evaluate(()=>__test.state.session.answered),lesson.answered+1);assert.equal(await p.evaluate(()=>__test.state.progress.enableTypingChallenges),true);
  await p.evaluate(()=>__typingRPG.flush());await p.reload();await p.locator('#lessonScreen').waitFor();assert((await p.evaluate(()=>__test.state.session.skippedItems)).includes(lesson.id));assert.equal(await p.evaluate(id=>JSON.stringify(__test.E.cardStat(__test.state.progress,__test.content.LIBRARY_DATA,id)),lesson.id),lesson.stat);
  for(let day=1;day<=7;day++)for(const route of ['none','failed','lake','pass']){
   const spec=data.conversations.bilal.days[day];await fixture(day,route);await p.locator('#rpgInteract').click();
   const eligible=route==='lake'||route==='pass';assert.equal(await p.locator('[data-response-id]').count()>0,eligible,`day ${day} ${route}`);
   if(!eligible){await p.getByRole('button',{name:'Back to village',exact:true}).click();continue;}
   assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[spec.event].pashto.ps);assert.equal(await p.locator('#rpgDialogue .rpg-dialogue-roman').innerText(),data.events[spec.event].pashto.roman);
   assert(!(await p.locator('#rpgDialogue').innerText()).includes(data.events[spec.event].languageReview.englishReviewOnly));await p.getByRole('button',{name:'Hear Pashto',exact:true}).click();
   const before=await p.evaluate(async()=>{await __typingRPG.flush();return JSON.stringify(__test.state.progress);});
   const wrong=p.locator('[data-response-id]').filter({hasNotText:spec.response.pashto});
   const inappropriate=route==='lake'&&await wrong.count()>0;
   if(inappropriate)await wrong.first().click();else await p.locator('[data-response-id]').filter({hasText:spec.response.pashto}).click();
   const reaction=inappropriate?spec.incorrectEvent:spec.correctEvent;assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[reaction].pashto.ps);
   await p.evaluate(()=>__typingRPG.flush());await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);await p.locator('#rpgInteract').click();assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[reaction].pashto.ps);
   await p.getByRole('button',{name:'Continue',exact:true}).click();assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[spec.conclusionEvent].pashto.ps);await p.getByRole('button',{name:'Back to village',exact:true}).click();
   await p.locator('#rpgInteract').click();assert.equal(await p.locator('#rpgDialogue p').innerText(),data.events[spec.repeatEvent].pashto.ps);await p.getByRole('button',{name:'Back to village',exact:true}).click();assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress)),before);
  }
  assert.deepEqual(b.errors,[]);console.log('PASS typing/Bilal browser',width,'tutorial correct/wrong/opt-out/shared intro/settings; challenge skip auto-advance, frozen reload,14/15; lesson skip/reload; all seven days × four eligibility routes, Pashto/audio, both reactions, reaction reload/repeat, no learning writes');
 }finally{await b.close();}
}
