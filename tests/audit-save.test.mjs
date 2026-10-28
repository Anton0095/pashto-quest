import assert from 'node:assert/strict';
import {runtime,reset,study,plain} from './runtime-fixture.mjs';
const t=runtime();reset(t);study(t,1,'residential');
assert(t.storage.currentSave(plain(t.state.progress)));
for(const mutate of [p=>delete p.library.plans[1].shortfalls,p=>p.library.plans[1].shortfalls.residential='0',p=>p.library.dayExposure[1].incidentalStoryLemmas='bad',p=>Object.values(p.library.units)[0].stage='bad',p=>Object.values(p.library.acquired)[0].forms=null,p=>p.library.seed=null,p=>{const q=t.questions.selectChallenge(1);p.library.plans[1].challengeQuestions=plain(q);p.library.plans[1].challengeQuestions[0].choiceOrder={bad:true}}]){
 const p=plain(t.state.progress);mutate(p);assert.equal(t.storage.currentSave(p),false);t.backend.setItem('',JSON.stringify(p));t.state.progress=t.storage.load();assert(t.storage.problem);const raw=t.backend.getItem();assert.equal(t.storage.save(),false);assert.equal(t.backend.getItem(),raw);t.storage.resetProblem();reset(t);study(t,1,'residential');
}
console.log('PASS nested save rejection, raw preservation and valid schema-7 progress');
