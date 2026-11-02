import type {Action,DialogueCursor,StoryEvent,WorldSave} from './types';
/** Durable story state only; this service has no educational reward capability. */
export function createStoryDirector({value,event,eligible,changed}:{value:()=>WorldSave;event:(id:string)=>StoryEvent|undefined;eligible:(condition?:string)=>boolean;changed:()=>void}) {
  function resolve(id:string){const e=event(id);if(!e||!eligible(e.condition))return undefined;return e;}
  function open(id:string):StoryEvent|undefined {
    const e=resolve(id),s=value();if(!e||e.once&&s.triggers[id])return undefined;
    if(s.dialogue?.event!==id)s.dialogue={event:id,index:0};
    changed();return e;
  }
  function finish(){const s=value(),e=s.dialogue&&resolve(s.dialogue.event);if(!e)return;
    s.triggers[s.dialogue!.event]=true;for(const flag of e.setFlags??[])s.flags[flag]=true;
  }
  function status(id:string):'not-started'|'in-progress'|'completed'{return value().triggers[id]?'completed':value().dialogue?.event===id?'in-progress':'not-started';}
  return {open,resolve,status,get cursor():DialogueCursor|undefined{return value().dialogue;},
    index(index:number){if(value().dialogue)value().dialogue!.index=index;changed();},
    choose(action:Action):boolean {if(!eligible(action.condition))return false;finish();const s=value();delete s.dialogue;
      if(action.type==='flag')s.flags[action.flag]=true;
      if(action.type==='lesson'&&action.resumeEvent)s.dialogue={event:action.resumeEvent,index:0,resumeEvent:action.resumeEvent};
      changed();return true;},
    close(){delete value().dialogue;changed();},
    resume(){const c=value().dialogue;return c?resolve(c.event):undefined;}};
}
