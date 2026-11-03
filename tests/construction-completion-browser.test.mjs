import assert from 'node:assert/strict';
import {setup,tutorial,answerCurrent} from './browser-fixture.mjs';
for(const width of [375,1280]) {
 const b=await setup({width,transform:html=>html.replace("<script>","<script>window.SpeechSynthesisUtterance=class {constructor(text){this.text=text}};")});const p=b.page;
 try {
  await tutorial(p);
  await p.evaluate(()=>{
   const t=__test;t.lessons.begin('1-residential');
   while(['greeting','lexical','sentence','grammar'].includes(t.state.session.phase)) {
    if(t.state.session.phase==='grammar')t.lessons.afterGrammar();else t.lessons.afterStudy();
   }
  });
  // Actual lesson queue: both deliberate variants, same controls and full answer audio.
  const variants=new Set();
  while(await p.locator('#lessonScreen').isVisible()) {
   const item=await p.evaluate(()=>__test.state.session.activeItem);
   if(item.kind==='construct') {
    variants.add(Boolean(item.duds));
    assert.equal(await p.locator('#quizPashto').innerText(),await p.evaluate(id=>__test.content.wordById[id].en,item.id));
    assert.equal(await p.locator('#guideMessage').isVisible(),false);
    assert.equal(await p.locator('#participants [data-character-id]').count(),0,'Construction with the instructor uses one portrait');
    assert.equal(await p.locator('#quizSpeak').isVisible(),false);
    assert.equal(await p.getByRole('button',{name:'Hear the correct sentence',exact:true}).count(),0);
   }
   await answerCurrent(p);
   if(item.kind==='construct') {
    assert.equal(await p.locator("#builtSentence button:enabled").count(),0);
    const reward=await p.evaluate(()=>({xp:__test.state.progress.xp,events:JSON.stringify(__test.state.progress.library.events),locked:__test.state.session.locked}));
    await p.evaluate(()=>{window.spoken=[];window.cancelled=0;window.speechSynthesis.getVoices=()=>[{name:'Test Pashto device voice',lang:'ps-AF'}];window.speechSynthesis.speak=u=>{window.spoken.push(u.text);u.onstart?.()};window.speechSynthesis.cancel=()=>window.cancelled++;});
    await p.getByRole('button',{name:'Hear the correct sentence',exact:true}).click();
    assert.deepEqual(await p.evaluate(()=>window.spoken),[await p.evaluate(id=>__test.content.wordById[id].ps,item.id)]);
    assert.deepEqual(await p.evaluate(()=>({xp:__test.state.progress.xp,events:JSON.stringify(__test.state.progress.library.events),locked:__test.state.session.locked})),reward);
    assert((await p.locator('#audioStatus').innerText()).includes('Speaking with'));
    assert(!/recording/i.test(await p.locator('#audioStatus').innerText()));
    if(item.duds)assert.equal(await p.locator('#wordTiles button:enabled').count(),0); // All controls lock after submission, not all tiles selected.
    await p.locator('#quizNext').click();assert(await p.evaluate(()=>window.cancelled>0));
   } else await p.locator('#quizNext').click();
  }
  // A retry changes variants deliberately; stale duds must not carry into exact tiles.
  await p.evaluate(()=>{
    const t=__test;t.lessons.begin('1-residential');const s=t.state.session;
    const card=t.learning.generatedPractice(1,10,1)[0];
    s.phase='quiz';s.queue=[{id:card.id,kind:'construct',retries:0}];s.constructionCount=1;
    t.lessons.showQuestion();if(!s.activeItem.duds)throw Error('Expected dud variant');
    t.lessons.answer('wrong');t.lessons.showQuestion();
    if(s.activeItem.duds || s.activeItem.tileVariant!=='exact')throw Error('Retry retained stale duds');
  });
  await answerCurrent(p);await p.locator('#quizNext').click();
  assert.equal(variants.size,2,'lesson includes exact and distractor variants');
  // No-visit/partial pass uses actual grading before any completion unlocks.
  await p.evaluate(()=>__test.challenge.startChallenge(1));
  const questions=await p.evaluate(()=>__test.state.session.questions);
  while(await p.evaluate(()=>!__test.state.session.finished)) {
   const q=await p.evaluate(()=>__test.state.session.questions[__test.state.session.index]);
   await answerCurrent(p);
   if(['construct','dialogue'].includes(q.kind)) {
    assert.equal(await p.locator('#quizPashto').innerText(),q.answerEnglish || await p.evaluate(id=>__test.content.wordById[id].en,q.id));
    const frozen=await p.evaluate(async()=>{await __test.storage.save();return JSON.parse(JSON.stringify(__test.state.session))});
    await p.reload();
    assert.deepEqual(await p.evaluate(()=>__test.state.session.questions),questions);
    assert.deepEqual(await p.evaluate(()=>__test.state.session.built),frozen.built);
    assert.equal(await p.getByRole('button',{name:'Hear the correct sentence',exact:true}).count(),1);
    // Clicking the restored control speaks the answer ID, not the dialogue prompt.
    await p.evaluate(()=>{window.heard=[];__test.audio.speak=id=>window.heard.push(__test.content.wordById[id].ps)});
    await p.getByRole('button',{name:'Hear the correct sentence',exact:true}).click();
    assert.deepEqual(await p.evaluate(()=>window.heard),[q.answerPs || await p.evaluate(id=>__test.content.wordById[id].ps,q.id)]);
   }
   await p.locator('#quizNext').click();
  }
  assert(await p.locator('#passUnlockNotice').isVisible());
  assert((await p.locator('#passUnlockNotice').innerText()).includes('You have completed this day’s challenge. Words from the locations you skipped were unlocked when the challenge began and remain available for future activities. Visit the Library to review them.'));
  await p.getByRole('button',{name:'Review unlocked vocabulary',exact:true}).click();
  const labels=await p.locator('#libraryEntries .unlock-origin').allTextContents();
  assert(labels.length);assert(labels.every(l=>l.includes('Unlocked: Day 1')&&l.includes('Unlocked when starting the challenge')));
  assert(labels.some(l=>/Lake|Market|School/.test(l)));assert(!labels.some(l=>/· Challenge ·/.test(l)));
  await p.locator('#libraryClose').click();
  // Shared Library construction (both variants) grades once, never awards XP.
  await p.evaluate(()=>__test.library.openLibrary('sentences'));
  const cards=await p.locator('.construction-practice').count();assert(cards>=2);
  for(let n=0;n<cards;n++) {
   const box=p.locator('.construction-practice').nth(n),id=await box.getAttribute('data-sentence');
   const answer=await p.evaluate(id=>__test.content.wordById[id].ps,id),before=await p.evaluate(()=>__test.state.progress.xp);
   assert.equal(await box.getByRole('button',{name:'Hear the correct sentence',exact:true}).count(),0);
   for(const token of answer.replace(/[.!؟،]/g,'').split(/\s+/))await box.locator('.word-tiles button:enabled').getByText(token,{exact:true}).first().click();
   if(n%2===0)assert.equal(await box.locator('.word-tiles button:enabled').count(),2);
   await box.getByRole('button',{name:'Check sentence',exact:false}).click();
   await box.getByRole('button',{name:'Hear the correct sentence',exact:true}).click();
   assert.equal(await p.evaluate(()=>__test.state.progress.xp),before);
   assert.equal(await box.getByRole('button',{name:'Check sentence',exact:false}).isDisabled(),true);
  }
  const bounded=await p.evaluate(async()=>{
    await __test.storage.save();
    return Object.keys(__test.state.progress.library.events).every(k=>!/^library-(?:practice|construction):/.test(k));
  });
  assert(bounded,'closed Library construction grades retire through the existing practice identity');
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await p.locator('#libraryClose').click();
  assert.deepEqual(b.errors,[]);
  console.log('PASS shared construction/completion browser',width,'lesson/assessment/Library exact+dud variants; direct targets; real full-sentence speech; navigation cancellation; restored success audio; once-only grades/rewards; honest filtered provenance and mobile layout');
 } finally {await b.close()}
}
