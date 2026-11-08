import {displayCharacterText} from './browser-fixture.mjs';
import assert from 'node:assert/strict';import {readFileSync}from'node:fs';import{runtime}from'./runtime-fixture.mjs';
export const data=JSON.parse(readFileSync('content/RPG_WORLD.json','utf8'));
export function driver(p){
 const EDU='pashto-quest-rpg-education-v1',WORLD='pashto-quest-rpg-world-v1',oracle=runtime(),known=new Map();
 const pos=()=>p.locator('#rpgCanvas').evaluate(c=>({map:c.dataset.map,x:+c.dataset.x,y:+c.dataset.y}));
 const progress=()=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),EDU);
 async function durable(){await p.waitForFunction(key=>{const s=JSON.parse(localStorage.getItem(key)||'null');return s&&s.xp===Number(document.getElementById('xpPill').textContent.match(/\d+/)[0]);},EDU);await p.waitForTimeout(300);}
 async function dialogue(label){while(await p.locator('#rpgDialogue').isVisible()){
  const next=p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true});if(await next.count()){await next.click();continue;}
  const b=p.locator('#rpgDialogue').getByRole('button',{name:label,exact:true});assert(await b.count(),'Missing dialogue action '+label+' '+await p.locator('#rpgDialogue').innerText());await b.click();break;
 }}
 function condition(c,day,s,w){if(!c)return true;if(c.startsWith('all:'))return c.slice(4).split('|').every(c=>condition(c,day,s,w));if(c.startsWith('complete:'))return !!s.complete[c.slice(9)];if(c.startsWith('not-complete:'))return !s.complete[c.slice(13)];if(c==='allLessons')return data.days[day].lessons.every(id=>s.complete[id]);if(c==='not-allLessons')return !data.days[day].lessons.every(id=>s.complete[id]);if(c==='beforeTutorial')return !s.tutorialDone;if(c==='afterTutorial')return s.tutorialDone;if(c==='beforeGuideMeeting')return !s.tutorialDone&&!w.flags?.metGuide;return false;}
 async function lessonActor(id,day){const s=await progress(),w=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),WORLD);for(const npc of data.npcs.filter(n=>data.days[day].activeNPCs.includes(n.id)))for(const slot of npc.schedule.filter(a=>a.day===day&&a.map==='village'&&condition(a.condition,day,s,w)))if(data.events[slot.event??npc.event].actions.some(a=>a.type==='lesson'&&a.lessonId===id))return{npc,slot};throw Error('No teacher for '+id);}
 async function pathTo(target,day,replans=0){
  // Pointer arrival may open a modal before the next DOM-status draw. Wait for
  // the resumed scene to render before planning from its public canvas position.
  // Long routes use keyboard activation of the public D-pad for one-tile pulses;
  // separate Phaser checks retain real arrow holds, pointer capture and touch.
  await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const start=await pos();assert.equal(start.map,target.map??start.map);const map=data.maps[start.map],s=await progress(),world=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),WORLD);
  let npcs=data.npcs.filter(n=>data.days[day].activeNPCs.includes(n.id)&&condition(n.condition,day,s,world)).flatMap(n=>n.schedule.filter(a=>a.day===day&&a.map===start.map&&condition(a.condition,day,s,world)));
  const live=await p.evaluate(()=>__week1Inspect().actors);npcs=live.filter(a=>data.npcs.some(n=>n.id===a.id));
  const queue=[{x:start.x,y:start.y,path:[]}],seen=new Set([start.x+','+start.y]);let path;
  for(let i=0;i<queue.length;i++){const q=queue[i];if(q.x===target.x&&q.y===target.y){path=q.path;break;}for(const[key,dx,dy]of[['ArrowUp',0,-1],['ArrowDown',0,1],['ArrowLeft',-1,0],['ArrowRight',1,0]]){let x=q.x+dx,y=q.y+dy,k=x+','+y;if(seen.has(k)||!data.tiles[map.tiles[y]?.[x]]?.walkable||map.collision?.[y]?.[x]==='1'||npcs.some(n=>n.x===x&&n.y===y))continue;if(map.transitions.some(t=>t.x===x&&t.y===y)&&!(target.x===x&&target.y===y))continue;seen.add(k);queue.push({x,y,path:[...q.path,key]});}}
  assert(path,'No path to '+JSON.stringify(target));let e={...start};for(const key of path){const[dx,dy]={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[key];e={...e,x:e.x+dx,y:e.y+dy};const transition=map.transitions.find(t=>t.x===e.x&&t.y===e.y);if(transition)e={map:transition.to,...transition.spawn};await p.waitForTimeout(155);await p.bringToFront();await p.locator('#rpgCanvas').focus();await p.waitForFunction(()=>{try{return document.hasFocus()&&!document.hidden&&!__week1Inspect().moving&&!__week1Inspect().physicsPaused;}catch{return false;}});await p.locator('[data-direction='+{ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[key]+']').press('Enter');await p.waitForFunction(e=>{const c=document.getElementById('rpgCanvas');return c.dataset.map===e.map&&+c.dataset.x===e.x&&+c.dataset.y===e.y;},e,{timeout:1800}).catch(async error=>{if(replans<12){await p.waitForTimeout(250);return pathTo(target,day,replans+1);}console.error('Movement goal failure',{key,expected:e,actual:await pos(),input:await p.evaluate(()=>window.__inputLog)});throw error;});if(replans<12&&(await pos()).map===(target.map??start.map)&&(await pos()).x===target.x&&(await pos()).y===target.y)return;}
 }
 async function mapTo(map,day){let current=await pos();if(current.map===map)return;if(current.map!=='village'){await pathTo({...data.maps[current.map].transitions[0],map:current.map},day);current=await pos();}if(map!=='village'){const t=data.maps.village.transitions.find(t=>t.to===map);assert(t);await pathTo({...t,map:'village'},day);}if(await p.locator('#rpgDialogue').isVisible())await dialogue('Follow the trail');}
 async function actor(id,day,map='village'){await mapTo(map,day);const s=await progress(),w=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),WORLD),npc=data.npcs.find(n=>n.id===id),slot=npc.schedule.find(n=>n.day===day&&n.map===map&&condition(n.condition,day,s,w));assert(slot,id+' absent');
  for(const[dx,dy]of[[0,1],[1,0],[-1,0],[0,-1]])if(data.tiles[data.maps[map].tiles[slot.y+dy]?.[slot.x+dx]]?.walkable){await pathTo({map,x:slot.x+dx,y:slot.y+dy},day);break;}await p.locator('#rpgInteract:enabled').waitFor();}
 async function talk(label){
  for(let attempt=0;attempt<3;attempt++){
   await p.locator('#rpgInteract').click();
   while(await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).count())await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).click();
   if(await p.locator('#rpgDialogue').getByRole('button',{name:label,exact:true}).count()){await dialogue(label);return;}
   const followup=p.locator('#rpgDialogue').getByRole('button',{name:/^(Return to village|Follow the trail)$/});
   if(await followup.count()){await followup.click();continue;}await dialogue(label);
  }throw Error('No requested action after explicit follow-up interactions: '+label);
 }

 async function tutorial(){if(await p.locator('#startTutorial').isVisible())await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);await actor('jan-welcome',1);await talk('Begin tutorial');await actor('jan-library',1,'library');await talk('Begin tutorial');await p.locator('#tutorialInteraction button').getByText('Hello',{exact:true}).click();await p.locator('#teachNext').click();for(const text of ['How are you?'])await p.locator('#tutorialInteraction button').getByText(text,{exact:true}).click();await p.locator('#teachNext').click();await p.locator('[data-answer="پښتو"]').click();await p.locator('#teachNext').click();await p.locator('#tutorialName').fill('Muhammad Jan');await p.locator('#tutorialSaveName').click();await p.locator('#teachNext').click();await p.locator('#resultWorld').click();await dialogue('Explore the village');await durable();}
 async function lesson({reload=false,onStep=async()=>{}}={}){let count=0,reloaded=false;
  while(await p.locator('#lessonScreen').isVisible()){assert(++count<160,'Lesson stalled');await onStep();if(await p.locator('#teachPanel').isVisible()){known.set(await p.locator('#teachPashto').innerText(),await p.locator('#teachEnglish').innerText());await p.locator('#teachNext').click();}else if(await p.locator('#grammarPanel').isVisible()){
   const demo=p.locator('#grammarPanel .sov-demo[data-example-id]:not([data-complete])');
   if(await demo.count()){const id=await demo.getAttribute('data-example-id'),card=oracle.S.restoreId(oracle.content.LIBRARY_DATA,oracle.content.LIBRARY_DATA.sentenceFrames,id);for(const token of card.ps.replace(/[.!؟،]/g,'').split(/\s+/).filter(Boolean))await demo.locator('.word-tiles button:enabled').getByText(token,{exact:true}).first().click();await demo.getByRole('button',{name:'Check sentence',exact:true}).click();}
   await p.locator('#grammarNext').click();} else{
   if(await p.locator('#constructionPanel').isVisible()){let target=await p.locator('#quizPashto').innerText(),answer=[...known].find(([_ps,en])=>en===target)?.[0];assert(answer,'No studied construction for '+target);for(const [i,token]of answer.replace(/[.!؟،]/g,'').split(/\s+/).entries()){await p.locator('#wordTiles button:enabled').getByText(displayCharacterText(token),{exact:true}).first().click();if(reload&&!reloaded&&i===0){await durable();const before=await p.locator('#builtSentence').innerText();await p.reload();await p.locator('#constructionPanel').waitFor();assert.equal(await p.locator('#builtSentence').innerText(),before);reloaded=true;}}await p.locator('#checkBuild').click();}
   else {const ps=await p.locator('#quizPashto').innerText();assert(known.has(ps),'Unknown study question '+ps);await p.locator('#choices button').getByText((known.get(ps)).replace(/^(\s*["“'‘(\[]*)([a-z])/, (_,prefix,c)=>prefix+c.toUpperCase()), {exact:true}).click();}await onStep();await p.locator('#quizNext').click();
  }}await p.locator('#resultWorld').click();assert(!await p.locator('#rpgDialogue').isVisible(),'Lesson return stays quiet');await durable();
 }
 async function assessment(day,{fail=false,reload=false}={}){const count=day===7?25:15;
  for(let i=0;i<count;i++){await p.waitForFunction(([key,i])=>{const s=JSON.parse(localStorage.getItem(key));return s?.activeChallenge?.index===i;},[EDU,i]);let saved=await progress(),q=saved.activeChallenge.questions[i];oracle.content.restoreGenerated(saved);const w=oracle.content.wordById[q.id],answer=q.answerPs||q.correct||(q.direction==='en-ps'?w.ps:w.en);
   if(q.unstudied&&!q.recognition){await p.locator('#unseenRecall').fill(fail?'deliberately incorrect':displayCharacterText(answer));await p.getByRole('button',{name:'Submit meaning',exact:true}).click();}
   else if(['construct','dialogue'].includes(q.kind)){if(fail){const tiles=p.locator('#wordTiles button:enabled');while(await tiles.count()){await tiles.last().click();if(q.duds?.length)break;}}else for(const token of answer.replace(/[.!؟،]/g,'').split(/\s+/).filter(Boolean))await p.locator('#wordTiles button:enabled').getByText(displayCharacterText(token),{exact:true}).first().click();await p.locator('#checkBuild').click();}
   else {const choices=p.locator('#choices button');if(fail){const labels=await choices.evaluateAll(bs=>bs.map(b=>b.dataset.answer));await choices.nth(Math.max(0,labels.findIndex(t=>t!==answer))).click();}else await choices.getByText(displayCharacterText(answer).replace(/^(\s*["“'‘(\[]*)([a-z])/, (_,prefix,c)=>prefix+c.toUpperCase()), {exact:true}).click();}
   if(reload&&i===3){await durable();const before=(await progress()).activeChallenge,xp=(await progress()).xp;await p.reload();await p.locator('#quizPanel').waitFor();const after=(await progress()).activeChallenge;assert.deepEqual(after.questions,before.questions);assert(after.locked);assert.equal(after.correctCount,before.correctCount);assert.equal((await progress()).xp,xp);}
   await p.locator('#quizNext').click();
  }await durable();return progress();
 }
 return{pos,progress,durable,dialogue,pathTo,mapTo,actor,lessonActor,talk,tutorial,lesson,assessment};
}
