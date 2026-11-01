import assert from 'node:assert/strict';
import {setup} from './browser-fixture.mjs';
for (const width of [375,1280]) {
  const b=await setup({width,transform:html=>html.replace('// @TEST_HOOK','window.__ui=ui; // @TEST_HOOK')});
  try {
    const p=b.page;
    const counts=await p.evaluate(async()=>{
      const t=__test,ui=__ui,$=id=>document.getElementById(id);
      const require=(ok,message)=>{if(!ok)throw Error(message)};
      let submissions=0;
      // The real lesson renderer and transaction, both outcomes, every day/place.
      for(let day=1;day<=14;day++)for(const loc of t.content.zoneKeys)for(const right of [false,true]) {
        t.reset();t.state.progress.tutorialDone=true;t.state.progress.xp=1800;
        for(let n=1;n<=14;n++) {
          t.state.progress.challenges[n]={passed:true,best:n===7||n===14?25:15,attempts:1};
          for(const place of t.content.zoneKeys)t.state.progress.complete[n+'-'+place]=true;
        }
        t.state.day=day;t.lessons.begin(day+'-'+loc);
        const s=t.state.session;
        if(!s.queue.length)continue;
        s.phase='quiz';t.lessons.showQuestion();
        const w=t.content.wordById[s.activeItem.id],before=t.state.progress.xp;
        const options=[...$('choices').children];
        const selected=options.find(el=>(el.dataset.answer===w.en)===right);
        require(selected,'Missing answer option '+day+' '+loc);
        selected.click();
        require($('choices').querySelectorAll('.correct').length===1,'Correct answer not highlighted '+day+' '+loc);
        require($('choices').querySelector('.correct').dataset.answer===w.en,'Wrong target highlighted');
        require($('choices').querySelectorAll('.wrong').length===(right?0:1),'Wrong selection not highlighted');
        require([...$('choices').children].every(el=>el.disabled),'Options not locked');
        const after=t.state.progress.xp;selected.click();require(t.state.progress.xp===after,'Double submission awarded XP');
        require(!$('quizNext').disabled,'Cannot continue');submissions++;
        await Promise.resolve();
      }
      // Introduce actual forms to inspect all available grammar families.
      t.reset();t.state.progress.tutorialDone=true;t.state.progress.xp=1800;t.state.day=14;
      for(let n=1;n<=13;n++)t.state.progress.challenges[n]={passed:true,best:n===7?25:15,attempts:1};
      for(let day=1;day<=14;day++)t.E.unlock(t.state.progress,day,'test-workshop');
      for(const e of t.content.LIBRARY_DATA.entries)for(const f of e.forms)
        t.E.encounter(t.state.progress,t.content.LIBRARY_DATA,{lemmaId:e.lemmaId,formId:f.formId},{day:14,source:'lesson',introduce:true});
      const cards=t.learning.availableSentences(14);
      const families=new Map(cards.map(c=>[c.generated.family,c]));
      for(const c of families.values()) {
        ui.sentenceContext(c,'Muhammad Jan',$('quizPanel'),'construct');
        require($('quizPanel').querySelector('.sentence-scene').getAttribute('aria-label')===c.en,'Scene does not match generated meaning');
        require($('guideMessage').textContent.includes(c.en),'Narrative does not match target');
        require($('speakerName').textContent.includes('Muhammad Jan'),'Wrong speaker');
      }
      for(const state of ['open']) {
        const c=cards.find(c=>c.generated.semanticArguments?.noun==='window'&&c.generated.semanticArguments?.adjective===state);
        require(c,'No actual '+state+' window composition');
        ui.sentenceContext(c,'Muhammad Jan',$('quizPanel'),'study');
        require($('quizPanel').querySelector('figure[data-object="window"][data-state="'+state+'"] svg'),'Wrong window illustration');
      }
      // Exercise construction feedback and reset through the real lesson UI.
      const target=cards.find(c=>c.loop===1&&c.generated.semanticArguments?.noun==='window'&&c.generated.semanticArguments?.adjective==='open');
      t.content.registerGenerated(target);
      for(const mode of ['standard','review'])for(const right of [false,true]) {
        t.lessons.begin('1-residential');
        const s=t.state.session;s.mode=mode;s.phase='quiz';
        s.queue=[{id:target.id,kind:'construct',retries:0}];
        t.lessons.showQuestion();
        require(!$('builtSentence').classList.contains('build-error')&&!$('builtSentence').classList.contains('build-success'),'Previous build colour persisted');
        t.lessons.answer(right?target.ps:'wrong');
        require($('builtSentence').classList.contains(right?'build-success':'build-error'),'Construction result missing');
      }
      // Library practice shares the same visible correct/wrong feedback.
      for(const right of [false,true]) {
        t.library.openLibrary();
        const entry=document.querySelector('.library-entry');
        const id=entry.dataset.lemma;
        const button=[...entry.querySelectorAll('button')].find(b=>b.textContent==='Practise an encountered form');
        require(button,'Library practice missing');button.click();
        const exercise=entry.lastElementChild;
        const candidates=[...exercise.querySelectorAll('button')];
        // Correct target is the first encountered form of the displayed lemma.
        const lemma=t.content.LIBRARY_DATA.entries.find(e=>e.lemmaId===id);
        require(lemma,'Library identity missing');
        const rec=t.state.progress.library.acquired[id];
        const form=lemma.forms.find(f=>rec.encounteredFormIds.includes(f.formId));
        const selected=candidates.find(b=>(b.dataset.answer===form.englishGloss)===right);
        require(selected,'Library option missing');selected.click();
        require(exercise.querySelectorAll('.correct').length===1,'Library correct highlight missing');
        require(exercise.querySelectorAll('.wrong').length===(right?0:1),'Library wrong highlight missing');
        $('libraryDialog').close();
      }
      // Changing to a recognition question removes the prior answer picture.
      t.challenge.startChallenge(14);
      let s=t.state.session;
      s.index=s.questions.findIndex(q=>!['construct','dialogue'].includes(q.kind));s.answered=s.index;
      t.challenge.showChallengeQuestion();
      require(!$('quizPanel').querySelector('.sentence-scene'),'Recognition leaked a picture');
      return {submissions,families:families.size};
    });
    assert(counts.submissions>=100);
    assert(counts.families>=28);
    // Save/reload must restore correct and wrong choice colours without reaward.
    for(const right of [false,true]) {
      const expected=await p.evaluate(right=>{
        const t=__test;t.reset(0);t.state.progress.tutorialDone=true;t.learning.libraryExpose('phrase-d1-home-welcome','lesson');t.challenge.startChallenge(1);
        const s=t.state.session;s.index=s.questions.findIndex(q=>q.kind==='word'&&!q.unstudied);s.answered=s.index;t.challenge.showChallengeQuestion();
        const q=s.questions[s.index],value=right?t.content.wordById[q.id].en:q.choiceOrder.find(x=>!t.Q.evaluate(q,t.content.wordById[q.id],x));
        [...document.querySelectorAll('#choices button')].find(b=>b.dataset.answer===value).click();
        return {correct:t.content.wordById[q.id].en,xp:t.state.progress.xp};
      },right);
      assert.equal(await p.locator('#choices .correct').count(),1);
      await p.evaluate(()=>__test.storage.settled());await p.reload();
      assert.equal(await p.locator('#choices .correct').innerText(),expected.correct);
      assert.equal(await p.locator('#choices .wrong').count(),right?0:1);
      assert.equal(await p.evaluate(()=>__test.state.progress.xp),expected.xp);
    }
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.deepEqual(b.errors,[]);
    console.log('PASS narrative/feedback',width,counts,'all days/locations, both answers, 28+ families, open window, recognition disclosure, reload locks');
  } finally {await b.close()}
}
