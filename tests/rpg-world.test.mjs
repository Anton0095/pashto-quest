import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const data=JSON.parse(readFileSync('content/RPG_WORLD.json','utf8'));
const {W,I,P,registry}=vm.runInNewContext(['rpg-world-engine','rpg-content','rpg-persistence'].map(n=>readFileSync('src/'+n+'.js','utf8')).join('\n')+`;({W:RPGWorldEngine,I:RPGInteractionEngine,P:RPGPersistence,registry:createRPGRegistry(RPG_WORLD_DATA,{beforeTutorial:()=>false,afterTutorial:()=>true,passed:()=>false})})`,{RPG_WORLD_DATA:data});
assert(W.validate(data));
for(const [direction,dx,dy]of[['up',0,-1],['down',0,1],['left',-1,0],['right',1,0]]){const r=W.move(data,{map:'village',x:24,y:19,facing:'down'},direction);assert(r.moved);assert.equal(r.position.x,24+dx);assert.equal(r.position.y,19+dy);}
assert(!W.move(data,{map:'village',x:31,y:4},'right').moved);
assert(!W.move(data,{map:'village',x:9,y:8},'up').transition,'Blocked roof is not an entrance');
assert(!W.move(data,{map:'village',x:10,y:11},'up',registry.npcs(1,'village')).moved);
let r=W.move(data,{map:'village',x:24,y:16},'up');assert.equal(r.position.map,'library');
r=W.move(data,r.position,'down');assert.equal(r.position.map,'village');assert.equal(r.position.y,16);
assert.equal(I.nearby({map:'village',x:10,y:11,facing:'up'},registry.npcs(1,'village')).id,'jan-home');
assert.equal(I.nearby({map:'village',x:10,y:12,facing:'up'},registry.npcs(1,'village')),null);
assert.equal(W.camera(data,{map:'village',x:0,y:0},512,320).x,0);
assert.equal(W.camera(data,{map:'village',x:51,y:37},512,320).x,320);
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
console.log('PASS RPG world: movement, terrain/NPC collision, entrances/exits, camera, interaction range, schema recovery, registry/day boundary, full reachability');
