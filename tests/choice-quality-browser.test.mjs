import assert from 'node:assert/strict';
import {setup,tutorial} from './browser-fixture.mjs';
for(const width of [375,1280]) {
 const b=await setup({width,transform:html=>html.replace('// @TEST_HOOK','window.__ui=ui; // @TEST_HOOK')});
 try {
  const p=b.page;await tutorial(p);
  const checked=await p.evaluate(async()=>{
   const t=__test,ui=__ui,$=id=>document.getElementById(id),check=(ok,message)=>{if(!ok)throw Error(message)};
   // An ordinary/forced visit uses the same choices after actual word study,
   // without needing a correct response, reward or completion.
   t.reset();t.state.progress.tutorialDone=true;t.lessons.begin('1-residential');
   while(['greeting','lexical','sentence','grammar'].includes(t.state.session.phase)) {
    if(t.state.session.phase==='grammar')t.lessons.afterGrammar();else t.lessons.afterStudy();
   }
   const before=JSON.stringify(t.state.progress.library.acquired);
   for(const mode of ['standard','review']) {
    const s=t.state.session;s.mode=mode;s.phase='quiz';s.locked=false;
    s.queue=[{id:'library-card:lemma:a-big',kind:'word',retries:0}];t.lessons.showQuestion();
    const values=[...$('choices').querySelectorAll('button')].map(b=>b.dataset.answer);
    check(values.length===4&&!values.some(v=>['A different meaning','Another response','None of these'].includes(v)),'placeholder despite vocabulary supply');
    check(values.some(v=>/house|door|room|window/i.test(v)),'no noun alternatives for adjective');
    check(JSON.stringify(t.state.progress.library.acquired)===before,'display acquired distractors');
   }
   // One shared predicate marks every evaluator-accepted variant consistently.
   const root=document.createElement('div'),w=t.content.wordById['library-form:lemma:v-open:form:0'];
   for(const value of ['To open','open','House']){const b=ui.button(value,()=>{});b.dataset.answer=value;root.append(b)}
   ui.showAnswerFeedback(root,w.en,'open',{accepts:v=>t.Q.evaluate({kind:'word',direction:'ps-en'},w,v)});
   check(root.querySelectorAll('.correct').length===2&&!root.querySelector('.wrong'),'accepted variant highlighted wrong');
   // Library uses the real form's accepted answers, not a reduced {en} object.
   const inf=t.content.libraryEntries['lemma:v-open'];t.E.encounter(t.state.progress,t.content.LIBRARY_DATA,{lemmaId:inf.lemmaId,formId:inf.forms[0].formId},{day:2,source:'lesson',introduce:true});
   t.state.day=2;t.library.openLibrary();
   const detail=document.querySelector('[data-lemma="lemma:v-open"]');check(detail,'missing Library verb');
   const select=t.questions.distractors;t.questions.distractors=()=>['To open','open','House','Door'];
   const practice=[...detail.querySelectorAll('button')].find(b=>b.textContent==='Practise an encountered form');check(practice,'missing Library practice');
   practice.click();t.questions.distractors=select;
   const exercise=detail.lastElementChild,buttons=[...exercise.querySelectorAll('button')],xpBefore=t.state.progress.xp;
   buttons.find(b=>b.dataset.answer==='open').click();
   check(exercise.querySelectorAll('.correct').length===2&&!exercise.querySelector('.wrong'),'Library discarded accepted form answers');
   check(t.state.progress.xp===xpBefore,'Library awarded XP');
   const attempts=t.state.progress.library.acquired[inf.lemmaId].totalAttempts;buttons.find(b=>b.dataset.answer==='open').click();
   check(t.state.progress.library.acquired[inf.lemmaId].totalAttempts===attempts,'Library duplicate SRS');
   // Frozen old grammar choices remain byte-identical. Only their acceptance
   // policy is clarified; scores already locked are never replayed.
   $('libraryDialog').close();t.reset(0);t.state.progress.tutorialDone=true;t.state.day=1;t.challenge.startChallenge(1);
   const s=t.state.session,i=s.questions.findIndex(q=>q.grammarConcept==='feminine-description');check(i>=0,'missing fixture concept');
   const q=s.questions[i];q.prompt='Check a learner’s analysis. The described noun is feminine singular. Which pair agrees?';delete q.explanation;
   s.index=i;s.answered=i;s.locked=false;t.challenge.showChallengeQuestion();
   window.frozenChoices=JSON.stringify(q.choiceOrder);window.frozenPrompt=q.prompt;
   const alt='Masculine singular adjective + feminine singular equative';
   [...$('choices').children].find(b=>b.dataset.answer===alt).click();
   check(s.locked&&s.correctCount===1,'defensible frozen answer rejected');
   check($('choices').querySelectorAll('.correct').length===2,'frozen multiple acceptable choices not highlighted');
   check($('quizFeedback').textContent.includes('invariant'),'missing explanatory feedback');
   const xp=t.state.progress.xp;[...$('choices').children].find(b=>b.dataset.answer===alt).click();check(t.state.progress.xp===xp,'repeated XP');
   await t.storage.save();return {choices:q.choiceOrder,prompt:q.prompt,xp,score:s.correctCount};
  });
  await p.reload();const resumed=await p.evaluate(()=>({choices:__test.state.session.questions[__test.state.session.index].choiceOrder,prompt:__test.state.session.questions[__test.state.session.index].prompt,xp:__test.state.progress.xp,score:__test.state.session.correctCount}));
  assert.deepEqual(resumed,checked);assert.equal(await p.locator('#choices .correct').count(),2);assert((await p.locator('#quizFeedback').innerText()).includes('Previously recorded scores'));
  await p.evaluate(async()=>{__test.state.session.correctCount=0;await __test.storage.save()});
  const oldXP=await p.evaluate(()=>__test.state.progress.xp);await p.reload();
  assert.equal(await p.evaluate(()=>__test.state.session.correctCount),0,'do not regrade a historically locked ambiguous response');
  assert.equal(await p.evaluate(()=>__test.state.progress.xp),oldXP);
  assert.equal(await p.locator('#choices .correct').count(),2);
  assert.deepEqual(b.errors,[]);console.log(width,'PASS shared same-lesson choices, mixed POS, evaluator/highlight parity, frozen ambiguous answer, explanation and reload without regrade');
 }finally{await b.close()}
}
