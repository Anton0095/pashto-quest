import assert from 'node:assert/strict';
import {setup,tutorial} from './browser-fixture.mjs';
const b=await setup({bridge:false});try{
 const context=await b.browser.newContext(),a=await context.newPage(),stale=await context.newPage();await a.goto(b.url);await stale.goto(b.url);await tutorial(a);
 const read=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('pashto-town-days-v1')));
 const before=await read(a);assert.equal(before.xp,65);assert(before.tutorialDone);
 await stale.locator('[data-onboarding-pace="4"]').click();assert.deepEqual(await read(a),before);assert(await stale.locator('#saveWarning').isVisible());
 await a.reload();const resumed=await read(a);assert.equal(resumed.xp,65);assert(resumed.tutorialDone);assert.deepEqual(resumed.rewards,before.rewards);assert.deepEqual(resumed.library.units,before.library.units);assert.equal(resumed.library.requestedDailyTarget,24);assert(await a.locator('#worldScreen').isVisible());
 await stale.reload();assert.deepEqual(await read(stale),resumed);assert(!(await stale.locator('#saveWarning').isVisible()));
 console.log('PASS ordinary two-tab onboarding/pace conflict, reload, newer data preserved');
}finally{await b.close()}
