import assert from 'node:assert/strict';
import {runtime,reset,study} from './runtime-fixture.mjs';
for(const en of [false,true])for(const ps of [false,true]){
 const t=runtime();reset(t);t.state.progress.typingPreferences={en,ps};study(t,1,'school');
 const qs=t.questions.selectChallenge(1);
 assert(qs.some(q=>q.answerFormat==='build'));
 for(const q of qs)if(t.Q.isTyped(q))assert((q.direction==='en-ps'?ps:en));
 if(en&&ps)assert(qs.some(q=>t.Q.isTyped(q)));
 assert(t.storage.currentSave(JSON.parse(JSON.stringify(t.state.progress))));
 const targets=qs.filter(q=>t.Q.isTyped(q));
 if(targets.length){const q=targets[0],lang=q.direction==='en-ps'?'ps':'en';
  t.state.session={mode:'challenge',loop:1,questions:qs,index:0,answered:3,correctCount:2,earned:20};
  const before=JSON.parse(JSON.stringify(t.state.session)),beforeLibrary=JSON.stringify(t.state.progress.library);
  t.questions.disableTyping(q);t.questions.adaptTyping();assert.equal(JSON.stringify(t.state.progress.library),beforeLibrary);
  assert.equal(t.state.progress.typingPreferences[lang],false);
  assert.equal(t.state.progress.typingPreferences[lang==='en'?'ps':'en'],lang==='en'?ps:en);
  for(let i=0;i<qs.length;i++){assert.equal(qs[i].id,before.questions[i].id);if(t.Q.isTyped(qs[i]))assert.notEqual(qs[i].direction,q.direction);else if(before.questions[i].answerFormat==='type')assert(qs[i].choiceOrder.length>=2);}
  assert.equal(t.state.session.answered,3);assert.equal(t.state.session.correctCount,2);assert.equal(t.state.session.earned,20);
 }
}
console.log('PASS independent typing combinations, answer direction, selection replacement, progress, construction');

{
 const t=runtime();reset(t);t.state.reviewCampaign=JSON.parse(JSON.stringify(t.state.progress));
 t.state.reviewCampaign.typingPreferences={en:true,ps:true};t.state.progress.typingPreferences={en:true,ps:true};
 t.questions.disableTyping({direction:'en-ps'});
 assert.deepEqual(JSON.parse(JSON.stringify(t.state.reviewCampaign.typingPreferences)),{en:true,ps:false});
 assert.equal(JSON.parse(t.storage.snapshot()).typingPreferences.ps,false);
}

{
 const t=runtime();reset(t);study(t,1,'school');const id=t.state.progress.library.plans[1].locationAssignments.school[0];
 const q={id:'library-card:'+id,kind:'word',direction:'ps-en',answerFormat:'type'};
 t.state.session={mode:'challenge',loop:1,index:0,locked:true,questions:[{...q},{...q}]};
 t.questions.adaptTyping();assert.equal(t.state.session.questions[0].answerFormat,'type');assert.equal(t.state.session.questions[1].answerFormat,'select');
}

{
 const t=runtime();reset(t);study(t,1,'school');const id='library-card:'+t.state.progress.library.plans[1].locationAssignments.school[0];
 const activeItem={id,kind:'word',answerFormat:'type'},next={...activeItem};
 t.state.session={mode:'standard',loop:1,locked:true,activeItem,queue:[next]};t.questions.adaptTyping();
 assert.equal(activeItem.answerFormat,'type');assert.equal(next.answerFormat,'select');
}
