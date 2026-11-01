/* Reproducible local Chromium diagnostics; instrumentation is test-only. */
import {writeFileSync,mkdirSync,statSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {setup} from '../tests/browser-fixture.mjs';
const output={releaseSha256:createHash('sha256').update(readFileSync('index.html')).digest('hex'),releaseBytes:statSync('index.html').size,samples:20,profiles:[],notice:'Local Chromium, loopback HTTP/offline dependencies. Mobile is 375px with 4x CPU throttle, not physical Safari. Navigation includes HTML parse/script work; movement is key dispatch to next observed canvas position. Heap is forced-GC endpoint, not peak.'};
const stats=values=>{const a=[...values].sort((a,b)=>a-b);return {medianMs:+a[Math.floor(a.length/2)].toFixed(2),p95Ms:+a[Math.ceil(a.length*.95)-1].toFixed(2),minMs:+a[0].toFixed(2),maxMs:+a.at(-1).toFixed(2)};};
for(const [name,width,throttle]of[['desktop',1280,1],['mobile4x',375,4]]){
 const b=await setup({width,rpg:true,bridge:false});const p=b.page;
 try {
  const cdp=await p.context().newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:throttle});
  const loads=[];
  for(let i=0;i<20;i++){await p.reload();loads.push(await p.evaluate(()=>performance.getEntriesByType('navigation')[0].duration));}
  await p.locator('#startTutorial').click();
  await p.evaluate(()=>{const w=JSON.parse(localStorage.getItem('pashto-quest-rpg-world-v1')||'{"schemaVersion":1}');w.position={map:'village',x:24,y:16,facing:'up'};w.flags={started:true};localStorage.setItem('pashto-quest-rpg-world-v1',JSON.stringify(w));});
  await p.reload();await p.locator('#rpgCanvas').waitFor();await p.waitForTimeout(300);
  await cdp.send('HeapProfiler.collectGarbage');const before=await cdp.send('Runtime.getHeapUsage');
  const moves=[],transitions=[];
  for(let i=0;i<20;i++){
   await p.waitForTimeout(160);
   const result=await p.evaluate(async i=>{
    const canvas=document.getElementById('rpgCanvas'),before=canvas.dataset.map+':'+canvas.dataset.x+':'+canvas.dataset.y;
    const start=performance.now(),key=i%2?'ArrowDown':'ArrowUp';
    document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));
    await new Promise((resolve,reject)=>{let count=0;function check(){if(before!==canvas.dataset.map+':'+canvas.dataset.x+':'+canvas.dataset.y)resolve();else if(++count>120)reject(Error('Movement timed out'));else requestAnimationFrame(check);}requestAnimationFrame(check);});
    document.dispatchEvent(new KeyboardEvent('keyup',{key,bubbles:true}));return performance.now()-start;
   },i);transitions.push(result);
  }
  // Exterior walkable loop, away from NPCs and entrances.
  await p.keyboard.press('ArrowDown');await p.waitForTimeout(180);
  for(let i=0;i<20;i++){
   await p.waitForTimeout(160);
   moves.push(await p.evaluate(async i=>{
    const c=document.getElementById('rpgCanvas'),x=c.dataset.x,start=performance.now(),key=i%2?'ArrowRight':'ArrowLeft';
    document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));await new Promise(r=>{function next(){if(c.dataset.x!==x)r();else requestAnimationFrame(next);}requestAnimationFrame(next);});document.dispatchEvent(new KeyboardEvent('keyup',{key,bubbles:true}));return performance.now()-start;
   },i));
  }
  await p.waitForTimeout(500);await cdp.send('HeapProfiler.collectGarbage');const after=await cdp.send('Runtime.getHeapUsage');
  const storage=await p.evaluate(()=>Object.fromEntries(['pashto-quest-rpg-world-v1','pashto-quest-rpg-education-v1'].map(k=>[k,new TextEncoder().encode(localStorage.getItem(k)||'').length])));
  output.profiles.push({name,width,cpuThrottle:throttle,browser:b.browser.version(),initialLoad:stats(loads),movement:stats(moves),mapTransition:stats(transitions),heapBeforeBytes:before.usedSize,heapAfterBytes:after.usedSize,heapDeltaBytes:after.usedSize-before.usedSize,storage});
 } finally{await b.close();}
}
mkdirSync('work',{recursive:true});writeFileSync('work/rpg-performance.json',JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output,null,2));
