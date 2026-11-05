import assert from 'node:assert/strict';
import {setup}from'./browser-fixture.mjs';
import {driver}from'./rpg-week1-driver.mjs';
for(const [width,height]of [[1920,1080],[1366,768],[1280,720]]){
 const b=await setup({width,rpg:true});const p=b.page;
 try{
  await p.setViewportSize({width,height});await p.locator('#startTutorial').click();
  await p.evaluate(()=>{__test.state.progress.tutorialDone=true;__test.state.rpg.startWorld();window.__documentScrolls=[];window.addEventListener('scroll',()=>__documentScrolls.push(scrollY));});
  await p.getByText('Quick travel',{exact:true}).click();await p.locator('[data-destination=residential]').click();
  await p.locator('#teachPanel').waitFor();
  const position=await p.evaluate(()=>{const p=JSON.parse(localStorage.getItem('pashto-quest-rpg-world-v1')).position;return {map:p.map,x:p.x,y:p.y};});
  assert.equal(await p.locator('#rpgDialogue').isVisible(),false,'Quick travel starts directly');
  assert.equal(await p.locator('#rpgCanvas').isVisible(),false,'Learning hides the mounted world');
  await driver(p).lesson({onStep:async()=>{const overflow=await p.evaluate(()=>['lessonScreen','teachPanel','grammarPanel','tutorialInteraction','questionBody','quizFeedback'].filter(id=>{const e=document.getElementById(id);return e.getClientRects().length&&(e.scrollHeight>e.clientHeight+2||e.scrollWidth>e.clientWidth+2);}));assert.deepEqual(overflow,[],'Whole lesson fits without internal scrolling');}});
  assert(await p.evaluate(()=>__test.state.progress.complete['1-residential']));
  assert(await p.locator('#rpgCanvas').isVisible());assert.deepEqual(await driver(p).pos(),position,'Return to the same teacher position');
  assert.equal(await p.evaluate(()=>scrollY),0);assert((await p.evaluate(()=>__documentScrolls)).every(n=>n===0));
  assert.deepEqual(b.errors,[]);console.log('PASS complete Home lesson',width,height,'NPC lesson, real study/grammar/generated sentences, answers and feedback without internal/page scrolling, correct position on return');
 }finally{await b.close();}
}
