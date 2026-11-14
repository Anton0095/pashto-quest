import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {setup,tutorial,answerCurrent} from './browser-fixture.mjs';
for(const width of [375,1280]) {
 const b=await setup({width});try {
 const p=b.page;await tutorial(p);
 const journal=await p.evaluate(()=>{
  const t=__test,before=JSON.stringify({grammar:t.state.progress.library.grammar,complete:t.state.progress.complete,acquired:t.state.progress.library.acquired,units:t.state.progress.library.units,xp:t.state.progress.xp});
  t.library.openLibrary('grammar');const root=document.getElementById('libraryBody');
  for(const d of root.querySelectorAll('details'))d.open=true;
  return {before,after:JSON.stringify({grammar:t.state.progress.library.grammar,complete:t.state.progress.complete,acquired:t.state.progress.library.acquired,units:t.state.progress.library.units,xp:t.state.progress.xp}),count:root.querySelectorAll('[data-grammar-concept]').length,text:root.textContent,buttons:root.querySelectorAll('button,input').length};
 });assert.equal(journal.count,33);assert.equal(journal.buttons,0);assert.equal(journal.before,journal.after);assert(journal.text.includes('Worked analysis:'));assert(journal.text.includes('first person singular'));
 await p.locator('#libraryClose').click();
 await p.evaluate(async()=>{const t=__test;(t.studySchool(1),t.lessons.begin('1-residential'));let guard=0;while(!document.getElementById('lessonScreen').classList.contains('hidden')){if(++guard>200)throw Error('Home stalled');const s=t.state.session;if(['greeting','lexical','sentence'].includes(s.phase))t.lessons.afterStudy();else if(s.phase==='grammar')t.lessons.afterGrammar();else{const item=s.queue[0],w=t.content.wordById[item.id];t.lessons.answer(item.kind==='construct'?w.ps:w.en);t.nextQuestion()}await Promise.resolve()}});
 const exampleCheck=await p.evaluate(()=>{const t=__test,stamp=()=>JSON.stringify({grammar:t.state.progress.library.grammar,acquired:t.state.progress.library.acquired,complete:t.state.progress.complete,xp:t.state.progress.xp}),before=stamp();t.library.openLibrary('grammar');const examples=[...document.querySelectorAll('#libraryBody .library-pashto')].map(e=>e.textContent),licensed=t.learning.availableSentences(1);return {before,after:stamp(),count:examples.length,licensed:examples.every(ps=>licensed.some(c=>c.ps===ps))}});
 assert.equal(exampleCheck.before,exampleCheck.after);assert(exampleCheck.count>0&&exampleCheck.licensed);await p.locator('#libraryClose').click();
 for(const day of [1,6,7,14])for(const pace of [8,12,24]) {
  await p.evaluate(({day,pace})=>{const t=__test;t.reset(pace);t.state.progress.tutorialDone=true;for(let n=1;n<day;n++)t.progression.completeChallengeOnce(t.state.progress,n,[7,14].includes(n)?25:15);t.state.day=day;(t.studySchool(day),t.challenge.startChallenge(day))},{day,pace});
  if(day===6)assert(!/[موږتاسې]/.test((await p.locator("#challengeScene").innerText()).replace(/[A-Za-z]/g,"")),"no Pashto-to-English pronoun mapping in the Hills scene");
  const expected=[7,14].includes(day)?25:15;
  for(let n=0;n<expected;n++) {
   const q=await p.evaluate(()=>__test.state.session.questions[__test.state.session.index]);assert(!['choice','address'].includes(q.kind));
   if(q.unstudied&&!q.recognition){const text=await p.locator('#choices').innerText();const en=await p.evaluate(()=>__test.content.wordById[__test.state.session.questions[__test.state.session.index].id].en);assert(!text.includes(en));}
   await answerCurrent(p);await p.locator('#quizNext').click();
  }
  assert(await p.locator('#resultScreen').isVisible());assert.equal(await p.evaluate(day=>__test.state.progress.challenges[day].best,day),expected);
 }
 assert.deepEqual(b.errors,[]);console.log(width,'PASS all 33 Journal worked references without unlocks; 1/6/7/14 × paces 8/12/24 public practical completion, thresholds and unknown-meaning masking');
 }finally{await b.close()}
}
