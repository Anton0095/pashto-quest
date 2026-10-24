import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const data=JSON.parse(readFileSync('content/LIBRARY_LEXICON.json','utf8'));
const E=vm.runInNewContext(readFileSync('src/library-engine.js','utf8')+';LibraryEngine');
const fresh=()=>({library:E.state(),stats:{},xp:123,challenges:{},complete:{}});
const plain=x=>JSON.parse(JSON.stringify(x));
const e=data.entries.find(e=>e.lemmaId==='lemma:v-see'),f=e.forms[0],ref={lemmaId:e.lemmaId,formId:f.formId};
let p=fresh();const ctx={day:1,source:'lesson',location:'river'};
E.encounter(p,data,ref,ctx);assert(p.library.acquired[e.lemmaId]);E.encounter(p,data,ref,ctx);assert.equal(Object.keys(p.library.acquired).length,1);assert.equal(p.library.acquired[e.lemmaId].totalAttempts,0);
const sample={...data,sourceMappings:{test:[ref]}};
E.practise(p,sample,'test',true,{...ctx,eventId:'correct',now:100});E.practise(p,sample,'test',true,{...ctx,eventId:'correct',now:100});assert.equal(p.library.acquired[e.lemmaId].totalAttempts,1);
E.practise(p,sample,'test',false,{...ctx,eventId:'wrong',now:200});assert.equal(p.library.acquired[e.lemmaId].forms[f.formId].stage,0);
E.encounter(p,data,{lemmaId:e.lemmaId,formId:e.forms[1].formId},ctx);p=E.migrate(plain(p),data);assert.equal(p.library.acquired[e.lemmaId].encounteredFormIds.length,2);assert.deepEqual(plain(E.migrate(plain(p),data)),plain(p));assert.equal(p.xp,123);
const broken=fresh();broken.library.schemaVersion=1;broken.stats['n-door']={seen:3,correct:2,stage:2,dueAt:999};E.migrate(broken,data);assert(broken.library.acquired['lemma:n-door']);assert.deepEqual(plain(E.migrate(plain(broken),data)),plain(broken));
for(const pace of [0,4,8,12,16,20,24]){const p=fresh();assert(E.setPace(p,data,pace,1).ok);assert(!p.library.plans[1]);const plan=E.ensurePlan(p,data,1);assert.equal(plan.effectiveDailyTarget,pace);for(const ids of Object.values(plan.locationAssignments))assert.equal(ids.length,pace/4);const before=plain(plan);E.setPace(p,data,4,1);assert.deepEqual(plain(plan),before);for(const id of data.storyRequirements[1].house){const e=data.entries.find(e=>e.lemmaId===id);E.encounter(p,data,{lemmaId:id,formId:e.forms[0].formId},ctx);}const tally=E.tallies(p,data,1);assert.equal(tally.scheduledNewLemmas.length,pace);assert(tally.incidentalStoryLemmas.length>0||pace===24);assert.equal(Object.keys(p.complete).length,0);}
for(const day of [7,14]){const p=fresh();E.setPace(p,data,0,day);assert.equal(E.ensurePlan(p,data,day).effectiveDailyTarget,0);}
console.log('PASS P0 persistence, form attempts/reload/repair, P1 all seven paces, frozen plans, incidental exposure, review-only exams');
const selectionP=fresh();E.setPace(selectionP,data,4,1);E.ensurePlan(selectionP,data,1);E.encounter(selectionP,data,ref,{day:1,source:'lesson',location:'river'});selectionP.library.acquired[e.lemmaId].srsDueAt=1;
const selected=E.lexicalSelection(selectionP,data,2,5);assert.equal(selected[0].lemmaId,e.lemmaId);assert.equal(selected[0].origin,'due-review');assert.equal(new Set(selected.map(x=>x.lemmaId)).size,selected.length);assert(E.dueForms(selectionP,data).some(x=>x.form.formId===f.formId));
assert.equal(E.scene('hills-story-only').districtId,'nature');assert.equal(E.scene('bakery').districtId,'business');assert.equal(E.scene('neighbourHome').districtId,'residential');assert.equal(E.places.length,4);
const {activationProblems,inventory}=await import('../tools/district-inventory.mjs');
const backlog=JSON.parse(readFileSync('content/DISTRICT_VOCABULARY_CANDIDATES.json'));
assert.equal(backlog.candidates.length,360);assert(backlog.candidates.every(c=>activationProblems(c).length&&c.countsTowardDailyQuota===false));assert(backlog.candidates.every(c=>!data.entries.some(e=>e.lemmaId===c.candidateId)));
const report=inventory(data,backlog,readFileSync('src/library-engine.js','utf8'));assert.equal(report.activatedContentLemmas,108);assert.equal(report.aliasCandidates,7);assert.equal(report.eligibleForPromotion,0);assert.equal(report.duplicateLemmaIds.length,0);assert.equal(report.schedules.length,14);assert(report.schedules.find(x=>x.pace===24&&!x.reviewExams).days.some(d=>!d.feasible));assert(report.schedules.filter(x=>x.reviewExams).every(x=>x.days.filter(d=>[7,14].includes(d.day)).every(d=>d.requested===0&&d.feasible)));
console.log('PASS P2 due-form selector and traceable origins; P3 scenes, aliases, activation gates and 14 chronological capacity profiles');

const complete={pashtoDraft:e.displayLemmaPs,romanisationDraft:e.romanisation,partOfSpeech:e.partOfSpeech,suitableDistricts:e.suitableDistricts,forms:[e.forms[0]],examples:[{...e.examples[0],speaker:'test fixture',recipient:'test fixture',constraints:{fixed:true}}],sourceMappings:{fixture:[ref]},reviewStatus:'approved',nativeReview:{reviewer:'test fixture only',reference:'test fixture only'}};assert.equal(activationProblems(complete).length,0);assert(activationProblems({...complete,nativeReview:null}).length);

const wrongLegacy={stats:{'n-door':{seen:2,correct:0,wrong:2,stage:0,dueAt:456}}};E.migrate(wrongLegacy,data);assert.equal(E.status(wrongLegacy.library.acquired['lemma:n-door']),'practised');assert.equal(wrongLegacy.library.acquired['lemma:n-door'].totalAttempts,2);assert.equal(wrongLegacy.library.acquired['lemma:n-door'].forms[data.sourceMappings['n-door'][0].formId].srsDueAt,456);

assert(E.matchesPlace(e,'hills'));assert(E.matchesPlace(e,'hills-story-only'));assert(E.matchesPlace(e,'nature'));
