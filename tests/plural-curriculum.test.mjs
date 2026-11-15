import assert from 'node:assert/strict';
import {runtime,reset,study} from './runtime-fixture.mjs';
const t=runtime();reset(t,24);const d=t.content.LIBRARY_DATA;
assert(t.content.curriculum.days[4].grammar.some(s=>s.includes('noun plural')));
let pluralFirst=false,pluralCards=0;
for(let day=1;day<=14;day++){
 t.state.day=day;
 const before=new Set(Object.values(t.state.progress.library.acquired).flatMap(r=>Object.keys(r.formUnlocks||{}).filter(id=>r.formUnlocks[id].studiedDay)));
 for(const place of ['school','nature','residential','business']){
  const session=study(t,day,place);
  for(const id of session.required){const r=d.sourceMappings[id]?.[0];if(!r)continue;const entry=t.content.libraryEntries[r.lemmaId],form=entry.forms.find(f=>f.formId===r.formId);
   if(entry.partOfSpeech==='noun'&&form.prerequisiteGrammarIds.includes('grammar-day-5')&&form.morphology.number==='plural'){assert(day>=5);pluralCards++;}
  }
  for(const r of Object.values(session.generatedPractice||{}).flatMap(c=>Object.values(c.generated.slots)))assert(t.E.formallyTaught(t.state.progress,r.formId));
 }
 const newForms=d.entries.flatMap(entry=>entry.forms.filter(form=>t.state.progress.library.acquired[entry.lemmaId]?.formUnlocks?.[form.formId]?.studiedDay===day).map(form=>({entry,form})));
 if(day===5)assert(newForms.some(({entry,form})=>entry.partOfSpeech==='noun'&&form.morphology.number==='plural'&&form.prerequisiteGrammarIds.includes('grammar-day-5')),'noun plural flashcards begin on Day5');
 if(day>=2&&day<=7){const person={2:3,3:1,4:2,5:2,6:1,7:3}[day],number=day>=5?'plural':'singular';assert(newForms.some(({entry,form})=>entry.partOfSpeech==='verb'&&form.morphology.person===person&&form.morphology.number===number),'current-person verb forms receive flashcards on Day'+day);}
 const plan=t.state.progress.library.plans[day];
 for(const forms of Object.values(plan.firstFormSelections||{}))for(const id of forms){const entry=d.entries.find(e=>e.forms.some(f=>f.formId===id));const f=entry.forms.find(f=>f.formId===id);if(entry.partOfSpeech==='noun'&&f!==entry.forms[0]&&f.morphology.number==='plural')pluralFirst=true;}
 if(day===14){const after=Object.values(t.state.progress.library.acquired).flatMap(r=>Object.keys(r.formUnlocks||{}).filter(id=>r.formUnlocks[id].studiedDay));assert(after.every(id=>before.has(id)),'Day14 introduces no forms');}
 t.progression.completeChallengeOnce(t.state.progress,day,t.progression.getChallengeSpec(day).questionCount);
}
assert(pluralCards>0);assert(pluralFirst,'a supported noun can be introduced plural-first');
console.log('PASS Day5 plural concept, gradual plural cards, evidenced plural-first noun introductions, taught-only generated practice and zero new forms Day14');
