import assert from 'node:assert/strict';
import {setup,tutorial,answerCurrent} from './browser-fixture.mjs';
for(const width of [375,1280]) {
 const b=await setup({width});const p=b.page;
 try {
  await p.addInitScript(()=>{
   window.assessmentEntropyCalls=0;
   const native=crypto.getRandomValues.bind(crypto);
   crypto.getRandomValues=values=>{window.assessmentEntropyCalls++;return native(values)};
  });
  await p.reload();await tutorial(p);
  const before=await p.evaluate(()=>window.assessmentEntropyCalls);
  await p.evaluate(()=>{__test.state.progress.enableTypingChallenges=true;(__test.studySchool(1),__test.challenge.startChallenge(1));});
  assert.equal(await p.evaluate(()=>window.assessmentEntropyCalls),before+1,'one fresh native entropy draw per new attempt');
  const questions=await p.evaluate(()=>__test.state.session.questions),assignments=await p.evaluate(()=>__test.state.progress.library.plans[1].locationAssignments);
  for(let i=0;i<15&&!await p.locator('#unseenRecall').isVisible();i++){await answerCurrent(p);await p.locator('#quizNext').click();}
  await p.locator('#unseenRecall').fill('Unsubmitted draft');await p.evaluate(()=>__test.storage.settled());await p.reload();
  assert.equal(await p.evaluate(()=>window.assessmentEntropyCalls),0,'reload consumes no new assessment entropy');
  assert.deepEqual(await p.evaluate(()=>__test.state.session.questions),questions);
  assert.equal(await p.locator('#unseenRecall').inputValue(),'Unsubmitted draft');
  await answerCurrent(p);await p.locator('#quizNext').click();
  for(let i=0;i<15&&!await p.locator('#constructionPanel').isVisible();i++){await answerCurrent(p);await p.locator('#quizNext').click();}
  await p.locator('#wordTiles button:enabled').first().click();
  const built=await p.evaluate(()=>__test.state.session.built);
  await p.evaluate(()=>__test.storage.settled());await p.reload();
  assert.equal(await p.evaluate(()=>window.assessmentEntropyCalls),0);assert.deepEqual(await p.evaluate(()=>__test.state.session.built),built);assert.deepEqual(await p.evaluate(()=>__test.state.session.questions),questions);
  await p.locator('#clearTiles').click();await answerCurrent(p);
  const locked=await p.evaluate(()=>({correct:__test.state.session.correctCount,xp:__test.state.progress.xp,events:__test.state.progress.library.events}));
  await p.evaluate(()=>__test.storage.settled());await p.reload();
  assert.equal(await p.evaluate(()=>window.assessmentEntropyCalls),0);assert(await p.evaluate(()=>__test.state.session.locked));
  assert.deepEqual(await p.evaluate(()=>({correct:__test.state.session.correctCount,xp:__test.state.progress.xp,events:__test.state.progress.library.events})),locked);
  await p.locator('#quizNext').click();
  while(await p.evaluate(()=>!__test.state.session.finished)){await answerCurrent(p);await p.locator('#quizNext').click()}
  await p.evaluate(()=>__test.storage.settled());const entropy=await p.evaluate(()=>window.assessmentEntropyCalls);
  await p.locator('#resultReplay').click();assert.equal(await p.evaluate(()=>window.assessmentEntropyCalls),entropy+1,'retry draws fresh entropy');
  assert.deepEqual(await p.evaluate(()=>__test.state.progress.library.plans[1].locationAssignments),assignments);
  assert(await p.evaluate(()=>__test.state.session.questions.length===15));
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(b.errors,[]);
  console.log('PASS random assessment browser',width,'fresh native entropy on new/retry attempts, none on reload, exact words/choices/partial tiles/locked scores and SRS, frozen curriculum and mobile layout');
 } finally {await b.close()}
}
