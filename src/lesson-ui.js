/* One teaching path: phrases/words/forms -> grammar -> compiled sentences -> recall. */
function createLessons({
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
  onWorld,
  onLessonStart,
}) {
  function begin(id) {
    audio.stopAudio();
    onLessonStart();
    let mode = "standard",
      loc = null,
      loop = 0,
      pool = [];
    if (id === "tutorial") {
      mode = "tutorial";
      loc = "library";
      pool = [...content.tutorialIds];
    } else if (id === "review") {
      if (!state.progress.tutorialDone) return;
      mode = "review";
      pool = learning.duePool().map((w) => w.id);
      if (!pool.length) {
        onWorld();
        return;
      }
    } else {
      loop = Number(id.split("-")[0]);
      loc = id.split("-")[1];
      if (
        !learning.allowed(loop) ||
        !content.courses[id] ||
        !learning.placeAccessible(loop, loc)
      )
        return;
      pool = learning.libraryLessonPool(loop, loc);
    }
    const phrases =
      mode === "standard"
        ? pool.filter((x) => content.wordById[x].type === "greeting")
        : [];
    const lexical = pool.filter(
      (x) => !phrases.includes(x) && content.wordById[x].type !== "sentence",
    );
    const reviewSentences =
      mode === "review"
        ? pool.filter((x) => content.wordById[x].type === "sentence")
        : [];
    state.session = {
      id,
      mode,
      loc,
      loop,
      attemptId: ++state.progress.library.attemptSequence,
      required: [...pool],
      studyWords: mode === "tutorial" ? [] : lexical,
      greetingCards: phrases,
      studySentences: reviewSentences,
      phase:
        mode === "tutorial"
          ? "tutorial"
          : phrases.length
            ? "greeting"
            : "lexical",
      cardIndex: 0,
      queue: pool.map((id) => ({
        id,
        retries: 0,
        kind: content.wordById[id].type === "sentence" ? "construct" : "word",
      })),
      answered: 0,
      firstAsked: new Set(),
      firstCorrect: 0,
      passed: new Set(),
      earned: 0,
      tutorialResponses: 0,
      profileGender: state.progress.playerProfile?.gender || "unspecified",
      profileName: state.progress.playerProfile?.name || "",
      initialLevel: progression.characterStatus(state.progress).level,
      built: [],
      locked: false,
    };
    ui.$("lessonScreen").dataset.week = loop >= 8 ? "2" : "1";
    ui.$("lessonScreen").dataset.day = String(loop);
    ui.$("lessonEyebrow").textContent =
      mode === "tutorial"
        ? "LIBRARY ONBOARDING"
        : mode === "review"
          ? "SPACED REVISION"
          : `DAY ${loop} · WORDS AND GRAMMAR`;
    ui.$("lessonName").textContent =
      mode === "tutorial"
        ? "Muhammad Jan · Library welcome"
        : mode === "review"
          ? "Memory Trail"
          : ui.displayPlace(loop, loc);
    ui.$("lessonDescription").textContent =
      mode === "tutorial"
        ? "Two conventional greetings and two English profile settings"
        : mode === "review"
          ? "Previously studied material due for recall"
          : content.curriculum.days[loop - 1].topic;
    ui.$("lessonIcon").textContent = content.zones[loc]?.icon || "📚";
    ui.setSpeaker(loop, loc, mode);
    ui.$("guideMessage").textContent =
      mode === "standard"
        ? content.villagePeople[loc].welcome
        : "Study, then practise. First answers are recorded.";
    narrative.renderLessonExpression(loop, loc, mode);
    ui.hud();
    ui.view("lessonScreen");
    storage.save();
    renderPhase();
  }
  function renderPhase() {
    if (!state.session) return;
    audio.stopAudio();
    queueMicrotask(ui.readableQuizSurfaces);
    for (const id of ["teachPanel", "sovPanel", "quizPanel"])
      ui.$(id).classList.add("hidden");
    if (state.session.mode === "tutorial") {
      tutorial.renderTutorialStep();
      return;
    }
    ui.$("tutorialInteraction").classList.add("hidden");
    if (state.session.phase === "grammar") grammar.showGrammar();
    else if (["greeting", "lexical", "sentence"].includes(state.session.phase))
      teachCard();
    else showQuestion();
  }
  function studyList() {
    const s = state.session;
    return s?.mode === "tutorial"
      ? content.tutorialIds
      : s.phase === "greeting"
        ? s.greetingCards
        : s.phase === "sentence"
          ? s.studySentences
          : s.studyWords;
  }
  function advancePhase() {
    const s = state.session;
    s.cardIndex = 0;
    if (s.phase === "greeting") s.phase = "lexical";
    else if (s.phase === "lexical")
      s.phase =
        s.mode === "standard"
          ? "grammar"
          : s.studySentences.length
            ? "sentence"
            : "quiz";
    else s.phase = "quiz";
    renderPhase();
  }
  function teachCard() {
    const s = state.session,
      id = studyList()[s.cardIndex];
    if (!id) {
      advancePhase();
      return;
    }
    const w = learning.surface(id, "study");
    learning.libraryExpose(id, s.mode === "review" ? "review" : "lesson");
    storage.save();
    ui.$("teachPanel").classList.remove("hidden");
    ui.$("lessonStages").classList.remove("hidden");
    ui.$("teachCount").textContent =
      `${s.phase === "sentence" ? "BUILDING SENTENCES" : s.phase === "greeting" ? "FIXED EXPRESSIONS" : "WORDS AND FORMS"} · CARD ${s.cardIndex + 1}/${studyList().length}`;
    ui.$("teachType").textContent =
      w.type === "sentence" ? "Generated sentence" : w.type;
    ui.$("teachPashto").textContent = w.ps;
    ui.$("teachRoman").textContent = w.roman;
    ui.$("teachEnglish").textContent = w.en;
    ui.$("teachNote").textContent = w.note;
    ui.$("dialectVariant").classList.add("hidden");
    ui.$("guideMessage").textContent = w.generated
      ? "Use the words and forms you studied to build this meaning. This example is composed from your unlocked grammar."
      : w.type === "greeting"
        ? "Learn this conventional expression as a complete phrase."
        : "Study this word or individual form. It will remain available in later constructions.";
    ui.$("addressTarget").textContent =
      `${content.teacherFor(s.loop, s.loc, s.mode).name} → Player`;
    ui.$("addressTarget").classList.remove("hidden");
    ui.$("teachNext").disabled = false;
    ui.$("teachNext").textContent =
      s.cardIndex + 1 < studyList().length
        ? "Next study card →"
        : s.phase === "lexical"
          ? "Learn the grammar →"
          : s.phase === "sentence"
            ? "Practise constructing →"
            : "Continue →";
    [...ui.$("lessonStages").children].forEach((x, i) =>
      x.classList.toggle("active", i === (s.phase === "sentence" ? 1 : 0)),
    );
  }
  function afterStudy() {
    audio.stopAudio();
    const s = state.session;
    if (!s) return;
    if (s.mode === "tutorial") {
      if (ui.$("teachNext").disabled) return;
      s.cardIndex++;
      if (s.cardIndex < content.tutorialCards.length)
        tutorial.renderTutorialStep();
      else finish();
      return;
    }
    if (!["greeting", "lexical", "sentence"].includes(s.phase)) return;
    if (++s.cardIndex < studyList().length) teachCard();
    else advancePhase();
  }
  function afterGrammar() {
    const s = state.session;
    if (!s || s.phase !== "grammar" || ui.$("sovNext").disabled) return;
    state.progress.personIntros[s.loop] = true;
    state.progress.sovSeen ||= s.loop > 1;
    learning.prepareSentences(s);
    s.phase = "sentence";
    s.cardIndex = 0;
    storage.save();
    renderPhase();
    if (s.generationDeficit?.missing) {
      ui.$("guideMessage").textContent +=
        ` Sentence supply: ${s.generationDeficit.available}/${s.generationDeficit.requested}. ${s.generationDeficit.reason}`;
    }
  }
  function renderBuild() {
    const s = state.session,
      w = content.wordById[s.activeItem.id],
      tiles = QuestionEngine.buildTiles(w, { kind: "construct" }, s.loop);
    ui.$("builtSentence").replaceChildren();
    ui.$("wordTiles").replaceChildren();
    for (const i of s.built) {
      const b = ui.button(tiles[i].word, () => {});
      b.disabled = true;
      ui.$("builtSentence").append(b);
    }
    for (const index of s.tileOrder) {
      const tile = tiles[index];
      const b = ui.button(tile.word, () => {
        if (s.locked) return;
        s.built.push(tile.index);
        renderBuild();
      });
      b.lang = "ps";
      b.dir = "rtl";
      b.disabled = s.locked || s.built.includes(tile.index);
      ui.$("wordTiles").append(b);
    }
    ui.$("checkBuild").disabled = s.locked || s.built.length !== tiles.length;
    ui.$("undoTile").disabled = s.locked || !s.built.length;
    ui.$("clearTiles").disabled = s.locked || !s.built.length;
  }
  function showQuestion() {
    const s = state.session;
    if (!s) return;
    if (!s.queue.length) {
      finish();
      return;
    }
    audio.stopAudio();
    ui.$("teachPanel").classList.add("hidden");
    ui.$("sovPanel").classList.add("hidden");
    ui.$("quizPanel").classList.remove("hidden");
    s.activeItem = s.queue[0];
    s.locked = false;
    s.built = [];
    const size = QuestionEngine.buildTiles(
      content.wordById[s.activeItem.id],
      { kind: "construct" },
      s.loop,
    ).length;
    s.tileOrder = QuestionEngine.shuffle(
      Array.from({ length: size }, (_, i) => i),
      QuestionEngine.randomFor(
        state.progress.library.seed + s.attemptId + s.answered,
      ),
    );
    if (size > 1 && s.tileOrder.every((n, i) => n === i))
      [s.tileOrder[0], s.tileOrder[1]] = [s.tileOrder[1], s.tileOrder[0]];
    const w = learning.surface(s.activeItem.id, "lesson-practice"),
      build = s.activeItem.kind === "construct";
    ui.$("quizCounter").textContent =
      `QUESTION ${s.answered + 1} · ${s.queue.length} REMAINING`;
    ui.$("quizType").textContent = build
      ? "BUILD A SENTENCE"
      : "WORD / FORM RECALL";
    ui.$("quizPashto").textContent = build ? w.en : w.ps;
    ui.$("quizPashto").dir = build ? "ltr" : "rtl";
    ui.$("quizPashto").lang = build ? "en" : "ps";
    ui.$("quizPashto").classList.toggle("english-question", build);
    ui.$("quizRoman").textContent = build
      ? "Use the studied Pashto forms"
      : w.roman;
    ui.$("quizPrompt").textContent = build
      ? "Construct this meaning in Pashto."
      : "Choose the meaning of this word, form or fixed phrase.";
    ui.$("quizPanel").querySelector(".quizword h3").textContent = build
      ? "Put the studied Pashto forms in order"
      : "Choose the correct meaning";
    ui.$("quizSpeak").classList.toggle("hidden", build);
    ui.$("choices").replaceChildren();
    ui.$("constructionPanel").classList.toggle("hidden", !build);
    if (build) renderBuild();
    else
      for (const choice of questions.distractors(w)) {
        const b = ui.button(choice, () => answer(choice));
        b.className = "choice";
        ui.$("choices").append(b);
      }
    ui.$("quizFeedback").textContent = "Submit your answer to continue.";
    ui.$("quizNext").disabled = true;
    storage.save();
  }
  function answer(value) {
    const result = learning.submitLesson(value);
    if (!result) return;
    const { w, correct, gain } = result;
    learning.surface(w.id, "lesson-feedback");
    storage.save();
    ui.hud();
    for (const b of ui.$("choices").children) b.disabled = true;
    for (const b of ui.$("wordTiles").children) b.disabled = true;
    ui.$("checkBuild").disabled = true;
    ui.$("undoTile").disabled = true;
    ui.$("clearTiles").disabled = true;
    ui.$("quizFeedback").textContent =
      `${correct ? "✓ Correct" : "Not yet — try again shortly"} · +${gain} XP · ${w.ps} (${w.roman}) — ${w.en}`;
    ui.$("quizNext").disabled = false;
    ui.$("quizNext").textContent = state.session.queue.length
      ? "Next →"
      : "Finish lesson →";
  }
  function checkBuild() {
    const s = state.session;
    if (
      !s ||
      s.mode === "challenge" ||
      s.locked ||
      s.activeItem?.kind !== "construct"
    )
      return;
    const w = content.wordById[s.activeItem.id],
      tiles = QuestionEngine.buildTiles(w, { kind: "construct" }, s.loop);
    if (s.built.length === tiles.length)
      answer(s.built.map((i) => tiles[i].word).join(" "));
  }
  function undoTile() {
    if (state.session?.locked) return;
    state.session.built.pop();
    renderBuild();
  }
  function clearTiles() {
    if (state.session?.locked) return;
    state.session.built = [];
    renderBuild();
  }
  function finish() {
    if (!state.session) return;
    const s = state.session;
    const passedRequired = s.required.every((id) => s.passed.has(id));
    if (s.mode === "tutorial") {
      if (
        !passedRequired ||
        !s.profileName.trim() ||
        !["male", "female", "unspecified"].includes(s.profileGender)
      )
        return;
      state.progress.playerProfile = {
        name: s.profileName.trim(),
        gender: s.profileGender,
      };
    }
    const bonus = progression.completeLessonOnce(
      state.progress,
      s.id,
      s.mode,
      passedRequired,
    );
    s.earned += bonus;
    storage.save();
    ui.hud();
    let title, desc, follow;
    if (s.mode === "tutorial") {
      title = `Muhammad Jan welcomes ${state.progress.playerProfile.name}!`;
      desc = `Welcome, ${state.progress.playerProfile.name}! You practised choosing a meaning, arranging words, selecting an answer, and typing your name. Day 1 is now open.`;
      follow =
        "Explore home, market, lake and school in any order, or use “Skip to Muhammad Jan’s check-in” on the town screen. His 15-question Library home-award challenge is available now.";
    } else if (s.mode === "review") {
      title = "Your memory is getting stronger!";
      desc =
        "These words will come back at longer intervals if you recall them successfully.";
      follow = "Return to the world map and continue learning.";
    } else {
      title = `${ui.displayPlace(s.loop, s.loc)} — Day ${s.loop} visit complete!`;
      desc = `You practised ${s.required.length} lesson items.${bonus ? " First-time bonus: +25 XP!" : ""}`;
      follow =
        s.loop === 1
          ? learning.completeRound(1)
            ? "Your four visits are complete. Muhammad Jan is ready for your 15-question check-in."
            : "Explore the remaining locations, or try Muhammad Jan’s check-in now."
          : s.loop === 2
            ? learning.completeRound(2)
              ? "Your village visits are complete. Muhammad Jan is ready for your check-in."
              : "In the regular story path, visit the market and lake after school, then go home. You can also try Muhammad Jan’s challenge now."
            : s.loop === 3
              ? learning.completeRound(3)
                ? "Your Day 3 visits are complete. Speak with Edris about dinner in your final challenge."
                : "Keep practising “I” sentences, or skip straight to Edris’s dinner-shopping conversation."
              : learning.completeRound(s.loop)
                ? `All four Day ${s.loop} visits completed! The 15-question Town Challenge is ready. Pass with 12/15 to unlock the next day.`
                : "Visit the other locations to practise, or take the 15-question Town Challenge now.";
    }
    if (s.loop >= 6)
      follow =
        s.loop === 6
          ? "Practise the other town locations, or join Saleha and Mina in the Hills: 15 turns, 12 correct to pass."
          : "Practise the other locations, or take Ms Hameed’s separate School examination: 25 turns, 20 correct to pass.";
    if (s.loop >= 8)
      follow = `Practise the other locations, or take the ${progression.getChallengeSpec(s.loop).questionCount}-question final challenge. Week 2 remains draft content for native review.`;
    if (progression.characterStatus(state.progress).level > s.initialLevel)
      desc += ` ✨ Level ${progression.characterStatus(state.progress).level} reached!`;
    ui.$("resultHeading").textContent = title;
    ui.$("resultDescription").textContent = desc;
    ui.$("resultAccuracy").textContent =
      `${s.firstCorrect}/${s.firstAsked.size}`;
    ui.$("resultXP").textContent = `+${s.earned}`;
    ui.$("resultKnowledge").textContent =
      `${s.passed.size}/${new Set(s.required).size}`;
    ui.$("resultNext").textContent = follow;
    ui.$("resultReplay").textContent =
      s.mode === "tutorial"
        ? "Replay introduction tutorial"
        : s.mode === "review"
          ? "Review again"
          : "Practise this location again";
    ui.$("resultWorld").textContent = "Return to town →";
    ui.view("resultScreen");
  }
  return {
    begin,
    renderPhase,
    studyList,
    teachCard,
    afterStudy,
    afterGrammar,
    showQuestion,
    answer,
    finish,
    checkBuild,
    undoTile,
    clearTiles,
  };
}
