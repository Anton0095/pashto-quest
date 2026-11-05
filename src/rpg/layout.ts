/** DOM placement only: learning, dialogue and world state retain their owners. */
export function createRPGLayout(root:HTMLElement,heading:HTMLElement,viewport:HTMLElement,exploration:HTMLElement,progress:HTMLElement,tools:HTMLElement,onResize:()=>void) {
  const world=document.createElement('section');world.className='rpg-world-pane';world.setAttribute('aria-label','Game world');
  const side=document.createElement('section');side.className='rpg-sidebar';side.setAttribute('aria-label','Player interface');
  const persistent=document.createElement('div');persistent.className='rpg-persistent';
  const context=document.createElement('div');context.className='rpg-context';context.id='rpgContext';
  const moved:{marker:Comment;element:HTMLElement}[]=[];
  const place=(element:HTMLElement,parent:HTMLElement)=>{const marker=document.createComment('RPG layout placement');element.before(marker);moved.push({marker,element});parent.append(element);};
  world.append(viewport);persistent.append(heading,progress);context.append(exploration);side.append(persistent,context);root.append(world,side);
  for(const id of ['lessonScreen','resultScreen'])place(document.getElementById(id)!,context);
  place(document.getElementById('navWorld')!,tools);
  const details=document.querySelector<HTMLElement>('#lessonScreen .question-context')!;
  for(const element of document.querySelectorAll<HTMLElement>('#lessonScreen > #participants,#lessonScreen > .speaker-note,#lessonScreen > #audioStatus,#lessonScreen > p'))place(element,details);
  function resize(){
    const box=context.getBoundingClientRect(),style=document.documentElement.style;
    style.setProperty('--rpg-context-top',box.top+'px');style.setProperty('--rpg-context-left',box.left+'px');
    style.setProperty('--rpg-context-width',box.width+'px');style.setProperty('--rpg-context-height',box.height+'px');
    onResize();
  }
  const observer=new ResizeObserver(resize);observer.observe(context);observer.observe(viewport);
  return {resize,dispose(){observer.disconnect();for(const {marker,element} of moved)marker.replaceWith(element);}};
}
