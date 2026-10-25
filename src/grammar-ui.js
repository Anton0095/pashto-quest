/* Authored grammar workshops and opening conversations, with their interactive practice. */
function createGrammar({ state, content, learning, ui, storage, onPhase }) {
  function showWeek2Grammar() {
    const plan = content.week2Days[state.session.loop],
      teacher = content.teacherFor(
        state.session.loop,
        state.session.loc,
        "standard",
      );
    ui.$("sovPanel").classList.remove("hidden");
    ui.$("sovDiagram").classList.add("hidden");
    if (ui.$("openingPractice"))
      ui.$("openingPractice").classList.add("hidden");
    ui.setDialogueSpeaker(teacher.name);
    ui.showParticipants(
      content.peopleAt[state.session.loop][state.session.loc],
    );
    ui.$("sovStep").textContent =
      `DAY ${state.session.loop} · ${teacher.name} → Player`;
    ui.$("sovTitle").textContent = plan.topic;
    const root = ui.$("sovExplanation");
    root.replaceChildren();
    for (const text of [
      plan.intro,
      ...plan.grammar,
      "Model phrases (draft; local review pending):",
    ]) {
      const row = document.createElement("span");
      row.style.display = "block";
      ui.renderMixedPashto(row, text);
      root.append(row);
    }
    for (const [ps, en] of plan.models) {
      const row = document.createElement("span");
      row.style.display = "block";
      ui.renderMixedPashto(row, `${ps} — ${en}`);
      root.append(row);
    }
    ui.$("guideMessage").textContent =
      `${teacher.name} → Player: ${plan.intro}`;
    ui.$("addressTarget").textContent =
      `${teacher.name} → Player · Normal-route opening and practice`;
    ui.$("addressTarget").classList.remove("hidden");
    ui.$("sovNext").disabled = false;
    ui.$("sovNext").textContent = "Continue to vocabulary and sentences →";
  }
  function showWeekOpening() {
    const day = state.session.loop,
      step = state.session.openingStep || 0;
    ui.$("sovPanel").classList.remove("hidden");
    ui.$("sovDiagram").classList.add("hidden");
    let practice = ui.$("openingPractice");
    if (!practice) {
      practice = document.createElement("div");
      practice.id = "openingPractice";
      ui.$("sovExplanation").after(practice);
    }
    practice.replaceChildren();
    practice.classList.remove("hidden");
    const steps = GrammarContent.openings[day];
    const [speaker, title, text] = steps[step];
    ui.setDialogueSpeaker(speaker);
    ui.showParticipants(day === 6 ? ["Saleha", "Mina"] : ["Edris"], "Player");
    ui.$("sovStep").textContent =
      `${speaker.toUpperCase()} → PLAYER · DAY ${day} · ${step + 1}/${steps.length}`;
    ui.$("sovTitle").textContent = title;
    ui.$("sovExplanation").textContent = text;
    ui.$("guideMessage").textContent = `${speaker} → Player: ${text}`;
    ui.$("sovNext").disabled = false;
    ui.$("sovNext").textContent =
      step === steps.length - 1
        ? "Continue to location vocabulary →"
        : "Continue conversation →";
    ui.$("addressTarget").textContent =
      `${speaker} → Player · YOUR PRACTICE RESPONSE → ${day === 6 ? "Saleha and Mina" : "Edris"}`;
    ui.$("addressTarget").classList.remove("hidden");
    if (step !== steps.length - 1) return;
    ui.$("sovNext").disabled = true;
    const message = document.createElement("p");
    message.setAttribute("role", "status");
    practice.append(message);
    if (day === 6) {
      const choices = document.createElement("div");
      choices.className = "buttons";
      practice.append(choices);
      let group = false,
        built = [];
      const build = document.createElement("div");
      build.className = "buttons";
      const output = document.createElement("p");
      output.dir = "rtl";
      output.lang = "ps";
      function check() {
        const correct = group && built.join(" ") === "موږ یو ځای منډې وهو";
        ui.$("sovNext").disabled = !correct;
        message.textContent = correct
          ? "✓ We includes you. First-person plural: وهو. Continue when ready."
          : group
            ? "Build the first-person plural sentence."
            : "Choose the speaker-included group first.";
      }
      for (const label of ["The player and Mina", "Only Saleha and Mina"]) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "secondary";
        b.textContent = label;
        b.onclick = () => {
          group = label === "The player and Mina";
          check();
        };
        choices.append(b);
      }
      for (const word of ["وهو", "منډې", "موږ", "ځای", "یو"]) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "secondary";
        b.lang = "ps";
        b.textContent = word;
        b.onclick = () => {
          built.push(word);
          b.disabled = true;
          output.textContent = built.join(" ");
          check();
        };
        build.append(b);
      }
      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "ghost";
      reset.textContent = "Clear practice sentence";
      reset.onclick = () => {
        built = [];
        for (const b of build.children) b.disabled = false;
        output.textContent = "";
        check();
      };
      practice.append(output, build, reset);
      check();
    } else {
      let answered = new Set();
      for (const [i, prompt, correct, wrong] of [
        [0, "Fruit customers", "هغوی مڼې اخلي.", "موږ مڼې اخلو."],
        [1, "Bread sellers", "هغوی ډوډۍ پلوري.", "تاسې ډوډۍ پلورئ."],
      ]) {
        const line = document.createElement("p");
        line.textContent = prompt;
        practice.append(line);
        for (const text of [correct, wrong]) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "secondary";
          b.lang = "ps";
          b.dir = "rtl";
          b.textContent = text;
          b.onclick = () => {
            if (text === correct) {
              answered.add(i);
              message.textContent = "✓ " + prompt + ": " + correct;
            } else {
              answered.delete(i);
              message.textContent =
                "These people are outside your conversation: use هغوی.";
            }
            ui.$("sovNext").disabled = answered.size !== 2;
          };
          practice.append(b);
        }
      }
    }
  }

  function showGrammar() {
    const loop = state.session.loop;
    LibraryEngine.unlock(state.progress, loop, "lesson");
    storage.save();
    if (loop >= 8) {
      showWeek2Grammar();
      return;
    }
    const host = content.teacherFor(
      loop,
      state.session.loc,
      state.session.mode,
    );
    ui.$("addressTarget").textContent =
      `${host.name} → Player · Grammar workshop`;
    ui.$("addressTarget").classList.remove("hidden");
    if (
      learning.needsOpening(loop, state.session.loc) &&
      state.session.preLessonGrammar
    ) {
      showWeekOpening();
      return;
    }
    if (ui.$("openingPractice"))
      ui.$("openingPractice").classList.add("hidden");
    ui.$("sovNext").disabled = false;
    const workshop = GrammarContent.workshops[loop];
    if (
      workshop &&
      state.session.loc === workshop.place &&
      state.session.preLessonGrammar
    ) {
      ui.$("sovPanel").classList.remove("hidden");
      ui.$("sovDiagram").classList.add("hidden");
      for (const field of [
        "sovStep",
        "sovTitle",
        "sovExplanation",
        "sovNext",
        "guideMessage",
      ])
        ui.$(field).textContent = workshop[field];
      return;
    }
    if (loop === 1) {
      if (!state.progress.personIntros[1]) {
        ui.$("sovPanel").classList.remove("hidden");
        ui.$("sovDiagram").classList.add("hidden");
        ui.$("sovStep").textContent =
          `${content.villagePeople[state.session.loc].name.toUpperCase()} · DAY 1 DESCRIPTION WORKSHOP`;
        ui.$("sovTitle").textContent = "Start with things: “The door is open.”";
        ui.$("sovExplanation").textContent =
          "Our first sentences describe things, not actions. English says “The door is open”. Pashto says دروازه خلاصه ده. The noun comes first, then the description, then the present form of “is”. Use دی with masculine singular nouns, ده with feminine singular nouns, and دي with plural nouns such as اوبه (water). You do not need a separate word for English “it” here. On Day 2 we will learn actions and the S–O–V rule.";
        ui.$("sovNext").textContent = "I understand descriptions →";
        ui.$("guideMessage").textContent =
          "Look at the object, the describing word and the final “is” word.";
        return;
      }
      state.session.phase = "sentence";
      onPhase();
      return;
    }
    // The story-route sentence workshop opens at School, but the optional day challenge can bypass it.
    if (!state.progress.sovSeen || state.session.preLessonGrammar) {
      ui.$("sovPanel").classList.remove("hidden");
      ui.$("sovDiagram").classList.remove("hidden");

      const d =
        GrammarContent.demos[state.session.loc] || GrammarContent.demos.nature;
      const diagram = ui.$("sovDiagram");
      const eng = diagram.querySelectorAll(
        ".sov-flow:first-of-type .sov-word span",
      );
      const pts = diagram.querySelectorAll(
        ".sov-flow:nth-of-type(2) .sov-word .ps",
      );
      const romans = diagram.querySelectorAll(
        ".sov-flow:nth-of-type(2) .sov-word span:last-child",
      );
      eng[1].textContent = d.verb;
      eng[2].textContent = d.object;
      pts[1].textContent = d.psObject;
      pts[2].textContent = d.psVerb;
      romans[1].textContent = d.romanObject;
      romans[2].textContent = d.romanVerb;
      diagram.querySelector(".sov-small").textContent =
        `هغه ${d.psObject} ${d.psVerb}. — He/she ${d.verb} ${d.object}. The verb comes at the end.`;
      ui.$("sovStep").textContent = state.session.preLessonGrammar
        ? "MS HAMEED · DAY 2 SCHOOL LESSON"
        : "THE FRIENDLY GUIDE · FIRST SENTENCE WORKSHOP";
      ui.$("sovTitle").textContent =
        "English uses S–V–O. Pashto usually uses S–O–V.";
      ui.$("sovExplanation").textContent =
        `${state.session.preLessonGrammar ? "Ms Hameed starts your school day with action verbs. Yesterday: “The book is new” describes a thing; today: “He/she reads a book” describes an action. Dictionary forms: لوستل (lostal, to read), لیکل (leekal, to write). The third-person present forms are لولي (lolee, reads) and لیکي (leekee, writes); these are forms of the same two words. " : ""}English says “He/she ${d.verb} ${d.object}”: Subject → Verb → Object. In a simple Pashto action sentence, the object usually comes before the verb: Subject → Object → Verb. Practise with familiar nouns from your bank, such as کتاب (book). The boxes present grammatical order; Pashto script itself is read from right to left.`;
      if (state.session.loop === 2 && state.session.loc === "school") {
        for (const id of ["v-read", "v-write", "s3-read", "s2-school-word"])
          if (content.wordById[id]) learning.libraryExpose(id, "lesson");
        storage.save();
      }
      ui.$("sovNext").textContent = state.session.preLessonGrammar
        ? "Let’s learn the school vocabulary →"
        : "I understand S–O–V →";
      ui.$("guideMessage").textContent = state.session.preLessonGrammar
        ? "Welcome to school! Before our first lesson about actions, learn where Pashto places the verb."
        : "Before building your first sentences, we need one special rule. Watch where the verb goes!";
      return;
    }
    if (!state.progress.personIntros[loop]) {
      ui.$("sovPanel").classList.remove("hidden");
      ui.$("sovDiagram").classList.add("hidden");

      const p = GrammarContent.samples[loop];
      ui.$("sovStep").textContent =
        `${loop === 3 ? "SALEHA" : loop === 4 ? "MUHAMMAD JAN" : loop === 5 ? "MS HAMEED" : "VILLAGE LEARNING"} · DAY ${loop}`;
      ui.$("sovTitle").textContent = `Now speak as “${p[1]}”`;
      ui.$("sovExplanation").textContent =
        `${p[0]} means “${p[1]}”. In the present tense, ${p[2]} can mean “${p[3]}”. ${p[4]} Keep the verb near the end of the sentence, even when the person changes.`;
      ui.$("sovNext").textContent = "Continue to sentences →";
      ui.$("guideMessage").textContent =
        "You already know how sentences are ordered. Now change the verb to match the person who does the action.";
      return;
    }
    state.session.phase = "sentence";
    onPhase();
  }

  return { showWeekOpening, showGrammar };
}
