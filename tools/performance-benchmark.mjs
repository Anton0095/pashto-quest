/* Reproducible diagnostic only: no runtime telemetry or benchmark dependencies. */
import {writeFileSync,readFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import os from 'node:os';
import {setup,tutorial} from '../tests/browser-fixture.mjs';
const arg=(key,fallback)=>{const i=process.argv.indexOf(key);return i<0?fallback:process.argv[i+1]};
const samples=Number(arg('--samples','20'));
const coldOnly=process.argv.includes('--cold-only');
const output=arg('--output','work/p1/performance.json');
const htmlPath=arg('--release','index.html');
const releaseText=readFileSync(htmlPath,'utf8');
const profile=arg('--profile','all');
const onlyPace=arg('--pace','all');
mkdirSync('work/p1',{recursive:true});
const report={schemaVersion:1,releaseSha256:createHash('sha256').update(readFileSync(htmlPath)).digest('hex'),samples,date:new Date().toISOString(),host:{platform:os.platform(),arch:os.arch(),cpus:os.cpus().length,cpu:os.cpus()[0]?.model,node:process.version},method:'Sequential isolated Chromium profiles; desktop 1280px normal CPU; mobile 375px with CDP 4× CPU slowdown. Cold means eligibility-cache miss, not a cold operating-system cache. JS heap from CDP after forced GC; sampled pre-GC high water is not an exact peak. Instrumented lexical-index calls/timing are diagnostic overhead. Each of ten revision sessions replays Day-14 Home, practises up to ten due items, visits a Library entry and returns to town. A 90-day synthetic clock advance makes revision due without altering SRS records.',profiles:[]};
const transform=()=>releaseText.replace('  const index = (data) => {','  const __rawIndex = (data) => {').replace('    const sources = new Map(','    window.__bench.indexRebuilds++;\n    const sources = new Map(').replace('  const feature = (item, key) =>',`  const index = (data) => {
    window.__bench ||= {indexCalls:0,indexRebuilds:0,indexMs:0};
    const t=performance.now();window.__bench.indexCalls++;
    try{return __rawIndex(data)}finally{window.__bench.indexMs+=performance.now()-t}
  };
  const feature = (item, key) =>`).replace('  function available(p, data, frames, day) {','  function __rawAvailable(p, data, frames, day) {').replace('  function restoreCard(data, frames, snapshot) {', `  function available(...args) {
    const start=performance.now();
    try{return __rawAvailable(...args)}finally{window.__firstGenerationMs ??= performance.now()-start}
  }
  function restoreCard(data, frames, snapshot) {`);
for(const mode of ['desktop','mobile4x'].filter(m=>profile==='all'||m===profile))for(const pace of [0,12,24].filter(p=>onlyPace==='all'||p===Number(onlyPace))){
 const b=await setup({width:mode==='desktop'?1280:375,htmlPath,transform});
 const p=b.page,cdp=await p.context().newCDPSession(p);
 try{
  if(mode==='mobile4x'){await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await p.reload()}
  await cdp.send('HeapProfiler.enable');await cdp.send('HeapProfiler.collectGarbage');
  const initialHeap=await cdp.send('Runtime.getHeapUsage');
  const initialBoot=await p.evaluate(()=>performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd);
  await p.evaluate(pace=>{__test.reset(pace)},pace);await tutorial(p);
  await p.evaluate(()=>{
   window.benchStudy=(day,place)=>{
    const t=__test;t.lessons.begin(day+'-'+place);let guard=0;
    while(!document.querySelector('#lessonScreen').classList.contains('hidden')){
     if(++guard>500)throw Error('Stalled lesson');const s=t.state.session;
     if(['greeting','lexical','sentence'].includes(s.phase))t.lessons.afterStudy();
     else if(s.phase==='grammar')t.lessons.afterGrammar();
     else{const item=s.queue[0],c=t.content.wordById[item.id];t.lessons.answer(item.kind==='construct'?c.ps:c.en);t.nextQuestion()}
    }
   };
   window.benchFinish=()=>{const t=__test,s=t.state.session;while(!s.finished){const q=s.questions[s.index],c=t.content.wordById[q.id];t.challenge.answerChallenge(q.answerPs||q.correct||(q.kind==='construct'?c.ps:q.direction==='en-ps'?c.ps:c.en));t.nextQuestion()}};
  });
  const row={mode,pace,initialHeap,initialBootMs:initialBoot,days:[]};report.profiles.push(row);
  for(let day=1;day<=(coldOnly?1:14);day++){
   const route=await p.evaluate(day=>{const t=__test;t.day(day);const o=t.content.dayById[day].opening;return day===2?['school','nature','business','residential']:[o,...t.content.zoneKeys.filter(p=>p!==o)]},day);
   for(const place of route){await p.evaluate(({day,place})=>benchStudy(day,place),{day,place});await p.evaluate(()=>new Promise(r=>setTimeout(r,0)))}
   const opening=await p.evaluate(day=>{const start=performance.now();__test.challenge.startChallenge(day);__test.storage.save();return {ms:performance.now()-start,activeBytes:new TextEncoder().encode(JSON.stringify(__test.state.progress.activeChallenge)).length}},day);
   await p.evaluate(()=>benchFinish());
   if([1,7,13,14].includes(day)){
    const details=await p.evaluate(({day,samples})=>{
     const t=__test,d=t.content.LIBRARY_DATA,f=d.sentenceFrames,progress=t.state.progress,plan=progress.library.plans[day];
     const bytes=s=>new TextEncoder().encode(s).length;
     const metrics={};
     const measure=(name,fn)=>{
      const times=[],calls=[],rebuilds=[],indexMs=[];
      for(let i=0;i<samples;i++){
       window.__bench={indexCalls:0,indexRebuilds:0,indexMs:0};const start=performance.now();fn();times.push(performance.now()-start);
       calls.push(__bench.indexCalls);rebuilds.push(__bench.indexRebuilds);indexMs.push(__bench.indexMs);
      }
      metrics[name]={timesMs:times,indexCalls:calls,indexRebuilds:rebuilds,indexMs};
     };
     const pool=t.S.available(progress,d,f,day);
     measure('catalogue',()=>t.S.catalog(d,f,progress,day));
     measure('coldEligibility',()=>{delete d.eligibleCache;t.S.available(progress,d,f,day)});
     const cached=d.eligibleCache;
     measure('warmEligibility',()=>t.S.available(progress,d,f,day));
     const cacheIdentityRetained=cached===d.eligibleCache;
     measure('studySelection',()=>t.S.select(progress,d,f,day,3,123456));
     measure('dialogues',()=>t.S.dialogues(pool,d,123456));
     const original=plan.challengeQuestions;
     measure('challengeCreation',()=>{delete plan.challengeQuestions;t.questions.selectChallenge(day)});plan.challengeQuestions=original;
     measure('serialisation',()=>JSON.stringify(progress));
     const raw=JSON.stringify(progress);measure('storageWriteOnly',()=>localStorage.setItem('pashto-town-days-v1',raw));
     measure('completeSave',()=>t.storage.save());
     // Eligibility cache must observe both form and grammar unlock changes, never just day.
     const acquired=Object.values(progress.library.acquired).find(r=>r.introducedFormIds.length);
     let formInvalidation=null;
     if(acquired){const old=acquired.introducedFormIds;acquired.introducedFormIds=old.slice(1);const before=d.eligibleCache;t.S.available(progress,d,f,day);formInvalidation=before!==d.eligibleCache;acquired.introducedFormIds=old;t.S.available(progress,d,f,day)}
     const g='grammar-day-'+day,old=progress.library.grammar[g],before=d.eligibleCache;delete progress.library.grammar[g];t.S.available(progress,d,f,day);const grammarInvalidation=before!==d.eligibleCache;progress.library.grammar[g]=old;t.S.available(progress,d,f,day);
     const sizes={};for(const [key,value] of Object.entries(progress.library))sizes[key]=bytes(JSON.stringify(value));
     const snapshotBytes=Object.values(progress.library.plans).reduce((n,p)=>n+bytes(JSON.stringify(p.generatedPracticeCards||{}))+bytes(JSON.stringify(p.challengeQuestions||[])),0);
     return {day,metrics,poolSize:pool.length,baseCacheCards:d.eligibleCache.cards.length,cacheIdentityRetained,formInvalidation,grammarInvalidation,storage:{utf8Bytes:bytes(raw),utf16Bytes:raw.length*2,librarySections:sizes,generatedAndQuestionSnapshotBytes:snapshotBytes,activeChallengeBytes:bytes(JSON.stringify(progress.activeChallenge||null))},registeredCards:Object.keys(t.content.wordById).length};
    },{day,samples});
    details.trueColdFirstGenerationMs=await p.evaluate(()=>window.__firstGenerationMs);details.challengeOpenMs=opening.ms;details.activeChallengeSnapshotBytes=opening.activeBytes;details.heapBeforeGC=await cdp.send('Runtime.getHeapUsage');await cdp.send('HeapProfiler.collectGarbage');details.heapAfterGC=await cdp.send('Runtime.getHeapUsage');row.days.push(details);writeFileSync(output,JSON.stringify(report,null,2)+'\n');
    console.log(mode,'pace',pace,'day',day,'pool',details.poolSize,'storage',details.storage.utf8Bytes,'heap',details.heapAfterGC.usedSize);
   }
  }
  if(coldOnly){row.browser=await b.browser.version();row.errors=b.errors;writeFileSync(output,JSON.stringify(report,null,2)+'\n');continue}
  const revision=[];
  for(let i=0;i<10;i++){
   await p.evaluate(async i=>{
    const t=__test,start=performance.now();
    window.benchEpoch ||= Date.now();Date.now=()=>window.benchEpoch+(i+1)*90*86400000;
    benchStudy(14,'residential');
    t.lessons.begin('review');let guard=0;window.lastReviewCount=0;
    while(t.state.session?.queue?.length && guard<10){if(++guard>1000)throw Error('Review stalled');const item=t.state.session.queue[0],c=t.content.wordById[item.id];t.lessons.answer(item.kind==='construct'?c.ps:c.en);t.nextQuestion();window.lastReviewCount++;if(guard%10===0)await new Promise(r=>setTimeout(r,0))}
    t.world.startWorld();t.library.openLibrary();const detail=document.querySelector('.library-entry');if(detail){detail.open=true;detail.dispatchEvent(new Event('toggle'))}
    document.querySelector('#libraryDialog').close();t.storage.save();window.lastReviewMs=performance.now()-start;
   },i);
   await p.evaluate(()=>new Promise(r=>setTimeout(r,0)));
   const bytes=await p.evaluate(()=>{const raw=localStorage.getItem('pashto-town-days-v1');return {utf8Bytes:new TextEncoder().encode(raw).length,utf16Bytes:raw.length*2,reviewedItems:window.lastReviewCount,durationMs:window.lastReviewMs,saveProblem:__test.storage.persistenceProblem}});
   await cdp.send('HeapProfiler.collectGarbage');revision.push({session:i+1,...bytes,heap:await cdp.send('Runtime.getHeapUsage')});console.log(mode,pace,'revision',i+1,bytes.reviewedItems,bytes.utf8Bytes,bytes.durationMs);row.repeatedRevision=revision;writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  }
  row.repeatedRevision=revision;
  row.browser=await b.browser.version();row.errors=b.errors;if(b.errors.length)throw Error(b.errors.join(';'));
  writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 }finally{await b.close()}
}
console.log('WROTE',output);
