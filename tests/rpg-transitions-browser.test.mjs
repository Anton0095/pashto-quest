import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync} from 'node:fs';
import {build} from 'esbuild';
import {setup} from './browser-fixture.mjs';
const bundle=await build({entryPoints:['src/rpg/transitions.ts'],bundle:true,format:'iife',globalName:'TransitionFixture',write:false,target:'es2020'});
const observations=[];
for(const width of [1280,390])for(const reduced of [false,true]){
 const b=await setup({width,mobile:width===390,bridge:false});const p=b.page;
 try{
  await p.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});await p.addScriptTag({content:bundle.outputFiles[0].text});
  const result=await p.evaluate(async()=>{
   const c=TransitionFixture.createRPGTransitions(),metrics=[];
   for(const kind of ['sleep','dream-enter','dream-exit']){
    let commits=0,maximumAnimations=0,maximumNodes=0,last=performance.now();const gaps=[];
    let watching=true;function frame(now){gaps.push(now-last);last=now;maximumAnimations=Math.max(maximumAnimations,document.getAnimations().filter(a=>a.effect?.target?.closest?.('.rpg-transition')).length);maximumNodes=Math.max(maximumNodes,document.querySelectorAll('.rpg-transition *').length);if(watching)requestAnimationFrame(frame);}requestAnimationFrame(frame);
    const start=performance.now(),first=c.play(kind,kind==='sleep'?'DAY 3':'DREAM',()=>{commits++;return true;});
    const duplicates=await Promise.all(Array.from({length:5},()=>c.play(kind,'duplicate',()=>{commits++;return true;})));
    const completed=await first;watching=false;const elapsed=performance.now()-start;gaps.sort((a,b)=>a-b);
    metrics.push({kind,commits,duplicates:duplicates.some(Boolean),completed,maximumAnimations,maximumNodes,elapsedMs:Math.round(elapsed),frameMedianMs:Math.round(gaps[Math.floor(gaps.length/2)]??0),frameP95Ms:Math.round(gaps[Math.floor(gaps.length*.95)]??0),leaked:document.querySelectorAll('.rpg-transition').length});
   }
   let abortedCommits=0;const interrupted=c.play('sleep','DAY 4',()=>{abortedCommits++;return true;});c.cancel();const aborted=await interrupted;
   const afterCommit=await c.play('sleep','DAY 4',()=>{abortedCommits++;c.cancel();return true;});
   c.dispose();return {metrics,aborted,afterCommit,abortedCommits,leaked:document.querySelectorAll('.rpg-transition').length,animations:document.getAnimations().filter(a=>a.effect?.target?.closest?.('.rpg-transition')).length};
  });
  for(const m of result.metrics){assert.equal(m.commits,1);assert.equal(m.duplicates,false);assert(m.completed);assert.equal(m.leaked,0);assert(m.maximumNodes<=20);assert(m.maximumAnimations<=17);if(reduced)assert.equal(m.maximumAnimations,0);assert(m.elapsedMs<5000);}
  assert.equal(result.aborted,false);assert.equal(result.afterCommit,false);assert.equal(result.abortedCommits,1);assert.equal(result.leaked,0);assert.equal(result.animations,0);assert.deepEqual(b.errors,[]);
  observations.push({width,reducedMotion:reduced,...result});console.log('PASS transition lifecycle',width,reduced?'reduced':'normal','bounded DOM/animation tracks, five duplicate requests rejected, pre/post-commit interruption, no leaked veil or tracks');
 }finally{await b.close();}
}
mkdirSync('work/sleep-bilal',{recursive:true});writeFileSync('work/sleep-bilal/transition-observations.json',JSON.stringify(observations,null,2)+'\n');
