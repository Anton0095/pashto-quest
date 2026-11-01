/* Pure grid simulation. No DOM, curriculum, scores, clock or persistence. */
const RPGWorldEngine = (() => {
  const directions = {up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  function validate(data) {
    for (const [id,map] of Object.entries(data.maps)) {
      const width=map.tiles[0]?.length;
      if (!width || !map.tiles.length || map.tiles.some(row=>row.length!==width || [...row].some(t=>!data.tiles[t]))) throw Error('Invalid tilemap: '+id);
      if (!walkable(data,id,map.spawn.x,map.spawn.y)) throw Error('Blocked spawn: '+id);
      for (const t of map.transitions || []) if (!walkable(data,id,t.x,t.y) || !walkable(data,t.to,t.spawn.x,t.spawn.y)) throw Error('Invalid transition: '+id);
    }
    return true;
  }
  function walkable(data,map,x,y,npcs=[]) {
    const tile=data.maps[map]?.tiles[y]?.[x];
    return Number.isInteger(x) && Number.isInteger(y) && !!data.tiles[tile]?.walkable && !npcs.some(n=>n.map===map && n.x===x && n.y===y);
  }
  function recover(data,position,npcs=[]) {
    if (position && walkable(data,position.map,position.x,position.y,npcs)) return {...position,facing:directions[position.facing]?position.facing:'down'};
    const map=data.maps[position?.map] ? position.map : data.start.map;
    const spawn=data.maps[map].spawn;
    if (walkable(data,map,spawn.x,spawn.y,npcs)) return {map,...spawn,facing:'down'};
    for(let y=0;y<data.maps[map].tiles.length;y++) for(let x=0;x<data.maps[map].tiles[0].length;x++) if(walkable(data,map,x,y,npcs)) return {map,x,y,facing:'down'};
    throw Error('No safe tile in '+map);
  }
  function move(data,position,direction,npcs=[]) {
    const delta=directions[direction];
    if (!delta) return {position,moved:false};
    const next={...position,facing:direction,x:position.x+delta[0],y:position.y+delta[1]};
    if (!walkable(data,next.map,next.x,next.y,npcs)) return {position:{...position,facing:direction},moved:false};
    const entrance=data.maps[next.map].transitions?.find(t=>t.x===next.x && t.y===next.y);
    if(entrance) return {position:recover(data,{map:entrance.to,...entrance.spawn,facing:direction},npcs),moved:true,transition:true};
    return {position:next,moved:true};
  }
  function camera(data,position,width,height,tile=16) {
    const map=data.maps[position.map];
    return {x:Math.max(0,Math.min(map.tiles[0].length*tile-width,(position.x+.5)*tile-width/2)),y:Math.max(0,Math.min(map.tiles.length*tile-height,(position.y+.5)*tile-height/2))};
  }
  return {directions,validate,walkable,recover,move,camera};
})();
const RPGInteractionEngine = {
  nearby(position,objects) {
    const [dx,dy]=RPGWorldEngine.directions[position.facing] || [0,1];
    return objects.filter(o=>o.map===position.map && Math.abs(o.x-position.x)+Math.abs(o.y-position.y)===1)
      .sort((a,b)=>(b.x===position.x+dx && b.y===position.y+dy)-(a.x===position.x+dx && a.y===position.y+dy))[0] || null;
  },
};
