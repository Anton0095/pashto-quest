/* Contextual expression reference and encounter presentation. */
function createNarrative({ state, content, ui, audio, storage }) {
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
    const options = [
      ...new Set([
        phrase.english,
        ...content.LIBRARY_DATA.phrases
          .filter((p) => p.id !== phrase.id)
          .slice(0, 2)
          .map((p) => p.english),
      ]),
    ];
    // Allocate an attempt only on actual response, not each time a surface is rendered.
    let answered = false;
    for (const option of QuestionEngine.shuffle(options)) {
      box.append(
        ui.button(option, () => {
          if (answered) return;
          answered = true;
          for (const button of box.querySelectorAll("button"))
            button.disabled = true;
          const correct = QuestionEngine.evaluate(
            { kind: "word", direction: "ps-en" },
            { en: phrase.english },
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
          box.append(
            ui.node(
              "p",
              correct
                ? "Correct. Recognition saved; no XP awarded."
                : "Meaning: " + phrase.english,
              "notice",
            ),
          );
        }),
      );
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
        `${phrase.speaker} → Player · ${place}${phrase.optional ? " · Optional cultural content" : ""}`,
        "eyebrow",
      ),
    );
    if (!phrase.active) {
      card.append(ui.node("p", `${phrase.speaker}: “${phrase.english}”`));
      card.append(
        ui.node(
          "p",
          "Pashto teaching for this expression is pending translation and grammatical review. It is not acquired, assessed or counted as a new word.",
          "tiny",
        ),
      );
      return card;
    }
    const ps = ui.node("p", phrase.pashto, "library-pashto");
    ps.lang = "ps";
    ps.dir = "rtl";
    card.append(
      ps,
      ui.node("p", `${phrase.romanisation} — ${phrase.english}`),
      ui.node(
        "p",
        "Fixed expression · approximate romanisation; native Laghman review pending.",
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
    // Announce the encounter without pre-teaching the English answer or
    // acquiring the expression before the first location study card.
    const phrase = content.NARRATIVE_DATA.expressions.find(
      (p) => p.day === day && day > 1 && p.active && !p.optional,
    );
    if (phrase)
      root.append(
        ui.node(
          "p",
          `${phrase.speaker} will teach you a new greeting today. Meet the village teachers to study it as the first card.`,
          "tiny muted",
        ),
      );
  }
  function renderLessonExpression(day, location, mode) {
    let root = ui.$("lessonExpression");
    if (!root) {
      root = ui.node("div");
      root.id = "lessonExpression";
      ui.$("audioStatus").after(root);
    }
    root.replaceChildren();
    if (mode !== "standard") return;
    // An active greeting is shown by the standard study/recall sequence.
    // Inactive expressions cannot appear as Pashto teaching or challenge items.
    const pending = content.NARRATIVE_DATA.expressions.find(
      (p) => p.day === day && p.location === location && !p.active,
    );
    if (pending)
      root.append(
        ui.node(
          "p",
          "Another location expression awaits an approved Pashto translation and cannot yet be studied.",
          "tiny muted",
        ),
      );
  }

  return {
    appendPhrasePractice,
    expressionDialogue,
    renderDayExpression,
    renderLessonExpression,
  };
}
