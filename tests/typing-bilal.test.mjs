import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runtime,reset,study,beginAttempt,correctAnswer,plain} from './runtime-fixture.mjs';
const M=createRequire(import.meta.url)('../work/rpg-model.cjs');
const data=JSON.parse(readFileSync('content/RPG_WORLD.json'));
for(const skip of [false,true]){
 const t=runtime(),id='tutorial-guide-name';
 t.state.session={mode:'tutorial',passed:new Set(),firstAsked:new Set(),answered:0,firstCorrect:0,tutorialResponses:0,earned:0,attemptId:1};
 t.learning.submitTutorial(id,false);assert.equal(t.state.progress.enableTypingChallenges,false);
 const before=plain(t.state.progress);
 if(skip)t.state.progress.enableTypingChallenges=true;
 t.learning.submitTutorial(id,!skip,{skipped:skip});
 assert.equal(t.state.progress.enableTypingChallenges,!skip);
 assert.equal(t.state.session.passed.has(id),!skip);assert.equal(t.state.session.skippedItems?.includes(id)||false,skip);
 assert.deepEqual(plain(t.state.progress.library),before.library);
 assert.equal(t.state.progress.xp-before.xp,skip?0:10);
 const after=plain(t.state.progress);t.learning.submitTutorial(id,true);assert.deepEqual(plain(t.state.progress),after);
}
// A skipped typed assessment item consumes exactly one position and no learning transaction.
for(const day of [1,7]){
 const t=runtime({seedSource:()=>4321});reset(t);t.state.progress.enableTypingChallenges=true;
 for(let d=1;d<day;d++)t.progression.completeChallengeOnce(t.state.progress,d,t.progression.getChallengeSpec(d).passCount);
 beginAttempt(t,day);const s=t.state.session,frozen=plain(s.questions);let skipped=0;
 for(const q of s.questions){
  s.locked=false;s.tileSequence=q.tileSequence;s.built=[];const before=plain(t.state.progress),n=s.correctCount;
  const result=t.learning.submitChallenge(q.answerFormat==='type'?'':correctAnswer(t,q),{skipped:q.answerFormat==='type'});
  assert(result);
  if(q.answerFormat==='type'){
   skipped++;assert.equal(result.correct,false);assert.equal(result.gain,0);assert.equal(s.correctCount,n);
   assert.deepEqual(plain(t.state.progress),before,'skip does not write XP, rewards, acquisition or SRS');
   assert.equal(t.learning.submitChallenge('',{skipped:true}),null,'locked duplicate is ignored');
  }
  t.storage.save();const loaded=t.storage.load();assert.equal(t.storage.problem,null);
  assert.deepEqual(plain(loaded.activeChallenge.questions),frozen);
  assert.deepEqual(plain(loaded.activeChallenge.skippedQuestions||[]),plain(s.skippedQuestions||[]));
  assert.equal(loaded.activeChallenge.correctCount,s.correctCount);
  s.index++;
 }
 assert.equal(s.answered,s.questions.length);assert.equal(s.correctCount,s.questions.length-skipped);
 assert.equal(skipped,day===1?5:8);assert.equal(t.state.progress.enableTypingChallenges,true);
 const reward=t.progression.completeChallengeOnce(t.state.progress,day,s.correctCount);assert.equal(reward.passed,false);
 const before=plain(t.state.progress.library);t.progression.completeChallengeOnce(t.state.progress,day,s.correctCount);assert.deepEqual(plain(t.state.progress.library),before);
}
// Ordinary lesson skip consumes its queue item without retry, correctness, practice or preference change.
{
 const t=runtime();reset(t);t.state.progress.enableTypingChallenges=true;const id=t.learning.libraryLessonPool(1,'nature')[0];
 t.state.session={mode:'standard',id:'1-nature',loc:'nature',loop:1,attemptId:++t.state.progress.library.attemptSequence,queue:[{id,kind:'word',answerFormat:'type',retries:0}],required:[id],passed:new Set(),firstAsked:new Set(),answered:0,firstCorrect:0,earned:0,locked:false};
 const before=plain(t.state.progress),result=t.learning.submitLesson('',{skipped:true});
 assert.equal(result.gain,0);assert.equal(result.correct,false);assert.equal(t.state.session.queue.length,0);assert.equal(t.state.session.passed.size,0);assert.deepEqual(plain(t.state.session.skippedItems),[id]);assert.deepEqual(plain(t.state.progress),before);
}
let routes=0,sparse=0;
for(const pace of [8,12,16,20,24])for(const route of ['lake','pass','failed','none']){
 const t=runtime();reset(t,pace);
 for(let day=1;day<=7;day++){
  t.state.day=day;study(t,day,"school");const spec=data.conversations.bilal.days[day];t.progression.activateChallenge(t.state.progress,day);
  if(route==='lake')study(t,day,'nature');
  if(route==='pass'||route==='failed'){
   const before=plain(t.state.progress.library);t.progression.completeChallengeOnce(t.state.progress,day,route==='pass'?t.progression.getChallengeSpec(day).passCount:0);
   assert.deepEqual(plain(t.state.progress.library),before,'challenge pass does not invent study or mastery');
  }
  const eligible=!!t.state.progress.complete[day+'-nature']||t.progression.passedChallenge(t.state.progress,day),expected=route==='lake'||route==='pass';
  assert.equal(eligible,expected);
  const before=plain(t.state.progress),pool=t.learning.availableSentences(day),fallback=t.learning.authoredResponse(spec.response.generatedId,day);
  assert(fallback,`day ${day} validated fallback`);
  assert.equal(fallback.ps,spec.response.pashto);assert.equal(fallback.en,spec.response.meaning);
  const event=M.conversationEvent(spec,data.events,pool,eligible,false,undefined,t.Q.randomFor(day),fallback);
  assert.equal(event.id,expected?spec.event:spec.greetingEvent);routes++;
  if(eligible){
   assert(event.event.pashto.ps.startsWith('سلام! '));
   const choices=event.event.actions;assert.equal(choices.filter(a=>a.nextEvent===spec.correctEvent).length,1);assert(choices.length<=4);
   for(const a of choices){assert.deepEqual(plain(t.S.restoreCard(t.content.LIBRARY_DATA,t.content.LIBRARY_DATA.sentenceFrames,a.card)),plain(a.card));if(a.nextEvent===spec.incorrectEvent)assert(pool.some(c=>c.id===a.card.id));}
   const tiny=M.conversationEvent(spec,data.events,[],true,false,undefined,()=>0.5,fallback);assert.equal(tiny.id,spec.event);assert.equal(tiny.event.actions.length,1);sparse++;
   assert.equal(M.conversationEvent(spec,data.events,pool,true,true,spec.incorrectEvent).id,spec.incorrectEvent);
   assert.equal(M.conversationEvent(spec,data.events,pool,true,true).id,spec.repeatEvent);
   assert.notEqual(data.events[spec.correctEvent].pashto.ps,data.events[spec.incorrectEvent].pashto.ps);
  }
  assert.deepEqual(plain(t.state.progress),before,'all conversation compilation/routing is read-only');
  t.progression.completeChallengeOnce(t.state.progress,day,t.progression.getChallengeSpec(day).passCount);
 }
}
console.log(`PASS typing/Bilal: tutorial correct/wrong/skip, 15/25 frozen skipped scoring/reload/duplicate guards, ordinary lesson no-write skip; ${routes} day/pace/eligibility routes and ${sparse} intended-only sparse conversations`);
