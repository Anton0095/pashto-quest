import assert from 'node:assert/strict';
import {setup}from'./browser-fixture.mjs';
for(const width of [375,1280]){
 const b=await setup({width,rpg:true});
 try{
  for(let iteration=0;iteration<4;iteration++){
   const context=await b.browser.newContext({viewport:{width,height:1000}});
   try{
    const a=await context.newPage();await a.goto(b.url);await a.evaluate(()=>__test.storage.settled());
    const other=await context.newPage();await other.goto(b.url);await other.evaluate(()=>__test.storage.settled());
    const key='pashto-quest-rpg-education-v1';
    await a.evaluate(key=>new Promise(resolve=>navigator.locks.request(key,()=>new Promise(release=>{window.releaseRPGSave=release;resolve();}))),key);
    await a.evaluate(()=>{__test.state.progress.xp=45;window.pendingRPGSave=__test.storage.save();});
    await other.evaluate(()=>{__test.state.progress.xp=99;window.pendingRPGSave=__test.storage.save();});
    assert(await a.evaluate(()=>__test.storage.pending));assert(await other.evaluate(()=>__test.storage.pending));
    await a.evaluate(()=>window.releaseRPGSave());
    const outcomes=await Promise.all([a.evaluate(()=>window.pendingRPGSave),other.evaluate(()=>window.pendingRPGSave)]);
    assert.equal(outcomes.filter(Boolean).length,1,JSON.stringify({width,iteration,outcomes}));
    const winner=outcomes[0]?45:99,loser=outcomes[0]?other:a;
    assert.equal(await a.evaluate(key=>JSON.parse(localStorage.getItem(key)).xp,key),winner);
    assert.equal(await loser.evaluate(()=>JSON.parse(__test.storage.snapshot()).xp),winner===45?99:45);
    assert(await loser.locator('#saveWarning').isVisible());
    await loser.reload();await loser.evaluate(()=>__test.storage.settled());assert.equal(await loser.evaluate(()=>__test.state.progress.xp),winner);
   }finally{await context.close();}
  }
  assert.deepEqual(b.errors,[]);console.log('PASS Phaser RPG concurrent save',width,'four queued two-renderer contests, one winner, losing export/reload preserved');
 }finally{await b.close();}
}
