import type {EducationServices,RPGDependencies,Direction,Action,WorldSave,Actor} from './types';
import {createRPGTransitions} from './transitions';
import {conversationEvent,conversationCompleted,conversationEligible} from './conversations';
import {RPGWorldData} from './world-data';
import {createRPGRegistry,createRPGDialogue} from './content';
import {createRPGProgression} from './progression';
import {createPersistenceAPI} from './persistence';
import {createChapterDirector} from './chapters';
import {createStoryDirector} from './story';
import {createChapterRoutes} from './routes';
import {createPhaserWorld} from './phaser-world';
import {dailySpawn,dailyGuidance} from './daily-flow';
import {createRPGLayout} from './layout';
import {approachTiles,facingToward} from './movement';
/* RPG profile adapters. Education remains authoritative; world state owns no rewards. */
export function createRPG({state,content,progression,learning,ui,audio,storage,lessons,challenge,library}:EducationServices,dependencies:RPGDependencies) {
  ui.usePhaserPortraits();
  const data=dependencies.data,RPGPersistence=createPersistenceAPI(data,dependencies.questions),persistence=RPGPersistence.create(data,undefined,dependencies.fence);
  const transitions=createRPGTransitions();
  let sleeping=false,reviewLaunching=false,dreamDay:number|undefined;
  let save:WorldSave=persistence.value,lastMove=0,held:Direction|null=null,timer:ReturnType<typeof setTimeout>|undefined,dirty=true,currentView='intro',restoring=false,disposed=false,lastTarget='',focused=true,renderFailed=false,advancing=false,launching=false,selectedDay:number|undefined;
  const listeners=new AbortController();
  const conditions={beforeGuideMeeting:()=>!state.progress.tutorialDone&&!save.flags.metGuide,beforeTutorial:()=>!state.progress.tutorialDone,afterTutorial:()=>state.progress.tutorialDone,passed:()=>progression.passedChallenge(state.progress,current())};
  function eligible(condition?:string):boolean {
    if(!condition)return true;
    if(condition.startsWith('all:'))return condition.slice(4).split('|').every(eligible);
    if(condition.startsWith('complete:'))return !!state.progress.complete[condition.slice(9)];
    if(condition.startsWith('not-complete:'))return !state.progress.complete[condition.slice(13)];
    if(condition==='not-allLessons')return !chapter().lessons.every(id=>state.progress.complete[id]);
    if(condition.startsWith('flag:'))return !!save.flags[condition.slice(5)];
    if(condition.startsWith('not-flag:'))return !save.flags[condition.slice(9)];
    if(condition.startsWith('event:'))return !!save.triggers[condition.slice(6)];
    if(condition.startsWith('not-event:'))return !save.triggers[condition.slice(10)];
    if(condition.startsWith('lesson:')){const id=condition.slice(7);return policy.lessonAllowed(id)&&learning.placeAccessible(Number(id.split('-')[0]),id.split('-')[1]);}
    if(condition==='allLessons')return chapter().lessons.every(id=>state.progress.complete[id]);
    if(condition==='notPassed')return !conditions.passed();
    return !!conditions[condition as keyof typeof conditions]?.();
  }
  function availableMaps():string[] {
    return chapter().maps.filter(map=>eligible(data.maps[map].condition));
  }
  const registry=createRPGRegistry(data,conditions,eligible);
  const story=createStoryDirector({value:()=>save,event:registry.event,eligible,changed:()=>scheduleSave()});
  const chapters=createChapterDirector({data,state,learning,progression,eligible,triggers:()=>save.triggers,dispatch:id=>openEvent(id),routeComplete:()=>routes.complete()});
  function current():number{return state.day=selectedDay??policy.clamp(state.day);}
  const chapter=()=>chapters.chapter(current());
  const routes=createChapterRoutes({chapter,progress:()=>state.progress,save:()=>save});
  const facings=new Map<string,Direction>();
  document.querySelector<HTMLElement>('.brand')!.textContent='✦ PASHTO QUEST · '+data.days[String(data.firstDay)].name;
  document.querySelector<HTMLElement>('.herochar .avatar')!.textContent='☀';
  const policy=createRPGProgression({state,data,learning,progression});
  const savedChapter=Object.values(data.days).find(c=>c.id===save.chapter);
  if(savedChapter&&policy.configured(savedChapter.day)&&learning.allowed(savedChapter.day))state.day=savedChapter.day;
  current();
  const activeDay=state.progress.activeChallenge?.loop;if(activeDay&&policy.configured(activeDay)&&learning.allowed(activeDay))state.day=activeDay;
  selectedDay=policy.clamp(state.day);
  const educationalHUD=ui.hud;
  ui.hud=()=>{
    current();educationalHUD();
    if(policy.terminal(current())){
      ui.$('xpAmount').textContent='Day '+current()+' complete · XP recorded';
      ui.$('xpBar').setAttribute('aria-valuetext',ui.$('xpAmount').textContent);
      ui.$('characterSubtitle').textContent='Welcome, '+state.progress.playerProfile.name+' · '+(chapter().presentation?.terminalTitle??'Chapter complete.');
    }
  };
  // Shared guard for NPC choices, Quick travel, review and dream entry.
  function lessonEligible(id:string):boolean {
    return (id==='tutorial'||state.progress.tutorialDone)&&!(state.reviewCampaign&&(!dreamDay||!data.days[String(dreamDay)]?.lessons.includes(id)))&&policy.lessonAllowed(id)&&chapters.ready(chapter())&&(['tutorial','review'].includes(id)||learning.placeAccessible(Number(id.split('-')[0]),id.split('-')[1]));
  }
  const lessonBegin=lessons.begin;lessons.begin=id=>{if(lessonEligible(id))lessonBegin(id);};
  function beginLesson(id:string,eventId?:string,action?:Action):boolean {
    if(!lessonEligible(id)||action&&!eligible(action.condition))return false;
    if(eventId&&action){
      if(!story.open(eventId))return false;
      if(eventId===chapter().openingEvent)chapters.opening(false);
      if(!story.choose(action))return false;
    }
    lessonBegin(id);dirty=true;scheduleSave();return true;
  }
  const challengeStart=challenge.startChallenge;challenge.startChallenge=(day,...args)=>{if(!state.reviewCampaign&&policy.configured(day)&&day===current()&&chapters.challengeAvailable())challengeStart(day,...args);};
  const root=ui.$('worldScreen');root.replaceChildren();root.className='rpg-world panel hidden';
  const heading=ui.node('div',undefined,'rpg-heading');
  const title=ui.node('h2','Saykanda');title.id='rpgLocation';
  const day=ui.node('span','DAY '+current()+' / '+chapter().name.toUpperCase(),'rpg-day');
  heading.append(ui.node('div','PASHTO QUEST / RPG','eyebrow'),day,title);
  const tools=ui.node('div',undefined,'buttons rpg-tools');
  const libButton=ui.button('Library · L',()=>openLibrary());libButton.id='rpgLibrary';
  const menuButton=ui.button('Menu · Esc',()=>openMenu());menuButton.id='rpgMenuButton';
  tools.append(libButton,menuButton);heading.append(tools);
  const exploration=ui.node('div',undefined,'rpg-exploration');
  const viewport=ui.node('div',undefined,'rpg-viewport'),canvas=document.createElement('canvas');
  canvas.id='rpgCanvas';canvas.width=window.innerWidth<600?256:512;canvas.height=window.innerWidth<600?192:320;canvas.tabIndex=0;canvas.setAttribute('aria-label','Village exploration. Use arrow keys or WASD to move; E or Enter to interact. Click or tap to move; select a character to approach and talk.');
  const locationNote=ui.node('p','','rpg-location-note');locationNote.id='rpgObjective';locationNote.setAttribute('role','status');
  viewport.append(canvas);exploration.append(locationNote);
  const progressCard=document.querySelector<HTMLElement>('.herochar .char-content')!;
  progressCard.append(ui.$('xpPill'),ui.$('knownPill'));
  ui.$('navLibrary').classList.add('hidden');
  const controls=ui.node('div',undefined,'rpg-controls'),dpad=ui.node('div',undefined,'rpg-dpad');dpad.setAttribute('aria-label','Directional controls');
  const interactButton=ui.button('Interact · E',()=>interact());interactButton.id='rpgInteract';interactButton.className='primary';
  for(const [direction,label]of [['up','↑'],['left','←'],['down','↓'],['right','→']] as const) {
    const b=ui.button(label,()=>{});b.dataset.direction=direction;b.setAttribute('aria-label','Move '+direction);
    b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);held=direction;move(direction,performance.now(),true);});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{held=null;});
    b.addEventListener('click',e=>{if(e.detail===0)move(direction,performance.now(),true);});dpad.append(b);
  }
  const controlHelp=ui.node('p','Click or tap to walk or approach a character. Arrows / WASD and touch arrows also work. E / Enter to talk.','tiny muted');
  controls.append(dpad,interactButton,controlHelp);exploration.append(controls);
  const visits=ui.node('div',undefined,'rpg-visits');visits.id='rpgVisits';exploration.append(visits);
  const notice=ui.node('p','','tiny');notice.id='rpgSaveNotice';notice.setAttribute('role','status');exploration.append(notice);
  const dialogueDialog=document.createElement('dialog');dialogueDialog.id='rpgDialogue';dialogueDialog.className='rpg-dialogue';document.body.append(dialogueDialog);
  const dialogue=createRPGDialogue({dialog:dialogueDialog,ui,onAction:act,onSpeak:line=>{if(!content.wordById[line.audioId])content.wordById[line.audioId]={id:line.audioId,ps:line.ps,roman:line.roman,en:''};audio.speak(line.audioId,{track:false});},onIndex:index=>story.index(index),eligible,onClose:()=>{audio.stopAudio();story.close();held=null;dirty=true;canvas.focus();scheduleSave();}});
  const menu=document.createElement('dialog');menu.id='rpgMenu';menu.className='rpg-dialogue';menu.setAttribute('aria-label','Village menu');
  menu.append(ui.node('h2','Your journey'),ui.node('p','Explore at your own pace. Challenge access follows the current chapter and educational prerequisites.'));
  const appearance=ui.node('fieldset'),legend=ui.node('legend','Character appearance');appearance.append(legend);
  for(const kind of ['masculine','feminine','neutral'] as const) {const b=ui.button(kind[0].toUpperCase()+kind.slice(1),()=>{save.appearance=kind;dirty=true;refreshAppearance();scheduleSave();});b.dataset.appearance=kind;appearance.append(b);}
  menu.append(ui.$('dialectGuide'),ui.$('resetProgress'));
  menu.append(appearance,ui.button('Open Library',()=>{menu.close();openLibrary();}),ui.button('Due review',()=>{menu.close();lessons.begin('review');}),ui.button('Journey results',()=>{menu.close();if(conditions.passed())showCompletion();else dialogue.open({speaker:'Muhammad Jan',lines:['Complete the Day '+current()+' challenge with at least '+progression.getChallengeSpec(current()).passCount+' out of '+progression.getChallengeSpec(current()).questionCount+' correct answers.'],actions:[]});}),ui.button('Resume village',()=>menu.close()));
  const history=ui.node('details');history.append(ui.node('summary','Dream — Review completed days'));const historyButtons=ui.node('div',undefined,'buttons');history.append(historyButtons);menu.append(history);
  function openMenu(){held=null;engine?.cancelRoute();historyButtons.replaceChildren();for(const c of Object.values(data.days))if(policy.configured(c.day)&&learning.allowed(c.day)&&progression.passedChallenge(state.progress,c.day))historyButtons.append(ui.button('Dream Day '+c.day,()=>{menu.close();void goHome().then(()=>{if(disposed)return;void openDreamMenu(c.day);});}));menu.showModal();}
  document.body.append(menu);ui.$('resetProgress').addEventListener('click',()=>menu.close(),{signal:listeners.signal});menu.addEventListener('close',()=>{held=null;canvas.focus();dirty=true;});
  function refreshAppearance(){for(const b of appearance.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.appearance===save.appearance));}refreshAppearance();
  let engine:ReturnType<typeof createPhaserWorld>|undefined;
  try {if(!canvas.getContext('2d'))throw Error('Canvas unavailable');
  engine=createPhaserWorld({canvas,data,activityState:save.activities,onActivities:s=>{save.activities=s;},portraits:dependencies.portraits,portraitReady:ui.portraitReady,allowedMaps:availableMaps,position:()=>save.position,actors:()=>registry.objects(current(),save.position.map).map(n=>({...n,facing:facings.get(n.id)||'down'})),appearance:()=>save.appearance,active,
    onInteract(){interact();},
    onMove(position,transition){const moved=save.position.x!==position.x||save.position.y!==position.y||save.position.map!==position.map;if(!moved&&save.position.facing===position.facing)return;save.position=position;if(moved)save.flags.moved=true;if(transition)held=null;dirty=true;scheduleSave();},
    onFrame(){if(!active()){held=null;return;}if(dirty)draw();const target=engine?.nearby()?.id||'';if(target!==lastTarget){lastTarget=target;dirty=true;}if(held)move(held,performance.now());if(dirty)draw();}});
  }catch{ui.usePhaserPortraits(false);renderFailed=true;notice.textContent='The map could not start. Use Quick travel below; your learning progress remains available.';}
  const access=ui.node('details'),summary=ui.node('summary','Quick travel');access.append(summary);
  const accessButtons=ui.node('div',undefined,'buttons');
  access.append(ui.node('p','Complete School first, then Home, Nature and Market in any order. The challenge shortcut opens after School.', 'tiny'),accessButtons);exploration.append(access);
  const locationNames:Record<string,string>={residential:'Home',nature:'Lake',business:'Market',school:'School'};
  function quickDestination(id:string):{label:string;actor?:Actor} {
    const loc=id.split('-')[1],c=chapter();
    if(current()===6&&['nature','residential'].includes(loc)&&!save.flags['day6-hills-invited']){
      const actor=registry.npcs(current(),'village').find(a=>a.characterId==='saleha');
      if(actor)return {label:locationNames[loc]+' course · Lake invitation · Deena',actor};
    }
    for(const map of c.maps){
      const actor=registry.npcs(current(),map).find(a=>data.events[a.event]?.actions.some(action=>action.type==='lesson'&&action.lessonId===id));
      if(actor){
        const region=data.maps[map].regions.find(r=>actor.x>=r.x&&actor.x<r.x+r.w&&actor.y>=r.y&&actor.y<r.y+r.h);
        const actual=region&&(locationNames[region.id]||region.name)||locationNames[loc];
        return {label:actual===locationNames[loc]?actual:locationNames[loc]+' course · '+actual+' · '+actor.name,actor};
      }
    }
    return {label:locationNames[loc]};
  }
  function lessonOffer(id:string):{eventId?:string;action?:Action;actor?:Actor} {
    const actor=quickDestination(id).actor;
    const eventId=[chapter().openingEvent,actor?.event].find(event=>event&&(!data.events[event].once||story.status(event)!=='completed')&&registry.event(event)?.actions.some(a=>a.type==='lesson'&&a.lessonId===id));
    const action=eventId?registry.event(eventId)!.actions.find(a=>a.type==='lesson'&&a.lessonId===id)!:actor?undefined:{type:'lesson' as const,lessonId:id,label:'Study'};
    return {eventId:eventId??(actor?interactionEvent(actor):undefined),action,actor};
  }
  async function quickTravel(id:string){
    if(launching||!chapter().lessons.includes(id)||!lessonEligible(id)||!active()&&!(renderFailed&&currentView==='world'&&!document.querySelector('dialog[open]')))return;
    launching=true;held=null;engine?.cancelRoute();
    try{
      const offer=lessonOffer(id),target=offer.actor;
      if(target&&!renderFailed){
        const tile=approachTiles(data,target.map,target,registry.objects(current(),target.map))[0];if(!tile)return;
        await travel({map:target.map,x:tile.x,y:tile.y,facing:facingToward(tile,target)});
      }
      if(!disposed){if(offer.action)beginLesson(id,offer.eventId,offer.action);else if(offer.eventId)openEvent(offer.eventId);}
    }finally{launching=false;}
  }
  function refreshAccess(){accessButtons.replaceChildren();
    if(!state.progress.tutorialDone)accessButtons.append(ui.button('Begin Library tutorial',()=>beginLesson(chapter().tutorialLessonId??'tutorial')));
    else for(const id of chapter().lessons){const destination=quickDestination(id);const b=ui.button((state.progress.complete[id]?'Review · ':'')+destination.label,()=>void quickTravel(id));b.dataset.destination=id.split('-')[1];b.disabled=!lessonEligible(id);if(b.disabled)b.title='Complete today’s School lesson first.';accessButtons.append(b);}
    if(progression.passedChallenge(state.progress,current())){const sleepButton=ui.button('Sleep — Begin next day',()=>void sleep());sleepButton.id='quickSleep';accessButtons.append(sleepButton);}
    if(chapters.challengeAvailable())accessButtons.append(ui.button(chapter().lessons.every(id=>state.progress.complete[id])?'Day '+current()+' challenge':'Skip to daily challenge',()=>act({label:'Challenge',type:'challenge',day:current()})));
    accessButtons.append(ui.button('Open Library',openLibrary));
  }
  canvas.addEventListener('contextlost',()=>{renderFailed=true;held=null;refreshAccess();access.open=true;notice.textContent='Map rendering was interrupted. Quick travel remains available.';},{signal:listeners.signal});
  const layout=createRPGLayout(root,heading,viewport,exploration,document.querySelector<HTMLElement>('.herochar')!,tools,()=>engine?.resize());
  // Restore a paired lesson before the first educational snapshot compacts history.
  // Otherwise that snapshot would retire the lesson's deduplication events.
  const pairedLesson = !state.progress.activeChallenge && save.view==='lesson' &&
    save.educationFingerprint===RPGPersistence.fingerprint(storage.pairingSnapshot?.()??JSON.stringify(state.progress))
      ? RPGPersistence.restoreLesson(save.lesson,content,state.progress) : null;
  if(pairedLesson) state.session=pairedLesson;
  const oldView=ui.view;
  ui.view=name=>{
    held=null;engine?.cancelRoute();audio.stopAudio();current();document.querySelector<HTMLElement>('.brand')!.textContent='✦ PASHTO QUEST · '+chapter().name;
    if(name==='resultScreen'){ui.$('resultXPLabel').textContent='XP gained';ui.$('resultKnowledgeLabel').textContent='Items practised';ui.$('resultScreen').querySelector<HTMLElement>('.eyebrow')!.textContent='LESSON FINISHED';}
    if(state.reviewCampaign){ui.$('lessonEyebrow').textContent='DREAM · DAY '+dreamDay+' · NO CAMPAIGN XP';ui.$('resultWorld').textContent='Return to house';}
    currentView=name==='worldScreen'?'world':name==='lessonScreen'?'lesson':name==='resultScreen'?'result':'intro';
    text(day,state.reviewCampaign?'DREAM · DAY '+dreamDay:'DAY '+current()+' / '+chapter().name.toUpperCase());
    oldView(name);ui.$('navLibrary').classList.toggle('hidden',name==='worldScreen'||name==='introScreen');
    const overlay=name==='lessonScreen'||name==='resultScreen';document.body.classList.toggle('rpg-overlay-active',overlay);if(overlay)root.classList.remove('hidden');
    layout.resize();
    if(name==='lessonScreen'&&state.session?.mode==='challenge'&&state.session.loop===chapter().challenge?.day){const caption=ui.$('challengeScene')?.querySelector('.eyebrow');if(caption)caption.textContent='DAY '+current()+' · CHAPTER CHALLENGE';}
    if(name==='resultScreen') {
      if(state.session?.mode==='challenge' && state.session.correctCount>=progression.getChallengeSpec(state.session.loop).passCount){if(chapters.complete())showCompletion();else if(chapter().routes?.skip.event)openEvent(chapter().routes!.skip.event!);}
      else if(state.session?.mode==='tutorial')ui.$('resultNext').textContent='Muhammad Jan: Your first hello is complete. Start with Ms Hameed’s School lesson today and every day; then study Home, Nature and Market in any order. Library Player Profile holds your name, gender and typing preference.';
    }
    ui.$('navWorld').classList.toggle('hidden',name==='worldScreen'||name==='introScreen');
    dirty=true;scheduleSave();
  };
  const oldSave=storage.save.bind(storage);
  storage.save=()=>{if(state.reviewCampaign)return Promise.resolve(true);const result=oldSave();if(!restoring)Promise.resolve(result).then(ok=>{if(ok)scheduleSave();});return result;};
  function active(){return !transitions.active&&!reviewLaunching&&!sleeping&&!advancing&&!launching&&!disposed&&!renderFailed&&focused&&currentView==='world'&&!document.hidden&&!document.querySelector('dialog[open]');}
  function npcs(){const actors=registry.npcs(current(),save.position.map).map(n=>({...n,facing:facings.get(n.id)||'down'}));return engine?.scene.resolveActors(actors)??actors;}
  function nearby(){return engine?.nearby();}
  let visitStatus='';
  function text(element:HTMLElement,value:string){if(element.textContent!==value)element.textContent=value;}
  function draw(){
    text(day,'DAY '+current()+' / '+chapter().name.toUpperCase());
    const near=nearby();
    canvas.dataset.map=save.position.map;canvas.dataset.x=String(save.position.x);canvas.dataset.y=String(save.position.y);canvas.dataset.facing=save.position.facing;
    text(title,data.maps[save.position.map].name);
    interactButton.disabled=!near;text(interactButton,near?'Talk · '+near.name:'Interact · E');
    locationNote.textContent=save.position.map==='house'?'Bookshelf ← · Bed → · Exit ↓':!state.progress.tutorialDone?(save.flags.metGuide?'Meet Muhammad Jan inside the Library, north of the village crossroads.':'Muhammad Jan is beside you. Approach him and press Interact.'):
      conditions.passed()?'Day '+current()+' complete. Explore, revisit lessons or review your Library.':near?'Nearby: '+near.name+' · Press E or Interact.':chapter().objective;
    const status=content.zoneKeys.map(loc=>(state.progress.complete[current()+'-'+loc]?'✓ ':'○ ')+locationNames[loc]);
    if(visitStatus!==status.join('|')){visitStatus=status.join('|');visits.replaceChildren(...status.map(label=>ui.node('span',label)));}
    notice.textContent=persistence.problem||(renderFailed?'Map unavailable. Use Quick travel below.':'');dirty=false;
  }
  function move(direction:Direction,now:number,immediate=false):boolean {
    engine?.cancelRoute();
    if(!active()||now-lastMove<(immediate?100:150))return false;
    lastMove=now;return engine?.step(direction)??false;
  }
  function guidanceLocation(actor:Actor):string {
    const map=data.maps[actor.map],region=map.regions.find(r=>actor.x>=r.x&&actor.x<r.x+r.w&&actor.y>=r.y&&actor.y<r.y+r.h);
    return (region?locationNames[region.id]??region.name:map.name)+' — '+actor.name;
  }
  function challengeTarget():string|undefined {
    const target=chapter().challenge;
    if(target)for(const map of target.map?[target.map]:chapter().maps){const actor=registry.npcs(current(),map).find(n=>n.id===target.npc);if(actor)return guidanceLocation(actor);}
    return undefined;
  }
  function guidanceTargets():string[]{
    const targets:string[]=[];
    for(const id of chapter().lessons.filter(id=>!state.progress.complete[id])){
      for(const map of chapter().maps){
        const actor=registry.npcs(current(),map).find(n=>registry.event(n.event)?.actions.some(a=>a.type==='lesson'&&a.lessonId===id));
        if(!actor)continue;
        targets.push(guidanceLocation(actor));break;
      }
    }
    return targets;
  }
  function interactionEvent(target:Actor):string {
    const c=chapter(),opening=c.openingEvent?data.events[c.openingEvent]:undefined;
    const arrival=(c.mapEvents?.[save.position.map]??[]).find(id=>{
      const event=registry.event(id);
      return !!target.characterId && story.status(id)!=='completed' && !!event &&
        (event.characterId===target.characterId || !!event.participants?.includes(target.characterId));
    });
    if(arrival)return arrival;
    if(target.characterId&&opening&&opening.characterId===target.characterId){
      const lesson=opening.actions.find((a):a is Extract<Action,{type:'lesson'}>=>a.type==='lesson');
      if(lesson&&state.progress.complete[lesson.lessonId]){
        if(lesson.resumeEvent&&story.status(lesson.resumeEvent)!=='completed')return lesson.resumeEvent;
      }else if(story.status(c.openingEvent!)!=='completed')return c.openingEvent!;
    }
    return target.event;
  }
  function interact(){if(!active())return;held=null;const target=nearby();if(!target)return;
    if(target.schedule){target.facing=({up:'down',down:'up',left:'right',right:'left'} as const)[save.position.facing];facings.set(target.id,target.facing);save.npcFlags[target.characterId??target.id]=true;}
    const authored=Object.values(data.conversations??{}).find(c=>c.characterId===target.characterId);
    const spec=authored?.days[String(current())];
    const day=current(), eligible=conversationEligible(state.progress,day,progression);
    const resolvedConversation=spec?conversationEvent(spec,data.events,
      eligible?learning.availableSentences(day):[],eligible,
      conversationCompleted(spec,save.triggers),story.cursor?.event,Math.random,
      ()=>learning.authoredResponse(spec.response.generatedId,day)):undefined;
    const eventId=resolvedConversation?.id??interactionEvent(target);
    if(eventId===chapter().openingEvent)chapters.opening(false);
    const registered=story.open(eventId);
    const resolved=registered&&resolvedConversation?resolvedConversation.event:registered;
    const original=resolved?{...resolved,actions:resolved.actions.map(a=>a.type==='lesson'&&state.progress.complete[a.lessonId]?{...a,label:'Review · '+a.label}:a)}:undefined;
    const guidance=target.characterId==='muhammad-jan'&&state.progress.tutorialDone?dailyGuidance(chapter(),state.progress,progression,guidanceTargets(),challengeTarget()):null;
    const event=original?(guidance?{...original,lines:[...original.lines,guidance],messages:original.messages?[...original.messages,{speaker:target.name,characterId:target.characterId,text:guidance}]:undefined}:original):guidance?{speaker:target.name,characterId:target.characterId,lines:[guidance],actions:[]}:null;
    if(!event)return;
    if(target.characterId!=='bilal' && !state.progress.tutorialDone && eventId!==chapter().openingEvent&&!event.actions.some(a=>a.type==='tutorial'||a.type==='reference'))dialogue.open({speaker:target.name,lines:[onboardingGuidance()],actions:[]});
    else dialogue.open(curriculumEvent(event,target),story.cursor?.index);
    dirty=true;
  }
  function act(action:Action){
    const eventId=story.cursor?.event;
    if(action.type==='challenge'&&(!chapters.challengeAvailable()||action.route==='normal'&&!chapter().lessons.every(id=>state.progress.complete[id])))return;
    if(action.type==='lesson'){beginLesson(action.lessonId,eventId,action);return;}
    if(action.type==='tutorial'){beginLesson('tutorial',eventId,action);return;}
    if(!story.choose(action))return;
    if(eventId==='onboarding-introduction'){state.progress.onboardingIntroductionPending=false;void storage.save();}
    if(action.type==='conversation-response'){content.wordById[action.card.id]=action.card;audio.speak(action.card.id,{track:false});openEvent(action.nextEvent);return;}
    if(eventId===chapter().routes?.skip.event&&conditions.passed())routes.select('skip');
    if(action.type==='sleep')void sleep();
    if(action.type==='dream')void openDreamMenu();
    if(action.type==='event')openEvent(action.event);
    if(action.type==='challenge'&&action.day===chapter().challenge?.day&&chapters.challengeAvailable()){
      void requestChallenge(action);
    }
    if(action.type==='scene')void travel(action.position);
    if(action.type==='explore'&&conditions.passed()&&(currentView==='result'||currentView==='complete')&&chapters.complete())showCompletion();
    if(action.type==='reference')openLibrary();
    if(action.type==='completion'&&conditions.passed())showCompletion();
    refreshAccess();scheduleSave();dirty=true;
  }
  function onboardingGuidance():string {
    const map=save.flags.metGuide?'library':'village';
    const guide=registry.npcs(current(),map).find(a=>a.characterId==='muhammad-jan');
    return guide?`Visit ${guidanceLocation(guide)} first. Complete the introductory conversation and Library activities before lessons.`:'Complete the introductory Library activities with Muhammad Jan first.';
  }
  function curriculumEvent(event:import('./types').StoryEvent,actor?:Actor):import('./types').StoryEvent {
    const schoolDone=!!state.progress.complete[`${current()}-school`],allDone=chapter().lessons.every(id=>state.progress.complete[id]);
    const sourceEvent=data.events[actor?.event??story.cursor?.event??''];
    const sourceActions=[...event.actions,...(sourceEvent?.actions??[])];
    const blocked=sourceActions.find(a=>a.type==='lesson'&&!state.progress.complete[a.lessonId]&&(!lessonEligible(a.lessonId)||!eligible(a.condition)||!eligible(sourceEvent?.condition)));
    const locked=!!blocked || !schoolDone&&sourceActions.some(a=>a.type==='challenge'||a.type==='lesson'&&a.lessonId!==`${current()}-school`);
    const prerequisite=[...(blocked?.condition??'').matchAll(/(?:^|[|:])complete:([0-9]+-(?:school|residential|nature|business))/g)].map(match=>match[1]).find(id=>!state.progress.complete[id]);
    const nextId=!schoolDone?`${current()}-school`:prerequisite&&!state.progress.complete[prerequisite]?prerequisite:blocked?.type==='lesson'?blocked.lessonId:chapter().lessons.find(id=>!state.progress.complete[id]&&lessonEligible(id));
    const destination=nextId?quickDestination(nextId):undefined;
    const message=schoolDone&&destination?.actor?.id===actor?.id&&destination?.actor?`Continue the story interaction here at ${guidanceLocation(destination.actor)} before this lesson. Other available lessons can be studied in any order.`:destination?.actor?`Visit ${guidanceLocation(destination.actor)} first. ${!schoolDone?'School explains today’s sentence pattern.':'Speak with them to continue the story; available lessons may be studied in any order.'}`:'Explore and speak with the village teachers; this lesson is not available today.';
    return {...event,lines:locked?[...event.lines,message]:event.lines,
      messages:locked&&event.messages?[...event.messages,{speaker:event.speaker,characterId:event.characterId,text:message}]:event.messages,
      actions:event.actions.filter(a=>a.type!=='challenge'||chapters.challengeAvailable()&&(a.route!=='normal'||allDone)).map(a=>a.type==='challenge'&&!a.route&&!allDone?{...a,label:'Skip to daily challenge'}:a)};
  }
  function openEvent(id:string){const event=story.open(id);if(event)dialogue.open(curriculumEvent(event),story.cursor?.index);}
  async function requestChallenge(action:Extract<Action,{type:'challenge'}>){
    if(transitions.active||reviewLaunching||state.reviewCampaign||advancing||launching)return;launching=true;held=null;
    try{
    if(state.progress.activeChallenge){
      const pending=state.progress.activeChallenge.loop;if(!policy.configured(pending)||!learning.allowed(pending))return;
      if(selectedDay!==pending){selectedDay=pending;state.day=pending;save.chapter=chapter().id;save.position={...chapter().start};engine?.sync();}
      challenge.resumeChallenge();return;
    }
    if(chapter().routes){
      const route=action.route??(routes.visited()?"normal":"skip");
      if(!routes.resolved(route)){const rules=chapter().routes;const event=route==='normal'?(rules?.normal.opening&&!save.triggers[rules.normal.opening]?rules.normal.opening:rules?.normal.finale):rules?.skip.event;if(event)openEvent(event);return;}
      if(!routes.select(route))return;
      if(!await persist())return;
    }
    const map=chapter().challenge?.map;
    if(map&&save.position.map!==map){
      const actor=registry.npcs(current(),map).find(n=>n.id===chapter().challenge?.npc);
      const tile=actor?approachTiles(data,map,actor,registry.objects(current(),map))[0]:data.maps[map].spawn;
      if(tile)await travel({map,...tile,facing:actor?facingToward(tile,actor):'up'});
    }
    if(!disposed)challenge.startChallenge(action.day);
    }finally{launching=false;}
  }
  async function travel(position:WorldSave['position']){
    if(disposed)return;
    if(!availableMaps().includes(position.map))return;
    engine?.cancelRoute();
    save.position=RPGWorldData.recover(data,position);engine?.relocate();dirty=true;
    await persist();
  }
  function endDream(){
    if(!state.reviewCampaign)return;
    state.progress=state.reviewCampaign;delete state.reviewCampaign;state.session=null;dreamDay=undefined;
    ui.$('dreamExit')?.remove();
  }
  async function goHome(){if(disposed)return;endDream();startWorld();await travel({map:'house',x:12,y:15,facing:'up'});if(disposed)return;engine?.relocate();draw();}
  async function sleep(){
    if(disposed||transitions.active||reviewLaunching||sleeping||advancing||state.reviewCampaign)return;
    const from=current();
    if(!progression.passedChallenge(state.progress,from)){dialogue.open({speaker:'Rest',lines:['Complete today’s required challenge before beginning the next day.'],actions:[]});return;}
    if(state.progress.activeChallenge){dialogue.open({speaker:'Rest',lines:['You have a paused challenge attempt. Resume it from Quick travel before sleeping; your recorded pass is safe.'],actions:[]});return;}
    // A restored pass can precede acknowledgement of its alternate narrative.
    // Resolve that existing event before leaving; never fabricate story flags.
    if(!chapters.complete()){const event=chapter().routes?.skip.event;if(event)openEvent(event);else dialogue.open({speaker:'Rest',lines:['Finish today’s story before beginning the next day.'],actions:[]});return;}
    const ending=chapter().endingEvent;
    if(ending&&story.status(ending)!=='completed'){showCompletion();return;}
    const next=chapters.next();
    if(!next){dialogue.open({speaker:'Rest',lines:['You have reached the available story. You can dream, explore or review your Library.'],actions:[]});return;}
    sleeping=true;held=null;engine?.cancelRoute();
    try{
      save.sleepIntent={from,to:next.day};if(!await persist()||disposed)return;
      await transitions.play('sleep','DAY '+next.day,async()=>{
        if(disposed)return false;
        await enterChapter(next.day);
        if(disposed||current()!==next.day)return false;
        delete save.sleepIntent;return persist();
      });
    }finally{sleeping=false;if(!disposed)canvas.focus();}
  }
  const dreamMenu=document.createElement('dialog');dreamMenu.id='dreamMenu';dreamMenu.className='rpg-dialogue';dreamMenu.setAttribute('aria-label','Dream review');document.body.append(dreamMenu);
  dreamMenu.addEventListener('close',()=>canvas.focus());
  async function openDreamMenu(selected?:number){
    if(disposed||transitions.active||reviewLaunching||state.reviewCampaign||dreamMenu.open)return;
    reviewLaunching=true;held=null;engine?.cancelRoute();
    try{
      if(save.position.map!=='house')await goHome();
      if(disposed||!await persist())return;
      await transitions.play('dream-enter','DREAM',()=>{
        if(disposed)return false;
        dreamMenu.replaceChildren(ui.node('h2','Dream — Choose a day'));
        const days=Object.values(data.days).filter(c=>progression.passedChallenge(state.progress,c.day));
        if(!days.length)dreamMenu.append(ui.node('p','Complete a day’s challenge to make its lessons available in dreams.'));
        for(const c of days){const button=ui.button('Day '+c.day+' — '+c.name,()=>openDreamActivities(c.day));button.dataset.dreamDay=String(c.day);dreamMenu.append(button);}
        dreamMenu.append(ui.button('Return to house',()=>void exitDream()));
        if(selected)openDreamActivities(selected);
        dreamMenu.showModal();return true;
      });
    }finally{reviewLaunching=false;}
  }
  async function exitDream(){
    if(disposed||transitions.active||reviewLaunching||(!state.reviewCampaign&&!dreamMenu.open))return;
    reviewLaunching=true;held=null;
    try{
      await transitions.play('dream-exit','AWAKENING',()=>{
        if(disposed)return false;
        dreamMenu.close();endDream();startWorld();return true;
      });
    }finally{reviewLaunching=false;if(!disposed)canvas.focus();}
  }
  dreamMenu.addEventListener('cancel',event=>{event.preventDefault();void exitDream();});
  function openDreamActivities(day:number){
    if(!progression.passedChallenge(state.progress,day))return;
    dreamMenu.replaceChildren(ui.node('h2','Dream — Day '+day),ui.node('p','Review only · No campaign XP, unlocks or day changes.'));
    for(const id of data.days[String(day)].lessons){const button=ui.button(locationNames[id.split('-')[1]],()=>void beginDream(day,id));button.dataset.dreamLesson=id;dreamMenu.append(button);}
    dreamMenu.append(ui.button('Return to house',()=>void exitDream()));
  }
  async function beginDream(day:number,id:string){
    if(transitions.active||reviewLaunching||state.reviewCampaign||!progression.passedChallenge(state.progress,day)||!data.days[String(day)].lessons.includes(id))return;
    reviewLaunching=true;
    try{
      dreamMenu.close();if(!await persist())return;
      state.reviewCampaign=state.progress;state.progress=JSON.parse(JSON.stringify(state.progress));state.progress.reviewOnly=true;dreamDay=day;
      lessons.begin(id);
      const exit=ui.button('Exit dream — Return to house',()=>void exitDream());exit.id='dreamExit';ui.$('rpgLearningHeader').append(exit);
    }finally{reviewLaunching=false;}
  }
  async function enterChapter(day:number){
    const next=data.days[String(day)];if(advancing||!next||!policy.configured(day)||!learning.allowed(day))return;
    advancing=true;held=null;
    try{
      if(!await persist())return;
      const previous={day:state.day,chapter:save.chapter,position:{...save.position}};
      selectedDay=next.day;state.day=next.day;save.chapter=next.id;save.position=dailySpawn(data);delete save.dialogue;state.session=null;currentView='world';
      if(!await persist()){selectedDay=previous.day;state.day=previous.day;save.chapter=previous.chapter;save.position=previous.position;currentView='complete';showCompletion();return;}
      startWorld();await persist();
    }finally{advancing=false;}
  }
  function openLibrary(){held=null;engine?.cancelRoute();library.openLibrary();}
  function startWorld(){
    if(disposed)return;
    if(state.reviewCampaign&&!reviewLaunching){void exitDream();return;}
    endDream();
    audio.stopAudio();current();state.session=null;save.flags.started=true;
    if(!availableMaps().includes(save.position.map))save.position={...chapter().start};
    save.position=RPGWorldData.recover(data,save.position,npcs());
    ui.$('rpgCompletionExtra')?.remove();ui.$('resultReplay').classList.remove('hidden');
    document.querySelector<HTMLElement>('.brand')!.textContent='✦ PASHTO QUEST · '+chapter().name;
    ui.hud();ui.view('worldScreen');canvas.focus();engine?.sync();draw();refreshAccess();
    if(state.progress.onboardingIntroductionPending)openEvent('onboarding-introduction');

  }
  // Existing bound navigation callbacks delegate here as well.
  state.rpg={startWorld,navigatePlace:()=>interact(),reset(){transitions.cancel();persistence.authorizeReset();save=RPGPersistence.fresh(data);engine?.scene.resetActivities();selectedDay=data.firstDay;state.day=data.firstDay;currentView='intro';ui.$('rpgCompletionExtra')?.remove();ui.$('resultReplay').classList.remove('hidden');refreshAppearance();configureIntro();scheduleSave();}};
  function showCompletion(){
    if(disposed||!chapters.complete())return;
    current();document.querySelector<HTMLElement>('.brand')!.textContent='✦ PASHTO QUEST · '+chapter().name;currentView='complete';oldView('resultScreen');root.classList.remove('hidden');document.body.classList.add('rpg-overlay-active');layout.resize();
    ui.$('resultHeading').textContent=chapter().presentation?.milestoneTitle??(chapter().completion.terminal?(chapter().presentation?.terminalTitle??'Chapter complete'):(chapter().presentation?.completeTitle??'Day '+current()+' complete'));
    const dispatched=chapters.ending();
    if(!dispatched&&chapter().endingEvent&&story.status(chapter().endingEvent!)!=='completed')openEvent(chapter().endingEvent!);
    const ending=chapter().endingEvent&&registry.event(chapter().endingEvent!);
    // A one-line ending is presented in the results. Interactive/sequential
    // endings keep the same dialogue lifecycle and its persistent effects.
    if(ending&&!ending.actions.length&&!ending.messages&&ending.lines.length===1){
      if(dialogueDialog.open)dialogueDialog.close();story.choose({type:'explore',label:'Return to results'});
    }
    ui.$('resultDescription').textContent=ending?ending.speaker+': '+ending.lines.join(' '):'Chapter complete.';
    ui.$('resultAccuracy').textContent=(state.session?.mode==='challenge'?state.session.correctCount:state.progress.challenges[current()]?.best??0)+'/'+progression.getChallengeSpec(current()).questionCount;
    ui.$('resultXPLabel').textContent='Total XP';ui.$('resultKnowledgeLabel').textContent='Current level and title';ui.$('resultScreen').querySelector<HTMLElement>('.eyebrow')!.textContent=(chapter().presentation?.completeTitle??'Chapter complete').toUpperCase();
    const status=progression.characterStatus(state.progress);ui.$('resultXP').textContent=status.xp+' XP';
    ui.$('resultKnowledge').textContent='Level '+status.level+' · '+status.title;
    ui.$('resultWorld').textContent='Return to village';
    ui.$('resultNext').textContent='Day complete! Return home and sleep to begin the next day.';ui.$('resultReplay').classList.add('hidden');
    let extra=ui.$('rpgCompletionExtra');if(!extra){extra=ui.node('div',undefined,'buttons');extra.id='rpgCompletionExtra';ui.$('resultScreen').append(extra);}extra.replaceChildren();
    extra.append(ui.button('Review Library',()=>openLibrary()),ui.button('Replay / reset journey',()=>ui.$('resetProgress').click()));
    if(data.maps.house)extra.append(ui.button('Go home',()=>void goHome()));

    save.flags.completed=true;dirty=true;scheduleSave();
  }
  async function persist(){
    if(state.reviewCampaign)return true;
    if(disposed||restoring||storage.problem||storage.persistenceProblem)return false;
    const ok=await storage.settled();if(!ok||disposed)return false;if(state.reviewCampaign)return true;
    if(engine)save.activities=engine.scene.activitySnapshot();
    save.chapter=chapter().id;
    save.view=currentView==='lesson'?'lesson':currentView==='complete'?'complete':'world';
    save.lesson=currentView==='lesson'?RPGPersistence.lessonSnapshot(state.session):null;
    save.educationFingerprint=RPGPersistence.fingerprint(storage.snapshot());
    const saved=await persistence.save(save);if(disposed)return false;notice.textContent=persistence.problem||(renderFailed?'Map unavailable. Use Quick travel below.':'');return saved;
  }
  function scheduleSave(){if(disposed)return;clearTimeout(timer);timer=setTimeout(()=>void persist(),180);}
  const keys:Record<string,Direction>={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
  function keydown(e:KeyboardEvent){if(!active()||e.ctrlKey||e.metaKey||e.altKey)return;if((e.target as Element)?.closest?.('input,textarea,select,[contenteditable=true]') || ((e.target as Element)?.closest?.('button,a,summary')&&['Enter',' '].includes(e.key)))return;if(keys[e.key]){e.preventDefault();if(!e.repeat){held=keys[e.key];move(held,performance.now(),true);}}else if(['e','E','Enter',' '].includes(e.key)){e.preventDefault();if(!e.repeat)interact();}else if(e.key==='l'||e.key==='L'){e.preventDefault();if(!e.repeat)openLibrary();}else if(e.key==='Escape'){e.preventDefault();openMenu();}}
  const keyup=(e:KeyboardEvent)=>{if(keys[e.key])held=null;};
  document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);
  window.addEventListener('blur',()=>{held=null;focused=false;void persist();},{signal:listeners.signal});
  window.addEventListener('focus',()=>{focused=true;dirty=true;},{signal:listeners.signal});
  window.addEventListener('pagehide',()=>{held=null;transitions.cancel();void persist();},{signal:listeners.signal});
  window.addEventListener('resize',()=>{layout.resize();dirty=true;},{signal:listeners.signal});
  document.addEventListener('visibilitychange',()=>{held=null;if(document.hidden)void persist();else{dirty=true;}},{signal:listeners.signal});
  document.addEventListener('click',()=>{if(currentView==='lesson')scheduleSave();},{signal:listeners.signal});
  document.addEventListener('input',()=>{if(currentView==='lesson')scheduleSave();},{signal:listeners.signal});
  function configureIntro(){const intro=ui.$('introScreen'),begin=ui.$('startTutorial'),pace=ui.$('onboardingPace');intro.replaceChildren();
    intro.append(ui.node('p','DAY '+current()+' · LAGHMAN, AFGHANISTAN','eyebrow'),ui.node('h2',chapter().name,'headline'),ui.node('p','Make a new home in a Pashto-speaking village. Explore its paths, meet your neighbours and learn the words that connect you.'),ui.node('p',chapter().intro));
    if(pace)intro.append(pace);begin.textContent='Enter the village →';intro.append(begin,ui.node('p','Arrows / WASD to move · E to interact · L for Library. Touch controls are available. Your RPG progress is saved separately.','tiny muted'));
  }
  configureIntro();
  function boot(){
    current();restoring=true;

    if(save.sleepIntent&&(current()!==save.sleepIntent.from||!progression.passedChallenge(state.progress,current()))){delete save.sleepIntent;}
    if(save.sleepIntent&&current()===save.sleepIntent.from&&progression.passedChallenge(state.progress,current())){restoring=false;void sleep();return;}
    if(policy.configured(state.progress.activeChallenge?.loop??0)&&chapters.challengeAvailable())challenge.resumeChallenge();
    else if(pairedLesson)lessons.resume(pairedLesson);
    else if(conditions.passed()&&save.view==='complete')showCompletion();
    else if(save.flags.started||state.progress.tutorialDone)startWorld();else ui.view('introScreen');
    restoring=false;scheduleSave();
  }
  return {boot,startWorld,move,interact,registry,diagnostics:()=>engine?.scene.inspect(),get position(){return {...save.position};},flush:async()=>{clearTimeout(timer);await storage.settled();return persist();},dispose(){endDream();dreamMenu.remove();disposed=true;transitions.dispose();listeners.abort();dialogue.dispose();menu.remove();ui.hud=educationalHUD;ui.view=oldView;storage.save=oldSave;lessons.begin=lessonBegin;challenge.startChallenge=challengeStart;policy.dispose();delete state.rpg;document.body.classList.remove('rpg-overlay-active');layout.dispose();engine?.destroy();root.replaceChildren();clearTimeout(timer);document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);}};
}
