import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {setup,tutorial} from './browser-fixture.mjs';
mkdirSync('docs/maintenance/audit',{recursive:true});
for(const width of [375,1280]){
 const b=await setup({width,transform:html=>html.replace('// @TEST_HOOK','window.__ui=ui; // @TEST_HOOK')});const p=b.page;
 try{
  await tutorial(p);await p.evaluate(()=>__test.challenge.startChallenge(1));
  await p.locator('#unseenRecall').fill('draft to preserve');
  const paused=await p.evaluate(()=>JSON.parse(JSON.stringify(__test.state.session)));
  await p.evaluate(async()=>{const t=__test;t.lessons.begin('1-residential');let guard=0;while(!document.querySelector('#lessonScreen').classList.contains('hidden')){if(++guard>200)throw Error('Lesson stalled');const s=t.state.session;if(['lexical','greeting','sentence'].includes(s.phase))t.lessons.afterStudy();else if(s.phase==='grammar')t.lessons.afterGrammar();else{const item=s.queue[0],w=t.content.wordById[item.id];t.lessons.answer(item.kind==='construct'?w.ps:w.en);t.nextQuestion()}await Promise.resolve()}t.challenge.startChallenge(1)});
  assert.deepEqual(await p.evaluate(()=>__test.state.session.questions),paused.questions);assert.equal(await p.locator('#unseenRecall').inputValue(),'draft to preserve');
  await p.reload();assert.deepEqual(await p.evaluate(()=>__test.state.session.questions),paused.questions);
  await p.evaluate(()=>{const t=__test;while(!t.state.session.finished){const s=t.state.session,q=s.questions[s.index],w=t.content.wordById[q.id];t.challenge.answerChallenge(q.answerPs||q.correct||(q.direction==='en-ps'?w.ps:w.en));t.nextQuestion()}t.challenge.startChallenge(1)});
  assert(await p.evaluate(()=>__test.state.session.questions.some(q=>q.generated)));assert(!(await p.evaluate(()=>__test.state.session.questions[0].unstudied)));
  // Two open Library exercises may be answered in either order, with saves
  // between opening/submission; IDs belong to first responses, not open panels.
  await p.evaluate(()=>__test.library.openLibrary());
  const libraryResult=await p.evaluate(()=>{
   const t=__test,detail=document.querySelector('.library-entry');detail.open=true;detail.dispatchEvent(new Event('toggle'));
   const start=[...detail.querySelectorAll('button')].find(b=>b.textContent==='Practise an encountered form');
   const sequence=t.state.progress.library.attemptSequence,xp=t.state.progress.xp;
   start.click();start.click();
   const exercises=[...detail.querySelectorAll('div')].filter(el=>el.querySelector(':scope > .choice'));
   if(exercises.length!==2)throw Error('Expected two open Library exercises');
   const e=t.content.LIBRARY_DATA.entries.find(e=>e.lemmaId===detail.dataset.lemma),r=t.state.progress.library.acquired[e.lemmaId],form=e.forms.find(f=>r.encounteredFormIds.includes(f.formId));
   const before=r.totalAttempts;t.storage.save();
   for(const box of exercises.reverse())box.querySelector(`[data-answer="${form.englishGloss}"]`).click();
   return {graded:r.totalAttempts-before,xp:t.state.progress.xp-xp,sequence:t.state.progress.library.attemptSequence-sequence,locked:exercises.every(box=>[...box.querySelectorAll('.choice')].every(b=>b.disabled))};
  });
  assert.deepEqual(libraryResult,{graded:2,xp:0,sequence:2,locked:true});
  await p.locator('#libraryClose').click();
  await p.evaluate(()=>__test.library.openLibrary('grammar'));
  assert((await p.locator('#libraryDialog').innerText()).includes('Challenges do not unlock grammar'));
  await p.screenshot({path:`docs/maintenance/audit/grammar-journal-${width}.png`,fullPage:true});
  await p.locator('#libraryClose').click();
  for(const right of [true,false]){
   await p.evaluate(()=>__test.library.openLibrary('phrases'));
   const outcome=await p.evaluate(right=>{const t=__test,article=document.querySelector('[data-phrase]'),box=article.querySelector('.phrase-practice'),phrase=t.content.LIBRARY_DATA.phrases.find(p=>p.id===article.dataset.phrase),buttons=[...box.querySelectorAll('button')],selected=buttons.find(b=>(b.dataset.answer===phrase.english)===right),xp=t.state.progress.xp;selected.click();return{correct:box.querySelectorAll('.correct').length,wrong:box.querySelectorAll('.wrong').length,locked:buttons.every(b=>b.disabled),xp:t.state.progress.xp-xp}},right);
   assert.deepEqual(outcome,{correct:1,wrong:right?0:1,locked:true,xp:0});await p.locator('#libraryClose').click();
  }
  await p.evaluate(()=>{const t=__test;for(let n=1;n<=14;n++)t.E.unlock(t.state.progress,n,'fixture');for(const e of t.content.LIBRARY_DATA.entries)for(const f of e.forms)t.E.encounter(t.state.progress,t.content.LIBRARY_DATA,{lemmaId:e.lemmaId,formId:f.formId},{day:14,source:'fixture',introduce:true});const cards=t.S.available(t.state.progress,t.content.LIBRARY_DATA,t.content.LIBRARY_DATA.sentenceFrames,14);window.sceneCards={informal:cards.find(c=>c.generated.register==='informal'),polite:cards.find(c=>c.generated.register==='polite_or_plural')};});
  for(const [kind,recipient] of [['informal','Saleha'],['polite','Ms Hameed'],['polite','Saleha and Mina']]){
   await p.evaluate(({kind,recipient})=>__ui.sentenceContext(window.sceneCards[kind],'Muhammad Jan',document.querySelector('#quizPanel'),'construct',{recipient}),{kind,recipient});
   assert((await p.locator('#speakerName').innerText()).includes('Muhammad Jan'));assert((await p.locator('#addressTarget').innerText()).endsWith(recipient),JSON.stringify({kind,recipient,label:await p.locator('#addressTarget').innerText(),card:await p.evaluate(kind=>window.sceneCards[kind]?.generated,kind)}));
  }
  assert.deepEqual(b.errors,[]);console.log('PASS teaching browser',width,'paused draft/questions exact through study and reload; new attempt refreshed; expression feedback/no XP; two Library exercises grade once in reverse order; teacher and informal/respectful/plural listeners distinct');
 }finally{await b.close()}
}
