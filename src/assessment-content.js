/* Plan presentation quotas before choosing any linguistic content. */
function createAssessmentContent({ content, progression }) {
  function blueprint(day, typing = false, random = Math.random) {
    const count = progression.getChallengeSpec(day).questionCount;
    const build = Math.round(count / 3), type = typing ? Math.floor(count / 3) : 0;
    const counts = {select: count - build - type, build, type};
    const remaining = {...counts}, formats = [];
    // Reserve the curricular greeting's recognition slot, then mix the rest.
    formats.push("select");remaining.select--;
    while (formats.length < count) {
      let candidates = Object.keys(remaining).filter(k => remaining[k] > 0);
      const last = formats.at(-1);
      if (formats.at(-2) === last && candidates.some(k => k !== last)) candidates = candidates.filter(k => k !== last);
      const viable=candidates.filter(candidate=>{
        const after={...remaining,[candidate]:remaining[candidate]-1};
        const total=Object.values(after).reduce((a,b)=>a+b,0);
        const run=candidate===last?2:1;
        return Object.keys(after).every(k=>after[k]<=2*(total-after[k])+(k===candidate?2-run:2));
      });
      if(viable.length)candidates=viable;
      let draw=random()*candidates.reduce((n,k)=>n+remaining[k],0);
      const next=candidates.find(k=>(draw-=remaining[k])<0) || candidates.at(-1);
      formats.push(next);remaining[next]--;
    }
    // Construction consumes English → Pashto slots; balance the other formats globally.
    const reverse = new Set(QuestionEngine.shuffle(formats.map((f,i) => f !== "build" && i !== 0 ? i : -1).filter(i => i >= 0), random).slice(0, Math.ceil(count / 2) - build));
    return {count, counts, formats, directions: formats.map((f,i) => f === "build" || reverse.has(i) ? "en-ps" : "ps-en"),
      scenario: content.curriculum.days[day - 1].challenge};
  }
  return { blueprint };
}
