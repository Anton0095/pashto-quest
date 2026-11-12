import assert from 'node:assert/strict';
import {setup}from'./browser-fixture.mjs';
const b=await setup({width:375,transform:h=>h.replace('// @TEST_HOOK','window.__fence=saveFence;window.__newFence=PashtoRPG.createSaveFence; // @TEST_HOOK')});
try{
 const p=b.page;await p.evaluate(()=>__test.storage.settled());
 const result=await p.evaluate(async()=>{
  const digest=async raw=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw===null?'null\0':'value\0'+raw))),b=>b.toString(16).padStart(2,'0')).join('');
  const editHead=async(key,value)=>{const db=await new Promise((res,rej)=>{const r=indexedDB.open('pashto-quest-save-fence-v1',1);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});try{await new Promise((res,rej)=>{const tx=db.transaction('heads','readwrite');tx.objectStore('heads').put(value,key);tx.oncomplete=res;tx.onabort=()=>rej(tx.error);});}finally{db.close();}};
  const run=(key,expected,next,writer=()=>{localStorage.setItem(key,next);return true;},reader=()=>localStorage.getItem(key))=>navigator.locks.request(key,()=>__fence.commit(key,expected,next,reader,writer));
  const output={};let writes=0;
  output.first=await run('fence-test-cas',null,'before');output.advance=await run('fence-test-cas','before','after');
  output.cached=await run('fence-test-cas','before','stale',()=>{writes++;return true;},()=> 'before');output.cachedWrites=writes;output.retained=localStorage.getItem('fence-test-cas');
  for(const stage of ['before','after','unexpected']){
   const key='fence-test-'+stage;await run(key,null,'b');const from=await digest('b'),to=await digest('c');
   localStorage.setItem(key,stage==='before'?'b':stage==='after'?'c':'x');await editHead(key,{hash:from,pending:{from,to}});
   output[stage]=await run(key,localStorage.getItem(key),'d');output[stage+'Value']=localStorage.getItem(key);
  }
  const retry='fence-test-retry';await run(retry,null,'b');output.failed=await run(retry,'b','c',()=>{throw Error('write rejected');});output.retry=await run(retry,'b','d');output.retryValue=localStorage.getItem(retry);
  const ambiguous='fence-test-ambiguous';await run(ambiguous,null,'b');output.ambiguous=await run(ambiguous,'b','c',()=>{localStorage.setItem(ambiguous,'c');return false;});output.ambiguousReload=await run(ambiguous,'c','d');
  const reset='fence-test-reset';await run(reset,null,'b');localStorage.setItem(reset,'corrupt');output.automaticReset=await run(reset,'corrupt','d');
  output.authorizedReset=await navigator.locks.request(reset,()=>__fence.rebase(reset,'corrupt',()=>localStorage.getItem(reset)));output.resetValueBeforeWrite=localStorage.getItem(reset);output.afterReset=await run(reset,'corrupt','d');
  const denied=__newFence(),native=IDBFactory.prototype.open;IDBFactory.prototype.open=()=>{throw new DOMException('Denied','SecurityError');};
  try{output.denied=await denied.commit('fence-denied',null,'bad',()=>null,()=>{writes++;return true;});}finally{IDBFactory.prototype.open=native;}
  output.deniedWrites=writes;output.deniedRetry=await navigator.locks.request('fence-denied',()=>denied.commit('fence-denied',null,'ok',()=>localStorage.getItem('fence-denied'),()=>{localStorage.setItem('fence-denied','ok');return true;}));
  // Identical inputs still consult the revision head, without hashing the same bytes repeatedly.
  const nativeDigest=crypto.subtle.digest.bind(crypto.subtle);let hashes=0;
  crypto.subtle.digest=(...args)=>{hashes++;return nativeDigest(...args);};
  try{
   output.noop=await run('fence-test-cas','after','after');output.noopHashes=hashes;hashes=0;
   output.changed=await run('fence-test-cas','after','next');output.changedHashes=hashes;hashes=0;
   output.staleNoop=await run('fence-test-cas','after','after',()=>{writes++;return true;},()=> 'after');
   output.staleNoopWrites=writes;output.staleNoopValue=localStorage.getItem('fence-test-cas');
  }finally{crypto.subtle.digest=nativeDigest;}
  return output;
 });
 assert.equal(result.first,'saved');assert.equal(result.advance,'saved');assert.equal(result.cached,'conflict');assert.equal(result.cachedWrites,0);assert.equal(result.retained,'after');
 assert.equal(result.before,'saved');assert.equal(result.after,'saved');assert.equal(result.beforeValue,'d');assert.equal(result.afterValue,'d');assert.equal(result.unexpected,'conflict');assert.equal(result.unexpectedValue,'x');
 assert.equal(result.ambiguous,'failed');assert.equal(result.ambiguousReload,'saved');
 assert.equal(result.failed,'failed');assert.equal(result.retry,'saved');assert.equal(result.retryValue,'d');assert.equal(result.automaticReset,'conflict');assert(result.authorizedReset);assert.equal(result.resetValueBeforeWrite,'corrupt');assert.equal(result.afterReset,'saved');assert.equal(result.denied,'failed');assert.equal(result.deniedWrites,0);assert.equal(result.deniedRetry,'saved');
 assert.equal(result.noop,'saved');assert.equal(result.noopHashes,1);assert.equal(result.changed,'saved');assert.equal(result.changedHashes,2);assert.equal(result.staleNoop,'conflict');assert.equal(result.staleNoopWrites,0);assert.equal(result.staleNoopValue,'next');
 // Existing explicit invalid-save reset also rebases its metadata; no automatic migration.
 await p.evaluate(()=>{const k='pashto-town-days-v1',raw=JSON.parse(localStorage.getItem(k));raw.saveSchemaVersion=0;localStorage.setItem(k,JSON.stringify(raw));});
 await p.reload();await p.locator('#saveCompatibility').waitFor({state:'visible'});await p.getByRole('button',{name:'Reset incompatible save and start',exact:true}).click();await p.locator('#saveCompatibility').waitFor({state:'detached'});await p.evaluate(()=>__test.storage.settled());assert.equal(await p.evaluate(()=>__test.state.progress.saveSchemaVersion),8);assert(!await p.locator('#saveWarning').isVisible());
 assert.deepEqual(b.errors,[]);console.log('PASS revision fence: deterministic stale renderer, interrupted before/after recovery, unknown bytes preserved, rejected write retry, explicit reset, IDB denial/recovery and real incompatible-save reset');
}finally{await b.close();}
