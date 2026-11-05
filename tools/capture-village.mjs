import {setup} from '../tests/browser-fixture.mjs';
import {mkdirSync} from 'node:fs';
mkdirSync('docs/rpg/village',{recursive:true});
for(const width of [1280,375]){
 const b=await setup({width,mobile:width===375,rpg:true,bridge:false,offline:true,transform:h=>h.replace('// @TEST_HOOK',`const oldCreate=PashtoRPG.VillageScene.prototype.create;PashtoRPG.VillageScene.prototype.create=function(){oldCreate.call(this);window.__scene=this;}; // @TEST_HOOK`)});
 try{
 const p=b.page;await p.locator('#startTutorial').click();await p.waitForFunction(()=>window.__scene?.player);
 await p.waitForTimeout(400);await p.screenshot({path:`docs/rpg/village/desktop-${width}.png`,fullPage:true});
 for(const [name,x,y] of [['residential',20,15],['lake',74,17],['market',22,45],['school',72,43]]){
  await p.evaluate(([x,y])=>{__scene.cameras.main.stopFollow();__scene.cameras.main.centerOn(x*16,y*16);},[x,y]);await p.waitForTimeout(200);await p.locator('#rpgCanvas').screenshot({path:`docs/rpg/village/${name}-${width}.png`});
 }
 if(width===1280){await p.evaluate(()=>{__scene.scale.resize(1536,1024);__scene.cameras.main.stopFollow();__scene.cameras.main.setBounds(0,0,1536,1024).setScroll(0,0);});await p.waitForTimeout(300);await p.locator('#rpgCanvas').screenshot({path:'docs/rpg/village/complete.png'});}
 console.log('errors',b.errors);
 }finally{await b.close();}
}
