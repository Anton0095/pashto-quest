import assert from 'node:assert/strict';
import {setup} from './browser-fixture.mjs';
const people=[['muhammad-jan','Muhammad Jan'],['edris','Edris'],['saleha','Saleha'],['hameed','Ms Hameed'],['mina','Mina']];
for(const width of [375,1280]){
 const b=await setup({width,mobile:width===375,rpg:true,bridge:false,offline:true,transform:h=>h.replace('// @TEST_HOOK','RPG_WORLD_DATA.events.welcome.messages='+JSON.stringify(people.map(([characterId,speaker])=>({characterId,speaker,text:'Portrait loading verification'})))+'; // @TEST_HOOK')});
 try{
  const p=b.page;await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);await p.locator('#rpgInteract').click();
  for(const [i,[id,name]] of people.entries()){
   const frame=p.locator('#rpgDialogue .character-portrait');assert.equal(await frame.getAttribute('data-character-id'),id);assert.equal(await frame.getAttribute('data-portrait-status'),'available');
   const actual=await frame.locator('img').evaluate(img=>({width:img.naturalWidth,height:img.naturalHeight,rendering:getComputedStyle(img).imageRendering}));assert.deepEqual(actual,{width:480,height:560,rendering:'pixelated'});assert((await p.locator('#rpgDialogue h2').innerText()).includes(name));
   if(i===0)await p.screenshot({path:`work/overhaul/portrait-${width}.png`,fullPage:true});
   if(i<people.length-1)await p.getByRole('button',{name:'Continue',exact:true}).click();
  }
  assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));assert.deepEqual(b.errors,[]);console.log('PASS approved portraits',width,'five Phaser-loaded textures, dynamic speakers, original cropped pixels, offline delivery, no smoothing or overflow');
 }finally{await b.close();}
}
