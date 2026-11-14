import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const M=createRequire(import.meta.url)('../work/rpg-model.cjs'),data=JSON.parse(readFileSync('content/RPG_WORLD.json'));
for(let day=1;day<=7;day++){
 assert(M.conversationEligible({complete:{[day+'-school']:true}},day,{passedChallenge:()=>false}));
 assert(!M.conversationEligible({complete:{}},day,{passedChallenge:()=>false}));
 const spec=data.conversations.bilal.days[day],card={id:spec.response.generatedId,ps:spec.response.pashto,en:spec.response.meaning,roman:'reference',generated:{slots:{}}};
 for(const previouslySpoken of [false,true])assert.equal(M.conversationEvent(spec,data.events,[card],true,previouslySpoken).id,spec.event);
}
console.log('PASS School-first Bilal eligibility on seven days and repeatable response choices after either outcome');
