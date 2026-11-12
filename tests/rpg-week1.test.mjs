import assert from 'node:assert/strict';import {readFileSync}from'node:fs';import{createRequire}from'node:module';
const M=createRequire(import.meta.url)('../work/rpg-model.cjs'),data=JSON.parse(readFileSync('content/RPG_WORLD.json','utf8'));
const registry=M.createRPGRegistry(data,{'flag:day6-hills-invited':()=>true,'not-flag:day6-hills-invited':()=>false,'not-complete:6-nature':()=>true,'not-complete:7-school':()=>true,'not-allLessons':()=>true,afterTutorial:()=>true,beforeTutorial:()=>false,beforeGuideMeeting:()=>false,'all:complete:2-school|complete:2-residential':()=>true,allLessons:()=>true,passed:()=>false,notPassed:()=>true});
assert.equal(data.lastDay,7);assert.equal(Object.keys(data.days).length,7);assert(!registry.day(8));assert(!data.days['1'].completion.terminal);assert(!data.days['7'].completion.terminal);
for(let day=1;day<=7;day++){
 const c=data.days[day];assert.equal(c.day,day);assert.equal(new Set(c.lessons).size,4);assert.equal(c.challenge.day,day);assert.equal(c.nextChapter,'day-'+(day+1));
 let save=M.createPersistenceAPI(data,{}).fresh(data),progress={complete:{},challenges:{}},permitted=true,passed=false;
 const route=M.createChapterRoutes({chapter:()=>c,progress:()=>progress,save:()=>save});
 const director=M.createChapterDirector({data,state:{day,progress},learning:{allowed:()=>permitted},progression:{passedChallenge:()=>passed},eligible:()=>true,dispatch:()=>{},triggers:()=>save.triggers,routeComplete:()=>route.complete()});
 assert(!director.complete());assert.equal(director.next(),null);assert(!director.challengeAvailable());progress.complete[day+"-school"]=true;assert(director.challengeAvailable());
 if(c.routes){assert(!route.select('normal'));assert(!route.select('skip'));save.triggers[c.routes.skip.event]=true;assert(route.select('skip'));assert(!director.complete());passed=true;assert(director.complete());const next=director.next();assert.equal(next?.day??null,day<7?day+1:null);passed=false;delete save.routes[c.id];for(const id of c.lessons)progress.complete[id]=true;assert(!route.select('normal'));save.triggers[c.routes.normal.opening]=true;save.triggers[c.routes.normal.finale]=true;assert(route.select('normal'));passed=true;assert(director.complete());}
 const active=registry.npcs(day,c.start.map);assert(M.RPGWorldData.walkable(data,c.start.map,c.start.x,c.start.y,active));
 for(const mapId of c.maps){const actors=registry.npcs(day,mapId),map=data.maps[mapId],queue=[map.spawn],seen=new Set([map.spawn.x+','+map.spawn.y]);for(let i=0;i<queue.length;i++)for(const[dx,dy]of Object.values(M.RPGWorldData.directions)){let p={x:queue[i].x+dx,y:queue[i].y+dy},key=p.x+','+p.y;if(!seen.has(key)&&M.RPGWorldData.walkable(data,mapId,p.x,p.y,actors)){seen.add(key);queue.push(p);}}for(const actor of actors)assert(Object.values(M.RPGWorldData.directions).some(([dx,dy])=>seen.has((actor.x+dx)+','+(actor.y+dy))),`${day} ${actor.id} unreachable`);for(const t of map.transitions)assert(seen.has(t.x+','+t.y));}
 if(day>1){assert(registry.event(c.routes.normal.finale));assert(registry.event(c.routes.skip.event));assert(registry.npcs(day,c.challenge.map).some(n=>n.id===c.challenge.npc));}
}
assert(!registry.npcs(5,'village').some(n=>n.characterId==='mina'));assert(!registry.npcs(6,'village').some(n=>n.characterId==='mina'));assert(registry.npcs(6,'hills').some(n=>n.characterId==='mina'));assert.equal(data.days[6].lessons.filter(id=>id.endsWith('nature')).length,1);
const malformed=structuredClone(data);malformed.days[6].mapEvents.hills=['missing'];assert.throws(()=>M.createRPGRegistry(malformed,{}));
const state={day:8,progress:{}},learning={allowed:()=>true,placeAccessible:()=>true},policy=M.createRPGProgression({state,data,learning,progression:{passedChallenge:()=>true}});assert.equal(policy.current(),7);assert(!learning.allowed(8));assert(!policy.lessonAllowed('8-school'));
console.log('PASS Week1 registry, all seven normal/skip policies, legitimate-pass advancement, identity schedules, Medina timing, Hills reachability and Day8 boundary');
// A future ordinary day, map and character register entirely as data; shipped cap remains seven.
const fixture=JSON.parse(readFileSync('docs/rpg/day8-registration.example.json','utf8'));assert.equal(fixture.active,false);
// Adapt historical example placements to the current village, preserving archived data.
fixture.days[8].start={...data.days[3].start};
for(const patch of fixture.npcSchedulePatches)for(const slot of patch.schedule)if(slot.map==='village'){slot.x=66;slot.y=18;}
const expanded=structuredClone(data);Object.assign(expanded.days,fixture.days);Object.assign(expanded.events,fixture.events);for(const patch of fixture.npcSchedulePatches)expanded.npcs.find(n=>n.id===patch.id).schedule.push(...patch.schedule);
expanded.maps.orchard={...structuredClone(expanded.maps.hills),name:'Fixture orchard'};expanded.days[8].maps.push('orchard');expanded.npcs.push({id:'guest',characterId:'guest',name:'Guest',sprite:'edris',event:'day8-opening',schedule:[{day:8,map:'orchard',x:4,y:12}]});expanded.days[8].activeNPCs.push('guest');M.validateChapters(expanded);const extended=M.createRPGRegistry(expanded,{});assert.equal(extended.npcs(8,'orchard')[0].characterId,'guest');assert(!policy.configured(8));
console.log('PASS inactive Day8, new map and new NPC registration without engine or educational changes');

expanded.lastDay=8;const futureState={day:7,progress:{}};const futureDirector=M.createChapterDirector({data:expanded,state:futureState,learning:{allowed:()=>true},progression:{passedChallenge:()=>true},eligible:()=>true,triggers:()=>({}),routeComplete:()=>true,dispatch:()=>{}});assert.equal(futureDirector.next().day,8,'Registered Day8 follows graduation without changing engine or Day7 terminal policy');
