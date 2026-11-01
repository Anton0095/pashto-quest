import type {Actor,Direction,Position,WorldData} from './types';
/** Validation/recovery only. Phaser owns live movement, collision and cameras. */
export const directions:Record<Direction,[number,number]>={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
export function walkable(data:WorldData,map:string,x:number,y:number,npcs:Actor[]=[]):boolean {
  const tile=data.maps[map]?.tiles?.[y]?.[x];
  return Number.isInteger(x)&&Number.isInteger(y)&&!!data.tiles[tile]?.walkable&&data.maps[map]?.collision?.[y]?.[x]!=='1'&&!npcs.some(n=>n.map===map&&n.x===x&&n.y===y);
}
export function recover(data:WorldData,raw:unknown,npcs:Actor[]=[]):Position {
  const p=raw as Partial<Position>|null;
  if(p&&typeof p.map==='string'&&typeof p.x==='number'&&typeof p.y==='number'&&walkable(data,p.map,p.x,p.y,npcs))return {map:p.map,x:p.x,y:p.y,facing:p.facing&&directions[p.facing]?p.facing:'down'};
  const map=p&&typeof p.map==='string'&&Object.prototype.hasOwnProperty.call(data.maps,p.map)?p.map:data.start.map;
  const spawn=data.maps[map].spawn;
  if(walkable(data,map,spawn.x,spawn.y,npcs))return {map,...spawn,facing:'down'};
  for(let y=0;y<data.maps[map].tiles.length;y++)for(let x=0;x<data.maps[map].tiles[0].length;x++)if(walkable(data,map,x,y,npcs))return {map,x,y,facing:'down'};
  throw Error('No safe tile: '+map);
}
export function validate(data:WorldData):true {
  for(const [id,map]of Object.entries(data.maps)){
    const width=map.tiles[0]?.length;
    if(!width||map.tiles.some(row=>row.length!==width||[...row].some(t=>!data.tiles[t])))throw Error('Invalid map: '+id);
    if(map.collision&&(map.collision.length!==map.tiles.length||map.collision.some(row=>row.length!==width||/[^01]/.test(row))))throw Error('Invalid collision layer: '+id);
    if(!walkable(data,id,map.spawn.x,map.spawn.y))throw Error('Blocked spawn: '+id);
    for(const t of map.transitions)if(!walkable(data,id,t.x,t.y)||!walkable(data,t.to,t.spawn.x,t.spawn.y))throw Error('Invalid transition: '+id);
  }
  return true;
}
export const RPGWorldData={directions,walkable,recover,validate};
