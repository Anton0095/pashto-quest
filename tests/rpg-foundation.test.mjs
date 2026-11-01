import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const M=createRequire(import.meta.url)('../work/rpg-model.cjs');
const data=JSON.parse(readFileSync('content/RPG_WORLD.json','utf8'));
const fixture=JSON.parse(readFileSync('docs/rpg/day2-registration.example.json','utf8'));
assert.equal(fixture.active,false);assert(!data.days['2']);
const future=structuredClone(data);Object.assign(future.days,fixture.days);Object.assign(future.events,fixture.events);
for(const patch of fixture.npcSchedulePatches)future.npcs.find(n=>n.id===patch.id).schedule.push(...patch.schedule);
M.validateChapters(future);const registry=M.createRPGRegistry(future,{afterTutorial:()=>true});
assert.equal(registry.npcs(2,'village').find(n=>n.id==='hameed').event,'day2-school-opening');
assert.equal(registry.npcs(1,'village').find(n=>n.id==='saleha').characterId,registry.npcs(2,'village').find(n=>n.id==='saleha').characterId);
assert.equal(new Set(data.npcs.filter(n=>n.id.startsWith('jan-')).map(n=>n.characterId)).size,1);
for(const mutate of [d=>d.days['1'].day=2,d=>d.days['1'].maps=['missing'],d=>d.days['1'].openingEvent='missing',d=>d.days['1'].completion.terminal=false,d=>d.days['1'].activeNPCs=['missing'],d=>d.days['1'].challenge.day=3,d=>d.npcs[0].schedule[0].event='missing']){
 const bad=structuredClone(data);mutate(bad);assert.throws(()=>M.createRPGRegistry(bad,{}));
}
let flags={},triggers={},passed=false,eligible=true;const emitted=[];
const state={day:2,progress:{}},learning={allowed:()=>true},progression={passedChallenge:()=>passed};
const director=M.createChapterDirector({data:future,state,learning,progression,eligible:()=>eligible,dispatch:e=>emitted.push(e),triggers:()=>triggers});
assert(!director.ready(future.days['2']),'registered future chapters remain inactive');assert(!director.opening());
future.lastDay=2;eligible=false;assert(!director.opening());eligible=true;assert(director.opening());assert(!director.opening());assert.deepEqual(emitted,['day2-school-opening']);assert(director.challengeAvailable());assert(!director.ending());passed=true;assert(director.ending());assert(!director.ending());assert.equal(director.next(),null,'unregistered Day3 stays inaccessible');
future.days['3']={...structuredClone(future.days['2']),id:'day-3',day:3,lessons:['3-school'],challenge:{day:3,npc:'hameed'},completion:{challengePassed:3,terminal:true},nextChapter:null};future.lastDay=3;assert.equal(director.next().id,'day-3','nonterminal chapter resolves next registered eligible chapter');
state.day=1;assert.equal(director.next(),null,'terminal Day1 never advances even with Day2 registered');
const P=M.createPersistenceAPI(data,{});let save=P.fresh(data),writes=0;
const events={intro:{speaker:'Saleha',lines:['First','Second'],once:true,setFlags:['heard'],actions:[{label:'School',type:'lesson',lessonId:'1-school',resumeEvent:'returned'}]},returned:{speaker:'Saleha',lines:['Welcome back'],actions:[]}};
const story=M.createStoryDirector({value:()=>save,event:id=>events[id],eligible:c=>!c||!!save.flags[c],changed:()=>writes++});
assert(story.open('intro'));story.index(1);save=P.validate(data,{...save,dialogue:undefined}); // actual registered cursor validation below
save=P.fresh(data);story.open('intro');story.index(1);
const copy=JSON.parse(JSON.stringify(save));save=copy;assert.equal(story.cursor.index,1);assert(story.choose(events.intro.actions[0]));assert(save.flags.heard);assert(save.triggers.intro);assert.equal(story.resume().speaker,'Saleha');assert(!story.open('intro'),'once-only event');
assert(!story.choose({type:'flag',flag:'forbidden',condition:'missing',label:'No'}));assert(!save.flags.forbidden);story.close();assert.equal(story.cursor,undefined);assert(writes>0);
const validCursor=P.validate(data,{...P.fresh(data),dialogue:{event:'welcome',index:1}});assert.equal(validCursor.dialogue.index,1);assert(!P.validate(data,{...validCursor,dialogue:{event:'missing',index:0}}).dialogue);
// No-op writes do not re-write localStorage; rejected locks remain retryable.
let raw=null,count=0;const backend={getItem:()=>raw,setItem:(_k,v)=>{raw=v;count++;}};const persistence=P.create(data,backend);assert(await persistence.save(persistence.value));assert(await persistence.save(persistence.value));assert.equal(count,1);
console.log('PASS foundation chapters, inactive Day2 registration/events, prerequisites, terminal/nonterminal, stable identities, story flags/once-only/resumption, validated cursor and no-op writes');
const relocated=structuredClone(future);const saleha=relocated.npcs.find(n=>n.id==='saleha');saleha.schedule.find(s=>s.day===2).x=38;saleha.schedule.find(s=>s.day===2).y=28;
const relocatedRegistry=M.createRPGRegistry(relocated,{afterTutorial:()=>true});assert.equal(relocatedRegistry.npcs(2,'village').find(n=>n.characterId==='saleha').y,28);assert.equal(relocatedRegistry.npcs(1,'village').find(n=>n.characterId==='saleha').y,11);
const navigatorDescriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator');let rejectLock=true;
try{
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(_key,fn)=>{if(rejectLock)throw Error('interrupted');return fn();}}}});
 const retry=P.create(data,backend);assert.equal(await retry.save(retry.value),false);assert(retry.problem);rejectLock=false;assert(await retry.save(retry.value));assert.equal(retry.problem,null);
}finally{if(navigatorDescriptor)Object.defineProperty(globalThis,'navigator',navigatorDescriptor);else delete globalThis.navigator;}
console.log('PASS relocated stable character and rejected-lock retry without a poisoned world queue');
// Corrupt optional world drafts may be discarded; they never create a recorded answer.
const {runtime}=await import('./runtime-fixture.mjs');const education=runtime();
const tileCard=education.content.tutorialCards.find(c=>c.kind==='tiles');const indices=education.content.wordById[tileCard.id].ps.split(' ').map((_w,i)=>i);
const rawTutorial={mode:'tutorial',id:'tutorial',loop:0,phase:'tutorial',cardIndex:1,attemptId:0,locked:false,profileGender:'unspecified',profileName:'',required:[],studyWords:[],greetingCards:[],studySentences:[],firstAsked:[],passed:[],queue:[],built:[],tutorialConstruction:{built:indices.slice(0,1),order:[...indices].reverse(),locked:false}};
const paired=M.createPersistenceAPI(data,education.Q);assert(paired.restoreLesson(rawTutorial,education.content,education.state.progress));
rawTutorial.tutorialConstruction.locked=true;assert.equal(paired.restoreLesson(rawTutorial,education.content,education.state.progress),null,'A world-only lock cannot fabricate a recorded tutorial response');
rawTutorial.passed=[tileCard.id];assert(paired.restoreLesson(rawTutorial,education.content,education.state.progress));rawTutorial.tutorialConstruction.order=[0,0];assert.equal(paired.restoreLesson(rawTutorial,education.content,education.state.progress),null);
console.log('PASS tutorial draft permutation, partial restoration and recorded-response lock validation');

const defaults=structuredClone(data);defaults.npcs.find(n=>n.id==='hameed').defaultLocation={map:'library',x:4,y:4};defaults.days['1'].activeNPCs=['hameed'];defaults.npcs.find(n=>n.id==='hameed').schedule=[];assert.equal(M.createRPGRegistry(defaults,{}).npcs(1,'library')[0].characterId,'hameed');
console.log('PASS optional default NPC location when no day-specific override exists');

for(const actor of registry.npcs(2,'village'))for(const action of registry.event(actor.event).actions)if(action.type==='lesson')assert(future.days['2'].lessons.includes(action.lessonId),'Day2 placements resolve only their registered curriculum lessons');
console.log('PASS all inactive Day2 NPC lesson links resolve to Day2 curriculum IDs');
