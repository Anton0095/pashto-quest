import assert from 'node:assert/strict';
import {runtime, reset, plain, beginAttempt, correctAnswer} from './runtime-fixture.mjs';
for (const message of ['QuotaExceededError','SecurityError','Storage unavailable']) {
 const t=runtime();reset(t);const stored=t.backend.setItem.bind(t.backend);t.storage.save();
 const notices=[];t.storage.onPersistenceChange(n=>notices.push(n));
 t.state.progress.xp=125;beginAttempt(t,1);t.learning.submitChallenge(correctAnswer(t,t.state.session.questions[0]));
 t.storage.save();const original=t.backend.getItem();t.state.progress.xp++;const memory=plain(t.state.progress);t.backend.setItem=()=>{throw Error(message)};
 assert.equal(t.storage.save(),false);assert(t.storage.persistenceProblem);assert.equal(t.storage.problem,null);
 assert.equal(t.backend.getItem(),original);assert.deepEqual(plain(t.state.progress),memory);
 t.backend.setItem=stored;assert.equal(t.storage.save(),true);assert.equal(t.storage.persistenceProblem,null);
 const reloaded=t.storage.load();assert.equal(reloaded.xp,t.state.progress.xp);assert.deepEqual(plain(reloaded.activeChallenge),plain(t.state.session));assert.equal(notices.at(-1),null);
 console.log('PASS storage failure/recovery',message);
}
{
 const t=runtime(),get=t.backend.getItem.bind(t.backend),set=t.backend.setItem.bind(t.backend);
 t.backend.getItem=()=>{throw Error('SecurityError')};t.state.progress=t.storage.load();t.state.progress.xp=45;
 assert(t.storage.persistenceProblem);assert.equal(t.storage.save(),false);assert.equal(t.storage.problem,null);
 t.backend.getItem=get;assert(t.storage.save());assert.equal(t.storage.load().xp,45);
 t.backend.setItem=()=>{};t.state.progress.xp=46;assert.equal(t.storage.save(),false,'Silent no-op write must be detected');
 t.backend.setItem=set;assert(t.storage.save());
 console.log('PASS denied reads, no-op writes and recovery');
}
{
 const t=runtime();t.storage.save();const original=t.backend.getItem(), get=t.backend.getItem.bind(t.backend);
 t.backend.getItem=()=>{throw Error('Read denied')};t.state.progress=t.storage.load();t.state.progress.xp=99;
 t.backend.getItem=get;assert.equal(t.storage.save(),false,'Unread existing data must never be overwritten');assert.equal(t.backend.getItem(),original);
 assert.equal(JSON.parse(t.storage.snapshot()).xp,99,'Export preserves in-memory progress');
 assert.equal(t.storage.load().xp,0,'Reload recovers original save');
 console.log('PASS unread existing save preserved, memory export, reload recovery');
}
{
 const t=runtime();t.backend.setItem('', '{broken');t.state.progress=t.storage.load();assert(t.storage.problem);assert.equal(t.storage.persistenceProblem,null);
 assert.equal(t.storage.save(),false);assert.equal(t.backend.getItem(),'{broken');
 t.storage.resetProblem();t.state.progress=t.progression.fresh();assert(t.storage.save());
 console.log('PASS corruption distinct from persistence failure; explicit reset only');
}
