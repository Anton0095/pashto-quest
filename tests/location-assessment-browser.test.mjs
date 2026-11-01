import assert from 'node:assert/strict';
import {setup,tutorial,answerCurrent} from './browser-fixture.mjs';
for(const width of [375,1280]) {
 const b=await setup({width});const p=b.page;
 try {
  await tutorial(p);
  for(const partial of [false,true]) {
   if(partial) await p.evaluate(()=>{
    const t=__test;t.reset();t.state.progress.tutorialDone=true;t.lessons.begin('1-residential');
    let guard=0;
    while(t.state.session.phase!=='lexical' || t.state.session.cardIndex<t.state.session.studyWords.length-1) {
     if(++guard>100)throw Error('Partial study stalled');t.lessons.afterStudy();
    }
    t.world.startWorld();
   });
   const before=await p.evaluate(()=>({introduced:Object.values(__test.state.progress.library.acquired).reduce((n,r)=>n+r.introducedFormIds.length,0),complete:__test.state.progress.complete,grammar:__test.state.progress.library.grammar}));
   assert.deepEqual(before.complete,{});assert.deepEqual(before.grammar,{});
   await p.evaluate(()=>__test.challenge.startChallenge(1));
   assert((await p.locator("#lessonDescription").innerText()).includes("Includes assigned vocabulary from unvisited or unfinished locations"));
   const frozen=await p.evaluate(()=>__test.state.session.questions);
   const coverage=await p.evaluate(()=>{
    const t=__test,s=t.state.session,plan=t.state.progress.library.plans[1];
    const wordQs=s.questions.filter(q=>(t.content.LIBRARY_DATA.sourceMappings[q.id] || []).length);
    return {counts:t.content.zoneKeys.map(loc=>wordQs.filter(q=>(t.content.LIBRARY_DATA.sourceMappings[q.id] || []).some(ref=>plan.locationAssignments[loc].includes(ref.lemmaId))).length),identities:wordQs.map(q=>t.E.identity(t.content.LIBRARY_DATA,q.id))};
   });
   assert.deepEqual(coverage.counts,[4,4,3,3]);assert.equal(new Set(coverage.identities).size,14);
   for(let i=0;i<15;i++) {
    const info=await p.evaluate(()=>{const t=__test,q=t.state.session.questions[t.state.session.index];return {q,en:t.content.wordById[q.id].en}});
    if(info.q.unstudied) {
     assert(await p.locator('#unseenRecall').isVisible());
     assert(!(await p.locator('#choices').innerText()).includes(info.en));
    }
    if(i===1) {
     await p.evaluate(()=>__test.storage.settled());await p.reload();
     assert.deepEqual(await p.evaluate(()=>__test.state.session.questions),frozen);
    }
    await answerCurrent(p);
    const actual=await p.evaluate(()=>({introduced:Object.values(__test.state.progress.library.acquired).reduce((n,r)=>n+r.introducedFormIds.length,0),complete:__test.state.progress.complete,grammar:__test.state.progress.library.grammar}));
    assert.deepEqual(actual,before,'target presentation/grading does not unlock skipped material before the final pass');
    await p.locator('#quizNext').click();
   }
   assert(await p.locator('#resultScreen').isVisible());
   assert.equal(await p.evaluate(()=>__test.state.progress.challenges[1].best),15);
   assert(await p.evaluate(()=>__test.content.zoneKeys.every(loc=>__test.state.progress.complete['1-'+loc])));
  }
  assert.deepEqual(b.errors,[]);
  console.log('PASS four-location assessment browser',width,'14 distinct balanced scheduled targets with no visits or unfinished Home study; hidden unknown meanings; exact reload; no early unlocks; successful completion');
 } finally {await b.close()}
}
