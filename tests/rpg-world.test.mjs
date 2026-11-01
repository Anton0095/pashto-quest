import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const data=JSON.parse(readFileSync('tests/fixtures/rpg-day1.json','utf8'));
const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);
const M=require('../work/rpg-model.cjs'),W=M.RPGWorldData,P=M.createPersistenceAPI(data,{});
const registry=M.createRPGRegistry(data,{beforeTutorial:()=>false,afterTutorial:()=>true,passed:()=>false});
assert(W.validate(data));
const layered=structuredClone(data);layered.maps.village.collision=layered.maps.village.tiles.map(row=>'0'.repeat(row.length));layered.maps.village.collision[19]='0'.repeat(22)+'1'+'0'.repeat(29);assert(W.validate(layered));assert(!W.walkable(layered,'village',22,19),'Declarative overlay blocks an otherwise walkable tile');
for(const invalid of [{map:'missing',x:1,y:1},{map:'village',x:-1,y:4},{map:'village',x:35,y:5},{map:'village',x:NaN,y:2}]){const p=W.recover(data,invalid);assert(W.walkable(data,p.map,p.x,p.y));}
const bad=P.validate(data,{schemaVersion:1,position:{map:'future',x:999,y:null},flags:{fine:true,bad:3},appearance:'wizard'});assert.equal(bad.appearance,'neutral');assert.equal(bad.flags.bad,undefined);assert(W.walkable(data,bad.position.map,bad.position.x,bad.position.y));
assert.equal(registry.day(2),null);
// Reachability of all lesson NPC approaches, every entrance, and safe spawns.
for(const map of Object.keys(data.maps)){
 const npcs=registry.npcs(1,map),spawn=data.maps[map].spawn,queue=[spawn],seen=new Set([spawn.x+','+spawn.y]);
 for(let i=0;i<queue.length;i++)for(const [dx,dy]of Object.values(W.directions)){const x=queue[i].x+dx,y=queue[i].y+dy,k=x+','+y;if(!seen.has(k)&&W.walkable(data,map,x,y,npcs)){seen.add(k);queue.push({x,y});}}
 for(const n of npcs)assert(Object.values(W.directions).some(([dx,dy])=>seen.has((n.x+dx)+','+(n.y+dy))),n.id+' unreachable');
 for(const t of data.maps[map].transitions)assert(seen.has(t.x+','+t.y),'unreachable transition');
}
console.log('PASS RPG world: map definitions, schema recovery, registry/day boundary, full reachability');
