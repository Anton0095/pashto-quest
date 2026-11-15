import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runtime,reset,study} from './runtime-fixture.mjs';
const M=createRequire(import.meta.url)('../work/rpg-model.cjs'),world=JSON.parse(readFileSync('content/RPG_WORLD.json','utf8'));
const t=runtime();reset(t);
const expected={2:['school','Ms Hameed',3,'singular'],3:['nature','Deena',1,'singular'],4:['residential','Muhammad Jan',2,'singular'],5:['school','Ms Hameed',2,'plural'],6:['nature','Deena',1,'plural'],7:['business','Edris',3,'plural']};
function eligible(c,day){
 if(!c)return true;
 if(c.startsWith('all:'))return c.slice(4).split('|').every(c=>eligible(c,day));
 if(c.startsWith('complete:'))return !!t.state.progress.complete[c.slice(9)];
 if(c.startsWith('not-complete:'))return !t.state.progress.complete[c.slice(13)];
 if(c.startsWith('flag:'))return true;
 if(c.startsWith('not-flag:'))return false;
 if(c==='allLessons')return world.days[day].lessons.every(id=>t.state.progress.complete[id]);
 if(c==='not-allLessons')return !eligible('allLessons',day);
 if(c==='afterTutorial')return true;
 return false;
}
function registry(day){return M.createRPGRegistry(world,{},c=>eligible(c,day));}
function checkTeacher(day,loc){
 const teacher=t.content.teacherFor(day,loc,'standard').name,id=day+'-'+loc;
 const actors=world.days[day].maps.flatMap(map=>registry(day).npcs(day,map));
 assert(actors.some(actor=>actor.name===teacher&&world.events[actor.event].actions.some(a=>a.type==='lesson'&&a.lessonId===id)),`${id} map teacher must match curriculum teacher ${teacher}`);
}
for(let day=1;day<=7;day++){
 const c=world.days[day],curriculum=t.content.curriculum.days[day-1];
 if(day>1){const [loc,teacher]=expected[day];assert.equal(curriculum.opening,"school");assert.equal(world.events[c.openingEvent].speaker,teacher);if(day===6)assert.equal(c.start.map,'house');else assert(registry(day).npcs(day,c.start.map).some(n=>n.name===teacher));}
 if(day>1){const host=registry(day).npcs(day,c.challenge.map).find(n=>n.id===c.challenge.npc);assert(host&&world.events[host.event].actions.some(a=>a.type==='challenge'&&a.day===day),'Early challenge invitation follows the host before optional visits');}
 for(const id of c.lessons){const loc=id.split('-')[1];if(day>1)checkTeacher(day,loc);study(t,day,loc);}
 const cards=t.learning.availableSentences(day);
 if(day>1){
  const [, ,person,number]=expected[day];assert(cards.some(card=>card.generated.subjects?.some(s=>s.person===person&&s.number===number)),`Day ${day}: intended person/number is productive`);
  assert.equal(t.content.NARRATIVE_DATA.expressions.find(p=>p.day===day&&p.active).id,`phrase-day-${day}-opening`);
 }
 if(day===4)assert(cards.some(c=>c.generated.family==='coordinated_present'));
 if(day===5)assert.equal(registry(day).npcs(day,'village').filter(a=>a.x>=62&&a.y>=17&&a.y<=21).length,4,'All four adults gather at Lake');
 if(day===6){assert.equal(registry(day).npcs(day,'hills').length,2);assert(registry(day).npcs(day,'hills').some(n=>n.characterId==='mina'));}
 if(day===7)assert(registry(day).npcs(day,'village').some(n=>n.characterId==='hameed'&&n.x===70&&n.y===44),'Exam host returns to School');
 const spec=t.progression.getChallengeSpec(day);assert.equal(spec.questionCount,day===7?25:15);assert.equal(spec.passCount,day===7?20:12);
 t.progression.completeChallengeOnce(t.state.progress,day,spec.passCount);assert(t.learning.allowed(day+1));
 const xp=t.state.progress.xp;t.progression.completeChallengeOnce(t.state.progress,day,spec.passCount);assert.equal(t.state.progress.xp,xp,'No duplicate rewards');
}
assert.equal(t.progression.characterStatus(t.state.progress).title,'New Resident');
console.log('PASS Days2–7 openings, teacher handoffs and relocations, greetings, productive person/number, compounds, Lake gathering, Medina/Hills, School exam, unlocks and once-only rewards');
