import type Phaser from 'phaser';
import type {WorldMap} from './types';

/** Seeded, integer pixel artwork. Geometry and collision remain in the registry.
 * Static ground is baked once; building and tree foregrounds use footpoint depth.
 * Textures are reused across map visits, and released with the Phaser game. */
interface PixelPainter {fillStyle(color:number):PixelPainter;fillRect(x:number,y:number,w:number,h:number):PixelPainter}

export function drawVillageArt(scene:Phaser.Scene,map:WorldMap):void {
  const unit=16,width=map.tiles[0].length*unit,height=map.tiles.length*unit;
  const groundKey='afghan-village-ground';
  const hash=(x:number,y:number)=>((Math.imul(x+17,73856093)^Math.imul(y+41,19349663))>>>0);
  function texture(key:string,w:number,h:number,draw:(g:PixelPainter)=>void){
    if(!scene.textures.exists(key)){
      const canvas=scene.textures.createCanvas(key,w,h);if(!canvas)throw Error('Cannot create village texture: '+key);
      const context=canvas.context;context.imageSmoothingEnabled=false;
      // Draw pixels directly into the Phaser CanvasTexture, avoiding a large
      // temporary Graphics command buffer and a second rasterisation/copy.
      const painter:PixelPainter={fillStyle(color){context.fillStyle='#'+color.toString(16).padStart(6,'0');return this;},fillRect(x,y,w,h){context.fillRect(x,y,w,h);return this;}};
      draw(painter);canvas.refresh();
    }
    return key;
  }
  function rect(g:PixelPainter,c:number,x:number,y:number,w:number,h:number){g.fillStyle(c).fillRect(Math.floor(x),Math.floor(y),w,h);}
  texture(groundKey,width,height,g=>{
    for(let y=0;y<map.tiles.length;y++)for(let x=0;x<map.tiles[y].length;x++){
      const t=map.tiles[y][x],px=x*16,py=y*16,n=hash(x,y);
      rect(g,t==='w'?0x237f93:t==='D'?0x996f40:'pcd'.includes(t)?0xd7b782:0x8d9d53,px,py,16,16);
      if(t==='c'){
        rect(g,0xbba980,px,py,16,1);rect(g,0xbba980,px+(y%2)*8,py,1,16);
        rect(g,0xe0c596,px+2,py+2,5,1);rect(g,0xbca375,px+8,py+9,7,1);
      }else if(t==='w'){
        for(let i=0;i<4;i++)rect(g,i%2?0x369eaa:0x2c8c9f,px+(n>>(i*3))%12,py+i*4,3+(n>>i)%4,1);
        if((n%23)===0){rect(g,0x5d994d,px+3,py+6,7,3);rect(g,0xb6be62,px+4,py+6,3,1);}
        for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]])if(map.tiles[y+dy]?.[x+dx]&&map.tiles[y+dy][x+dx]!=='w'&&map.tiles[y+dy][x+dx]!=='D'){
          rect(g,0x9f9d6e,px+(dx===1?13:0),py+(dy===1?13:0),dx?3:16,dy?3:16);
          rect(g,0x83b4a2,px+(dx===1?12:dx===-1?3:0),py+(dy===1?12:dy===-1?3:0),dx?1:16,dy?1:16);
        }
      }else if(t==='D'){
        for(let i=0;i<16;i+=4){rect(g,0x5c482e,px,py+i,16,1);rect(g,0xc1995d,px+1,py+i+1,13,1);}
        if(map.tiles[y]?.[x-1]!=='D'||map.tiles[y]?.[x+1]!=='D'){rect(g,0x58402a,px+2,py,3,16);rect(g,0xd0a46b,px+2,py+1,3,2);}
      }else{
        for(let i=0;i<5;i++)rect(g,'pd'.includes(t)?0xc6a575:i%2?0x7e9348:0x9aa85b,px+(n>>(i*3))%15,py+(n>>(i*2+4))%15,2,1);
        if(!'pd'.includes(t)&&n%9===0){rect(g,0xe3ce7c,px+5,py+7,2,2);rect(g,0xd0a45d,px+10,py+3,1,2);}
      }
      if(t==='B'){
        rect(g,0x71613e,px+2,py+5,14,11);rect(g,0xb7935d,px,py+2,16,11);rect(g,0xe0bf82,px,py,16,3);
        rect(g,0xcaa66d,px+1,py+4,5,2);rect(g,0x9a794e,px+10,py+9,4,1);
      }
      if(t==='X'){
        rect(g,0x6d4d30,px+2,py+2,3,14);rect(g,0xd2ac6f,px+2,py+2,2,3);
        rect(g,0x785335,px,py+6,16,3);rect(g,0xdfbd7a,px,py+6,16,1);
      }
    }
    for(const s of map.scenery??[]){
      const x=s.x*16,y=s.y*16;
      if(s.kind==='garden'){
        rect(g,0x6b783c,x,y,16,16);for(let j=2;j<16;j+=5){rect(g,0x544c2c,x,y+j,16,2);for(let i=1;i<16;i+=4){rect(g,0x3f713b,x+i,y+j-2,3,3);rect(g,0x9fad4e,x+i,y+j-2,2,1);}}
      }
      if(s.kind==='rug'){
        rect(g,0x7a3940,x-8,y-4,32,22);rect(g,0xd6a870,x-6,y-2,28,18);rect(g,0x993f43,x-4,y,24,14);
        for(let i=0;i<3;i++){rect(g,0xe6c688,x+i*8-1,y+5,4,4);rect(g,0x355b67,x+i*8,y+6,2,2);}
        for(let i=0;i<32;i+=3)rect(g,0xcab28a,x-8+i,y+18,1,3);
      }
    }
  });
  scene.add.image(0,0,groundKey).setOrigin(0).setDepth(1);
  for(const b of map.buildings){
    const door=map.tiles[b.y+b.h-1].indexOf('d',b.x)-b.x;
    const w=b.w*16,h=b.h*16,key=`adobe-${b.style??'home'}-${b.w}-${b.h}-${door}`;
    texture(key,w+16,h+24,g=>{
      rect(g,0x52633d,10,24,w+5,h-8);
      rect(g,0x947448,8,23,w,h-7);rect(g,0xc69d68,4,20,w,h-8);
      for(let y=30;y<h+10;y+=9)for(let x=8;x<w;x+=12)if(hash(x,y)%3===0)rect(g,0xb68e5c,x,y,6,1);
      // Recessed roof terrace, parapet, timber beams and rooftop pottery.
      rect(g,0xe1c18a,2,8,w+4,16);rect(g,0x997447,8,12,w-12,7);rect(g,0xcdb07a,10,13,w-16,4);
      rect(g,0xf0ce96,2,7,w+4,3);rect(g,0xe5c38c,2,8,5,14);rect(g,0xa88351,w+1,8,5,16);
      for(let x=12;x<w;x+=13)rect(g,0x785835,x,22,3,5);
      const dx=4+(door>=0&&door<b.w?door:Math.floor(b.w/2))*16;
      rect(g,0xe9c590,dx-5,h-14,26,30);rect(g,0x694b31,dx,h-10,16,26);
      rect(g,0x926136,dx+2,h-8,12,24);for(let x=dx+3;x<dx+15;x+=4)rect(g,0x60452d,x,h-8,1,24);
      rect(g,0xc7a56e,dx+11,h+4,2,2);rect(g,0xe5c996,dx-3,h+16,22,3);
      for(let x=16;x<w-10;x+=34){if(Math.abs(x-dx)<20)continue;
        rect(g,0xe8c18a,x-2,h-20,15,19);rect(g,0x5f5032,x,h-18,11,15);
        for(let i=1;i<11;i+=3)rect(g,0xbba471,x+i,h-18,1,15);
        for(let i=1;i<15;i+=4)rect(g,0xbba471,x,h-18+i,11,1);
      }
      for(const x of [17,w-18]){rect(g,0x805536,x,7,6,7);rect(g,0xbb7d41,x-1,6,8,5);rect(g,0x62452b,x+1,5,4,2);}
      if(b.style==='school'){
        rect(g,0x3f7882,5,26,w-2,5);for(let x=8;x<w;x+=8)rect(g,0xe4c58e,x,27,3,2);
        rect(g,0x9f794d,dx-20,0,56,h+16);rect(g,0xe2bd82,dx-17,0,50,h+13);
        rect(g,0xf1d49a,dx-18,0,52,5);rect(g,0xbc975f,dx-13,6,42,h+5);
        rect(g,0xdbc08b,dx-12,3,40,24);rect(g,0x42828b,dx-8,7,32,17);
        rect(g,0xf3ddb1,dx+1,11,13,10);rect(g,0x926c44,dx+7,11,1,10);
        // Recessed formal doorway is drawn after the central plaster frontage.
        rect(g,0xe8cd98,dx-7,h-16,30,32);rect(g,0x735136,dx-3,h-12,22,28);
        rect(g,0x735136,dx,h-16,16,6);rect(g,0xa67b45,dx,h-8,16,24);
        for(let xx=dx+2;xx<dx+16;xx+=4)rect(g,0x664a2e,xx,h-8,1,24);
        rect(g,0xddbd7c,dx+11,h+3,2,2);
        rect(g,0x97724a,dx-12,h+16,40,5);rect(g,0xe7c994,dx-15,h+20,46,3);
        rect(g,0x3e7882,dx-16,27,3,h-14);rect(g,0x3e7882,dx+29,27,3,h-14);
        for(let yy=30;yy<h+4;yy+=6){rect(g,0xe7ce96,dx-15,yy,1,2);rect(g,0xe7ce96,dx+30,yy,1,2);}
      }else if(b.style!=='library'){
        // Woven rooftop shade and a textile draped over the terrace.
        rect(g,0x77542f,35,0,2,18);rect(g,0x77542f,Math.min(w-9,70),0,2,18);
        rect(g,0xc4a05a,32,0,Math.min(w-35,44),7);
        for(let x=33;x<Math.min(w-3,76);x+=3)rect(g,0xe0bc77,x,1,1,6);
        rect(g,0x9b4746,w-31,12,14,25);rect(g,0xe6b780,w-29,13,10,23);
        rect(g,0x943a3e,w-27,16,6,17);rect(g,0x3c727b,w-25,21,2,7);
      }
    });
    scene.add.image(b.x*16-4,b.y*16-8,key).setOrigin(0).setDepth((b.y+b.h)*16-1);
    if(b.label)scene.add.text((b.x+b.w/2)*16,(b.y+b.h)*16-24,b.label.toUpperCase(),{fontFamily:'monospace',fontSize:'8px',color:'#fff0ce',backgroundColor:'#604f35',padding:{x:3,y:2}}).setOrigin(.5).setDepth((b.y+b.h)*16);
  }
  for(const s of map.scenery??[]){
    if(['garden','rug'].includes(s.kind))continue;
    const tree=['tree','poplar'].includes(s.kind),w=s.kind==='stall'?88:tree?48:32,h=s.kind==='stall'?64:tree?64:40;
    const key='village-prop-'+s.kind;
    texture(key,w,h,g=>{
      const r=(c:number,x:number,y:number,rw:number,rh:number)=>rect(g,c,x,y,rw,rh);
      if(tree){
        r(0x61713f,9,51,30,9);r(0x705334,22,27,5,31);r(0xa08048,23,29,2,26);
        const poplar=s.kind==='poplar';
        if(poplar){
          for(let j=0;j<6;j++){const yy=j*7,ww=j===0?8:j===5?12:20,xx=24-ww/2;
            r(0x355e37,xx,yy+4,ww,13);r(0x64853d,xx+2,yy,ww-4,14);
            for(let i=0;i<6;i++){const n=hash(i,j);r(i%2?0xa4ad4b:0x7d993d,xx+2+n%(ww-4),yy+2+(n>>5)%10,2,2);}
          }
        }else{
          // Stepped rounded canopy clusters, shaded below and lit at upper left.
          for(const [xx,yy,ww,hh]of [[5,14,22,24],[20,10,23,27],[11,1,25,25],[12,24,27,21]]){
            r(0x325e37,xx+3,yy,ww-6,hh);r(0x325e37,xx,yy+4,ww,hh-8);
            r(0x4b773a,xx+3,yy+2,ww-7,hh-6);r(0x62873d,xx+4,yy+2,ww-10,8);
            for(let i=0;i<18;i++){const n=hash(i+xx,yy);r(i%4===0?0xb9bb57:0x819e46,xx+3+n%(ww-7),yy+3+(n>>5)%(hh-6),2+n%2,2);}
          }
        }
      }else if(s.kind==='stall'){
        r(0x6a5938,7,52,78,7);r(0x725033,7,12,3,43);r(0x725033,76,12,3,43);
        r(0x9f493e,4,8,78,19);for(let i=5;i<80;i+=14)r(0xe9c695,i,8,7,19);
        r(0x6b4a2c,6,28,74,3);r(0xa97742,9,39,68,17);r(0xdbad64,9,38,68,3);
        for(let i=12;i<75;i+=14){r(0x684b2d,i,42,12,12);r(0xb7904e,i+1,44,10,1);for(let j=0;j<4;j++)r([0xbc4c35,0xcbb84d,0x628141,0xd88d38][j],i+1+(j%2)*5,34+Math.floor(j/2)*4,4,4);}
        r(0x863d40,30,50,22,11);r(0xe2b66f,32,51,18,1);r(0xd5a86e,40,54,3,4);
      }else if(s.kind==='pot'){
        r(0x7f693e,6,29,22,6);r(0x935d34,10,15,14,16);r(0xc58a4a,8,17,16,11);r(0xe0aa65,10,17,4,8);r(0x735131,12,12,8,5);r(0x4b462c,13,12,6,2);
      }else if(s.kind==='well'){
        r(0x736444,2,26,28,10);r(0xc3b58a,2,22,28,10);r(0x568a90,6,22,20,5);r(0x564831,5,5,3,21);r(0x564831,25,5,3,21);r(0xb5945c,3,3,27,5);r(0xd3b579,15,7,1,17);
      }else if(s.kind==='reed'){
        for(let i=0;i<5;i++){r(0x5b793b,4+i*5,16-i%3*4,1,18);r(0xbca153,4+i*5,12-i%3*4,2,6);}
      }else if(s.kind==='stone'){
        r(0x6e7356,5,27,25,5);r(0x9c9b7a,6,23,20,7);r(0xc4bc94,9,20,11,5);
      }else if(s.kind==='sign'){
        r(0x6c4c30,15,16,3,21);r(0x775232,2,8,28,11);r(0xcaa36a,3,8,26,2);r(0xf4d398,12,12,11,2);r(0xf4d398,20,10,2,6);
      }
    });
    // Tree foliage extends above its blocked trunk tile; feet determine overlap.
    if(s.kind==='stall')scene.add.image(s.x*16-4,s.y*16-8,key).setOrigin(0).setDepth((s.y+3)*16-1);
    else scene.add.image(s.x*16+8,s.y*16+16,key).setOrigin(.5,1).setDepth(s.y*16+17);
  }
  for(const e of map.reservedExits??[])scene.add.text(e.approach.x*16,e.approach.y*16-20,`${e.id.toUpperCase()} ROAD\nClosed · future route`,{fontFamily:'monospace',fontSize:'7px',color:'#f8dfac',backgroundColor:'#665237',align:'center',padding:{x:3,y:3}}).setOrigin(.5).setDepth(9998);
}
