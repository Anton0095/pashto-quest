import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=(p)=>readFileSync(p,'utf8');
const data=JSON.parse(read('content/LIBRARY_LEXICON.json'));
const frames=JSON.parse(read('content/SENTENCE_FRAMES.json'));
const fixtures=JSON.parse(read('docs/grammar/GENERATION_TEST_CASES.json'));
const {E,S}=vm.runInNewContext(read('src/library-engine.js')+'\n'+read('src/sentence-engine.js')+';({E:LibraryEngine,S:SentenceEngine})');
const plain=(v)=>JSON.parse(JSON.stringify(v));
const cloneData=()=>structuredClone({...data,generatedCatalog:undefined});
const entry=(d,id)=>d.entries.find(e=>e.lemmaId===id);
const value=(d,ref)=>entry(d,ref.lemmaId).forms.find(f=>f.formId===ref.formId);
const formRef=(id,predicate)=>{const e=entry(data,id),f=e.forms.find(predicate);assert(f, id);return {lemmaId:id,formId:f.formId}};
function player(day,source='lesson') {
 const p={library:E.state()};
 for(let n=1;n<=day;n++)E.unlock(p,n,'test');
 for(const e of data.entries) for(const f of e.forms)
  if(e.introduction.day<=day&&f.firstAllowedDay<=day)
   E.encounter(p,data,{lemmaId:e.lemmaId,formId:f.formId},{day,source,introduce:source==='lesson'});
 return p;
}
const catalog=S.catalog(data,frames),byFrame=new Map(frames.frames.map(f=>[f.id,f]));
const p=player(14);data.generatedCatalog=catalog;
assert(catalog.length>1000);
assert(frames.frames.every(f=>catalog.some(c=>c.generated.frameId===f.id)), 'Every enabled template has real forms');
for(const fixture of fixtures.positiveAuthoredRegression) {
 const source=data.generationAttestations.find(a=>a.sourceId===fixture.sourceId);
 assert.equal(source.pashto,fixture.pashto,fixture.id);
 assert.equal(source.english,fixture.english,fixture.id);
 const card=catalog.find(c=>c.ps===fixture.pashto&&c.en===fixture.english);
 assert(card,fixture.id+' must be composed, not just parsed as a fixture');
 assert(card.loop>=fixture.dayMin);
 assert.equal(card.generated.family === "demonstrative_descriptor" ? "equative_descriptor" : card.generated.family,fixture.family);
 assert.equal(card.generated.userVerified,false);
 assert(card.generated.sourceId);
 const out=S.compose(data,byFrame.get(card.generated.frameId),{slots:card.generated.slots});
 assert.equal(out.ps,fixture.pashto);assert.equal(out.en,fixture.english);
 console.log('PASS fixture '+fixture.id+' (effective day '+card.loop+')');
}
const card=(ps)=>{const c=catalog.find(c=>c.ps===ps);assert(c,ps);return c};
const binding=(ps)=>({slots:plain(card(ps).generated.slots)});
const frameFor=(ps)=>plain(byFrame.get(card(ps).generated.frameId));
const read1='زه کتاب لولم.', read3='هغه کتاب لولي.', readpl='هغوی کتابونه لولي.';
const reject=(d,f,b,id)=>assert.equal(S.compose(d,f,b),null,id);
// Each JSON negative case mutates actual compiler inputs, not a second fixture validator.
assert(catalog.some(c=>c.en === "What does Mina read?"), "Proper names retain their English capitalisation");
assert(catalog.some(c=>c.en === "What do Mina and I read?"), "Coordinated subjects retain the speaker and English I");
const negatives={
 'NEG-D1-ACTION':()=>assert(!S.eligible(player(1),data,frames,1).some(c=>c.generated.family.startsWith('present'))),
 'NEG-NOUN-COPULA-GENDER':()=>{const f=frameFor('دا کوټه تیاره ده.');f.terminals=f.terminals.filter(t=>t.gender!=='feminine');reject(data,f,binding('دا کوټه تیاره ده.'),'gender')},
 'NEG-COPULA-NUMBER':()=>{const f=frameFor('دا مڼې دي.');f.terminals=f.terminals.filter(t=>t.number!=='plural');reject(data,f,binding('دا مڼې دي.'),'number')},
 'NEG-PRESENT-1SG-2SG':()=>{const b=binding(read1);b.slots.verb=plain(card('ته کتاب لولې.').generated.slots.verb);reject(data,frameFor(read1),b,'person')},
 'NEG-PRESENT-3PL-1SG':()=>{const b=binding(readpl);b.slots.verb=plain(card(read1).generated.slots.verb);reject(data,frameFor(readpl),b,'person/number')},
 'NEG-OBJECT-SEMANTICS':()=>{const b=binding(read1);b.slots.noun=formRef('lemma:n-water',f=>f.pashto==='اوبه');reject(data,frameFor(read1),b,'read water')},
 'NEG-FUTURE-AS-PRESENT':()=>{const d=cloneData(),b=binding(read1),f=value(d,b.slots.verb);f.morphology.tense='future';f.featureEvidence.features.tense='future';reject(d,frameFor(read1),b,'future')},
 'NEG-COMPLETE-INFLECTION-GUESS':()=>{const b=binding(read1);b.slots.verb=formRef('lemma:v-read',f=>f.morphology.form==='infinitive');reject(data,frameFor(read1),b,'infinitive as finite')},
 'NEG-UNKNOWN-GENDER':()=>{const d=cloneData(),b=binding('کور لوی دی.'),f=value(d,b.slots.noun);f.morphology.gender=null;f.featureEvidence.features.gender=null;reject(d,frameFor('کور لوی دی.'),b,'null gender')},
 'NEG-OBLIQUE-D10':()=>{const b=binding('کتاب پر مېز دی.');b.slots.location=formRef('lemma:n-table',f=>f.pashto==='مېز');reject(data,frameFor('کتاب پر مېز دی.'),b,'direct is not a chunk')},
 'NEG-COMPOUND-SPLIT':()=>{const d=cloneData(),b=binding('موږ یو ځای منډې وهو.'),f=value(d,b.slots.verb);f.pashto=f.pashto.split(' ').reverse().join(' ');f.featureEvidence.pashtoSpan=f.pashto;reject(d,frameFor('موږ یو ځای منډې وهو.'),b,'compound attestation')},
 'NEG-UNSEEN-LEMMA':()=>{const p=player(14);p.library.acquired['lemma:a-dark'].introducedFormIds=[];assert(!S.eligible(p,data,frames,14).some(c=>Object.values(c.generated.slots).some(r=>r.lemmaId==='lemma:a-dark')))},
 'NEG-UNKNOWN-WORD-PROPOSAL':()=>{const d=cloneData(),b=binding('کور لوی دی.'),f=value(d,b.slots.noun);f.pashto=null;f.composition.enabled=true;reject(d,frameFor('کور لوی دی.'),b,'untranslated')},
 'NEG-PRONOUN-DEIXIS':()=>{const b=binding('هغه کتاب نوی دی.');b.slots.demonstrative=formRef('lemma:pronoun:third-person',()=>true);reject(data,frameFor('هغه کتاب نوی دی.'),b,'personal vs deictic')},
 'NEG-PAST-ERGATIVE':()=>{const d=cloneData(),b=binding(read1),f=value(d,b.slots.verb);f.morphology.tense='past';f.featureEvidence.features.tense='past';reject(d,frameFor(read1),b,'past')},
};
assert.deepEqual(Object.keys(negatives).sort(),fixtures.mustReject.map(f=>f.id).sort());
for(const fixture of fixtures.mustReject){negatives[fixture.id]();console.log('PASS fixture '+fixture.id)}
// Thousands of whole compiler outputs checked independently of its agreement function.
let checked=0;
for(const c of catalog) {
 const g=c.generated,f=byFrame.get(g.frameId),s=Object.fromEntries(Object.entries(g.slots).map(([k,r])=>[k,{e:entry(data,r.lemmaId),f:value(data,r)}]));
 assert(!/[a-zA-Z]/.test(c.ps));assert(!/undefined|null/.test(c.en));
 assert.equal(g.reviewStatus,'needs_native_review');assert.equal(g.userVerified,false);
 for(const {e,f} of Object.values(s)) {
  assert(f.composition.enabled);assert(f.romanisation);assert(f.featureEvidence.sourceId);
  assert(c.loop>=e.introduction.day&&c.loop>=f.firstAllowedDay);
 }
 if(s.noun&&s.adjective) for(const k of ['gender','number','case'])assert.equal(s.noun.f.morphology[k],s.adjective.f.morphology[k]);
 if(s.subject&&s.verb) {
  assert.equal(s.subject.f.morphology.person||s.subject.f.composition.subjectPerson,s.verb.f.morphology.person);
  assert.equal(s.subject.f.morphology.number,s.verb.f.morphology.number);
  assert.equal(s.verb.f.morphology.tense,'present');assert.equal(s.verb.f.morphology.aspect,'imperfective');
 }
 if(s.noun&&s.verb)assert(s.verb.e.generationSemantics.objectClasses.some(k=>s.noun.e.generationSemantics.classes.includes(k)));
 if(s.possessive)assert.equal(s.possessive.f.morphology.case,'oblique');
 if(s.location?.f.composition.roles.includes('location'))assert(c.ps.includes(s.location.f.pashto));
 checked++;
}
assert.equal(S.eligible(player(14,'challenge'),data,frames,14).length,0,'Skipped/encountered forms are not introduced');
const variants=new Set();
for(let seed=0;seed<1000;seed++) {
 const a=S.select(p,data,frames,14,2,seed);
 assert.equal(a.length,2);assert.notEqual(a[0].ps,a[1].ps);
 assert.deepEqual(plain(a),plain(S.select(p,data,frames,14,2,seed)));
 a.forEach(c=>variants.add(c.ps));
}
assert(variants.size>100,'Seed-controlled variety must exceed nine tuples');
for(let day=1;day<=14;day++) {
 const p=player(day),available=S.select(p,data,frames,day,40,42);
 for(const c of available)for(const r of Object.values(c.generated.slots))assert(p.library.acquired[r.lemmaId]?.introducedFormIds.includes(r.formId));
 const locked=player(day);locked.library.grammar={};assert.equal(S.select(locked,data,frames,day,10,1).length,0);
}
for(const key of ['case','number','person','aspect','tense']) {
 const d=cloneData(),b=binding(read1),f=value(d,b.slots.verb);
 if(key==='case')f.romanisation=null;else f.morphology[key]=null;
 reject(d,frameFor(read1),b,'missing feature '+key);
}
const pp=player(14);const unverified=S.select(pp,data,frames,14,100,25);
assert(unverified.some(c=>Object.values(c.generated.slots).some(r=>entry(data,r.lemmaId).userVerified===false)));
assert(data.entries.filter(e=>e.reviewStatus==='provisional_playable').every(e=>e.userVerified===false));
assert.equal(E.ensurePlan(p,data,14).requestedDailyTarget,0);
console.log(`PASS productive generation: ${fixtures.positiveAuthoredRegression.length} positive + ${fixtures.mustReject.length} negative research fixtures; ${checked} independently checked bindings, ${variants.size} seeded variants, all days/unlocks and provisional status`);
