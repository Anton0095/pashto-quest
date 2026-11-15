import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {setup,answerCurrent} from './browser-fixture.mjs';
mkdirSync('work/lesson-fixes',{recursive:true});
for(const width of [1280,390]){
 const b=await setup({width,rpg:true,mobile:width===390,offline:true,transform:h=>h.replace('// @TEST_HOOK','window.__fix={rpg,ui,fence:saveFence}; // @TEST_HOOK')}),p=b.page;
 try{
  await p.setViewportSize({width,height:width===390?844:900});await p.locator('#startTutorial').click();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);
  async function fixture(schoolDone=false){await p.evaluate(async schoolDone=>{const t=__test;t.state.progress=t.progression.fresh();t.state.progress.tutorialDone=true;t.state.session=null;t.progression.completeChallengeOnce(t.state.progress,1,15);if(schoolDone){t.state.progress.complete['2-school']=true;t.E.unlock(t.state.progress,2,'acknowledged-fixture-concept');}await t.storage.save();await __fix.rpg.flush();const key='pashto-quest-rpg-world-v1',raw=localStorage.getItem(key),w=JSON.parse(raw);Object.assign(w,{chapter:'day-2',view:'world',position:{map:'village',x:70,y:45,facing:'up'},flags:{started:true,metGuide:true},triggers:{welcome:true},lesson:null,educationFingerprint:null,routes:{}});delete w.dialogue;const next=JSON.stringify(w);await navigator.locks.request(key,()=>__fix.fence.commit(key,raw,next,()=>localStorage.getItem(key),()=>{localStorage.setItem(key,next);return true;}));},schoolDone);await p.reload();await p.waitForFunction(()=>document.getElementById('rpgCanvas')?.dataset.phaser);}
  async function quick(){if(!await p.locator('[data-destination=school]').isVisible())await p.getByText('Quick travel',{exact:true}).click();}
  await fixture();await quick();assert(await p.locator('[data-destination=residential]').isDisabled());await p.locator('[data-destination=school]').click();
  async function toGrammar(){await p.waitForFunction(()=>!document.getElementById('teachPanel').classList.contains('hidden')||!document.getElementById('grammarPanel').classList.contains('hidden'));for(let i=0;i<80&&await p.locator('#teachPanel').isVisible();i++)await p.locator('#teachNext').click();await p.locator('#grammarPanel').waitFor();}
  await toGrammar();assert(!await p.locator('#grammarNext').isDisabled());assert.match(await p.locator('#guideMessage').textContent(),/First learn today/);await p.locator('#grammarNext').click();await toGrammar();const demo=p.locator('#grammarPanel .sov-demo');assert(await p.locator('#grammarNext').isDisabled());assert.match(await p.locator('#guideMessage').textContent(),/Ms Hameed — حمید: Here at/);
  assert(await p.locator('#lessonScreen').evaluate(e=>e.scrollHeight<=e.clientHeight+2),'Initial SOV fits its learning surface');
  const ps=await p.evaluate(()=>__test.content.wordById[document.querySelector('.sov-demo').dataset.exampleId].ps);
  const snapshot=()=>p.evaluate(()=>JSON.stringify({xp:__test.state.progress.xp,acquired:__test.state.progress.library.acquired}));const before=await snapshot();
  for(const button of await demo.locator('.word-tiles button').all())await button.click();await demo.getByRole('button',{name:'Check sentence',exact:true}).click();
  if(await p.locator('#grammarNext').isDisabled()){await demo.getByRole('button',{name:'Clear',exact:true}).click();for(const token of ps.replace(/[.!؟،]/g,'').split(/\s+/))await demo.locator('.word-tiles button:enabled').getByText(token,{exact:true}).first().click();await demo.getByRole('button',{name:'Check sentence',exact:true}).click();}
  assert.equal(await demo.locator('[data-role]').count(),3);assert(!await p.locator('#grammarNext').isDisabled());assert.equal(await snapshot(),before,'Guided work grants no XP/SRS');assert.equal(await demo.locator('.built-sentence').getAttribute('dir'),'rtl');
  assert(await p.locator('#lessonScreen').evaluate(e=>e.scrollHeight<=e.clientHeight+2),'Completed SOV fits its learning surface');
  assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));await p.screenshot({path:`work/lesson-fixes/sov-${width}.png`,fullPage:true});await p.locator('#grammarNext').click();for(let i=0;i<240&&await p.locator('#lessonScreen').isVisible();i++){
    if(await p.locator('#teachPanel').isVisible())await p.locator('#teachNext').click();
    else if(await p.locator('#quizPanel').isVisible()){await answerCurrent(p);await p.locator('#quizNext').click();}
    else throw Error('Unexpected lesson phase');
  }
  if(await p.locator('#lessonScreen').isVisible())throw Error('Lesson did not end: '+JSON.stringify(await p.evaluate(()=>({phase:__test.state.session?.phase,queue:__test.state.session?.queue?.slice(0,2),answered:__test.state.session?.answered,firstCorrect:__test.state.session?.firstCorrect,locked:__test.state.session?.locked}))));
  await p.locator('#resultWorld').click();await p.locator('#worldScreen').waitFor();
  await p.locator('#rpgLibrary').click();await p.getByRole('button',{name:'Grammar Journal',exact:true}).click();assert.equal(await p.locator('#libraryBody .sov-demo[data-example-id]').count(),1);await p.locator('#libraryClose').click();
  await quick();assert(!await p.locator('[data-destination=residential]').isDisabled());await p.locator('[data-destination=residential]').click();
  await p.locator('#teachPanel').waitFor();const home=await p.evaluate(()=>({words:__test.state.session.studyWords.map(id=>__test.content.wordById[id].en),refs:__test.state.session.studyWords.flatMap(id=>__test.content.LIBRARY_DATA.sourceMappings[id]||[]),complete:__test.state.progress.complete}));assert(home.refs.some(r=>r.lemmaId==='lemma:v-have'&&r.formId==='lemma:v-have:3sg'),'Home introduces evidenced third-person have, not a mandatory infinitive');assert(!home.words.includes('To clean'));assert(!home.complete['2-nature']&&!home.complete['2-business']);
  await p.locator('#navWorld').click();
  for(const [loc,teacher]of [['residential','Muhammad Jan'],['business','Edris'],['nature','Deena']]){await fixture(true);await quick();await p.locator(`[data-destination=${loc}]`).click();await toGrammar();assert.match(await p.locator('#guideMessage').textContent(),new RegExp(teacher+' — .+: Here at'));await p.locator('#navWorld').click();}
  assert.deepEqual(b.errors,[]);console.log('PASS lesson fixes',width,'guided RTL SOV/roles without XP/SRS, School→Home, optional visits, Have allocation, four local teachers and Library demo');
 }catch(e){console.error(await p.evaluate(()=>({phase:__test.state.session?.phase,day:__test.state.day,guide:document.getElementById('guideMessage')?.textContent})),b.errors);await p.screenshot({path:'work/lesson-fixes/failure-'+width+'.png',fullPage:true});throw e;}finally{await b.close();}
}
