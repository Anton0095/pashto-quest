/* Pure vocabulary state and planning. Content identities are editorial, never stems/glosses. */
const LibraryEngine=(()=>{
 const presets=[0,4,8,12,16,20,24], places=['house','market','river','school'];
 const legacyToDistrict={house:'residential',river:'nature',market:'business',school:'school'};
 const matchesPlace=(entry,place)=>{const district=legacyToDistrict[place]||scene(place)?.districtId||(Object.values(legacyToDistrict).includes(place)?place:null);return !!entry&&(Array.isArray(entry.suitableDistricts)?entry.suitableDistricts.includes(district):(entry.suitableLocations||[]).some(key=>key===place||legacyToDistrict[key]===district));};
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
 const unique=values=>[...new Set(values)];
 function state(){return {schemaVersion:2,dayExposure:{},requestedDailyTarget:20,seed:2401024,plans:{},legacyDays:{},acquired:{},phrases:{},grammar:{},events:{},attemptSequence:0};}
 function migrate(p,data){
  const previous=object(p.library), s=p.library={...state(),...previous};
  for(const k of ['dayExposure','plans','legacyDays','acquired','phrases','grammar','events'])s[k]=object(s[k]);
  if(!presets.includes(s.requestedDailyTarget))s.requestedDailyTarget=20;
  s.schemaVersion=2;
  p.homeGranted=p.homeGranted===true||p.challenges?.[1]?.passed===true;
  if(!previous.schemaVersion){
   // Historical days retain the original curriculum; pace applies only to unstarted days.
   for(const [id,done] of Object.entries(object(p.complete))){const match=id.match(/^(\d+)-(house|market|river|school)$/);if(done&&match)s.legacyDays[Number(match[1])]=true;}
   for(const [day,record] of Object.entries(object(p.challenges)))if(record?.passed||record?.attempts>0)s.legacyDays[Number(day)]=true;
   if(p.legacyDay7)s.legacyDays[7]=true;
   for(const [day,seen] of Object.entries(object(p.personIntros)))if(seen)s.legacyDays[Number(day)]=true;
   // Only evidence of actual card practice is imported. Clears/unlocked days are not encounters.
   for(const [id,stats] of Object.entries(object(p.stats))){
    if(!(stats?.seen>0))continue;
    const sourceDay=data.legacyCardDays?.[id];if(sourceDay)s.legacyDays[sourceDay]=true;
    const refs=data.sourceMappings[id]||[];
    for(const ref of refs){
     const e=data.entries.find(e=>e.lemmaId===ref.lemmaId);if(!e)continue;
     const rec=encounter(p,data,ref,{day:0,source:'legacy',location:'legacy',eventId:'migration:'+id});
     const count=Math.max(0,Number(stats.correct)||0);
     if(stats.seen>0){rec.practisedFormIds=unique([...rec.practisedFormIds,ref.formId]);rec.correctAttempts=Math.max(rec.correctAttempts,count);rec.totalAttempts=Math.max(rec.totalAttempts,Number(stats.seen)||count);rec.srsDueAt=Math.max(rec.srsDueAt,Number(stats.dueAt)||0);rec.forms[ref.formId]={correctAttempts:count,totalAttempts:Number(stats.seen)||count,stage:Number(stats.stage)||0,srsDueAt:Number(stats.dueAt)||0};}
    }
   }
   if(p.tutorialDone)for(const phrase of data.phrases)s.phrases[phrase.id]={source:'legacy-tutorial'};
   for(const [day,seen] of Object.entries(object(p.personIntros)))if(seen)s.grammar['grammar-day-'+day]={day:Number(day),source:'legacy-exposure'};
   if(p.sovSeen)s.grammar['grammar-day-2']={day:2,source:'legacy-exposure'};
  }
  if(previous.schemaVersion===1){
   for(const [id,stats] of Object.entries(object(p.stats))){if(!(stats?.seen>0))continue;
    for(const ref of data.sourceMappings[id]||[]){if(s.acquired[ref.lemmaId])continue;
     const r=encounter(p,data,ref,{day:0,source:'legacy',location:'legacy',contentId:id});if(!r)continue;
     r.correctAttempts=Number(stats.correct)||0;r.totalAttempts=Number(stats.seen)||0;
     if(r.totalAttempts){r.practisedFormIds=[ref.formId];r.forms[ref.formId]={correctAttempts:r.correctAttempts,totalAttempts:r.totalAttempts,stage:Number(stats.stage)||0,srsDueAt:Number(stats.dueAt)||0};r.srsDueAt=Number(stats.dueAt)||0;}
    }
   }
  }
  return p;
 }
 function encounter(p,data,ref,context){
  const s=p.library||(p.library=state()),e=data.entries.find(e=>e.lemmaId===ref.lemmaId);
  if(!e||!e.forms.some(f=>f.formId===ref.formId))return null;
  const r=s.acquired[e.lemmaId]||{firstEncounteredDay:context.day,firstEncounteredSource:context.source,firstEncounteredLocation:context.location,encounteredFormIds:[],practisedFormIds:[],correctAttempts:0,totalAttempts:0,srsDueAt:0,forms:{},encounteredSourceIds:[]};
  s.acquired[e.lemmaId]=r;
  if(!r.encounteredFormIds.includes(ref.formId))delete r.masteredAt;
  r.encounteredFormIds=unique([...r.encounteredFormIds,ref.formId]);
  r.encounteredSourceIds=unique([...(r.encounteredSourceIds||[]),context.contentId].filter(Boolean));
  if(context.day>0){
   const ledger=s.dayExposure[context.day]||={incidentalStoryLemmas:[],reviewedExistingLemmas:[]};
   const scheduled=Object.values(s.plans[context.day]?.locationAssignments||{}).flat();
   if(r.firstEncounteredDay===context.day&&!scheduled.includes(e.lemmaId)&&['lesson','challenge'].includes(context.source))ledger.incidentalStoryLemmas=unique([...ledger.incidentalStoryLemmas,e.lemmaId]);
   if(r.firstEncounteredDay<context.day||context.source==='review')ledger.reviewedExistingLemmas=unique([...ledger.reviewedExistingLemmas,e.lemmaId]);
  }
  r.forms[ref.formId]||={correctAttempts:0,totalAttempts:0,stage:0,srsDueAt:0};
  return r;
 }
 function expose(p,data,id,context){
  if(data.phrases.some(f=>f.id===id)){p.library.phrases[id]||={day:context.day,source:context.source};return;}
  for(const ref of data.sourceMappings[id]||[])encounter(p,data,ref,{...context,contentId:id});
 }
 function practise(p,data,id,correct,context){
  const event=context.eventId;if(p.library.events[event])return false;
  p.library.events[event]=true;
  expose(p,data,id,context);
  for(const ref of data.sourceMappings[id]||[]){const r=p.library.acquired[ref.lemmaId];if(!r)continue;
   const f=r.forms[ref.formId],now=context.now||Date.now(),due=!f.srsDueAt||f.srsDueAt<=now;
   r.totalAttempts++;f.totalAttempts++;
   // An incorrect but submitted attempt is practice too; it never implies mastery.
   r.practisedFormIds=unique([...r.practisedFormIds,ref.formId]);
   if(correct){r.correctAttempts++;f.correctAttempts++;if(due){f.stage=Math.min(5,f.stage+1);f.srsDueAt=now+[0,1,3,7,14,30][f.stage]*86400000;}}
   else{f.stage=0;f.srsDueAt=now;delete r.masteredAt;}
   r.srsDueAt=Math.min(...Object.values(r.forms).map(f=>f.srsDueAt));
   if(Object.values(r.forms).every(f=>f.stage>=3)&&r.correctAttempts>=3)r.masteredAt||=now;
  }
  return true;
 }
 function status(r){return !r?'unencountered':r.masteredAt?'mastered':r.practisedFormIds.length?'practised':'introduced';}
 function summary(p,data){const counts={encountered:0,practised:0,mastered:0};for(const e of data.entries){const r=p.library.acquired[e.lemmaId];if(!r||!e.countsTowardDailyQuota)continue;counts.encountered++;if(r.practisedFormIds.length)counts.practised++;if(r.masteredAt)counts.mastered++;}return counts;}
 function hash(text){let h=2166136261;for(const ch of text){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
 function available(p,data,day){
  const reserved=new Set(Object.values(p.library.plans).filter(x=>x.day!==day).flatMap(x=>Object.values(x.locationAssignments).flat()));
  return data.entries.filter(e=>e.countsTowardDailyQuota&&!p.library.acquired[e.lemmaId]&&!reserved.has(e.lemmaId));
 }
 function allocation(p,data,day,target){
  const pool=available(p,data,day),byId=Object.fromEntries(pool.map(e=>[e.lemmaId,e])),quota=target/4;
  const assignments=Object.fromEntries(places.map(place=>[place,[]]));
  const required=[]; // Authored story exposure is scaffolded, never a minimum assigned-word quota.
  const mandatory=required.filter(id=>byId[id]).sort((a,b)=>byId[a].suitableLocations.length-byId[b].suitableLocations.length||a.localeCompare(b));
  function assign(id,visited=new Set()){
   for(const place of places.filter(place=>matchesPlace(byId[id],place))){
    if(visited.has(place))continue;visited.add(place);
    if(assignments[place].length<quota){assignments[place].push(id);return true;}
    for(let i=0;i<assignments[place].length;i++){const prior=assignments[place][i];if(assign(prior,visited)){assignments[place][i]=id;return true;}}
   }return false;
  }
  const matched=new Set();for(const id of mandatory)if(assign(id))matched.add(id);
  const optional=pool.filter(e=>!required.includes(e.lemmaId)).sort((a,b)=>hash(p.library.seed+':'+day+':'+a.lemmaId)-hash(p.library.seed+':'+day+':'+b.lemmaId)||a.lemmaId.localeCompare(b.lemmaId));
  for(const e of optional){if(Object.values(assignments).flat().length>=target)break;assign(e.lemmaId);}
  const uncoveredStoryLemmaIds=required.filter(id=>!matched.has(id));
  return {assignments,uncoveredStoryLemmaIds,supported:!uncoveredStoryLemmaIds.length&&places.every(place=>assignments[place].length===quota)};
 }
 function supported(p,data,day){if(day<1||day>14)return [];return presets.filter(target=>allocation(p,data,day,target).supported);}
 function ensurePlan(p,data,day){
  if(p.library.plans[day])return p.library.plans[day];
  if(p.library.legacyDays[day])return p.library.plans[day]={day,legacyContent:true,requestedDailyTarget:p.library.requestedDailyTarget,effectiveDailyTarget:null,locationAssignments:Object.fromEntries(places.map(place=>[place,[]])),planVersion:2,sourceContentVersion:data.sourceContentVersion,seed:p.library.seed,contentGap:false,notice:'Existing lesson content is preserved for this previously started day. Pace changes apply to future unstarted days.'};
  const target=p.library.requestedDailyTarget,a=allocation(p,data,day,target);
  const plan={day,requestedDailyTarget:target,effectiveDailyTarget:a.supported?target:null,locationAssignments:a.assignments,planVersion:2,sourceContentVersion:data.sourceContentVersion,seed:p.library.seed,contentGap:!a.supported,uncoveredStoryLemmaIds:a.uncoveredStoryLemmaIds,notice:a.supported?'Draft content: native review pending.':'Content gap: insufficient distinct activated vocabulary for the requested quota. Counts show actual exposures; no repeat counts as new.'};
  p.library.plans[day]=plan;return plan;
 }
 function setPace(p,data,target,day){
  if(!presets.includes(target))return {ok:false,reason:'Choose a listed pace.'};
  // Never alter an existing plan. Validate the next unstarted day against the remaining pool.
  let next=day;while((p.library.plans[next]||p.library.legacyDays[next])&&next<=14)next++;
  if(next>14)return {ok:false,reason:'All current day plans have begun. More curated content is needed for future days.'};
  if(!supported(p,data,next).includes(target))return {ok:false,reason:'Content gap: too few distinct activated lemmas remain. Select an available pace; no words will be invented.'};
  p.library.requestedDailyTarget=target;return {ok:true,day:next};
 }
 const scenes={house:{sceneId:'house',districtId:'residential',displayName:'Home',participants:['Muhammad Jan']},river:{sceneId:'river',districtId:'nature',displayName:'Lake',participants:['Saleha']},market:{sceneId:'market',districtId:'business',displayName:'Market',participants:['Edris']},school:{sceneId:'school',districtId:'school',displayName:'School',participants:['Ms Hameed']},library:{sceneId:'library',districtId:'school',displayName:'Library',participants:['Muhammad Jan']},hills:{sceneId:'hills',districtId:'nature',displayName:'Hills',participants:['Saleha','Mina']},bakery:{sceneId:'bakery',districtId:'business',displayName:'Bakery',participants:[]},neighbourHome:{sceneId:'neighbourHome',districtId:'residential',displayName:'Neighbour home',participants:[]}};
 function scene(id){return scenes[id==='hills-story-only'?'hills':id]||null;}
 function lexicalSelection(p,data,day,count){
  const scheduled=new Set(Object.values(p.library.plans[day]?.locationAssignments||{}).flat());
  const acquired=Object.keys(p.library.acquired).filter(id=>data.entries.some(e=>e.lemmaId===id&&e.countsTowardDailyQuota));
  const due=acquired.filter(id=>p.library.acquired[id].srsDueAt<=Date.now()).sort((a,b)=>p.library.acquired[a].srsDueAt-p.library.acquired[b].srsDueAt||a.localeCompare(b));
  const encountered=acquired.filter(id=>!due.includes(id)).sort();
  // Alternating due recall and genuinely encountered words precedes unstudied scheduled scaffolds.
  const lists=[due,encountered,[...scheduled]],seen=new Set(),out=[];
  for(const [i,list] of lists.entries())for(const id of list){if(seen.has(id))continue;seen.add(id);out.push({lemmaId:id,origin:['due-review','encountered','scheduled-scaffold'][i]});if(out.length===count)return out;}
  return out;
 }
 function dueForms(p,data){return data.entries.flatMap(e=>{const r=p.library.acquired[e.lemmaId];return r?e.forms.filter(f=>r.encounteredFormIds.includes(f.formId)&&r.forms[f.formId]?.srsDueAt<=Date.now()).map(f=>({entry:e,form:f,dueAt:r.forms[f.formId].srsDueAt})):[];}).sort((a,b)=>a.dueAt-b.dueAt||a.form.formId.localeCompare(b.form.formId));}
 function tallies(p,data,day){
  const scheduledNewLemmas=unique(Object.values(p.library.plans[day]?.locationAssignments||{}).flat());
  const ledger=p.library.dayExposure[day]||{};
  return {scheduledNewLemmas,actuallyEncounteredScheduledLemmas:scheduledNewLemmas.filter(id=>p.library.acquired[id]),incidentalStoryLemmas:ledger.incidentalStoryLemmas||[],reviewedExistingLemmas:ledger.reviewedExistingLemmas||[],masteredLemmas:data.entries.filter(e=>e.countsTowardDailyQuota&&p.library.acquired[e.lemmaId]?.masteredAt).map(e=>e.lemmaId)};
 }
 function unlock(p,day,source){if(day>=1&&day<=14)p.library.grammar['grammar-day-'+day]||={day,source};}
 return {scene,lexicalSelection,dueForms,tallies,presets,places,matchesPlace,state,migrate,encounter,expose,practise,status,summary,available,allocation,supported,ensurePlan,setPace,unlock};
})();
