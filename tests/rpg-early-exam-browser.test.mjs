import assert from 'node:assert/strict';
import {setup} from './browser-fixture.mjs';
import {driver} from './rpg-week1-driver.mjs';
// Development-only fixture: prior days use real completion transactions. No day
// selector, test bridge or unrestricted skipping is added to the production UI.
const fixture=`if(!state.progress.tutorialDone){state.progress=progression.fresh();state.progress.tutorialDone=true;state.progress.playerProfile={name:'Exam fixture',gender:'unspecified'};for(let d=1;d<=6;d++)progression.completeChallengeOnce(state.progress,d,15);state.day=7;}`;
const b=await setup({width:375,mobile:true,rpg:true,bridge:false,offline:true,transform:h=>h.replace('const rpg = RPG_ENABLED ?',fixture+'const rpg = RPG_ENABLED ?').replace('// @TEST_HOOK','window.__week1Inspect=()=>rpg.diagnostics(); // @TEST_HOOK')});
const p=b.page,d=driver(p);
try{
 await p.locator('#rpgDialogue').waitFor();await d.dialogue('Explore first');
 assert(!Object.keys((await d.progress()).complete).some(id=>id.startsWith('7-')));
 await d.actor('hameed',7);await d.talk('Day 7 challenge · 25 questions');
 await d.dialogue('Start early challenge');await p.locator('#quizPanel').waitFor();
 await p.waitForFunction(()=>JSON.parse(localStorage.getItem('pashto-quest-rpg-education-v1')).activeChallenge?.questions.length===25);
 assert.equal((await d.progress()).activeChallenge.questions.length,25);
 await d.assessment(7,{reload:true});await d.dialogue('Finish Week 1');await d.durable();
 const result=await d.progress();assert(result.challenges[7].passed);assert.equal(result.challenges[7].best,25);
 assert.equal(await p.locator('#resultHeading').innerText(),'Pashto Quest — Week 1 Complete');
 await p.reload();await p.locator('#resultScreen').waitFor();assert.equal((await d.progress()).xp,result.xp);
 assert.deepEqual(b.errors,[]);console.log('PASS early Day7 exam from visiting Ms Hameed: invitation, 25 questions, exact reload, genuine pass, graduation and reward lock');
}finally{await b.close();}
