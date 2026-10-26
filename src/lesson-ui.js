/* Lesson lifecycle: study cards, grammar handoff, recall, feedback and completion. */
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
    ui.$("lessonScreen").dataset.week =
      Number(id.split("-")[0]) >= 8 ? "2" : "1";
    audio.stopAudio();
    onLessonStart();
    ui.$("addressTarget").classList.add("hidden");
    let pool,
      loc = null,
      loop = 0,
      mode = "standard";
    if (id === "tutorial") {
      pool = [...content.tutorialIds];
      mode = "tutorial";
      loc = "library";
    } else if (id === "review") {
      if (!state.progress.tutorialDone) return;
      pool = learning.duePool().map((w) => w.id);
      mode = "review";
    } else {
      loc = id.split("-")[1];
      loop = Number(id.split("-")[0]);
      if (
        !learning.allowed(loop) ||
        !content.courses[id] ||
        !learning.placeAccessible(loop, loc)
      )
        return;
      pool = learning.libraryLessonPool(loop, loc);
      storage.save();
    }
    if (!pool.length) {
      onWorld();
      return;
    }
    const lexical = pool.filter((x) => content.wordById[x].type !== "sentence"),
      sentences = pool.filter((x) => content.wordById[x].type === "sentence");
    const greetingId =
      mode === "standard" &&
      lexical.length &&
      content.LIBRARY_DATA.phrases.some((p) => p.id === lexical[0])
        ? lexical[0]
        : null;
    const newWords = greetingId
      ? lexical.filter((id) => id !== greetingId)
      : lexical;
    const ordered = mode === "standard" ? [...lexical, ...sentences] : pool;
    state.session = {
      id,
      mode,
      loc,
      loop,
      required: pool,
      studyWords: mode === "tutorial" ? [] : newWords,
      greetingCards: greetingId ? [greetingId] : [],
      studySentences: sentences,
      phase:
        mode === "tutorial"
          ? "tutorial"
          : greetingId
            ? "greeting"
            : mode === "review"
              ? lexical.length
                ? "lexical"
                : "sentence"
              : learning.preLessonGrammar(loop, loc)
                ? "grammar"
                : "lexical",
      preLessonGrammar: learning.preLessonGrammar(loop, loc),
      cardIndex: 0,
      queue: ordered.map((x) => ({ id: x, retries: 0 })),
      answered: 0,
      firstAsked: new Set(),
      firstCorrect: 0,
      passed: new Set(),
      earned: 0,
      tutorialResponses: 0,
      profileGender: state.progress.playerProfile?.gender || "unspecified",
      profileName: state.progress.playerProfile?.name || "",
      initialLevel: progression.characterStatus(state.progress).level,
    };
    state.session.attemptId = ++state.progress.library.attemptSequence;
    let title, desc, emoji, guide;
    if (mode === "tutorial") {
      title = "Muhammad Jan · Library welcome";
      desc = "Library · Four interactive study cards";
      emoji = "👴";
      guide =
        "Salaam! Learn how to answer the game’s questions, and tell me your name and preferred gender option.";
    } else if (mode === "review") {
      title = "Memory Trail";
      desc = `${pool.length} spaced-repetition review items`;
      emoji = "🧠";
      guide =
        "These words are due for recall. Successful reviews push the next test farther into the future.";
    } else {
      const z = content.zones[loc],
        l = content.loops.find((x) => x.id === loop);
      title = ui.displayPlace(loop, loc);
      desc = `Day ${loop}: ${l.label} · ${greetingId ? "1 greeting · " : ""}${newWords.length} vocabulary cards · ${sentences.length} sentences · due review`;
      emoji = z.icon;
      guide = content.advancedScenes[loop]
        ? content.advancedScenes[loop][loc]
        : loop === 2
          ? content.dayTwoScenes[loc]
          : loop <= 3
            ? `${content.villagePeople[loc].welcome} ${loop === 1 ? "Today we describe things with “is”." : loc === "nature" ? "Today I will show you how to say what YOU do. Listen for the endings of the verbs." : "Let us practise saying what you do using “I” sentences."}`
            : `First meet ${lexical.length} new words. Then practise ${sentences.length} present-tense sentences with ${l.person}. Finally, answer the lesson quiz.`;
    }

    ui.$("lessonEyebrow").textContent =
      mode === "tutorial"
        ? "FORCED FIRST LEVEL"
        : mode === "review"
          ? "SPACED REPETITION"
          : `DAY ${loop} · PRESENT TENSE`;
    ui.$("lessonName").textContent = title;
    ui.$("lessonDescription").textContent = desc;
    ui.$("lessonIcon").textContent = emoji;
    ui.setSpeaker(loop, loc, mode);
    ui.$("guideMessage").textContent = guide;
    narrative.renderLessonExpression(loop, loc, mode);
    ui.hud();
    ui.view("lessonScreen");
    renderPhase();
  }
  function renderPhase() {
    if (!state.session) return;
    queueMicrotask(ui.readableQuizSurfaces);
    audio.stopAudio();
    for (const id of ["teachPanel", "sovPanel", "quizPanel"])
      ui.$(id).classList.add("hidden");
    if (state.session.mode === "tutorial") {
      tutorial.renderTutorialStep();
    } else if (
      ["greeting", "lexical", "sentence"].includes(state.session.phase)
    ) {
      ui.$("tutorialInteraction").classList.add("hidden");
      teachCard();
    } else if (state.session.phase === "grammar") {
      grammar.showGrammar();
    } else showQuestion();
  }
  function studyList() {
    if (state.session?.mode === "tutorial") return content.tutorialIds;
    return state.session.phase === "greeting"
      ? state.session.greetingCards
      : state.session.phase === "sentence"
        ? state.session.studySentences
        : state.session.studyWords;
  }
  function teachCard() {
    if (state.session.phase === "sentence")
      learning.prepareSentences(state.session);
    const items = studyList(),
      w = content.wordById[items[state.session.cardIndex]];
    if (!w) {
      state.session.phase =
        state.session.phase === "lexical" &&
        (state.session.studySentences.length ||
          (state.session.loop === 1 && !state.progress.personIntros[1]))
          ? state.session.preLessonGrammar || state.session.mode === "review"
            ? "sentence"
            : "grammar"
          : "quiz";
      renderPhase();
      return;
    }
    learning.libraryExpose(
      w.id,
      state.session.mode === "tutorial"
        ? "tutorial"
        : state.session.mode === "review"
          ? "review"
          : "lesson",
    );
    if (w.type === "sentence")
      LibraryEngine.unlock(state.progress, state.session.loop, "lesson");
    storage.save();
    ui.$("teachPanel").classList.remove("hidden");
    ui.$("lessonStages").classList.toggle(
      "hidden",
      state.session.mode === "tutorial",
    );
    ui.$("teachCount").textContent =
      `${state.session.phase === "greeting" ? "TODAY'S GREETING" : state.session.phase === "lexical" ? "VOCABULARY" : "BUILDING SENTENCES"} · CARD ${state.session.cardIndex + 1}/${items.length}`;
    ui.$("teachType").textContent =
      state.session.phase === "sentence" ? "Present-tense sentence" : w.type;
    ui.$("teachPashto").textContent = w.ps;
    ui.$("teachRoman").textContent = w.roman;
    ui.$("teachEnglish").textContent = w.en;
    ui.$("teachNote").textContent = w.note;
    ui.$("dialectVariant").textContent = w.dialect
      ? "Regional note: " + w.dialect
      : "";
    ui.$("dialectVariant").classList.toggle("hidden", !w.dialect);
    ui.$("guideMessage").textContent =
      state.session.mode === "tutorial"
        ? "Read the greeting and its transliteration. There are only four phrases in our first level."
        : state.session.mode === "review"
          ? "Study this previously encountered item before recalling it. Review uses the same spaced-repetition schedule as your vocabulary bank."
          : state.session.loop <= 3 && state.session.phase === "lexical"
            ? content.villagePeople[state.session.loc].words
            : state.session.loop >= 4 && state.session.phase === "lexical"
              ? `${content.teacherFor(state.session.loop, state.session.loc, state.session.mode).name}: These words belong to today's ${ui.displayPlace(state.session.loop, state.session.loc).toLowerCase()} conversation.`
              : state.session.phase === "lexical"
                ? `These are the new ${w.type}s for this location. You will see older words again in the quiz.`
                : state.session.loop === 1
                  ? `Let us describe a thing using a noun, an adjective and the correct form of “is”. We do not need a separate word for “it”.`
                  : state.session.loop === 2
                    ? `Notice how the action comes at the end of the Pashto sentence.`
                    : state.session.loop === 3
                      ? `${content.villagePeople[state.session.loc].name}: Say this sentence as “I”. Watch how the verb changes with the person speaking.`
                      : state.session.loop === 4
                        ? `${content.teacherFor(4, state.session.loc, "standard").name}: Practise informal “you” (ته) and then link two complete actions using او.`
                        : state.session.loop === 5
                          ? `${content.teacherFor(5, state.session.loc, "standard").name}: Practise polite/plural “you” (تاسې); decide whom you are addressing.`
                          : `Read the present-tense sentence and notice the speaker.`;
    if (state.session.loop >= 6) {
      ui.setDialogueSpeaker(
        content.teacherFor(
          state.session.loop,
          state.session.loc,
          state.session.mode,
        ).name,
      );
      const listener =
        state.session.loop === 6
          ? w.en.startsWith("You")
            ? "Saleha and Mina"
            : "your group, including you"
          : "the observed group (not you or the teacher)";
      ui.$("guideMessage").textContent =
        state.session.loop === 7
          ? `${content.teacherFor(state.session.loop, state.session.loc, state.session.mode).name} → Player: Describe ${state.session.loc === "business" ? (w.id.endsWith("-bread") ? "the bread sellers" : "the fruit customers") : state.session.loc === "residential" ? "the visiting relatives" : state.session.loc === "nature" ? "the children by the water" : "the other students"}. They are outside our conversation.`
          : `${content.teacherFor(state.session.loop, state.session.loc, state.session.mode).name} → Player: This is your model response; “I” is the player. Group: ${listener}.`;
    }
    if (state.session.loop >= 8) {
      const day = content.week2Days[state.session.loop],
        card = day.lessons.flatMap((l) => l.cards).find((c) => c.id === w.id);
      if (card) {
        ui.$("guideMessage").textContent =
          `${content.teacherFor(state.session.loop, state.session.loc, state.session.mode).name} → Player: Study model spoken by ${card.speaker}, addressed to ${card.recipient}. ${day.topic}. Local language review pending.`;
      }
    }
    if (state.session.loop === 1 && state.session.phase === "sentence")
      ui.$("guideMessage").textContent =
        content.LIBRARY_DATA.lessonContexts[1][state.session.loc];
    ui.$("addressTarget").textContent =
      `${content.teacherFor(state.session.loop, state.session.loc, state.session.mode).name} → Player · study example${state.session.loop >= 6 ? " · Player practises the displayed sentence" : ""}`;
    ui.$("addressTarget").classList.remove("hidden");
    if (w.generated)
      ui.$("guideMessage").textContent =
        "Cumulative practice: descriptions and noun agreement using words you have already studied. Generated language remains a draft for native review.";
    else if (w.loop < state.session.loop && w.type === "sentence")
      ui.$("guideMessage").textContent =
        "Cumulative practice from an earlier authored lesson. Read the model's meaning and forms carefully.";
    ui.$("teachNext").textContent =
      state.session.cardIndex === items.length - 1
        ? state.session.phase === "greeting"
          ? "Continue to the lesson →"
          : state.session.phase === "lexical" &&
              state.session.studySentences.length
            ? "Time for sentences →"
            : "Start the quiz →"
        : "Next study card →";
    const stages = ui.$("lessonStages").children;
    for (let i = 0; i < stages.length; i++) {
      stages[i].classList.toggle(
        "done",
        state.session.phase === "sentence" && i === 0,
      );
      stages[i].classList.toggle(
        "active",
        state.session.phase === "greeting" || state.session.phase === "lexical"
          ? i === 0
          : state.session.phase === "sentence"
            ? i === 1
            : i === 2,
      );
    }
  }
  function afterStudy() {
    audio.stopAudio();
    if (state.session?.mode === "tutorial") {
      if (ui.$("teachNext").disabled) return;
      state.session.cardIndex++;
      if (state.session.cardIndex < content.tutorialCards.length)
        tutorial.renderTutorialStep();
      else finish();
      return;
    }
    if (
      !state.session ||
      !["greeting", "lexical", "sentence"].includes(state.session.phase)
    )
      return;
    state.session.cardIndex++;
    if (state.session.cardIndex < studyList().length) {
      teachCard();
      return;
    }
    if (state.session.phase === "greeting") {
      state.session.phase =
        state.session.preLessonGrammar ||
        (state.session.loop === 1 && !state.progress.personIntros[1])
          ? "grammar"
          : state.session.studyWords.length
            ? "lexical"
            : state.session.studySentences.length
              ? "grammar"
              : "quiz";
      state.session.cardIndex = 0;
      renderPhase();
    } else if (
      state.session.phase === "lexical" &&
      (state.session.studySentences.length ||
        (state.session.loop === 1 && !state.progress.personIntros[1]))
    ) {
      state.session.phase =
        state.session.preLessonGrammar || state.session.mode === "review"
          ? "sentence"
          : "grammar";
      state.session.cardIndex = 0;
      renderPhase();
    } else {
      state.session.phase = "quiz";
      ui.$("guideMessage").textContent =
        `${content.teacherFor(state.session.loop, state.session.loc, state.session.mode).name}: Let’s see what you remember. Mistakes help you learn.`;
      renderPhase();
    }
  }
  function afterGrammar() {
    audio.stopAudio();
    if (
      !state.session ||
      state.session.phase !== "grammar" ||
      ui.$("sovNext").disabled
    )
      return;
    if (
      learning.needsOpening(state.session.loop, state.session.loc) &&
      state.session.preLessonGrammar
    ) {
      const last =
        state.session.loop >= 8 ? 0 : state.session.loop === 6 ? 4 : 3;
      if ((state.session.openingStep || 0) < last) {
        state.session.openingStep = (state.session.openingStep || 0) + 1;
        grammar.showWeekOpening();
        return;
      }
      if (ui.$("openingPractice"))
        ui.$("openingPractice").classList.add("hidden");
    }
    if (
      state.session.loop > 1 &&
      (!state.progress.sovSeen || state.session.preLessonGrammar)
    )
      state.progress.sovSeen = true;
    if (state.session.loop)
      state.progress.personIntros[state.session.loop] = true;
    storage.save();
    state.session.phase = state.session.preLessonGrammar
      ? state.session.studyWords.length
        ? "lexical"
        : state.session.studySentences.length
          ? "sentence"
          : "quiz"
      : "sentence";
    state.session.cardIndex = 0;
    renderPhase();
  }
  function showQuestion() {
    if (!state.session) return;
    queueMicrotask(ui.readableQuizSurfaces);
    audio.stopAudio();
    if (!state.session.queue.length) {
      finish();
      return;
    }
    ui.$("quizPanel").classList.remove("hidden");
    ui.$("constructionPanel").classList.add("hidden");
    ui.$("addressTarget").textContent =
      `${content.teacherFor(state.session.loop, state.session.loc, state.session.mode).name} → Player · YOUR ANSWER → ${content.teacherFor(state.session.loop, state.session.loc, state.session.mode).name}`;
    ui.$("addressTarget").classList.remove("hidden");
    ui.$("quizPashto").classList.remove("english-question");
    ui.$("quizPashto").setAttribute("dir", "rtl");
    ui.$("quizPashto").setAttribute("lang", "ps");
    ui.$("quizSpeak").classList.remove("hidden");
    const w = content.wordById[state.session.queue[0].id],
      retry = state.session.queue[0].retries;
    state.session.locked = false;
    learning.libraryExpose(
      w.id,
      state.session.mode === "review"
        ? "review"
        : state.session.mode === "tutorial"
          ? "tutorial"
          : "lesson",
    );
    storage.save();
    ui.$("quizCounter").textContent =
      `QUESTION ${state.session.answered + 1} · ${state.session.queue.length} REMAINING`;
    ui.$("quizType").textContent = retry
      ? "↻ RETRY"
      : learning.stat(w.id).seen > 0
        ? "✧ PRACTICE"
        : "★ NEW";
    ui.$("quizPashto").textContent = w.ps;
    ui.$("quizRoman").textContent = w.roman;
    ui.$("quizPrompt").textContent =
      w.type === "sentence"
        ? "What does this whole sentence mean?"
        : w.type === "greeting"
          ? "What does this greeting mean?"
          : `What does this ${w.type} mean?`;
    ui.$("choices").replaceChildren();
    for (const choice of questions.distractors(w)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      b.textContent = choice;
      b.addEventListener("click", () => answer(choice));
      ui.$("choices").append(b);
    }
    ui.$("quizFeedback").textContent = "Choose one answer to continue.";
    ui.$("quizNext").disabled = true;
    ui.$("quizNext").textContent = "Next →";
  }
  function answer(choice) {
    queueMicrotask(ui.readableQuizSurfaces);
    const result = learning.submitLesson(choice);
    if (!result) return;
    const { w, correct, gain } = result;
    storage.save();
    ui.hud();
    for (const b of ui.$("choices").children) {
      b.disabled = true;
      if (b.textContent === w.en) b.classList.add("correct");
      else if (b.textContent === choice) b.classList.add("wrong");
    }
    ui.$("quizFeedback").replaceChildren();
    const strong = document.createElement("strong");
    strong.className = correct ? "good" : "bad";
    strong.textContent = correct
      ? `✓ Correct! +${gain} XP`
      : "✗ Not yet — you will see this again";
    const detail = document.createElement("div");
    detail.textContent = `${w.ps} (${w.roman}) — “${w.en}”. ${w.note}`;
    ui.$("quizFeedback").append(strong, detail);
    ui.$("quizNext").disabled = false;
    ui.$("quizNext").textContent = state.session.queue.length
      ? "Next →"
      : "Finish lesson →";
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
  };
}
