import type {Action,Card,StoryEvent} from './types';

/** Optional conversation selection. Reads licensed cards; has no learning writes. */
export function bilalResponses(pool:Card[], greetings:Card[], fish:Card, day:number, random:()=>number):Action[] {
  const key=(s:string)=>s.toLowerCase().replace(/[.!?؟،]/g,'').replace(/\s+/g,' ').trim();
  const seen=new Set<string>(), meanings=new Set<string>();
  const candidates=pool.filter(c=>/\b(?:water|fish|lake|river|fishing)\b/i.test(c.en) &&
    !/\b(?:you|he|she|they|Deena|Medina|Muhammad|Edris|Hameed|shop|store|book|read|write|school|market|home|house|chair|window|door|class|answer|question|bread|rice|buy|sell|carry)\b/i.test(c.en));
  for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
  const selected:Card[]=[];
  // The documented narrative fallback is the approved bare lemma as an
  // elliptical question: no invented inflection, future grammar or unlock.
  if(day>=4)selected.push({...fish,id:'bilal-fish-question',ps:fish.ps+'؟',en:'Ask about the fish',roman:String(fish.roman)+'?'});
  for(const c of [...candidates,...greetings]) {
    const ps=key(c.ps),en=key(c.en);
    if(seen.has(ps)||meanings.has(en))continue;
    selected.push(c);seen.add(ps);meanings.add(en);
    if(selected.length===4)break;
  }
  return selected.map(c=>({type:'bilal-response',label:c.ps,roman:String(c.roman),card:c}));
}
export function bilalEventId(day:number):string{return 'bilal-day-'+Math.min(7,Math.max(1,day));}
export function withBilalResponses(event:StoryEvent,actions:Action[]):StoryEvent{return {...event,actions};}
