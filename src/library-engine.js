/* Pure vocabulary state and planning. Content identities are editorial, never stems/glosses. */
const LibraryEngine=(()=>{
 const presets=[8,12,16,20,24], places=['house','market','river','school'];
 const legacyToDistrict={house:'residential',river:'nature',market:'business',school:'school'};
 const matchesPlace=(entry,place)=>!!entry&&(Array.isArray(entry.suitableDistricts)?entry.suitableDistricts.includes(legacyToDistrict[place]):entry.suitableLocations.includes(place));
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
 const unique=values=>[...new Set(values)];
 function state(){return {schemaVersion:1,requestedDailyTarget:20,seed:2401024,plans:{},legacyDays:{},acquired:{},phrases:{},grammar:{},events:{},attemptSequence:0};}
 function migrate(p,data){
  const previous=object(p.library), s=p.library={...state(),...previous};
  for(const k of ['plans','legacyDays','acquired','phrases','grammar','events'])s[k]=object(s[k]);
  if(!presets.includes(s.requestedDailyTarget))s.requestedDailyTarget=20;
  s.schemaVersion=1;
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
     if(count){rec.practisedFormIds=unique([...rec.practisedFormIds,ref.formId]);rec.correctAttempts=Math.max(rec.correctAttempts,count);rec.totalAttempts=Math.max(rec.totalAttempts,Number(stats.seen)||count);rec.srsDueAt=Math.max(rec.srsDueAt,Number(stats.dueAt)||0);rec.forms[ref.formId]={correctAttempts:count,totalAttempts:Number(stats.seen)||count,stage:Number(stats.stage)||0,srsDueAt:Number(stats.dueAt)||0};}
    }
   }
   if(p.tutorialDone)for(const phrase of data.phrases)s.phrases[phrase.id]={source:'legacy-tutorial'};
   for(const [day,seen] of Object.entries(object(p.personIntros)))if(seen)s.grammar['grammar-day-'+day]={day:Number(day),source:'legacy-exposure'};
   if(p.sovSeen)s.grammar['grammar-day-2']={day:2,source:'legacy-exposure'};
  }
  return p;
 }
 function encounter(p,data,ref,context){
  const s=p.library||(p.library=state()),e=data.entries.find(e=>e.lemmaId===ref.lemmaId);
  if(!e||!e.forms.some(f=>f.formId===ref.formId))return null;
  const r=s.acquired[e.lemmaId]||={firstEncounteredDay:context.day,firstEncounteredSource:context.source,firstEncounteredLocation:context.location,encounteredFormIds:[],practisedFormIds:[],correctAttempts:0,totalAttempts:0,srsDueAt:0,forms:{},encounteredSourceIds:[]};
  if(!r.encounteredFormIds.includes(ref.formId))delete r.masteredAt;
  r.encounteredFormIds=unique([...r.encounteredFormIds,ref.formId]);
  r.encounteredSourceIds=unique([...(r.encounteredSourceIds||[]),context.contentId].filter(Boolean));
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
  const required=unique(Object.values(data.storyRequirements?.[day]||{}).flat()).filter(id=>!p.library.acquired[id]);
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
 function supported(p,data,day){return presets.filter(target=>allocation(p,data,day,target).supported);}
 function ensurePlan(p,data,day){
  if(p.library.plans[day])return p.library.plans[day];
  if(p.library.legacyDays[day])return p.library.plans[day]={day,legacyContent:true,requestedDailyTarget:p.library.requestedDailyTarget,effectiveDailyTarget:null,locationAssignments:Object.fromEntries(places.map(place=>[place,[]])),planVersion:1,sourceContentVersion:data.sourceContentVersion,seed:p.library.seed,contentGap:false,notice:'Existing lesson content is preserved for this previously started day. Pace changes apply to future unstarted days.'};
  const target=p.library.requestedDailyTarget,a=allocation(p,data,day,target);
  const plan={day,requestedDailyTarget:target,effectiveDailyTarget:a.supported?target:null,locationAssignments:a.assignments,planVersion:1,sourceContentVersion:data.sourceContentVersion,seed:p.library.seed,contentGap:!a.supported,uncoveredStoryLemmaIds:a.uncoveredStoryLemmaIds,notice:a.supported?'Draft content: native review pending.':'Content gap: the requested quota cannot cover the preserved story and available distinct vocabulary. Counts show actual exposures; no repeat counts as new.'};
  p.library.plans[day]=plan;return plan;
 }
 function setPace(p,data,target,day){
  if(!presets.includes(target))return {ok:false,reason:'Choose a listed pace.'};
  // Never alter an existing plan. Validate the next unstarted day against the remaining pool.
  let next=day;while((p.library.plans[next]||p.library.legacyDays[next])&&next<=14)next++;
  if(next>14)return {ok:false,reason:'All current day plans have begun. More curated content is needed for future days.'};
  if(!supported(p,data,next).includes(target))return {ok:false,reason:'Content gap: the preserved story cannot fit this quota, or too few distinct draft lemmas remain. Select an available pace; no words will be invented.'};
  p.library.requestedDailyTarget=target;return {ok:true,day:next};
 }
 function unlock(p,day,source){if(day>=1&&day<=14)p.library.grammar['grammar-day-'+day]||={day,source};}
 return {presets,places,matchesPlace,state,migrate,encounter,expose,practise,status,summary,available,allocation,supported,ensurePlan,setPace,unlock};
})();
