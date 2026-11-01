import assert from 'node:assert/strict';
import {runtime} from './runtime-fixture.mjs';
// A deterministic origin-wide queue; pause both writers before either guard.
const t=runtime();let chain=Promise.resolve();
const locks={request(name,options,callback){const job=chain.then(callback);chain=job.catch(()=>{});return job}};
const stateA={...t.state,progress:t.progression.fresh()},stateB={...t.state,progress:t.progression.fresh()};
const make=state=>t.createStorage({state,content:t.content,progression:t.progression,backend:t.backend,locks});
const a=make(stateA),b=make(stateB);stateA.progress=a.load();stateB.progress=b.load();
stateA.progress.xp=45;stateB.progress.xp=99;
assert.deepEqual(await Promise.all([a.save(),b.save()]),[true,false]);
assert.equal(JSON.parse(t.backend.getItem()).xp,45);assert(b.persistenceProblem);assert.equal(JSON.parse(b.snapshot()).xp,99);
assert.equal(await b.save(),false,'stale writer stays blocked');
stateA.progress.xp=55;const one=a.save();stateA.progress.xp=65;const two=a.save();assert.deepEqual(await Promise.all([one,two]),[true,true]);assert.equal(JSON.parse(t.backend.getItem()).xp,65);
console.log('PASS simultaneous queued writers, compare inside lock, losing memory export, sticky conflict, same-tab latest-snapshot coalescing');
