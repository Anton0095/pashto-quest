import assert from 'node:assert/strict';
import {runtime,reset,plain,study,beginAttempt} from './runtime-fixture.mjs';
const t=runtime();reset(t);
const fresh=plain(t.state.progress);assert.equal(t.progression.activateChallenge(t.state.progress,2),null);assert.deepEqual(plain(t.state.progress),fresh,'future challenge activation is denied');
study(t,1,"school");const baseline=plain(t.state.progress);
const plan=t.E.ensurePlan(t.state.progress,t.content.LIBRARY_DATA,1),assigned=plain(plan.locationAssignments),xp=t.state.progress.xp;
const qs=t.questions.selectChallenge(1);
assert.deepEqual(plain(plan.locationAssignments),assigned);assert.equal(t.state.progress.xp,xp);assert.deepEqual(plain(t.state.progress.complete),baseline.complete);assert.deepEqual(plain(t.state.progress.rewards),baseline.rewards);
assert.equal(t.state.progress.library.grammar['grammar-day-1'].source,'visible-workshop-fixture');assert(!t.state.progress.library.grammar['grammar-day-2']);
for(const [loc,ids] of Object.entries(assigned).filter(([loc])=>loc!=="school"))for(const id of ids){
 const r=t.state.progress.library.acquired[id];assert.equal(r.unlock.source,'challenge-start');assert.equal(r.unlock.location,loc);assert.equal(r.unlock.day,1);assert.equal(r.formallyIntroducedDay,undefined);assert.equal(r.masteredAt,undefined);assert.equal(r.totalAttempts,0);assert.equal(r.correctAttempts,0);assert.deepEqual(plain(r.practisedFormIds),[]);
 for(const f of Object.values(r.forms))assert.deepEqual(plain(f),{correctAttempts:0,totalAttempts:0,stage:0,srsDueAt:0});
}
const locations=new Set(qs.filter(q=>q.generated).flatMap(q=>Object.values(q.generated.generated.slots).flatMap(ref=>t.content.zoneKeys.filter(loc=>assigned[loc].includes(ref.lemmaId)))));
assert.deepEqual([...locations].sort(),['business','nature','residential','school']);assert(qs.some(q=>q.kind==='construct'));assert(qs.filter(q=>q.kind==='word'&&!baseline.library.acquired[(t.content.LIBRARY_DATA.sourceMappings[q.id]||[])[0]?.lemmaId]&&!baseline.library.phrases[q.id]).every(q=>q.unstudied),'availability does not claim physical study or expose unknown meanings');
const stable=plain(t.state.progress);t.progression.activateChallenge(t.state.progress,1);assert.deepEqual(plain(t.state.progress),stable);
t.storage.save();const restored=t.storage.load();assert.equal(t.storage.problem,null);assert.deepEqual(plain(restored.library.plans[1].challengeActivation),plain(plan.challengeActivation));
// Cold-load all later frozen generated choices before any of them is displayed.
beginAttempt(t,1);t.storage.save();const cold=runtime();cold.backend.setItem('',t.backend.getItem());cold.state.progress=cold.storage.load();assert.equal(cold.storage.problem,null);
for(const q of cold.state.progress.activeChallenge.questions)for(const id of q.choiceIds || [])assert(cold.content.wordById[id]?.generated);
t.state.session=null;delete t.state.progress.activeChallenge;
// Actual study after activation is recorded per form without replacing its unlock origin.
study(t,1,'residential');t.state.session=null;const afterStudy=t.questions.selectChallenge(1,{newAttempt:true});
assert(afterStudy.filter(q=>q.kind==='word'&&(t.content.LIBRARY_DATA.sourceMappings[q.id]||[]).some(r=>assigned.residential.includes(r.lemmaId))).every(q=>!q.unstudied));
assert(afterStudy.some(q=>q.kind==='word'&&q.unstudied));
const home=t.state.progress.library.acquired[assigned.residential[0]];assert.equal(home.unlock.source,'challenge-start');assert.equal(home.formUnlocks[home.introducedFormIds[0]].studiedDay,1);
const beforeFailure=plain(t.state.progress);t.progression.completeChallengeOnce(t.state.progress,1,0);assert.deepEqual(plain(t.state.progress.library),beforeFailure.library);assert.deepEqual(plain(t.state.progress.complete),beforeFailure.complete);assert.equal(t.state.progress.xp,beforeFailure.xp);
t.progression.completeChallengeOnce(t.state.progress,1,12);const day1Ids=new Set(Object.values(assigned).flat());t.state.day=2;study(t,2,"school");const day2=t.questions.selectChallenge(2,{newAttempt:true}),current=new Set(Object.values(t.state.progress.library.plans[2].locationAssignments).flat());
assert(day2.some(q=>q.generated&&Object.values(q.generated.generated.slots).some(r=>current.has(r.lemmaId))));
const available=t.learning.availableSentences(2);assert(available.some(c=>Object.values(c.generated.slots).some(r=>day1Ids.has(r.lemmaId))));assert(available.some(c=>Object.values(c.generated.slots).some(r=>current.has(r.lemmaId))));
console.log('PASS challenge activation: all current locations available to sentence generation immediately, no visits/grades/XP invented; actual per-form study remains separate; idempotence, cold save, failure retention, future-day denial and cumulative current/previous vocabulary');
