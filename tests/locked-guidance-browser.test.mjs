import assert from 'node:assert/strict';
import {setup} from './browser-fixture.mjs';
import {driver} from './rpg-week1-driver.mjs';
// Move the prerequisite teacher in this fixture: hard-coded School directions
// must fail while the educational district and progression guard stay School.
const seed=`state.progress=progression.fresh();state.progress.tutorialDone=true;for(let d=1;d<3;d++)progression.completeChallengeOnce(state.progress,d,15);state.day=3;RPG_WORLD_DATA.firstDay=3;for(const slot of RPG_WORLD_DATA.npcs.find(n=>n.id==='hameed').schedule.filter(s=>s.day===3)){slot.map='village';slot.x=76;slot.y=27;}`;
const b=await setup({width:1280,rpg:true,transform:h=>h.replace('const rpg = RPG_ENABLED ?',seed+'const rpg = RPG_ENABLED ?').replace('// @TEST_HOOK','window.__week1Inspect=()=>rpg.diagnostics(); // @TEST_HOOK')});
try{
 const p=b.page,d=driver(p);await p.locator('#rpgCanvas').waitFor();await d.actor('jan-home',3);await p.locator('#rpgInteract').click();while(await p.getByRole('button',{name:'Continue',exact:true}).count())await p.getByRole('button',{name:'Continue',exact:true}).click();
 await p.screenshot({path:'work/locked-guidance-moved.png'});const text=await p.locator('#rpgDialogue').innerText();assert.match(text,/Visit Lake — Ms Hameed first/);
 assert.equal(await p.getByRole('button',{name:'Study at Home',exact:true}).count(),0);
 await p.getByRole('button',{name:'Back to village',exact:true}).click();await p.evaluate(()=>__test.studySchool(3));await d.actor('jan-home',3);await p.locator('#rpgInteract').click();while(await p.getByRole('button',{name:'Continue',exact:true}).count())await p.getByRole('button',{name:'Continue',exact:true}).click();
 assert(await p.getByRole('button',{name:'Study at Home',exact:true}).isVisible());assert(!/Visit Lake — Ms Hameed first/.test(await p.locator('#rpgDialogue').innerText()));assert.deepEqual(b.errors,[]);
 console.log('PASS locked teacher guidance follows moved prerequisite teacher; School guard and own lesson access remain authoritative');
}finally{await b.close();}
