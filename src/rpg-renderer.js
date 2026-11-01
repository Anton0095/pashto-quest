/* Original pixel artwork drawn from small integer rectangles; no external artwork. */
function createRPGRenderer(canvas,data) {
  const ctx=canvas.getContext('2d',{alpha:false}), tile=16;
  ctx.imageSmoothingEnabled=false;
  const rect=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
  function person(x,y,kind,facing,step=0) {
    const colors={elder:['#f0e5ce','#f7f0d9'],saleha:['#316f74','#eec970'],edris:['#9a613b','#e4d1aa'],hameed:['#74618c','#d6bfdf'],masculine:['#447b9b','#d7e8e6'],feminine:['#ae6380','#f0c4ab'],neutral:['#6e7e50','#dbe2bd']};
    const [robe,head]=colors[kind]||colors.neutral;
    rect(x+3,y+13,11,3,'#344c453f');rect(x+5,y+5,7,8,robe);
    rect(x+5,y+1,7,5,'#bb895e');rect(x+4,y,9,3,head);
    if(['saleha','hameed','feminine'].includes(kind)){rect(x+3,y+1,2,9,head);rect(x+11,y+1,2,9,head);}
    rect(x+4,y+8,2,4,robe);rect(x+12,y+8,2,4,robe);
    rect(x+5,y+13+(step%2),3,2,'#3e3b39');rect(x+10,y+13-(step%2),3,2,'#3e3b39');
    if(facing!=='up') {rect(x+(facing==='left'?5:9),y+4,1,1,'#2f3232');if(facing==='down')rect(x+6,y+4,1,1,'#2f3232');}
    if(kind==='elder')rect(x+6,y+6,5,3,'#eee9d9');
  }
  function draw(position,npcs,appearance,nearby,step=0) {
    const camera=RPGWorldEngine.camera(data,position,canvas.width,canvas.height), map=data.maps[position.map];
    rect(0,0,canvas.width,canvas.height,'#293d36');ctx.save();ctx.translate(-Math.floor(camera.x),-Math.floor(camera.y));
    const x0=Math.max(0,Math.floor(camera.x/tile)),y0=Math.max(0,Math.floor(camera.y/tile));
    for(let y=y0;y<Math.min(map.tiles.length,y0+canvas.height/tile+2);y++)for(let x=x0;x<Math.min(map.tiles[0].length,x0+canvas.width/tile+2);x++) {
      const t=map.tiles[y][x],px=x*tile,py=y*tile,n=(x*19+y*13)%7;
      const base={g:'#8ca66b',f:'#8ca66b',p:'#d5bf8b',c:'#c8b687',w:'#6aa9af',t:'#8ca66b',b:'#cbb183',d:'#756449',s:'#9d7958','.':'#d1ba8c',r:'#a76e58'}[t];
      rect(px,py,16,16,base);
      if(t==='g'||t==='f'||t==='t'){rect(px+3+n,py+6,1,2,'#78935a');rect(px+11,py+12-n,2,1,'#a2b77c');}
      if(t==='p'||t==='c'){rect(px+n,py+5,2,1,'#bfaa79');rect(px+11,py+12,2,1,'#e2cd99');}
      if(t==='w'){rect(px+2,py+4+n,7,1,'#96c5c2');rect(px+9,py+12,4,1,'#508e9a');}
      if(t==='t'){rect(px+7,py+8,3,8,'#77664b');rect(px+2,py+3,13,9,'#486f50');rect(px+4,py,9,7,'#5b8458');rect(px+4,py+2,4,2,'#76965f');}
      if(t==='f'){for(const [a,b]of[[4,3],[10,10]]){rect(px+a,py+b,3,3,'#e7c48b');rect(px+a+1,py+b+1,1,1,'#b47d6a');}}
      if(t==='s'){rect(px,py,16,5,'#8e654d');rect(px,py,6,4,'#be7150');rect(px+9,py,5,4,'#d7b876');for(let a=2;a<14;a+=4)rect(px+a,py+8,3,3,(x+y)%2?'#9eab5d':'#d59c65');}
      if(t==='b' && position.map==='library'){rect(px+1,py+1,14,14,'#9a7a53');rect(px+1,py+6,14,1,'#b99665');}
    }
    for(const b of map.buildings){const x=b.x*16,y=b.y*16,w=b.w*16,h=b.h*16;
      rect(x+3,y+5,w,h,'#5d68464f');rect(x,y+7,w,h-7,b.color);rect(x-2,y,w+4,13,'#a4875d');rect(x,y+2,w,3,'#d4b582');rect(x+2,y+12,w-4,3,'#8c704d');
      for(let wx=x+10;wx<x+w-8;wx+=32){rect(wx,y+22,11,13,'#766549');rect(wx+2,y+24,7,9,'#6d9691');rect(wx+5,y+24,1,9,'#d3bb89');}
      const door=data.maps[position.map].tiles[b.y+b.h-1].indexOf('d',b.x);if(door>=b.x && door<b.x+b.w)rect(door*16,y+h-15,16,16,'#6d5942');
      if(b.label){ctx.font='8px monospace';ctx.textAlign='center';ctx.fillStyle='#f9eccb';ctx.fillText(b.label.toUpperCase(),x+w/2,y+10);}
    }
    for(const region of map.regions){ctx.font='bold 8px monospace';ctx.textAlign='center';const x=(region.x+region.w/2)*16,y=(region.y+region.h)*16;rect(x-27,y-1,54,11,'#344b3d');ctx.fillStyle='#f4e6bc';ctx.fillText(region.name,x,y+7);}
    const people=[...npcs.map(n=>({...n,kind:n.sprite})),{...position,kind:appearance,player:true}].sort((a,b)=>a.y-b.y);
    for(const p of people){person(p.x*16,p.y*16-3,p.kind,p.facing||'down',p.player?step:0);if(nearby?.id===p.id){rect(p.x*16+5,p.y*16-12,8,7,'#fff0b9');rect(p.x*16+8,p.y*16-11,2,3,'#69593e');rect(p.x*16+8,p.y*16-7,2,1,'#69593e');}}
    ctx.restore();
    return camera;
  }
  return {draw};
}
