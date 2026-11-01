import assert from 'node:assert/strict';
import {setup} from './browser-fixture.mjs';
for(const width of [375,1280]) {
 const b=await setup({width});
 try {
  const context=await b.browser.newContext({viewport:{width,height:1000}});
  const a=await context.newPage();await a.goto(b.url);await a.evaluate(()=>__test.storage.settled());
  const other=await context.newPage();await other.goto(b.url);await other.evaluate(()=>__test.storage.settled());
  await a.evaluate(()=>new Promise(resolve=>navigator.locks.request('pashto-town-days-v1',()=>new Promise(release=>{window.releaseSaveLock=release;resolve()}))));
  await a.evaluate(()=>{__test.state.progress.xp=45;window.pendingSave=__test.storage.save()});
  await other.evaluate(()=>{__test.state.progress.xp=99;window.pendingSave=__test.storage.save()});
  assert(await a.evaluate(()=>__test.storage.pending));assert(await other.evaluate(()=>__test.storage.pending));
  await a.evaluate(()=>window.releaseSaveLock());
  const outcomes=await Promise.all([a.evaluate(()=>window.pendingSave),other.evaluate(()=>window.pendingSave)]);
  assert.equal(outcomes.filter(Boolean).length,1, JSON.stringify({outcomes, a:await a.evaluate(()=>({xp:JSON.parse(localStorage.getItem("pashto-town-days-v1")).xp,warning:__test.storage.persistenceProblem})),b:await other.evaluate(()=>({xp:__test.state.progress.xp,warning:__test.storage.persistenceProblem}))}));
  const winner=outcomes[0]?45:99;
  assert.equal(await a.evaluate(()=>JSON.parse(localStorage.getItem('pashto-town-days-v1')).xp),winner);
  const loser=outcomes[0]?other:a;
  assert(await loser.locator('#saveWarning').isVisible());
  assert.equal(await loser.evaluate(()=>JSON.parse(__test.storage.snapshot()).xp),winner===45?99:45);
  await loser.reload();await loser.evaluate(()=>__test.storage.settled());
  assert.equal(await loser.evaluate(()=>__test.state.progress.xp),winner);
  assert(!(await loser.locator('#saveWarning').isVisible()));
  assert.deepEqual(b.errors,[]);
  console.log(width,'PASS real Web Locks contention: both writers queued before comparison, one wins, loser export and reload preserved');
 } finally {await b.close()}
}
