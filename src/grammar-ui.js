/* Grammar is prescribed as rules, never as stored Pashto example sentences. */
function createGrammar({ state, content, ui, storage, learning }) {
  function showGrammar() {
    const s = state.session,
      day = content.curriculum.days[s.loop - 1];
    ui.$("grammarPanel").classList.remove("hidden");
    ui.$("grammarStep").textContent =
      `DAY ${s.loop} · ${ui.characterName(content.teacherFor(s.loop, s.loc, s.mode).name)}`;
    ui.$("grammarTitle").textContent = day.topic;
    const missing = content.curriculum.days.filter(
      (d) =>
        d.day <= s.loop &&
        !state.progress.library.grammar["grammar-day-" + d.day],
    );
    ui.$("grammarExplanation").replaceChildren(
      ...missing.flatMap((d) => [
        ui.node("h4", d.topic),
        ...d.grammar.map((text) => ui.node("p", text)),
      ]),
    );
    if (!missing.length)
      ui.$("grammarExplanation").append(
        ...day.grammar.map((text) => ui.node("p", text)),
      );
    for (const d of s.loc === "school" && !s.schoolConceptPending ? missing : [])
      LibraryEngine.unlock(
        state.progress,
        d.day,
        "visible-prerequisite-workshop",
      );
    const teacher=content.teacherFor(s.loop,s.loc,s.mode).name,place=s.loc?ui.displayPlace(s.loc):"the Library";
    ui.$("guideMessage").textContent = s.schoolConceptPending?`${ui.characterName(teacher)}: First learn today’s sentence pattern, then acknowledge each word-form card.`:`${ui.characterName(teacher)}: Here at ${place}, we will practise ${day.topic} using the words you studied in this lesson.`;
    // The learner has studied this visit's words/forms before this rule is shown.
    if (s.loc === "school" && !s.schoolConceptPending) LibraryEngine.unlock(state.progress, s.loop, "grammar-workshop");
    ui.$("grammarNext").disabled = false;
    ui.$("grammarNext").textContent = "Build sentences from my studied forms →";
    if(s.loop===2&&s.loc==="school"&&!s.schoolConceptPending){
      const explanation=ui.$("grammarExplanation"),rules=ui.node('details');rules.append(ui.node('summary','Read the SOV rules'),...explanation.childNodes);explanation.replaceChildren(rules);
      ui.$("grammarNext").textContent="Continue to sentence practice →";
      const mounted=ui.sovDemo.mount(ui.$("grammarExplanation"),2,()=>{ui.$("grammarNext").disabled=false;},learning.lessonSentenceTargets(s));ui.$("grammarNext").disabled=mounted;}
    storage.save();
  }
  return { showGrammar };
}
