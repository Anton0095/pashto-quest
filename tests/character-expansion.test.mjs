import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const M=createRequire(import.meta.url)('../work/rpg-model.cjs'),data=JSON.parse(readFileSync('content/RPG_WORLD.json'));
const ids=['bilal','zamir','nayab','sara','omar','afiya','sanaa'];
const registry=M.createRPGRegistry(data,{},c=>!c||!c.startsWith('flag:')&& !c.startsWith('complete:')&&!['allLessons','beforeTutorial','beforeGuideMeeting'].includes(c));
for(let day=1;day<=7;day++){
 const actors=registry.objects(day,'village');for(const id of ids)assert.equal(actors.filter(a=>a.characterId===id).length,1);
 assert.equal(actors.find(a=>a.id==='saleha').name,'Deena');assert.equal(data.npcs.filter(a=>a.characterId==='saleha').length,1);
 const activity=M.createActivities(data);let live=activity.resolve(actors,{map:'house',x:12,y:16,facing:'down'}),changes=new Set(),first=Object.fromEntries(live.map(a=>[a.id,{x:a.x,y:a.y}]));
 const player={map:'village',x:47,y:32,facing:'down'};
 for(let i=0;i<1400;i++){
  activity.tick(50,live,player);live=activity.resolve(actors,player);
  assert.equal(new Set(activity.occupancy(live).map(a=>a.x+','+a.y)).size,activity.occupancy(live).length,'No overlapping committed/reserved tiles');
  for(const a of live.filter(a=>a.activity)){assert(activity.safe(a,a));if(a.x!==first[a.id].x||a.y!==first[a.id].y)changes.add(a.id);}
  if(i%200===0){
   const occupied=activity.occupancy(live);for(const a of live)assert(M.findPath(data,{map:'village',...data.maps.village.spawn,facing:'down'},M.approachTiles(data,'village',a,occupied),occupied,data.days[day].maps),`${day}/${a.id} accessible during routines`);
   for(const t of data.maps.village.transitions.filter(t=>data.days[day].maps.includes(t.to)))assert(M.findPath(data,{map:'village',...data.maps.village.spawn,facing:'down'},[t],occupied,data.days[day].maps));
  }
 }
 assert.deepEqual([...changes].sort(),['afiya','nayab','omar','sanaa','sara','zamir']);
 const reserved=[{x:24,y:42},{x:27,y:44},{x:26,y:48}].find(p=>!activity.occupancy(live).some(a=>a.x===p.x&&a.y===p.y));assert(reserved);for(let i=0;i<100;i++){activity.tick(50,live,player,reserved);live=activity.resolve(actors,player);assert(!activity.occupancy(live).some(a=>a.x===reserved.x&&a.y===reserved.y),'NPCs respect the player destination');}
 const z=live.find(a=>a.id==='zamir');activity.select(z.id);const stopped=JSON.stringify(activity.snapshot().zamir);for(let i=0;i<100;i++)activity.tick(50,live,player);assert.equal(JSON.stringify(activity.snapshot().zamir),stopped,'Selected target does not escape');
 activity.select();activity.pause();const saved=activity.snapshot(),copy=M.createActivities(data,saved);copy.resolve(actors,player);assert.deepEqual(copy.snapshot(),saved,'Exact settled map/reload restoration');
 const old=M.createPersistenceAPI(data,{}).fresh(data);old.npcFlags.saleha=true;old.npcFlags.mina=true;old.flags.foo=true;old.activities=saved;
 const restored=M.createPersistenceAPI(data,{}).validate(data,old);assert.deepEqual(restored.activities,saved);assert(restored.npcFlags.saleha&&restored.npcFlags.mina);
 old.activities.zamir.x=-900;const safe=M.createActivities(data,M.createPersistenceAPI(data,{}).validate(data,old).activities);const safeZ=safe.resolve(actors,player).find(a=>a.id==='zamir');assert(safe.safe(safeZ,safeZ),'Bad optional routine tile recovers independently');
}
const without=M.createPersistenceAPI(data,{}).fresh(data);assert.equal(M.createPersistenceAPI(data,{}).validate(data,without).activities,undefined,'Valid pre-expansion world save needs no migration');
const names=vm.runInNewContext(readFileSync('src/character-portraits.js','utf8')+';currentCharacterName');const frozen={speaker:'Saleha',recipient:'Mina',scene:'Saleha and Mina walk together'};const exact=JSON.stringify(frozen);assert.equal(names(frozen.speaker),'Deena');assert.equal(names(frozen.scene),'Deena and Medina walk together');assert.equal(JSON.stringify(frozen),exact);
for(const id of ids){const event=data.events['ambient-'+id];assert(event.actions.every(a=>!['lesson','challenge'].includes(a.type)));assert(!event.once);}
assert.equal(data.days[6].openingEvent,'day6-opening');assert(data.events['day6-opening'].lines.join().includes('sister Medina'));assert(data.events['day6-finale'].lines.join().includes('Deena and Medina'));
console.log('PASS seven-day cast/routine simulation, reservations, protected access, selectable targets, settled reload, invalid routine recovery, stable identity and display-only frozen-name aliases');

// Supported education saves preserve old cast metadata and every generated proof byte.
const {runtime,reset,study,beginAttempt,plain}=await import('./runtime-fixture.mjs');
const t=runtime();reset(t);for(let d=1;d<=4;d++){for(const loc of t.content.zoneKeys)study(t,d,loc);if(d<4)t.progression.completeChallengeOnce(t.state.progress,d,15);}
const qs=beginAttempt(t,4);qs[0].speaker='Saleha';qs[0].recipient='Mina';qs[0].comment='Saleha and Mina welcome you.';
await t.storage.save();const stored=JSON.stringify(t.state.progress),cold=runtime();cold.backend.setItem('',stored);const loaded=cold.storage.load();assert.equal(cold.storage.problem,null);assert.equal(JSON.stringify(loaded),stored);assert.deepEqual(plain(loaded.activeChallenge.questions),plain(qs));
console.log('PASS supported pre-expansion assessment metadata and compiler proofs restore byte-for-byte without progress reset');

const actors=registry.objects(4,'village'),player={map:'village',x:73,y:51,facing:'down'},packed={};
for(const [i,id]of ['nayab','sara','omar','afiya'].entries()){const [dx,dy]=Object.values(M.RPGWorldData.directions)[i];packed[id]={...player,x:player.x+dx,y:player.y+dy,stop:0,turn:0,wait:1000};}
const recovery=M.createActivities(data,packed),live=recovery.resolve(actors,player);assert(Object.values(M.RPGWorldData.directions).some(([dx,dy])=>M.RPGWorldData.walkable(data,player.map,player.x+dx,player.y+dy,live)),'Even an artificially surrounding saved group yields an escape');
console.log('PASS surrounding optional routine state yields player escape without moving the player');
