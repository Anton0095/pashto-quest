import assert from 'node:assert/strict';
import {runtime,reset,study} from './runtime-fixture.mjs';
const t=runtime();reset(t);
for(const [id,ps,en,roman]of [['mina','مدینه','Medina','madeena'],['saleha','دینه','Deena','deena']]){
 const e=t.content.libraryEntries['lemma:person:'+id];assert.equal(e.displayLemmaPs,ps);assert.equal(e.romanisation,roman);assert.equal(e.englishSenses[0],en);
 assert(e.forms.every(f=>!f.userVerified&&!/مینا|صالح[هې]|meena|saaleh|Mina|Saleha/u.test(JSON.stringify(f))));
}
for(let d=1;d<=7;d++)for(const loc of t.content.zoneKeys)study(t,d,loc);
const cards=t.learning.availableSentences(7);assert(cards.some(c=>c.ps.includes('مدینه')));assert(cards.some(c=>c.ps.includes('دینه')));
for(const c of cards)for(const text of [c.ps,c.en,c.roman,c.speaker,c.recipient])assert(!/مینا|صالح[هې]|meena|saaleh|Mina|Saleha/u.test(text||''));
console.log('PASS canonical current names in forms, compiler, metadata and pronunciation without display aliases');
