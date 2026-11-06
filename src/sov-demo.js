/* Guided, unscored use of the shared construction UI and licensed compiler pool. */
function createSOVDemo({content,learning,ui}) {
  function mount(root,day,onComplete=()=>{},targets=[]) {
    const card=learning.availableSentences(day).find(c=>c.generated.frameId==='sov'&&(!targets.length||Object.values(c.generated.slots).some(r=>targets.includes(r.lemmaId)))&&c.generated.subjects.some(s=>s.person===3&&s.number==='singular'));
    const box=ui.node('section',undefined,'sov-demo');root.append(box);
    box.append(ui.node('p','Subject → Object → Verb. Arrange the Pashto tiles. Guided practice: no score or rewards.','tiny'));
    if(!card){box.append(ui.node('p','Study a compatible subject, object and transitive verb to try the guided example.'));return false;}
    content.registerGenerated(card);box.dataset.exampleId=card.id;
    const exercise=ui.node('div');box.append(exercise);
    ui.construction.mount(exercise,card,{id:card.id,kind:'construct',direction:'en-ps',tileVariant:'exact'},{retry:true,onAnswer(correct){
      if(!correct)return;
      box.dataset.complete='true';const roles=ui.node('div',undefined,'sov-roles');roles.dir='rtl';
      for(const [slot,label]of [['subject','Subject'],['noun','Object'],['verb','Verb']]){
        const ref=card.generated.slots[slot],entry=content.libraryEntries[ref.lemmaId],form=entry.forms.find(f=>f.formId===ref.formId);
        const part=ui.node('span',undefined,'sov-part');part.dataset.role=slot;const ps=ui.node('bdi',form.pashto);ps.lang='ps';ps.dir='rtl';const caption=ui.node('small',label);caption.dir='ltr';part.append(ps,caption);roles.append(part);
      }
      box.append(roles);onComplete();
    }});
    return true;
  }
  return {mount};
}
