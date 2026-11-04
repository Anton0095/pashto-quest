import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runtime,plain} from './runtime-fixture.mjs';
const require=createRequire(import.meta.url),M=require('../work/rpg-model.cjs'),data=JSON.parse(readFileSync('content/RPG_WORLD.json'));
assert(M.RPGWorldData.validate(data));
const registry=M.createRPGRegistry(data,{afterTutorial:()=>true,beforeTutorial:()=>false});
for(let day=1;day<=7;day++){
 assert(data.days[day].maps.includes('house'));
 const occupants=registry.objects(day,'house'),queue=[data.maps.house.spawn],seen=new Set(queue.map(p=>p.x+','+p.y));
 for(let i=0;i<queue.length;i++)for(const [dx,dy]of Object.values(M.RPGWorldData.directions)){
  const p={x:queue[i].x+dx,y:queue[i].y+dy},k=p.x+','+p.y;
  if(!seen.has(k)&&M.RPGWorldData.walkable(data,'house',p.x,p.y,occupants)){seen.add(k);queue.push(p);}
 }
 for(const object of occupants)assert(M.approachTiles(data,'house',object,occupants).some(p=>seen.has(p.x+','+p.y)),object.id+' must be accessible');
 for(const exit of data.maps.house.transitions)assert(seen.has(exit.x+','+exit.y),'Every visible doorway tile must be reachable');
 assert(!M.RPGWorldData.walkable(data,'house',12,2),'Rear wall cannot be walked through');
 assert(!M.RPGWorldData.walkable(data,'house',7,11),'Square cushion collision');assert(seen.has('8,10'),'Rug walkable');
 assert(!M.RPGWorldData.walkable(data,'house',18,6),'Bed collision');assert(!M.RPGWorldData.walkable(data,'house',3,5),'Bookshelf collision');
}
const P=M.createPersistenceAPI(data,{});
for(const sleepIntent of [{from:1,to:3},{from:0,to:0},{from:99,to:100}])assert(!P.validate(data,{schemaVersion:1,sleepIntent}).sleepIntent);
assert.deepEqual(P.validate(data,{schemaVersion:1,sleepIntent:{from:1,to:2}}).sleepIntent,{from:1,to:2});
const t=runtime(),original=plain(t.state.progress);t.state.reviewCampaign=t.state.progress;t.state.progress=plain(original);t.state.progress.reviewOnly=true;
assert.equal(t.progression.awardXP(t.state.progress,'dream-test',100),0);assert.equal(t.progression.completeLessonOnce(t.state.progress,'1-residential','standard',true,4),0);
assert.deepEqual(JSON.parse(t.storage.snapshot()),original);assert.deepEqual(plain(t.state.reviewCampaign),original);
const oldTutorial={mode:'tutorial',id:'tutorial',loop:0,phase:'tutorial',cardIndex:3,attemptId:0,locked:false,profileGender:'unspecified',profileName:'Old name',required:['g-hello','g-how','tutorial-gender','tutorial-name'],studyWords:[],greetingCards:[],studySentences:[],firstAsked:['g-hello','g-how','tutorial-gender'],passed:['g-hello','g-how','tutorial-gender'],queue:[],built:[],earned:30};
const restored=P.restoreLesson(oldTutorial,t.content,t.state.reviewCampaign);
assert(restored);assert(!('profileName' in restored));assert(!('profileGender' in restored));assert.equal(restored.cardIndex,2);assert.equal(restored.earned,30);assert.deepEqual([...restored.required],['g-hello','g-how','tutorial-language','tutorial-guide-name']);assert.deepEqual([...restored.passed],['g-hello','g-how']);
// Current snapshots omit tutorial profile fields; invalid retained fields stay rejected.
const currentTutorial={...oldTutorial,required:['g-hello','g-how','tutorial-language','tutorial-guide-name'],cardIndex:2};
delete currentTutorial.profileName;delete currentTutorial.profileGender;
assert(P.restoreLesson(currentTutorial,t.content,t.state.reviewCampaign));
assert.equal(P.restoreLesson({...currentTutorial,profileName:42},t.content,t.state.reviewCampaign),null);
assert.equal(P.restoreLesson({...currentTutorial,profileGender:['male']},t.content,t.state.reviewCampaign),null);
// New lessons freeze the actual study pool; review must not silently drop words/forms
// that campaign completion has since marked introduced.
const warm=runtime();warm.state.progress.tutorialDone=true;
const originalPool=[...warm.learning.libraryLessonPool(1,'residential')];
warm.progression.completeChallengeOnce(warm.state.progress,1,15);
const canonical=JSON.stringify(warm.state.progress);warm.state.reviewCampaign=warm.state.progress;warm.state.progress=JSON.parse(canonical);warm.state.progress.reviewOnly=true;
assert.deepEqual([...warm.learning.libraryLessonPool(1,'residential')],originalPool);
assert.equal(JSON.stringify(warm.state.reviewCampaign),canonical);
assert(warm.storage.currentSave(warm.state.reviewCampaign));
const corrupt=JSON.parse(canonical);corrupt.library.plans[1].studyPools.residential.push('not-a-card');assert(!warm.storage.currentSave(corrupt));
const prompts=JSON.parse(readFileSync('content/TUTORIAL_PROMPTS.json'));
assert.equal(prompts.approval.status,'user_approved');assert.equal(prompts.approval.nativeCertificationClaimed,false);
assert.deepEqual(prompts.prompts.map(p=>p.pashto),['ته کومه ژبه زده کوې؟','زما نوم څه دی؟']);
for(const value of [' Muhammad Jan ','MUHAMMAD JAN','Mohammad Jan','Mohammed   Jan'])assert(t.Q.evaluate({kind:'word',direction:'ps-en'},{en:'Muhammad Jan',acceptedEnglishAnswers:t.content.wordById['tutorial-guide-name'].acceptedEnglishAnswers},value));
assert(!t.Q.evaluate({kind:'word',direction:'ps-en'},{en:'Muhammad Jan'},'Player'));
console.log('PASS house reachability/collision across seven chapters, sleep-intent validation, isolated review snapshots/rewards, exact approved tutorial prompts and shared name validation');
