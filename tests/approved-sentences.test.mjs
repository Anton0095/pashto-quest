import assert from 'node:assert/strict';
import {runtime,plain} from './runtime-fixture.mjs';
const t=runtime(),data=t.content.LIBRARY_DATA,frames=data.sentenceFrames;
for(let day=1;day<=13;day++)t.E.unlock(t.state.progress,day,'visible-fixture');
for(const e of data.entries)for(const f of e.forms)t.E.encounter(t.state.progress,data,{lemmaId:e.lemmaId,formId:f.formId},{day:13,source:'lesson',introduce:true});
const cards=t.S.available(t.state.progress,data,frames,13);
const today=data.entries.find(e=>e.displayLemmaPs==='نن').forms[0];
const current=cards.find(c=>Object.values(c.generated.slots).some(r=>r.formId===today.formId));
assert(current&&current.roman.includes('nun'));
const oldData=plain(data);delete oldData.eligibleCache;
const old=oldData.entries.find(e=>e.displayLemmaPs==='نن').forms[0];old.romanisation='nan';old.featureEvidence.romanisationSpan='nan';oldData.generationEvidence[old.formId].romanisation='nan';
const prior=t.S.compose(oldData,frames.frames.find(f=>f.id===current.generated.frameId),{slots:current.generated.slots});
assert(prior.roman.includes('nan'));
assert.deepEqual(plain(t.S.restoreCard(data,frames,prior)),plain(prior),'exact prior attested display, same current-schema proof');
const forged=plain(prior);forged.roman=forged.roman.replace('nan','invented');assert.notDeepEqual(plain(t.S.restoreCard(data,frames,forged)),forged);
const plan=t.E.ensurePlan(t.state.progress,data,13);plan.generatedPracticeCards={residential:[prior]};
const cold=runtime();cold.backend.setItem('',JSON.stringify(t.state.progress));const loaded=cold.storage.load();
assert.equal(cold.storage.problem,null);assert.equal(loaded.library.plans[13].generatedPracticeCards.residential[0].roman,prior.roman);
t.content.registerGenerated(prior);assert.equal(t.content.wordById[prior.id].roman,prior.roman);
t.content.registerGenerated(current);assert.equal(t.content.wordById[current.id].roman,current.roman,'explicit new generation uses approved pronunciation');
for(const day of [5,7]) {
 t.state.day=day;t.state.progress.library.phrases['phrase-day-7-opening']={day:5,source:'lesson'};
 const qs=t.questions.selectChallenge(day);assert.equal(qs.length,day===7?25:15);assert.equal(qs[0].id,'phrase-day-7-opening');assert.equal(qs[0].kind,'construct');assert.equal(qs[0].phrasePromptId,'phrase-day-5-opening');
}
console.log('PASS approved nun in new composition, exact attested prior snapshot display, arbitrary pronunciation rejection, Day-5/7 response construction');
