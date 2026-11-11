import Phaser from 'phaser';
import {drawVillageArt} from './village-art';
import {drawHillsArt} from './hills-art';
import {drawInteriorArt} from './house-art';
import type {Actor,ActivityState,Appearance,Direction,Point,Position,WorldData} from './types';
import {createMovementController,canInteract,facingToward} from './movement';
import {createActivities} from './activities';
import {directions,recover} from './world-data';

interface WorldOptions {
  activityState?:Record<string,ActivityState>;onActivities(state:Record<string,ActivityState>):void;
  portraits?:{characters:Record<string,{expressions:Record<string,string|null>}>};portraitReady(key:string,source:string):void;
  canvas:HTMLCanvasElement;data:WorldData;allowedMaps?():string[];
  position():Position;actors():Actor[];appearance():Appearance;active():boolean;
  onMove(position:Position,transition:boolean):void;onFrame():void;onInteract(actor:Actor):void;
}
const tileSize=16;
const facingIndex:Record<Direction,number>={down:0,left:1,right:2,up:3};
/** Phaser owns the live map, sprites, physics, tween movement, camera and sensors. */
export class VillageScene extends Phaser.Scene {
  private readonly activities;
  private actorSprites=new Map<string,Phaser.Physics.Arcade.Sprite>();
  private playerTarget?:Point;
  private mapId='';
  private map?:Phaser.Tilemaps.Tilemap;
  private terrain?:Phaser.Tilemaps.TilemapLayer|Phaser.Tilemaps.TilemapGPULayer;
  private extraMap?:Phaser.Tilemaps.Tilemap;
  private extraCollision?:Phaser.Tilemaps.TilemapLayer|Phaser.Tilemaps.TilemapGPULayer;
  private player?:Phaser.Physics.Arcade.Sprite;
  private probe?:Phaser.Physics.Arcade.Sprite;
  private npcGroup?:Phaser.Physics.Arcade.StaticGroup;
  private sensors?:Phaser.Physics.Arcade.StaticGroup;
  private marker?:Phaser.GameObjects.Text;
  private movement?:Phaser.Tweens.Tween;
  private actorSignature='';
  private actors:Actor[]=[];
  private wasActive=false;
  private controller?:ReturnType<typeof createMovementController>;
  private pointer?: (event:PointerEvent)=>void;
  constructor(private readonly options:WorldOptions){super('village');this.activities=createActivities(options.data,options.activityState);}
  preload():void {
    for(const [id,character] of Object.entries(this.options.portraits?.characters??{}))for(const [expression,source] of Object.entries(character.expressions))if(source)this.load.image('portrait:'+id+':'+expression,source);
    this.load.on('loaderror',(file:{key:string})=>{if(file.key.startsWith('portrait:'))this.options.portraitReady(file.key.slice(9),'');});
  }
  create():void {
    for(const [id,character] of Object.entries(this.options.portraits?.characters??{}))for(const expression of Object.keys(character.expressions)){
      const key=id+':'+expression;
      if(this.textures.exists('portrait:'+key)){
        const source=this.textures.get('portrait:'+key).getSourceImage();
        this.options.portraitReady(key,source instanceof HTMLImageElement?source.src:(source as HTMLCanvasElement).toDataURL());
      }
    }
    this.createArt();
    this.loadMap();
    this.controller=createMovementController({data:this.options.data,position:this.options.position,actors:()=>this.activities.occupancy(this.actors),allowedMaps:()=>this.options.allowedMaps?.()??Object.keys(this.options.data.maps),step:dir=>this.step(dir),moving:()=>!!this.movement,
      arrived:actor=>{const p=this.options.position();this.options.onMove({...p,facing:facingToward(p,actor)},false);this.player?.setFrame(facingIndex[facingToward(p,actor)]*2);this.options.onInteract(actor);}});
    this.pointer=event=>{
      if(!this.options.active()||!event.isPrimary||event.button!==0)return;
      event.preventDefault();this.options.canvas.focus();
      const bounds=this.options.canvas.getBoundingClientRect();
      const point=this.cameras.main.getWorldPoint((event.clientX-bounds.left)*this.scale.width/bounds.width,(event.clientY-bounds.top)*this.scale.height/bounds.height);
      const tile={x:Math.floor(point.x/tileSize),y:Math.floor(point.y/tileSize)};
      const actor=this.actors.find(a=>{const b=a.interactionBounds,p=this.activities.visual(a);return b?tile.x>=b.x&&tile.x<b.x+b.w&&tile.y>=b.y&&tile.y<b.y+b.h:Math.round(p.x)===tile.x&&Math.round(p.y)===tile.y;});
      this.activities.select(actor?.id);this.sync();
      this.options.canvas.dataset.route=this.controller!.navigate(tile,actor)?'moving':'unreachable';
    };
    this.options.canvas.addEventListener('pointerdown',this.pointer);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{if(this.pointer)this.options.canvas.removeEventListener('pointerdown',this.pointer);this.controller?.cancel();this.activities.pause();this.actorSprites.clear();});
    this.physics.pause();
    this.game.canvas.dataset.phaser=Phaser.VERSION;
  }
  private createArt():void {
    const graphics=this.make.graphics({x:0,y:0});
    const colors:Record<string,number>={g:0x8ca66b,f:0x8ca66b,p:0xd5bf8b,c:0xc8b687,w:0x6aa9af,t:0x8ca66b,b:0xcbb183,d:0x756449,s:0x9d7958,'.':0xd1ba8c,r:0xa76e58,i:0xb38d62,u:0x9e4350,e:0x6b493d,k:0x6b493d,q:0x8a5c3a,z:0x426f78,P:0x6c6a40};
    Object.keys(this.options.data.tiles).forEach((symbol,index)=>{
      const x=index*16;
      graphics.fillStyle(colors[symbol]??0x8ca66b).fillRect(x,0,16,16);
      if(['g','f','t'].includes(symbol))graphics.fillStyle(0x78935a).fillRect(x+3,6,2,2).fillRect(x+11,12,2,1);
      if(['p','c','.'].includes(symbol))graphics.fillStyle(0xbfaa79).fillRect(x+2,5,2,1).fillRect(x+11,12,2,1);
      if(symbol==='i'){graphics.fillStyle(0xb99469).fillRect(x+2,4,2,1).fillRect(x+11,11,2,1);}
      if(symbol==='w')graphics.fillStyle(0x96c5c2).fillRect(x+2,4,7,1).fillRect(x+9,12,4,1);
      if(symbol==='t'){
        graphics.fillStyle(0x77664b).fillRect(x+7,8,3,8);
        graphics.fillStyle(0x486f50).fillRect(x+2,3,13,9);
        graphics.fillStyle(0x5b8458).fillRect(x+4,0,9,7);
      }
      if(symbol==='f')graphics.fillStyle(0xe7c48b).fillRect(x+4,3,3,3).fillRect(x+10,10,3,3);
      if(symbol==='s'){
        graphics.fillStyle(0xbe7150).fillRect(x,0,16,4);
        for(let a=2;a<14;a+=4)graphics.fillStyle(a%3?0x9eab5d:0xd59c65).fillRect(x+a,8,3,3);
      }
    });
    graphics.generateTexture('village-tiles',Object.keys(this.options.data.tiles).length*16,16).clear();
    const palettes:Record<string,[number,number]>={elder:[0xf0e5ce,0xf7f0d9],saleha:[0x8f3742,0xa87645],edris:[0x9a613b,0xe4d1aa],hameed:[0x74618c,0xd6bfdf],masculine:[0x447b9b,0xd7e8e6],feminine:[0xae6380,0xf0c4ab],neutral:[0x6e7e50,0xdbe2bd],mina:[0x316f74,0x44332c],bilal:[0x377d80,0x493027],zamir:[0x34465b,0x292b2d],nayab:[0xa95732,0x30271e],sara:[0x874564,0x493126],omar:[0x6eabc4,0x3e2b23],afiya:[0x208378,0x242628],sanaa:[0xc79c3f,0x513527]};
    for(const [kind,[robe,head]] of Object.entries(palettes)){
      for(const [dir,idx]of Object.entries(facingIndex))for(let step=0;step<2;step++){
        const x=step*16,child=['mina','nayab','sara','omar','afiya','sanaa'].includes(kind),y=idx*16+(child?3:0);
        if(child)graphics.fillStyle(0x344c45,.3).fillRect(x+4,idx*16+14,9,2);
        graphics.fillStyle(0x344c45,.3).fillRect(x+3,idx*16+13,11,3);
        graphics.fillStyle(robe).fillRect(x+5,y+5,7,child?5:8).fillRect(x+4,y+8,2,child?2:4).fillRect(x+12,y+8,2,child?2:4);
        graphics.fillStyle(0xbb895e).fillRect(x+5,y+1,7,5);
        graphics.fillStyle(head).fillRect(x+4,y,9,3);
        if(['hameed','feminine'].includes(kind))graphics.fillRect(x+3,y+1,2,9).fillRect(x+11,y+1,2,9);
        graphics.fillStyle(0x3e3b39).fillRect(x+5,idx*16+13+step,3,2).fillRect(x+10,idx*16+13-step,3,2);
        if(dir!=='up')graphics.fillStyle(kind==='saleha'?0x70bbee:0x2f3232).fillRect(x+(dir==='left'?5:9),y+4,1,1);
        if(kind==='edris')graphics.fillStyle(0x48362c).fillRect(x+6,y+6,5,3);
        if(['mina','nayab','sara','sanaa','saleha','afiya'].includes(kind))graphics.fillStyle(head).fillRect(x+3,y+1,2,child?5:7).fillRect(x+11,y+1,2,child?5:7);
        if(kind==='zamir')graphics.fillStyle(0x292b2d).fillRect(x+6,y+6,5,2);
        if(kind==='nayab'){graphics.fillStyle(0x4b704b).fillRect(x+5,y+6,2,4);graphics.fillStyle(head).fillRect(x+3,y+5,2,4).fillRect(x+12,y+5,2,4);graphics.fillStyle(0x79a35c).fillRect(x+3,y+8,2,1).fillRect(x+12,y+8,2,1);}
        if(kind==='sanaa')graphics.fillStyle(0xa44835).fillRect(x+4,y+5,2,2).fillRect(x+11,y+5,2,2);
        if(kind==='afiya')graphics.fillStyle(0xd4b863).fillRect(x+8,y+6,1,4);
        if(kind==='elder')graphics.fillStyle(0xeee9d9).fillRect(x+6,y+6,5,3);
      }
      graphics.generateTexture(kind,32,64).clear();
      const texture=this.textures.get(kind);
      for(let i=0;i<8;i++)texture.add(i,0,(i%2)*16,Math.floor(i/2)*16,16,16);
      for(const [dir,idx]of Object.entries(facingIndex))this.anims.create({key:kind+'-'+dir,frames:[{key:kind,frame:idx*2},{key:kind,frame:idx*2+1}],frameRate:16,repeat:-1});
    }
    graphics.destroy();
  }
  private loadMap():void {
    this.controller?.cancel();this.movement?.stop();this.movement=undefined;this.playerTarget=undefined;this.activities.select();this.activities.pause();this.options.onActivities(this.activities.snapshot());this.actorSprites.clear();
    this.physics.world.colliders.destroy();
    this.npcGroup?.destroy(true);this.sensors?.destroy(true);
    for(const object of this.children.getAll())object.destroy();this.map?.destroy();this.extraMap?.destroy();this.extraMap=undefined;
    const p=this.options.position(),definition=this.options.data.maps[p.map],symbols=Object.keys(this.options.data.tiles);
    this.mapId=p.map;
    this.map=this.make.tilemap({data:definition.tiles.map(row=>[...row].map(s=>symbols.indexOf(s))),tileWidth:16,tileHeight:16});
    const tiles=this.map.addTilesetImage('village-tiles','village-tiles',16,16,0,0);
    if(!tiles)throw Error('Tile texture unavailable');
    const terrain=this.map.createLayer(0,tiles,0,0);if(!terrain)throw Error('Tile layer unavailable');this.terrain=terrain;
    terrain.setCollision(symbols.flatMap((s,i)=>this.options.data.tiles[s].walkable?[]:[i]));
    if(definition.collision){
      const extra=this.make.tilemap({data:definition.collision.map(row=>[...row].map(v=>v==='1'?0:-1)),tileWidth:16,tileHeight:16});
      this.extraMap=extra;
      const set=extra.addTilesetImage('village-tiles','village-tiles',16,16,0,0);
      this.extraCollision=set?extra.createLayer(0,set,0,0)??undefined:undefined;
      this.extraCollision?.setCollision(0).setVisible(false);
    }else this.extraCollision=undefined;
    const art=this.add.graphics().setDepth(1);
    if(p.map==='house'||definition.furniture?.length)drawInteriorArt(this,definition,p.map==='house');
    if(p.map==='village'&&definition.scenery){drawVillageArt(this,definition);terrain.setVisible(false);} // Baked ground replaces tile drawing; collision data stays active.
    if(p.map==='hills'){drawHillsArt(this,definition);terrain.setVisible(false);}
    for(const b of (p.map==='village'&&definition.scenery?[]:definition.buildings)){
      const x=b.x*16,y=b.y*16,w=b.w*16,h=b.h*16;
      art.fillStyle(Phaser.Display.Color.HexStringToColor(b.color).color).fillRect(x,y+7,w,h-7);
      art.fillStyle(0xa4875d).fillRect(x-2,y,w+4,13);art.fillStyle(0xd4b582).fillRect(x,y+2,w,3);
      for(let wx=x+10;wx<x+w-8;wx+=32){art.fillStyle(0x766549).fillRect(wx,y+22,11,13);art.fillStyle(0x6d9691).fillRect(wx+2,y+24,7,9);}
      const door=definition.tiles[b.y+b.h-1].indexOf('d',b.x);if(door>=b.x&&door<b.x+b.w)art.fillStyle(0x6d5942).fillRect(door*16,y+h-15,16,16);
      if(b.label)this.add.text(x+w/2,y+6,b.label.toUpperCase(),{fontFamily:'monospace',fontSize:'8px',color:'#f9eccb'}).setOrigin(.5).setDepth(2);
    }
    for(const region of definition.regions)this.add.text((region.x+region.w/2)*16,(region.y+region.h)*16,region.name,{fontFamily:'monospace',fontSize:'8px',color:'#f4e6bc',backgroundColor:'#344b3d',padding:{x:3,y:2}}).setOrigin(.5).setDepth(2);
    this.npcGroup=this.physics.add.staticGroup();this.sensors=this.physics.add.staticGroup();
    this.player=this.physics.add.sprite(p.x*16+8,p.y*16+8,this.options.appearance(),facingIndex[p.facing]*2).setDepth(p.y*16+16);
    this.player.body?.setSize(14,14);this.player.setCollideWorldBounds(true);
    this.probe=this.physics.add.sprite(0,0,'neutral',0).setVisible(false);this.probe.body?.setSize(14,14);
    this.physics.add.collider(this.player,terrain);
    if(this.extraCollision)this.physics.add.collider(this.player,this.extraCollision);
    this.physics.add.collider(this.player,this.npcGroup);
    this.physics.world.setBounds(0,0,definition.tiles[0].length*16,definition.tiles.length*16);
    this.resizeCamera();
    this.marker=this.add.text(0,0,'!',{fontFamily:'monospace',fontSize:'10px',color:'#69593e',backgroundColor:'#fff0b9'}).setOrigin(.5,1).setDepth(10000);
    this.actorSignature='';this.sync();
  }
  resizeCamera():void {
    if(!this.player)return;
    const definition=this.options.data.maps[this.options.position().map],mapWidth=definition.tiles[0].length*16,mapHeight=definition.tiles.length*16;
    this.cameras.main.setBounds(Math.min(0,(mapWidth-this.scale.width)/2),Math.min(0,(mapHeight-this.scale.height)/2),Math.max(mapWidth,this.scale.width),Math.max(mapHeight,this.scale.height)).startFollow(this.player,true,1,1).setRoundPixels(true);
  }
  sync():void {
    if(!this.player)return;
    if(this.mapId!==this.options.position().map){this.loadMap();return;}
    const actors=this.activities.resolve(this.options.actors(),this.options.position());this.actors=actors;
    // Only the resolved placement/presentation affects bodies, not future schedules.
    const signature=JSON.stringify(actors.map(actor=>({...actor,schedule:undefined,...(actor.activity?{x:0,y:0,facing:undefined,stop:undefined,wait:undefined,turn:undefined}:{} )})));
    if(signature!==this.actorSignature){
      this.actorSprites.clear();this.npcGroup?.clear(true,true);this.sensors?.clear(true,true);
      for(const actor of actors){
        if(actor.sprite){const sprite=this.physics.add.staticSprite(actor.x*16+8,actor.y*16+8,actor.sprite,facingIndex[actor.facing??'down']*2).setDepth(actor.y*16+16);sprite.setData('actor',actor);this.actorSprites.set(actor.id,sprite);const animation=actor.animations?.[actor.facing??'down'];if(animation&&this.anims.exists(animation))sprite.play(animation);this.npcGroup?.add(sprite);}
        else {const zone=this.add.zone(actor.x*16+8,actor.y*16+8,16,16);this.physics.add.existing(zone,true);zone.setData('actor',actor);this.sensors?.add(zone);}
      }
      this.actorSignature=signature;
    }
    for(const actor of actors){const sprite=this.actorSprites.get(actor.id);if(!sprite||!actor.activity)continue;const p=this.activities.visual(actor),direction=actor.facing??'down';
      sprite.setPosition(p.x*16+8,p.y*16+8).setDepth(p.y*16+16);(sprite.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();sprite.setData('actor',actor);
      if(p.moving)sprite.play(actor.sprite+'-'+direction,true);else{sprite.anims.stop();sprite.setFrame(facingIndex[direction]*2);}
    }
    const position=this.options.position();
    if(!this.movement&&(this.player.x!==position.x*16+8||this.player.y!==position.y*16+8)){this.player.body?.reset(position.x*16+8,position.y*16+8);this.player.setDepth(position.y*16+16);}
    const appearance=this.options.appearance();if(this.player.texture.key!==appearance)this.player.setTexture(appearance,facingIndex[this.options.position().facing]*2);
  }
  /** Adjacent actors come from Phaser's physics broadphase, then grid-facing order. */
  nearby():Actor|null {
    if(!this.player||this.movement)return null;
    const p=this.options.position(),[dx,dy]=directions[p.facing];
    const actors=this.physics.overlapRect(p.x*16-48,p.y*16-48,112,112,false,true).flatMap(body=>{
      const actor=body.gameObject.getData('actor') as Actor|undefined;
      return actor&&canInteract(this.options.data,p,actor,this.actors)?[actor]:[];
    });
    return actors.sort((a,b)=>Number(b.x===p.x+dx&&b.y===p.y+dy)-Number(a.x===p.x+dx&&a.y===p.y+dy))[0]??null;
  }
  relocate():void {
    this.cancelRoute();this.activities.pause();this.movement?.stop();this.movement=undefined;this.playerTarget=undefined;this.player?.anims.stop();this.sync();
  }
  cancelRoute():void {this.controller?.cancel();this.activities.select();}
  manual(direction:Direction):boolean {this.activities.select();return this.controller?.manual(direction)??this.step(direction);}
  step(direction:Direction):boolean {
    if(!this.player||!this.probe||!this.terrain||this.movement||!this.options.active())return false;
    this.sync();
    const p=this.options.position(),[dx,dy]=directions[direction],x=p.x+dx,y=p.y+dy;
    const tile=this.terrain.getTileAt(x,y),extra=this.extraCollision?.getTileAt(x,y);
    this.player.setFrame(facingIndex[direction]*2);
    this.probe.body?.reset(x*16+8,y*16+8);
    if(this.activities.occupancy(this.actors).some(a=>a.x===x&&a.y===y)||!tile||tile.collides||extra?.collides||(this.npcGroup&&this.physics.overlap(this.probe,this.npcGroup))){this.options.onMove({...p,facing:direction},false);return false;}
    const transition=this.options.data.maps[p.map].transitions.find(t=>t.x===x&&t.y===y);
    if(transition&&this.options.allowedMaps&&!this.options.allowedMaps().includes(transition.to))return false;
    const target={...p,x,y,facing:direction};this.playerTarget={x,y};
    this.player.play(this.options.appearance()+'-'+direction,true);
    this.movement=this.tweens.add({targets:this.player,x:x*16+8,y:y*16+8,duration:115,
      onUpdate:()=>{if(this.player){this.player.body?.reset(this.player.x,this.player.y);this.player.setDepth(this.player.y+8);}},
      onComplete:()=>{
        this.movement=undefined;this.playerTarget=undefined;this.player?.anims.stop();
        if(!this.options.active()){this.player?.body?.reset(p.x*16+8,p.y*16+8);this.player?.setFrame(facingIndex[p.facing]*2);return;}
        this.player?.setFrame(facingIndex[direction]*2);
        const entrance=this.options.data.maps[p.map].transitions.find(t=>t.x===x&&t.y===y);
        const next=entrance?recover(this.options.data,{map:entrance.to,...entrance.spawn,facing:direction}):target;
        this.options.onMove(next,!!entrance);if(entrance)this.loadMap();
      }});
    return true;
  }
  inspect():{actors:Array<{id:string;x:number;y:number;visual:Point;moving:boolean}>;version:string;camera:{x:number;y:number};moving:boolean;physicsPaused:boolean;tilemap:string;frame:string|number;colliders:number;updateObjects:number;player:{x:number;y:number}} {
    return {actors:this.actors.map(a=>{const visual=this.activities.visual(a);return {id:a.id,x:a.x,y:a.y,visual,moving:visual.moving};}),updateObjects:this.sys.updateList.getActive().length,player:{x:((this.player?.x??8)-8)/16,y:((this.player?.y??8)-8)/16},version:Phaser.VERSION,camera:{x:this.cameras.main?.scrollX??0,y:this.cameras.main?.scrollY??0},moving:!!this.movement,physicsPaused:this.physics.world?.isPaused??true,tilemap:this.map?.constructor.name??'',frame:this.player?.frame.name??'',colliders:this.physics.world?.colliders.getActive().length??0};
  }
  resolveActors(actors:Actor[]):Actor[] {return this.activities.resolve(actors,this.options.position());}
  resetActivities():void {this.activities.reset();this.sync();}
  activitySnapshot():Record<string,ActivityState> {return this.activities.snapshot();}
  update(_time:number,delta:number):void {
    const active=this.options.active();
    if(!active&&this.wasActive){
      this.cancelRoute();this.activities.pause();this.movement?.stop();this.movement=undefined;this.playerTarget=undefined;this.sync();
      const p=this.options.position();this.player?.body?.reset(p.x*16+8,p.y*16+8);this.player?.anims.stop();this.player?.setFrame(facingIndex[p.facing]*2);this.physics.pause();
    }else if(active&&!this.wasActive)this.physics.resume();
    this.wasActive=active;
    if(active){this.sync();this.activities.tick(delta,this.actors,this.options.position(),this.playerTarget);this.sync();const target=this.nearby();this.marker?.setVisible(!!target);if(target)this.marker?.setPosition(target.x*16+8,target.y*16-5);}
    if(active)this.controller?.tick();else this.controller?.cancel();
    if(!this.controller?.routing)this.activities.select();
    this.options.onFrame();
  }
}
export function createPhaserWorld(options:WorldOptions):{step:(dir:Direction)=>boolean;cancelRoute:()=>void;relocate:()=>void;nearby:()=>Actor|null;sync:()=>void;resize:()=>void;destroy:()=>void;scene:VillageScene;game:Phaser.Game} {
  const scene=new VillageScene(options);
  const game=new Phaser.Game({type:Phaser.CANVAS,canvas:options.canvas,width:options.canvas.width,height:options.canvas.height,backgroundColor:'#293d36',banner:false,
    render:{pixelArt:true,antialias:false},audio:{noAudio:true},physics:{default:'arcade',arcade:{gravity:{x:0,y:0}}},scene:[scene],input:{keyboard:false,mouse:false,touch:false}});
  // ScaleManager.canvas is assigned during boot, after the Game constructor.
  // Mobile viewport events can arrive in that gap; apply the latest size on READY.
  let destroyed=false;
  const resize=()=>{
    if(!game.scale.canvas||destroyed)return;
    const parent=options.canvas.parentElement;
    if(!parent?.clientWidth||!parent.clientHeight)return; // Keep the mounted scene sized while learning hides it.
    const small=window.innerWidth<600,width=small?256:512,height=small?192:320;
    if(game.scale.width!==width||game.scale.height!==height){game.scale.resize(width,height);scene.resizeCamera();}
    const ratio=width/height,size=Math.max(1,Math.min(parent.clientWidth,parent.clientHeight*ratio));
    options.canvas.style.width=size+'px';options.canvas.style.height=size/ratio+'px';
  };
  game.events.once(Phaser.Core.Events.READY,resize);
  return {step:dir=>scene.manual(dir),cancelRoute:()=>scene.cancelRoute(),relocate:()=>scene.relocate(),nearby:()=>scene.nearby(),sync:()=>scene.sync(),resize,destroy:()=>{destroyed=true;game.events.off(Phaser.Core.Events.READY,resize);game.destroy(false);},scene,game};
}
