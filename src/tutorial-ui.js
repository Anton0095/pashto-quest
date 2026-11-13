/* Four authored onboarding interactions; ordinary shared learning records and rewards. */
function createTutorial({ state, content, learning, ui, storage, questions, onAdvance }) {
  function tutorialAnswer(correct) {
    learning.submitTutorial(
      content.tutorialIds[state.session.cardIndex],
      correct,
    );
    if (correct) ui.$("teachNext").disabled = false;
    storage.save();
    ui.hud();
  }

  function renderTutorialStep() {
    ui.$("teachSpeak").classList.remove("hidden");
    const n = state.session.cardIndex,
      c = content.tutorialCards[n],
      w = content.wordById[c.id];
    learning.surface(c.id, "tutorial");
    learning.libraryExpose(c.id, "tutorial");
    storage.save();
    ui.$("teachPanel").classList.remove("hidden");
    ui.$("lessonStages").classList.add("hidden");
    ui.$("teachCount").textContent = `TUTORIAL · CARD ${n + 1}/4`;
    ui.$("teachType").textContent = [
      "Choose a meaning",
      "Select the correct translation",
      "Answer a question",
      QuestionEngine.typingPreferences(state.progress).en ? "Type a response" : "Choose a response",
    ][n];
    ui.$("teachPashto").textContent = w.ps;
    ui.$("teachRoman").textContent = w.roman;
    ui.$("teachEnglish").textContent = w.en;
    ui.$("teachNote").classList.remove("hidden");
    ui.$("teachNote").textContent = c.help;
    ui.$("guideMessage").textContent = [
      "First, select what Salaam means. You can try again if you make a mistake.",
      "Select the English translation of this conventional greeting.",
      "Select the Pashto response for the language you are learning.",
      "Muhammad Jan: Type my name in English. Your player profile can be set later in the Library.",
    ][n];
    ui.$("teachNext").disabled = true;
    ui.$("teachNext").textContent =
      n === 3 ? "Finish introduction →" : "Continue →";
    const area = ui.$("tutorialInteraction");
    area.replaceChildren();
    area.classList.remove("hidden");
    const p = document.createElement("p");
    p.className = "tutorial-instructions";
    p.textContent = c.help;
    const feedback = document.createElement("div");
    feedback.id = "tutorialFeedback";
    feedback.className = "tutorial-feedback";
    feedback.setAttribute("role", "status");
    area.append(p);
    const done = () => {
      if (learning.itemCompleted(c.id)) return;
      tutorialAnswer(true);
      ui.renderAnswerFeedback(feedback,w,{},true);
      for (const el of area.querySelectorAll("button,input"))
        el.disabled = true;
    };
    if (c.kind === "choice") {
      const choices = document.createElement("div");
      choices.className = "choices tutorial-choices";
      for (const answer of questions.distractors(w)) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice";
        b.textContent = answer;
        b.dataset.answer = answer;
        b.addEventListener("click", () => {
          ui.showAnswerFeedback(choices, w.en, answer, {lock:false, accepts:v => QuestionEngine.evaluate({kind:"word", direction:"ps-en"}, w, v)});
          if (
            QuestionEngine.evaluate(
              { kind: "word", direction: "ps-en" },
              w,
              answer,
            )
          ) {
            b.classList.add("correct");
            done();
          } else {
            tutorialAnswer(false);
            ui.renderAnswerFeedback(feedback,w,{},false);
          }
        });
        choices.append(b);
      }
      area.append(choices);
    } else if (c.kind === "pashto-choice") {
      const choices=document.createElement("div");choices.className="choices tutorial-choices";
      for(const answer of QuestionEngine.shuffle(w.choices)){
        const b=ui.button(answer,()=>{
          const correct=QuestionEngine.evaluate({kind:"word",direction:"en-ps"},{ps:w.answerPs},answer);
          b.classList.add(correct?"correct":"wrong");
          if(correct)done();
          else{tutorialAnswer(false);ui.renderAnswerFeedback(feedback,w,{},false);}
        });
        b.classList.add("pashto-option");b.lang="ps";b.dir="rtl";b.dataset.answer=answer;choices.append(b);
      }
      area.append(choices);
    } else if (!QuestionEngine.typingPreferences(state.progress).en) {
      const choices=QuestionEngine.shuffle([w.answerEnglish,"Ms Hameed","Edris","Deena"]);
      for(const value of choices){const button=ui.button(value,()=>{
        if(QuestionEngine.evaluate({kind:"word",direction:"ps-en"},{en:w.answerEnglish,acceptedEnglishAnswers:w.acceptedEnglishAnswers},value))done();
        else {tutorialAnswer(false);ui.renderAnswerFeedback(feedback,w,{},false);}
      });button.dataset.answer=value;area.append(button);}
    } else {
      ui.typedAnswer.mount({
        host: area, id: "tutorialName", label: "Muhammad Jan’s name in English",
        inputClass: "tutorial-name-input", formClass: "tutorial-name-row",
        maxLength: 40, placeholder: "Type his name in English",
        submitId: "tutorialSaveName", submitClass: "primary", submitLabel: "Check answer",
        onSubmit(value) {
          const correct = QuestionEngine.evaluate({kind:"word", direction:"ps-en"},
            {en:w.answerEnglish, acceptedEnglishAnswers:w.acceptedEnglishAnswers}, value);
          if (correct) done();
          else { tutorialAnswer(false); ui.renderAnswerFeedback(feedback,w,{},false); }
        },
        onSkip() {
          if (learning.itemCompleted(c.id)) return;
          questions.disableTyping({direction:"ps-en"});
          storage.save();renderTutorialStep();
        },
      });
    }
    area.append(feedback);
    if (learning.itemCompleted(c.id)) {
      ui.$("teachNext").disabled=false;
      if(state.session.skippedItems?.includes(c.id))feedback.textContent="Skipped — typing challenges are off.";
      else ui.renderAnswerFeedback(feedback,w,{},true);
      for (const el of area.querySelectorAll("button,input")) el.disabled=true;
    }
  }

  return { renderTutorialStep };
}
