import assert from 'node:assert/strict';
import {setup,answerCurrent} from './browser-fixture.mjs';
for(const width of [375,1280]){
 const b=await setup({width});const p=b.page;
 try{
  await p.evaluate(()=>__test.library.openLibrary('profile'));
  assert(!await p.locator('#typing-en').isChecked());assert(!await p.locator('#typing-ps').isChecked());
  await p.locator('#typing-en').check();await p.locator('#typing-ps').check();await p.getByRole('button',{name:'Save profile',exact:true}).click();await p.getByText('Profile saved.',{exact:true}).waitFor();await p.locator('#libraryClose').click();
  await p.evaluate(()=>__test.lessons.begin('tutorial'));
  for(const value of ['Hello','How are you?','پښتو']){await p.locator('#tutorialInteraction button').getByText(value,{exact:true}).click();await p.locator('#teachNext').click();}
  const tutorialXP=await p.evaluate(()=>__test.state.progress.xp);
  await p.getByRole('button',{name:'Turn off English typing',exact:true}).click();
  assert.equal(await p.evaluate(()=>__test.state.progress.xp),tutorialXP);assert(await p.locator('#teachNext').isDisabled());
  await p.locator('#tutorialInteraction button').getByText('Muhammad Jan',{exact:true}).click();await p.locator('#teachNext').click();
  await p.evaluate(()=>{__test.state.progress.typingPreferences={en:true,ps:true};});
  await p.evaluate(()=>{__test.state.progress.tutorialDone=true;__test.studySchool(1);__test.challenge.startChallenge(1);});
  for(let i=0;i<15&&!await p.locator('#unseenRecall').count();i++){await answerCurrent(p);await p.locator('#quizNext').click();}
  const before=await p.evaluate(()=>{const s=__test.state.session;return {index:s.index,score:s.correctCount,xp:__test.state.progress.xp,id:s.questions[s.index].id,lang:s.questions[s.index].direction==='en-ps'?'ps':'en'};});
  await p.getByRole('button',{name:before.lang==='ps'?'Turn off Pashto typing':'Turn off English typing',exact:true}).click();
  assert.equal(await p.locator('#unseenRecall').count(),0);assert(await p.locator('#choices button').count()>=2);
  const after=await p.evaluate(()=>{const s=__test.state.session;return {index:s.index,score:s.correctCount,xp:__test.state.progress.xp,id:s.questions[s.index].id,prefs:__test.state.progress.typingPreferences,valid:__test.storage.currentSave(JSON.parse(__test.storage.snapshot()))};});
  assert.deepEqual([after.index,after.score,after.xp,after.id],[before.index,before.score,before.xp,before.id]);assert(after.valid);assert(!after.prefs[before.lang]);assert(after.prefs[before.lang==='en'?'ps':'en']);
  await p.reload();await p.locator('#quizPanel').waitFor();assert.equal(await p.locator('#unseenRecall').count(),0);
  await p.screenshot({path:`work/typing-replacement-${width}.png`});assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));assert.deepEqual(b.errors,[]);
  await p.evaluate(()=>__test.library.openLibrary('profile'));
  assert(!await p.locator('#typing-'+before.lang).isChecked());
  await p.locator('#typing-en').check();await p.locator('#typing-ps').check();await p.getByRole('button',{name:'Save profile',exact:true}).click();await p.getByText('Profile saved.',{exact:true}).waitFor();await p.locator('#libraryClose').click();
  await p.evaluate(()=>__test.lessons.begin('1-residential'));
  for(let i=0;!await p.locator('#lessonRecall').count();i++){
    assert(i<120);if(await p.locator('#teachPanel').isVisible())await p.locator('#teachNext').click();
    else if(await p.locator('#grammarPanel').isVisible())await p.locator('#grammarNext').click();
    else {await answerCurrent(p);await p.locator('#quizNext').click();}
  }
  const lessonBefore=await p.evaluate(()=>{const s=__test.state.session;return [s.answered,s.firstCorrect,s.activeItem.id,__test.state.progress.xp];});
  if(width===1280){
    await p.evaluate(()=>__test.library.openLibrary('profile'));await p.locator('#typing-en').uncheck();await p.getByRole('button',{name:'Save profile',exact:true}).click();await p.getByText('Profile saved.',{exact:true}).waitFor();await p.locator('#libraryClose').click();
  }else await p.getByRole('button',{name:'Turn off English typing',exact:true}).click();
  assert.equal(await p.locator('#lessonRecall').count(),0);assert(await p.locator('#choices button').count()>1);
  assert.deepEqual(await p.evaluate(()=>{const s=__test.state.session;return [s.answered,s.firstCorrect,s.activeItem.id,__test.state.progress.xp];}),lessonBefore);
  await p.screenshot({path:`work/typing-lesson-${width}.png`});
  console.log('PASS typing language settings/current conversion/queued conversion/score/reload/layout',width);
 }finally{await b.close();}
}
