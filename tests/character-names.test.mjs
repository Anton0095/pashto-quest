import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const names=JSON.parse(readFileSync('content/CHARACTER_NAMES.json'));
const C=vm.runInNewContext(readFileSync('src/character-names.js','utf8')+';CharacterNames',{CHARACTER_NAMES:names});
assert.equal(C.text('مینا او زه — meena aw za — Mina and I'),'مدینه او زه — madeena aw za — Medina and I');
assert.equal(C.text('صالحه — saaleha — Saleha'),'دینه — deena — Deena');
assert.equal(C.text('د صالحې — da saalehe — Saleha’s'),'د دینه — da deena — Deena’s');
assert.equal(C.text('د مینا — da meena — Mina’s'),'د مدینه — da madeena — Medina’s');
assert.equal(C.text('Nomination and semina and میناوال'),'Nomination and semina and میناوال','Only whole named tokens');
assert.equal(C.storedAnswer(' MEDINA and DEENA '),' Mina and Saleha ');
assert.equal(C.text(C.text('Mina and Saleha')),'Medina and Deena');
assert.equal(names.approval.nativeCertificationClaimed,false);
assert(names.characters.every(n=>n.romanisationStatus.includes('not_user_supplied')));
const approval=JSON.parse(readFileSync('content/USER_LANGUAGE_APPROVALS.json')).characterNameUpdates;
assert.deepEqual(approval.suppliedSpellings,{mina:'مدینه',saleha:'دینه'});
// Original evidence and identity store are unchanged; named surfaces have a separate scoped approval.
const l=JSON.parse(readFileSync('content/LIBRARY_LEXICON.json'));
for(const n of names.characters){const e=l.entries.find(e=>e.lemmaId===n.lemmaId);assert.equal(C.text(e.displayLemmaPs),n.current.pashto);assert.equal(C.text(e.englishSenses[0]),n.current.english);for(const f of e.forms){assert(!f.userVerified);assert(!/Mina|Saleha|مینا|صالح[هې]/u.test(C.text(f.pashto+' '+f.englishGloss)));}}
console.log('PASS exact owner-approved name surfaces, whole-token boundaries, provisional pronunciation/case scope and stable underlying identities/proofs');
