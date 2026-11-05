import assert from 'node:assert/strict';
import {setup} from './browser-fixture.mjs';
for(const width of [375,1280]){
 const b=await setup({width,transform:h=>h.replace('// @TEST_HOOK','window.__ui=ui; // @TEST_HOOK')});const p=b.page;
 try{
  await p.locator('#startTutorial').click();assert.equal(await p.locator('#participants [data-character-id]').count(),0);
  await p.locator('#tutorialInteraction button').getByText('Hello',{exact:true}).click();await p.locator('#teachNext').click();
  assert.equal(await p.locator('#tutorialInteraction .sentence-roman').count(),0);
  for(const token of ['How are you?'])await p.locator('#tutorialInteraction button').getByText(token,{exact:true}).click();
  assert.equal(await p.locator('#teachRoman').innerText(),await p.evaluate(()=>__test.content.wordById['g-how'].roman));await p.locator('#teachNext').click();
  assert.equal(await p.locator('#teachPashto').innerText(),'ته کومه ژبه زده کوې؟');assert.equal(await p.locator('#teachRoman').innerText(),'Ta kuma zhaba zda kawe?');
  await p.locator('#teachSpeak').click();await p.locator('[data-answer="دري"]').click();assert(await p.locator('#teachNext').isDisabled());await p.locator('[data-answer="پښتو"]').click();await p.locator('#teachNext').click();
  assert.equal(await p.locator('#teachPashto').innerText(),'زما نوم څه دی؟');await p.locator('#tutorialName').fill('Player');await p.locator('#tutorialSaveName').click();assert(await p.locator('#teachNext').isDisabled());
  await p.locator('#tutorialName').fill('   mOhAmMeD   jAn   ');await p.locator('#tutorialName').press('Enter');assert(!await p.locator('#teachNext').isDisabled());await p.locator('#teachNext').click();
  assert((await p.evaluate(()=>__test.state.progress.tutorialDone)));assert.deepEqual(await p.evaluate(()=>__test.state.progress.playerProfile),{name:'Player',gender:'unspecified'});
  await p.locator('#resultWorld').click();await p.evaluate(()=>__test.library.openLibrary('profile'));await p.locator('#playerProfileName').fill('');await p.locator('#playerProfileGender').selectOption('male');await p.locator('#libraryProfile button').click();await p.getByText('Profile saved.',{exact:true}).waitFor();
  await p.locator('#libraryClose').click();await p.reload();assert.deepEqual(await p.evaluate(()=>__test.state.progress.playerProfile),{name:'Player',gender:'male'});
  assert.equal(await p.locator('.sentence-scene').count(),0);assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));assert.deepEqual(b.errors,[]);
  console.log('PASS tutorial/profile',width,'all four cards, post-answer romanisation, exact approved questions/audio control, incorrect/retry, name variant normalization, optional defaults and profile reload');
 }finally{await b.close();}
}
