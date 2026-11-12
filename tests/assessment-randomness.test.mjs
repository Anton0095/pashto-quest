import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {runtime,reset,plain,beginAttempt} from './runtime-fixture.mjs';
let entropyCalls=0;
const master=runtime().Q.randomFor(982451653);
const t=runtime({seedSource:()=>{entropyCalls++;return Math.floor(master()*0x100000000)}});reset(t);
const frequencies=new Map(),wordSets=new Set(),sentenceSets=new Set();
let planBefore;
for(let draw=0;draw<256;draw++) {
 const qs=t.questions.selectChallenge(1,{newAttempt:true}),plan=t.state.progress.library.plans[1];
 planBefore ||= plain(plan.locationAssignments);
 assert.deepEqual(plain(plan.locationAssignments),planBefore,'sampling never reshuffles the curriculum plan');
 assert.equal(qs.length,15);assert.equal(qs[0].id,t.content.NARRATIVE_DATA.expressions.find(p=>p.day===1&&p.active).id,'daily phrase remains prescribed');
 const words=qs.filter(q=>q.kind==='word'&&q.vocabularyOrigin==='curriculum');
 for(const loc of t.content.zoneKeys) {
  const candidates=plan.locationAssignments[loc];
  const selected=words.filter(q=>(t.content.LIBRARY_DATA.sourceMappings[q.id] || []).some(r=>candidates.includes(r.lemmaId)));
  assert(selected.length>=1,'each assigned location contributes at least one recall target');
  const id=t.content.LIBRARY_DATA.sourceMappings[selected[0].id][0].lemmaId;
  frequencies.set(id,(frequencies.get(id)||0)+1);
 }
 const sentenceLocations=new Set();
 const targets=qs.filter(q=>q.generated);
 assert.equal(new Set(targets.map(q=>q.generated.ps)).size,targets.length);
 for(const q of targets)for(const card of [q.generated,q.promptGenerated].filter(Boolean)) {
  assert(card.generated.requiredGrammarIds.every(g=>t.state.progress.library.grammar[g]));
  for(const r of Object.values(card.generated.slots)) {
   assert(t.state.progress.library.acquired[r.lemmaId].introducedFormIds.includes(r.formId));
   for(const loc of t.content.zoneKeys)if(plan.locationAssignments[loc].includes(r.lemmaId))sentenceLocations.add(loc);
  }
 }
 assert.equal(sentenceLocations.size,4,'random draws retain compatible four-location sentence coverage');
 wordSets.add(words.map(q=>q.id).sort().join('|'));sentenceSets.add(targets.map(q=>q.generated.ps).sort().join('|'));
}
assert.equal(entropyCalls,256);assert(wordSets.size>100);assert(sentenceSets.size>200);
assert.equal(frequencies.size,24,'all six assigned words in every location can be selected');
for(const count of frequencies.values())assert(count>=15&&count<=80,'broad deterministic frequency guard detects selection bias');
// Same injected seed reproduces the draw, without making production reuse it.
const a=runtime({seedSource:()=>123456789}),b=runtime({seedSource:()=>123456789});reset(a);reset(b);
assert.deepEqual(plain(a.questions.selectChallenge(1)),plain(b.questions.selectChallenge(1)));
// Reading an active snapshot consumes no new entropy, even after study/reload.
beginAttempt(t,1);const frozen=plain(t.state.session.questions),calls=entropyCalls;
assert.deepEqual(plain(t.questions.selectChallenge(1)),frozen);assert.equal(entropyCalls,calls);
t.storage.save();const raw=t.backend.getItem();
const cold=runtime({seedSource:()=>{throw Error('Resume must not draw another seed')}});cold.backend.setItem('',raw);cold.state.progress=cold.storage.load();assert.equal(cold.storage.problem,null);
assert.deepEqual(plain(cold.questions.selectChallenge(1)),frozen);
// Default entropy prefers Web Crypto and falls back cleanly when unavailable.
const source=readFileSync('src/question-engine.js','utf8');let nativeCalls=0;
const native=vm.runInNewContext(source+';QuestionEngine',{crypto:{getRandomValues(a){a[0]=++nativeCalls;return a}}});
assert.equal(native.randomSeed(),1);assert.equal(native.randomSeed(),2);
const math=Object.create(Math);math.random=()=>0.5;
for(const crypto of [undefined,{getRandomValues(){throw Error('Unavailable')}}]) {
 const q=vm.runInNewContext(source+';QuestionEngine',{Math:math,crypto});assert.equal(q.randomSeed(),0x80000000);
}
console.log(`PASS random assessment sampling: 256 draws, ${wordSets.size} word sets, ${sentenceSets.size} sentence sets, all 24 assigned words sampled (${Math.min(...frequencies.values())}–${Math.max(...frequencies.values())} times each), four-location/grammar constraints, explicit-seed reproducibility, Web Crypto/fallback and zero-entropy frozen restore`);
