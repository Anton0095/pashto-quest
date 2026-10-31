import assert from 'node:assert/strict';
import {runtime,reset,plain,beginAttempt} from './runtime-fixture.mjs';
const t=runtime(),d=t.content.LIBRARY_DATA;
const card=id=>t.content.wordById['library-card:lemma:'+id];
const backup=new Set(d.entries.filter(e=>e.introduction.day===1&&e.forms[0].firstAllowedDay===1).map(e=>e.englishSenses[0]));
reset(t);const before=plain(t.state.progress),target=card('a-big');
const early=t.questions.distractors(target);assert.equal(early.length,4);assert(early.every(v=>v===target.en||backup.has(v)));assert.deepEqual(plain(t.state.progress),before);
// Three words studied in this lesson, without correct answers or completion,
// must fill the alternatives ahead of any fallback, despite different POS.
for(const id of ['n-house','n-door','n-room'])t.learning.libraryExpose(card(id).id,'lesson');
const studied=t.questions.distractors(target);assert.deepEqual(new Set(studied.map(v=>v.toLowerCase())),new Set(['big','house','door','room']));
assert.equal(Object.keys(t.state.progress.complete).length,0);assert.equal(t.state.progress.xp,0);
const untouched=plain(t.state.progress);for(let i=0;i<30;i++)t.questions.distractors(target);assert.deepEqual(plain(t.state.progress),untouched);
// Explicit alternatives, listed senses and equivalent Pashto surfaces cannot
// become wrong choices, even when they are frozen from an earlier release.
for(const w of [card('v-open'),card('n-bread'),{id:'fixture',type:'noun',ps:'تاسې',en:'You',acceptedEnglishAnswers:['you all']}]) {
 const values=t.questions.distractors(w);assert.equal(values.length,4);assert.equal(values.filter(v=>t.Q.evaluate({kind:'word',direction:'ps-en'},w,v)).length,1);
}
assert(t.Q.evaluate({kind:'word',direction:'ps-en'},card('n-bread'),'food'));
for(const e of d.entries) {
 const base=t.content.wordById['library-card:'+e.lemmaId],form=t.content.wordById['library-form:'+e.forms[0].formId];
 for(const value of t.Q.englishAnswers(base))assert(t.Q.evaluate({kind:'word',direction:'ps-en'},form,value),e.lemmaId);
}
const bookPlural=d.entries.find(e=>e.lemmaId==='lemma:n-book').forms.find(f=>f.morphology.number==='plural');
assert(bookPlural);assert(!t.Q.evaluate({kind:'word',direction:'ps-en'},t.content.wordById['library-form:'+bookPlural.formId],'Book'));
assert(!t.Q.evaluate({kind:'word',direction:'ps-en'},card('n-book'),'Books'));
assert(t.Q.evaluate({kind:'word',direction:'ps-en'},card('v-buy'),'To take'));
assert(!t.Q.evaluate({kind:'word',direction:'ps-en'},{en:'He/she reads'},'He'));
assert(!t.Q.evaluate({kind:'word',direction:'ps-en'},{en:'To live / reside — first person'},'reside — first person'));
const address={kind:'address',scope:'familiar',correct:'ته',addressOptions:[['familiar','ته'],['respectful','تاسې']]};
assert(!t.Q.evaluate(address,null,'تاسې'));assert(!t.Q.evaluate({...address,registerSpecified:true},null,'تاسې'));
assert(!t.Q.evaluate({...address,scope:'group',correct:'تاسې'},null,'تاسې'));assert(!t.Q.evaluate({...address,scope:'group',correct:'تاسې'},null,'ته'));
assert(t.Q.evaluate({kind:'word',direction:'en-ps'},{ps:'تاسې'},'تاسو'));
assert(!t.Q.evaluate({kind:'word',direction:'en-ps'},{ps:'تاسې'},'ته'));
assert(t.Q.evaluate({kind:'dialogue',answerPs:'تاسې کتاب لولئ.'},null,'تاسو کتاب لولئ.'));
assert(!t.Q.evaluate({kind:'dialogue',answerPs:'تاسې کتاب لولئ.'},null,'ته کتاب لولې.'));
// Synthetic equivalent-surface and accepted-sense peers are exclusion-only.
for(const c of [{id:'fixture:ps',ps:'تاسو',en:'A synthetic unrelated gloss',type:'pronoun'}, {id:'fixture:en',ps:'بل',en:'food',type:'noun'}]) {
 t.content.wordById[c.id]=c;d.sourceMappings[c.id]=d.sourceMappings[card('n-house').id];d.cardDays[c.id]=1;d.cardTypes[c.id]=c.type;
}
assert(!t.questions.distractors({id:'fixture:target',ps:'تاسې',en:'You',type:'pronoun'}).includes('A synthetic unrelated gloss'));
assert(!t.questions.distractors(card('n-bread')).includes('food'));
for(const id of ['fixture:ps','fixture:en']){delete t.content.wordById[id];delete d.sourceMappings[id];delete d.cardDays[id];delete d.cardTypes[id];}
// Every lexical/form/phrase target has real, distinct and uniquely correct choices.
t.state.day=14;const acquisition=plain(t.state.progress);
for(const w of Object.values(t.content.wordById).filter(w=>!['sentence','profile'].includes(w.type))) {
 const values=t.questions.distractors(w);assert.equal(values.length,4,w.id);assert.equal(new Set(values.map(v=>v.toLowerCase())).size,4,w.id);
 assert(!values.some(v=>['A different meaning','Another response','None of these'].includes(v)),w.id);
 assert.equal(values.filter(v=>t.Q.evaluate({kind:'word',direction:'ps-en'},w,v)).length,1,w.id);
}
assert.deepEqual(plain(t.state.progress),acquisition);
// Grammar explanations now belong to the read-only Journal, never new exams.
assert.equal(d.grammarReference.concepts.length,33);assert(!d.grammarAssessment);
for(const c of d.grammarReference.concepts){assert(c.explanation&&c.workedExample.scenario&&c.workedExample.analysis);assert(!c.options&&!c.correct);}
// Freeze an old ambiguous item and prove no choice regeneration, reset or
// retrospective grading is needed. Retired questions are no longer gradable.
reset(t,0);beginAttempt(t,1);const s=t.state.session,idx=0;
const q=s.questions[idx]={id:'grammar:1:0',kind:'choice',direction:'en-ps',grammarConcept:'feminine-description',correct:'Feminine singular adjective + feminine singular equative',options:['Feminine singular adjective + feminine singular equative','Masculine singular adjective + feminine singular equative','Feminine singular adjective + plural equative','Masculine singular adjective + masculine singular equative'],grammarDays:[]};q.choiceOrder=[...q.options];q.prompt='Choose the matching grammatical roles. The described noun is feminine singular. Which pair agrees?';delete q.explanation;
s.index=idx;s.answered=idx;const frozen=plain(s.questions),alternative=q.choiceOrder.find(v=>v==='Masculine singular adjective + feminine singular equative');assert(alternative);
assert(!t.Q.evaluate(q,null,alternative));assert.equal(q.choiceOrder.filter(v=>t.Q.evaluate(q,null,v)).length,0);
t.storage.save();t.state.progress=t.storage.load();assert.equal(t.storage.problem,null);assert.deepEqual(plain(t.state.progress.activeChallenge.questions),frozen);
const ungraded=plain(t.state.progress),score=s.correctCount;
assert.equal(t.learning.submitChallenge(alternative),null,'retired rule items cannot be scored');
assert.equal(s.correctCount,score);assert.deepEqual(plain(t.state.progress),ungraded);
assert(t.Q.explanation(q,null).includes('retired'));
console.log('PASS same-lesson/mixed-POS priority, real Day1 fallback, unchanged acquisition, accepted-sense/variant exclusions, 33 Journal reference concepts, frozen retired snapshots and blocked grading');
