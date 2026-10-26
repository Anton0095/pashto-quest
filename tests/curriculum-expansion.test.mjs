import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const read = (p) => readFileSync(p, 'utf8');
const data = JSON.parse(read('content/LIBRARY_LEXICON.json'));
const backlog = JSON.parse(read('content/DISTRICT_VOCABULARY_CANDIDATES.json'));
const narrative = JSON.parse(read('content/NARRATIVE_EXPRESSIONS.json'));
const E = vm.runInNewContext(read('src/library-engine.js') + ';LibraryEngine');
const places = ['residential', 'nature', 'business', 'school'];
const fresh = () => ({library:E.state()});
const byId = Object.fromEntries(data.entries.map((e) => [e.lemmaId, e]));
const counts = (entries) => Object.fromEntries(places.map((d) => [d, entries.filter((e) => e.primaryDistrict === d).length]));
assert.deepEqual(counts(data.entries.filter((e) => e.countsTowardDailyQuota)), {residential:22,nature:27,business:29,school:21});
assert.deepEqual(counts(backlog.candidates.filter((e) => e.selectedForExpansion)), {residential:78,nature:73,business:71,school:79});
assert.equal(backlog.candidates.filter((c) => c.selectedForExpansion).length, 301);
const selected = (en,pos) => backlog.candidates.find((e) => e.englishLemma===en && e.partOfSpeech===pos).selectedForExpansion;
assert(selected('snow','noun'));assert(!selected('snow','verb'));
assert(selected('answer','verb'));assert(!selected('answer','noun'));
assert(selected('lock','noun') && selected('lock','verb'));
const universal = data.entries.filter((e) => e.vocabularyClass==='universal');
assert.equal(universal.length,29);
assert(universal.every((e) => !e.countsTowardDailyQuota && places.every((d) => E.matchesPlace(e,d))));
assert(backlog.candidates.every((e) => !e.countsTowardDailyQuota && !byId[e.candidateId]));
for (const pace of E.presets) {
  const p=fresh();assert(E.setPace(p,data,pace,1).ok);
  const plan=E.ensurePlan(p,data,1), ids=Object.values(plan.locationAssignments).flat();
  assert.equal(new Set(ids).size,pace);
  for(const district of places) {
    assert.equal(plan.locationAssignments[district].length,pace/4);
    assert(plan.locationAssignments[district].every((id) => ['noun','adjective'].includes(byId[id].partOfSpeech)));
  }
  assert.equal(E.ensurePlan(p,data,14).requestedDailyTarget,0);
}
const game=JSON.parse(read('index.html').match(/const GAME_DATA=(\{.*?\});/s)[1]);
const day1 = game.words.filter((w) => w.loop===1);
for (const card of day1) assert(E.cardAllowed(data,card.id,1),card.id);
assert(day1.filter((c) => c.type==='sentence').every((c) => /\bis\b/.test(c.en)));
const verb=byId['lemma:v-read'], ref={lemmaId:verb.lemmaId,formId:verb.forms[0].formId};
const p=fresh();
assert.equal(E.encounter(p,data,ref,{day:1,source:'lesson'}),null);
assert.equal(Object.keys(p.library.acquired).length,0);
E.encounter(p,data,ref,{day:2,source:'lesson',location:'school'});
assert(p.library.acquired[verb.lemmaId]);
// Reclassified entries and forms preserve their records and never consume quota again.
const u=byId['lemma:w6-together'], uref={lemmaId:u.lemmaId,formId:u.forms[0].formId};
E.encounter(p,data,uref,{day:6,source:'lesson',location:'nature'});
const record=JSON.stringify(p.library.acquired[u.lemmaId]);
E.encounter(p,data,uref,{day:7,source:'lesson',location:'business'});
assert.equal(JSON.stringify(p.library.acquired[u.lemmaId]),record);
assert.equal(E.summary(p,data).encountered,1);
// A generated plan stays frozen on reload; current code never rewrites authored assignments.
const planned=fresh();
const frozen=JSON.stringify(E.ensurePlan(planned,data,1));
assert.equal(JSON.stringify(E.ensurePlan(JSON.parse(JSON.stringify(planned)),data,1)),frozen);
// A synthetic identity-only test measures planner capacity, never promotes untranslated words.
const synthetic={...data,entries:places.flatMap((d) => Array.from({length:100},(_,i) => ({lemmaId:`fixture:${d}:${i}`,primaryDistrict:d,suitableDistricts:[d],partOfSpeech:i%2?'adjective':'noun',countsTowardDailyQuota:true,introduction:{day:1,district:d,teachingOrder:i},forms:[{formId:`fixture:${d}:${i}:form`,firstAllowedDay:1}]})))};
const ideal=fresh();ideal.library.requestedDailyTarget=24;
// Exactly 22 incidental encounters per primary district exhaust the 88-word margin.
for(const d of places) for(let i=0;i<22;i++) E.encounter(ideal,synthetic,{lemmaId:`fixture:${d}:${i}`,formId:`fixture:${d}:${i}:form`,firstAllowedDay:1},{day:1,source:'fixture',introduce:true});
const assigned=new Set();
for(let day=1;day<=13;day++) {
 const plan=E.ensurePlan(ideal,synthetic,day);assert.equal(plan.contentGap,false);
 for(const d of places)assert.equal(plan.locationAssignments[d].length,6);
 for(const id of Object.values(plan.locationAssignments).flat()){assert(!assigned.has(id));assigned.add(id)}
}
assert.equal(assigned.size,312);assert.equal(E.ensurePlan(ideal,synthetic,14).requestedDailyTarget,0);
// One additional incidental identity per district needs four reviewed replacements (101 each, balanced).
const insufficient=fresh();insufficient.library.requestedDailyTarget=24;
for(const d of places)for(let i=0;i<23;i++)E.encounter(insufficient,synthetic,{lemmaId:`fixture:${d}:${i}`,formId:`fixture:${d}:${i}:form`,firstAllowedDay:1},{day:1,source:'fixture',introduce:true});
let assignedCount=0;for(let day=1;day<=13;day++)assignedCount+=Object.values(E.ensurePlan(insufficient,synthetic,day).locationAssignments).flat().length;
assert.equal(312-assignedCount,4);
// Pending phrase slots are explicit editorial targets, never acquired by a plan.
assert.equal(narrative.expressions.length,17);assert.equal(narrative.expressions.filter((e)=>e.active).length,2);
assert.equal(narrative.expressions.filter((e)=>e.day===1).length,4);
const speakers=['Ms Hameed','Saleha','Muhammad Jan','Ms Hameed','Mina','Edris','Saleha','Edris','Mina','Muhammad Jan','Ms Hameed','Saleha','Muhammad Jan'];
for(let day=2;day<=14;day++)assert.equal(narrative.expressions.find((e)=>e.day===day).speaker,speakers[day-2]);
const morning=narrative.expressions.find((e)=>e.day===2);assert.equal(morning.pashto,'سهار مو پخیر!');
const activeData={...data,phrases:[...data.phrases,...narrative.expressions.filter((e)=>e.active)],cardTypes:{[morning.id]:'greeting'}};
const phraseProgress=fresh();E.ensurePlan(phraseProgress,activeData,2);assert.deepEqual(Object.keys(phraseProgress.library.phrases),[]);
E.expose(phraseProgress,activeData,morning.id,{day:2,source:'day-opening',location:'school'});
assert.equal(E.cardStat(phraseProgress,activeData,morning.id).stage,0);
assert.equal(E.cardStat(phraseProgress,activeData,morning.id).srsDueAt,0);
const encounter=JSON.stringify(phraseProgress.library.phrases[morning.id]);
E.expose(phraseProgress,activeData,morning.id,{day:2,source:'lesson',location:'school'});
assert.equal(JSON.stringify(phraseProgress.library.phrases[morning.id]),encounter);
E.practise(phraseProgress,activeData,morning.id,true,{day:2,source:'review',eventId:'phrase-answer',now:100});
const reloaded=JSON.parse(JSON.stringify(phraseProgress));
assert.equal(E.cardStat(reloaded,activeData,morning.id).stage,1);
assert.equal(Object.keys(reloaded.library.acquired).length,0);
assert(narrative.expressions.filter((e)=>!e.active).every((e)=>!activeData.phrases.some((a)=>a.id===e.id)));
console.log('PASS curriculum expansion: exact candidate selection, 29 universal identities, all seven Day 1 paces, action guards, frozen current plans, 312 synthetic introductions, incidental boundary, 17 honest phrase slots, persistent expression SRS');

const universalTargets=JSON.parse(read('content/UNIVERSAL_TEACHING_TARGETS.json'));
assert.equal(universalTargets.targets.length,40);
assert(universalTargets.targets.every(t=>!t.active && t.lemmaId===null));
const inventoryReport=JSON.parse(read('content/DISTRICT_INVENTORY_REPORT.json'));
assert.equal(inventoryReport.targetProjection.scheduled,312);
assert.equal(inventoryReport.targetProjection.missingScheduled,0);
assert(inventoryReport.targetProjection.days.slice(0,13).every(d=>places.every(p=>d.perDistrict[p]===6)));
console.log('PASS inactive universal semantic targets and explicitly hypothetical selected-inventory projection');
