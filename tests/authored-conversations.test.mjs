import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runtime,reset,study,plain,beginAttempt} from './runtime-fixture.mjs';
const M=createRequire(import.meta.url)('../work/rpg-model.cjs');
const data=JSON.parse(readFileSync('content/RPG_WORLD.json')),spec=data.conversations.bilal;
let available=0,guarded=0;
for(const pace of [8,12,16,20,24]){
 const t=runtime();reset(t,pace);
 for(let day=1;day<=7;day++){
  t.state.day=day;const s=spec.days[day];
  // Even an activation-only pass must not impersonate actual Lake completion.
  t.progression.activateChallenge(t.state.progress,day);
  let pool=t.learning.availableSentences(day),event=M.conversationEvent(s,data.events,pool,false);
  if(day<=3)assert.equal(event.id,s.greetingEvent);
  for(const loc of t.content.zoneKeys)study(t,day,loc);
  pool=t.learning.availableSentences(day);const before=JSON.stringify(t.state.progress);
  const choices=M.conversationChoices(s,pool,t.Q.randomFor(day*pace));
  if(choices.length){
   available++;assert.equal(M.conversationChoices({...s,distractors:{...s.distractors,count:0}},pool,t.Q.randomFor(day)).length,1);assert(choices.length<=4);assert.equal(new Set(choices.map(a=>a.label)).size,choices.length);
   const correct=choices.filter(a=>a.nextEvent===s.correctEvent);assert.equal(correct.length,1);assert.equal(correct[0].label,s.response.pashto);
   for(const a of choices){
    assert(pool.some(c=>c.id===a.card.id));assert.deepEqual(plain(t.S.restoreCard(t.content.LIBRARY_DATA,t.content.LIBRARY_DATA.sentenceFrames,a.card)),plain(a.card));
    assert(a.card.generated.requiredGrammarIds.every(g=>t.state.progress.library.grammar[g]));
    if(a.nextEvent===s.incorrectEvent)assert(Object.values(a.card.generated.slots).every(ref=>!s.distractors.excludeLemmas.includes(ref.lemmaId)));
   }
   event=M.conversationEvent(s,data.events,pool,true,undefined,t.Q.randomFor(day));assert.equal(event.id,s.event);
  }else {guarded++;event=M.conversationEvent(s,data.events,pool,true);assert.equal(event.id,s.greetingEvent,'missing language fails closed');}
  assert.equal(JSON.stringify(t.state.progress),before,'conversation reads never write learning state');
  assert.equal(M.conversationEvent(s,data.events,pool,true).id,choices.length?s.event:s.greetingEvent);
  assert.equal(M.conversationEvent(s,data.events,pool,true,s.incorrectEvent).id,s.incorrectEvent,'a paused reaction resumes before repeats');
  assert.notEqual(data.events[s.correctEvent].pashto.ps,data.events[s.incorrectEvent].pashto.ps);
  for(const id of [s.event,s.correctEvent,s.incorrectEvent,s.conclusionEvent,s.repeatEvent]){
   const e=data.events[id];assert.equal(e.pashto.ps,e.lines[0]);assert(e.pashto.roman);assert.equal(e.languageReview.userVerified,false);
  }
  t.progression.completeChallengeOnce(t.state.progress,day,day===7?25:15);
 }
}
const fresh=runtime();reset(fresh);fresh.progression.completeChallengeOnce(fresh.state.progress,1,15);study(fresh,2,"school");fresh.progression.activateChallenge(fresh.state.progress,2);
assert(fresh.state.progress.library.acquired['lemma:v-see']?.availableFormIds.includes('lemma:v-see:present:2'));
assert(!fresh.state.progress.library.acquired['lemma:v-see']?.availableFormIds.includes('lemma:v-see:present:0'));
assert(!fresh.learning.availableSentences(1).some(c=>/see/.test(c.en)));
console.log(`PASS authored conversations: ${available} playable / ${guarded} language-guarded day/pace cases, exact intended replies, licensed distinct irrelevant alternatives, lesson/repeat/reaction gates, zero learning writes, Day-2 third-/Day-3 first-person boundary`);
