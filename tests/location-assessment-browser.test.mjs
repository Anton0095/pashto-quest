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
   if(!await p.locator(".question-context").evaluate(d=>d.open))await p.locator(".question-context summary").click();
   assert((await p.locator("#lessonDescription").innerText()).includes("Includes assigned vocabulary from unvisited or unfinished locations"));
   const activated=await p.evaluate(()=>({introduced:Object.values(__test.state.progress.library.acquired).reduce((n,r)=>n+r.introducedFormIds.length,0),complete:__test.state.progress.complete,grammar:__test.state.progress.library.grammar}));
   assert(activated.introduced>before.introduced);assert.deepEqual(activated.complete,{});assert(activated.grammar['grammar-day-1']);
   const frozen=await p.evaluate(()=>__test.state.session.questions);
   const coverage=await p.evaluate(()=>{
    const t=__test,s=t.state.session,plan=t.state.progress.library.plans[1];
    const wordQs=s.questions.filter(q=>q.kind==='word'&&(t.content.LIBRARY_DATA.sourceMappings[q.id] || []).length);
    const sentenceLocations=new Set(s.questions.filter(q=>q.generated).flatMap(q=>Object.values(q.generated.generated.slots).flatMap(r=>t.content.zoneKeys.filter(loc=>plan.locationAssignments[loc].includes(r.lemmaId)))));
    return {sentenceLocations:[...sentenceLocations].sort(),counts:t.content.zoneKeys.map(loc=>wordQs.filter(q=>(t.content.LIBRARY_DATA.sourceMappings[q.id] || []).some(ref=>plan.locationAssignments[loc].includes(ref.lemmaId))).length),identities:wordQs.map(q=>t.E.identity(t.content.LIBRARY_DATA,q.id))};
   });
   assert.deepEqual(coverage.counts,[1,1,1,1]);assert.equal(new Set(coverage.identities).size,4);assert.deepEqual(coverage.sentenceLocations,["business","nature","residential","school"]);
   for(let i=0;i<15;i++) {
    const info=await p.evaluate(()=>{const t=__test,q=t.state.session.questions[t.state.session.index];return {q,en:t.content.wordById[q.id].en}});
    if(info.q.unstudied&&!info.q.recognition) {
     assert(await p.locator('#unseenRecall').isVisible());
     assert(!(await p.locator('#choices').innerText()).includes(info.en));
    }
    if(i===1) {
     await p.evaluate(()=>__test.storage.settled());await p.reload();
     assert.deepEqual(await p.evaluate(()=>__test.state.session.questions),frozen);
    }
    if(info.q.kind==='sentence') {
      const rendered=await p.locator('#choices button').allTextContents();
      assert(rendered.includes(info.en),JSON.stringify({partial,index:i,q:info.q,en:info.en,rendered}));
    }
    await answerCurrent(p);
    const actual=await p.evaluate(()=>({introduced:Object.values(__test.state.progress.library.acquired).reduce((n,r)=>n+r.introducedFormIds.length,0),complete:__test.state.progress.complete,grammar:__test.state.progress.library.grammar}));
    assert.deepEqual(actual,activated,'answering changes no activation licenses or completion flags before grading');
    await p.locator('#quizNext').click();
   }
   assert(await p.locator('#resultScreen').isVisible());
   assert.equal(await p.evaluate(()=>__test.state.progress.challenges[1].best),15);
   assert(await p.evaluate(()=>__test.content.zoneKeys.every(loc=>__test.state.progress.complete['1-'+loc])));
  }
  // Restore an older word-only attempt without replacing its frozen questions.
  const old=await p.evaluate(async()=>{
    const t=__test;t.reset();t.state.progress.tutorialDone=true;t.challenge.startChallenge(1);
    const s=t.state.session,word=s.questions.find(q=>q.kind==='word');
    s.questions=Array.from({length:15},()=>JSON.parse(JSON.stringify(word)));delete s.materialUnlockedAtStart;
    t.state.progress.library.acquired={};t.state.progress.library.grammar={};delete t.state.progress.library.plans[1].challengeActivation;
    await t.storage.save();return JSON.parse(JSON.stringify(s.questions));
  });
  await p.reload();assert.deepEqual(await p.evaluate(()=>__test.state.session.questions),old);
  await p.locator('.question-context summary').click();
  assert((await p.locator('#challengeMaterialNotice').innerText()).includes('Your saved questions and score are unchanged'));
  assert(await p.evaluate(()=>__test.learning.availableSentences(1).length>0));
  assert.equal(await p.evaluate(()=>__test.state.session.answered),0);
  assert.deepEqual(b.errors,[]);
  console.log('PASS four-location assessment browser',width,'sentence targets use all four current locations immediately after activation; no visits or unfinished Home study; hidden unknown meanings; exact reload; honest unlocks and successful completion');
 } finally {await b.close()}
}
