import assert from 'node:assert/strict';
import {setup,answerCurrent} from './browser-fixture.mjs';
for(const [width,height] of [[1366,768],[390,844]]){
 const b=await setup({width,rpg:true,mobile:width===390,transform:h=>h.replace('// @TEST_HOOK',`const createScene=PashtoRPG.VillageScene.prototype.create;PashtoRPG.VillageScene.prototype.create=function(){createScene.call(this);window.__learningScene=this;window.__sceneCreates=(window.__sceneCreates||0)+1;};window.__learningPosition=()=>rpg.position;window.__flushLearning=()=>rpg.flush(); // @TEST_HOOK`)});const p=b.page;
 try{
  await p.setViewportSize({width,height});await p.locator('#startTutorial').click();await p.waitForFunction(()=>window.__learningScene);
  const position=()=>p.evaluate(()=>__learningPosition());const at=await position();
  await p.evaluate(()=>{window.__sceneBefore=__learningScene;__test.lessons.begin('tutorial');});
  assert.equal(await p.locator('#rpgCanvas').isVisible(),false);assert.equal(await p.evaluate(()=>document.fullscreenElement),null);
  assert(await p.locator('#teachNext').isDisabled());
  const backing=await p.locator('#rpgCanvas').evaluate(c=>({width:c.width,height:c.height}));
  if(width===1366){await p.setViewportSize({width:390,height:844});assert.deepEqual(await p.locator('#rpgCanvas').evaluate(c=>({width:c.width,height:c.height})),backing,'Hidden scene retains its backing size');}
  await p.locator('#navWorld').click();assert(await p.locator('#rpgCanvas').isVisible());
  if(width===1366){await p.waitForFunction(()=>document.getElementById('rpgCanvas').width===256);await p.setViewportSize({width,height});await p.waitForFunction(()=>document.getElementById('rpgCanvas').width===512);}

  await p.evaluate(()=>__test.challenge.startChallenge(1));assert.equal(await p.evaluate(()=>__test.state.progress.tutorialDone),false);assert.equal(await p.locator('#quizPanel').isVisible(),false,'Exit cannot bypass mandatory tutorial');
  assert(await p.evaluate(()=>__sceneBefore===__learningScene&&__sceneCreates===1));assert.deepEqual(await position(),at);
  await p.evaluate(()=>{__test.state.progress.tutorialDone=true;__test.state.progress.enableTypingChallenges=true;__test.state.rpg.startWorld();__test.challenge.startChallenge(1);});
  if(width===1366){await p.setViewportSize({width:390,height:480});const next=await p.locator('#quizNext').boundingBox();assert(next.y+next.height<=480,'Short-screen fallback keeps Next visible');assert.equal(await p.evaluate(()=>scrollY),0);await p.setViewportSize({width,height});}
  while(!await p.locator('#unseenRecall').count()){await answerCurrent(p);await p.locator('#quizNext').click();}
  await p.locator('#unseenRecall').fill('unfinished recall');await p.evaluate(()=>__flushLearning());
  const before=await p.evaluate(()=>__test.state.progress.activeChallenge);
  await p.reload();await p.locator('#unseenRecall').waitFor();await p.waitForFunction(()=>window.__learningScene);assert.equal(await p.locator('#unseenRecall').inputValue(),'unfinished recall');assert.equal(await p.locator('#rpgCanvas').isVisible(),false);
  assert.deepEqual(await p.evaluate(()=>__test.state.progress.activeChallenge.questions),before.questions);assert.deepEqual(await position(),at);
  await p.evaluate(()=>window.__sceneBefore=__learningScene);await p.keyboard.press('ArrowDown');assert.deepEqual(await position(),at,'Learning blocks world movement');
  await p.locator('#navWorld').click();const xp=await p.evaluate(()=>__test.state.progress.xp);
  await p.locator('#rpgLibrary').click();assert(await p.locator('#rpgCanvas').isVisible(),'Reference Library retains exploration');
  const fullPractice=async()=>{assert.equal(await p.locator('#rpgCanvas').isVisible(),false);const box=await p.locator('#libraryDialog').boundingBox();assert(box.x<=10&&box.y<=10&&box.width>=width-20&&box.height>=height-20);};
  await p.locator('[data-library-tab=phrases]').click();await fullPractice();assert(await p.locator('.phrase-practice').count()>0);await p.locator('.phrase-practice [data-answer]').first().click();
  assert.equal(await p.evaluate(()=>__test.state.progress.xp),xp,'Expression practice gives no XP');
  await p.locator('[data-library-tab=sentences]').click();await fullPractice();
  const exercise=p.locator('#libraryBody [data-sentence]').first();assert(await exercise.count());const id=await exercise.getAttribute('data-sentence'),ps=await p.evaluate(id=>__test.content.wordById[id].ps,id);
  for(const token of ps.replace(/[.!؟،]/g,'').split(/\s+/).filter(Boolean))await exercise.locator('.word-tiles button:enabled').getByText(token,{exact:true}).first().click();
  await exercise.getByRole('button',{name:'Check sentence',exact:true}).click();assert(await exercise.getByRole('button',{name:'Hear the correct sentence',exact:true}).count());assert.equal(await p.evaluate(()=>__test.state.progress.xp),xp,'Sentence practice gives no XP');
  await p.locator('[data-library-tab=vocabulary]').click();assert(await p.locator('#rpgCanvas').isVisible(),'Returning to reference restores contextual Library');
  await p.locator('#libraryBody details').first().locator('summary').click();await p.locator('#libraryBody').getByRole('button',{name:'Practise an encountered form',exact:true}).first().click();await fullPractice();
  await p.locator('#libraryClose').click();assert(await p.locator('#rpgCanvas').isVisible());assert(await p.evaluate(()=>__sceneBefore===__learningScene&&__sceneCreates===1),'Mode switches keep the same scene');assert.deepEqual(await position(),at);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight));assert.deepEqual(b.errors,[]);
  console.log('PASS full-screen lifecycle',width,height,'mandatory exit guard, mounted scene identity, typed-draft reload/frozen questions, correct world return, reference/practice modes, all three Library practice types and no XP');
 }finally{await b.close();}
}
