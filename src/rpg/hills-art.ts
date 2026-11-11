import type Phaser from 'phaser';
import type {WorldMap} from './types';

/** Cached integer-pixel spring landscape. Registry terrain alone owns collision.
 * Birds and grazing animals are incidental scenery, never learning encounters. */
export function drawHillsArt(scene:Phaser.Scene,map:WorldMap):void {
  const width=map.tiles[0].length*16,height=map.tiles.length*16,key='spring-hills-ground';
  if(!scene.textures.exists(key)){
    const texture=scene.textures.createCanvas(key,width,height);if(!texture)throw Error('Hills texture unavailable');
    const c=texture.context;c.imageSmoothingEnabled=false;
    const rect=(color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(Math.floor(x),Math.floor(y),w,h);};
    const hash=(x:number,y:number)=>((Math.imul(x+71,73856093)^Math.imul(y+13,19349663))>>>0);
    for(let y=0;y<map.tiles.length;y++)for(let x=0;x<map.tiles[y].length;x++){
      const tile=map.tiles[y][x],n=hash(x,y),px=x*16,py=y*16;
      // Broad light/shade bands suggest rolling slopes without pretending to be walls.
      const shade=Math.sin(x*.12+y*.18)+Math.cos(x*.20-y*.11);
      rect(tile==='p'?'#c6aa72':tile==='R'?'#858673':shade>.6?'#9eb969':shade<-.6?'#6f9550':'#86a95c',px,py,16,16);
      for(let i=0;i<5;i++)rect(tile==='p'?(i%2?'#dac18a':'#b99a62'):(i%2?'#abc47a':'#668d4b'),px+(n>>(i*3))%14,py+(n>>(i*4+2))%15,2,1);
      if(tile==='f')for(let i=0;i<4;i++){const fx=px+2+(n>>(i*3))%11,fy=py+2+i*3;rect('#64884c',fx,fy+1,1,3);rect(['#eddc8e','#e7c5c2','#c6b7df'][i%3],fx-1,fy,3,2);}
      if(tile==='R'&&y>6){rect('#626e57',px+2,py+10,14,5);rect('#a1a18c',px+2,py+5,12,8);rect('#c3bda0',px+3,py+4,7,3);}
    }
    // Layered ridgelines sit entirely inside the impassable northern terrain.
    for(let ridge=0;ridge<3;ridge++)for(let x=0;x<width;x+=4){
      const y=14+ridge*16+Math.floor(9*Math.sin(x*.017+ridge)+8*Math.cos(x*.031));
      rect(['#b5c4af','#91aa98','#748f76'][ridge],x,Math.max(0,y),4,Math.max(0,67-y));
      if(ridge===0&&x%44<12)rect('#e1e3cd',x,Math.max(0,y),4,3);
    }
    for(const s of map.scenery??[]){
      const x=s.x*16,y=s.y*16;
      if(s.kind==='shrub'){rect('#577b43',x-3,y+4,19,9);rect('#799b4f',x,y,13,10);rect('#b2bf6d',x+2,y+1,5,2);}
      if(s.kind==='goat'||s.kind==='sheep'){
        rect('#637c48',x,y+13,20,3);rect(s.kind==='goat'?'#c8bb94':'#e6dcc0',x,y+4,15,9);rect('#a09173',x+13,y+3,6,7);rect('#594d39',x+2,y+12,2,4);rect('#594d39',x+11,y+12,2,4);rect('#4e493a',x+17,y+5,1,1);
        if(s.kind==='goat'){rect('#6c6249',x+14,y,1,4);rect('#6c6249',x+17,y-1,1,5);}
      }
      if(s.kind==='bird'){
        rect('#425d4d',x,y,3,1);rect('#425d4d',x+3,y+1,2,1);rect('#425d4d',x+5,y,3,1);rect('#c9d1b2',x+2,y,1,1);
      }
      if(s.kind==='tree'){
        rect('#607b44',x-5,y+7,27,10);rect('#71593b',x+6,y-13,4,25);
        rect('#416c43',x-8,y-26,32,21);rect('#557e46',x-5,y-32,25,20);rect('#91aa5c',x-3,y-30,16,5);
      }
    }
    texture.refresh();
  }
  scene.add.image(0,0,key).setOrigin(0).setDepth(1);
}
