import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {setup,answerCurrent} from './browser-fixture.mjs';
mkdirSync('work/quest',{recursive:true});
const data=JSON.parse(readFileSync('content/RPG_WORLD.json')),WORLD='pashto-quest-rpg-world-v1';
for(const width of [1280,390]){
 let shared;
 for(const skip of [true,false]){
  const b=await setup({width,rpg:true,mobile:width===390,transform:h=>h.replace('// @TEST_HOOK','window.__questRPG=rpg;window.__questFence=saveFence; // @TEST_HOOK')}),p=b.page;
  try{
   await p.evaluate(()=>__test.state.progress.typingPreferences={en:true,ps:false});
   await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);
   assert.equal(await p.getByRole('button',{name:'Skip tutorial',exact:true}).count(),0);
   await p.getByText('Quick travel',{exact:true}).click();await p.getByRole('button',{name:'Begin Library tutorial',exact:true}).click();
   await p.locator('#tutorialInteraction button').getByText('Hello',{exact:true}).click();await p.locator('#teachNext').click();
   await p.locator('#tutorialInteraction button').getByText('How are you?',{exact:true}).click();await p.locator('#teachNext').click();await p.locator('[data-answer="پښتو"]').click();await p.locator('#teachNext').click();
   if(skip){await p.getByRole('button',{name:'I cannot type',exact:true}).click();await p.locator('#tutorialInteraction button').getByText('Muhammad Jan',{exact:true}).click();}else {if(await p.locator('#tutorialName').isVisible()){await p.locator('#tutorialName').fill('Muhammad Jan');await p.locator('#tutorialSaveName').click();}else await p.locator('#tutorialInteraction button').getByText('Muhammad Jan',{exact:true}).click();}
   await p.locator('#teachNext').click();await p.locator('#resultWorld').click();
   const intro=[];
   while(await p.getByRole('button',{name:'Continue',exact:true}).count()){intro.push(await p.locator('#rpgDialogue p').innerText());await p.getByRole('button',{name:'Continue',exact:true}).click();}
   intro.push(await p.locator('#rpgDialogue p').innerText());assert(intro.join(' ').includes('School'));if(skip)shared=intro;else assert.deepEqual(intro,shared);
   await p.getByRole('button',{name:'Explore the village',exact:true}).click();await p.evaluate(()=>__questRPG.flush());await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);assert(!await p.locator('#rpgDialogue').isVisible());
   assert.equal(await p.evaluate(()=>__test.state.progress.tutorialDone),true);assert.equal(await p.evaluate(()=>__test.state.progress.onboardingIntroductionPending),false);
   // User-facing setting persists, typed questions/drafts/locks stay frozen.
   await p.locator('#rpgLibrary').click();await p.locator('[data-library-tab=profile]').click();assert.equal(await p.locator('#typing-en').isChecked(),!skip);await p.locator('#typing-en').check();await p.getByRole('button',{name:'Save profile',exact:true}).click();await p.getByText('Profile saved.',{exact:true}).waitFor();await p.locator('#libraryClose').click();
   await p.evaluate(()=>(__test.studySchool(1),__test.challenge.startChallenge(1)));
   while(!await p.locator('#unseenRecall').count()){await answerCurrent(p);await p.locator('#quizNext').click();}
   await p.locator('#unseenRecall').fill('Draft to keep');const frozen=await p.evaluate(async()=>{await __questRPG.flush();return JSON.stringify(__test.state.session.questions);});
   await p.evaluate(async()=>{await __test.storage.save();await __questRPG.flush();});await p.reload();await p.locator('#unseenRecall').waitFor();assert.equal(await p.locator('#unseenRecall').inputValue(),'Draft to keep');assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.session.questions)),frozen);
   await answerCurrent(p);assert(await p.locator('#unseenRecall').isDisabled());const xp=await p.evaluate(async()=>{await __questRPG.flush();return __test.state.progress.xp;});await p.reload();await p.locator('#unseenRecall').waitFor();assert(await p.locator('#unseenRecall').isDisabled());assert.equal(await p.evaluate(()=>__test.state.progress.xp),xp);
   assert.deepEqual(b.errors,[]);
  }finally{await b.close();}
 }
 const b=await setup({width,rpg:true,mobile:width===390,transform:h=>h.replace('// @TEST_HOOK','window.__questRPG=rpg;window.__questFence=saveFence; // @TEST_HOOK')}),p=b.page;
 try{
  await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);
  async function fixture(day,position){await p.evaluate(async({day,position,WORLD,data})=>{
   const t=__test;t.state.session=null;t.state.progress=t.progression.fresh();t.state.progress.tutorialDone=true;
   for(let d=1;d<day;d++)t.progression.completeChallengeOnce(t.state.progress,d,t.progression.getChallengeSpec(d).passCount);
   t.progression.activateChallenge(t.state.progress,day);await t.storage.save();await __questRPG.flush();
   const raw=localStorage.getItem(WORLD),w=JSON.parse(raw);Object.assign(w,{chapter:data.days[day].id,position,view:'world',lesson:null,educationFingerprint:null,flags:{started:true,metGuide:true},triggers:{welcome:true},routes:{}});delete w.dialogue;delete w.activities;
   const next=JSON.stringify(w);await navigator.locks.request(WORLD,()=>__questFence.commit(WORLD,raw,next,()=>localStorage.getItem(WORLD),()=>{localStorage.setItem(WORLD,next);return true;}));
  },{day,position,WORLD,data});await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);}
  await fixture(1,{map:'library',x:6,y:8,facing:'up'});await p.screenshot({path:`work/quest/library-${width}.png`,fullPage:true});
  await p.locator('[data-direction=up]').press('Enter');await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.y==='7');
  await p.locator('#rpgLibrary').click();for(const tab of ['vocabulary','grammar','phrases','profile','sentences']){const button=p.locator(`[data-library-tab=${tab}]`);if(await button.count()){await button.click();assert(await p.locator('#libraryBody').innerText());}}await p.locator('#libraryClose').click();
  // Ordinary lessons opt into typed recall without altering tutorial mechanics.
  await p.evaluate(()=>{__test.state.progress.typingPreferences={en:true,ps:true};(__test.studySchool(1),__test.lessons.begin('1-residential'));});
  for(let n=0;!await p.locator('#lessonRecall').count();n++){
   assert(n<100);
   if(await p.locator('#teachPanel').isVisible())await p.locator('#teachNext').click();
   else if(await p.locator('#grammarPanel').isVisible())await p.locator('#grammarNext').click();
   else {await answerCurrent(p);await p.locator('#quizNext').click();}
  }
  await p.locator('#lessonRecall').fill('Lesson draft');await p.evaluate(()=>__questRPG.flush());await p.reload();await p.locator('#lessonRecall').waitFor();assert.equal(await p.locator('#lessonRecall').inputValue(),'Lesson draft');
  await answerCurrent(p);assert(await p.locator('#lessonRecall').isDisabled());await p.evaluate(()=>__questRPG.flush());await p.reload();await p.locator('#lessonRecall').waitFor();assert(await p.locator('#lessonRecall').isDisabled());
  for(const day of [1,2,3]){
   await fixture(day,{map:'village',x:76,y:27,facing:'up'});const before=await p.evaluate(()=>JSON.stringify(__test.state.progress));await p.locator('#rpgInteract').click();
   const event=data.events['ambient-bilal'];assert.equal(await p.locator('#rpgDialogue p').innerText(),event.pashto.ps);assert.equal(await p.locator('#rpgDialogue .rpg-dialogue-roman').innerText(),event.pashto.roman);
   assert(!await p.locator('#rpgDialogue').innerText().then(t=>t.includes(event.languageReview.englishReviewOnly)));
   assert(await p.getByRole('button',{name:'Hear Pashto',exact:true}).isVisible());await p.getByRole('button',{name:'Hear Pashto',exact:true}).click();
   assert.equal(await p.locator('#rpgDialogue .pashto-option').count(),0,'Activation alone does not start authored practice without the intended proposition');
   await p.locator('#rpgDialogue').getByRole('button',{name:'Back to village',exact:true}).click();assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress)),before);
  }
  assert.deepEqual(b.errors,[]);console.log('PASS quest public UI',width,'normal/skip shared introduction, reload, saved settings and typed drafts/locks, Library movement/features, progressive Pashto-only Bilal/audio and zero learning writes');
 }finally{await b.close();}
}
