import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';
export function activationProblems(candidate){
 const gaps=[];
 if(!/[\u0600-\u06ff]/.test(candidate.pashtoDraft||''))gaps.push('Pashto headword');
 if(!candidate.romanisationDraft)gaps.push('romanisation');
 if(!candidate.partOfSpeech)gaps.push('part of speech');
 if(!candidate.suitableDistricts?.length)gaps.push('districts');
 if(!candidate.forms?.length||candidate.forms.some(f=>!f.formId||!/[\u0600-\u06ff]/.test(f.pashto||'')||!f.romanisation||!f.morphology))gaps.push('stable forms and morphology');
 if(!candidate.examples?.length||candidate.examples.some(e=>!/[\u0600-\u06ff]/.test(e.pashto||'')||!e.romanisation||!e.english||!e.speaker||!e.recipient||!e.constraints))gaps.push('contextual examples and constraints');
 if(!candidate.sourceMappings||!Object.keys(candidate.sourceMappings).length)gaps.push('source mappings');
 if(candidate.reviewStatus!=='approved'||!candidate.nativeReview?.reviewer||!candidate.nativeReview?.reference)gaps.push('documented qualified native sign-off');
 if(candidate.aliasOfLemmaId)gaps.push('existing lemma alias, not a new entry');
 return gaps;
}
const tally=values=>values.reduce((o,k)=>(o[k]=(o[k]||0)+1,o),{});
export function inventory(data,backlog,engine){
 const E=vm.runInNewContext(engine+';LibraryEngine');
 const content=data.entries.filter(e=>e.countsTowardDailyQuota);
 const schedules=[];
 for(const reviewExams of [false,true])for(const pace of E.presets){const p={library:E.state()};const days=[];
  for(let day=1;day<=14;day++){p.library.requestedDailyTarget=reviewExams&&[7,14].includes(day)?0:pace;const plan=E.ensurePlan(p,data,day);days.push({day,requested:plan.requestedDailyTarget,assigned:Object.values(plan.locationAssignments).flat().length,feasible:!plan.contentGap,perDistrict:Object.fromEntries(Object.entries(plan.locationAssignments).map(([key,ids])=>[E.scene(key).districtId,ids.length]))});
   // Real chronological exposure includes story words, not just idealised quota arithmetic.
   for(const id of new Set([...Object.values(plan.locationAssignments).flat(),...Object.values(data.storyRequirements[day]||{}).flat()])){const e=data.entries.find(e=>e.lemmaId===id);if(e)E.encounter(p,data,{lemmaId:id,formId:e.forms[0].formId},{day,source:'lesson',location:'simulation'});}
  }schedules.push({pace,reviewExams,days,encountered:E.summary(p,data).encountered});
 }
 const forms=data.entries.flatMap(e=>e.forms);
 return {candidateDistrictCounts:tally(backlog.candidates.map(c=>c.primaryDistrict)),authoredExampleSceneCoverage:Object.fromEntries(['house','river','market','school','hills','bakery','neighbourHome'].map(scene=>[scene,content.filter(e=>e.examples.some(ex=>ex.location===scene)).length])),schemaVersion:1,activatedLemmas:data.entries.length,activatedContentLemmas:content.length,nativeApprovedContentLemmas:content.filter(e=>e.reviewStatus==='approved').length,inactiveCandidates:backlog.candidates.length,aliasCandidates:backlog.candidates.filter(c=>c.aliasOfLemmaId).length,eligibleForPromotion:backlog.candidates.filter(c=>!activationProblems(c).length).length,byPrimaryDistrict:tally(content.map(e=>e.primaryDistrict)),byPartOfSpeech:tally(content.map(e=>e.partOfSpeech)),byReviewStatus:tally(data.entries.map(e=>e.reviewStatus)),byDifficulty:tally(data.entries.map(e=>e.difficulty||'not assessed')),formCount:forms.length,duplicateLemmaIds:data.entries.map(e=>e.lemmaId).filter((id,i,all)=>all.indexOf(id)!==i),sameHeadwordForEditorialReview:Object.entries(data.entries.reduce((o,e)=>((o[e.displayLemmaPs]||=[]).push(e.lemmaId),o),{})).filter(([,ids])=>ids.length>1),scenes:['house','river','market','school','library','hills','bakery','neighbourHome'].map(id=>E.scene(id)),candidateGaps:tally(backlog.candidates.flatMap(activationProblems)),schedules};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const data=JSON.parse(readFileSync('content/LIBRARY_LEXICON.json')),backlog=JSON.parse(readFileSync('content/DISTRICT_VOCABULARY_CANDIDATES.json')),engine=readFileSync('src/library-engine.js','utf8');
 const report=JSON.stringify(inventory(data,backlog,engine),null,2)+'\n',path='content/DISTRICT_INVENTORY_REPORT.json';
 if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==report)throw Error('Stale district inventory report');}else writeFileSync(path,report);
 console.log('District inventory: '+data.entries.filter(e=>e.countsTowardDailyQuota).length+' activated content lemmas; '+backlog.candidates.length+' inactive candidates. No untranslated entry promoted.');
}
