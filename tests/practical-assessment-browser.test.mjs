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
 await p.evaluate(async()=>{const t=__test;t.lessons.begin('1-residential');let guard=0;while(!document.getElementById('lessonScreen').classList.contains('hidden')){if(++guard>200)throw Error('Home stalled');const s=t.state.session;if(['greeting','lexical','sentence'].includes(s.phase))t.lessons.afterStudy();else if(s.phase==='grammar')t.lessons.afterGrammar();else{const item=s.queue[0],w=t.content.wordById[item.id];t.lessons.answer(item.kind==='construct'?w.ps:w.en);t.nextQuestion()}await Promise.resolve()}});
 const exampleCheck=await p.evaluate(()=>{const t=__test,stamp=()=>JSON.stringify({grammar:t.state.progress.library.grammar,acquired:t.state.progress.library.acquired,complete:t.state.progress.complete,xp:t.state.progress.xp}),before=stamp();t.library.openLibrary('grammar');const examples=[...document.querySelectorAll('#libraryBody .library-pashto')].map(e=>e.textContent),licensed=t.learning.availableSentences(1);return {before,after:stamp(),count:examples.length,licensed:examples.every(ps=>licensed.some(c=>c.ps===ps))}});
 assert.equal(exampleCheck.before,exampleCheck.after);assert(exampleCheck.count>0&&exampleCheck.licensed);await p.locator('#libraryClose').click();
 const old=await p.evaluate(async()=>{
  const t=__test;t.reset(0);t.state.progress.tutorialDone=true;t.challenge.startChallenge(1);
  const s=t.state.session;s.questions[0]={id:'grammar:1:0',kind:'choice',direction:'en-ps',prompt:'The described noun is feminine singular. Which pair agrees?',correct:'Feminine singular adjective + feminine singular equative',options:['Feminine singular adjective + feminine singular equative','Masculine singular adjective + feminine singular equative','Feminine singular adjective + plural equative','Masculine singular adjective + masculine singular equative'],grammarDays:[],grammarConcept:'feminine-description'};
  s.questions[0].choiceOrder=[...s.questions[0].options];s.locked=true;s.answered=1;s.submittedAnswer=s.questions[0].options[1];await t.storage.save();
  return {attempt:JSON.parse(localStorage.getItem('pashto-town-days-v1')).activeChallenge,plan:JSON.stringify(t.state.progress.library.plans[1].locationAssignments),xp:t.state.progress.xp,grammar:JSON.stringify(t.state.progress.library.grammar),acquired:JSON.stringify(t.state.progress.library.acquired)};
 });
 await p.reload();assert(await p.locator('#retiredAssessmentNotice').isVisible());assert(!(await p.locator('#quizPanel').isVisible()));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(await p.evaluate(()=>__test.state.progress.activeChallenge),old.attempt);assert.equal(await p.evaluate(()=>__test.state.progress.retiredRuleAssessmentJSON),undefined);
 const downloadPromise=p.waitForEvent('download');await p.getByRole('button',{name:'Export this saved attempt',exact:true}).click();const download=await downloadPromise;assert.deepEqual(JSON.parse(readFileSync(await download.path(),'utf8')),old.attempt);
 await p.getByRole('button',{name:'Keep paused and return to town',exact:true}).click();assert(await p.locator('#worldScreen').isVisible());assert.deepEqual(await p.evaluate(()=>__test.state.progress.activeChallenge),old.attempt);
 await p.reload();assert(await p.locator('#retiredAssessmentNotice').isVisible());
 await p.getByRole('button',{name:'Retire saved attempt and start practical assessment',exact:true}).click();
 const changed=await p.evaluate(()=>{const t=__test;return {archive:JSON.parse(t.state.progress.retiredRuleAssessmentJSON),questions:t.state.session.questions,plan:JSON.stringify(t.state.progress.library.plans[1].locationAssignments),xp:t.state.progress.xp,grammar:JSON.stringify(t.state.progress.library.grammar),acquired:JSON.stringify(t.state.progress.library.acquired)}});
 assert.deepEqual(changed.archive,old.attempt);assert.equal(changed.plan,old.plan);assert.equal(changed.xp,old.xp);assert.equal(changed.grammar,old.grammar);assert.equal(changed.acquired,old.acquired);assert(changed.questions.every(q=>!['choice','address'].includes(q.kind)));
 await p.evaluate(()=>__test.storage.settled());await p.reload();
 assert.deepEqual(await p.evaluate(()=>JSON.parse(__test.state.progress.retiredRuleAssessmentJSON)),old.attempt);
 await p.evaluate(()=>__test.library.openLibrary('grammar'));
 const archiveDownload=p.waitForEvent('download');await p.getByRole('button',{name:'Export retired assessment archive',exact:true}).click();
 assert.deepEqual(JSON.parse(readFileSync(await (await archiveDownload).path(),'utf8')),old.attempt);await p.locator('#libraryClose').click();
 for(const day of [1,6,7,14])for(const pace of [0,4,24]) {
  await p.evaluate(({day,pace})=>{const t=__test;t.reset(pace);t.state.progress.tutorialDone=true;for(let n=1;n<day;n++)t.progression.completeChallengeOnce(t.state.progress,n,[7,14].includes(n)?25:15);t.state.day=day;t.challenge.startChallenge(day)},{day,pace});
  if(day===6)assert(!/[موږتاسې]/.test((await p.locator("#challengeScene").innerText()).replace(/[A-Za-z]/g,"")),"no Pashto-to-English pronoun mapping in the Hills scene");
  const expected=[7,14].includes(day)?25:15;
  for(let n=0;n<expected;n++) {
   const q=await p.evaluate(()=>__test.state.session.questions[__test.state.session.index]);assert(!['choice','address'].includes(q.kind));
   if(q.unstudied){const text=await p.locator('#choices').innerText();const en=await p.evaluate(()=>__test.content.wordById[__test.state.session.questions[__test.state.session.index].id].en);assert(!text.includes(en));}
   await answerCurrent(p);await p.locator('#quizNext').click();
  }
  assert(await p.locator('#resultScreen').isVisible());assert.equal(await p.evaluate(day=>__test.state.progress.challenges[day].best,day),expected);
 }
 assert.deepEqual(b.errors,[]);console.log(width,'PASS all 33 Journal worked references without unlocks; explicit old-attempt export/pause/retire; 1/6/7/14 × paces 0/4/24 public practical completion, thresholds and unknown-meaning masking');
 }finally{await b.close()}
}
