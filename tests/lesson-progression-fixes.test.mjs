import assert from 'node:assert/strict';
import {runtime,reset,study,plain} from './runtime-fixture.mjs';
const t=runtime();reset(t);
assert.deepEqual(plain(t.E.presets),[8,12,16,20,24]);assert.equal(t.state.progress.library.requestedDailyTarget,24);
assert.equal(t.progression.SAVE_VERSION,8);const old=t.progression.fresh();old.saveSchemaVersion=7;assert(!t.storage.currentSave(old));for(const pace of [0,4]){const p=t.progression.fresh();p.library.requestedDailyTarget=pace;assert(!t.storage.currentSave(p));assert(!t.E.setPace(t.state.progress,pace,1).ok);}
t.progression.completeChallengeOnce(t.state.progress,1,15);for(const loc of t.content.zoneKeys)assert.equal(t.learning.placeAccessible(2,loc),loc==='school');t.state.progress.complete['2-school']=true;for(const loc of t.content.zoneKeys)assert(t.learning.placeAccessible(2,loc));assert(!t.state.progress.complete['2-business']&&!t.state.progress.complete['2-nature']);assert(t.learning.allowed(2));
reset(t);for(const loc of t.content.zoneKeys)study(t,1,loc);const plan=t.E.ensurePlan(t.state.progress,t.content.LIBRARY_DATA,2);assert(plan.locationAssignments.residential.includes('lemma:v-have'));assert(!plan.locationAssignments.residential.includes('lemma:v-clean'));
study(t,2,'school');const school=new Set(plan.lessonNewLexemes.school);study(t,2,'residential');const home=new Set(plan.lessonNewLexemes.residential);assert([...school].every(id=>!home.has(id)),'Earlier-day words are not new Home vocabulary');
for(const c of t.state.session.generatedPractice)assert(Object.values(c.generated.slots).some(r=>home.has(r.lemmaId)));
const have=t.content.libraryEntries['lemma:v-have'];assert.deepEqual(plain(have.forms.map(f=>f.pashto)),['لرل','لرم','لرې','لري','لرو','لرئ','لري']);assert(have.forms.every(f=>!f.userVerified));assert.equal(have.generationSemantics.third,'has');assert.deepEqual(plain(have.generationSemantics.objectClasses),['ownable']);assert.equal(t.content.libraryEntries['lemma:v-clean'].introduction.day,3);
// An impossible current-lesson target has a bounded vocabulary/form fallback.
plan.generatedPractice={};plan.generatedPracticeCards={};plan.lessonNewLexemes.residential=['lemma:expansion:noun:grandfather'];const s=t.state.session;s.generatedPrepared=false;s.required=[];s.queue=[];t.learning.prepareSentences(s);assert(s.studySentences.length>0);assert.equal(s.generationDeficit.currentLessonSentenceCount,0);assert.equal(s.generationDeficit.fallback,'cumulative-practice');
// No new noun/verb retains cumulative generation; assessments are unrestricted.
plan.generatedPractice={};plan.lessonNewLexemes.residential=[];s.generatedPrepared=false;s.required=[];s.queue=[];t.state.progress.library.deliveries={};t.learning.prepareSentences(s);assert(s.studySentences.length>0);
const p=t.progression.fresh();p.tutorialDone=true;p.library.requestedDailyTarget=8;const fourteenth=t.E.ensurePlan(p,t.content.LIBRARY_DATA,14);assert.equal(fourteenth.requestedDailyTarget,0);assert.equal(p.library.requestedDailyTarget,8);
console.log('PASS Day2 immediate Home, optional visits, five paces/default/old-save rejection, Have forms/allocation/semantics, per-lesson noun/verb targets and bounded/cumulative fallbacks');

const skip=runtime();reset(skip);skip.progression.activateChallenge(skip.state.progress,1);skip.learning.libraryLessonPool(1,'residential');assert(skip.state.progress.library.plans[1].lessonNewLexemes.residential.length>0,'Availability from challenge activation is not fabricated physical study');
console.log('PASS new lesson vocabulary separates availability from actual first study');

const interrupted=runtime();reset(interrupted);interrupted.learning.libraryLessonPool(1,'residential');study(interrupted,1,'school');const elsewhere=new Set(interrupted.state.progress.library.plans[1].lessonNewLexemes.school);study(interrupted,1,'residential');assert(interrupted.state.progress.library.plans[1].lessonNewLexemes.residential.every(id=>!elsewhere.has(id)),'Opening a lesson before learning elsewhere does not claim those later introductions');
console.log('PASS interrupted lesson introductions are attributed to the actual first teaching visit');
