import assert from 'node:assert/strict';
import {runtime,reset,study,plain,beginAttempt} from './runtime-fixture.mjs';
const t=runtime();
for (const pace of [8,12,16,20,24]) {
 reset(t,pace);
 for (let day=1;day<=14;day++) {
  t.state.day=day;t.state.session=null;
  study(t,day,"school");t.state.session=null;
  const plan=t.E.ensurePlan(t.state.progress,t.content.LIBRARY_DATA,day), assignments=plain(plan.locationAssignments);
  const before=plain(t.state.progress);
  const failed=t.progression.completeChallengeOnce(t.state.progress,day,0);
  assert(!failed.passed);assert.equal(failed.locationBonus,0);
  assert.deepEqual(plain(t.state.progress.library),before.library);assert.deepEqual(plain(t.state.progress.complete),before.complete);
  beginAttempt(t,day);const frozen=plain(t.state.session.questions);
  const activated=plain(t.state.progress);
  assert.deepEqual(plain(t.state.progress.complete),before.complete);assert.equal(t.state.progress.xp,before.xp);
  assert.deepEqual(plain(t.state.progress.library.events),before.library.events);
  for(const [id,r] of Object.entries(t.state.progress.library.acquired)) {
   assert.equal(r.totalAttempts,before.library.acquired[id]?.totalAttempts || 0);
   if(!before.library.acquired[id]) {assert.equal(r.formallyIntroducedDay,undefined);assert.equal(r.masteredAt,undefined);}
  }
  t.progression.activateChallenge(t.state.progress,day);assert.deepEqual(plain(t.state.progress),activated,'activation is idempotent');
  t.progression.completeChallengeOnce(t.state.progress,day,0);
  assert.deepEqual(plain(t.state.progress.library),activated.library,'failure retains the already unlocked material');
  assert.deepEqual(plain(t.state.progress.complete),activated.complete);
  if(day===14)assert.deepEqual(plain(t.state.progress.library.acquired),before.library.acquired,'Day 14 activation adds no forms');
  const existing=plain(t.state.progress.library.acquired);
  const result=t.progression.completeChallengeOnce(t.state.progress,day,[7,14].includes(day)?20:12);
  assert(result.firstPass);assert.deepEqual(plain(plan.locationAssignments),assignments);
  assert.deepEqual(plain(t.state.session.questions),frozen,'grading does not reroll questions');
  assert(t.content.zoneKeys.every(loc=>t.state.progress.complete[`${day}-${loc}`]));
  assert(t.state.progress.library.grammar['grammar-day-'+day]);
  if(day===14)assert.deepEqual(plain(t.state.progress.library.acquired),existing,'Day 14 introduces no forms');
  for(const [loc,ids] of Object.entries(assignments))for(const id of ids){
   const r=t.state.progress.library.acquired[id];assert(r.availableFormIds.length);assert.equal(r.unlock.day,day);assert.equal(r.unlock.location,loc);assert.equal(r.unlock.source,loc==='school'?'study':'challenge-start');
  }
  for(const [id,r] of Object.entries(t.state.progress.library.acquired)) {
   assert.equal(r.totalAttempts,existing[id]?.totalAttempts || 0);
   assert.equal(r.correctAttempts,existing[id]?.correctAttempts || 0);
   assert.deepEqual(plain(r.practisedFormIds), existing[id]?.practisedFormIds || []);
   if(!existing[id]) {assert.equal(r.formallyIntroducedDay,undefined);assert.equal(r.masteredAt,undefined);}
   for(const [fid,f] of Object.entries(r.forms))if(!existing[id]?.forms[fid])assert.deepEqual(plain(f),{correctAttempts:0,totalAttempts:0,stage:0,srsDueAt:0});
  }
  for(const c of t.learning.availableSentences(day))for(const ref of Object.values(c.generated.slots)) assert(t.state.progress.library.acquired[ref.lemmaId].availableFormIds.includes(ref.formId));
  const stable=plain(t.state.progress),again=t.progression.completeChallengeOnce(t.state.progress,day,[7,14].includes(day)?25:15);
  assert.equal(again.locationBonus,0);assert.deepEqual(plain(again.newlyUnlocked),[]);assert.equal(t.state.progress.xp,stable.xp);assert.deepEqual(plain(t.state.progress.library),stable.library);
  t.state.session.finished=true;t.storage.save();assert.equal(t.storage.problem,null);const restored=t.storage.load();assert.equal(t.storage.problem,null);assert.deepEqual(plain(restored.library.acquired),plain(t.state.progress.library.acquired));
 }
}
reset(t);study(t,1,'residential');t.state.session=null;
const before=plain(t.state.progress);const partial=t.progression.completeChallengeOnce(t.state.progress,1,12);
assert.equal(partial.locationBonus,50);assert.deepEqual(plain(t.state.progress.library.acquired[Object.keys(before.library.acquired)[0]]?.unlock),before.library.acquired[Object.keys(before.library.acquired)[0]].unlock);
assert.equal(t.state.progress.complete['1-residential'],true);assert(t.learning.availableSentences(1).length>=2);
// A full normal route and a no-visit pass unlock the same licensed forms.
for(const pace of [8,12,24]) {
 const normal=runtime(),skip=runtime();reset(normal,pace);reset(skip,pace);
 // Freeze the same plan seed to compare identities, not random profiles.
 skip.state.progress.library.seed=normal.state.progress.library.seed;
 for(let day=1;day<=14;day++) {
  for(const loc of normal.content.zoneKeys)study(normal,day,loc);
  normal.state.session=null;
  normal.progression.completeChallengeOnce(normal.state.progress,day,[7,14].includes(day)?25:15);
  study(skip,day,"school");skip.progression.completeChallengeOnce(skip.state.progress,day,[7,14].includes(day)?25:15);
  const forms=x=>Object.entries(x.state.progress.library.acquired).flatMap(([id,r])=>r.availableFormIds.map(f=>id+':'+f)).sort();
  assert.deepEqual(plain(forms(normal)),plain(forms(skip)),`normal/pass availability ${pace}/${day}`);
 }
}
reset(t);study(t,1,'residential');
const card=t.learning.availableSentences(1)[0], acq=plain(t.state.progress.library.acquired);
for(const withDuds of [false,true]) {
 const q=t.questions.constructionQuestion(card,{withDuds}), tiles=t.Q.buildTiles(card,q,1);
 assert.equal(tiles.filter(t=>t.dud).length,withDuds?2:0);
 assert.deepEqual(plain(tiles.filter(t=>!t.dud).map(t=>t.word)),card.ps.replace(/[.!؟،]/g,'').split(/\s+/));
}
const q=t.questions.constructionQuestion({id:'fixture',ps:'مونږ مونږ',en:'fixture'},{withDuds:true,question:{acceptedPs:['تاسو تاسې']}}),tiles=t.Q.buildTiles({ps:'مونږ مونږ'},q,1);
assert.equal(tiles[0].word,tiles[1].word);assert.notEqual(tiles[0].index,tiles[1].index);
assert(q.duds.every(d=>!['موږ','مونږ','تاسو','تاسې'].includes(t.Q.normalizeAnswer(d))));
assert.deepEqual(plain(t.state.progress.library.acquired),acq);
reset(t);const backup=t.questions.constructionQuestion({id:'fixture',ps:'دا کور دی',en:'This is a house.'},{withDuds:true});assert.equal(backup.duds.length,2);assert.deepEqual(plain(t.state.progress.library.acquired),{});
console.log('PASS construction/completion: 70 day/pace passes, failures, repeats, frozen plans/assessments, honest SRS/provenance/rewards, normal/pass form equivalence, Day 14, reload and indexed exact/dud tiles');

// Dormant early-day dud metadata never alters a previously frozen exact puzzle.
const frozenExact={kind:"construct",duds:["کتاب","قلم"],tileSequence:[2,0,1]};
assert.equal(t.Q.buildTiles({ps:"دا کور دی"},frozenExact,1).length,3);
assert.equal(t.Q.buildTiles({ps:"دا کور دی"},{...frozenExact,tileVariant:"distractors"},1).length,5);

assert.equal(t.Q.buildTiles({ps:"دا کور دی"},{...frozenExact,tileVariant:"exact"},8).length,3,"explicit exact variant excludes all dud metadata");
