/* Contextual expression reference and encounter presentation. */
function createNarrative({ state, content, ui, audio, storage, questions }) {
  /* Character dialogue uses the same expression units, scheduler and audio as the tutorial. */
  function appendPhrasePractice(container, phrase, source, day = state.day) {
    const box = ui.node("div", undefined, "phrase-practice");
    const record = LibraryEngine.cardStat(
      state.progress,
      content.LIBRARY_DATA,
      phrase.id,
    );
    box.append(
      ui.node(
        "p",
        record.totalAttempts
          ? `Recognition: ${record.correctAttempts}/${record.totalAttempts} · ${record.srsDueAt <= Date.now() ? "due for review" : "review scheduled"}`
          : "Practise recognising this fixed expression (optional):",
      ),
    );
    const options = questions.distractors(content.wordById[phrase.id]);
    // Allocate an attempt only on actual response, not each time a surface is rendered.
    let answered = false;
    for (const option of QuestionEngine.shuffle(options)) {
      const button = ui.button(ui.englishChoice(option), () => {
          if (answered) return;
          answered = true;
          ui.showAnswerFeedback(box, phrase.english, option, {accepts:v => QuestionEngine.evaluate({kind:"word", direction:"ps-en"}, content.wordById[phrase.id], v)});
          const correct = QuestionEngine.evaluate(
            { kind: "word", direction: "ps-en" },
            content.wordById[phrase.id],
            option,
          );
          LibraryEngine.practise(
            state.progress,
            content.LIBRARY_DATA,
            phrase.id,
            correct,
            {
              day,
              location: phrase.location || "library",
              source,
              eventId: "phrase:" + ++state.progress.library.attemptSequence,
            },
          );
          // Expressions grant no XP. Repeated display preserves the first encounter.
          storage.save();
          const feedback=ui.node('div');box.append(feedback);
          ui.renderAnswerFeedback(feedback,content.wordById[phrase.id],{},correct);
        });
      button.dataset.answer = option;
      box.append(button);
    }
    container.append(box);
  }
  function expressionDialogue(phrase, source) {
    const card = ui.node("article", undefined, "narrative-expression");
    card.dataset.expression = phrase.id;
    card.setAttribute(
      "aria-label",
      `${phrase.speaker}'s ${phrase.optional ? "optional cultural expression" : "greeting"}`,
    );
    const place = LibraryEngine.scene(phrase.location).displayName;
    card.append(
      ui.node(
        "p",
        `${phrase.promptPhraseId && phrase.id === phrase.responsePhraseId ? "Player → " + phrase.speaker : phrase.speaker + " → Player"} · ${place}${phrase.optional ? " · Optional cultural content" : ""}`,
        "eyebrow",
      ),
    );
    if (phrase.promptPhraseId && phrase.id === phrase.responsePhraseId) {
      const prompt = content.wordById[phrase.promptPhraseId];
      const line = ui.node("p", `${phrase.speaker}: ${prompt.ps} (${prompt.roman} — ${prompt.en})`);
      card.append(line);
    }
    const ps = ui.node("p", phrase.pashto, "library-pashto");
    ps.lang = "ps";
    ps.dir = "rtl";
    card.append(
      ps,
      ui.node("p", `${phrase.romanisation} — ${phrase.english}`),
      ui.node(
        "p",
        "User-approved expression and transliteration; no independent native certification.",
        "tiny",
      ),
      ui.button("🔊 Hear " + phrase.english, () =>
        audio.speak(phrase.audioContentId),
      ),
    );
    const audioNotice = ui.node(
      "p",
      "Pronunciation depends on a bundled recording or available Pashto voice.",
      "tiny",
    );
    audioNotice.dataset.expressionAudioStatus = "";
    audioNotice.setAttribute("role", "status");
    card.append(audioNotice);
    LibraryEngine.expose(state.progress, content.LIBRARY_DATA, phrase.id, {
      day: phrase.day,
      source,
      location: phrase.location,
    });
    if (phrase.responsePhraseId && phrase.responsePhraseId !== phrase.id) {
      const response = content.LIBRARY_DATA.phrases.find(p => p.id === phrase.responsePhraseId);
      const line = ui.node("p", `Player replies: ${response.pashto} (${response.romanisation} — ${response.english})`);
      line.dataset.responsePhrase = response.id;
      card.append(line);
      LibraryEngine.expose(state.progress, content.LIBRARY_DATA, response.id, {day:phrase.day,source,location:phrase.location});
    }
    appendPhrasePractice(card, phrase, source, phrase.day);
    storage.save();
    return card;
  }
  function renderDayExpression(day) {
    let root = ui.$("dayExpression");
    if (!root) {
      root = ui.node("div");
      root.id = "dayExpression";
      ui.$("skipDayArea").before(root);
    }
    root.replaceChildren();
    const phrase = content.NARRATIVE_DATA.expressions.find(
      (p) => p.day === day && day > 1 && p.active,
    );
    if (phrase) root.append(expressionDialogue(phrase, "day-opening"));
  }

  return {
    appendPhrasePractice,
    expressionDialogue,
    renderDayExpression,
  };
}
