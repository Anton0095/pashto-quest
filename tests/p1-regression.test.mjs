import assert from 'node:assert/strict';
import { runtime, reset, study, plain } from './runtime-fixture.mjs';
const mode=process.argv[2] || 'all';
if (['all','A'].includes(mode)) {
 const t=runtime(); reset(t); study(t,1,'residential');
 const target=t.content.wordById['library-card:lemma:n-house'];
 const choices=t.questions.distractors(target);
 const studiedMeanings=new Set(Object.values(t.content.wordById).filter(c=>
   (t.content.LIBRARY_DATA.sourceMappings[c.id]||[]).length &&
   t.content.LIBRARY_DATA.sourceMappings[c.id].every(r=>t.state.progress.library.acquired[r.lemmaId]?.introducedFormIds.includes(r.formId))
 ).map(c=>c.en));
 const leaks=choices.filter(c=>!studiedMeanings.has(c)&&!['A different meaning','Another response','None of these'].includes(c));
 console.log('A choices',choices,'unintroduced meanings',leaks);
 assert.deepEqual(plain(leaks),[],'Unvisited district meanings must not be distractors');
 console.log('PASS P1-A');
}
if (['all','B'].includes(mode)) {
 const t=runtime();reset(t,0);const qs=t.questions.selectChallenge(1);
 console.log('B practical tasks',qs.length);
 assert.equal(qs.length,15);assert(qs.every(q=>['word','construct','sentence','dialogue'].includes(q.kind)));
 assert.deepEqual(plain(t.questions.selectChallenge(1)),plain(t.questions.selectChallenge(1)));
 console.log('PASS P1-B');
}
if (['all','C'].includes(mode)) {
 const t=runtime();t.backend.setItem=()=>{throw new Error('QuotaExceededError')};
 t.state.progress.xp=123;const ok=t.storage.save();
 console.log('C result',ok,'persistence warning',t.storage.persistenceProblem);
 assert.equal(ok,false);assert(t.storage.persistenceProblem);assert.equal(t.state.progress.xp,123);
 console.log('PASS P1-C');
}
if(mode==='all') {
 const t=runtime(), fallback=new Set(t.content.LIBRARY_DATA.entries.filter(e=>e.introduction.day===1&&e.forms[0].firstAllowedDay===1).map(e=>e.englishSenses[0])), neutral=new Set(['A different meaning','Another response','None of these']);
 function introduced(c){const refs=t.content.LIBRARY_DATA.sourceMappings[c.id]||[];return refs.length>0&&refs.every(r=>t.state.progress.library.acquired[r.lemmaId]?.introducedFormIds.includes(r.formId))}
 function checkChoices(day){
  const qs=t.questions.selectChallenge(day);for(const q of qs.filter(q=>q.kind==='word')){
   const target=t.content.wordById[q.id];
   const legitimate=new Set(Object.values(t.content.wordById).filter(c=>introduced(c)||t.state.progress.library.phrases[c.id]).map(c=>c.en));
   for(const meaning of q.choiceOrder) assert(neutral.has(meaning)||legitimate.has(meaning)||fallback.has(meaning),`Unstudied meaning ${meaning} day ${day}`);
   if(q.unstudied)assert(!q.choiceOrder.includes(target.en));
  }
  const saved=plain(qs);t.storage.save();const loaded=t.storage.load();t.state.progress=loaded;
  assert.deepEqual(plain(t.questions.selectChallenge(day)),saved,'Reload never rerolls frozen choices');
 }
 reset(t); t.learning.libraryLessonPool(1,'residential');
 const entry=t.content.libraryEntries['lemma:n-house'];t.E.encounter(t.state.progress,t.content.LIBRARY_DATA,{lemmaId:entry.lemmaId,formId:entry.forms[0].formId},{day:1,source:'challenge'});
 assert.equal(t.E.status(t.state.progress.library.acquired[entry.lemmaId]),'encountered');checkChoices(1);
 reset(t);study(t,1,'residential');checkChoices(1); // scheduled is not studied; encountered is not introduced
 reset(t);study(t,1,'residential');t.state.day=2;checkChoices(2); // legitimate previous-day revision
 for(const pace of [0,4,8,12,16,20,24])for(let day=1;day<=14;day++){
  reset(t,pace);for(let d=1;d<day;d++)t.progression.completeChallengeOnce(t.state.progress,d,d===7?25:15);
  t.state.day=day;checkChoices(day);
 }
 console.log('PASS P1-A extended: encounter/intro separation, partial day, revision, all 14 skipped days × seven paces, saved choices');
 assert.equal(t.content.LIBRARY_DATA.grammarReference.concepts.length,33);
 assert(!t.content.LIBRARY_DATA.grammarAssessment);
 console.log('PASS read-only reference bank replaces English grammar quiz generation');
}
if(mode==='all'){
 const t=runtime();reset(t,0);const qs=t.questions.selectChallenge(1),q=qs[0];
 q.grammarDays=[14];t.state.session={mode:'challenge',questions:[q],index:0,locked:false,answered:0,correctCount:0,earned:0,attemptId:1,loop:1};
 t.learning.submitChallenge(t.content.wordById[q.id].en);assert.deepEqual(plain(t.state.progress.library.grammar),{});
 console.log('PASS practical assessment answers cannot grant workshop grammar');
}
