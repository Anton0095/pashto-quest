import type {Actor,Direction,Point,Position,WorldData} from './types';
import {directions,walkable} from './world-data';

const key=(p:Point)=>p.x+','+p.y;
const distance=(a:Point,b:Point)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
/** A* over the same grid and actor occupancy used by the Phaser stepper. */
export function findPath(data:WorldData,start:Position,goals:Point[],actors:Actor[]=[],allowedMaps?:string[],permit?:(p:Point)=>boolean):Point[]|null {
  const map=data.maps[start.map];
  const permitted=(p:Point)=>(!permit||permit(p))&&walkable(data,start.map,p.x,p.y,actors)&&!map.transitions.some(t=>t.x===p.x&&t.y===p.y&&allowedMaps&&!allowedMaps.includes(t.to));
  const targets=goals.filter(permitted);if(!targets.length)return null;
  const heuristic=(p:Point)=>Math.min(...targets.map(g=>distance(p,g)));
  const open:Point[]=[start];const cost=new Map([[key(start),0]]),previous=new Map<string,Point>(),closed=new Set<string>();
  while(open.length){
    open.sort((a,b)=>(cost.get(key(a))!+heuristic(a))-(cost.get(key(b))!+heuristic(b)));
    const p=open.shift()!,id=key(p);if(closed.has(id))continue;
    if(targets.some(g=>key(g)===id)){
      const path:Point[]=[];let cursor:Point=p;
      while(key(cursor)!==key(start)){path.unshift({x:cursor.x,y:cursor.y});cursor=previous.get(key(cursor))!;}
      return path;
    }
    closed.add(id);
    // Entrances terminate a route, rather than allowing a path through another map.
    if(id!==key(start)&&map.transitions.some(t=>t.x===p.x&&t.y===p.y))continue;
    for(const [dx,dy]of Object.values(directions)){
      const next={x:p.x+dx,y:p.y+dy},nextId=key(next),score=cost.get(id)!+1;
      if(!permitted(next)||closed.has(nextId)||score>=(cost.get(nextId)??Infinity))continue;
      cost.set(nextId,score);previous.set(nextId,p);open.push(next);
    }
  }
  return null;
}

/** A clear orthogonal sight line is required even for actors with range > 1. */
export function canInteract(data:WorldData,p:Position,actor:Actor,actors:Actor[]=[]):boolean {
  const d=distance(p,actor);
  if(p.map!==actor.map||d<1||d>(actor.interactionRange??1)||p.x!==actor.x&&p.y!==actor.y)return false;
  const dx=Math.sign(actor.x-p.x),dy=Math.sign(actor.y-p.y);
  for(let i=1;i<d;i++)if(!walkable(data,p.map,p.x+dx*i,p.y+dy*i,actors))return false;
  return true;
}
export function approachTiles(data:WorldData,map:string,actor:Actor,actors:Actor[]):Point[]{
  const result:Point[]=[];
  for(const [dx,dy]of Object.values(directions))for(let r=1;r<=(actor.interactionRange??1);r++){
    const p={map,x:actor.x+dx*r,y:actor.y+dy*r,facing:'down' as const};
    if(walkable(data,map,p.x,p.y,actors)&&canInteract(data,p,actor,actors))result.push(p);
  }
  return result;
}
export function facingToward(p:Point,target:Point):Direction {
  return target.x>p.x?'right':target.x<p.x?'left':target.y>p.y?'down':'up';
}

/** Manual and automatic instructions both call the one animated Phaser step. */
export function createMovementController({data,position,actors,allowedMaps,step,moving,arrived}: {
  data:WorldData;position():Position;actors():Actor[];allowedMaps():string[];
  step(direction:Direction):boolean;moving():boolean;arrived(actor:Actor):void;
}){
  let route:Point[]|null=null,targetId:string|undefined,mapId='',pendingDirection:Direction|undefined;
  function cancel(){route=null;targetId=undefined;pendingDirection=undefined;}
  function navigate(target:Point,actor?:Actor):boolean {
    cancel();const p=position(),occupants=actors();mapId=p.map;
    // A moving tween commits its current tile first; tick then revalidates/replans.
    route=findPath(data,p,actor?approachTiles(data,p.map,actor,occupants):[target],occupants,allowedMaps());
    if(route===null)return false;targetId=actor?.id;return true;
  }
  function tick(){
    if(moving())return;
    if(pendingDirection){const direction=pendingDirection;pendingDirection=undefined;step(direction);return;}
    if(!route)return;
    const p=position();if(p.map!==mapId){cancel();return;}
    const actor=targetId?actors().find(a=>a.id===targetId):undefined;
    if(targetId&&!actor){cancel();return;}
    while(route.length&&key(route[0])===key(p))route.shift();
    if(!route.length){cancel();if(actor&&canInteract(data,p,actor,actors()))arrived(actor);return;}
    if(distance(p,route[0])!==1){
      const goal=actor?approachTiles(data,p.map,actor,actors()):[route[route.length-1]];
      route=findPath(data,p,goal,actors(),allowedMaps());if(!route?.length)return;
    }
    if(!step(facingToward(p,route[0])))cancel();
  }
  return {navigate,tick,cancel,manual(direction:Direction){cancel();if(moving()){pendingDirection=direction;return true;}return step(direction);},get routing(){return route!==null;}};
}
