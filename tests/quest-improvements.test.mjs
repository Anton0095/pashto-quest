import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {runtime,reset,beginAttempt,plain,study} from './runtime-fixture.mjs';
const M=createRequire(import.meta.url)('../work/rpg-model.cjs');
const data=JSON.parse(readFileSync('content/RPG_WORLD.json'));
// Stress the presentation planner independently of the expensive language pool.
const planner=vm.runInNewContext(readFileSync('src/question-engine.js','utf8')+'\n'+readFileSync('src/assessment-content.js','utf8')+'\n({createAssessmentContent,Q:QuestionEngine})');
const presentation=planner.createAssessmentContent({content:{curriculum:{days:Array.from({length:7},()=>({challenge:'test'}))}},progression:{getChallengeSpec:day=>({questionCount:day===7?25:15})}});
for(let seed=0;seed<256;seed++)for(const typing of [false,true])for(const day of [1,7]){
 const plan=presentation.blueprint(day,typing,planner.Q.randomFor(seed));
 assert.equal(plan.formats.length,day===7?25:15);
 for(let i=2;i<plan.formats.length;i++)assert(!(plan.formats[i]===plan.formats[i-1]&&plan.formats[i]===plan.formats[i-2]),'feasible mixed order');
}
// Skip opens access without any answer, acquisition, XP, SRS or reward writes.
const skip=runtime();const before=plain(skip.state.progress);
assert(skip.progression.completeOnboarding(skip.state.progress));assert.equal(skip.state.progress.tutorialDone,true);
assert.equal(skip.state.progress.onboardingIntroductionPending,true);assert.equal(skip.state.progress.xp,before.xp);
assert.deepEqual(plain(skip.state.progress.library),before.library);assert.deepEqual(plain(skip.state.progress.rewards),before.rewards);
assert.equal(skip.progression.completeOnboarding(skip.state.progress),false);
const normal=runtime();normal.progression.completeLessonOnce(normal.state.progress,'tutorial','tutorial',true,4);
assert.equal(normal.state.progress.onboardingIntroductionPending,true);
for(const loc of skip.content.zoneKeys)assert.equal(skip.learning.placeAccessible(1,loc),normal.learning.placeAccessible(1,loc));
assert(!data.events.welcome.actions.some(a=>a.type==='skip-tutorial'));
assert(data.events['onboarding-introduction'].lines.join(' ').includes('School'));
// Model map graph checks actual collision tiles, furniture and exits.
M.RPGWorldData.validate(data);
const start={map:'library',...data.maps.library.spawn,facing:'up'};
for(const target of [{x:6,y:4},{x:2,y:4},...data.maps.library.transitions])assert(M.findPath(data,start,[target],[]),JSON.stringify(target));
assert(data.maps.library.furniture.filter(f=>f.kind==='bookshelf').length>=2);
assert.equal(data.npcs.find(n=>n.id==='nayab').gender,'female');
for(const typing of [false,true])for(const day of [1,7,14]){
 const t=runtime({seedSource:()=>98765});reset(t);t.state.progress.enableTypingChallenges=typing;
 for(let d=1;d<day;d++)t.progression.completeChallengeOnce(t.state.progress,d,t.progression.getChallengeSpec(d).questionCount);
 t.state.day=day;beginAttempt(t,day);const qs=t.state.session.questions;
 const counts=qs.reduce((r,q)=>(r[q.answerFormat]++,r),{select:0,build:0,type:0});
 const plan=t.state.progress.library.plans[day];assert.deepEqual(plain(counts),plain(plan.assessmentDeficit.actualCategories));
 if(day===1)assert.deepEqual(counts,typing?{select:5,build:5,type:5}:{select:10,build:5,type:0});
 if(day===7)assert.deepEqual(counts,typing?{select:9,build:8,type:8}:{select:17,build:8,type:0});
 assert.equal(qs.length,day===1?15:25);assert.equal(qs.filter(q=>q.direction==='en-ps').length,Math.ceil(qs.length/2));
 for(const [i,q] of qs.entries()){
  if(i>=2&&!plan.assessmentDeficit.adaptedTasks)assert(!(q.answerFormat===qs[i-1].answerFormat&&q.answerFormat===qs[i-2].answerFormat),'spacing');
  const card=t.content.wordById[q.id];
  assert(t.Q.evaluate(q,card,q.direction==='en-ps'?card.ps:card.en));
  if(q.answerFormat==='select')assert.equal(q.choiceOrder.filter(v=>t.Q.evaluate(q,card,v)).length,1);
  if(q.answerFormat==='type')assert.equal(q.choiceOrder.length,0);
  if(!typing)assert.notEqual(q.answerFormat,'type');
 }
 assert.equal(new Set(qs.filter(q=>q.generated).map(q=>q.generated.ps)).size,qs.filter(q=>q.generated).length);
 const frozen=plain(qs);t.storage.save();assert.equal(t.storage.problem,null);t.state.progress.enableTypingChallenges=!typing;
 assert.deepEqual(plain(t.questions.selectChallenge(day)),frozen);t.storage.save();const restored=t.storage.load();assert(restored);assert.equal(t.storage.problem,null);assert.deepEqual(plain(restored.activeChallenge.questions),frozen);
}
// No sentence material: explicit valid fallback and recorded quota deviations.
const scarce=runtime();reset(scarce,8);scarce.content.LIBRARY_DATA.sentenceFrames={...scarce.content.LIBRARY_DATA.sentenceFrames,frames:[],compositeFrames:[]};
beginAttempt(scarce,1);assert(scarce.state.session.questions.every(q=>q.kind==='word'&&q.answerFormat==='select'));
assert.equal(scarce.state.progress.library.plans[1].assessmentDeficit.distributionDeviations.length,5);
// Narrative may be unfamiliar; selectable generated replies use the actual engine.
const t=runtime();reset(t);
for(let day=1;day<=7;day++){
 for(const loc of t.content.zoneKeys)study(t,day,loc);
 const pool=t.learning.availableSentences(day);
 const snapshot=JSON.stringify(t.state.progress),options=M.conversationChoices(data.conversations.bilal.days[day],pool,t.Q.randomFor(day));
 assert(options.length>=3&&options.length<=4);assert.equal(new Set(options.map(a=>a.label)).size,options.length);
 if(day>=4)assert(options.some(a=>a.label===data.conversations.bilal.days[day].response.pashto));
 for(const a of options.filter(a=>a.card.generated))assert(pool.some(c=>c.id===a.card.id));
 assert.equal(JSON.stringify(t.state.progress),snapshot,'optional replies never write learning state');
 const event=data.events[data.conversations.bilal.days[day].event];assert(event.pashto.ps);assert(event.pashto.roman);assert.equal(event.languageReview.userVerified,false);
 if(day<=3)assert(!/myster|unusual|shadow/i.test(event.languageReview.englishReviewOnly));
}
console.log('PASS quest improvements: shared honest onboarding, Library collision/reachability, Nayab identity, 15/25 quotas/directions, unique correct options, scarce-material fallbacks, frozen preference changes, seven-day licensed Bilal replies and honest narrative status');
