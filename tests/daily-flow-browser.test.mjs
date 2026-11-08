async function assertNoOverflow(page){const overflow=await page.evaluate(()=>['lessonScreen','questionBody','quizFeedback'].filter(id=>{const el=document.getElementById(id);return el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2;}).map(id=>({id,height:document.getElementById(id).clientHeight,scroll:document.getElementById(id).scrollHeight})));assert.deepEqual(overflow,[],'Standard desktop questions and feedback fit without internal scrolling');}
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync} from 'node:fs';
import {setup}from'./browser-fixture.mjs';
const WORLD='pashto-quest-rpg-world-v1',data=JSON.parse(readFileSync('content/RPG_WORLD.json'));
const captures='docs/rpg/lesson-cleanup';mkdirSync(captures,{recursive:true});
for(const [width,height]of [[1920,1080],[1366,768],[1280,720],[768,1024],[390,844]].filter(([w])=>!process.env.DAILY_WIDTH||w===Number(process.env.DAILY_WIDTH))){
 const b=await setup({width,mobile:width===390,rpg:true,transform:h=>h.replace('// @TEST_HOOK','window.__dailyFence=saveFence; // @TEST_HOOK')});const p=b.page;
 try{
 await p.setViewportSize({width,height});await p.locator('#startTutorial').click();
 await p.evaluate(()=>__test.lessons.begin('tutorial'));
 for(const id of ['g-hello','g-how']){const en=await p.evaluate(id=>__test.content.wordById[id].en,id);await p.locator('#tutorialInteraction button').getByText(en,{exact:true}).click();await p.locator('#teachNext').click();}
 await p.locator('[data-answer="پښتو"]').click();await p.locator('#teachNext').click();await p.locator('#tutorialName').fill('Muhammad Jan');await p.locator('#tutorialSaveName').click();await p.locator('#teachNext').click();await p.locator('#resultWorld').click();while(await p.getByRole('button',{name:'Continue',exact:true}).count())await p.getByRole('button',{name:'Continue',exact:true}).click();await p.getByRole('button',{name:'Explore the village',exact:true}).click();
 if(width===1366){
  await p.evaluate(()=>__test.lessons.begin('1-residential'));await p.locator('#teachPanel').waitFor();await p.locator('#teachNext').click();
  assert.equal(await p.locator('#teachNote').isVisible(),false,'Base approval notice is absent without blank space');
  assert(!await p.getByText('Another location expression awaits an approved Pashto translation and cannot yet be studied.',{exact:true}).count());
  await p.screenshot({path:captures+'/study-1366.png',fullPage:true});await p.locator('#navWorld').click();
 }
 await p.evaluate(()=>__test.challenge.startChallenge(1));await p.locator('#quizPanel').waitFor();
 assert.equal(await p.locator('#rpgCanvas').isVisible(),false,'Learning hides the mounted world');
 const panel=await p.locator('#lessonScreen').boundingBox();assert(panel.width>=Math.min(width-40,1300),'Learning uses viewport width');
 const start=await p.evaluate(()=>scrollY);let captured=false;let footer;
 for(let i=0;i<15;i++){
  if(width>=1000)await assertNoOverflow(p);
  const box=await p.locator('#quizNext').boundingBox();assert(box.y+box.height<=height-4,'Next remains within viewport');if(footer!==undefined)assert(Math.abs(box.y-footer)<2,'Stable Next position');footer=box.y;
  const q=await p.evaluate(()=>{const t=__test,q=t.state.session.questions[t.state.session.index];return {...q,answer:t.content.wordById[q.id][q.direction==='en-ps'?'ps':'en']};});
  if(i<3)assert.equal(await p.locator('#unseenRecall').count(),0);
  if(q.kind==='word'&&q.unstudied&&!q.recognition){
   const colors=await p.evaluate(()=>[document.querySelector('#choices button[type=submit]'),document.getElementById('quizSpeak')].map(e=>getComputedStyle(e).backgroundColor));assert.equal(colors[0],colors[1]);
   if(!captured){await p.locator('#choices button[type=submit]').scrollIntoViewIfNeeded();await p.screenshot({path:`${captures}/meaning-${width}.png`,fullPage:true});captured=true;}
   await p.locator('#unseenRecall').fill(q.answer);await p.locator('#choices button[type=submit]').click();
  }else if(['construct','dialogue'].includes(q.kind)){
   const ps=await p.evaluate(()=>{const q=__test.state.session.questions[__test.state.session.index];return q.answerPs||__test.content.wordById[q.id].ps;});
   for(const token of ps.replace(/[.!؟،]/g,'').split(/\s+/).filter(Boolean))await p.locator('#wordTiles button:enabled').getByText(token,{exact:true}).first().click();await p.locator('#checkBuild').click();
  }else await p.locator('#choices button').getByText(q.answer[0].toUpperCase()+q.answer.slice(1),{exact:true}).click();
  if(['construct','dialogue'].includes(q.kind)){
   const voice=await p.getByRole('button',{name:'Hear the correct sentence',exact:true}).boundingBox();assert(voice&&voice.y>=0&&voice.y+voice.height<=height-4,'Full-sentence audio stays reachable');
  }
  if(width>=1000)await assertNoOverflow(p);
  if(i===5)await p.screenshot({path:`${captures}/feedback-${width}.png`,fullPage:true});
  assert(Math.abs((await p.locator('#quizNext').boundingBox()).y-box.y)<2,'Feedback keeps Next stable');
  assert.equal(await p.evaluate(()=>scrollY),start);assert.equal(await p.evaluate(()=>document.documentElement.scrollHeight>innerHeight+2||document.documentElement.scrollWidth>innerWidth+2),false);
  await p.locator('#quizNext').click();
 }
 assert(!captured,'Typing is disabled by default throughout a normal challenge');
 // Create a genuine recorded pass and acknowledged chapter ending in a supported fixture.
 await p.evaluate(async({WORLD,data})=>{const t=__test;t.state.session=null;t.progression.completeChallengeOnce(t.state.progress,1,15);await t.storage.save();const raw=localStorage.getItem(WORLD),w=JSON.parse(raw||'{}');Object.assign(w,{schemaVersion:1,appearance:'neutral',npcFlags:{},educationFingerprint:null,chapter:'day-1',position:{map:'house',x:17,y:10,facing:'right'},flags:{started:true,metGuide:true},view:'world',dialogue:undefined,routes:{'day-1':'skip'},triggers:{}});for(const id of [data.days[1].endingEvent,data.days[1].routes?.skip.event,...data.days[1].mandatoryEvents].filter(Boolean))w.triggers[id]=true;const next=JSON.stringify(w);await navigator.locks.request(WORLD,()=>__dailyFence.commit(WORLD,raw,next,()=>localStorage.getItem(WORLD),()=>{localStorage.setItem(WORLD,next);return true;}));},{WORLD,data});
 await p.reload();await p.locator('#rpgCanvas').waitFor();await p.getByText('Quick travel',{exact:true}).click();await p.locator('#quickSleep').click();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('pashto-quest-rpg-world-v1'))?.chapter==='day-2');
 assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('pashto-quest-rpg-world-v1')).position),{map:'house',x:17,y:10,facing:'left'});
 if(width===1366){
  async function fixture(day,position,{school=false,passed=false}={}){
   await p.evaluate(async({day,position,school,passed,WORLD,data})=>{
    const t=__test;t.state.session=null;
    for(let d=1;d<day;d++)t.progression.completeChallengeOnce(t.state.progress,d,t.progression.getChallengeSpec(d).passCount);
    if(school)t.state.progress.complete['2-school']=true;
    if(passed)t.progression.completeChallengeOnce(t.state.progress,day,t.progression.getChallengeSpec(day).passCount);
    await t.storage.save();const raw=localStorage.getItem(WORLD),w=JSON.parse(raw);w.chapter=data.days[day].id;w.position=position;delete w.dialogue;w.view='world';w.triggers[data.days[day].openingEvent]=true;
    const next=JSON.stringify(w);await navigator.locks.request(WORLD,()=>__dailyFence.commit(WORLD,raw,next,()=>localStorage.getItem(WORLD),()=>{localStorage.setItem(WORLD,next);return true;}));
   },{day,position,school,passed,WORLD,data});
   await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);
  }
  const atJan={map:'village',x:10,y:11,facing:'up'};
  for(const options of [{},{school:true},{passed:true}]){
   await fixture(2,atJan,options);await p.locator('#rpgInteract').click();
   while(await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).count())await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).click();
   const text=await p.locator('#rpgDialogue').innerText();assert(options.passed?text.includes('sleep'):options.school?text.includes('Remaining:'):text.includes('Ms Hameed')&&text.includes('School'));
   await p.locator('#rpgDialogue').getByRole('button',{name:'Back to village',exact:true}).click();
  }
  await fixture(4,atJan);await p.locator('#rpgInteract').click();
  const homeAction=data.events['day4-residential'].actions.find(a=>a.type==='lesson'&&a.lessonId==='4-residential');
  while(await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).count())await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).click();
  assert(await p.locator('#rpgDialogue').getByRole('button',{name:homeAction.label,exact:true}).count(),'Day4 required lesson preserved');
  await fixture(4,{map:'house',x:17,y:10,facing:'right'});assert.equal(await p.locator('#rpgCanvas').getAttribute('data-x'),'17');
  await p.setViewportSize({width:1000,height:650});await p.keyboard.press('ArrowRight');await p.waitForTimeout(220);assert.equal(await p.locator('#rpgCanvas').getAttribute('data-x'),'17','Bed collision after resize');await p.locator('#rpgInteract').click();assert(await p.locator('#rpgDialogue').isVisible(),'Bed object interaction after resize');
  await fixture(1,{map:'house',x:17,y:10,facing:'right'});
  await p.locator('#rpgInteract').click();
  while(await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).count())await p.locator('#rpgDialogue').getByRole('button',{name:'Continue',exact:true}).click();
  await p.locator('#rpgDialogue').getByRole('button',{name:data.events['house-bed'].actions.find(a=>a.type==='sleep').label,exact:true}).click();
  await p.locator('#sleepTransition').waitFor({state:'detached'});
  assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('pashto-quest-rpg-world-v1')).position),{map:'house',x:17,y:10,facing:'left'});
  await fixture(2,{map:'house',x:12,y:15,facing:'down'});assert.equal(await p.locator('#rpgCanvas').getAttribute('data-x'),'12');assert.equal(await p.locator('#rpgCanvas').getAttribute('data-y'),'15','Resume preserves the actual saved tile');

 }
 assert.deepEqual(b.errors,[]);console.log('PASS',width,height,'tutorial, complete challenge, recognition/recall, yellow controls, bounded page and shared sleep spawn');
 }finally{await b.close();}
}
