import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const data=JSON.parse(readFileSync('index.html','utf8').match(/const LIBRARY_DATA=(\{.*?\});/s)[1]);
const frames=data.sentenceFrames;
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value)}return value};
freeze(data.entries);freeze(data.generationEvidence);
const source=process.argv.includes('--write')?readFileSync('work/p1/sentence-engine-before.js','utf8'):readFileSync('src/sentence-engine.js','utf8');
const context={rebuilds:0};
const {S,E}=vm.runInNewContext(readFileSync('src/library-engine.js','utf8')+'\n'+source.replace('    const sources = new Map(','    globalThis.rebuilds++;\n    const sources = new Map(')+';({S:SentenceEngine,E:LibraryEngine})',context);
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const actual=[];
for(let day=1;day<=14;day++){
 const p={library:E.state()};
 for(let n=1;n<=day;n++)E.unlock(p,n,'visible-test-workshop');
 for(const e of data.entries)for(const f of e.forms)if(E.formAllowed(e,f,day))E.encounter(p,data,{lemmaId:e.lemmaId,formId:f.formId},{day,source:'lesson',introduce:true});
 const cards=S.available(p,data,frames,day);
 const selections=[];for(let seed=1;seed<=20;seed++)selections.push(S.select(p,data,frames,day,15,seed));
 actual.push({day,count:cards.length,cardsSha256:hash(cards),selectionsSha256:hash(selections),dialoguesSha256:hash(S.dialogues(cards,data,12345))});
 const signature=data.eligibleCache.signature;
 const grammar=p.library.grammar['grammar-day-'+day];delete p.library.grammar['grammar-day-'+day];S.available(p,data,frames,day);assert.notEqual(data.eligibleCache.signature,signature);
 p.library.grammar['grammar-day-'+day]=grammar;
 const r=Object.values(p.library.acquired).find(r=>r.introducedFormIds.length);if(r){const forms=r.introducedFormIds;r.introducedFormIds=[];S.available(p,data,frames,day);assert.notEqual(data.eligibleCache.signature,signature);r.introducedFormIds=forms}
}
const file='tests/generation-output-contract.json';
if(process.argv.includes('--write')){writeFileSync(file,JSON.stringify(actual,null,2)+'\n');console.log('WROTE baseline output contract from unoptimised engine')}
else{
 assert.deepEqual(actual,JSON.parse(readFileSync(file,'utf8')),'Every card, dialogue and seeded draw must remain byte-identical');
 assert.equal(context.rebuilds,1,'One immutable index serves every day, eligibility change and selection view');
 const first=S.available({library:E.state()},data,frames,14);
 const mutable=JSON.parse(JSON.stringify(data));delete mutable.eligibleCache;
 S.catalog(mutable,frames);const before=context.rebuilds;
 mutable.entries[0].forms=[];S.catalog(mutable,frames);assert(context.rebuilds>before,'Mutable editorial input must rebuild');
 const shallow=JSON.parse(JSON.stringify(data));delete shallow.eligibleCache;Object.freeze(shallow.entries);
 S.catalog(shallow,frames);const shallowBefore=context.rebuilds;shallow.entries[0].forms=[];S.catalog(shallow,frames);assert(context.rebuilds>shallowBefore,'A shallow-frozen array does not certify immutable lexical children');
 assert.deepEqual(JSON.parse(JSON.stringify(first)),[]);
 console.log('PASS cache: all 14 full card/20-seed/dialogue payload digests unchanged, one immutable lexical index, form/grammar invalidation, mutable data rebuilds');
}
