import type {EducationServices,RPGDependencies,Direction,Appearance,Action,WorldSave,Actor} from './types';
import {RPGWorldData as RPGWorldEngine} from './world-data';
import {createRPGRegistry,createRPGDialogue} from './content';
import {createRPGProgression} from './progression';
import {createPersistenceAPI} from './persistence';
import {createPhaserWorld} from './phaser-world';
/* RPG profile adapters. Education remains authoritative; world state owns no rewards. */
export function createRPG({state,content,progression,learning,ui,audio,storage,world,lessons,challenge,library}:EducationServices,dependencies:RPGDependencies) {
  const data=dependencies.data,RPGPersistence=createPersistenceAPI(data,dependencies.questions),persistence=RPGPersistence.create(data,undefined,dependencies.fence);
  let save:WorldSave=persistence.value,lastMove=0,held:Direction|null=null,timer:ReturnType<typeof setTimeout>|undefined,dirty=true,currentView='intro',restoring=false,disposed=false,lastTarget='';
  const conditions={beforeGuideMeeting:()=>!state.progress.tutorialDone&&!save.flags.metGuide,beforeTutorial:()=>!state.progress.tutorialDone,afterTutorial:()=>state.progress.tutorialDone,passed:()=>progression.passedChallenge(state.progress,1)};
  const registry=createRPGRegistry(data,conditions);
  const facings=new Map<string,Direction>();
  document.querySelector<HTMLElement>('.brand')!.textContent='✦ PASHTO QUEST · A first hello';
  document.querySelector<HTMLElement>('.herochar .avatar')!.textContent='☀';
  const policy=createRPGProgression({state,data,learning,progression});
  policy.current();
  const educationalHUD=ui.hud;
  ui.hud=()=>{
    educationalHUD();
    if(policy.terminal(policy.current())){
      ui.$('xpAmount').textContent='Day 1 complete · XP recorded';
      ui.$('xpBar').setAttribute('aria-valuetext',ui.$('xpAmount').textContent);
      ui.$('characterSubtitle').textContent='Welcome, '+state.progress.playerProfile.name+' · RPG prototype complete.';
    }
  };
  // These entry guards also protect replay and restored snapshots.
  const lessonBegin=lessons.begin;lessons.begin=id=>{
    if(!policy.lessonAllowed(id))return;
    lessonBegin(id);
  };
  const challengeStart=challenge.startChallenge;challenge.startChallenge=(day,...args)=>{if(policy.configured(day))challengeStart(day,...args);};
  const root=ui.$('worldScreen');root.replaceChildren();root.className='rpg-world panel hidden';
  const heading=ui.node('div',undefined,'rpg-heading');
  const title=ui.node('h2','Laghman Village');title.id='rpgLocation';
  const day=ui.node('span','DAY 1 / A FIRST HELLO','rpg-day');
  heading.append(ui.node('div','PASHTO QUEST / RPG PROTOTYPE','eyebrow'),day,title);
  const tools=ui.node('div',undefined,'buttons rpg-tools');
  const libButton=ui.button('Library · L',()=>openLibrary());libButton.id='rpgLibrary';
  const menuButton=ui.button('Menu · Esc',()=>menu.showModal());menuButton.id='rpgMenuButton';
  tools.append(libButton,menuButton);heading.append(tools);root.append(heading);
  const viewport=ui.node('div',undefined,'rpg-viewport'),canvas=document.createElement('canvas');
  canvas.id='rpgCanvas';canvas.width=window.innerWidth<600?256:512;canvas.height=window.innerWidth<600?192:320;canvas.tabIndex=0;canvas.setAttribute('aria-label','Village exploration. Use arrow keys or WASD to move; E or Enter to interact.');
  const locationNote=ui.node('p','','rpg-location-note');locationNote.id='rpgObjective';locationNote.setAttribute('role','status');
  viewport.append(canvas);root.append(viewport,locationNote);
  const controls=ui.node('div',undefined,'rpg-controls'),dpad=ui.node('div',undefined,'rpg-dpad');dpad.setAttribute('aria-label','Directional controls');
  const interactButton=ui.button('Interact · E',()=>interact());interactButton.id='rpgInteract';interactButton.className='primary';
  for(const [direction,label]of [['up','↑'],['left','←'],['down','↓'],['right','→']] as const) {
    const b=ui.button(label,()=>{});b.dataset.direction=direction;b.setAttribute('aria-label','Move '+direction);
    b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);held=direction;move(direction,performance.now(),true);});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{held=null;});
    b.addEventListener('click',e=>{if(e.detail===0)move(direction,performance.now(),true);});dpad.append(b);
  }
  const controlHelp=ui.node('p','Move with WASD or arrows. E / Enter to talk. L opens your Library.','tiny muted');
  controls.append(dpad,interactButton,controlHelp);root.append(controls);
  const visits=ui.node('div',undefined,'rpg-visits');visits.id='rpgVisits';root.append(visits);
  const notice=ui.node('p','','tiny');notice.id='rpgSaveNotice';notice.setAttribute('role','status');root.append(notice);
  const dialogueDialog=document.createElement('dialog');dialogueDialog.id='rpgDialogue';dialogueDialog.className='rpg-dialogue';document.body.append(dialogueDialog);
  const dialogue=createRPGDialogue({dialog:dialogueDialog,ui,onAction:act,onClose:()=>{held=null;dirty=true;canvas.focus();scheduleSave();}});
  const menu=document.createElement('dialog');menu.id='rpgMenu';menu.className='rpg-dialogue';menu.setAttribute('aria-label','Village menu');
  menu.append(ui.node('h2','Your journey'),ui.node('p','Day 1 · Explore at your own pace. The challenge is available at Home after the Library tutorial.'));
  const appearance=ui.node('fieldset'),legend=ui.node('legend','Character appearance');appearance.append(legend);
  for(const kind of ['masculine','feminine','neutral'] as const) {const b=ui.button(kind[0].toUpperCase()+kind.slice(1),()=>{save.appearance=kind;dirty=true;refreshAppearance();scheduleSave();});b.dataset.appearance=kind;appearance.append(b);}
  menu.append(appearance,ui.button('Open Library',()=>{menu.close();openLibrary();}),ui.button('Due review',()=>{menu.close();lessons.begin('review');}),ui.button('Prototype results',()=>{menu.close();if(conditions.passed())showCompletion();else dialogue.open({speaker:'Muhammad Jan',lines:['Complete the Day 1 challenge with at least 12 out of 15 correct answers to finish the prototype.'],actions:[]});}),ui.button('Resume village',()=>menu.close()));
  document.body.append(menu);menu.addEventListener('close',()=>{held=null;canvas.focus();dirty=true;});
  function refreshAppearance(){for(const b of appearance.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.appearance===save.appearance));}refreshAppearance();
  const engine=createPhaserWorld({canvas,data,position:()=>save.position,actors:()=>registry.objects(policy.current(),save.position.map).map(n=>({...n,facing:facings.get(n.id)||'down'})),appearance:()=>save.appearance,active,
    onMove(position,transition){const moved=save.position.x!==position.x||save.position.y!==position.y||save.position.map!==position.map;save.position=position;if(moved)save.flags.moved=true;if(transition)held=null;dirty=true;scheduleSave();},
    onFrame(){if(!active()){held=null;return;}const target=engine.nearby()?.id||'';if(target!==lastTarget){lastTarget=target;dirty=true;}if(held)move(held,performance.now());if(dirty)draw();}});
  // Restore a paired lesson before the first educational snapshot compacts history.
  // Otherwise that snapshot would retire the lesson's deduplication events.
  const pairedLesson = !state.progress.activeChallenge && save.view==='lesson' &&
    save.educationFingerprint===RPGPersistence.fingerprint(JSON.stringify(state.progress))
      ? RPGPersistence.restoreLesson(save.lesson,content,state.progress) : null;
  if(pairedLesson) state.session=pairedLesson;
  const oldView=ui.view;
  ui.view=name=>{
    held=null;audio.stopAudio();policy.current();currentView=name==='worldScreen'?'world':name==='lessonScreen'?'lesson':name==='resultScreen'?'result':'intro';
    oldView(name);
    const overlay=name==='lessonScreen'||name==='resultScreen';document.body.classList.toggle('rpg-overlay-active',overlay);if(overlay)root.classList.remove('hidden');
    if(name==='lessonScreen'&&state.session?.mode==='challenge'&&state.session.loop===1){const caption=ui.$('challengeScene')?.querySelector('.eyebrow');if(caption)caption.textContent='HOME · MUHAMMAD JAN’S CHECK-IN';}
    if(name==='resultScreen') {
      if(state.session?.mode==='challenge' && state.session.correctCount>=progression.getChallengeSpec(state.session.loop).passCount && policy.terminal(state.session.loop))showCompletion();
      else if(state.session?.mode==='tutorial')ui.$('resultNext').textContent='Your first hello is complete. Leave the Library and meet your neighbours, or press L to open your reference.';
    }
    ui.$('navWorld').classList.toggle('hidden',name==='worldScreen'||name==='introScreen');
    dirty=true;scheduleSave();
  };
  const oldSave=storage.save.bind(storage);
  storage.save=()=>{const result=oldSave();if(!restoring)Promise.resolve(result).then(ok=>{if(ok)scheduleSave();});return result;};
  function active(){return currentView==='world'&&!document.hidden&&!document.querySelector('dialog[open]');}
  function npcs(){return registry.npcs(policy.current(),save.position.map).map(n=>({...n,facing:facings.get(n.id)||'down'}));}
  function nearby(){return engine.nearby();}
  function draw(){
    day.textContent='DAY '+policy.current()+' / A FIRST HELLO';
    const near=nearby();
    canvas.dataset.map=save.position.map;canvas.dataset.x=String(save.position.x);canvas.dataset.y=String(save.position.y);canvas.dataset.facing=save.position.facing;
    title.textContent=data.maps[save.position.map].name;
    interactButton.disabled=!near;interactButton.textContent=near?'Talk · '+near.name:'Interact · E';
    locationNote.textContent=!state.progress.tutorialDone?(save.flags.metGuide?'Meet Muhammad Jan inside the Library, north of the village crossroads.':'Muhammad Jan is beside you. Approach him and press Interact.'):
      conditions.passed()?'Day 1 complete. Explore, revisit lessons or review your Library. The RPG prototype ends here.':near?'Nearby: '+near.name+' · Press E or Interact.':'Home ↖  ·  Lake ↗  ·  Market ↙  ·  School ↘  ·  Library ↑';
    visits.replaceChildren();for(const loc of content.zoneKeys)visits.append(ui.node('span',(state.progress.complete['1-'+loc]?'✓ ':'○ ')+({residential:'Home',nature:'Lake',business:'Market',school:'School'}[loc])));
    notice.textContent=persistence.problem||'';dirty=false;
  }
  function move(direction:Direction,now:number,immediate=false):boolean {
    if(!active()||now-lastMove<(immediate?100:150))return false;
    lastMove=now;return engine.step(direction);
  }
  function interact(){if(!active())return;held=null;const target=nearby();if(!target)return;
    if(target.schedule){target.facing=({up:'down',down:'up',left:'right',right:'left'} as const)[save.position.facing];facings.set(target.id,target.facing);save.npcFlags[target.id]=true;}
    const event=registry.event(target.event);if(!event)return;
    if(!state.progress.tutorialDone && !['welcome','library','reference'].includes(target.event))dialogue.open({speaker:target.name,lines:['Muhammad Jan is waiting at the Library. Complete your first hello with him, then we can study together.'],actions:[]});
    else dialogue.open(event);
    dirty=true;
  }
  function act(action:Action){
    if(action.type==='flag'){save.flags[action.flag]=true;}
    if(action.type==='tutorial')lessons.begin('tutorial');
    if(action.type==='lesson'&&state.progress.tutorialDone)lessons.begin(action.lessonId);
    if(action.type==='challenge'&&learning.allowed(action.day)){
      if(state.progress.activeChallenge)challenge.resumeChallenge();else challenge.startChallenge(action.day);
    }
    if(action.type==='reference')openLibrary();
    if(action.type==='completion'&&conditions.passed())showCompletion();
    scheduleSave();dirty=true;
  }
  function openLibrary(){held=null;library.openLibrary();}
  function startWorld(){
    audio.stopAudio();policy.current();state.session=null;save.flags.started=true;
    save.position=RPGWorldEngine.recover(data,save.position,npcs());
    ui.$('rpgCompletionExtra')?.remove();ui.$('resultReplay').classList.remove('hidden');
    ui.hud();ui.view('worldScreen');canvas.focus();engine.sync();draw();
  }
  // Existing bound navigation callbacks delegate here as well.
  state.rpg={startWorld,navigatePlace:()=>interact(),reset(){persistence.authorizeReset();save=RPGPersistence.fresh(data);currentView='intro';ui.$('rpgCompletionExtra')?.remove();ui.$('resultReplay').classList.remove('hidden');refreshAppearance();configureIntro();scheduleSave();}};
  function showCompletion(){
    policy.current();currentView='complete';oldView('resultScreen');root.classList.remove('hidden');document.body.classList.add('rpg-overlay-active');
    ui.$('resultHeading').textContent='Pashto Quest — RPG Prototype Complete';
    ui.$('resultDescription').textContent='Muhammad Jan: Congratulations! You have successfully completed Day 1.';
    ui.$('resultAccuracy').textContent=(state.session?.mode==='challenge'?state.session.correctCount:state.progress.challenges[1]?.best??0)+'/15';
    const status=progression.characterStatus(state.progress);ui.$('resultXP').textContent=status.xp+' XP';
    ui.$('resultKnowledge').textContent='Level '+status.level;
    const acquired=Object.keys(state.progress.library.acquired);const district=acquired.filter(id=>content.libraryEntries[id]?.countsTowardDailyQuota).length;
    ui.$('resultNext').textContent=acquired.length+' vocabulary lemmas unlocked ('+district+' district, '+(acquired.length-district)+' universal). Day 1 completed. This is the end of the RPG prototype; Day 2 is unavailable.';
    ui.$('resultWorld').textContent='Return to village';ui.$('resultReplay').classList.add('hidden');
    let extra=ui.$('rpgCompletionExtra');if(!extra){extra=ui.node('div',undefined,'buttons');extra.id='rpgCompletionExtra';ui.$('resultScreen').append(extra);}extra.replaceChildren();
    extra.append(ui.button('Review Library',()=>openLibrary()),ui.button('Replay / reset prototype',()=>ui.$('resetProgress').click()));
    save.flags.completed=true;dirty=true;scheduleSave();
  }
  async function persist(){
    if(disposed||restoring||storage.problem||storage.persistenceProblem)return;
    const ok=await storage.settled();if(!ok)return;
    save.view=currentView==='lesson'?'lesson':currentView==='complete'?'complete':'world';
    save.lesson=currentView==='lesson'?RPGPersistence.lessonSnapshot(state.session):null;
    save.educationFingerprint=RPGPersistence.fingerprint(storage.snapshot());
    await persistence.save(save);notice.textContent=persistence.problem||'';
  }
  function scheduleSave(){clearTimeout(timer);timer=setTimeout(persist,180);}
  const keys:Record<string,Direction>={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
  function keydown(e:KeyboardEvent){if(!active()||e.ctrlKey||e.metaKey||e.altKey)return;if((e.target as Element)?.closest?.('input,textarea,select,[contenteditable=true]') || ((e.target as Element)?.closest?.('button,a,summary')&&['Enter',' '].includes(e.key)))return;if(keys[e.key]){e.preventDefault();if(!e.repeat){held=keys[e.key];move(held,performance.now(),true);}}else if(['e','E','Enter',' '].includes(e.key)){e.preventDefault();if(!e.repeat)interact();}else if(e.key==='l'||e.key==='L'){e.preventDefault();if(!e.repeat)openLibrary();}else if(e.key==='Escape'){e.preventDefault();menu.showModal();}}
  const keyup=(e:KeyboardEvent)=>{if(keys[e.key])held=null;};
  document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);
  window.addEventListener('blur',()=>{held=null;});
  window.addEventListener('resize',()=>{engine.resize();dirty=true;});
  document.addEventListener('visibilitychange',()=>{held=null;if(document.hidden)persist();else{dirty=true;}});
  document.addEventListener('click',()=>{if(currentView==='lesson')scheduleSave();});
  document.addEventListener('input',()=>{if(currentView==='lesson')scheduleSave();});
  function configureIntro(){const intro=ui.$('introScreen'),begin=ui.$('startTutorial'),pace=ui.$('onboardingPace');intro.replaceChildren();
    intro.append(ui.node('p','DAY 1 · LAGHMAN, AFGHANISTAN','eyebrow'),ui.node('h2','Every journey begins with a hello.','headline'),ui.node('p','Make a new home in a Pashto-speaking village. Explore its paths, meet your neighbours and learn the words that connect you.'),ui.node('p','Muhammad Jan will guide you to the Library for your first four activities. Then explore Home, Lake, Market and School in any order. Pass the Day 1 challenge to complete this prototype.'));
    if(pace)intro.append(pace);begin.textContent='Enter the village →';intro.append(begin,ui.node('p','Arrows / WASD to move · E to interact · L for Library. Touch controls are available. Your prototype progress is saved separately.','tiny muted'));
  }
  configureIntro();
  function boot(){
    policy.current();restoring=true;

    if(policy.configured(state.progress.activeChallenge?.loop??0))challenge.resumeChallenge();
    else if(pairedLesson)lessons.resume(pairedLesson);
    else if(conditions.passed()&&save.view==='complete')showCompletion();
    else if(save.flags.started||state.progress.tutorialDone)startWorld();else ui.view('introScreen');
    restoring=false;scheduleSave();
  }
  return {boot,startWorld,move,interact,registry,diagnostics:()=>engine.scene.inspect(),get position(){return {...save.position};},flush:async()=>{clearTimeout(timer);await storage.settled();return persist();},dispose(){disposed=true;engine.destroy();clearTimeout(timer);document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);}};
}
