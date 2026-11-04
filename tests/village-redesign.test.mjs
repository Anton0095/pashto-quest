import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const M=createRequire(import.meta.url)('../work/rpg-model.cjs');
const data=JSON.parse(readFileSync('content/RPG_WORLD.json','utf8')),map=data.maps.village,W=M.RPGWorldData;
assert.equal(map.tiles.length,64);assert.equal(map.tiles[0].length,96);assert(W.validate(data));
function reachable(start,actors=[]){const queue=[start],seen=new Set([`${start.x},${start.y}`]);for(let i=0;i<queue.length;i++)for(const [dx,dy]of Object.values(W.directions)){const x=queue[i].x+dx,y=queue[i].y+dy,k=`${x},${y}`;if(!seen.has(k)&&W.walkable(data,start.map,x,y,actors)){seen.add(k);queue.push({map:start.map,x,y});}}return seen;}
const seen=reachable({map:'village',...map.spawn});
for(const t of map.transitions){assert(seen.has(`${t.x},${t.y}`));assert(W.walkable(data,t.to,t.spawn.x,t.spawn.y));}
assert.equal(map.reservedExits.length,3);
for(const e of map.reservedExits){assert(seen.has(`${e.approach.x},${e.approach.y}`));assert(!map.transitions.some(t=>t.x===e.x&&t.y===e.y));assert(!M.findPath(data,{map:'village',...map.spawn},[e]));}
for(let y=0;y<64;y++)for(let x=0;x<96;x++){
 const tile=map.tiles[y][x];if(W.walkable(data,'village',x,y))assert(seen.has(`${x},${y}`),'No disconnected walkable pocket');if('wtbBRX'.includes(tile))assert(!W.walkable(data,'village',x,y));
 if(tile==='D')assert(seen.has(`${x},${y}`),'Dock connected to land');
}
// All schedules, including conditional relocations, must have safe approach paths.
for(const npc of data.npcs)for(const slot of npc.schedule){
 const actor={...npc,...slot};assert(W.walkable(data,slot.map,slot.x,slot.y));
 assert(M.findPath(data,{map:slot.map,...data.maps[slot.map].spawn},M.approachTiles(data,slot.map,actor,[actor]),[actor],data.days[slot.day].maps),`${npc.id}/${slot.day}/${slot.condition} unreachable`);
}
// Existing schema-1 world state recovers deterministically; unrelated records survive.
const P=M.createPersistenceAPI(data,{}),raw={schemaVersion:1,chapter:'day-6',appearance:'feminine',flags:{metGuide:true},triggers:{welcome:true},routes:{'day-6':'skip'},position:{map:'village',x:75,y:13,facing:'up'}};
for(const [x,y]of [[46,0],[32,24],[1,1]])assert.deepEqual(P.validate(data,{...raw,position:{map:'village',x,y}}).position,{map:'village',...map.spawn,facing:'down'});
const recovered=P.validate(data,raw);assert.deepEqual(recovered.position,{map:'village',...map.spawn,facing:'down'});for(const k of ['chapter','appearance','flags','triggers','routes'])assert.deepEqual(recovered[k],raw[k]);
assert.deepEqual(P.validate(data,{...raw,position:{map:'house',x:12,y:15,facing:'up'}}).position,{map:'house',x:12,y:15,facing:'up'});
console.log('PASS 96×64 village: districts, every schedule, dock, water/solid collision, entrances, reserved boundaries and schema-1 recovery');
