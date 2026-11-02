import type {EducationServices,RPGDependencies,Direction,Appearance,Action,WorldSave,Actor} from './types';
import {RPGWorldData} from './world-data';
import {createRPGRegistry,createRPGDialogue} from './content';
import {createRPGProgression} from './progression';
import {createPersistenceAPI} from './persistence';
import {createChapterDirector} from './chapters';
import {createStoryDirector} from './story';
import {createChapterRoutes} from './routes';
import {createPhaserWorld} from './phaser-world';
import {approachTiles,facingToward} from './movement';
/* RPG profile adapters. Education remains authoritative; world state owns no rewards. */
export function createRPG({state,content,progression,learning,ui,audio,storage,world,lessons,challenge,library}:EducationServices,dependencies:RPGDependencies) {
  const data=dependencies.data,RPGPersistence=createPersistenceAPI(data,dependencies.questions),persistence=RPGPersistence.create(data,undefined,dependencies.fence);
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
  const registry=createRPGRegistry(data,conditions,eligible);
  const story=createStoryDirector({value:()=>save,event:registry.event,eligible,changed:()=>scheduleSave()});
  const chapters=createChapterDirector({data,state,learning,progression,eligible,triggers:()=>save.triggers,dispatch:id=>openEvent(id),routeComplete:()=>routes.complete()});
  function current():number{return state.day=policy.clamp(selectedDay??state.day);}
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
  // These entry guards also protect replay and restored snapshots.
  const lessonBegin=lessons.begin;lessons.begin=id=>{
    if(!policy.lessonAllowed(id)||!chapters.ready(chapter())||!['tutorial','review'].includes(id)&&!learning.placeAccessible(Number(id.split('-')[0]),id.split('-')[1]))return;
    lessonBegin(id);
  };
  const challengeStart=challenge.startChallenge;challenge.startChallenge=(day,...args)=>{if(policy.configured(day)&&day===current()&&chapters.challengeAvailable())challengeStart(day,...args);};
  const root=ui.$('worldScreen');root.replaceChildren();root.className='rpg-world panel hidden';
  const heading=ui.node('div',undefined,'rpg-heading');
  const title=ui.node('h2','Laghman Village');title.id='rpgLocation';
  const day=ui.node('span','DAY '+current()+' / '+chapter().name.toUpperCase(),'rpg-day');
  heading.append(ui.node('div','PASHTO QUEST / RPG','eyebrow'),day,title);
  const tools=ui.node('div',undefined,'buttons rpg-tools');
  const libButton=ui.button('Library · L',()=>openLibrary());libButton.id='rpgLibrary';
  const menuButton=ui.button('Menu · Esc',()=>openMenu());menuButton.id='rpgMenuButton';
  tools.append(libButton,menuButton);heading.append(tools);root.append(heading);
  const viewport=ui.node('div',undefined,'rpg-viewport'),canvas=document.createElement('canvas');
  canvas.id='rpgCanvas';canvas.width=window.innerWidth<600?256:512;canvas.height=window.innerWidth<600?192:320;canvas.tabIndex=0;canvas.setAttribute('aria-label','Village exploration. Use arrow keys or WASD to move; E or Enter to interact. Click or tap to move; select a character to approach and talk.');
  const locationNote=ui.node('p','','rpg-location-note');locationNote.id='rpgObjective';locationNote.setAttribute('role','status');
  viewport.append(canvas);root.append(viewport,document.querySelector<HTMLElement>('.herochar')!,locationNote);
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
  controls.append(dpad,interactButton,controlHelp);root.append(controls);
  const visits=ui.node('div',undefined,'rpg-visits');visits.id='rpgVisits';root.append(visits);
  const notice=ui.node('p','','tiny');notice.id='rpgSaveNotice';notice.setAttribute('role','status');root.append(notice);
  const dialogueDialog=document.createElement('dialog');dialogueDialog.id='rpgDialogue';dialogueDialog.className='rpg-dialogue';document.body.append(dialogueDialog);
  const dialogue=createRPGDialogue({dialog:dialogueDialog,ui,onAction:act,onIndex:index=>story.index(index),eligible,onClose:()=>{story.close();held=null;dirty=true;canvas.focus();scheduleSave();}});
  const menu=document.createElement('dialog');menu.id='rpgMenu';menu.className='rpg-dialogue';menu.setAttribute('aria-label','Village menu');
  menu.append(ui.node('h2','Your journey'),ui.node('p','Explore at your own pace. Challenge access follows the current chapter and educational prerequisites.'));
  const appearance=ui.node('fieldset'),legend=ui.node('legend','Character appearance');appearance.append(legend);
  for(const kind of ['masculine','feminine','neutral'] as const) {const b=ui.button(kind[0].toUpperCase()+kind.slice(1),()=>{save.appearance=kind;dirty=true;refreshAppearance();scheduleSave();});b.dataset.appearance=kind;appearance.append(b);}
  menu.append(ui.$('dialectGuide'),ui.$('resetProgress'));
  menu.append(appearance,ui.button('Open Library',()=>{menu.close();openLibrary();}),ui.button('Due review',()=>{menu.close();lessons.begin('review');}),ui.button('Journey results',()=>{menu.close();if(conditions.passed())showCompletion();else dialogue.open({speaker:'Muhammad Jan',lines:['Complete the Day '+current()+' challenge with at least '+progression.getChallengeSpec(current()).passCount+' out of '+progression.getChallengeSpec(current()).questionCount+' correct answers.'],actions:[]});}),ui.button('Resume village',()=>menu.close()));
  const history=ui.node('details');history.append(ui.node('summary','Revisit completed chapters'));const historyButtons=ui.node('div',undefined,'buttons');history.append(historyButtons);menu.append(history);
  function openMenu(){held=null;engine?.cancelRoute();historyButtons.replaceChildren();for(const c of Object.values(data.days))if(policy.configured(c.day)&&learning.allowed(c.day)&&progression.passedChallenge(state.progress,c.day))historyButtons.append(ui.button('Revisit Day '+c.day,()=>{menu.close();void enterChapter(c.day);}));menu.showModal();}
  document.body.append(menu);ui.$('resetProgress').addEventListener('click',()=>menu.close(),{signal:listeners.signal});menu.addEventListener('close',()=>{held=null;canvas.focus();dirty=true;});
  function refreshAppearance(){for(const b of appearance.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.appearance===save.appearance));}refreshAppearance();
  let engine:ReturnType<typeof createPhaserWorld>|undefined;
  try {if(!canvas.getContext('2d'))throw Error('Canvas unavailable');
  engine=createPhaserWorld({canvas,data,allowedMaps:()=>chapter().maps,position:()=>save.position,actors:()=>registry.objects(current(),save.position.map).map(n=>({...n,facing:facings.get(n.id)||'down'})),appearance:()=>save.appearance,active,
    onInteract(){interact();},
    onMove(position,transition){const moved=save.position.x!==position.x||save.position.y!==position.y||save.position.map!==position.map;save.position=position;if(moved)save.flags.moved=true;if(transition)held=null;dirty=true;scheduleSave();},
    onFrame(){if(!active()){held=null;return;}if(dirty)draw();if(visitMap())return;const target=engine?.nearby()?.id||'';if(target!==lastTarget){lastTarget=target;dirty=true;}if(held)move(held,performance.now());if(dirty)draw();}});
  }catch{renderFailed=true;notice.textContent='The map could not start. Use Quick travel below; your learning progress remains available.';}
  const access=ui.node('details'),summary=ui.node('summary','Quick travel');access.append(summary);
  const accessButtons=ui.node('div',undefined,'buttons');
  access.append(ui.node('p','Travel to a character and use the same conversation as walking. Locked lessons follow your story progress.', 'tiny'),accessButtons);root.append(access);
  const locationNames:Record<string,string>={residential:'Home',nature:'Lake',business:'Market',school:'School'};
  function quickDestination(id:string):{label:string;actor?:Actor} {
    const loc=id.split('-')[1],c=chapter();
    // A Nature finale can change scenes without creating a fifth district.
    const finale=loc==='nature'&&eligible('allLessons')&&c.challenge?.location==='hills';
    const maps=finale?[c.challenge!.map!]:c.maps;
    for(const map of maps){
      const actor=registry.npcs(current(),map).find(a=>finale?a.id===c.challenge?.npc:data.events[a.event]?.actions.some(action=>action.type==='lesson'&&action.lessonId===id));
      if(actor){
        const region=data.maps[map].regions.find(r=>actor.x>=r.x&&actor.x<r.x+r.w&&actor.y>=r.y&&actor.y<r.y+r.h);
        const actual=finale?data.maps[map].name.split(' · ')[0]:region&&locationNames[region.id]||locationNames[loc];
        return {label:actual+(actual!==locationNames[loc]&&!finale?' · '+actor.name:''),actor};
      }
    }
    return {label:locationNames[loc]};
  }
  async function quickTravel(id:string){
    if(!eligible('lesson:'+id)||!active()&&!(renderFailed&&currentView==='world'&&!document.querySelector('dialog[open]')))return;
    const target=quickDestination(id).actor;
    if(!target||renderFailed){lessons.begin(id);return;}
    const tiles=approachTiles(data,target.map,target,registry.objects(current(),target.map));
    const tile=tiles[0];if(!tile)return;
    held=null;engine?.cancelRoute();
    await travel({map:target.map,x:tile.x,y:tile.y,facing:facingToward(tile,target)});
    if(!dialogue.isOpen)interact();
  }
  function refreshAccess(){accessButtons.replaceChildren();
    if(!state.progress.tutorialDone)accessButtons.append(ui.button('Begin Library tutorial',()=>lessons.begin(chapter().tutorialLessonId??'tutorial')));
    else for(const id of chapter().lessons){const destination=quickDestination(id);const b=ui.button(destination.label,()=>void quickTravel(id));b.dataset.destination=id.split('-')[1];b.disabled=!eligible('lesson:'+id);accessButtons.append(b);}
    if(chapters.challengeAvailable())accessButtons.append(ui.button('Day '+current()+' challenge',()=>act({label:'Challenge',type:'challenge',day:current()})));
    accessButtons.append(ui.button('Open Library',openLibrary));
  }
  canvas.addEventListener('contextlost',()=>{renderFailed=true;held=null;refreshAccess();access.open=true;notice.textContent='Map rendering was interrupted. Quick travel remains available.';},{signal:listeners.signal});
  // Restore a paired lesson before the first educational snapshot compacts history.
  // Otherwise that snapshot would retire the lesson's deduplication events.
  const pairedLesson = !state.progress.activeChallenge && save.view==='lesson' &&
    save.educationFingerprint===RPGPersistence.fingerprint(JSON.stringify(state.progress))
      ? RPGPersistence.restoreLesson(save.lesson,content,state.progress) : null;
  if(pairedLesson) state.session=pairedLesson;
  const oldView=ui.view;
  ui.view=name=>{
    held=null;engine?.cancelRoute();audio.stopAudio();current();document.querySelector<HTMLElement>('.brand')!.textContent='✦ PASHTO QUEST · '+chapter().name;
    if(name==='resultScreen'){ui.$('resultXPLabel').textContent='XP gained';ui.$('resultKnowledgeLabel').textContent='Items practised';ui.$('resultScreen').querySelector<HTMLElement>('.eyebrow')!.textContent='LESSON FINISHED';}
    currentView=name==='worldScreen'?'world':name==='lessonScreen'?'lesson':name==='resultScreen'?'result':'intro';
    oldView(name);ui.$('navLibrary').classList.toggle('hidden',name==='worldScreen'||name==='introScreen');
    const overlay=name==='lessonScreen'||name==='resultScreen';document.body.classList.toggle('rpg-overlay-active',overlay);if(overlay)root.classList.remove('hidden');
    if(name==='lessonScreen'&&state.session?.mode==='challenge'&&state.session.loop===chapter().challenge?.day){const caption=ui.$('challengeScene')?.querySelector('.eyebrow');if(caption)caption.textContent='DAY '+current()+' · CHAPTER CHALLENGE';}
    if(name==='resultScreen') {
      if(state.session?.mode==='challenge' && state.session.correctCount>=progression.getChallengeSpec(state.session.loop).passCount){if(chapters.complete())showCompletion();else if(chapter().routes?.skip.event)openEvent(chapter().routes!.skip.event!);}
      else if(state.session?.mode==='tutorial')ui.$('resultNext').textContent='Your first hello is complete. Leave the Library and meet your neighbours, or press L to open your reference.';
    }
    ui.$('navWorld').classList.toggle('hidden',name==='worldScreen'||name==='introScreen');
    dirty=true;scheduleSave();
  };
  const oldSave=storage.save.bind(storage);
  storage.save=()=>{const result=oldSave();if(!restoring)Promise.resolve(result).then(ok=>{if(ok)scheduleSave();});return result;};
  function active(){return !advancing&&!launching&&!disposed&&!renderFailed&&focused&&currentView==='world'&&!document.hidden&&!document.querySelector('dialog[open]');}
  function npcs(){return registry.npcs(current(),save.position.map).map(n=>({...n,facing:facings.get(n.id)||'down'}));}
  function nearby(){return engine?.nearby();}
  function draw(){
    day.textContent='DAY '+current()+' / '+chapter().name.toUpperCase();
    const near=nearby();
    canvas.dataset.map=save.position.map;canvas.dataset.x=String(save.position.x);canvas.dataset.y=String(save.position.y);canvas.dataset.facing=save.position.facing;
    title.textContent=data.maps[save.position.map].name;
    interactButton.disabled=!near;interactButton.textContent=near?'Talk · '+near.name:'Interact · E';
    locationNote.textContent=!state.progress.tutorialDone?(save.flags.metGuide?'Meet Muhammad Jan inside the Library, north of the village crossroads.':'Muhammad Jan is beside you. Approach him and press Interact.'):
      conditions.passed()?'Day '+current()+' complete. Explore, revisit lessons or review your Library.':near?'Nearby: '+near.name+' · Press E or Interact.':chapter().objective;
    visits.replaceChildren();for(const loc of content.zoneKeys)visits.append(ui.node('span',(state.progress.complete[current()+'-'+loc]?'✓ ':'○ ')+({residential:'Home',nature:'Lake',business:'Market',school:'School'}[loc])));
    notice.textContent=persistence.problem||(renderFailed?'Map unavailable. Use Quick travel below.':'');dirty=false;
  }
  function move(direction:Direction,now:number,immediate=false):boolean {
    engine?.cancelRoute();
    if(!active()||now-lastMove<(immediate?100:150))return false;
    lastMove=now;return engine?.step(direction)??false;
  }
  function interact(){if(!active())return;held=null;const target=nearby();if(!target)return;
    if(target.schedule){target.facing=({up:'down',down:'up',left:'right',right:'left'} as const)[save.position.facing];facings.set(target.id,target.facing);save.npcFlags[target.characterId??target.id]=true;}
    if(target.event===chapter().openingEvent)chapters.opening();
    const event=story.open(target.event);if(!event)return;
    if(!state.progress.tutorialDone && target.event!==chapter().openingEvent&&!event.actions.some(a=>a.type==='tutorial'||a.type==='reference'))dialogue.open({speaker:target.name,lines:['Muhammad Jan is waiting at the Library. Complete your first hello with him, then we can study together.'],actions:[]});
    else dialogue.open(event,story.cursor?.index);
    dirty=true;
  }
  function act(action:Action){
    const eventId=story.cursor?.event;
    if(!story.choose(action))return;
    if(eventId===chapter().routes?.skip.event&&conditions.passed())routes.select('skip');
    if(action.type==='event')openEvent(action.event);
    if(action.type==='tutorial')lessons.begin('tutorial');
    if(action.type==='lesson'&&state.progress.tutorialDone)lessons.begin(action.lessonId);
    if(action.type==='challenge'&&action.day===chapter().challenge?.day&&chapters.challengeAvailable()){
      void requestChallenge(action);
    }
    if(action.type==='scene')void travel(action.position);
    if(action.type==='explore'&&conditions.passed()&&(currentView==='result'||currentView==='complete')&&chapters.complete())showCompletion();
    if(action.type==='reference')openLibrary();
    if(action.type==='completion'&&conditions.passed())showCompletion();
    scheduleSave();dirty=true;
  }
  function openEvent(id:string){const event=story.open(id);if(event)dialogue.open(event,story.cursor?.index);}
  async function requestChallenge(action:Extract<Action,{type:'challenge'}>){
    if(advancing||launching)return;launching=true;held=null;
    try{
    if(state.progress.activeChallenge){
      const pending=state.progress.activeChallenge.loop;if(!policy.configured(pending)||!learning.allowed(pending))return;
      if(selectedDay!==pending){selectedDay=pending;state.day=pending;save.chapter=chapter().id;save.position={...chapter().start};engine?.sync();}
      challenge.resumeChallenge();return;
    }
    if(chapter().routes){
      const route=action.route??routes.request();
      if(!routes.resolved(route)){const alternative=chapter().routes?.skip.event;if(alternative)openEvent(alternative);return;}
      if(!routes.select(route))return;
      if(!await persist())return;
    }
    challenge.startChallenge(action.day);
    }finally{launching=false;}
  }
  function visitMap():boolean {
    if(dialogue.isOpen||currentView!=='world')return false;
    const event=(chapter().mapEvents?.[save.position.map]??[]).find(id=>story.status(id)!=='completed'&&registry.event(id));
    if(!event)return false;openEvent(event);return dialogue.isOpen;
  }
  async function travel(position:WorldSave['position']){
    if(!chapter().maps.includes(position.map))return;
    engine?.cancelRoute();
    save.position=RPGWorldData.recover(data,position);engine?.relocate();dirty=true;
    await persist();visitMap();
  }
  async function advance(){
    if(advancing)return;const next=chapters.next();if(!next)return;
    if(chapter().endingEvent&&story.status(chapter().endingEvent!)!=='completed')return;
    return enterChapter(next.day);
  }
  async function enterChapter(day:number){
    const next=data.days[String(day)];if(advancing||!next||!policy.configured(day)||!learning.allowed(day))return;
    advancing=true;held=null;
    try{
      if(!await persist())return;
      const previous={day:state.day,chapter:save.chapter,position:{...save.position}};
      selectedDay=next.day;state.day=next.day;save.chapter=next.id;save.position={...next.start};delete save.dialogue;state.session=null;currentView='world';
      if(!await persist()){selectedDay=previous.day;state.day=previous.day;save.chapter=previous.chapter;save.position=previous.position;currentView='complete';showCompletion();return;}
      startWorld();await persist();
    }finally{advancing=false;}
  }
  function openLibrary(){held=null;engine?.cancelRoute();library.openLibrary();}
  function startWorld(){
    audio.stopAudio();current();state.session=null;save.flags.started=true;
    if(!chapter().maps.includes(save.position.map))save.position={...chapter().start};
    save.position=RPGWorldData.recover(data,save.position,npcs());
    ui.$('rpgCompletionExtra')?.remove();ui.$('resultReplay').classList.remove('hidden');
    document.querySelector<HTMLElement>('.brand')!.textContent='✦ PASHTO QUEST · '+chapter().name;
    ui.hud();ui.view('worldScreen');canvas.focus();engine?.sync();draw();refreshAccess();
    if(story.cursor)dialogue.open(story.resume(),story.cursor.index);
    else if(chapter().openingEvent&&story.status(chapter().openingEvent!)!=='completed'&&chapter().openingMode==='automatic'){if(!chapters.opening())openEvent(chapter().openingEvent!);}else visitMap();
  }
  // Existing bound navigation callbacks delegate here as well.
  state.rpg={startWorld,navigatePlace:()=>interact(),reset(){persistence.authorizeReset();save=RPGPersistence.fresh(data);selectedDay=data.firstDay;state.day=data.firstDay;currentView='intro';ui.$('rpgCompletionExtra')?.remove();ui.$('resultReplay').classList.remove('hidden');refreshAppearance();configureIntro();scheduleSave();}};
  function showCompletion(){
    if(!chapters.complete())return;
    current();document.querySelector<HTMLElement>('.brand')!.textContent='✦ PASHTO QUEST · '+chapter().name;currentView='complete';oldView('resultScreen');root.classList.remove('hidden');document.body.classList.add('rpg-overlay-active');
    ui.$('resultHeading').textContent=chapter().presentation?.milestoneTitle??(chapter().completion.terminal?(chapter().presentation?.terminalTitle??'Pashto Quest — RPG Prototype Complete'):(chapter().presentation?.completeTitle??'Day '+current()+' complete'));
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
    const acquired=Object.keys(state.progress.library.acquired);const district=acquired.filter(id=>content.libraryEntries[id]?.countsTowardDailyQuota).length;
    ui.$('resultNext').textContent=acquired.length+' words unlocked ('+district+' district, '+(acquired.length-district)+' universal). Day '+current()+' completed.'+(!chapters.next()?' Further chapters will appear when their story content is registered.':'');
    ui.$('resultWorld').textContent='Return to village';ui.$('resultReplay').classList.add('hidden');
    let extra=ui.$('rpgCompletionExtra');if(!extra){extra=ui.node('div',undefined,'buttons');extra.id='rpgCompletionExtra';ui.$('resultScreen').append(extra);}extra.replaceChildren();
    extra.append(ui.button('Review Library',()=>openLibrary()),ui.button('Replay / reset journey',()=>ui.$('resetProgress').click()));
    const next=chapters.next();if(next){const button=ui.button('Continue to '+next.name,()=>{button.disabled=true;void advance().finally(()=>{button.disabled=false;});});button.id='rpgAdvance';button.disabled=!!chapter().endingEvent&&story.status(chapter().endingEvent!)!=='completed';extra.append(button);}
    save.flags.completed=true;dirty=true;scheduleSave();
  }
  async function persist(){
    if(disposed||restoring||storage.problem||storage.persistenceProblem)return false;
    const ok=await storage.settled();if(!ok||disposed)return false;
    save.chapter=chapter().id;
    save.view=currentView==='lesson'?'lesson':currentView==='complete'?'complete':'world';
    save.lesson=currentView==='lesson'?RPGPersistence.lessonSnapshot(state.session):null;
    save.educationFingerprint=RPGPersistence.fingerprint(storage.snapshot());
    const saved=await persistence.save(save);notice.textContent=persistence.problem||(renderFailed?'Map unavailable. Use Quick travel below.':'');return saved;
  }
  function scheduleSave(){if(disposed)return;clearTimeout(timer);timer=setTimeout(()=>void persist(),180);}
  const keys:Record<string,Direction>={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
  function keydown(e:KeyboardEvent){if(!active()||e.ctrlKey||e.metaKey||e.altKey)return;if((e.target as Element)?.closest?.('input,textarea,select,[contenteditable=true]') || ((e.target as Element)?.closest?.('button,a,summary')&&['Enter',' '].includes(e.key)))return;if(keys[e.key]){e.preventDefault();if(!e.repeat){held=keys[e.key];move(held,performance.now(),true);}}else if(['e','E','Enter',' '].includes(e.key)){e.preventDefault();if(!e.repeat)interact();}else if(e.key==='l'||e.key==='L'){e.preventDefault();if(!e.repeat)openLibrary();}else if(e.key==='Escape'){e.preventDefault();openMenu();}}
  const keyup=(e:KeyboardEvent)=>{if(keys[e.key])held=null;};
  document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);
  window.addEventListener('blur',()=>{held=null;focused=false;void persist();},{signal:listeners.signal});
  window.addEventListener('focus',()=>{focused=true;dirty=true;},{signal:listeners.signal});
  window.addEventListener('pagehide',()=>{held=null;void persist();},{signal:listeners.signal});
  window.addEventListener('resize',()=>{engine?.resize();dirty=true;},{signal:listeners.signal});
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

    if(policy.configured(state.progress.activeChallenge?.loop??0))challenge.resumeChallenge();
    else if(pairedLesson)lessons.resume(pairedLesson);
    else if(conditions.passed()&&save.view==='complete')showCompletion();
    else if(save.flags.started||state.progress.tutorialDone)startWorld();else ui.view('introScreen');
    restoring=false;scheduleSave();
  }
  return {boot,startWorld,move,interact,registry,diagnostics:()=>engine?.scene.inspect(),get position(){return {...save.position};},flush:async()=>{clearTimeout(timer);await storage.settled();return persist();},dispose(){disposed=true;listeners.abort();dialogue.dispose();menu.remove();ui.hud=educationalHUD;ui.view=oldView;storage.save=oldSave;lessons.begin=lessonBegin;challenge.startChallenge=challengeStart;policy.dispose();delete state.rpg;document.body.classList.remove('rpg-overlay-active');engine?.destroy();root.replaceChildren();clearTimeout(timer);document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);}};
}
