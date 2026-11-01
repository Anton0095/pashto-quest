import type {Chapter,WorldData,State,Learning,Progression} from './types';
import {walkable} from './world-data';
/** Registration validates references, never grants educational eligibility. */
export function validateChapters(data:WorldData):void {
  const ids=new Set<string>();
  for(const [key,c] of Object.entries(data.days)){
    if(!c.id||ids.has(c.id)||c.day!==Number(key)||!Number.isInteger(c.day)||c.day<1||!c.name||!c.objective)throw Error('Invalid chapter identity: '+key);
    ids.add(c.id);
    if(!c.maps.length||c.maps.some(m=>!data.maps[m])||!c.maps.includes(c.start.map)||!walkable(data,c.start.map,c.start.x,c.start.y))throw Error('Invalid chapter maps/spawn: '+key);
    if(c.activeNPCs.some(id=>!data.npcs.some(n=>n.id===id))||c.mandatoryEvents.some(id=>!data.events[id]))throw Error('Invalid chapter actors/events: '+key);
    for(const id of [c.openingEvent,c.endingEvent])if(id&&!data.events[id])throw Error('Invalid chapter event: '+id);
    if(c.lessons.some(id=>!id.startsWith(c.day+'-'))||c.challenge&&(c.challenge.day!==c.day||!data.npcs.some(n=>n.id===c.challenge?.npc)))throw Error('Invalid chapter curriculum: '+key);
    if(c.completion.challengePassed!==c.day||c.completion.terminal&&c.nextChapter!==null||!c.completion.terminal&&!c.nextChapter)throw Error('Invalid chapter completion: '+key);
  }
  // Future chapters may refer to the next unregistered chapter by stable ID.
}
export function createChapterDirector({data,state,learning,progression,eligible,dispatch,triggers}:{data:WorldData;state:State;learning:Learning;progression:Progression;eligible:(condition?:string)=>boolean;dispatch:(event:string)=>void;triggers:()=>Record<string,boolean>}) {
  validateChapters(data);
  const chapter=(day=state.day):Chapter=>{const c=data.days[String(day)];if(!c)throw Error('Unregistered chapter');return c;};
  const active=(c:Chapter)=>c.day>=data.firstDay&&c.day<=data.lastDay;
  function ready(c:Chapter){return active(c)&&c.prerequisites.every(eligible);}
  function emit(kind:'opening'|'ending'){
    const c=chapter(),key=c.id+'-'+kind,event=kind==='opening'?c.openingEvent:c.endingEvent;
    if(!ready(c)||triggers()[key]||event&&!eligible(data.events[event].condition))return false;
    if(kind==='ending'&&!complete())return false;
    triggers()[key]=true;if(event)dispatch(event);return true;
  }
  function complete(){const c=chapter();return active(c)&&progression.passedChallenge(state.progress,c.completion.challengePassed??c.day)&&c.mandatoryEvents.every(e=>!!triggers()[e]);}
  return {chapter,ready,opening:()=>emit('opening'),ending:()=>emit('ending'),complete,
    challengeAvailable(){const c=chapter();return ready(c)&&!!c.challenge&&learning.allowed(c.challenge.day)&&(c.challenge.conditions??[]).every(eligible);},
    next(){const c=chapter();if(!complete()||c.completion.terminal)return null;return Object.values(data.days).find(n=>n.id===c.nextChapter&&ready(n)&&learning.allowed(n.day))??null;}};
}
