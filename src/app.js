/* Browser composition and event wiring. The release builder embeds all modules and data. */
(() => {
  "use strict";
  const content = createContent(LIBRARY_DATA, NARRATIVE_DATA);
  const state = { progress: null, session: null, day: 1 };
  const progression = createProgression(content, LibraryEngine);
  const storage = createStorage({ state, content, progression });
  state.progress = storage.load();
  const ui = createUI({ state, content, progression });
  const saveWarning = document.createElement("aside");
  saveWarning.id = "saveWarning";
  saveWarning.className = "save-warning hidden";
  saveWarning.setAttribute("aria-label", "Progress saving warning");
  const saveMessage = document.createElement("p");
  saveMessage.setAttribute("role", "status");
  const retrySave = document.createElement("button");
  retrySave.id = "retrySave";
  retrySave.type = "button";
  retrySave.textContent = "Retry saving";
  retrySave.addEventListener("click", () => storage.save());
  const exportSave = document.createElement("button");
  exportSave.id = "exportSave";
  exportSave.type = "button";
  exportSave.textContent = "Export progress";
  exportSave.addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([storage.snapshot()], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pashto-quest-progress.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  saveWarning.append(saveMessage, retrySave, exportSave);
  document.querySelector(".app").prepend(saveWarning);
  storage.onPersistenceChange((message) => {
    saveMessage.textContent = message || "";
    saveWarning.classList.toggle("hidden", !message);
  });
  const audio = createAudio({
    wordById: content.wordById,
    onSpeak: (id) => learning.surface(id, "audio"),
    BUNDLED_AUDIO_IDS,
    $: ui.$,
    document,
    window,
    Audio,
  });
  const learning = createLearning({ state, content, progression });
  const questions = createQuestions({ state, content, progression, storage });
  const narrative = createNarrative({ state, content, ui, audio, storage, questions });
  const tutorial = createTutorial({ state, content, learning, ui, storage, questions });
  const grammar = createGrammar({
    state,
    content,
    ui,
    storage,
  });
  const lessons = createLessons({
    state,
    content,
    progression,
    learning,
    questions,
    ui,
    audio,
    storage,
    narrative,
    tutorial,
    grammar,
    onWorld: () => world.startWorld(),
    onLessonStart: () => challenge.showChallengeScene(0),
  });
  const challenge = createChallengeUI({
    state,
    content,
    progression,
    learning,
    questions,
    ui,
    audio,
    storage,
  });
  const world = createWorld({
    state,
    content,
    progression,
    learning,
    ui,
    audio,
    storage,
    narrative,
    onLesson: (id) => lessons.begin(id),
    onChallenge: (day) => challenge.startChallenge(day),
    onLibrary: () => library.openLibrary(),
    onResume: () => challenge.resumeChallenge(),
  });
  const library = createLibraryUI({
    state,
    content,
    ui,
    audio,
    storage,
    narrative,
    learning,
    questions,
  });
  function nextQuestion() {
    if (!state.session || ui.$("quizNext").disabled) return;
    if (state.session.mode === "challenge") {
      state.session.index++;
      if (state.session.index < state.session.questions.length)
        challenge.showChallengeQuestion();
      else challenge.finishChallenge();
    } else if (state.session.queue.length) lessons.showQuestion();
    else lessons.finish();
  }
  ui.$("teachSpeak").addEventListener("click", () => {
    if (state.session)
      audio.speak(lessons.studyList()[state.session.cardIndex]);
  });
  ui.$("quizSpeak").addEventListener("click", () => {
    if (state.session?.mode === "challenge") {
      const q = state.session.questions[state.session.index];
      if (q) audio.speak(q.audioId || q.id);
    } else if (state.session?.activeItem)
      audio.speak(state.session.activeItem.id);
  });
  ui.$("startTutorial").addEventListener("click", () =>
    lessons.begin("tutorial"),
  );
  ui.$("replayGuide").addEventListener("click", () =>
    lessons.begin("tutorial"),
  );
  ui.$("teachNext").addEventListener("click", lessons.afterStudy);
  ui.$("grammarNext").addEventListener("click", lessons.afterGrammar);
  ui.$("quizNext").addEventListener("click", nextQuestion);
  ui.$("navWorld").addEventListener("click", world.startWorld);
  ui.$("resultWorld").addEventListener("click", world.startWorld);
  ui.$("resultReplay").addEventListener("click", () => {
    if (state.session) {
      if (state.session.mode === "challenge")
        challenge.startChallenge(state.session.loop);
      else lessons.begin(state.session.id);
    }
  });
  ui.$("reviewBtn").addEventListener("click", () => lessons.begin("review"));
  ui.$("startChallenge").addEventListener("click", () =>
    challenge.startChallenge(state.day),
  );
  ui.$("skipDayBtn").addEventListener("click", () =>
    challenge.startChallenge(state.day),
  );
  ui.$("undoTile").addEventListener("click", () =>
    state.session?.mode === "challenge"
      ? challenge.undoTile()
      : lessons.undoTile(),
  );
  ui.$("clearTiles").addEventListener("click", () =>
    state.session?.mode === "challenge"
      ? challenge.clearTiles()
      : lessons.clearTiles(),
  );
  ui.$("checkBuild").addEventListener("click", () =>
    state.session?.mode === "challenge"
      ? challenge.checkBuild()
      : lessons.checkBuild(),
  );
  for (const b of document.querySelectorAll(".map-point:not(.library)"))
    b.addEventListener("click", () =>
      world.navigatePlace(state.day, b.dataset.place),
    );
  ui.$("resetProgress").addEventListener("click", () => {
    audio.stopAudio();
    if (
      confirm("Reset all XP, unlocked locations and spaced-repetition history?")
    ) {
      state.progress = progression.fresh();
      state.session = null;
      state.day = 1;
      storage.save();
      library.prepareOnboarding();
      ui.hud();
      ui.view("introScreen");
    }
  });
  if (state.progress.tutorialDone)
    state.day =
      content.curriculum.days.filter((d) => learning.allowed(d.day)).at(-1)
        ?.day || 1;
  library.libraryInit();
  // @TEST_HOOK
  ui.$("lessonScreen").insertBefore(ui.$("addressTarget"), ui.$("teachPanel"));
  storage.save();
  ui.hud();
  // Restore the visible assessment first. Rendering an immediately hidden day
  // opening here would incorrectly acquire a greeting the player never saw.
  if (!state.progress.activeChallenge || !challenge.resumeChallenge()) {
    if (state.progress.tutorialDone) world.startWorld();
    else ui.view("introScreen");
  }
  if (storage.problem) {
    const dialog = document.createElement("dialog");
    dialog.id = "saveCompatibility";
    dialog.setAttribute("aria-label", "Incompatible saved progress");
    const message = document.createElement("p");
    message.textContent = storage.problem;
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "primary";
    reset.textContent = "Reset incompatible save and start";
    reset.addEventListener("click", () => {
      storage.resetProblem();
      state.progress = progression.fresh();
      storage.save();
      location.reload();
    });
    dialog.addEventListener("cancel", (e) => e.preventDefault());
    dialog.append(message, reset);
    document.body.append(dialog);
    dialog.showModal();
  }
})();
