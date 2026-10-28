/* Grammar is prescribed as rules, never as stored Pashto example sentences. */
function createGrammar({ state, content, ui, storage }) {
  function showGrammar() {
    const s = state.session,
      day = content.curriculum.days[s.loop - 1];
    ui.$("grammarPanel").classList.remove("hidden");
    ui.$("grammarStep").textContent =
      `DAY ${s.loop} · ${content.teacherFor(s.loop, s.loc, s.mode).name}`;
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
    for (const d of missing)
      LibraryEngine.unlock(
        state.progress,
        d.day,
        "visible-prerequisite-workshop",
      );
    ui.$("guideMessage").textContent = day.intro;
    // The learner has studied this visit's words/forms before this rule is shown.
    LibraryEngine.unlock(state.progress, s.loop, "grammar-workshop");
    ui.$("grammarNext").disabled = false;
    ui.$("grammarNext").textContent = "Build sentences from my studied forms →";
    storage.save();
  }
  return { showGrammar };
}
