import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runtime,reset,study,plain,beginAttempt,correctAnswer} from './runtime-fixture.mjs';
let attempts=0,visits=0;
for(const pace of [0,4,8,12,16,20,24])for(const skip of [false,true]) {
 const t=runtime();reset(t,pace);
 for(let day=1;day<=14;day++) {
  t.state.day=day;
  if(!skip)for(const place of t.content.zoneKeys){study(t,day,place);visits++;}
  t.state.session=null;
  const acquisition=plain(t.state.progress.library.acquired),grammar=plain(t.state.progress.library.grammar);
  beginAttempt(t,day);const s=t.state.session;attempts++;
  assert.equal(s.questions.length,[7,14].includes(day)?25:15);
  assert.equal(t.progression.getChallengeSpec(day).passCount,[7,14].includes(day)?20:12);
  assert(s.questions.every(q=>['word','sentence','construct','dialogue'].includes(q.kind)&&!q.grammarConcept));
  assert.deepEqual(plain(t.state.progress.library.acquired),acquisition);assert.deepEqual(plain(t.state.progress.library.grammar),grammar);
  for(const q of s.questions) {
   const w=t.content.wordById[q.id];assert(w);
   if(q.kind==="word")assert(!/\b(?:first|second|third)[ -]person\b|\b(?:masculine|feminine|singular|plural)\b/i.test(w.en),"no category labels as recall answers");
   if(q.generated)for(const c of [q.generated,q.promptGenerated].filter(Boolean)) {
    assert(c.generated.requiredGrammarIds.every(g=>t.state.progress.library.grammar[g]));
    assert(Object.values(c.generated.slots).every(r=>t.state.progress.library.acquired[r.lemmaId]?.introducedFormIds.includes(r.formId)));
   }
   if(q.kind==='word'&&q.unstudied){assert.equal(q.direction,'ps-en');assert(!q.choiceOrder.some(v=>t.Q.evaluate(q,w,v)));}
  }
  if(skip)assert(s.questions.every(q=>!q.generated));
  if(t.learning.availableSentences(day).length)assert(s.questions.some(q=>q.generated),"use generated language when eligible material exists");
  if(["construct","dialogue"].includes(s.questions[0].kind))s.tileSequence=[...s.questions[0].tileSequence];
  const frozen=plain(s.questions);t.storage.save();const saved=t.storage.load();assert.equal(t.storage.problem,null,JSON.stringify({pace,skip,day,kinds:s.questions.map(q=>q.kind)}));assert.deepEqual(plain(saved.activeChallenge.questions),frozen);
  t.state.session=null;delete t.state.progress.activeChallenge;
  t.progression.completeChallengeOnce(t.state.progress,day,[7,14].includes(day)?25:15);
 }
}
console.log(`PASS practical assessments: ${attempts} attempts, ${visits} model visits, all 14 days × 7 paces × normal/skip, exact thresholds, no rule quizzes, eligibility, masking and frozen restoration`);

// Exact old current-schema rule snapshots remain readable for explicit retirement.
const legacy=runtime();reset(legacy,0);for(let day=1;day<14;day++)legacy.progression.completeChallengeOnce(legacy.state.progress,day,[7,14].includes(day)?25:15);
legacy.state.day=14;beginAttempt(legacy,14);
const fixtures=JSON.parse(readFileSync('tests/retired-rule-fixtures.json','utf8')).concepts;
for(const c of fixtures){
 const options=[c.correct,...c.misconceptions];
 legacy.state.session.questions[0]={id:'grammar:14:0',kind:'choice',direction:'en-ps',grammarConcept:c.id,prompt:c.case,correct:c.correct,options,choiceOrder:options,grammarDays:[]};
 legacy.storage.save();const restored=legacy.storage.load();assert.equal(legacy.storage.problem,null,c.id);assert.equal(restored.activeChallenge.questions[0].prompt,c.case);
 const before=plain(legacy.state.progress);assert.equal(legacy.learning.submitChallenge(c.correct),null);assert.deepEqual(plain(legacy.state.progress),before);
}
console.log('PASS 33 exact retired rule snapshots remain readable and ungradable, without resets or rerolls');
