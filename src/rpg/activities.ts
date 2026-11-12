import type {Actor,ActivityState,Point,Position,WorldData} from './types';
import {findPath,facingToward} from './movement';
import {directions,walkable} from './world-data';

const same=(a:Point,b:Point)=>a.x===b.x&&a.y===b.y;
const near=(a:Point,b:Point,r=2)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y)<=r;
/** Small bounded routines driven exclusively by VillageScene.update. No timers or idle pathfinding. */
export function createActivities(data:WorldData,saved:Record<string,ActivityState>={}) {
  const states:Record<string,ActivityState>=JSON.parse(JSON.stringify(saved));
  const flights=new Map<string,{from:Point;to:Point;elapsed:number;duration:number}>();
  const paths=new Map<string,Point[]>();let selected:string|undefined;
  const protectedByMap=Object.fromEntries(Object.entries(data.maps).map(([id,map])=>[id,[map.spawn,...map.transitions,...Object.values(data.maps).flatMap(m=>m.transitions.filter(t=>t.to===id).map(t=>t.spawn)),...(map.reservedExits??[]).flatMap(e=>[e,e.approach]),...data.objects.filter(o=>o.map===id),...data.npcs.filter(n=>!n.activity).flatMap(n=>[...(n.defaultLocation?[n.defaultLocation]:[]),...n.schedule]).filter(s=>s.map===id)]]));
  function safe(actor:Actor,p:Point):boolean {
    const zone=actor.activity?.zone;
    if(!zone||p.x<zone.x||p.x>=zone.x+zone.w||p.y<zone.y||p.y>=zone.y+zone.h||!walkable(data,actor.map,p.x,p.y))return false;
    return !protectedByMap[actor.map].some(p2=>near(p,p2));
  }
  function resolve(actors:Actor[],player:Position):Actor[] {
    const occupied=actors.map(a=>a.activity&&states[a.id]?{...a,...states[a.id]}:a);
    let trapped=Object.values(directions).every(([dx,dy])=>!walkable(data,player.map,player.x+dx,player.y+dy,occupied));
    const taken:Point[]=[];
    return actors.map(actor=>{
      if(!actor.activity)return actor;
      let s=states[actor.id];
      if(!s||s.map!==actor.map||!safe(actor,s)||taken.some(p=>same(p,s))||same(player,s)&&player.map===actor.map||trapped&&near(player,s,1)&&player.map===actor.map){
        // Current saves without activity state use the authored placement. Occupied restores
        // choose another safe routine tile, never move the player or educational state.
        const z=actor.activity.zone,candidates=[actor,...actor.activity.stops];
        for(let y=z.y;y<z.y+z.h;y++)for(let x=z.x;x<z.x+z.w;x++)candidates.push({x,y});
        const p=candidates.find(p=>safe(actor,p)&&!taken.some(t=>same(t,p))&&!actors.some(a=>!a.activity&&same(a,p))&&!(player.map===actor.map&&near(player,p,1)));
        if(!p)return actor;
        if(s?.map===player.map&&near(player,s,1))trapped=false;
        s=states[actor.id]={map:actor.map,x:p.x,y:p.y,facing:'down',stop:0,wait:actor.activity.idleMs+(actor.id.charCodeAt(0)%7)*173,turn:0};
        flights.delete(actor.id);paths.delete(actor.id);
      }
      taken.push(s);return {...actor,...s};
    });
  }
  function pause(id?:string):void {if(id){flights.delete(id);paths.delete(id);}else{flights.clear();paths.clear();}}
  function select(id?:string):void {selected=id;if(id)pause(id);}
  function occupancy(actors:Actor[]):Actor[]{const live=actors.map(a=>a.activity&&states[a.id]?{...a,...states[a.id]}:a);return [...live,...live.flatMap(a=>{const f=flights.get(a.id);return f?[{...a,...f.to,id:a.id+'-reservation'}]:[];})];}
  function tick(delta:number,actors:Actor[],player:Position,playerTarget?:Point):void {
    for(const actor of actors){
      if(!actor.activity)continue;const s=states[actor.id];if(!s)continue;
      if(selected===actor.id||near(player,s,1)){pause(actor.id);continue;}
      const flight=flights.get(actor.id);
      if(flight){
        flight.elapsed+=Math.min(delta,50);
        if(flight.elapsed>=flight.duration){s.x=flight.to.x;s.y=flight.to.y;flights.delete(actor.id);paths.get(actor.id)?.shift();}
        continue;
      }
      if(s.wait>0){s.wait=Math.max(0,s.wait-Math.min(delta,50));continue;}
      const blockers=occupancy(actors).filter(a=>a.id!==actor.id);
      blockers.push({...actor,id:'player',...player});if(playerTarget)blockers.push({...actor,id:'player-destination',...playerTarget});
      let path=paths.get(actor.id);
      if(!path?.length){
        s.turn=(s.turn+1)%1000000;s.stop=(s.stop+1+(s.turn%5===0?1:0))%actor.activity.stops.length;
        const goal=actor.activity.stops[s.stop];
        // Paths are constrained to a public activity zone and exclude protected access.
        path=findPath(data,{...s},[goal],blockers,[],p=>safe(actor,p))??[];
        paths.set(actor.id,path);s.wait=actor.activity.idleMs+(s.turn%3)*291;
        if(!path.length)continue;
        // The pause belongs at the destination, not before every grid step.
        s.wait=0;
      }
      const next=path[0];
      if(near(player,next,1)||playerTarget&&near(playerTarget,next,1)||!safe(actor,next)||blockers.some(a=>a.map===actor.map&&same(a,next))){paths.delete(actor.id);s.wait=600;continue;}
      s.facing=facingToward(s,next);flights.set(actor.id,{from:{x:s.x,y:s.y},to:next,elapsed:0,duration:actor.activity.stepMs*(s.turn%3===0?.8:1)});
      if(path.length===1)s.wait=actor.activity.idleMs+(s.turn%3)*291;
    }
  }
  function visual(actor:Actor):Point&{moving:boolean}{const f=flights.get(actor.id);if(!f)return {x:actor.x,y:actor.y,moving:false};const t=Math.min(1,f.elapsed/f.duration);return {x:f.from.x+(f.to.x-f.from.x)*t,y:f.from.y+(f.to.y-f.from.y)*t,moving:true};}
  return {resolve,tick,pause,select,visual,occupancy,safe,reset(){pause();paths.clear();selected=undefined;for(const id of Object.keys(states))delete states[id];},snapshot:()=>JSON.parse(JSON.stringify(states)) as Record<string,ActivityState>};
}
