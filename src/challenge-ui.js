/* Assessment presentation, indexed tile controls, feedback, results and resuming. */
function createChallengeUI({
  state,
  content,
  progression,
  learning,
  questions,
  ui,
  audio,
  storage,
  onWorld,
}) {
  function showChallengeScene(day) {
    let panel = ui.$("challengeScene");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "challengeScene";
      ui.$("lessonScreen").insertBefore(panel, ui.$("participants"));
    }
    panel.replaceChildren();
    panel.classList.toggle("hidden", day < 6 && day !== 1);
    if (day === 1) {
      panel.append(
        ui.node("p", "LIBRARY · MUHAMMAD JAN’S HOME HANDOVER", "eyebrow"),
        ui.node(
          "p",
          state.progress.homeGranted
            ? "Your home award is already recorded. Replays do not award it again."
            : "Muhammad Jan → Player: Show me what you remember. Twelve correct answers out of fifteen, and I will give you the key to your own home.",
        ),
      );
      return;
    }
    if (day < 6) return;
    if (day >= 8) {
      const intro = document.createElement("p");
      intro.className = "tiny";
      intro.textContent = `Week 2 draft · Native Laghman review pending. ${content.dayById[day].challenge}`;
      panel.append(intro);
      return;
    }
    const title = document.createElement("p");
    title.className = "eyebrow";
    title.textContent =
      day === 6
        ? "HILLS · WALK WITH SALEHA AND MINA"
        : "SCHOOL · WEEK 1 EXAMINATION";
    panel.append(title);
    if (day === 6) {
      const art = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      art.setAttribute("viewBox", "0 0 600 120");
      art.setAttribute("role", "img");
      art.setAttribute(
        "aria-label",
        "Saleha, Mina and the player walk in the hills above the village",
      );
      art.style.width = "100%";
      art.style.maxHeight = "120px";
      art.innerHTML =
        '<rect width="600" height="120" fill="#294358"/><path d="M0 110 L140 15 L300 110 L440 20 L600 110Z" fill="#62856c"/><path d="M0 120 L220 35 L400 120 L550 60 L600 120Z" fill="#405b47"/><text x="230" y="100" font-size="28">🧑 👩‍🎓 👧</text>';
      panel.append(art);
    }
    const text = document.createElement("p");
    text.textContent =
      day === 6
        ? "Saleha → Player: “Mina and I welcome you on our walk.” Mina → Player: “Tell us about the activities you remember, and respond when someone speaks to you.”"
        : "Ms Hameed → Player: “This examination checks your first seven days: descriptions, pronouns, verb forms, sentence order, compounds and respectful conversations. Twenty correct answers out of twenty-five completes Week 1.”";
    panel.append(text);
  }
  const hasRetiredQuestions = attempt => attempt?.questions?.some(q => ["choice", "address"].includes(q.kind) || q.grammarConcept);
  function showRetiredAssessment(snapshot) {
    state.session = snapshot;
    state.day = snapshot.loop;
    audio.stopAudio();
    let panel = ui.$("retiredAssessmentNotice");
    if (!panel) { panel=ui.node("article");panel.id="retiredAssessmentNotice";ui.$("lessonScreen").prepend(panel); }
    ui.$("lessonEyebrow").textContent = `DAY ${snapshot.loop} · SAVED ASSESSMENT`;
    ui.$("lessonName").textContent = "Assessment format changed";
    ui.$("lessonDescription").textContent = `${snapshot.answered}/${snapshot.questions.length} answers recorded · saved score ${snapshot.correctCount}/${snapshot.questions.length}. Nothing has been regraded.`;
    ui.$("addressTarget").classList.add("hidden");
    panel.replaceChildren(ui.node("h2", "Saved assessment uses retired rule questions"),
      ui.node("p", "Your saved questions, answers and scores have not been changed. Rule-analysis questions are no longer assessed. Keep this attempt paused, export it, or explicitly retire it and start practical Pashto practice. Your vocabulary plan, SRS, XP and past results stay intact."));
    panel.classList.remove("hidden");
    panel.append(ui.button("Keep paused and return to town", () => { panel.classList.add("hidden");onWorld(); }),
      ui.button("Export this saved attempt", () => {
        const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)],{type:"application/json"}));
        const a=document.createElement("a");a.href=url;a.download="pashto-retired-assessment.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      }),
      ui.button("Retire saved attempt and start practical assessment", () => {
        // Exact archive, not a migration or an automatic reroll. Only this
        // explicit action abandons the old active attempt; no result is graded.
        state.progress.retiredRuleAssessmentJSON = JSON.stringify(snapshot);
        delete state.progress.activeChallenge;
        state.session=null;
        panel.classList.add("hidden");
        startChallenge(snapshot.loop);
      }));
    for (const id of ["teachPanel","grammarPanel","quizPanel","constructionPanel","lessonStages","challengeScene"]) ui.$(id)?.classList.add("hidden");
    ui.view("lessonScreen");
  }
  function startChallenge(day, snapshot = null) {
    if (!learning.allowed(day)) return;
    if (!snapshot && state.progress.activeChallenge)
      return startChallenge(state.progress.activeChallenge.loop, JSON.parse(JSON.stringify(state.progress.activeChallenge)));
    if (snapshot && hasRetiredQuestions(snapshot)) { showRetiredAssessment(snapshot);return; }
    ui.$("retiredAssessmentNotice")?.classList.add("hidden");
    audio.stopAudio();
    ui.$("lessonExpression")?.replaceChildren();
    const items = snapshot?.questions || questions.selectChallenge(day, { newAttempt: true }),
      spec = progression.getChallengeSpec(day);
    state.session = snapshot || {
      id: `challenge-${day}`,
      mode: "challenge",
      loc: null,
      loop: day,
      questions: items,
      index: 0,
      correctCount: 0,
      answered: 0,
      earned: 0,
      built: [],
      locked: false,
      initialLevel: progression.characterStatus(state.progress).level,
    };
    if (!snapshot)
      state.session.attemptId = ++state.progress.library.attemptSequence;
    ui.$("lessonEyebrow").textContent =
      day === 3
        ? "DAY 3 · DINNER AT MARKET"
        : day === 4
          ? "DAY 4 · CONVERSATION AT HOME"
          : day === 5
            ? "DAY 5 · COMMUNITY GATHERING AT LAKE"
            : `DAY ${day} · CHALLENGE`;
    ui.$("lessonName").textContent =
      day <= 2
        ? `Muhammad Jan's check-in`
        : day === 3
          ? "Dinner with Edris"
          : day === 4
            ? "An evening with Muhammad Jan"
            : day === 5
              ? "A lakeside community gathering"
              : "Town Challenge";
    ui.$("lessonIcon").textContent =
      day === 3 ? "🧺" : day === 4 ? "🏡" : day === 5 ? "🏞️" : "🏆";
    ui.setSpeaker(
      day,
      day === 3 ? "business" : day === 5 ? "nature" : "residential",
      "challenge",
    );
    ui.$("guideMessage").textContent =
      day <= 2
        ? "Welcome home! Let us check what you know. You may take the challenge without visiting the other locations. Twelve correct answers unlock tomorrow."
        : day === 3
          ? "Salaam! It is nearly dinnertime. Let us shop for dinner and practise fifteen questions."
          : day === 4
            ? "Come in and sit down. We have talked as friends all day. Let us practise what YOU and I do, and join two clauses using او. When I say “you” informally, I am addressing you; when you do, you are addressing a familiar friend, not an elder."
            : day === 5
              ? "Welcome to our gathering near the lake! Saleha, Edris, Ms Hameed and Muhammad Jan are all here. Listen to the speaker, look carefully at whom you are addressing, and choose informal ته or polite/plural تاسې."
              : `Welcome to Day ${day}! You need twelve correct answers to advance.`;
    if (day >= 6) {
      ui.$("lessonEyebrow").textContent =
        day === 6 ? "DAY 6 · HILLS" : "DAY 7 · SCHOOL · WEEKLY EXAMINATION";
      ui.$("lessonName").textContent = spec.title;
      ui.$("lessonIcon").textContent = day === 6 ? "⛰️" : "🏫";
    }
    if (day >= 8) {
      ui.$("lessonIcon").textContent = content.zones[spec.scene].icon;
      ui.$("lessonEyebrow").textContent = `DAY ${day} · WEEK 2 DRAFT`;
      ui.setSpeaker(day, spec.scene, "challenge");
    }
    if (day === 1) {
      ui.$("lessonEyebrow").textContent = "DAY 1 · LIBRARY · HOME HANDOVER";
      ui.$("lessonName").textContent = "Muhammad Jan’s Library conversation";
      ui.$("guideMessage").textContent = state.progress.homeGranted
        ? "Welcome back to the Library. Your home award is already recorded."
        : "Muhammad Jan → Player: Welcome to the Library. Twelve correct answers and I will give you the key to your home. You can take this challenge without any teaching visits.";
    }
    const categories = {
      word: "vocabulary/phrases",
      construct: "construction",
      dialogue: "dialogue",
      sentence: "translation",
    };
    const counts = items.reduce((out, question) => {
      out[question.kind] = (out[question.kind] || 0) + 1;
      return out;
    }, {});
    ui.$("lessonDescription").textContent =
      `${items.length} turns · ${spec.passCount}/${items.length} to pass · ${Object.entries(
        counts,
      )
        .map(([kind, count]) => `${count} ${categories[kind]}`)
        .join(" · ")}`;
    const deficit = state.progress.library.plans[day]?.assessmentDeficit;
    if (deficit?.adaptedTasks)
      ui.$("lessonDescription").textContent +=
        ` · ${deficit.adaptedTasks} vocabulary/phrase review tasks: insufficient distinct studied sentence combinations; review pool ${deficit.practicalPoolSize || "limited"}, items may repeat`;
    ui.$("lessonScreen").dataset.week = day >= 8 ? "2" : "1";
    ui.$("lessonScreen").dataset.day = String(day);
    showChallengeScene(day);
    ui.hud();
    ui.view("lessonScreen");
    for (const id of ["teachPanel", "grammarPanel", "quizPanel"])
      ui.$(id).classList.add("hidden");
    showChallengeQuestion(Boolean(snapshot));
  }
  function renderBuiltSentence() {
    if (state.session?.mode !== "challenge") return;
    const q = state.session.questions[state.session.index];
    if (!q || !["construct", "dialogue"].includes(q.kind)) return;
    const target = questions.buildTiles(content.wordById[q.id] || null, q);
    const area = ui.$("builtSentence"),
      bank = ui.$("wordTiles");
    area.replaceChildren();
    bank.replaceChildren();
    if (!state.session.built.length) {
      const hint = document.createElement("span");
      hint.className = "build-placeholder";
      hint.textContent = "Tap the Pashto tiles below…";
      area.append(hint);
    }
    state.session.built.forEach((idx, pos) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "built-token";
      b.lang = "ps";
      b.textContent = target[idx].word;
      b.disabled = state.session.locked;
      b.setAttribute("aria-label", `Remove word ${target[idx].word}`);
      b.addEventListener("click", () => {
        state.session.built.splice(pos, 1);
        renderBuiltSentence();
      });
      area.append(b);
    });
    const tileSequence = state.session.tileSequence || [];
    for (const index of tileSequence) {
      const used = state.session.built.includes(index),
        b = document.createElement("button");
      b.type = "button";
      b.className = "word-tile";
      b.lang = "ps";
      b.textContent = target[index].word;
      b.disabled = used || state.session.locked;
      b.addEventListener("click", () => {
        state.session.built.push(index);
        renderBuiltSentence();
      });
      bank.append(b);
    }
    ui.$("undoTile").disabled =
      state.session.locked || !state.session.built.length;
    ui.$("clearTiles").disabled =
      state.session.locked || !state.session.built.length;
    ui.$("checkBuild").disabled =
      state.session.locked ||
      (questions.questionUsesDuds(q)
        ? state.session.built.length === 0
        : state.session.built.length !== target.length);
    storage.save();
  }
  function showChallengeQuestion(resuming = false) {
    if (hasRetiredQuestions(state.session)) {showRetiredAssessment(state.session);return;}
    ui.clearSentenceScene();
    renderQuestion(resuming);
    const q = state.session?.questions[state.session.index];
    if (q && ["construct", "dialogue"].includes(q.kind)) {
      const w = content.wordById[q.id];
      const host = q.speaker || content.teacherFor(state.session.loop, null, "challenge").name;
      ui.sentenceContext(w, host, ui.$("quizPanel"), "construct", q);
      if (q.kind === "dialogue") {
        ui.$("guideMessage").textContent = `${host}: “${q.promptEnglish}” ${q.sceneEnglish || ""}`;
        ui.$("addressTarget").textContent = `${host} → Player · YOUR RESPONSE → ${q.recipient}`;
      }
    }
    if (q?.phrasePromptId) {
      const prompt = content.wordById[q.phrasePromptId];
      const host = q.speaker || content.teacherFor(state.session.loop, null, "challenge").name;
      ui.$("guideMessage").textContent = `${host}: ${prompt.ps} (${prompt.roman} — ${prompt.en}). Recognise the conventional reply shown below.`;
      ui.$("addressTarget").textContent = `${host} → Player · YOUR REPLY → ${host}`;
    }
    if (resuming && state.session.locked) renderRecordedResponse();
  }
  function renderQuestion(resuming) {
    queueMicrotask(ui.readableQuizSurfaces);
    audio.stopAudio();
    ui.$("quizPanel").classList.remove("hidden");
    ui.$("constructionPanel").classList.add("hidden");
    ui.$("choices").replaceChildren();
    const q = state.session.questions[state.session.index];
    if (q) {
      if (q.generated) learning.surface(q.id, "assessment-target");
      if (q.promptGenerated)
        learning.surface(q.promptGenerated.id, "dialogue-prompt");
      if (q.kind === "word") learning.surface(q.id, "assessment-word");
      if (q.choiceIds)
        for (const id of q.choiceIds) learning.surface(id, "assessment-choice");
    }
    if (!q) {
      finishChallenge();
      return;
    }
    if (q.kind !== "dialogue") learning.libraryExpose(q.id, "challenge");
    queueMicrotask(storage.save);
    const w =
      q.kind === "address" || q.kind === "choice" || q.kind === "dialogue"
        ? null
        : content.wordById[q.id];
    if (!resuming) {
      state.session.locked = false;
      state.session.built = [];
      delete state.session.submittedAnswer;
      delete state.session.recallDraft;
    }
    ui.$("builtSentence").classList.remove("build-success", "build-error");
    ui.$("quizCounter").textContent =
      state.session.loop === 3
        ? `EDRIS · DINNER CONVERSATION ${state.session.index + 1}/${state.session.questions.length} · SCORE ${state.session.correctCount}/${state.session.questions.length}`
        : `DAY ${state.session.loop} · QUESTION ${state.session.index + 1}/${state.session.questions.length} · SCORE ${state.session.correctCount}/${state.session.questions.length}`;
    ui.$("guideMessage").textContent =
      q.comment || content.curriculum.days[state.session.loop - 1].challenge;
    const target = ui.$("addressTarget");
    const host = content.teacherFor(state.session.loop, null, "challenge");
    ui.setDialogueSpeaker(host.name);
    target.classList.remove("hidden");
    target.textContent = `${host.name} → Player · YOUR ANSWER → ${host.name}`;
    if (q.kind === "dialogue") {
      ui.setDialogueSpeaker(q.speaker || host.name);
      ui.showParticipants(q.participants || [q.speaker || host.name], q.recipient);
    }

    if (q.kind === "dialogue") {
      ui.$("quizType").textContent = "🗣️ REPLY IN PASHTO";
      ui.$("quizPashto").classList.remove("english-question");
      ui.$("quizPashto").textContent = q.promptPs || q.promptEnglish;
      ui.$("quizPashto").lang = q.promptPs ? "ps" : "en";
      ui.$("quizPashto").dir = q.promptPs ? "rtl" : "ltr";
      ui.$("quizPashto").classList.toggle("english-question", !q.promptPs);
      ui.$("quizRoman").textContent = [
        q.promptPs ? q.promptEnglish : "Respond using studied forms",
        q.sceneEnglish,
      ]
        .filter(Boolean)
        .join(" · ");
      ui.$("quizPrompt").textContent =
        `${q.speaker || "Your neighbour"} asks you a question. Build YOUR reply, not a translation of the prompt.`;
      ui.$("quizPanel").querySelector(".quizword h3").textContent =
        q.duds?.length >= 2
          ? "Choose only the tiles you need. Some tiles are distractions."
          : "Use the tiles to construct your reply.";
      ui.$("quizSpeak").classList.toggle("hidden", !q.audioId);
      ui.$("constructionPanel").classList.remove("hidden");
      if (!resuming) state.session.tileSequence = q.tileSequence;
      renderBuiltSentence();
      ui.$("quizFeedback").textContent =
        "Your first submitted answer counts. Leave unused tiles in the bank.";
      ui.$("quizNext").disabled = true;
      ui.$("quizNext").textContent =
        state.session.index === state.session.questions.length - 1
          ? "See results →"
          : "Next question →";
      return;
    }
    ui.$("quizType").textContent =
      q.kind === "construct"
        ? "🧩 BUILD A SENTENCE"
        : q.kind === "word"
          ? "🧠 WORD RECALL"
          : "📖 SENTENCE RECALL";
    const reverse = q.direction === "en-ps";
    const isBuild = q.kind === "construct";
    ui.$("quizPashto").textContent = reverse ? w.en : w.ps;
    ui.$("quizPashto").setAttribute("dir", reverse ? "ltr" : "rtl");
    ui.$("quizPashto").setAttribute("lang", reverse ? "en" : "ps");
    ui.$("quizPashto").classList.toggle("english-question", reverse);
    ui.$("quizRoman").textContent = isBuild
      ? "Arrange the Pashto tiles below"
      : reverse
        ? "Recall the Pashto expression"
        : w.roman + (q.unstudied ? " · Not previously studied" : "");
    ui.$("quizPrompt").textContent = isBuild
      ? "Build the Pashto sentence for this meaning"
      : reverse
        ? "Which Pashto expression means this?"
        : q.kind === "word"
          ? w.type === "greeting"
            ? "What does this greeting mean?"
            : "What does this word mean?"
          : "What does this sentence mean?";
    ui.$("quizSpeak").classList.toggle("hidden", reverse);
    ui.$("quizPanel").querySelector(".quizword h3").textContent = isBuild
      ? "Put the tiles into natural Pashto order"
      : reverse
        ? "Choose the correct Pashto"
        : "Choose the correct English meaning";
    if (isBuild) {
      ui.$("constructionPanel").classList.remove("hidden");
      if (!resuming) state.session.tileSequence = q.tileSequence;
      renderBuiltSentence();
    } else if (q.kind === "word" && q.unstudied) {
      ui.$("quizPrompt").textContent = "Not previously studied. Type the English meaning if you already know it, or reveal it after submitting. Your first answer counts.";
      ui.$("quizPanel").querySelector(".quizword h3").textContent = "Recall without a translation clue";
      const form = document.createElement("form");
      const input = document.createElement("input");
      input.id = "unseenRecall";
      input.className = "recall-input";
      input.setAttribute("aria-label", "English meaning from memory");
      input.autocomplete = "off";
      input.maxLength = 160;
      input.value = state.session.recallDraft || "";
      input.addEventListener("input", () => {
        state.session.recallDraft = input.value;
        storage.save();
      });
      const submit = document.createElement("button");
      submit.type = "submit";
      submit.textContent = "Submit meaning";
      const reveal = document.createElement("button");
      reveal.type = "button";
      reveal.textContent = "I don’t know — reveal meaning";
      reveal.addEventListener("click", () => answerChallenge(""));
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        answerChallenge(input.value);
      });
      form.append(input, submit, reveal);
      ui.$("choices").append(form);
    } else
      for (const value of q.choiceOrder) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice";
        b.textContent = value;
        b.dataset.answer = value;
        if (reverse) {
          b.lang = "ps";
          b.dir = "rtl";
          b.classList.add("pashto-option");
        }
        b.addEventListener("click", () => answerChallenge(value));
        ui.$("choices").append(b);
      }
    ui.$("quizFeedback").textContent =
      state.session.loop === 3
        ? "Choose or build your reply to Edris. The first answer counts."
        : state.session.loop === 4 || state.session.loop === 5
          ? "Listen to the named speaker, then choose or build your answer. The first answer counts."
          : "Your first answer counts toward today’s score.";
    ui.$("quizNext").disabled = true;
    ui.$("quizNext").textContent =
      state.session.index === state.session.questions.length - 1
        ? "See results →"
        : "Next question →";
    ui.$("audioStatus").textContent =
      "🔊 Listen to Pashto for recognition questions, if an Afghan Pashto voice is available.";
  }
  function answerChallenge(value) {
    queueMicrotask(ui.readableQuizSurfaces);
    const result = learning.submitChallenge(value);
    if (!result) return;
    const { q, w, correct, gain } = result;
    for (const control of ui.$("choices").querySelectorAll("input, button")) control.disabled = true;
    if (q.generated) learning.surface(q.id, "assessment-feedback");
    if (q.promptGenerated)
      learning.surface(q.promptGenerated.id, "dialogue-feedback");
    storage.save();
    ui.hud();
    if (q.kind === "dialogue") {
      renderBuiltSentence();
      ui.$("builtSentence").classList.add(
        correct ? "build-success" : "build-error",
      );
      const f = ui.$("quizFeedback");
      f.replaceChildren();
      const heading = document.createElement("strong");
      heading.className = correct ? "good" : "bad";
      heading.textContent = correct
        ? `✓ Your reply makes sense. ${gain ? `+${gain} XP` : "Already rewarded"}`
        : "✗ Try building the reply from the meaning of the question.";
      const expected = document.createElement("div");
      expected.lang = "ps";
      expected.dir = "rtl";
      expected.className = "inline-pashto";
      expected.textContent = q.answerPs;
      const gloss = document.createElement("div");
      gloss.textContent = q.answerEnglish || "";
      f.append(heading, expected, gloss, ui.node("p", questions.explanation(q, w)));
      ui.$("quizNext").disabled = false;
      return;
    }
    if (q.kind !== "construct")
      ui.showAnswerFeedback(ui.$("choices"), q.direction === "ps-en" ? w.en : w.ps, value, {accepts:v => QuestionEngine.evaluate(q, w, v)});
    else {
      renderBuiltSentence();
      ui.$("builtSentence").classList.add(
        correct ? "build-success" : "build-error",
      );
    }
    const feedback = ui.$("quizFeedback");
    feedback.replaceChildren();
    const headline = document.createElement("strong");
    headline.className = correct ? "good" : "bad";
    headline.textContent =
      state.session.loop === 3
        ? correct
          ? `✓ Edris: “Excellent! ${gain ? `+${gain} XP` : "You remember!"}”`
          : "✗ Edris: “Nearly! Let me show you the right way.”"
        : correct
          ? `✓ Correct! ${gain ? `+${gain} XP` : "Well remembered!"}`
          : "✗ Not quite — this word is now due for review";
    const detail = document.createElement("div");
    detail.textContent = `${w.ps} (${w.roman}) — ${w.en}. ${questions.explanation(q, w)}`;
    feedback.append(headline, detail);
    if (w.generated)
      ui.sentenceContext(w, q.speaker || content.teacherFor(state.session.loop, null, "challenge").name, ui.$("quizPanel"), "study", q);
    ui.$("quizSpeak").classList.remove("hidden");
    ui.$("quizNext").disabled = false;
  }
  function finishChallenge() {
    if (state.session?.mode !== "challenge" || state.session.finished) return;
    const s = state.session,
      day = s.loop,
      spec = progression.getChallengeSpec(day);
    s.finished = true;
    const reward = progression.completeChallengeOnce(
        state.progress,
        day,
        s.correctCount,
      ),
      { passed, firstPass, base, topUp } = reward;
    s.earned += base + topUp;
    const graduation = day === 7 && firstPass;
    if (firstPass && day < content.curriculum.days.length) state.day = day + 1;
    storage.save();
    ui.hud();
    ui.$("resultHeading").textContent = graduation
      ? "Week 1 complete · Level 10 · New Resident"
      : `${spec.resultTitle}: ${passed ? "passed!" : "practise and retry"}`;
    ui.$("resultDescription").textContent = graduation
      ? "Ms Hameed → Player: “When you arrived, you were a Newcomer. Now you can introduce yourself, speak respectfully to your neighbours and describe the people around you. Welcome as a New Resident of our village!”"
      : day === 7
        ? passed
          ? "Ms Hameed: “Well remembered! Your Week 1 graduation is already recorded.”"
          : "Ms Hameed: “Keep practising. Twenty correct answers are needed; you can try again.”"
        : day === 6
          ? passed
            ? "Saleha and Mina → Player: “We enjoy walking with you! Your next day is open.”"
            : "Saleha → Player: “Let us practise we and you both again.”"
          : passed
            ? `You passed ${spec.resultTitle}. Day ${day + 1} is open!`
            : `You scored ${s.correctCount}/${s.questions.length}; ${spec.passCount} correct are needed. Practise in town or retry.`;
    if (day === 1) {
      ui.$("resultDescription").textContent = passed
        ? firstPass
          ? "Muhammad Jan → Player: Here is the key to your own home. Welcome to the village! Your home is now yours, and I will still visit to help you learn."
          : "Your home award is already recorded. No second key or milestone reward is granted."
        : "Muhammad Jan → Player: Let us practise and try again. Your home will be awarded after twelve correct answers.";
    }
    if (day >= 8) {
      ui.$("resultDescription").textContent = passed
        ? day === 14
          ? "Ms Hameed → Player: “Your village review is complete. You remain a New Resident; keep practising with your neighbours.”"
          : `${content.teacherFor(day, null, "challenge").name} → Player: “Well done! Day ${day + 1} is available.”`
        : `Practise and retry: ${spec.passCount}/${s.questions.length} correct required. Your New Resident milestone is retained.`;
    }
    ui.$("resultAccuracy").textContent =
      `${s.correctCount}/${s.questions.length}`;
    ui.$("resultXP").textContent = `+${s.earned}`;
    ui.$("resultKnowledge").textContent = passed ? "PASSED" : "NOT YET";
    ui.$("resultNext").textContent =
      `Total: ${state.progress.xp} XP · Answer rewards: +${s.earned - base - topUp} XP. ${base ? `First-pass bonus: +${base} XP. ` : ""}${topUp ? `Checkpoint catch-up: +${topUp} XP. ` : ""}${graduation ? "Newcomer → New Resident. Week 1 is complete." : passed ? `${storage.persistenceProblem ? "Progress is in this tab; saving failed." : "Progress saved."} Replays do not repeat milestone rewards.` : "No milestone or title awarded. Retry when ready."}`;
    ui.$("resultReplay").textContent =
      `Retry ${s.questions.length}-question assessment`;
    ui.$("resultWorld").textContent = "Return to town →";
    ui.view("resultScreen");
  }
  function renderRecordedResponse() {
    const q = state.session.questions[state.session.index],
      w = content.wordById[q.id];
    for (const b of ui.$("choices").querySelectorAll("input, button")) b.disabled = true;
    const value = state.session.submittedAnswer;
    const correct = QuestionEngine.evaluate(q, w, value);
    if (["construct", "dialogue"].includes(q.kind)) {
      renderBuiltSentence();
      ui.$("builtSentence").classList.add(correct ? "build-success" : "build-error");
    } else if (!q.unstudied) {
      ui.showAnswerFeedback(ui.$("choices"), q.correct || (q.direction === "en-ps" ? w?.ps : w?.en), value, {accepts:v => QuestionEngine.evaluate(q, w, v)});
    }
    ui.$("quizFeedback").textContent =
      "Recorded response: " +
      (q.answerPs ||
        q.correct ||
        (w ? w.ps + (q.kind === "word" ? " — " + w.en : "") : "")) +
      ". Your first submitted answer is already recorded. " + questions.explanation(q, w);
    ui.$("quizNext").disabled = false;
  }
  function resumeChallenge() {
    if (!state.progress.activeChallenge) return false;
    const snapshot = JSON.parse(JSON.stringify(state.progress.activeChallenge));
    if (!learning.allowed(snapshot.loop)) return false;
    startChallenge(snapshot.loop, snapshot);
    storage.save();
    return true;
  }
  function undoTile() {
    if (state.session?.mode !== "challenge" || state.session.locked) return;
    state.session.built.pop();
    renderBuiltSentence();
  }
  function clearTiles() {
    if (state.session?.mode !== "challenge" || state.session.locked) return;
    state.session.built = [];
    renderBuiltSentence();
  }
  function checkBuild() {
    if (state.session?.mode !== "challenge" || state.session.locked) return;
    const q = state.session.questions[state.session.index];
    const tiles = questions.buildTiles(content.wordById[q.id] || null, q);
    if (
      questions.questionUsesDuds(q)
        ? state.session.built.length > 0
        : state.session.built.length === tiles.length
    )
      answerChallenge(state.session.built.map((i) => tiles[i].word).join(" "));
  }
  return {
    showChallengeScene,
    startChallenge,
    showChallengeQuestion,
    answerChallenge,
    finishChallenge,
    resumeChallenge,
    undoTile,
    clearTiles,
    checkBuild,
  };
}

