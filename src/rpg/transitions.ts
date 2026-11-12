export type TransitionKind='sleep'|'dream-enter'|'dream-exit';

/** One cancellable UI veil. Chapter commits and dream isolation stay in their owners. */
export function createRPGTransitions(doc:Document=document) {
  let current:AbortController|undefined;
  const animations=new Set<Animation>();
  const cancel=()=>{current?.abort();for(const a of animations)a.cancel();animations.clear();};
  async function play(kind:TransitionKind,label:string,swap:()=>boolean|Promise<boolean>):Promise<boolean> {
    if(current)return false;
    const controller=new AbortController();current=controller;
    const reduced=doc.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches??false;
    const veil=doc.createElement('dialog');veil.id=kind==='sleep'?'sleepTransition':'dreamTransition';veil.className='rpg-transition';veil.dataset.kind=kind;veil.dataset.reducedMotion=String(reduced);veil.setAttribute('aria-label',kind==='sleep'?'Sleeping':'Dream transition');
    const sky=doc.createElement('div');sky.className='rpg-transition-sky';sky.style.opacity='0';
    const moon=doc.createElement('i');moon.className='rpg-transition-moon';sky.append(moon);
    for(let i=0;i<12;i++){const star=doc.createElement('i');star.className='rpg-transition-star';star.style.left=(9+i*29%83)+'%';star.style.top=(12+i*17%67)+'%';star.style.setProperty('--drift',(i%2?-1:1)*14+'px');sky.append(star);}
    for(let i=0;i<3;i++){const cloud=doc.createElement('i');cloud.className='rpg-transition-cloud';cloud.style.left=(12+i*29)+'%';cloud.style.top=(25+i*18)+'%';sky.append(cloud);}
    const caption=doc.createElement('h2');caption.className='rpg-transition-caption';caption.textContent=label;caption.setAttribute('role','status');caption.setAttribute('aria-live','polite');sky.append(caption);veil.append(sky);
    veil.addEventListener('cancel',e=>e.preventDefault());
    const animate=async(frames:Keyframe[],duration:number)=>{
      if(controller.signal.aborted)return;
      if(reduced){sky.style.opacity=String(frames[frames.length-1]?.opacity??1);return;}
      const animation=sky.animate(frames,{duration,fill:'forwards',easing:'ease-in-out'});animations.add(animation);
      try{await animation.finished;}catch{/* Cancellation leaves gameplay to its durable owner. */}
      if(!controller.signal.aborted)sky.style.opacity=String(frames[frames.length-1]?.opacity??1);
      animations.delete(animation);animation.cancel();
    };
    const abort=()=>{for(const a of animations)a.cancel();veil.remove();};
    controller.signal.addEventListener('abort',abort,{once:true});
    try {
      doc.body.append(veil);veil.showModal();veil.dataset.phase='darkening';
      if(!reduced)for(const star of sky.querySelectorAll<HTMLElement>(kind==='sleep'?'.rpg-transition-star':'.rpg-transition-star,.rpg-transition-cloud')){
        const motion=star.animate([{transform:'translate(0,0)'},{transform:kind==='sleep'?'translate(0,-3px)':'translate(var(--drift, 18px),-12px)'}],{duration:kind==='sleep'?1100:1600,iterations:Infinity,direction:'alternate',easing:'ease-in-out'});animations.add(motion);
      }
      await animate([{opacity:0},{opacity:1}],kind==='sleep'?320:240);
      if(controller.signal.aborted)return false;
      veil.dataset.phase='night';
      if(!await swap())return false;
      if(controller.signal.aborted)return false;
      // A selector opened at the midpoint is also a top-layer dialog. Keep the
      // transition above it until its reveal finishes.
      veil.close();veil.showModal();
      await animate([{opacity:1},{opacity:1}],kind==='sleep'?360:180);
      if(controller.signal.aborted)return false;
      veil.dataset.phase='revealing';
      await animate([{opacity:1},{opacity:0}],kind==='dream-exit'?220:340);
      return !controller.signal.aborted;
    } finally {
      controller.signal.removeEventListener('abort',abort);
      for(const a of animations)a.cancel();animations.clear();veil.remove();
      if(current===controller)current=undefined;
    }
  }
  return {play,cancel,get active(){return !!current;},dispose:cancel};
}
