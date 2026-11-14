import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runtime,reset,study,plain} from './runtime-fixture.mjs';
const orders=[['residential','nature','business'],['residential','business','nature'],['nature','residential','business'],['nature','business','residential'],['business','residential','nature'],['business','nature','residential']];
let lessons=0;
for(const pace of [8,12,16,20,24])for(const order of orders){
 const t=runtime();reset(t,pace);const seen=new Set();
 for(let day=1;day<=14;day++){
  t.state.day=day;
  for(const loc of t.content.zoneKeys)assert.equal(t.learning.placeAccessible(day,loc),loc==='school',`${day}/${loc} before School`);
  assert.equal(t.progression.challengeAccessible(t.state.progress,day),false);
  assert.equal(t.progression.activateChallenge(t.state.progress,day),null);
  assert.equal(t.questions.selectChallenge(day).length,0,'No direct challenge generation before School');
  const plan=t.E.ensurePlan(t.state.progress,t.content.LIBRARY_DATA,day),ids=Object.values(plan.locationAssignments).flat();
  assert.equal(ids.length,day===14?0:pace);assert.equal(new Set(ids).size,ids.length);assert.equal(plan.contentGap,false);
  assert.deepEqual(plain(plan.shortfalls),{residential:0,business:0,nature:0,school:0});
  for(const [loc,assigned] of Object.entries(plan.locationAssignments)){
   assert.equal(assigned.length,t.E.quotas(day,plan.requestedDailyTarget)[loc]);
   for(const id of assigned){assert(!seen.has(id),'Distinct entries count once across days');seen.add(id);const e=t.content.libraryEntries[id];
    if(day===1)assert(['noun','adjective'].includes(e.partOfSpeech));
    if(day===2&&assigned.indexOf(id)<2)assert.equal(e.partOfSpeech,'verb');
    if(day>=3)assert.equal(e.partOfSpeech,{residential:'adjective',nature:'verb',business:'noun'}[loc]);
   }
   if(day===1&&loc!=='school')assert.deepEqual(new Set(assigned.map(id=>t.content.libraryEntries[id].partOfSpeech)),new Set(['noun','adjective']));
  }
  const school=study(t,day,'school');lessons++;
  assert(t.state.progress.library.grammar['grammar-day-'+day]);
  assert(t.progression.challengeAccessible(t.state.progress,day));
  for(const loc of t.content.zoneKeys)assert(t.learning.placeAccessible(day,loc));
  if(day<=3)assert(school.generatedPractice.length>0,`School ${day}/${pace} generates without optional lessons`);
  for(const card of school.generatedPractice)for(const r of Object.values(card.generated.slots))assert(!['residential','nature','business'].some(loc=>plan.locationAssignments[loc].includes(r.lemmaId)),'School does not borrow unfinished vocabulary');
  for(const loc of order){
   const s=study(t,day,loc);lessons++;
   for(const c of s.generatedPractice){assert(c.generated.requiredGrammarIds.every(g=>t.state.progress.library.grammar[g]));for(const r of Object.values(c.generated.slots))assert(t.state.progress.library.acquired[r.lemmaId].availableFormIds.includes(r.formId));}
  }
  assert(t.progression.completeRound(t.state.progress,day));
  t.progression.completeChallengeOnce(t.state.progress,day,t.progression.getChallengeSpec(day).questionCount);
 }
 assert.equal(seen.size,pace*13);
 assert(t.storage.currentSave(plain(t.state.progress)),'Save validates at each unequal allocation');
}
// Failed shortcut retains availability but never fabricates study, completion or rewards.
for(const day of [1,2,3,6,7,14]){
 const t=runtime();reset(t);for(let d=1;d<day;d++){study(t,d,'school');t.progression.activateChallenge(t.state.progress,d);t.progression.completeChallengeOnce(t.state.progress,d,t.progression.getChallengeSpec(d).questionCount);}
 study(t,day,'school');const p=t.state.progress,plan=p.library.plans[day];const schoolXP=p.xp;
 const qs=t.questions.selectChallenge(day);assert.equal(qs.length,t.progression.getChallengeSpec(day).questionCount);
 const assigned=Object.entries(plan.locationAssignments).filter(([loc])=>loc!=='school').flatMap(([,ids])=>ids);
 assert.equal(new Set(assigned).size,assigned.length);
 t.progression.completeChallengeOnce(p,day,0);assert.equal(p.xp,schoolXP);
 for(const loc of orders[0])assert(!p.complete[day+'-'+loc]);
 for(const id of assigned){assert(!p.library.acquired[id]?.formallyIntroducedDay);assert(!t.E.inBank(p,id));}
 const home=study(t,day,'residential');
 for(const c of home.generatedPractice)for(const ref of Object.values(c.generated.slots))assert(t.E.inBank(p,ref.lemmaId),'A lesson after failed activation uses studied/passed vocabulary');
 for(const loc of ['nature','business'])for(const id of plan.locationAssignments[loc])assert(!t.E.inBank(p,id),'Studying Home cannot award skipped Nature/Market words');
 const result=t.progression.completeChallengeOnce(p,day,t.progression.getChallengeSpec(day).passCount);
 assert(result.firstPass);for(const loc of t.content.zoneKeys)assert(p.complete[day+'-'+loc]);
 for(const id of assigned){assert(t.E.inBank(p,id));assert(p.library.acquired[id].availableFormIds.length);if(!p.library.acquired[id].formallyIntroducedDay)assert.equal(p.library.acquired[id].totalAttempts,0);}
 const xp=p.xp;t.progression.completeChallengeOnce(p,day,t.progression.getChallengeSpec(day).questionCount);assert.equal(p.xp,xp);
 assert(t.storage.currentSave(plain(p)));
}
const world=JSON.parse(readFileSync('content/RPG_WORLD.json'));
for(const c of Object.values(world.days)){assert.equal(c.guidance.introLessonId,c.day+'-school');assert.deepEqual(c.requiredLessons,c.lessons);}
assert(world.days['6'].maps.includes('hills'));assert(world.events['day6-opening']);
console.log(`PASS school-first: ${lessons} real model lessons, all 6 optional orders, 5 paces, 14 days, distinct POS allocation, independent generation, shortcut failure/pass/rewards/save and Hills registration`);
// Earlier saves are intentionally unsupported and never silently overwritten.
const old=runtime(),raw=JSON.stringify({saveSchemaVersion:8,xp:123});old.backend.setItem('',raw);old.storage.load();assert(old.storage.problem);assert.equal(old.storage.save(),false);assert.equal(old.backend.getItem(),raw);
