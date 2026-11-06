import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {setup} from './browser-fixture.mjs';
mkdirSync('work/characters',{recursive:true});
for(const width of [1280,390]){
 const b=await setup({width,rpg:true,mobile:width===390,offline:true,transform:h=>h.replace('// @TEST_HOOK','window.__names={ui,rpg,names:{text:value=>value},fence:saveFence}; // @TEST_HOOK')}),p=b.page;
 try{
  await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);
  for(const [id,ps,en]of [['mina','مدینه','Medina'],['saleha','دینه','Deena']]){
   // Prepare a current-format assessment using registered lexical forms and the
   // actual frozen-question path. No answer/score/reward is injected.
   await p.evaluate(async()=>{
    const t=__test;t.state.session=null;t.state.progress=t.progression.fresh();t.state.progress.tutorialDone=true;
    for(let d=1;d<6;d++)t.progression.completeChallengeOnce(t.state.progress,d,15);
    await t.storage.save();await __names.rpg.flush();
    const key='pashto-quest-rpg-world-v1',raw=localStorage.getItem(key),w=JSON.parse(raw);Object.assign(w,{chapter:'day-6',position:{map:'village',x:66,y:19,facing:'up'},view:'world',lesson:null,educationFingerprint:null,flags:{started:true,metGuide:true},triggers:{'day6-skip':true},routes:{'day-6':'skip'}});delete w.dialogue;delete w.sleepIntent;
    const next=JSON.stringify(w);await navigator.locks.request(key,()=>__names.fence.commit(key,raw,next,()=>localStorage.getItem(key),()=>{localStorage.setItem(key,next);return true;}));
   });await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);
   const before=await p.evaluate(async id=>{
    const t=__test;t.challenge.startChallenge(6);
    const e=t.content.libraryEntries['lemma:person:'+id],f=e.forms[0],card=t.content.wordById['library-form:'+f.formId];
    if(!card)throw Error('Missing registered name card');
    t.state.session.questions[0]={id:card.id,kind:'word',direction:'ps-en',unstudied:true,recognition:false,choiceOrder:[card.en,'Edris','Muhammad Jan']};
    delete t.state.session.tileSequence;t.state.session.built=[];t.state.session.index=0;t.state.session.locked=false;
    await t.storage.save();return {questions:JSON.stringify(t.state.progress.activeChallenge.questions),xp:t.state.progress.xp};
   },id);
   await p.reload();await p.locator('#unseenRecall').waitFor();assert.equal(await p.locator('#quizPashto').innerText(),ps);assert(!/Mina|Saleha|مینا|صالح[هې]/u.test(await p.locator('#lessonScreen').innerText()));
   await p.locator('#unseenRecall').fill(en);await p.getByRole('button',{name:'Submit meaning',exact:true}).click();assert.equal(await p.locator('#quizFeedback strong').innerText(),'✓ Correct');assert.match(await p.locator('#quizFeedback .answer-translation').innerText(),new RegExp(ps));assert.match(await p.locator('#quizFeedback .answer-translation').innerText(),new RegExp(en));
   const answered=await p.evaluate(async()=>{await __test.storage.save();return {xp:__test.state.progress.xp,count:__test.state.session.correctCount,questions:JSON.stringify(__test.state.progress.activeChallenge.questions)};});assert.equal(answered.count,1);assert.equal(answered.questions,before.questions);assert(answered.xp>=before.xp);
   await p.reload();await p.locator('#quizFeedback strong').waitFor();assert.equal(await p.locator('#quizFeedback strong').innerText(),'✓ Correct');assert.equal(await p.evaluate(()=>__test.state.progress.xp),answered.xp);assert.equal(await p.evaluate(()=>JSON.stringify(__test.state.progress.activeChallenge.questions)),before.questions);
   await p.screenshot({path:`work/characters/name-${id}-${width}.png`,fullPage:true});
  }
  // Exercise the shared construction component with real compiler output. Labels
  // change to approved names; the exact proof and indexed tile values do not.
  await p.evaluate(()=>{
   const t=__test;t.state.session=null;__names.rpg.startWorld();
   for(let day=1;day<=6;day++)t.E.unlock(t.state.progress,day,'name-test');
   for(const e of t.content.LIBRARY_DATA.entries)for(const f of e.forms)if(t.E.formAllowed(e,f,6))t.E.encounter(t.state.progress,t.content.LIBRARY_DATA,{lemmaId:e.lemmaId,formId:f.formId},{day:6,source:'lesson',introduce:true});
   window.__nameCards=t.S.available(t.state.progress,t.content.LIBRARY_DATA,t.content.LIBRARY_DATA.sentenceFrames,6);
  });
  for(const old of ['مدینه','دینه']){
   const expected=await p.evaluate(old=>{
    const t=__test,c=__nameCards.find(c=>c.ps.includes(old));if(!c)throw Error('Missing licensed named composition');
    document.getElementById('nameConstruction')?.remove();const root=__names.ui.node('div');root.id='nameConstruction';document.body.append(root);
    const q={id:c.id,kind:'construct',direction:'en-ps',tileVariant:'exact'};window.__nameConstruct={card:c,exact:JSON.stringify(c),correct:null};
    __names.ui.construction.mount(root,c,q,{onAnswer:correct=>{__nameConstruct.correct=correct;}});
    return __names.names.text(c.ps).replace(/[.!؟،]/g,'').split(/\s+/).filter(Boolean);
   },old);
   const root=p.locator('#nameConstruction');assert(!/Mina|Saleha|مینا|صالح[هې]/u.test(await root.innerText()));for(const token of expected)await root.locator('.word-tiles button:enabled').getByText(token,{exact:true}).first().click();await root.getByRole('button',{name:'Check sentence',exact:true}).click();assert.equal(await p.evaluate(()=>__nameConstruct.correct),true);assert.equal(await p.evaluate(()=>JSON.stringify(__nameConstruct.card)===__nameConstruct.exact),true);assert(!/Mina|Saleha|مینا|صالح[هې]/u.test(await root.innerText()));await root.evaluate(e=>e.remove());
  }
  await p.evaluate(()=>{window.__spokenName='';speechSynthesis.getVoices=()=>[];speechSynthesis.speak=u=>{window.__spokenName=u.text;};__test.content.registerGenerated(__nameConstruct.card);__test.audio.speak(__nameConstruct.card.id);});
  await p.waitForFunction(()=>window.__spokenName);assert.match(await p.evaluate(()=>__spokenName),/دینه/);assert(!/صالح[هې]/u.test(await p.evaluate(()=>__spokenName)));
  await p.locator('#rpgLibrary').click();await p.getByRole('button',{name:'Universal Vocabulary',exact:true}).click();const search=p.locator('#librarySearch');
  await search.fill('Medina');assert.match(await p.locator('#libraryEntries').innerText(),/مدینه/);assert(!/Mina|مینا/u.test(await p.locator('#libraryEntries').innerText()));await search.fill('دینه');assert.match(await p.locator('#libraryEntries').innerText(),/Deena/);
  assert.deepEqual(b.errors,[]);console.log('PASS owner-approved names',width,'typed recall, correct/reloaded feedback, exact frozen questions/XP lock, licensed construction labels/indices and Library search');
 }finally{await b.close();}
}
