/* Reproducible capacity and morphology-gap report, never linguistic approval. */
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const data=JSON.parse(read('content/LIBRARY_LEXICON.json'));
const frames=JSON.parse(read('content/SENTENCE_FRAMES.json'));
const {E,S}=vm.runInNewContext(read('src/library-engine.js')+'\n'+read('src/sentence-engine.js')+';({E:LibraryEngine,S:SentenceEngine})');
const catalog=S.catalog(data,frames),familyNames=[...new Set(frames.frames.map(f=>f.family))];
const refs=new Map(data.entries.flatMap(e=>e.forms.map(f=>[f.formId,{e,f}])));
const unique=xs=>[...new Set(xs)];
function counts(cards) {
 const sentences=[...new Map(cards.map(c=>[c.ps,c])).values()];
 return {bindings:cards.length,uniquePashto:sentences.length,newlyComposed:sentences.filter(c=>!c.generated.sourceId).length,authoredMatches:sentences.filter(c=>c.generated.sourceId).length};
}
const families=cards=>Object.fromEntries(familyNames.map(f=>[f,counts(cards.filter(c=>c.generated.family===f))]));
const available=(p,day)=>catalog.filter(c=>c.loop<=day&&c.generated.requiredGrammarIds.every(id=>p.library.grammar[id])&&Object.values(c.generated.slots).every(r=>p.library.acquired[r.lemmaId]?.introducedFormIds.includes(r.formId)));
const authored=data.generationAttestations.filter(a=>a.pashto.endsWith('.')||a.pashto.endsWith('؟'));
const authoredDays=new Map();
for(const w of JSON.parse(read('content/WEEK1_RUNTIME.json')).words)if(w.type==='sentence')authoredDays.set(w.id,w.loop);
for(const d of JSON.parse(read('content/WEEK2_RUNTIME.json')).days)for(const l of d.lessons)for(const c of l.cards)authoredDays.set(c.id,d.day);
const fixedDay=a=>Math.max(authoredDays.get(a.sourceId)||99,...(data.sourceMappings[a.sourceId]||[]).map(r=>Math.max(refs.get(r.formId).e.introduction.day,refs.get(r.formId).f.firstAllowedDay)));
const potential=[];
for(let day=1;day<=14;day++){
 const cards=catalog.filter(c=>c.loop<=day);
 potential.push({day,...counts(cards),byFamily:families(cards),fixedAuthoredFallbackInventory:authored.filter(a=>fixedDay(a)<=day).length});
}
const routes=[];
for(const pace of E.presets) {
 const p={library:E.state()};p.library.requestedDailyTarget=pace;
 const days=[];
 for(let day=1;day<=14;day++) {
  const plan=E.ensurePlan(p,data,day);
  E.unlock(p,day,'normal-route-audit');
  const assigned=new Set(Object.values(plan.locationAssignments).flat());
  for(const e of data.entries) {
   const taught=!!p.library.acquired[e.lemmaId]?.introducedFormIds.length;
   if(day!==14&&(assigned.has(e.lemmaId)||(e.vocabularyClass==='universal'&&e.introduction.day<=day)))
    E.encounter(p,data,{lemmaId:e.lemmaId,formId:e.forms[0].formId},{day,source:'lesson',introduce:true});
   if(day!==14&&(taught||assigned.has(e.lemmaId)||(e.vocabularyClass==='universal'&&e.introduction.day<=day)))
    for(const f of e.forms)if(f.composition.enabled&&f.firstAllowedDay<=day&&f.prerequisiteGrammarIds.every(id=>p.library.grammar[id]))
     E.encounter(p,data,{lemmaId:e.lemmaId,formId:f.formId},{day,source:'lesson',introduce:true});
  }
  const cards=available(p,day);
  days.push({day,...counts(cards),byFamily:families(cards),introducedFormCount:Object.values(p.library.acquired).reduce((n,r)=>n+r.introducedFormIds.length,0)});
 }
 routes.push({pace,route:'normal, all four district lessons and individual eligible forms studied',days});
}
const formGaps=[];
for(const e of data.entries)for(const f of e.forms) {
 const missing=[];
 if(!f.romanisation)missing.push('own form romanisation');
 const mandatory=e.partOfSpeech==='noun'?['gender','number','case']:e.partOfSpeech==='adjective'?['gender','number','case']:e.partOfSpeech==='verb'?['person','number','tense','aspect','mood','transitivity']:[];
 for(const k of mandatory)if(f.morphology[k]==null)missing.push(k);
 if(!f.composition.enabled)missing.push('form-specific compositional role and contextual evidence');
 if(['noun','verb'].includes(e.partOfSpeech)&&!e.generationSemantics)missing.push('sense-specific semantic/English argument metadata');
 if(missing.length)formGaps.push({lemmaId:e.lemmaId,formId:f.formId,pashto:f.pashto,compositionEligible:f.composition.enabled,licensedRoles:f.composition.roles||[],missing,reason:f.composition.reason});
}
const verbGaps=data.entries.filter(e=>e.partOfSpeech==='verb').map(e=>({lemmaId:e.lemmaId,pashto:e.displayLemmaPs,missingPresentCells:[[3,'singular'],[1,'singular'],[2,'singular'],[2,'plural'],[1,'plural'],[3,'plural']].filter(([p,n])=>!e.forms.some(f=>f.composition.roles?.includes('verb')&&f.morphology.person===p&&f.morphology.number===n)).map(([p,n])=>({person:p,number:n,needed:'Exact present imperfective indicative surface and own pronunciation span, with valency and sense evidence; not a guessed stem'}))})).filter(e=>e.missingPresentCells.length);
const report={schemaVersion:1,notice:'Capacity under recorded draft licenses, not native correctness. Potential assumes all day-eligible forms studied and all earlier grammar workshops completed. Normal routes simulate actual district allocation and individual form study. Skip-only profiles introduce no forms and generate zero sentences at every pace/day. Binding counts may exceed distinct Pashto strings; authored matches are compiled outputs, not fallbacks. Fixed fallbacks are retained authored inventory, separate from generation.',lemmaCount:data.entries.length,formCount:refs.size,eligibleFormCount:[...refs.values()].filter(({f})=>f.composition.enabled).length,eligibleLemmaCount:unique(catalog.flatMap(c=>Object.values(c.generated.slots).map(r=>r.lemmaId))).length,frameCount:frames.frames.length,familyCount:familyNames.length,potentialByDay:potential,normalRoutes:routes,skipOnly:{allPaces:E.presets,days:14,generated:0},examples:familyNames.map(f=>{const c=catalog.find(c=>c.generated.family===f&&!c.generated.sourceId)||catalog.find(c=>c.generated.family===f);return {family:f,pashto:c.ps,english:c.en,effectiveDay:c.loop,kind:c.generated.outputKind}}),blockedConstructions:frames.blockedConstructions,formGaps,verbGaps};
const lines=['# Productive generation coverage','',report.notice,'',`Active inventory: ${report.lemmaCount} lemmas / ${report.formCount} forms. ${report.eligibleFormCount} eligible forms; ${report.eligibleLemmaCount} lemmas used by ${report.frameCount} templates / ${report.familyCount} families. All remain provisional.`,'','## Day-eligible potential','', '| Day | Unique Pashto | Newly composed | Authored matches | Bindings | Fixed fallback inventory |','|---|---:|---:|---:|---:|---:|',...potential.map(d=>`| ${d.day} | ${d.uniquePashto} | ${d.newlyComposed} | ${d.authoredMatches} | ${d.bindings} | ${d.fixedAuthoredFallbackInventory} |`),'','## Unique Pashto by family and day','',`| Family | ${potential.map(d=>'D'+d.day).join(' | ')} |`,`|---|${potential.map(()=>'---:').join('|')}|`,...familyNames.map(f=>`| ${f} | ${potential.map(d=>d.byFamily[f].uniquePashto).join(' | ')} |`),'','## Normal route capacity by daily pace','',`| Pace | ${potential.map(d=>'D'+d.day).join(' | ')} |`,`|---|${potential.map(()=>'---:').join('|')}|`,...routes.map(r=>`| ${r.pace} | ${r.days.map(d=>d.uniquePashto).join(' | ')} |`),'','These are available combinations after each day’s four lessons, not the number of questions a player is forced to answer. Detailed family/new/authored counts for every pace/day are in `content/GENERATION_AUDIT.json`. Day 14 introduces no forms. Skipping all lessons yields zero generated sentences; safe authored assessment fallbacks remain. The normal-route browser matrix separately verifies actual play.','', '## Examples','', '| Family | Pashto | English |','|---|---|---|',...report.examples.map(e=>`| ${e.family} | ${e.pashto} | ${e.english} |`),'','## Evidence gaps','',...frames.blockedConstructions.map(b=>`- **${b.family}**: ${b.missing}${b.formIds?' IDs: '+b.formIds.join(', '):''}`),'','`content/GENERATION_AUDIT.json` lists every excluded or partially usable form by exact ID, its missing gender/number/case/romanisation/semantic evidence, and every unsupported present-conjugation cell per verb. A citation or unknown trait never becomes a paradigm. Specific direct plurals, spatial chunks and oblique named possessors have separate study identities. The numeral One’s masculine citation remains excluded: the phrase “together” is not evidence for a cardinal NP. The attested masculine Two does not license a feminine Two paradigm.','', 'All 12 positive research fixtures are compiler regressions, including effective retiming: `s5-dark` to Day 8 for its demonstrative; `s6-books` to Day 9 for the noun plural. `userVerified:false` remains distinct from form eligibility. Extracted pronunciation aids and all new compositions require human review.',''];
const outputs=[['content/GENERATION_AUDIT.json',JSON.stringify(report,null,2)+'\n'],['docs/grammar/GENERATION_COVERAGE.md',lines.join('\n')]];
for(const [path,text]of outputs) {
 if(process.argv.includes('--check')){if(read(path)!==text)throw Error('Stale generation audit: '+path)}
 else writeFileSync(path,text);
}
console.log(`Generation audit: ${potential[13].uniquePashto} distinct Pashto (${potential[13].newlyComposed} new / ${potential[13].authoredMatches} authored matches); ${report.frameCount} templates; ${formGaps.length} exact form gap records`);
