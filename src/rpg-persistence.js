/* Independent world schema; never reads, imports or modifies production save keys. */
const RPGPersistence = (() => {
  const key='pashto-quest-rpg-world-v1';
  function fingerprint(raw) {let hash=2166136261;for(let i=0;i<raw.length;i++)hash=Math.imul(hash^raw.charCodeAt(i),16777619);return (hash>>>0).toString(16)+':'+raw.length;}
  const fresh=data=>({schemaVersion:1,position:{...data.start},appearance:'neutral',flags:{},npcFlags:{},triggers:{},view:'world',lesson:null,educationFingerprint:null});
  function validate(data,raw) {
    const out=fresh(data), object=v=>v && typeof v==='object' && !Array.isArray(v);
    if(!object(raw)||raw.schemaVersion!==1)return out;
    out.position=RPGWorldEngine.recover(data,raw.position);
    if(['masculine','feminine','neutral'].includes(raw.appearance))out.appearance=raw.appearance;
    for(const field of ['flags','npcFlags','triggers']) if(object(raw[field]))out[field]=Object.fromEntries(Object.entries(raw[field]).filter(([k,v])=>/^[a-z0-9_-]{1,80}$/i.test(k)&&typeof v==='boolean').slice(0,200));
    if(['world','lesson','complete'].includes(raw.view))out.view=raw.view;
    if(typeof raw.educationFingerprint==='string')out.educationFingerprint=raw.educationFingerprint;
    if(object(raw.lesson))out.lesson=raw.lesson;
    return out;
  }
  function lessonSnapshot(s) {
    if(!s || s.mode==='challenge' || s.finished)return null;
    return JSON.parse(JSON.stringify(s,(_k,v)=>v instanceof Set?[...v]:v));
  }
  function restoreLesson(raw,content,progress,data=RPG_WORLD_DATA) {
    try { return validatedLesson(raw,content,progress,data); } catch { return null; }
  }
  function validatedLesson(raw,content,progress,data) {
    if(!raw || !['tutorial','standard','review'].includes(raw.mode))return null;
    const idOK=raw.mode==='tutorial'?raw.id==='tutorial':raw.mode==='review'?raw.id==='review':Object.entries(data.days).some(([day,chapter])=>Number(day)>=data.firstDay && Number(day)<=data.lastDay && chapter.lessons.includes(raw.id));
    if(!idOK || raw.loop!==(raw.mode==='standard'?Number(raw.id.split('-')[0]):0) || !['tutorial','greeting','lexical','grammar','sentence','quiz'].includes(raw.phase))return null;
    const int=(v,max=1000000)=>Number.isInteger(v)&&v>=0&&v<=max;
    if(!['cardIndex','attemptId','answered','firstCorrect','earned','tutorialResponses','constructionCount'].every(k=>int(raw[k]??0)))return null;
    if(raw.mode==='tutorial'&&raw.cardIndex>=content.tutorialCards.length)return null;
    if(raw.mode==='standard'&&raw.loc!==raw.id.split('-')[1])return null;
    if(raw.attemptId>progress.library.attemptSequence || typeof raw.locked!=='boolean')return null;
    for(const field of ['required','studyWords','greetingCards','studySentences','firstAsked','passed'])if(!Array.isArray(raw[field])||raw[field].length>1000||raw[field].some(id=>!content.wordById[id]))return null;
    if(!Array.isArray(raw.queue)||raw.queue.length>1000||raw.queue.some(q=>!q||!content.wordById[q.id]||!['word','construct'].includes(q.kind)||!int(q.retries)))return null;
    if(raw.activeItem && (!content.wordById[raw.activeItem.id] || !['word','construct'].includes(raw.activeItem.kind)))return null;
    if(raw.phase==='quiz'&&(!raw.activeItem||!Array.isArray(raw.tileOrder)))return null;
    if(!Array.isArray(raw.built)||new Set(raw.built).size!==raw.built.length)return null;
    if(raw.tileOrder!==undefined){if(!Array.isArray(raw.tileOrder)||!raw.activeItem)return null;const tiles=QuestionEngine.buildTiles(content.wordById[raw.activeItem?.id],raw.activeItem,raw.loop);if(raw.tileOrder.length!==tiles.length || new Set(raw.tileOrder).size!==tiles.length || raw.tileOrder.some(i=>!int(i,tiles.length-1)) || raw.built.some(i=>!raw.tileOrder.includes(i)))return null;}
    if(raw.choices && (!Array.isArray(raw.choices)||raw.choices.some(c=>typeof c!=='string'||c.length>1000)))return null;
    if(!['male','female','unspecified'].includes(raw.profileGender)||typeof raw.profileName!=='string'||raw.profileName.length>40)return null;
    const s=JSON.parse(JSON.stringify(raw));for(const field of ['firstAsked','passed'])s[field]=new Set(s[field]);return s;
  }
  function create(data,backend) {
    const access=()=>backend || globalThis.localStorage;
    let observed=null,problem=null,value=fresh(data);
    try{observed=access().getItem(key);if(observed)value=validate(data,JSON.parse(observed));}catch{problem='World state could not be restored. A safe spawn is being used; educational progress is separate.';}
    let pending=Promise.resolve(true);
    function save(next) {
      const raw=JSON.stringify(next);
      const write=()=>{try{const target=access();if(target.getItem(key)!==observed){problem='World save changed in another tab. Reload before continuing; this tab has not overwritten it.';return false;}target.setItem(key,raw);if(target.getItem(key)!==raw)throw Error();observed=raw;return true;}catch{problem='World position could not be saved. Keep this tab open and retry.';return false;}};
      pending=pending.then(()=>globalThis.navigator?.locks?.request?globalThis.navigator.locks.request(key,write):write());return pending;
    }
    return {value,save,get problem(){return problem;},settled:()=>pending};
  }
  return {key,fresh,validate,fingerprint,lessonSnapshot,restoreLesson,create};
})();
