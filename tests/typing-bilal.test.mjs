import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runtime,reset,study,beginAttempt,correctAnswer,plain} from './runtime-fixture.mjs';
const M=createRequire(import.meta.url)('../work/rpg-model.cjs');
const data=JSON.parse(readFileSync('content/RPG_WORLD.json'));
// Typing replacement coverage lives in typing-languages.test.mjs.
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
  const eligible=M.conversationEligible(t.state.progress,day,t.progression),expected=true;
  assert.equal(eligible,expected);
  const before=plain(t.state.progress),pool=t.learning.availableSentences(day),fallback=t.learning.authoredResponse(spec.response.generatedId,day);
  assert(fallback,`day ${day} validated fallback`);
  assert.equal(fallback.ps,spec.response.pashto);assert.equal(fallback.en,spec.response.meaning);
  const event=M.conversationEvent(spec,data.events,pool,eligible,undefined,t.Q.randomFor(day),fallback);
  assert.equal(event.id,expected?spec.event:spec.greetingEvent);routes++;
  if(eligible){
   assert(event.event.pashto.ps.startsWith('سلام! '));
   const choices=event.event.actions;assert.equal(choices.filter(a=>a.nextEvent===spec.correctEvent).length,1);assert(choices.length<=4);
   for(const a of choices){assert.deepEqual(plain(t.S.restoreCard(t.content.LIBRARY_DATA,t.content.LIBRARY_DATA.sentenceFrames,a.card)),plain(a.card));if(a.nextEvent===spec.incorrectEvent)assert(pool.some(c=>c.id===a.card.id));}
   const tiny=M.conversationEvent(spec,data.events,[],true,undefined,()=>0.5,fallback);assert.equal(tiny.id,spec.event);assert.equal(tiny.event.actions.length,1);sparse++;
   assert.equal(M.conversationEvent(spec,data.events,pool,true,spec.incorrectEvent).id,spec.incorrectEvent);
   assert.equal(M.conversationEvent(spec,data.events,pool,true,undefined,t.Q.randomFor(day),fallback).id,spec.event);
   assert.notEqual(data.events[spec.correctEvent].pashto.ps,data.events[spec.incorrectEvent].pashto.ps);
  }
  assert.deepEqual(plain(t.state.progress),before,'all conversation compilation/routing is read-only');
  t.progression.completeChallengeOnce(t.state.progress,day,t.progression.getChallengeSpec(day).passCount);
 }
}
console.log(`PASS typing/Bilal: ${routes} day/pace/eligibility routes and ${sparse} intended-only sparse conversations`);
