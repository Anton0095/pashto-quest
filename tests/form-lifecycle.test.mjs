import assert from 'node:assert/strict';
import {runtime,reset,study,plain} from './runtime-fixture.mjs';
const t=runtime();reset(t,8);
const p=t.state.progress,data=t.content.LIBRARY_DATA;
t.E.unlock(p,1,'acknowledged-school-concept');
const pool=t.learning.libraryLessonPool(1,'school');
const id=pool.find(id=>data.sourceMappings[id]?.length===1),ref=data.sourceMappings[id][0],entry=t.content.libraryEntries[ref.lemmaId];
t.state.session={id:'1-school',loc:'school',loop:1,mode:'standard'};
t.learning.libraryExpose(id,'lesson-preview');
assert(!t.E.formallyTaught(p,ref.formId));assert(!t.E.inBank(p,ref.lemmaId),'preview is incidental, not a Bank award');
assert(!p.library.acquired[ref.lemmaId].availableFormIds.length);
t.learning.acknowledgeForm(id);assert(t.E.formallyTaught(p,ref.formId));assert(t.E.inBank(p,ref.lemmaId));
assert.equal(t.E.formStatus(p,entry,entry.forms.find(f=>f.formId===ref.formId)).introducedLesson,'1-school');
const before=plain(p);for(const form of entry.forms)t.E.formStatus(p,entry,form);assert.deepEqual(plain(p),before,'reference status is read-only');
for(const f of entry.forms.filter(f=>f.formId!==ref.formId)){assert(t.E.formStatus(p,entry,f).referenceAvailable);assert(!t.E.formallyTaught(p,f.formId));}
// The same lemma may start through a finite form; its infinitive stays untaught.
const u=runtime();reset(u,12);study(u,1,'school');u.progression.completeChallengeOnce(u.state.progress,1,15);study(u,2,'school');
const plan=u.E.ensurePlan(u.state.progress,u.content.LIBRARY_DATA,2);
const nature=u.learning.libraryLessonPool(2,'nature');
const finite=nature.map(id=>({id,ref:u.content.LIBRARY_DATA.sourceMappings[id]?.[0]})).find(x=>x.ref&&u.content.libraryEntries[x.ref.lemmaId].partOfSpeech==='verb'&&u.content.libraryEntries[x.ref.lemmaId].forms.find(f=>f.formId===x.ref.formId)?.morphology.person===3);
assert(finite,'first finite verb selected');const verb=u.content.libraryEntries[finite.ref.lemmaId];
assert.notEqual(finite.ref.formId,verb.forms[0].formId);
u.state.session={id:'2-nature',loc:'nature',loop:2,mode:'standard'};u.learning.libraryExpose(finite.id,'lesson-preview');assert(!u.E.formallyTaught(u.state.progress,finite.ref.formId));u.learning.acknowledgeForm(finite.id);
assert(u.E.formallyTaught(u.state.progress,finite.ref.formId));assert(!u.E.formallyTaught(u.state.progress,verb.forms[0].formId));
assert.deepEqual(plain(u.learning.libraryLessonPool(2,'nature')),plain(nature),'lesson form sequence remains frozen');
const future=verb.forms.find(f=>f.prerequisiteGrammarIds.includes('grammar-day-3'));assert(future);
const now=plain(u.state.progress.library.acquired[verb.lemmaId]);
u.E.practise(u.state.progress,u.content.LIBRARY_DATA,'library-form:'+future.formId,true,{source:'library-reference-practice',day:2,location:'library',reference:true,eventId:'voluntary-reference-check',now:1});
assert(!u.E.formallyTaught(u.state.progress,future.formId));assert.deepEqual(plain(u.state.progress.library.acquired[verb.lemmaId].availableFormIds),now.availableFormIds);assert(u.E.formStatus(u.state.progress,verb,future).practised);
assert(!u.learning.availableSentences(2).some(c=>Object.values(c.generated.slots).some(r=>r.formId===future.formId)));
// Explicit challenge activation/pass never makes a flashcard acknowledgement.
const v=runtime();reset(v);study(v,1,'school');const base=plain(v.state.progress.library.acquired);v.questions.selectChallenge(1);
for(const [id,r] of Object.entries(v.state.progress.library.acquired))if(!base[id]){assert(!r.formallyIntroducedDay);assert(Object.values(r.formUnlocks).every(o=>!o.studiedDay));}
v.progression.completeChallengeOnce(v.state.progress,1,0);v.progression.completeChallengeOnce(v.state.progress,1,15);
for(const [id,r] of Object.entries(v.state.progress.library.acquired))if(!base[id])assert(Object.values(r.formUnlocks).every(o=>!o.studiedDay));
assert(v.storage.currentSave(plain(v.state.progress)));
console.log('PASS acknowledged per-form study, preview/reference separation, finite-first introduction, stable sequence, voluntary SRS without unlock and honest challenge catch-up');
