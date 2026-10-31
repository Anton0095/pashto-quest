import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
mkdirSync('docs/maintenance/p1',{recursive:true});
import {setup,tutorial,answerCurrent} from './browser-fixture.mjs';
for(const width of [375,1280]) {
 const b=await setup({width}); const p=b.page;
 try {
  await tutorial(p);
  await p.evaluate(async()=>{
    const t=__test;t.lessons.begin('1-residential');let guard=0;
    while(!document.querySelector('#lessonScreen').classList.contains('hidden')){
      if(++guard>150)throw Error('Home stalled');const s=t.state.session;
      if(['greeting','lexical','sentence'].includes(s.phase))t.lessons.afterStudy();
      else if(s.phase==='grammar')t.lessons.afterGrammar();
      else{const item=s.queue[0],c=t.content.wordById[item.id];t.lessons.answer(item.kind==='construct'?c.ps:c.en);t.nextQuestion()}
      await Promise.resolve();
    }
    if(t.content.zoneKeys.some(place=>place!=='residential'&&t.state.progress.complete['1-'+place]))throw Error('Unexpected district completion');
    t.library.openLibrary();const detail=document.querySelector('.library-entry');detail.open=true;
    [...detail.querySelectorAll('button')].find(b=>b.textContent==='Practise an encountered form').click();
    const allowed=new Set(Object.values(t.content.wordById).filter(c=>(t.content.LIBRARY_DATA.sourceMappings[c.id]||[]).length&&t.content.LIBRARY_DATA.sourceMappings[c.id].every(r=>t.state.progress.library.acquired[r.lemmaId]?.introducedFormIds.includes(r.formId))).map(c=>c.en));
    for(const b of detail.lastElementChild.querySelectorAll('button'))if(!allowed.has(b.textContent)&&!['A different meaning','Another response','None of these'].includes(b.textContent))throw Error('Library leaked '+b.textContent);
    document.querySelector('#libraryDialog').close();
  });
  await p.evaluate(()=>__test.challenge.startChallenge(1));
  const unknown=await p.evaluate(()=>{
   const t=__test,s=t.state.session;
   s.index=s.questions.findIndex(q=>q.unstudied);s.answered=s.index;t.challenge.showChallengeQuestion();
   return {q:s.questions[s.index],card:t.content.wordById[s.questions[s.index].id]};
  });
  await p.locator("#quizPanel").screenshot({path:`docs/maintenance/p1/uncued-recall-${width}.png`});
  assert(!unknown.q.choiceOrder.includes(unknown.card.en));
  assert(!(await p.locator('#choices').innerText()).includes(unknown.card.en));
  await p.locator('#unseenRecall').fill('partial draft');
  await p.reload();assert(await p.locator('#unseenRecall').isVisible());
  assert.equal(await p.locator('#unseenRecall').inputValue(),'partial draft');
  await p.getByRole('button',{name:'I don’t know — reveal meaning',exact:true}).click();
  assert((await p.locator('#quizFeedback').innerText()).includes(unknown.card.en));
  assert.equal(await p.evaluate(()=>__test.state.session.correctCount),0);
  assert(await p.locator('#unseenRecall').isDisabled());
  await p.reload();assert(await p.locator('#unseenRecall').isDisabled());
  assert((await p.locator('#quizFeedback').innerText()).includes(unknown.card.en));
  // Revision has no district. A due record must still render its study guidance.
  await p.evaluate(()=>{
   __test.state.session=null;
   for(const r of Object.values(__test.state.progress.library.units))r.srsDueAt=0;
   __test.lessons.begin('review');
  });
  if(await p.locator('#teachPanel').isVisible())assert((await p.locator('#guideMessage').innerText()).includes('Memory Trail'));
  await p.evaluate(()=>__test.challenge.resumeChallenge());
  // Inject browser quota and intermittent failures without changing application state.
  const xp=await p.evaluate(()=>__test.state.progress.xp);
  await p.evaluate(async()=>{
    window.realWrite=Storage.prototype.setItem;
    Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError')};
    __test.state.progress.xp+=7;await __test.storage.save();
  });
  assert(await p.locator('#saveWarning').isVisible());
  assert((await p.locator('#saveWarning').innerText()).includes('has not been saved'));
  await p.locator('#saveWarning').scrollIntoViewIfNeeded();await p.screenshot({path:`docs/maintenance/p1/save-failure-${width}.png`});
  assert.equal(await p.locator('#saveCompatibility').count(),0);
  assert.equal(await p.evaluate(()=>__test.state.progress.xp),xp+7);
  const downloadPromise=p.waitForEvent('download');await p.locator('#exportSave').click();const download=await downloadPromise;
  const path=await download.path();const {readFileSync}=await import('node:fs');const exported=JSON.parse(readFileSync(path));assert.equal(exported.xp,xp+7);assert(exported.activeChallenge.locked);
  await p.locator('#retrySave').click();await p.evaluate(()=>__test.storage.settled());assert(await p.locator('#saveWarning').isVisible());
  await p.evaluate(()=>Storage.prototype.setItem=window.realWrite);
  await p.locator('#retrySave').click();await p.evaluate(()=>__test.storage.settled());assert(!(await p.locator('#saveWarning').isVisible()));
  await p.reload();assert.equal(await p.evaluate(()=>__test.state.progress.xp),xp+7);assert(!(await p.locator('#saveWarning').isVisible()));
  // A failed write leaves the previous durable save available on reload.
  await p.evaluate(async()=>{
   Storage.prototype.setItem=()=>{throw Error('Intermittent')};__test.state.progress.xp+=9;await __test.storage.save();
  });await p.reload();assert.equal(await p.evaluate(()=>__test.state.progress.xp),xp+7);
  // Practical challenges never require grammar terminology or unlock workshops.
  await p.evaluate(()=>{const t=__test;t.reset(0);t.state.progress.tutorialDone=true;t.challenge.startChallenge(1);if(t.state.session.questions.some(q=>['choice','address'].includes(q.kind)))throw Error('Retired rule question generated')});
  await answerCurrent(p);assert.deepEqual(await p.evaluate(()=>__test.state.progress.library.grammar),{});
  const frozenPrompt=await p.locator('#quizPrompt').innerText();await p.evaluate(()=>__test.storage.settled());await p.reload();assert.equal(await p.locator('#quizPrompt').innerText(),frozenPrompt);
  // Fill real Chromium localStorage to its native quota, then recover.
  const nativeQuota=await p.evaluate(async()=>{
    let low=0,high=8*1024*1024,quotaErrors=0;
    while(low<high){const n=Math.ceil((low+high)/2);try{localStorage.setItem('quota-fill','x'.repeat(n));low=n}catch(error){if(error.name!=='QuotaExceededError')throw error;quotaErrors++;high=n-1}}
    localStorage.setItem('quota-fill','x'.repeat(low));
    __test.state.progress.xp=123456789;
    return {quotaErrors,save:await __test.storage.save(),bytes:low*2};
  });
  console.log('Native Chromium quota filled',width,nativeQuota.bytes,'UTF-16 filler bytes; failed save:',!nativeQuota.save);
  assert(nativeQuota.quotaErrors>0&&nativeQuota.bytes>1024*1024);assert.equal(nativeQuota.save,false);assert(await p.locator('#saveWarning').isVisible());
  await p.evaluate(()=>localStorage.removeItem('quota-fill'));await p.locator('#retrySave').click();await p.evaluate(()=>__test.storage.settled());assert(!(await p.locator('#saveWarning').isVisible()));
  await p.reload();assert.equal(await p.evaluate(()=>__test.state.progress.xp),123456789);
  // Storage unavailable even at initial read must boot and warn, without modal reset.
  await p.addInitScript(()=>{Storage.prototype.getItem=function(){throw new DOMException('Denied','SecurityError')};Storage.prototype.setItem=function(){throw new DOMException('Denied','SecurityError')}});
  await p.reload();assert(await p.locator('#saveWarning').isVisible());assert.equal(await p.locator('#saveCompatibility').count(),0);assert(await p.locator('#startTutorial').isVisible());
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(b.errors,[]);
  console.log('PASS P1 browser',width,'uncued unknown recall, skip penalty, frozen reload, quota, warning/export/retry, write recovery, intermittent reload, denied startup, responsive nonblocking warning');
 }finally{await b.close()}
}
