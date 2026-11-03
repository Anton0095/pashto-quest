import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const M=createRequire(import.meta.url)('../work/rpg-model.cjs');
const data=JSON.parse(readFileSync('content/RPG_WORLD.json','utf8'));
const registry=M.createRPGRegistry(data,{'not-complete:6-nature':()=>true,'not-complete:7-school':()=>true,'not-allLessons':()=>true,afterTutorial:()=>true,beforeTutorial:()=>false,beforeGuideMeeting:()=>false});
// Every scheduled character on every day has a collision-safe route to a clear interaction tile.
for(let day=1;day<=7;day++)for(const map of data.days[day].maps){
  const actors=registry.objects(day,map),start={map,...data.maps[map].spawn,facing:'down'};
  for(const actor of actors){
    const goals=M.approachTiles(data,map,actor,actors),path=M.findPath(data,start,goals,actors,data.days[day].maps);
    assert(path,`${day}/${map}/${actor.id} unreachable`);let previous=start;
    for(const tile of path){assert.equal(Math.abs(tile.x-previous.x)+Math.abs(tile.y-previous.y),1);assert(M.RPGWorldData.walkable(data,map,tile.x,tile.y,actors));previous=tile;}
    assert(M.canInteract(data,{...previous,map,facing:'down'},actor,actors));
  }
}
const fixture={...data,maps:{room:{tiles:['ggggg','gtggg','ggggg','ggggg'],spawn:{x:0,y:0},transitions:[]}}};
let p={map:'room',x:0,y:0,facing:'down'},moving=false,arrivals=0,steps=[];
const actor={id:'friend',map:'room',x:2,y:1,name:'Friend',event:'welcome',interactionRange:2};
assert(!M.canInteract(fixture,{...p,x:0,y:1},actor),'No interaction through tree/wall');
assert(!M.canInteract(fixture,p,{...actor,x:1,y:1}),'No diagonal reach through a corner');
assert.equal(M.findPath(fixture,p,[{x:1,y:1}]),null,'Blocked tile fails safely');
assert.equal(M.findPath(fixture,p,[{x:-1,y:0}]),null,'Bounds fail safely');
const controller=M.createMovementController({data:fixture,position:()=>p,actors:()=>[actor],allowedMaps:()=>['room'],moving:()=>moving,
  step(dir){const[dx,dy]=M.RPGWorldData.directions[dir];if(!M.RPGWorldData.walkable(fixture,p.map,p.x+dx,p.y+dy,[actor]))return false;p={...p,x:p.x+dx,y:p.y+dy,facing:dir};steps.push(dir);return true;},arrived(){arrivals++;}});
assert(controller.navigate(actor,actor));for(let i=0;i<20;i++)controller.tick();assert.equal(arrivals,1);assert(!controller.routing);
assert(controller.navigate({x:4,y:3}));controller.manual('left');assert(!controller.routing,'Directional input overrides route');
for(let i=0;i<50;i++)assert(controller.navigate(i%2?{x:0,y:0}:{x:4,y:3}));
for(let i=0;i<20;i++)controller.tick();assert.equal(p.x,0);assert.equal(p.y,0,'Latest instruction wins');
controller.navigate({x:4,y:3});moving=true;controller.tick();assert.equal(p.x,0,'No second step during a tween');moving=false;controller.cancel();controller.tick();assert.equal(p.x,0);
controller.navigate({x:4,y:3});p={...p,map:'elsewhere'};controller.tick();assert(!controller.routing,'Map changes cancel route');
const locked=structuredClone(fixture);locked.maps.room.transitions=[{x:1,y:0,to:'locked',spawn:{x:0,y:0}}];
assert.equal(M.findPath(locked,{...p,map:'room',x:0,y:0},[{x:1,y:0}],[],['room']),null,'Locked transitions are excluded');
console.log('PASS A*, all Week1 actor approaches, collisions, boundaries, line of sight, interruption, latest input, tween gating and locked transitions');
