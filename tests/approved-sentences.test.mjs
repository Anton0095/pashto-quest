import assert from 'node:assert/strict';
import {runtime,plain} from './runtime-fixture.mjs';
const t=runtime(),data=t.content.LIBRARY_DATA,frames=data.sentenceFrames;
t.state.progress.tutorialDone=true;
for(let day=1;day<=13;day++)t.E.unlock(t.state.progress,day,'visible-fixture');
for(const e of data.entries)for(const f of e.forms)t.E.encounter(t.state.progress,data,{lemmaId:e.lemmaId,formId:f.formId},{day:13,source:'lesson',introduce:true});
const cards=t.S.available(t.state.progress,data,frames,13);
const fish=t.content.libraryEntries['lemma:n-fish'];
assert.deepEqual(plain(fish.forms.map(f=>[f.formId,f.pashto,f.romanisation])),[
 ['lemma:n-fish:form:0','کب','kab'], ['lemma:n-fish:licensed:1','کبان','kabaan'],
]);
const rejected='lemma:n-fish:research:direct:plural:3aa8f716';
assert(!t.content.wordById['library-form:'+rejected]);
assert(cards.some(c=>Object.values(c.generated.slots).some(ref=>ref.formId==='lemma:n-fish:licensed:1')));
assert(cards.every(c=>!c.ps.includes('کبونه') && Object.values(c.generated.slots).every(ref=>ref.formId!==rejected)));
const fishPlural=t.content.wordById['library-form:lemma:n-fish:licensed:1'];
const writePashto={kind:'word',direction:'en-ps'};
assert(t.Q.evaluate(writePashto,fishPlural,'کبان'));
assert(!t.Q.evaluate(writePashto,fishPlural,'کبونه'));

const goId='lemma:v-go', weighId='lemma:expansion:verb:weigh';
const go=t.content.wordById['library-form:'+goId+':form:0'];
const weigh=t.content.wordById['library-form:'+weighId+':citation'];
const readPashto={kind:'word',direction:'ps-en'};
assert.equal(go.ps,weigh.ps);
assert.equal(go.ps,'تلل');
assert.match(go.recallContext,/leaves home/);
assert.match(weigh.recallContext,/scale/);
assert(t.Q.evaluate(writePashto,go,'تلل') && t.Q.evaluate(writePashto,weigh,'تلل'));
assert(t.Q.evaluate(readPashto,go,'Go') && !t.Q.evaluate(readPashto,go,'Weigh'));
assert(t.Q.evaluate(readPashto,weigh,'Weigh') && t.Q.evaluate(readPashto,weigh,'To weigh') && !t.Q.evaluate(readPashto,weigh,'To go'));
t.state.day=7;
for(const [target, other] of [[go,weigh],[weigh,go]]) {
 const choices=t.questions.distractors(target);
 assert(!choices.includes(other.en));
 assert.deepEqual(plain(choices.filter(value=>t.Q.evaluate(readPashto,target,value))),[target.en]);
}
const goBindings=cards.flatMap(c=>Object.values(c.generated.slots)).filter(ref=>ref.lemmaId===goId);
assert(goBindings.length>0);
assert(goBindings.every(ref=>t.content.libraryEntries[goId].forms.find(f=>f.formId===ref.formId).morphology.transitivity==='intransitive'));
assert(t.content.libraryEntries[weighId].forms.every(form=>!form.composition.enabled));
assert(cards.every(c=>Object.values(c.generated.slots).every(ref=>ref.lemmaId!==weighId)));
const today=data.entries.find(e=>e.displayLemmaPs==='نن').forms[0];
const current=cards.find(c=>Object.values(c.generated.slots).some(r=>r.formId===today.formId));
assert(current&&current.roman.includes('nun'));
const oldData=plain(data);delete oldData.eligibleCache;
const old=oldData.entries.find(e=>e.displayLemmaPs==='نن').forms[0];old.romanisation='nan';old.featureEvidence.romanisationSpan='nan';oldData.generationEvidence[old.formId].romanisation='nan';
const prior=t.S.compose(oldData,frames.frames.find(f=>f.id===current.generated.frameId),{slots:current.generated.slots});
assert(prior.roman.includes('nan'));
assert.notDeepEqual(plain(t.S.restoreCard(data,frames,prior)),plain(prior),'obsolete pronunciation repair is removed');assert.deepEqual(plain(t.S.restoreCard(data,frames,current)),plain(current));
const forged=plain(prior);forged.roman=forged.roman.replace('nan','invented');assert.notDeepEqual(plain(t.S.restoreCard(data,frames,forged)),forged);
const plan=t.E.ensurePlan(t.state.progress,data,13);plan.generatedPracticeCards={residential:[current]};
const cold=runtime();cold.backend.setItem('',JSON.stringify(t.state.progress));const loaded=cold.storage.load();
assert.equal(cold.storage.problem,null);assert.equal(loaded.library.plans[13].generatedPracticeCards.residential[0].roman,current.roman);
const incompatible=plain(t.state.progress);
incompatible.library.acquired['lemma:n-fish'].encounteredFormIds.push(rejected);
const raw=JSON.stringify(incompatible), retiredSave=runtime();
retiredSave.backend.setItem('',raw);
retiredSave.storage.load();
assert.match(retiredSave.storage.problem,/incompatible version/);
await retiredSave.storage.save();
assert.equal(retiredSave.backend.getItem(''),raw,'The existing export/reset path preserves original bytes');
assert.throws(()=>t.content.registerGenerated(prior),/compiler proof/,'obsolete pronunciation is rejected instead of repaired');
t.content.registerGenerated(current);assert.equal(t.content.wordById[current.id].roman,current.roman,'explicit new generation uses approved pronunciation');
for(const day of [5,7]) {
 for(let d=1;d<day;d++)t.progression.completeChallengeOnce(t.state.progress,d,t.progression.getChallengeSpec(d).questionCount);t.state.session=null;
 t.state.day=day;t.state.progress.complete[day+"-school"]=true;t.state.progress.library.phrases['phrase-day-7-opening']={day:5,source:'lesson'};
 const qs=t.questions.selectChallenge(day);assert.equal(qs.length,day===7?25:15);assert.equal(qs[0].id,'phrase-day-7-opening');assert.equal(qs[0].kind,'word');assert.equal(qs[0].phrasePromptId,'phrase-day-5-opening');
 assert(!/کبونه|mor ao plar|noun:parent/.test(JSON.stringify(qs)));
}
console.log('PASS approved nun in new composition, exact current snapshot display, arbitrary pronunciation rejection, Day-5/7 response translation selection');
