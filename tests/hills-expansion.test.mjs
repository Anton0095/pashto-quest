import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runtime,reset,study,plain,beginAttempt} from './runtime-fixture.mjs';
const M=createRequire(import.meta.url)('../work/rpg-model.cjs'),data=JSON.parse(readFileSync('content/RPG_WORLD.json'));
M.RPGWorldData.validate(data);M.validateChapters(data);
const flag='day6-hills-invited',world=M.createPersistenceAPI(data,{}).fresh(data),t=runtime();reset(t);
function eligible(c){
 if(!c)return true;if(c.startsWith('all:'))return c.slice(4).split('|').every(eligible);
 if(c.startsWith('flag:'))return !!world.flags[c.slice(5)];if(c.startsWith('not-flag:'))return !world.flags[c.slice(9)];
 if(c.startsWith('complete:'))return !!t.state.progress.complete[c.slice(9)];if(c.startsWith('not-complete:'))return !t.state.progress.complete[c.slice(13)];
 if(c.startsWith('lesson:'))return true;return c==='afterTutorial';
}
const registry=M.createRPGRegistry(data,{},eligible),map=data.maps.hills;
assert.equal(map.condition,'afterTutorial');assert.equal(t.content.zoneKeys.length,4);
const north=data.maps.village.transitions.find(t=>t.to==='hills');assert.deepEqual([north.x,north.y],[46,0]);assert.equal(data.maps.village.transitions.filter(t=>t.to==='hills').length,1);
assert.deepEqual(map.transitions,[{x:32,y:47,to:'village',spawn:{x:46,y:2}}]);
assert.equal(data.maps.village.reservedExits.some(e=>e.id==='north'),false);
assert(!M.RPGWorldData.walkable(data,'hills',63,19));assert(map.reservedExits.some(e=>e.id==='east'));assert(!map.transitions.some(t=>t.to!=='village'));
assert.equal(map.buildings.length,0);for(const kind of ['tree','shrub','bird','goat','sheep'])assert(map.scenery.some(s=>s.kind===kind));
const walkable=[];for(let y=0;y<map.tiles.length;y++)for(let x=0;x<map.tiles[0].length;x++)if(M.RPGWorldData.walkable(data,'hills',x,y))walkable.push({x,y});
// BFS checks every ordinary walkable tile, including recovery positions, without a second movement engine.
const start={map:'hills',...map.spawn,facing:'up'},seen=new Set([`${start.x},${start.y}`]),queue=[start];
for(let i=0;i<queue.length;i++)for(const [dx,dy]of Object.values(M.RPGWorldData.directions)){
 const p={x:queue[i].x+dx,y:queue[i].y+dy},key=`${p.x},${p.y}`;
 if(!seen.has(key)&&M.RPGWorldData.walkable(data,'hills',p.x,p.y)){seen.add(key);queue.push(p);}
}
assert.equal(seen.size,walkable.length,'no disconnected exploration/recovery pockets');
for(let day=1;day<=7;day++){
 assert(data.days[day].maps.includes('hills'));assert(M.findPath(data,{map:'village',...data.maps.village.spawn,facing:'up'},[north],registry.objects(day,'village'),data.days[day].maps));
 if(day<6)assert(!registry.npcs(day,'hills').some(n=>['saleha','mina'].includes(n.characterId)));
}
assert(registry.npcs(6,'village').some(n=>n.characterId==='saleha'));assert(!registry.npcs(6,'village').some(n=>n.characterId==='mina'));assert(!registry.npcs(6,'hills').length);
const savedBefore=JSON.stringify(t.state.progress),story=M.createStoryDirector({value:()=>world,event:registry.event,eligible,changed(){}});
story.open('day6-opening');assert(!registry.event('day6-opening').actions.some(a=>a.type==='lesson'));assert(story.choose(data.events['day6-opening'].actions.find(a=>a.type==='flag')));
assert(world.flags[flag]);assert(!registry.npcs(6,'village').some(n=>['saleha','mina'].includes(n.characterId)));
const sisters=registry.npcs(6,'hills').filter(n=>['saleha','mina'].includes(n.characterId));assert.equal(sisters.length,2);assert.equal(new Set(sisters.map(n=>n.characterId)).size,2);
const ambiguous=structuredClone(data);ambiguous.npcs.find(n=>n.id==='saleha').schedule.filter(s=>s.day===6).forEach(s=>delete s.condition);const one=M.createRPGRegistry(ambiguous,{},eligible);assert.equal(data.days[6].maps.flatMap(map=>one.npcs(6,map)).filter(n=>n.characterId==='saleha').length,1,'one eligible schedule per identity across maps');
for(const n of sisters){assert(M.findPath(data,start,M.approachTiles(data,'hills',n,sisters),sisters,data.days[6].maps));assert(registry.event(n.event).actions.some(a=>a.type==='lesson'&&a.lessonId==='6-nature'));}
assert.deepEqual(data.events['day6-arrival'].participants,['saleha','mina']);assert(data.events['day6-arrival'].messages[0].text.includes('younger sister Medina'));
story.open('day6-arrival');story.choose(data.events['day6-arrival'].actions.find(a=>a.type==='explore'));assert.equal(story.open('day6-arrival'),undefined,'acknowledged sister introduction is once-only');
assert.equal(JSON.stringify(t.state.progress),savedBefore,'world navigation/invitation/intro have no educational writes');
const restored=M.createPersistenceAPI(data,{}).validate(data,plain(world));assert(restored.flags[flag]);assert(restored.triggers['day6-arrival']);
for(let d=1;d<6;d++)t.progression.completeChallengeOnce(t.state.progress,d,t.progression.getChallengeSpec(d).passCount);
study(t,6,'nature');assert.equal(registry.npcs(6,'hills').filter(n=>['saleha','mina'].includes(n.characterId)).length,2,'lesson completion does not move either sister back to Lake/Home');
assert(registry.event('day6-hills').actions.some(a=>a.type==='lesson'&&a.lessonId==='6-residential'));
assert.deepEqual(plain(t.progression.getChallengeSpec(6)).questionCount,15);assert.equal(t.progression.getChallengeSpec(6).passCount,12);
const q=plain(beginAttempt(t,6));t.storage.save();assert.equal(t.storage.problem,null);assert.deepEqual(plain(t.storage.load().activeChallenge.questions),q);
assert.equal(data.days[6].challenge.map,'hills');assert.equal(data.days[6].guidance.character,'Deena');assert.deepEqual(data.days[6].start,M.dailySpawn(data));
console.log(`PASS Hills: ${walkable.length} reachable tiles, north/south transitions, eastern scree, seven-day access, incidental wildlife; invitation relocation/unique sisters, shared lesson, once-only introduction/reload, zero world rewards, preserved Day6 challenge/frozen snapshot`);
