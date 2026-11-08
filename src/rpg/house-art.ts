import type Phaser from 'phaser';
import type {WorldMap} from './types';

/** Hand-drawn pixel primitives: keep the room at the village's 16 px tile scale. */
export function drawInteriorArt(scene:Phaser.Scene,definition:WorldMap,house=false):void {
  const g=scene.add.graphics().setDepth(1);
  const rect=(color:number,x:number,y:number,w:number,h:number)=>{g.fillStyle(color,1).fillRect(x,y,w,h);};
  const frame=(color:number,x:number,y:number,w:number,h:number,t=1)=>{
    rect(color,x,y,w,t);rect(color,x,y+h-t,w,t);rect(color,x,y,t,h);rect(color,x+w-t,y,t,h);
  };
  const diamond=(cx:number,cy:number,r:number,color:number)=>{
    for(let dy=-r;dy<=r;dy+=2){const half=r-Math.abs(dy);rect(color,cx-half,cy+dy,half*2+2,2);}
  };
  const shadow=(x:number,y:number,w:number,h:number)=>{
    rect(0xa17b52,x+3,y+3,w,h);rect(0xad865b,x+w+3,y+5,2,h-2);
  };
  const textile=(x:number,y:number,w:number,h:number,medallion=false)=>{
    if(w<24){
      rect(0x783d32,x,y,w,h);frame(0xd0a064,x+1,y+1,w-2,h-2,2);
      for(let cy=y+14;cy<y+h-5;cy+=23){diamond(x+w/2,cy,5,0xdda765);diamond(x+w/2,cy,2,0x884332);}
      return;
    }
    rect(0x663b37,x,y,w,h);frame(0xb9784c,x+2,y+2,w-4,h-4,2);
    frame(0xd4a465,x+5,y+5,w-10,h-10,2);frame(0x98513f,x+8,y+8,w-16,h-16,2);
    rect(0x934737,x+10,y+10,w-20,h-20);
    for(let xx=x+13;xx<x+w-10;xx+=12)for(let yy=y+13;yy<y+h-10;yy+=12){
      if(medallion&&Math.abs(xx-(x+w/2))+Math.abs(yy-(y+h/2))<w/3)continue;
      rect(0xc98c54,xx,yy+2,6,2);rect(0xc98c54,xx+2,yy,2,6);
    }
    if(medallion){diamond(x+w/2,y+h/2,Math.min(w,h)/3|0,0x613b36);diamond(x+w/2,y+h/2,Math.min(w,h)/4|0,0xd3a15f);diamond(x+w/2,y+h/2,Math.min(w,h)/7|0,0xa85b40);}
  };
  const width=definition.tiles[0].length*16,height=definition.tiles.length*16;
  if(!house){
    rect(0xc9a371,8,16,width-16,height-24);
    for(let yy=47;yy<height-16;yy+=8)for(let xx=14;xx<width-12;xx+=11)
      if((xx*7+yy*3)%13<3)rect(0xb99261,xx,yy,2,1);
    rect(0xa37b51,8,13,width-16,34);rect(0xc6a073,12,20,width-24,24);
    rect(0xe2c38e,12,43,width-24,3);
    rect(0x65462e,0,0,width,7);rect(0x8e653f,0,7,width,7);
    for(const xx of [0,width-9]){rect(0x805a3c,xx,10,9,height-10);rect(0xd8b47e,xx+3,17,3,height-30);}
    const door=definition.transitions[0].x*16;
    for(const [xx,ww] of [[0,door],[door+32,width-door-32]]){rect(0x88613f,xx,height-16,ww,16);rect(0xd3ae79,xx,height-16,ww,5);}
    rect(0x65462e,door-2,height-18,3,18);rect(0x65462e,door+31,height-18,3,18);
    rect(0xe4c18b,door,height-4,32,4);
    // Pixel-stepped sunlight below the central timber-lattice window.
    rect(0xdac08c,96,34,32,13);rect(0xd6b682,91,47,42,9);
  }
  if(house){
    // Warm plaster, recessed rear wall and a heavy timber ceiling beam.
    rect(0xc29c69,8,16,width-16,height-24);
    for(let y=56;y<height-16;y+=8)for(let x=16;x<width-16;x+=8){
      const seed=(x*37+y*19)%29;
      if(seed<3)rect(seed===0?0xb28b5c:0xcba774,x+(seed%3),y,2+(seed%2),1);
    }
    rect(0xa17a50,8,15,width-16,42);rect(0xb38c5e,12,23,width-24,31);
    rect(0xbc9563,16,29,width-32,24);rect(0xc8a06c,16,54,width-32,3);
    for(let x=22;x<width-20;x+=19)rect(0xad8455,x,33+(x%5),3,2);
    rect(0x654a35,0,0,width,7);rect(0x87603e,3,5,width-6,10);
    rect(0xd5b481,12,8,width-24,7);rect(0xe2c594,14,8,width-28,2);
    rect(0x9b7149,7,15,width-14,5);
    for(const x of [0,width-10]){
      rect(0x886343,x,12,10,height-12);rect(0xb9905e,x+2,17,6,height-25);
      rect(0xd5b27c,x+(x===0?7:0),22,3,height-38);
    }
    // Low front wall, interrupted by the three-tile entrance recess.
    const door=12*16,opening=door-16;
    for(const [x,w] of [[0,opening],[opening+48,width-opening-48]]){
      rect(0x805c3d,x,height-16,w,16);rect(0xcaa26b,x+3,height-16,w-6,7);
      rect(0xe2bd84,x+4,height-16,w-8,2);rect(0x9d744b,x+3,height-5,w-6,5);
    }
    rect(0x5a432f,opening,height-16,48,16);rect(0x46392d,opening+4,height-12,40,12);
    rect(0x87623f,opening-2,height-20,4,20);rect(0x87623f,opening+46,height-20,4,20);
    rect(0xe0bb7e,opening+3,height-3,42,3);
  }
  for(const f of definition.furniture??[]){
    const x=f.x*16,y=f.y*16,w=f.w*16,h=f.h*16;
    switch(f.kind){
      case 'rug':
        shadow(x,y,w,h);textile(x,y,w,h);
        for(let xx=x+3;xx<x+w;xx+=4){rect(0xd9b980,xx,y-2,2,2);rect(0xd9b980,xx,y+h,2,2);}
        break;
      case 'tapestry':
        rect(0x62452f,x-2,y-2,w+4,3);textile(x+2,y+2,w-4,h-3,true);
        for(let xx=x+4;xx<x+w-2;xx+=5)rect(0xc8a168,xx,y+h-1,2,4);
        break;
      case 'wall-rug':
        rect(0x65462e,x-1,y-2,w+2,3);textile(x,y,w,h,true);
        for(let yy=y+3;yy<y+h;yy+=5)rect(0xc9a472,x+w,yy,2,2);
        break;
      case 'bed': {
        shadow(x,y,w,h);rect(0x5a3d2b,x,y,w,h);rect(0x92633b,x+3,y+5,w-6,h-9);
        rect(0xb3834d,x+2,y+1,w-4,5);rect(0xd3a568,x+5,y+2,w-10,2);
        for(const xx of [x,x+w-5]){rect(0x6b482e,xx,y,5,h);rect(0xad7e47,xx+1,y+2,2,h-5);}
        rect(0xd6c399,x+7,y+10,w-14,25);rect(0xf0dfb4,x+9,y+10,w-18,22);
        rect(0xc5b28b,x+13,y+14,w-26,19);rect(0xf4e5be,x+12,y+11,w-24,16);
        rect(0xe5d3a8,x+15,y+9,w-30,2);rect(0xd7c296,x+15,y+26,w-30,3);
        textile(x+6,y+32,w-12,h-43,true);
        rect(0x74492d,x+3,y+h-11,w-6,9);rect(0xb5854e,x+5,y+h-11,w-10,3);
        rect(0x523b2b,x+4,y+h-2,5,4);rect(0x523b2b,x+w-9,y+h-2,5,4);
        break;
      }
      case 'bookshelf': {
        shadow(x,y,w,h);rect(0x62462e,x,y,w,h);rect(0x463e2b,x+5,y+9,w-10,h-15);
        rect(0x9b703e,x-2,y,w+4,7);rect(0xc29252,x,y+1,w,2);
        const colors=[0xb78c48,0x63846c,0x9c553d,0xc6aa69,0x4b7375,0x8b4f3b];
        for(let shelf=0;shelf<(h>=64?3:h>=44?2:1);shelf++){
          const base=y+27+shelf*22;let xx=x+7;
          for(let book=0;book<6;book++){
            const bw=5+(book+shelf)%3,bh=13+(book*3+shelf)%6;
            rect(colors[(book+shelf)%colors.length],xx,base-bh,bw,bh);
            rect(0xd3b881,xx+1,base-bh+2,1,bh-4);rect(0x604930,xx+2,base-4,bw-3,1);xx+=bw+2;
          }
          rect(0x9c7245,x+3,base+1,w-6,4);rect(0xc09156,x+4,base+1,w-8,1);
        }
        rect(0x9c7245,x,y+7,5,h-7);rect(0xa77b46,x+w-5,y+7,5,h-7);
        rect(0xbe9159,x+1,y+8,1,h-10);rect(0x4d3c2a,x+3,y+h-2,6,4);rect(0x4d3c2a,x+w-9,y+h-2,6,4);
        break;
      }
      case 'window':
        rect(0x815a36,x-3,y-2,w+6,h+5);rect(0xb88a51,x-1,y,w+2,h+1);
        rect(0x326568,x+3,y+3,w-6,h-6);rect(0x448486,x+5,y+4,w-10,h-8);
        rect(0x518f8c,x+6,y+5,w-12,3);
        for(let xx=x+8;xx<x+w-5;xx+=7)rect(0xa77b48,xx,y+3,2,h-6);
        rect(0xc9a16c,x+3,y+h/2,w-6,2);rect(0xd0ab70,x-2,y+h, w+4,3);
        break;
      case 'reading-table':
      case 'table': {
        rect(0xa17b52,x+7,y+h-7,w-8,8);
        for(const xx of [x+9,x+w-15]){rect(0x67472e,xx,y+15,6,h-11);rect(0x916037,xx+1,y+17,2,h-14);}
        // Stepped ellipse: horizontal/vertical pixel edges, no antialiased curve.
        for(const [offset,inset,band] of [[0,14,2],[2,7,3],[5,3,4],[9,0,6],[15,3,4],[19,8,3],[22,15,3]])
          rect(offset<15?0xb57c42:0x88542e,x+inset,y+offset,w-inset*2,band);
        rect(0xc58e4d,x+15,y+2,w-30,2);rect(0xa66d39,x+8,y+15,w-16,2);
        if(f.kind==='reading-table'){
          rect(0x765032,x+6,y+6,w-12,10);rect(0xead6a6,x+7,y+4,w-14,10);
          rect(0xbba375,x+w/2,y+4,1,10);
          for(let yy=y+6;yy<y+12;yy+=3){rect(0x86704c,x+9,yy,4,1);rect(0x86704c,x+w/2+3,yy,4,1);}
          rect(0xb38b52,x+4,y+17,w-8,3);rect(0xead6a6,x+6,y+16,w-12,2);break;
        }
        // Jug, handle, neck and a separate tea cup.
        const jx=x+w/2-9;
        rect(0x425d58,jx-2,y-12,15,24);rect(0x74958a,jx,y-13,10,22);
        rect(0x9bb0a0,jx+2,y-11,3,17);rect(0x425d58,jx+2,y-20,7,8);
        rect(0x95a999,jx,y-21,11,3);frame(0x4a655d,jx+10,y-11,7,10,2);
        rect(0xd9c49b,x+w-19,y+6,9,8);rect(0x4d665e,x+w-18,y+5,7,3);rect(0xa18e68,x+w-17,y+12,7,2);
        break;
      }
      case 'cushion':
        shadow(x+1,y+3,w-2,h-6);rect(0x76573a,x+1,y+4,w-2,h-8);rect(0xc59a5c,x+3,y+3,w-6,h-8);
        rect(0xd2b27b,x+5,y+5,w-10,h-12);
        for(let xx=x+7;xx<x+w-6;xx+=7){rect(0x944b3b,xx,y+5,3,h-12);rect(0xab6849,xx+3,y+5,1,h-12);}
        rect(0xe0c18a,x+5,y+5,w-10,2);rect(0xa77a4c,x+5,y+h-9,w-10,2);
        break;
      case 'lantern':
        // Niche and stepped warm light, rather than a blurred lighting overlay.
        rect(0xae8754,x-7,y+3,w+14,h-1);rect(0xa17a49,x-3,y-3,w+6,h+2);rect(0x98703f,x+3,y-7,w-6,h+4);
        rect(0xc59a55,x+5,y+7,w-10,h-8);rect(0xd6ad63,x+8,y+12,w-16,h-11);
        rect(0x65502f,x+11,y+4,10,23);rect(0x725633,x+13,y,6,7);frame(0x5b492c,x+13,y-3,6,6,1);
        rect(0xe6af43,x+13,y+10,6,14);rect(0xffd66e,x+14,y+12,4,10);rect(0xffeb9b,x+15,y+15,2,6);
        rect(0x806038,x+9,y+25,14,3);rect(0xd9b477,x-5,y+h-3,w+10,4);
        break;
      case 'chest':
        shadow(x,y,w,h);rect(0x63452e,x,y+2,w,h-2);rect(0xa47541,x,y,w,6);rect(0xc09155,x+2,y+1,w-4,2);
        for(const xx of [x+7,x+w-11]){rect(0x765636,xx,y+1,4,h-2);rect(0xc8a265,xx+1,y+2,1,3);}
        rect(0xddb978,x+w/2-2,y+7,4,4);rect(0x4e3828,x+3,y+h-2,5,3);rect(0x4e3828,x+w-8,y+h-2,5,3);
        break;
      case 'basket':
        shadow(x,y,w,h);rect(0x8d6035,x+1,y+8,w-2,h-8);rect(0xc28e4e,x+3,y+5,w-6,h-6);
        for(let yy=y+9;yy<y+h-2;yy+=4)for(let xx=x+3;xx<x+w-3;xx+=4)rect((xx+yy)%8?0xd6aa6a:0xa3743e,xx,yy,3,2);
        frame(0x7b522d,x+3,y,w-6,13,2);rect(0x4f402b,x+4,y+7,w-8,4);rect(0xe0b778,x+2,y+6,w-4,2);
        break;
      case 'stool':
        shadow(x,y+5,w,h-5);for(const xx of [x+3,x+w-7])rect(0x73502f,xx,y+5,4,h-3);
        rect(0xa3733d,x,y,w,8);rect(0xc08f50,x+2,y+1,w-4,2);rect(0x80522e,x+w/2-1,y+3,2,4);
        break;
      case 'pottery':
        shadow(x+2,y+5,w-4,h-6);
        rect(0x96603a,x+6,y+5,w-12,h-7);rect(0xae7343,x+2,y+10,w-4,h-15);
        rect(0xbc8450,x+4,y+8,w-8,h-12);rect(0x925b36,x+6,y+h-6,w-12,5);
        rect(0xd09a62,x+5,y+10,3,h-18);rect(0xc59158,x+8,y+7,3,4);
        rect(0x8c5835,x+10,y,w-20,9);rect(0xd09b62,x+8,y,w-16,3);rect(0x60472e,x+11,y+1,w-22,2);
        break;
      case 'plant':
        rect(0xa97548,x+4,y+9,w-8,h-9);rect(0x46734b,x+2,y+2,w-4,9);rect(0x668750,x+5,y,w-10,9);
        break;
    }
  }
  if(!house)scene.add.text((definition.transitions[0].x+1)*16,height-20,'EXIT',{fontFamily:'monospace',fontSize:'7px',color:'#fff0c9',backgroundColor:'#654a35'}).setOrigin(.5,1).setDepth(2);
  if(house)scene.add.text(12*16+8,height-22,'EXIT',{fontFamily:'monospace',fontSize:'7px',color:'#fff0c9',backgroundColor:'#654a35'}).setOrigin(.5,1).setDepth(2);
}
