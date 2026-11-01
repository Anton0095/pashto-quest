import type {WorldData,Actor,UI,Action,StoryEvent} from './types';
import {RPGWorldData as RPGWorldEngine} from './world-data';
/* Declarative registry resolver: schedules and story conditions stay outside simulation. */
export function createRPGRegistry(data:WorldData, conditions:Record<string,()=>boolean>) {
  RPGWorldEngine.validate(data);
  for(const npc of data.npcs) {
    if(!data.events[npc.event] || !Array.isArray(npc.schedule))throw Error('Invalid NPC event: '+npc.id);
    for(const slot of npc.schedule)if(!Number.isInteger(slot.day)||!data.maps[slot.map]||!RPGWorldEngine.walkable(data,slot.map,slot.x,slot.y))throw Error('Invalid NPC schedule: '+npc.id);
  }
  for(const object of data.objects)if(!data.maps[object.map]||!data.events[object.event])throw Error('Invalid world object: '+object.id);
  const eligible = (condition?:string) => !condition || !!conditions[condition]?.();
  function npcs(day:number,map:string):Actor[] {
    return data.npcs.filter(n=>eligible(n.condition)).flatMap(n=>{
      const slot=n.schedule.find(s=>s.day===day && s.map===map);
      return slot ? [{...n,...slot}] : [];
    });
  }
  function objects(day:number,map:string):Actor[] { return [...npcs(day,map),...data.objects.filter(o=>o.map===map && eligible(o.condition))]; }
  function event(id:string) {
    const e=data.events[id];
    return e && {...e,actions:e.actions.filter(a=>eligible(a.condition))};
  }
  return {data,eligible,npcs,objects,event,day:(day:number)=>data.days[String(day)] || null};
}
/* Dialogue owns sequence state only. Actions are dispatched by the profile adapter. */
export function createRPGDialogue({dialog,ui,onAction,onClose}:{dialog:HTMLDialogElement;ui:UI;onAction:(action:Action)=>void;onClose:()=>void}) {
  let current:StoryEvent|null=null,index=0;
  const speaker=ui.node('h2'), text=ui.node('p'), actions=ui.node('div',undefined,'buttons');
  text.setAttribute('aria-live','polite');
  const close=ui.button('Back to village',()=>dialog.close());close.className='ghost';
  dialog.append(speaker,text,actions,close);
  dialog.addEventListener('close',()=>{current=null;onClose();});
  function render() {
    if(!current)return;
    speaker.textContent=current.speaker;text.textContent=current.lines[index];actions.replaceChildren();
    if(index<current.lines.length-1) actions.append(ui.button('Continue',()=>{index++;render();}));
    else for(const action of current.actions) actions.append(ui.button(action.label,()=>{dialog.close();onAction(action);}));
  }
  return {open(event:StoryEvent|undefined){if(dialog.open || !event)return;current=event;index=0;render();dialog.showModal();actions.querySelector('button')?.focus();},get isOpen(){return dialog.open;}};
}
