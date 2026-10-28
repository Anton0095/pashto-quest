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
 const t=runtime();reset(t,0);const qs=t.questions.selectChallenge(1).filter(q=>q.kind==='choice');
 console.log('B grammar tasks',qs.length,'distinct prompts',new Set(qs.map(q=>q.prompt)).size,'unlearned days',qs.flatMap(q=>q.grammarDays));
 assert(new Set(qs.map(q=>q.prompt)).size>=Math.min(6,qs.length),'Grammar assessment must vary its application tasks');
 assert(qs.every(q=>q.grammarDays.every(d=>t.state.progress.library.grammar['grammar-day-'+d])),'Require actual taught grammar');
 assert(qs.every(q=>q.options.length>=3&&!q.options.some(o=>/Invent a missing|Ignore agreement|future construction/.test(o))));
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
 const t=runtime(), neutral=new Set(['A different meaning','Another response','None of these']);
 function introduced(c){const refs=t.content.LIBRARY_DATA.sourceMappings[c.id]||[];return refs.length>0&&refs.every(r=>t.state.progress.library.acquired[r.lemmaId]?.introducedFormIds.includes(r.formId))}
 function checkChoices(day){
  const qs=t.questions.selectChallenge(day);for(const q of qs.filter(q=>q.kind==='word')){
   const target=t.content.wordById[q.id];
   const legitimate=new Set(Object.values(t.content.wordById).filter(c=>introduced(c)||t.state.progress.library.phrases[c.id]).map(c=>c.en));
   for(const meaning of q.choiceOrder) assert(neutral.has(meaning)||legitimate.has(meaning),`Unstudied meaning ${meaning} day ${day}`);
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
 const covered=new Set();
 for(const pace of [0,4])for(let day=1;day<=14;day++){
  reset(t,pace);for(let d=1;d<=day;d++)t.E.unlock(t.state.progress,d,'studied-workshop-test');
  const before=plain(t.state.progress.library.grammar),qs=t.questions.selectChallenge(day);
  for(const q of qs.filter(q=>q.kind==='choice')){
   const c=t.content.LIBRARY_DATA.grammarAssessment.concepts.find(c=>c.id===q.grammarConcept);assert(c);covered.add(c.id);
   assert(c.day<=day);assert(q.grammarDays.every(d=>before['grammar-day-'+d]));assert.equal(q.correct,c.correct);
   assert.equal(new Set(q.options).size,4);assert.equal(q.options.filter(o=>o===q.correct).length,1);
   assert.deepEqual(new Set(plain(q.options).filter(o=>o!==q.correct)),new Set(plain(c.misconceptions)));
   assert(q.options.every(o=>!/[\u0600-\u06ff]/.test(o)));assert(!q.reference);
   assert(t.Q.evaluate(q,null,q.correct));for(const wrong of c.misconceptions)assert(!t.Q.evaluate(q,null,wrong));
  }
  assert.deepEqual(plain(t.state.progress.library.grammar),before);
 }
 assert.equal(covered.size,33,'Every English concept exercised through actual challenge factory');
 for(let day=1;day<=14;day++){
  reset(t,0);const qs=t.questions.selectChallenge(day);assert.deepEqual(plain(t.state.progress.library.grammar),{});
  for(const q of qs.filter(q=>q.kind==='choice')){assert(q.reference);assert(q.prompt.includes(q.reference));assert.equal(q.grammarDays.length,0);assert(t.content.LIBRARY_DATA.grammarAssessment.concepts.find(c=>c.id===q.grammarConcept).day===1)}
 }
 console.log('PASS P1-B extended: all 33 concepts, four unique answer roles, exact correctness, 0/4 ×14 learned-day sets, all-day guided skip without unlocks');
}
