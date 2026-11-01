/* Reproducible local Chromium diagnostics; instrumentation is test-only. */
import {writeFileSync,mkdirSync,statSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {setup} from '../tests/browser-fixture.mjs';
const release=process.env.RPG_RELEASE||'index.html';
const output={releaseSha256:createHash('sha256').update(readFileSync(release)).digest('hex'),releaseBytes:statSync(release).size,samples:20,profiles:[],notice:'Local Chromium, loopback HTTP/offline dependencies. Mobile is 375px with 4x CPU throttle, not physical Safari. Navigation includes HTML parse/script work; movement is key dispatch to the next committed tile (includes the 115ms Phaser tween), not first-pixel latency. Heap is forced-GC endpoint, not peak.'};
const stats=values=>{const a=[...values].sort((a,b)=>a-b);return {medianMs:+a[Math.floor(a.length/2)].toFixed(2),p95Ms:+a[Math.ceil(a.length*.95)-1].toFixed(2),minMs:+a[0].toFixed(2),maxMs:+a.at(-1).toFixed(2)};};
for(const [name,width,throttle]of[['desktop',1280,1],['mobile4x',375,4]]){
 const b=await setup({width,rpg:true,bridge:false,htmlPath:release,transform:h=>h.replace('// @TEST_HOOK','window.__rpgMetrics=()=>rpg.diagnostics();window.__fixtureFence=saveFence;window.__flushRPG=()=>rpg.flush(); // @TEST_HOOK')});const p=b.page;
 try {
  const cdp=await p.context().newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:throttle});
  const loads=[],ready=[];
  for(let i=0;i<20;i++){await p.reload();loads.push(await p.evaluate(()=>performance.getEntriesByType('navigation')[0].duration));await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser==='4.2.1');ready.push(await p.evaluate(()=>performance.now()));}
  await p.locator('#startTutorial').click();
  await p.waitForTimeout(300);await p.evaluate(async()=>{const k='pashto-quest-rpg-world-v1',current=localStorage.getItem(k),w=JSON.parse(current||'{"schemaVersion":1}');w.position={map:'village',x:24,y:16,facing:'up'};w.flags={started:true};await navigator.locks.request(k,()=>__fixtureFence.commit(k,current,JSON.stringify(w),()=>localStorage.getItem(k),()=>{localStorage.setItem(k,JSON.stringify(w));return true;}));});
  await p.reload();await p.locator('#rpgCanvas').waitFor();await p.waitForTimeout(300);
  await cdp.send('HeapProfiler.collectGarbage');const before=await cdp.send('Runtime.getHeapUsage');const objectsBefore=await p.evaluate(()=>__rpgMetrics().updateObjects);
  const moves=[],transitions=[];
  for(let i=0;i<20;i++){
   await p.waitForTimeout(160);await p.waitForFunction(()=>!__rpgMetrics().moving);
   const result=await p.evaluate(async i=>{
    const canvas=document.getElementById('rpgCanvas'),before=canvas.dataset.map+':'+canvas.dataset.x+':'+canvas.dataset.y;
    const start=performance.now(),key=i%2?'ArrowDown':'ArrowUp';
    document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));document.dispatchEvent(new KeyboardEvent('keyup',{key,bubbles:true}));
    await new Promise((resolve,reject)=>{let count=0;function check(){if(before!==canvas.dataset.map+':'+canvas.dataset.x+':'+canvas.dataset.y)resolve();else if(++count>120)reject(Error('Movement timed out'));else requestAnimationFrame(check);}requestAnimationFrame(check);});
    document.dispatchEvent(new KeyboardEvent('keyup',{key,bubbles:true}));return performance.now()-start;
   },i);transitions.push(result);
  }
  // Exterior walkable loop, away from NPCs and entrances.
  await p.keyboard.press('ArrowDown');await p.waitForTimeout(180);
  for(let i=0;i<20;i++){
   await p.waitForTimeout(160);await p.waitForFunction(()=>!__rpgMetrics().moving);
   moves.push(await p.evaluate(async i=>{
    const c=document.getElementById('rpgCanvas'),x=c.dataset.x,start=performance.now(),key=i%2?'ArrowRight':'ArrowLeft';
    document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));document.dispatchEvent(new KeyboardEvent('keyup',{key,bubbles:true}));await new Promise(r=>{function next(){if(c.dataset.x!==x)r();else requestAnimationFrame(next);}requestAnimationFrame(next);});document.dispatchEvent(new KeyboardEvent('keyup',{key,bubbles:true}));return performance.now()-start;
   },i));
  }
  await p.waitForTimeout(500);await p.evaluate(()=>__flushRPG());await cdp.send('HeapProfiler.collectGarbage');const after=await cdp.send('Runtime.getHeapUsage');const objectsAfter=await p.evaluate(()=>__rpgMetrics().updateObjects);if(objectsBefore!==objectsAfter)throw Error('Scene update-list grew across map transitions');
  const storage=await p.evaluate(async()=>{
    const sizes=Object.fromEntries(['pashto-quest-rpg-world-v1','pashto-quest-rpg-education-v1'].map(k=>[k,new TextEncoder().encode(localStorage.getItem(k)||'').length]));
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('pashto-quest-save-fence-v1',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    try{const rows=await new Promise((resolve,reject)=>{const r=db.transaction('heads').objectStore('heads').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});return {...sizes,revisionHeads:rows.length,revisionValuesJsonBytes:new TextEncoder().encode(JSON.stringify(rows)).length};}finally{db.close();}
  });
  output.profiles.push({name,width,cpuThrottle:throttle,browser:b.browser.version(),initialLoad:stats(loads),sceneReady:stats(ready),movement:stats(moves),mapTransition:stats(transitions),sceneUpdateObjectsBefore:objectsBefore,sceneUpdateObjectsAfter:objectsAfter,heapBeforeBytes:before.usedSize,heapAfterBytes:after.usedSize,heapDeltaBytes:after.usedSize-before.usedSize,storage});
 } finally{await b.close();}
}
mkdirSync('work',{recursive:true});writeFileSync('work/rpg-performance.json',JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output,null,2));
