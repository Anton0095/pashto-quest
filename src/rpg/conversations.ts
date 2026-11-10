import type {Action,Card,ConversationDay,StoryEvent} from './types';

/** Curated semantic target + compiler-generated, contextually wrong alternatives.
 * The engine supplies all selectable clauses. This service owns no grades or unlocks. */
export function conversationChoices(spec:ConversationDay,pool:Card[],random:()=>number):Action[] {
  const target=pool.find(card=>card.id===spec.response.generatedId && card.ps===spec.response.pashto && card.en===spec.response.meaning);
  if(!target)return [];
  const key=(text:string)=>text.normalize('NFC').toLowerCase().replace(/[.!?؟،]/g,'').replace(/\s+/g,' ').trim();
  const texts=new Set([key(target.ps)]),meanings=new Set([key(target.en)]);
  const alternatives:Card[]=[];
  const candidates=pool.filter(c=>c.generated && !Object.values((c.generated as {slots:Record<string,{lemmaId:string}>}).slots).some(ref=>spec.distractors.excludeLemmas.includes(ref.lemmaId)));
  for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
  for(const card of candidates){
    if(alternatives.length>=spec.distractors.count)break;
    if(texts.has(key(card.ps))||meanings.has(key(card.en)))continue;
    alternatives.push(card);texts.add(key(card.ps));meanings.add(key(card.en));
  }
  const cards=[target,...alternatives];
  for(let i=cards.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
  return cards.map(card=>({type:'conversation-response',label:card.ps,roman:String(card.roman),card,nextEvent:card.id===target.id?spec.correctEvent:spec.incorrectEvent}));
}
export function conversationEvent(spec:ConversationDay,events:Record<string,StoryEvent>,pool:Card[],lessonCompleted:boolean,alreadySpoken:boolean,pending?:string,random:()=>number=Math.random):{id:string;event:StoryEvent} {
  if(pending&&[spec.event,spec.correctEvent,spec.incorrectEvent,spec.conclusionEvent].includes(pending)&&pending!==spec.event)return {id:pending,event:events[pending]};
  if(alreadySpoken)return {id:spec.repeatEvent,event:events[spec.repeatEvent]};
  const actions=lessonCompleted?conversationChoices(spec,pool,random):[];
  const id=actions.length?spec.event:spec.greetingEvent;
  return {id,event:{...events[id],actions:actions.length?actions:events[id].actions}};
}

export function conversationCompleted(spec:ConversationDay,triggers:Record<string,boolean>):boolean {
  // Main event IDs already existed before authored response branches. Only a
  // new acknowledged reaction/conclusion proves this conversation was completed.
  return !!(triggers[spec.correctEvent]||triggers[spec.incorrectEvent]||triggers[spec.conclusionEvent]);
}
