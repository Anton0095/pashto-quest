import assert from 'node:assert/strict';
import {setup} from './browser-fixture.mjs';
for(const width of [375,1280]) {
 const b=await setup({width});try {
 const result=await b.page.evaluate(async()=>{
  const t=__test,check=(ok,message)=>{if(!ok)throw Error(message)};let lessons=0;
  for(let day=1;day<=14;day++) {
   t.reset();t.state.progress.tutorialDone=true;t.state.progress.xp=1800;t.state.day=day;
   for(let n=1;n<day;n++){t.state.progress.challenges[n]={passed:true,best:[7,14].includes(n)?25:15,attempts:1};for(const loc of t.content.zoneKeys)t.state.progress.complete[n+'-'+loc]=true;}
   for(const loc of t.content.zoneKeys)t.state.progress.complete[day+'-'+loc]=true;
   const expected=day===1?'phrase-d1-home-welcome':`phrase-day-${day}-opening`;
   for(const loc of t.content.zoneKeys){
    t.lessons.begin(day+'-'+loc);const s=t.state.session;
    check(s.phase==='greeting'&&s.greetingCards[0]===expected,`${day}/${loc}: daily expression must be first`);
    check(document.getElementById('teachPashto').textContent===t.content.wordById[expected].ps,'wrong displayed phrase');
    if(day===5){t.lessons.afterStudy();check(document.getElementById('teachPashto').textContent==='وعلیکم السلام.','missing Day5 response study');check(document.getElementById('guideMessage').textContent.includes('السلام علیکم.'),'missing Day5 prompt');}
    if(day===7)check(document.getElementById('guideMessage').textContent.includes('السلام علیکم.'),'missing conversational prompt');
    lessons++;
   }
   const plan=JSON.stringify(t.state.progress.library.plans[day].locationAssignments);
   const qs=t.questions.selectChallenge(day);check(qs.length===([7,14].includes(day)?25:15),'changed assessment length');
   check(qs[0].id===([5,7].includes(day)?'phrase-day-7-opening':expected),'wrong first daily challenge phrase');
   if([5,7].includes(day))check(qs[0].kind==='construct'&&qs[0].phrasePromptId==='phrase-day-5-opening','must construct peace response');
   check(plan===JSON.stringify(t.state.progress.library.plans[day].locationAssignments),'phrase altered frozen lemma plan');
   if(day===14)check(Object.values(t.state.progress.library.plans[day].locationAssignments).flat().length===0,'Day14 quota changed');
  }
  await t.storage.settled();return {lessons};
 });assert.equal(result.lessons,56);assert.deepEqual(b.errors,[]);console.log(width,'PASS 56 first-card phrase surfaces, all 14 challenge openings/lengths, Day5/7 reply, Day14 zero quota');
 } finally {await b.close()}
}
