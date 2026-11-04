import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {setup} from './browser-fixture.mjs';
const approved=JSON.parse(readFileSync('content/CHARACTER_PORTRAITS.json','utf8')).characters;
const people=[['muhammad-jan','Muhammad Jan'],['edris','Edris'],['saleha','Saleha'],['hameed','Ms Hameed'],['mina','Mina']];
for(const width of [375,1280]){
 const b=await setup({width,mobile:width===375,rpg:true,bridge:false,offline:true,transform:h=>h.replace('// @TEST_HOOK','window.__portraitUI=ui;RPG_WORLD_DATA.events.welcome.messages='+JSON.stringify(people.map(([characterId,speaker])=>({characterId,speaker,text:'Portrait loading verification'})))+'; // @TEST_HOOK')});
 try{
  const p=b.page;await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas').dataset.phaser);await p.locator('#rpgInteract').click();
  for(const [i,[id,name]] of people.entries()){
   const frame=p.locator('#rpgDialogue .character-portrait');assert.equal(await frame.getAttribute('data-character-id'),id);assert.equal(await frame.getAttribute('data-portrait-status'),'available');
   const actual=await frame.locator('img').evaluate(async img=>{await img.decode();const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const sum=await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,c.width,c.height).data);return {width:img.naturalWidth,height:img.naturalHeight,rendering:getComputedStyle(img).imageRendering,pixelSha256:Array.from(new Uint8Array(sum),b=>b.toString(16).padStart(2,'0')).join('')};});assert.deepEqual(actual,{width:480,height:560,rendering:'pixelated',pixelSha256:approved[id].pixelSha256});assert((await p.locator('#rpgDialogue h2').innerText()).includes(name));
   if(i===0)await p.screenshot({path:`work/overhaul/portrait-${width}.png`,fullPage:true});
   if(i<people.length-1)await p.getByRole('button',{name:'Continue',exact:true}).click();
  }
  const stable=await p.evaluate(()=>{
   const ui=__portraitUI;ui.setConversation({instructorId:'Muhammad Jan',speakerId:'Muhammad Jan',partnerId:'Saleha'});
   const instructor=document.querySelector('#speakerIcon img'),partner=document.querySelector('#participants img');
   for(let i=0;i<50;i++)ui.setConversation({speakerId:i%2?'Saleha':'Muhammad Jan'});
   const retained=instructor===document.querySelector('#speakerIcon img')&&partner===document.querySelector('#participants img');
   const speaker=document.getElementById('speakerName').dataset.activeSpeaker;
   ui.setConversation({instructorId:'Edris',speakerId:'Edris',partnerId:'Edris'});
   return {retained,speaker,instructor:document.querySelector('#speakerIcon .character-portrait').dataset.characterId,partners:document.querySelector('#participants').childElementCount};
  });assert.deepEqual(stable,{retained:true,speaker:'Saleha',instructor:'edris',partners:0});
  assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));assert.deepEqual(b.errors,[]);console.log('PASS approved portraits',width,'five Phaser-loaded textures, dynamic speakers, original cropped pixels, offline delivery, no smoothing or overflow');
 }finally{await b.close();}
}
