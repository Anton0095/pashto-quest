import assert from 'node:assert/strict';
import {runtime,reset,beginAttempt,plain}from'./runtime-fixture.mjs';
const t=runtime({seedSource:()=>12345});
for(const pace of [8,24])for(const day of [1,2,7]){
 reset(t,pace);t.state.day=day;
 for(let d=1;d<day;d++)t.progression.completeChallengeOnce(t.state.progress,d,t.progression.getChallengeSpec(d).questionCount);
 beginAttempt(t,day);const qs=t.state.session.questions;
 const typed=q=>q.kind==='word'&&q.unstudied&&!q.recognition;
 assert(qs.slice(0,3).every(q=>!typed(q)));
 for(let i=1;i<qs.length;i++)assert(!(typed(qs[i])&&typed(qs[i-1])));
 for(const q of qs)if(t.content.wordById[q.id].type==='greeting'){
  assert.equal(q.kind,'word');assert(q.recognition);assert(['ps-en','en-ps'].includes(q.direction));
  assert.equal(q.choiceOrder.filter(v=>t.Q.evaluate(q,t.content.wordById[q.id],v)).length,1);
 }
 const frozen=plain(qs);assert.deepEqual(plain(t.questions.selectChallenge(day)),frozen);
 assert.equal(t.content.NARRATIVE_DATA.expressions.some(p=>!p.active),false);
 for(const id of ['phrase-d1-lake-name','phrase-d1-market-price','phrase-d1-school-what']){
  assert(!t.content.wordById[id]);assert(!t.content.LIBRARY_DATA.phrases.some(p=>p.id===id));assert(!qs.some(q=>q.id===id));
 }
 t.storage.save();assert.equal(t.storage.problem,null);assert.deepEqual(plain(t.storage.load().activeChallenge.questions),frozen);
}
console.log('PASS new openings, typed spacing, phrase translations, small/default pools, frozen attempts and current-save validation');

const {createRequire}=await import('node:module');const M=createRequire(import.meta.url)('../work/rpg-model.cjs');
const {readFileSync}=await import('node:fs');const data=JSON.parse(readFileSync('content/RPG_WORLD.json'));
assert.deepEqual(M.dailySpawn(data),{map:'house',x:17,y:10,facing:'left'});
const c=data.days[2],p={complete:{},challenges:{}};const progression={passedChallenge:p=>!!p.challenges[2]?.passed};
assert(M.dailyGuidance(c,p,progression).includes('Ms Hameed'));
p.complete['2-school']=true;assert(M.dailyGuidance(c,p,progression).includes('Remaining:'));
p.challenges[2]={passed:true};assert(M.dailyGuidance(c,p,progression).includes('sleep'));
assert(M.dailyGuidance({...c,guidance:undefined},p,progression).includes('sleep'));
console.log('PASS central bed spawn and configured/fallback progress-sensitive guidance');

const ready={complete:Object.fromEntries(c.lessons.map(id=>[id,true])),challenges:{}};
assert(M.dailyGuidance(c,ready,progression,[], 'Home — Muhammad Jan').includes('Home — Muhammad Jan'));
