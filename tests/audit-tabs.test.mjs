import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {setup,tutorial} from './browser-fixture.mjs';
mkdirSync('docs/maintenance/audit',{recursive:true});
for(const width of [375,1280]){
const b=await setup({bridge:false,width});try{
 const context=await b.browser.newContext({viewport:{width,height:1000}}),a=await context.newPage(),stale=await context.newPage();await a.goto(b.url);await stale.goto(b.url);await tutorial(a);
 const read=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('pashto-town-days-v1')));
 await a.waitForFunction(()=>JSON.parse(localStorage.getItem("pashto-town-days-v1"))?.xp===65);
 const before=await read(a);assert.equal(before.xp,65);assert(before.tutorialDone);
 await stale.locator('[data-onboarding-pace="4"]').click();assert.deepEqual(await read(a),before);assert(await stale.locator('#saveWarning').isVisible());
 await stale.screenshot({path:`docs/maintenance/audit/tab-conflict-${width}.png`,fullPage:true});
 await a.reload();const resumed=await read(a);assert.equal(resumed.xp,65);assert(resumed.tutorialDone);assert.deepEqual(resumed.rewards,before.rewards);assert.deepEqual(resumed.library.units,before.library.units);assert.equal(resumed.library.requestedDailyTarget,24);assert(await a.locator('#worldScreen').isVisible());
 await stale.reload();assert.deepEqual(await read(stale),resumed);assert(!(await stale.locator('#saveWarning').isVisible()));
 console.log(width,'PASS ordinary two-tab onboarding/pace conflict, reload, newer data preserved');
}finally{await b.close()}

}
