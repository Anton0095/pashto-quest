// Fixture/document integrity checks ONLY; this does not test the playable app.
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixture = JSON.parse(readFileSync(path.join(base,'tests/acceptance_fixtures.json'),'utf8'));
const docs = [
  'README.md','GAME_SPEC.md','CODEX_TASK.md','XP_MILESTONE_SPEC.md',
  'WEEK1_CONTENT_BLUEPRINT.md','CODE_AUDIT.md','ACCEPTANCE_TESTS.md','AGENTS.md',
  'LANGUAGE_REVIEW.md','reference/pashto_quest_days_1_5_narrative.html'
];
for(const name of docs){
  const dest=path.join(base,name);
  assert(existsSync(dest),`Missing file: ${name}`);
  assert(readFileSync(dest).length>100,`File too short: ${name}`);
}
assert.equal(fixture.dayProgression.length,7);
assert.equal(fixture.starting.mapLocations.length,4);
assert.equal(fixture.starting.level,1);
assert.equal(fixture.starting.title,'Newcomer');
assert.equal(fixture.dayProgression.at(-1).title,'New Resident');
assert.equal(fixture.dayProgression.at(-1).minCumulativeXp,1800);
let lastXp=-1;
let lastLevel=1;
for(const d of fixture.dayProgression){
  assert.equal(d.day,fixture.dayProgression.indexOf(d)+1,'Days must be sequential');
  assert.equal(d.questions,d.day===7?25:15,`Question count mismatch Day ${d.day}`);
  assert.equal(d.passingScore,d.day===7?20:12,`Pass score mismatch Day ${d.day}`);
  assert(d.minCumulativeXp > lastXp,'XP milestones must increase');
  assert(d.levelCap >= lastLevel,'Level cap must not drop');
  assert.equal(d.minCumulativeXp,fixture.xpPerLevel*(d.levelCap-1));
  assert.equal(d.title,d.day===7?'New Resident':'Newcomer');
  lastXp=d.minCumulativeXp;
  lastLevel=d.levelCap;
}
assert(!fixture.starting.mapLocations.includes('hills-story-only'),'Hills must not be a map zone');
assert(fixture.requiredCases.length>=10);
console.log('PASS: specification handoff files and expected XP/exam fixture are internally consistent.');
console.log('NOTE: This is not a gameplay test; Codex must implement and execute the acceptance tests against the app.');
