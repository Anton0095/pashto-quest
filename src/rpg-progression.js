/* Profile policy only. The educational progression service owns every award/result. */
function createRPGProgression({state,data,learning,progression}) {
  const allowed=learning.allowed;
  const configured=day=>Number.isInteger(day)&&day>=data.firstDay&&day<=data.lastDay&&!!data.days[String(day)];
  learning.allowed=day=>configured(day)&&allowed(day);
  const accessible=learning.placeAccessible;
  learning.placeAccessible=(day,place)=>configured(day)&&accessible(day,place);
  function clamp(day){
    if(configured(day)&&allowed(day))return day;
    return Object.keys(data.days).map(Number).filter(d=>configured(d)&&allowed(d)).sort((a,b)=>b-a)[0]||data.firstDay;
  }
  return {
    configured,clamp,
    current(){return state.day=clamp(state.day);},
    lessonAllowed(id){return id==='tutorial'||id==='review'||Object.entries(data.days).some(([day,chapter])=>configured(Number(day))&&learning.allowed(Number(day))&&chapter.lessons.includes(id));},
    complete(day){return configured(day)&&progression.passedChallenge(state.progress,day);},
    terminal(day){return !!data.days[String(day)]?.completion.terminal&&progression.passedChallenge(state.progress,day);},
  };
}
