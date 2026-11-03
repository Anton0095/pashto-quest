/* Four authored onboarding interactions; ordinary shared learning records and rewards. */
function createTutorial({ state, content, learning, ui, storage, questions }) {
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
      "Arrange Pashto words",
      "Answer a question",
      "Type a response",
    ][n];
    ui.$("teachPashto").textContent = w.ps;
    ui.$("teachRoman").textContent = w.roman;
    ui.$("teachEnglish").textContent = w.en;
    ui.$("teachNote").textContent = c.help;
    ui.$("guideMessage").textContent = [
      "First, select what Salaam means. You can try again if you make a mistake.",
      "Arrange this conventional greeting, taught as a complete phrase.",
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
    const feedback = document.createElement("p");
    feedback.id = "tutorialFeedback";
    feedback.className = "tutorial-feedback";
    feedback.setAttribute("role", "status");
    area.append(p);
    const done = (message) => {
      if (state.session.passed.has(c.id)) return;
      tutorialAnswer(true);
      feedback.textContent = message || "✓ Correct. Continue.";
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
            done(
              "✓ Salaam means Hello. That is how you answer multiple choice.",
            );
          } else {
            tutorialAnswer(false);
            feedback.textContent = "Not quite. Try again.";
          }
        });
        choices.append(b);
      }
      area.append(choices);
    } else if (c.kind === "tiles") {
      ui.$("lessonScreen").classList.add("construction-active");
      ui.$("teachSpeak").classList.add("hidden");
      for (const id of ["teachPashto", "teachRoman", "teachEnglish", "teachNote"]) ui.$(id).textContent="";
      p.remove();
      const draft=state.session.tutorialConstruction ||= {built:[],locked:false};
      ui.construction.mount(area,w,{kind:"construct"},{retry:true,draft,onChange:()=>storage.save(),
        tiles:w.ps.split(" ").map((word,index)=>({word,index})),
        onAnswer(correct) {
          if (correct) done();
          else tutorialAnswer(false);
        }});
    } else if (c.kind === "pashto-choice") {
      const choices=document.createElement("div");choices.className="choices tutorial-choices";
      for(const answer of QuestionEngine.shuffle(w.choices)){
        const b=ui.button(answer,()=>{
          const correct=QuestionEngine.evaluate({kind:"word",direction:"en-ps"},{ps:w.answerPs},answer);
          b.classList.add(correct?"correct":"wrong");
          if(correct)done("✓ پښتو — Pashto. Continue.");
          else{tutorialAnswer(false);feedback.textContent="Not quite. Choose the Pashto name for Pashto and try again.";}
        });
        b.classList.add("pashto-option");b.lang="ps";b.dir="rtl";b.dataset.answer=answer;choices.append(b);
      }
      area.append(choices);
    } else {
      const row=document.createElement("form");row.className="tutorial-name-row";
      const field=document.createElement("input");field.id="tutorialName";field.type="text";field.maxLength=40;
      field.className="tutorial-name-input";field.autocomplete="off";field.placeholder="Type his name in English";
      field.setAttribute("aria-label","Muhammad Jan’s name in English");
      const b=document.createElement("button");b.type="submit";b.id="tutorialSaveName";b.className="primary";b.textContent="Check answer";
      row.addEventListener("submit",event=>{
        event.preventDefault();
        const correct=QuestionEngine.evaluate({kind:"word",direction:"ps-en"},{en:w.answerEnglish,acceptedEnglishAnswers:w.acceptedEnglishAnswers},field.value);
        if(correct)done("✓ Muhammad Jan. You can set your own name and gender in Library → Player Profile whenever you like.");
        else{tutorialAnswer(false);feedback.textContent="Not quite. His name is Muhammad Jan. Try again.";}
      });
      row.append(field,b);area.append(row);
    }
    area.append(feedback);
    if (state.session.passed.has(c.id)) {
      ui.$("teachNext").disabled=false;
      feedback.textContent="Your response is recorded. Continue when ready.";
      for (const el of area.querySelectorAll("button,input")) el.disabled=true;
    }
  }

  return { renderTutorialStep };
}
