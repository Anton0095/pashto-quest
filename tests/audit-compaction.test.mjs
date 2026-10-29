import assert from 'node:assert/strict';
import {runtime,reset,study,plain,beginAttempt,correctAnswer} from './runtime-fixture.mjs';
const t=runtime();reset(t);study(t,1,'residential');
const id=t.state.session.studySentences[0], card=t.content.wordById[id];
// Older valid schema-7 progress has no optional retirement metadata.
delete t.state.progress.library.retiredAttemptSequence;delete t.state.progress.library.protectedAttemptIds;
assert(t.storage.currentSave(t.state.progress));
const original=plain(t.state.progress), beforeSrs=plain(t.state.progress.library.acquired);
t.state.progress.library.events={};t.state.progress.library.deliveries={};
for(let attempt=1;attempt<=200;attempt++){
 t.state.progress.library.attemptSequence=attempt;
 t.state.progress.library.events[`lesson:${attempt}:0`]=true;
 t.state.progress.library.deliveries[`${attempt}:study:fixture`]={id,day:attempt%2+1,surface:'study',mode:'standard',kind:card.type==='sentence'?'generated_sentence':'lexical_or_interface',family:null};
}
t.state.progress.library.events['editorial:do-not-infer-attempt']=true;
t.state.session={attemptId:200,mode:'standard'};
const selection=()=>t.learning.generatedPractice(1,9271,10,{excludeTexts:Object.values(t.state.progress.library.deliveries).filter(r=>r.mode==='standard'&&r.surface==='study').map(r=>t.content.wordById[r.id].ps)}).map(c=>c.ps);
const beforeSelection=plain(selection());
t.storage.save();
const l=t.state.progress.library;
assert.deepEqual(Object.keys(l.events).sort(),['editorial:do-not-infer-attempt','lesson:200:0']);
assert.equal(Object.keys(l.deliveries).length,2);
assert.equal(Object.values(l.deliveries).reduce((n,r)=>n+(r.count||1),0),200);
assert(l.deliveries['200:study:fixture']);
assert.deepEqual(plain(l.acquired),beforeSrs);assert.equal(t.state.progress.xp,original.xp);
assert(t.storage.currentSave(t.state.progress));
assert.equal(t.E.practise(t.state.progress,t.content.LIBRARY_DATA,id,true,{day:1,source:'review',eventId:'lesson:1:99'}),false,'Retired attempt may never grade again, even an unrecorded index');
const protectedRow=plain(l.deliveries['200:study:fixture']);t.storage.save();assert.deepEqual(plain(l.deliveries['200:study:fixture']),protectedRow);
t.state.session=null;t.storage.save();assert.equal(Object.keys(l.deliveries).length,1);
assert.equal(Object.values(l.deliveries)[0].count,200);assert.equal(Object.values(l.deliveries)[0].day,1);assert.equal(Object.values(l.deliveries)[0].lastDay,2);
for(let attempt=201;attempt<=400;attempt++){
 l.attemptSequence=attempt;l.events[`lesson:${attempt}:0`]=true;
 l.deliveries[`${attempt}:study:fixture`]={...protectedRow};
 t.storage.save();
}
assert.equal(Object.keys(l.deliveries).length,1);assert.equal(Object.values(l.deliveries)[0].count,400);
assert.deepEqual(plain(l.acquired),beforeSrs);assert.deepEqual(plain(l.units),original.library.units);assert.deepEqual(plain(t.state.progress.rewards),original.rewards);assert(t.storage.currentSave(t.storage.load()));
assert.equal(t.learning.deliverySummary().generatedSentences,400);assert.deepEqual(plain(selection()),beforeSelection,'Compaction preserves actual standard-study text exclusions and seeded draws');
console.log('PASS closed history bounded by distinct delivery identity; 400 attempts preserve counts, SRS, XP, exclusions and replay protection');
{
 const t=runtime();reset(t);study(t,1,'residential');beginAttempt(t,1);
 t.learning.submitChallenge(correctAnswer(t,t.state.session.questions[0]));t.storage.save();
 const frozen=plain(t.state.progress.activeChallenge),events=plain(t.state.progress.library.events);
 // A lesson is current while the old assessment remains paused.
 study(t,1,'nature');t.storage.save();
 assert.deepEqual(plain(t.state.progress.activeChallenge),frozen);
 for(const [key,v] of Object.entries(events))if(key.startsWith(`challenge:${frozen.attemptId}:`))assert.equal(t.state.progress.library.events[key],v);
 assert(t.state.progress.library.protectedAttemptIds.includes(frozen.attemptId));
 assert(t.storage.currentSave(t.storage.load()));
 const bad=plain(t.state.progress);bad.library.protectedAttemptIds=[];assert.equal(t.storage.currentSave(bad),false);
 for(const mutate of [p=>p.library.retiredAttemptSequence=-1,p=>p.library.retiredAttemptSequence=p.library.attemptSequence+1,p=>p.library.protectedAttemptIds=[1,1],p=>Object.values(p.library.deliveries)[0].count=0]){const p=plain(t.state.progress);mutate(p);assert.equal(t.storage.currentSave(p),false)}
 console.log('PASS paused assessment questions/locks/events survive compaction; invalid retirement metadata rejected');
}
{
 const t=runtime();let writes=0;const set=t.backend.setItem.bind(t.backend);t.backend.setItem=(...args)=>{writes++;return set(...args)};
 assert(t.storage.save());const first=writes;
 for(let i=0;i<20;i++)assert(t.storage.save());assert.equal(writes,first,'Unchanged durable saves do not rewrite');
 t.state.progress.xp++;assert(t.storage.save());assert.equal(writes,first+1);
 const raw=t.backend.getItem();t.backend.setItem('',raw+' ');assert.equal(t.storage.save(),false,'Even unchanged-save optimization must check for external writes');
 assert.equal(t.backend.getItem(),raw+' ');
 console.log('PASS unchanged saves avoid writes; changed responses stay synchronous; external changes still block');
}
