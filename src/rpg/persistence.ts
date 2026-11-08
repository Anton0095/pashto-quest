import type {SaveFence} from './save-fence';
import type {WorldData,WorldSave,Session,LessonSession,Content,Progress,QuestionService,Appearance} from './types';
import {RPGWorldData} from './world-data';
/* Independent world schema; never reads, imports or modifies production save keys. */
export function createPersistenceAPI(RPG_WORLD_DATA:WorldData,QuestionEngine:QuestionService) {
  const key='pashto-quest-rpg-world-v1';
  function fingerprint(raw:string) {let hash=2166136261;for(let i=0;i<raw.length;i++)hash=Math.imul(hash^raw.charCodeAt(i),16777619);return (hash>>>0).toString(16)+':'+raw.length;}
  const fresh=(data:WorldData):WorldSave=>({schemaVersion:1,position:{...data.start},appearance:'neutral',flags:{},npcFlags:{},triggers:{},view:'world',lesson:null,educationFingerprint:null});
  function validate(data:WorldData,input:unknown):WorldSave {
    const raw=input as Partial<WorldSave>|null;
    const out=fresh(data), object=(v:unknown):boolean=>v!==null && typeof v==='object' && !Array.isArray(v);
    if(!raw||!object(raw)||raw.schemaVersion!==1)return out;
    if(raw.sleepIntent&&Number.isInteger(raw.sleepIntent.from)&&Number.isInteger(raw.sleepIntent.to)&&data.days[String(raw.sleepIntent.from)]&&data.days[String(raw.sleepIntent.to)]&&data.days[String(raw.sleepIntent.from)].nextChapter===data.days[String(raw.sleepIntent.to)].id)out.sleepIntent={...raw.sleepIntent};
    if(typeof raw.chapter==='string'&&Object.values(data.days).some(c=>c.id===raw.chapter))out.chapter=raw.chapter;
    if(raw.routes&&object(raw.routes))out.routes=Object.fromEntries(Object.entries(raw.routes).filter(([id,route])=>Object.values(data.days).some(c=>c.id===id)&&['normal','skip'].includes(route)));
    if(raw.activities&&object(raw.activities))out.activities=Object.fromEntries(Object.entries(raw.activities).filter(([id,s])=>data.npcs.some(n=>n.id===id&&n.activity)&&s&&data.maps[s.map]&&Number.isInteger(s.x)&&Number.isInteger(s.y)&&['up','down','left','right'].includes(s.facing)&&Number.isInteger(s.stop)&&s.stop>=0&&s.stop<100&&Number.isFinite(s.wait)&&s.wait>=0&&s.wait<=60000&&Number.isInteger(s.turn)&&s.turn>=0&&s.turn<1000000).map(([id,s])=>[id,{map:s.map,x:s.x,y:s.y,facing:s.facing,stop:s.stop,wait:s.wait,turn:s.turn}]));
    out.position=RPGWorldData.recover(data,raw.position);
    if(['masculine','feminine','neutral'].includes(raw.appearance || ''))out.appearance=raw.appearance as Appearance;
    for(const field of ['flags','npcFlags','triggers'] as const) if(object(raw[field]))out[field]=Object.fromEntries(Object.entries(raw[field] || {}).filter(([k,v])=>/^[a-z0-9_-]{1,80}$/i.test(k)&&typeof v==='boolean').slice(0,200));
    if(['world','lesson','complete'].includes(raw.view || ''))out.view=raw.view as WorldSave['view'];
    if(typeof raw.educationFingerprint==='string')out.educationFingerprint=raw.educationFingerprint;
    if(object(raw.lesson))out.lesson=raw.lesson;
    const cursor=raw.dialogue;
    if(cursor&&typeof cursor.event==='string'&&data.events[cursor.event]&&Number.isInteger(cursor.index)&&cursor.index>=0&&cursor.index<1000)out.dialogue={event:cursor.event,index:cursor.index};
    return out;
  }
  function lessonSnapshot(s:Session|null):unknown {
    if(!s || s.mode==='challenge' || s.finished)return null;
    return JSON.parse(JSON.stringify(s,(_k,v)=>v instanceof Set?[...v]:v));
  }
  function restoreLesson(raw:unknown,content:Content,progress:Progress,data=RPG_WORLD_DATA):LessonSession|null {
    try { return validatedLesson(raw,content,progress,data); } catch { return null; }
  }
  function validatedLesson(input:unknown,content:Content,progress:Progress,data:WorldData):LessonSession|null {
    const raw=input as LessonSession|null;
    if(!raw || !['tutorial','standard','review'].includes(raw.mode))return null;
    const idOK=raw.mode==='tutorial'?raw.id==='tutorial':raw.mode==='review'?raw.id==='review':Object.entries(data.days).some(([day,chapter])=>Number(day)>=data.firstDay && Number(day)<=data.lastDay && chapter.lessons.includes(raw.id));
    if(!idOK || raw.loop!==(raw.mode==='standard'?Number(raw.id.split('-')[0]):0) || !['tutorial','greeting','lexical','grammar','sentence','quiz'].includes(raw.phase))return null;
    const int=(v:unknown,max=1000000):v is number=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=max;
    if(!['cardIndex','attemptId','answered','firstCorrect','earned','tutorialResponses','constructionCount'].every(k=>int(raw[k]??0)))return null;
    if(raw.mode==='tutorial'&&raw.cardIndex>=content.tutorialCards.length)return null;
    if(raw.mode==='standard'&&raw.loc!==raw.id.split('-')[1])return null;
    if(raw.attemptId>progress.library.attemptSequence || typeof raw.locked!=='boolean')return null;
    for(const field of ['required','studyWords','greetingCards','studySentences','firstAsked','passed'])if(!Array.isArray(raw[field])||(raw[field] as string[]).length>1000||(raw[field] as string[]).some(id=>!content.wordById[id]))return null;
    if(raw.tutorialConstruction||raw.profileGender!==undefined||raw.profileName!==undefined)return null;
    if(!Array.isArray(raw.queue)||raw.queue.length>1000||raw.queue.some(q=>!q||!content.wordById[q.id]||!['word','construct'].includes(q.kind)||!int(q.retries)))return null;
    if(raw.recallDraft!==undefined&&(typeof raw.recallDraft!=="string"||raw.recallDraft.length>160))return null;
    if(raw.queue.some(q=>q.answerFormat!==undefined&&!["select","type"].includes(String(q.answerFormat))))return null;
    if(raw.activeItem && (!content.wordById[raw.activeItem.id] || !['word','construct'].includes(raw.activeItem.kind)))return null;
    if(raw.phase==='quiz'&&(!raw.activeItem||!Array.isArray(raw.tileOrder)))return null;
    if(!Array.isArray(raw.built)||new Set(raw.built).size!==raw.built.length)return null;
    if(raw.tileOrder!==undefined){if(!Array.isArray(raw.tileOrder)||!raw.activeItem)return null;const tiles=QuestionEngine.buildTiles(content.wordById[raw.activeItem?.id],raw.activeItem,raw.loop);if(raw.tileOrder.length!==tiles.length || new Set(raw.tileOrder).size!==tiles.length || raw.tileOrder.some(i=>!int(i,tiles.length-1)) || raw.built.some(i=>!raw.tileOrder?.includes(i)))return null;}
    if(raw.choices && (!Array.isArray(raw.choices)||raw.choices.some(c=>typeof c!=='string'||c.length>1000)))return null;
    const s=JSON.parse(JSON.stringify(raw)) as LessonSession;
    for(const field of ['firstAsked','passed'])s[field as 'firstAsked'|'passed']=new Set(s[field] as unknown as string[]);return s;
  }
  function create(data:WorldData,backend?:Pick<Storage,'getItem'|'setItem'>,fence?:SaveFence) {
    const access=()=>backend || globalThis.localStorage;
    let observed:string|null=null,problem:string|null=null,value=fresh(data),revisionReset=false;
    try{observed=access().getItem(key);if(observed)value=validate(data,JSON.parse(observed));}catch{problem='World state could not be restored. A safe spawn is being used; educational progress is separate.';}
    let pending=Promise.resolve(true);
    function save(next:WorldSave) {
      const raw=JSON.stringify(next);
      const write=()=>{try{const target=access();if(target.getItem(key)!==observed){problem='World save changed in another tab. Reload before continuing; this tab has not overwritten it.';return false;}if(raw!==observed)target.setItem(key,raw);if(target.getItem(key)!==raw)throw Error();observed=raw;problem=null;return true;}catch{problem='World position could not be saved. Keep this tab open and retry.';return false;}};
      const commit=async()=>{
        if(backend)return write();
        if(!fence){problem='World revision coordination is unavailable. Keep this tab open and retry.';return false;}
        if(revisionReset){if(!await fence.rebase(key,observed,()=>access().getItem(key)))return false;revisionReset=false;}
        const result=await fence.commit(key,observed,raw,()=>access().getItem(key),write);
        if(result==='conflict')problem='World save changed in another tab. Reload before continuing; this tab has not overwritten it.';
        else if(result!=='saved')problem ||= 'World position could not be safely saved. Keep this tab open and retry.';
        return result==='saved';
      };
      pending=pending.catch(()=>false).then(()=>globalThis.navigator?.locks?.request?globalThis.navigator.locks.request(key,commit):backend?write():(problem='World save coordination is unavailable. Keep this tab open and retry.',false)).catch(()=>{problem='World position could not be safely saved. Keep this tab open and retry.';return false;});return pending;
    }
    return {value,save,authorizeReset(){revisionReset=true;},get problem(){return problem;},settled:()=>pending};
  }
  return {key,fresh,validate,fingerprint,lessonSnapshot,restoreLesson,create};
}
