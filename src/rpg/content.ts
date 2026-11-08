import type {WorldData,Actor,UI,Action,StoryEvent} from './types';
import {RPGWorldData} from './world-data';
import {validateChapters} from './chapters';
/* Declarative registry resolver: schedules and story conditions stay outside simulation. */
export function createRPGRegistry(data:WorldData, conditions:Record<string,()=>boolean>,resolveCondition?:(condition?:string)=>boolean) {
  RPGWorldData.validate(data);validateChapters(data);
  const ids=new Set<string>(),characters=new Map<string,string>();
  for(const npc of data.npcs) {
    if(ids.has(npc.id)||!npc.characterId||characters.has(npc.characterId)&&characters.get(npc.characterId)!==npc.name)throw Error('Invalid character identity: '+npc.id);
    ids.add(npc.id);characters.set(npc.characterId,npc.name);
    if(!Number.isInteger(npc.interactionRange??1)||(npc.interactionRange??1)<1||(npc.interactionRange??1)>3)throw Error('Invalid interaction range');
    if(npc.activity){const a=npc.activity;if(![a.zone.x,a.zone.y,a.zone.w,a.zone.h,a.stepMs,a.idleMs].every(Number.isInteger)||a.zone.w<1||a.zone.h<1||a.zone.w*a.zone.h>200||a.stepMs<100||a.stepMs>2000||a.idleMs<300||a.idleMs>60000||!a.stops.length||a.stops.length>12||a.stops.some(p=>!Number.isInteger(p.x)||!Number.isInteger(p.y)||p.x<a.zone.x||p.x>=a.zone.x+a.zone.w||p.y<a.zone.y||p.y>=a.zone.y+a.zone.h))throw Error('Invalid NPC activity: '+npc.id);const maps=new Set([...(npc.defaultLocation?[npc.defaultLocation.map]:[]),...npc.schedule.map(s=>s.map)]);if([...maps].some(map=>a.stops.some(p=>!RPGWorldData.walkable(data,map,p.x,p.y))))throw Error('Unwalkable NPC activity stop: '+npc.id);}
    const home=npc.defaultLocation;if(home&&(!data.maps[home.map]||home.event&&!data.events[home.event]||!RPGWorldData.walkable(data,home.map,home.x,home.y)))throw Error('Invalid default location: '+npc.id);
    if(!data.events[npc.event] || !Array.isArray(npc.schedule))throw Error('Invalid NPC event: '+npc.id);
    for(const slot of npc.schedule)if(!Number.isInteger(slot.day)||!data.maps[slot.map]||slot.event&&!data.events[slot.event]||!RPGWorldData.walkable(data,slot.map,slot.x,slot.y))throw Error('Invalid NPC schedule: '+npc.id);
  }
  for(const object of data.objects)if(!data.maps[object.map]||!data.events[object.event])throw Error('Invalid world object: '+object.id);
  const stable=/^[a-zA-Z0-9_-]{1,80}$/;
  for(const [id,e] of Object.entries(data.events)){
    if(!stable.test(id)||(e.setFlags??[]).some(flag=>!stable.test(flag)))throw Error('Invalid event/flag identity: '+id);
    for(const action of e.actions){if(action.type==='scene'&&!RPGWorldData.walkable(data,action.position.map,action.position.x,action.position.y))throw Error('Invalid scene destination: '+id);}

    if(e.pashto&&(!/[\u0600-\u06ff]/.test(e.pashto.ps)||!e.pashto.roman||!e.pashto.audioId||e.lines[0]!==e.pashto.ps))throw Error('Invalid Pashto narrative: '+id);
    if(!e.speaker||!Array.isArray(e.lines)||!e.lines.length||e.lines.some(l=>typeof l!=='string')||!Array.isArray(e.actions))throw Error('Invalid story: '+id);
    for(const a of e.actions)if(a.type==='event'&&!data.events[a.event]||a.type==='lesson'&&a.resumeEvent&&!data.events[a.resumeEvent])throw Error('Invalid event link: '+id);
  }
  const eligible = resolveCondition??((condition?:string) => !condition || !!conditions[condition]?.());
  function npcs(day:number,map:string):Actor[] {
    return data.npcs.filter(n=>data.days[String(day)]?.activeNPCs.includes(n.id)&&eligible(n.condition)).flatMap(n=>{
      const daily=n.schedule.filter(s=>s.day===day);
      const slot=daily.find(s=>s.map===map&&eligible(s.condition))??(!daily.length&&n.defaultLocation?.map===map?n.defaultLocation:undefined);
      return slot ? [{...n,...slot}] : [];
    });
  }
  function objects(day:number,map:string):Actor[] { return [...npcs(day,map),...data.objects.filter(o=>o.map===map && eligible(o.condition))]; }
  function event(id:string) {
    const e=data.events[id];
    return e && eligible(e.condition) ? {...e,actions:e.actions.filter(a=>eligible(a.condition))} : undefined;
  }
  return {data,eligible,npcs,objects,event,day:(day:number)=>data.days[String(day)] || null};
}
/* Dialogue owns sequence state only. Actions are dispatched by the profile adapter. */
export function createRPGDialogue({dialog,ui,onAction,onClose,onIndex,eligible,onSpeak}:{dialog:HTMLDialogElement;ui:UI;onAction:(action:Action)=>void;onClose:()=>void;onIndex:(index:number)=>void;eligible:(condition?:string)=>boolean;onSpeak?:(line:{ps:string;roman:string;audioId:string})=>void}) {
  let current:StoryEvent|null=null,index=0,actionClose=false;
  const portrait=ui.node('div',undefined,'rpg-dialogue-portrait'), speaker=ui.node('h2'), text=ui.node('p'), roman=ui.node('div',undefined,'rpg-dialogue-roman'),listen=ui.button('Hear Pashto',()=>{if(current?.pashto)onSpeak?.(current.pashto);}), actions=ui.node('div',undefined,'buttons');
  text.setAttribute('aria-live','polite');
  const close=ui.button('Back to village',()=>dialog.close());close.className='ghost';
  dialog.append(portrait,speaker,text,roman,listen,actions,close);
  const closed=()=>{if(!dialog.open)current=null;if(!actionClose)onClose();actionClose=false;};
  dialog.addEventListener('close',closed);
  function render() {
    if(!current)return;
    const messages=current.messages?.filter(m=>eligible(m.condition))??current.lines.map(text=>({speaker:current!.speaker,characterId:current!.characterId,expression:current!.expression,text}));
    index=Math.min(index,Math.max(0,messages.length-1));
    const message=messages[index];const listener=message&&'listener' in message?message.listener:current.listener;
    const frame=ui.portrait(message?.characterId??(message?.speaker&&message.speaker!==current.speaker?message.speaker:current.characterId??current.speaker),message?.expression??current.expression);
    portrait.replaceChildren(frame);portrait.classList.toggle('hidden',frame.classList.contains('hidden'));
    speaker.textContent=(message?.speaker??current.speaker)+(listener?' → '+listener:'');text.textContent=current.pashto?.ps??messages[index]?.text??'';
    text.lang=current.pashto?'ps':'en';text.dir=current.pashto?'rtl':'ltr';text.classList.toggle('library-pashto',!!current.pashto);
    roman.textContent=current.pashto?.roman??'';roman.lang='en';roman.dir='ltr';roman.hidden=!current.pashto;listen.hidden=!current.pashto;
    actions.replaceChildren();onIndex(index);
    if(index<messages.length-1) actions.append(ui.button('Continue',()=>{index++;render();}));
    else for(const action of current.actions.filter(a=>eligible(a.condition))) {
      const button=ui.button(action.label,()=>{if(!current||!eligible(action.condition))return;current=null;actionClose=true;dialog.close();onAction(action);});
      if(action.type==='bilal-response'){button.lang='ps';button.dir='rtl';button.classList.add('pashto-option');button.append(ui.node('span',action.roman,'rpg-response-roman'));}
      actions.append(button);
    }
  }
  return {open(event:StoryEvent|undefined,startIndex=0){if(dialog.open || !event)return;current=event;index=startIndex;render();dialog.showModal();actions.querySelector('button')?.focus();},get isOpen(){return dialog.open;},dispose(){dialog.removeEventListener('close',closed);dialog.remove();}};
}
