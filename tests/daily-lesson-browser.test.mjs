import assert from 'node:assert/strict';
import {setup}from'./browser-fixture.mjs';
import {driver}from'./rpg-week1-driver.mjs';
for(const [width,height]of [[1920,1080],[1366,768]]){
 const b=await setup({width,rpg:true});const p=b.page;
 try{
  await p.setViewportSize({width,height});await p.locator('#startTutorial').click();
  await p.evaluate(()=>{window.__documentScrolls=[];window.addEventListener('scroll',()=>__documentScrolls.push(scrollY));__test.state.progress.tutorialDone=true;__test.lessons.begin('1-residential');});
  await driver(p).lesson();
  assert(await p.evaluate(()=>__test.state.progress.complete['1-residential']));
  assert.equal(await p.evaluate(()=>scrollY),0);assert((await p.evaluate(()=>__documentScrolls)).every(n=>n===0));
  assert.deepEqual(b.errors,[]);console.log('PASS complete Home lesson',width,height,'real study, grammar, generated sentences, word/construct answers, feedback and return without document scrolling');
 }finally{await b.close();}
}
