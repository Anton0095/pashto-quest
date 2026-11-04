/* Disposable-page benchmark. No runtime telemetry or dependency additions. */
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import os from 'node:os';
import {setup} from '../tests/browser-fixture.mjs';
const arg=(name,fallback)=>{const n=process.argv.indexOf(name);return n<0?fallback:process.argv[n+1];};
const release=arg('--release',process.env.RPG_RELEASE||'index.html'),output=arg('--output','work/rpg-performance.json'),samples=Number(arg('--samples','20'));
const stats=values=>{const a=[...values].sort((x,y)=>x-y),pick=p=>a[Math.min(a.length-1,Math.ceil(p*a.length)-1)];return {samples:a.length,medianMs:pick(.5),p95Ms:pick(.95),minMs:a[0],maxMs:a.at(-1)};};
const report={schemaVersion:1,releaseSha256:createHash('sha256').update(readFileSync(release)).digest('hex'),releaseBytes:statSync(release).size,samples,host:{node:process.version,cpu:os.cpus()[0]?.model,cpus:os.cpus().length},method:'Sequential isolated Chromium profiles on loopback HTTP with embedded assets. Desktop 1280px, mobile 375px with 4x CPU throttling (not a physical phone). Cold generation means eligibility-cache miss. Movement timings include the existing 115ms tween. World fixtures set only disposable test-page saves. Shared-engine timing uses deterministic synthetic pass/activation fixtures through fourteen days, not public playthrough evidence. Heap is forced-GC endpoint, not allocation peak. Frame intervals are requestAnimationFrame wall intervals, not GPU timings.',profiles:[]};
for(const [name,width,rate]of [['desktop',1280,1],['mobile4x',375,4]]){
 const b=await setup({width,rpg:true,htmlPath:release,offline:true,transform:h=>h.replace('// @TEST_HOOK','window.__perf={rpg,ui,saveFence,portraits:CHARACTER_PORTRAITS,newFence:PashtoRPG.createSaveFence,makeQuestions:seed=>createQuestions({state,content,progression,seedSource:()=>seed})};const objects=rpg.registry.objects;rpg.registry.objects=(...args)=>{window.__actorReads=(window.__actorReads||0)+1;return objects(...args);}; // @TEST_HOOK')});
 const p=b.page,warnings=[];p.on('console',m=>{if(['warning','error'].includes(m.type()))warnings.push({type:m.type(),message:m.text()});});
 try{
  const cdp=await p.context().newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate});
  const row={name,width,cpuThrottle:rate,browser:b.browser.version(),loads:[],sceneReady:[]};
  for(let i=0;i<samples;i++){await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);row.loads.push(await p.evaluate(()=>performance.getEntriesByType('navigation')[0].duration));row.sceneReady.push(await p.evaluate(()=>performance.now()));}
  row.initialLoad=stats(row.loads);row.sceneReady=stats(row.sceneReady);
  row.portraitPixels=await p.evaluate(async()=>Object.fromEntries(await Promise.all(Object.entries(__perf.portraits.characters).map(async([id,c])=>{
   const img=new Image();img.src=c.expressions.neutral;await img.decode();const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;const sum=await crypto.subtle.digest('SHA-256',pixels);return [id,{width:canvas.width,height:canvas.height,sha256:Array.from(new Uint8Array(sum),v=>v.toString(16).padStart(2,'0')).join('')}];}))));
  // A clean Day 1 world fixture; advancement and grading are verified elsewhere.
  await p.evaluate(async()=>{
   const t=__test;t.state.progress=t.progression.fresh();t.state.progress.tutorialDone=true;t.state.session=null;await t.storage.save();
   const key='pashto-quest-rpg-world-v1',raw=localStorage.getItem(key),world=JSON.parse(raw||'{}');Object.assign(world,{schemaVersion:1,chapter:'day-1',position:{map:'village',x:9,y:8,facing:'up'},flags:{started:true,metGuide:true},npcFlags:{},triggers:{welcome:true},view:'world',lesson:null,educationFingerprint:null});delete world.dialogue;
   const next=JSON.stringify(world);await navigator.locks.request(key,()=>__perf.saveFence.commit(key,raw,next,()=>localStorage.getItem(key),()=>{localStorage.setItem(key,next);return true;}));
  });await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);await p.locator('#worldScreen').waitFor();await p.waitForTimeout(300);
  const gc=async()=>{await cdp.send('HeapProfiler.collectGarbage');return cdp.send('Runtime.getHeapUsage');};
  const idle=()=>p.evaluate(async()=>{
   window.__actorReads=0;const times=[];let prior=performance.now(),mutations=0,addedNodes=0;
   const observer=new MutationObserver(rows=>{mutations+=rows.length;for(const r of rows)addedNodes+=r.addedNodes.length;});observer.observe(document.getElementById('worldScreen'),{subtree:true,childList:true,attributes:true,characterData:true});
   const start=performance.now();await new Promise(resolve=>{function frame(now){times.push(now-prior);prior=now;if(now-start>=2000)resolve();else requestAnimationFrame(frame);}requestAnimationFrame(frame);});observer.disconnect();return {times,actorProviderCalls:window.__actorReads,mutations,addedNodes,elapsedMs:performance.now()-start};
  });
  const pulse=key=>p.evaluate(async key=>{
   const c=document.getElementById('rpgCanvas');const before=c.dataset.map+':'+c.dataset.x+':'+c.dataset.y,start=performance.now();
   document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));document.dispatchEvent(new KeyboardEvent('keyup',{key,bubbles:true}));
   await new Promise((resolve,reject)=>{let frames=0;function next(){if(c.dataset.map+':'+c.dataset.x+':'+c.dataset.y!==before&&!__perf.rpg.diagnostics().moving)resolve();else if(++frames>300)reject(Error('No committed move'));else requestAnimationFrame(next);}requestAnimationFrame(next);});return performance.now()-start;
  },key);
  row.villageIdle=await idle();row.villageIdle.frameIntervals=stats(row.villageIdle.times);row.villageIdle.fps=1000/(row.villageIdle.times.reduce((s,n)=>s+n,0)/row.villageIdle.times.length);
  row.heapBefore=await gc();row.objectsBefore=await p.evaluate(()=>__perf.rpg.diagnostics().updateObjects);
  const enters=[],exits=[],walks=[];const cycleHeaps=[];
  for(let i=0;i<samples;i++){
   await p.waitForTimeout(160);enters.push(await pulse('ArrowUp'));
   if(i===0){row.houseIdle=await idle();row.houseIdle.frameIntervals=stats(row.houseIdle.times);row.houseIdle.fps=1000/(row.houseIdle.times.reduce((s,n)=>s+n,0)/row.houseIdle.times.length);}
   await p.waitForTimeout(160);walks.push(await pulse('ArrowDown'));await p.waitForTimeout(160);exits.push(await pulse('ArrowDown'));
   if(i===Math.floor(samples/2)-1||i===samples-1)cycleHeaps.push({cycles:i+1,heap:await gc(),objects:await p.evaluate(()=>__perf.rpg.diagnostics().updateObjects)});
  }
  row.houseEnter=stats(enters);row.houseExit=stats(exits);row.indoorMovement=stats(walks);row.cycleHeaps=cycleHeaps;
  await p.evaluate(()=>__perf.rpg.flush());row.heapAfter=await gc();row.objectsAfter=await p.evaluate(()=>__perf.rpg.diagnostics().updateObjects);
  row.repeatedDialogue=await p.evaluate(()=>{
   const observer=new MutationObserver(()=>{}),root=document.getElementById('lessonScreen');observer.observe(root,{subtree:true,childList:true,attributes:true,characterData:true});
   const times=[];let mutations=0,imagesAdded=0;__perf.ui.setConversation({instructorId:'Muhammad Jan',speakerId:'Muhammad Jan',partnerId:'Saleha'});observer.takeRecords();
   for(let sample=0;sample<20;sample++){const start=performance.now();for(let i=0;i<100;i++)__perf.ui.setConversation({instructorId:'Muhammad Jan',speakerId:i%2?'Muhammad Jan':'Saleha',partnerId:'Saleha'});times.push(performance.now()-start);for(const r of observer.takeRecords()){mutations++;for(const n of r.addedNodes)if(n.nodeType===1)imagesAdded+=(n.matches('img')?1:0)+n.querySelectorAll('img').length;}}
   observer.disconnect();return {times,mutations,imagesAdded};
  });row.repeatedDialogue.latencyPer100=stats(row.repeatedDialogue.times);
  row.generation=await p.evaluate(samples=>{
   const t=__test,d=t.content.LIBRARY_DATA,frames=d.sentenceFrames;t.state.progress=t.progression.fresh();t.state.progress.tutorialDone=true;t.state.session=null;const rows=[];
   for(let day=1;day<=14;day++){
    t.progression.activateChallenge(t.state.progress,day);
    if([1,7,14].includes(day)){
     const measure=fn=>{const times=[];for(let i=0;i<samples;i++){const start=performance.now();fn();times.push(performance.now()-start);}return times;};
     const cold=measure(()=>{delete d.eligibleCache;t.S.available(t.state.progress,d,frames,day);});
     const pool=t.S.available(t.state.progress,d,frames,day),warm=measure(()=>t.S.available(t.state.progress,d,frames,day));
     const selection=measure(()=>t.S.select(t.state.progress,d,frames,day,3,123456));
     const q=__perf.makeQuestions(123456+day),challenge=measure(()=>q.selectChallenge(day,{newAttempt:true}));
     const payload=q.selectChallenge(day,{newAttempt:true});rows.push({day,poolSize:pool.length,cold,warm,selection,challenge,questions:payload});
    }
    t.progression.completeChallengeOnce(t.state.progress,day,t.progression.getChallengeSpec(day).questionCount);
   }
   return rows;
  },samples);
  for(const r of row.generation){for(const key of ['cold','warm','selection','challenge'])r[key+'Stats']=stats(r[key]);r.questionSha256=createHash('sha256').update(JSON.stringify(r.questions)).digest('hex');delete r.questions;}
  row.saveFence=await p.evaluate(async samples=>{
   const fence=__perf.newFence(),key='post-merge-perf-fence';let raw=null;
   await navigator.locks.request(key,()=>fence.commit(key,null,'same',()=>raw,()=>{raw='same';return true;}));
   const native=crypto.subtle.digest.bind(crypto.subtle),descriptor=Object.getOwnPropertyDescriptor(crypto.subtle,'digest');let hashes=0;
   Object.defineProperty(crypto.subtle,'digest',{configurable:true,value:(...args)=>{hashes++;return native(...args);}});
   try{const times=[];for(let i=0;i<samples;i++){const start=performance.now();const result=await navigator.locks.request(key,()=>fence.commit(key,raw,raw,()=>raw,()=>true));if(result!=='saved')throw Error('Fence no-op failed');times.push(performance.now()-start);}return {times,hashes};}
   finally{if(descriptor)Object.defineProperty(crypto.subtle,'digest',descriptor);else delete crypto.subtle.digest;}
  },samples);row.saveFence.latency=stats(row.saveFence.times);
  await p.evaluate(()=>__test.storage.save());await p.evaluate(()=>__test.storage.settled());row.storage=await p.evaluate(()=>Object.fromEntries(['pashto-quest-rpg-education-v1','pashto-quest-rpg-world-v1'].map(k=>[k,new TextEncoder().encode(localStorage.getItem(k)||'').length])));
  row.warnings=[...new Map(warnings.map(w=>[w.type+':'+w.message,w])).values()];row.errors=b.errors;
  report.profiles.push(row);writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log('MEASURED',name,JSON.stringify({load:row.initialLoad,ready:row.sceneReady,villageFps:row.villageIdle.fps,houseFps:row.houseIdle.fps,actorReads:row.villageIdle.actorProviderCalls,heapDelta:row.heapAfter.usedSize-row.heapBefore.usedSize,hashes:row.saveFence.hashes}));
 }finally{await b.close();}
}
