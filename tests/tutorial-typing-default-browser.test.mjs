import assert from 'node:assert/strict';
import {setup} from './browser-fixture.mjs';
const b=await setup({width:375,rpg:true,transform:h=>h.replace('// @TEST_HOOK','window.__tutorialRPG=rpg; // @TEST_HOOK')});const p=b.page;
try{
 await p.locator('#startTutorial').click();await p.evaluate(()=>__test.lessons.begin('tutorial'));
 for(const answer of ['Hello','How are you?','پښتو']){await p.locator('#tutorialInteraction button').getByText(answer,{exact:true}).click();await p.locator('#teachNext').click();}
 assert(await p.locator('#tutorialName').isVisible());assert.deepEqual(await p.evaluate(()=>__test.state.progress.typingPreferences),{en:false,ps:false});
 const xp=await p.evaluate(()=>__test.state.progress.xp);
 await p.getByRole('button',{name:'I cannot type',exact:true}).click();assert.equal(await p.evaluate(()=>__test.state.progress.xp),xp);assert(await p.locator('#teachNext').isDisabled());
 await p.evaluate(()=>__tutorialRPG.flush());await p.reload();await p.locator('#teachPanel').waitFor();assert.equal(await p.locator('#tutorialName').count(),0);await p.locator('#tutorialInteraction button').getByText('Muhammad Jan',{exact:true}).click();await p.locator('#teachNext').click();assert(await p.evaluate(()=>__test.state.progress.tutorialDone));assert.deepEqual(b.errors,[]);
 console.log('PASS tutorial typing default, explicit opt-out, no automatic credit, reload and completion');
}finally{await b.close();}
