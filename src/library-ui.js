/* Reference dialog: vocabulary, forms, grammar, expressions, voluntary practice and pace controls. */
function createLibraryUI({
  state,
  content,
  ui,
  audio,
  storage,
  narrative,
  learning,
  questions,
}) {
  let libraryLastFocus = null;
  function openLibrary(tab = "vocabulary") {
    audio.stopAudio();
    libraryLastFocus = document.activeElement;
    renderLibrary(tab);
    ui.$("libraryDialog").showModal();
    ui.$("libraryClose").focus();
  }
  function closeLibrary() {
    ui.$("libraryDialog").close();
  }
  function renderLibrary(tab) {
    audio.stopAudio();
    const root = ui.$("libraryBody");
    root.replaceChildren();
    ui.$("libraryDialog").dataset.tab = tab;
    for (const b of document.querySelectorAll("[data-library-tab]"))
      b.setAttribute("aria-pressed", String(b.dataset.libraryTab === tab));
    if (tab === "pace") {
      renderLibraryPace(root);
      return;
    }
    if (tab === "grammar") {
      root.append(
        ui.node("h3", "Grammar Journal"),
        ui.node(
          "p",
          "Rules unlock when their lesson workshop is shown, after word/form study. Challenges do not unlock grammar. Examples also require individually studied forms. Native Laghman review is pending.",
        ),
      );
      for (const rule of content.curriculum.days) {
        const grammarId = "grammar-day-" + rule.day;
        const unlocked = state.progress.library.grammar[grammarId],
          detail = ui.node("details");
        const heading = ui.node(
          "summary",
          `Day ${rule.day}: ${rule.topic}${unlocked ? "" : " · Locked"}`,
        );
        detail.append(heading);
        if (unlocked) {
          detail.append(...rule.grammar.map((text) => ui.node("p", text)));
          const ex = learning
            .availableSentences(state.day)
            .find((c) => c.generated.requiredGrammarIds.includes(grammarId));
          if (ex) {
            content.registerGenerated(ex);
            learning.surface(ex.id, "grammar-reference");
            const ps = ui.node("p", ex.ps, "library-pashto");
            ps.lang = "ps";
            ps.dir = "rtl";
            detail.append(ps, ui.node("p", ex.roman + " — " + ex.en));
            ui.sentenceContext(ex, "", detail, "reference");
          } else
            detail.append(
              ui.node(
                "p",
                "Study compatible forms before an example can be generated.",
              ),
            );
        } else {
          detail.append(
            ui.node(
              "p",
              "Visit this grammar workshop in a lesson to read its generated examples.",
            ),
          );
        }
        root.append(detail);
      }
      return;
    }
    if (tab === "phrases") {
      root.append(ui.node("h3", "Useful Expressions / Greetings"));
      const phrases = content.LIBRARY_DATA.phrases.filter(
        (p) => state.progress.library.phrases[p.id],
      );
      if (!phrases.length)
        root.append(
          ui.node(
            "p",
            "Your greetings will appear here as you meet Muhammad Jan at the Library.",
          ),
        );
      for (const p of phrases) {
        learning.surface(p.id, "phrase-reference");
        const card = ui.node("article", undefined, "library-entry");
        const ps = ui.node("p", p.pashto, "library-pashto");
        ps.dir = "rtl";
        ps.lang = "ps";
        card.append(
          ps,
          ui.node("p", p.romanisation + " — " + p.english),
          ui.button("Pronunciation (if available)", () => audio.speak(p.id)),
        );
        card.dataset.phrase = p.id;
        card.append(
          ui.node(
            "p",
            "Fixed expression · native Laghman review pending. Inflections/components add no district words.",
            "tiny",
          ),
        );
        narrative.appendPhrasePractice(card, p, "review");
        root.append(card);
      }
      return;
    }
    const universal = tab === "universal";
    root.append(
      ui.node("h3", universal ? "Universal Vocabulary" : "Vocabulary Bank"),
    );
    if (universal)
      root.append(
        ui.node(
          "p",
          "Universal words can occur in every district and never consume a district quota. Each lexical identity counts once; expressions have their own collection.",
        ),
      );
    const sum = LibraryEngine.summary(state.progress, content.LIBRARY_DATA);
    const encounteredUniversal = content.LIBRARY_DATA.entries.filter(
      (e) =>
        e.vocabularyClass === "universal" &&
        state.progress.library.acquired[e.lemmaId],
    ).length;
    root.append(
      ui.node(
        "p",
        universal
          ? `${encounteredUniversal} encountered universal lemmas · ${sum.encountered + encounteredUniversal} distinct lexical lemmas overall. Universal words never consume district quotas.`
          : `${sum.encountered} encountered · ${sum.practised} practised · ${sum.mastered} mastered content lemmas. ${encounteredUniversal} universal lemmas appear separately. Inflections count under one entry.`,
        "notice",
      ),
    );
    const plan = state.progress.library.plans[state.day];
    if (plan) {
      const tally = LibraryEngine.tallies(
          state.progress,
          content.LIBRARY_DATA,
          state.day,
        ),
        ids = tally.scheduledNewLemmas,
        seen = tally.actuallyEncounteredScheduledLemmas.length,
        actual = tally.incidentalStoryLemmas.length;
      root.append(
        ui.node(
          "p",
          `Day ${state.day}: ${ids.length} scheduled · ${seen} scheduled lemmas actually encountered. ${actual} incidental story lemmas · ${tally.reviewedExistingLemmas.length} existing lemmas revisited · ${tally.masteredLemmas.length} mastered. Story exposure is separate from your assigned target. ${plan.contentGap ? plan.notice : ""}`,
        ),
      );
    }
    const filters = ui.node("div", undefined, "library-filters");
    function select(label, id, values) {
      const wrap = ui.node("label", label + " "),
        input = ui.node("select");
      input.id = id;
      for (const [value, text] of values) {
        const o = ui.node("option", text);
        o.value = value;
        input.append(o);
      }
      wrap.append(input);
      filters.append(wrap);
      return input;
    }
    const searchLabel = ui.node("label", "Search "),
      search = ui.node("input");
    search.id = "librarySearch";
    search.type = "search";
    search.placeholder = "Pashto, romanisation or meaning";
    searchLabel.append(search);
    filters.append(searchLabel);
    const pos = select("Part of speech", "libraryPos", [
      ["", "All"],
      ...[...new Set(content.LIBRARY_DATA.entries.map((e) => e.partOfSpeech))]
        .sort()
        .map((x) => [x, x]),
    ]);
    const day = select("First encounter", "libraryDay", [
      ["", "All days"],
      ...content.curriculum.days.map((day) => [
        String(day.day),
        "Day " + day.day,
      ]),
    ]);
    const location = select("Location", "libraryLocation", [
      ["", "All"],
      ...[
        "residential",
        "business",
        "nature",
        "school",
        "challenge",
        "library",
      ].map((x) => [x, x]),
    ]);
    const status = select("Status", "libraryStatus", [
      ["", "All"],
      ["encountered", "Encountered, not yet studied"],
      ["introduced", "Introduced"],
      ["practised", "Practised"],
      ["mastered", "Mastered"],
      ["due", "Needs revision"],
    ]);
    const sort = select("Sort", "librarySort", [
      ["meaning", "Meaning"],
      ["day", "Encounter day"],
      ["due", "Revision due"],
    ]);
    root.append(filters);
    const list = ui.node("div");
    list.id = "libraryEntries";
    root.append(list);
    function update() {
      list.replaceChildren();
      const query = search.value.trim().toLocaleLowerCase();
      let entries = content.LIBRARY_DATA.entries.filter((e) => {
        const r = state.progress.library.acquired[e.lemmaId];
        return (
          r &&
          (e.vocabularyClass === "universal") === universal &&
          (!query ||
            [e.displayLemmaPs, e.romanisation, ...e.englishSenses]
              .join(" ")
              .toLocaleLowerCase()
              .includes(query)) &&
          (!pos.value || e.partOfSpeech === pos.value) &&
          (!day.value || String(r.firstEncounteredDay) === day.value) &&
          (!location.value || r.firstEncounteredLocation === location.value) &&
          (!status.value ||
            (status.value === "due"
              ? r.srsDueAt <= Date.now()
              : LibraryEngine.status(r) === status.value))
        );
      });
      entries.sort((a, b) =>
        sort.value === "day"
          ? state.progress.library.acquired[a.lemmaId].firstEncounteredDay -
            state.progress.library.acquired[b.lemmaId].firstEncounteredDay
          : sort.value === "due"
            ? state.progress.library.acquired[a.lemmaId].srsDueAt -
              state.progress.library.acquired[b.lemmaId].srsDueAt
            : a.englishSenses[0].localeCompare(b.englishSenses[0]),
      );
      if (!entries.length)
        list.append(
          ui.node(
            "p",
            Object.keys(state.progress.library.acquired).length
              ? "No entries match these filters."
              : "Your bank is empty. Words appear when you encounter them in a lesson or challenge; planning a day does not teach its words.",
          ),
        );
      for (const e of entries) list.append(libraryEntry(e));
    }
    for (const input of [search, pos, day, location, status, sort])
      input.addEventListener("input", update);
    update();
  }
  function libraryEntry(e) {
    const r = state.progress.library.acquired[e.lemmaId],
      detail = ui.node("details", undefined, "library-entry"),
      heading = ui.node("summary");
    const ps = ui.node("span", e.displayLemmaPs, "library-pashto");
    ps.lang = "ps";
    ps.dir = "rtl";
    detail.dataset.lemma = e.lemmaId;
    heading.append(
      ps,
      ui.node(
        "span",
        ` ${e.romanisation} · ${e.englishSenses.join("; ")} · ${e.partOfSpeech} · ${LibraryEngine.status(r)}`,
      ),
    );
    detail.append(heading);
    detail.append(
      ui.node(
        "p",
        `Planned introduction: Day ${e.introduction.day} · ${e.introduction.district}. ${r.formallyIntroducedDay ? "First word/form study: Day " + r.formallyIntroducedDay : "Not yet formally studied"}. Native language review pending.`,
        "tiny",
      ),
    );
    detail.append(
      ui.node(
        "p",
        `First encountered: Day ${r.firstEncounteredDay} · ${r.firstEncounteredSource} · ${r.firstEncounteredLocation}. ${r.correctAttempts}/${r.totalAttempts} correct attempts. ${r.srsDueAt <= Date.now() ? "Due for revision." : "Revision scheduled."}`,
        "tiny",
      ),
    );
    for (const f of e.forms.filter((f) =>
      r.encounteredFormIds.includes(f.formId),
    )) {
      const box = ui.node("div", undefined, "library-form"),
        text = ui.node("p", f.pashto, "library-pashto");
      text.lang = "ps";
      text.dir = "rtl";
      box.append(
        text,
        ui.node(
          "p",
          `${f.englishGloss} · ${Object.entries(f.morphology)
            .map(
              ([k, v]) =>
                k +
                ": " +
                (v == null
                  ? "not yet reviewed"
                  : Array.isArray(v)
                    ? v.join("/")
                    : v),
            )
            .join(", ")}`,
        ),
        ui.node(
          "p",
          f.romanisation || "Isolated-form romanisation pending review.",
        ),
        ui.node("p", "Native review pending.", "tiny"),
      );
      if (f.audioContentId)
        box.append(
          ui.button("Pronunciation (if available)", () =>
            audio.speak("library-form:" + f.formId),
          ),
        );
      detail.append(box);
    }
    detail.addEventListener("toggle", () => {
      if (!detail.open || detail.dataset.generatedExample) return;
      const ex = learning
        .availableSentences(state.day)
        .find((c) =>
          Object.values(c.generated.slots).some((r) => r.lemmaId === e.lemmaId),
        );
      if (ex) {
        content.registerGenerated(ex);
        learning.surface(ex.id, "vocabulary-reference");
        const ps = ui.node("p", ex.ps, "library-pashto");
        ps.lang = "ps";
        ps.dir = "rtl";
        detail.append(ps, ui.node("p", ex.roman + " — " + ex.en));
        ui.sentenceContext(ex, "", detail, "reference");
        detail.dataset.generatedExample = ex.id;
      }
    });
    detail.append(
      ui.button("Practise an encountered form", () =>
        libraryVoluntaryPractice(e, detail),
      ),
    );
    return detail;
  }
  function libraryVoluntaryPractice(e, container) {
    if (!LibraryEngine.allowedOnDay(e, state.day)) {
      container.append(
        ui.node(
          "p",
          "Action-verb practice begins on Day 2. Your existing vocabulary history is retained.",
        ),
      );
      return;
    }
    const r = state.progress.library.acquired[e.lemmaId],
      form = e.forms.find((f) => r.encounteredFormIds.includes(f.formId));
    if (!form) return;
    const exercise = ui.node("div");
    exercise.append(ui.node("p", "Choose the meaning of " + form.pashto));
    const options = questions.distractors(content.wordById["library-form:" + form.formId]);
    let answered = false;
    for (const option of QuestionEngine.shuffle(options)) {
      const b = ui.button(option, () => {
        if (answered) return;
        answered = true;
        const eventId = "library-practice:" + ++state.progress.library.attemptSequence;
        ui.showAnswerFeedback(exercise, form.englishGloss, option);
        const correct = QuestionEngine.evaluate(
          { kind: "word", direction: "ps-en" },
          { en: form.englishGloss },
          option,
        );
        LibraryEngine.practise(
          state.progress,
          content.LIBRARY_DATA,
          "library-form:" + form.formId,
          correct,
          { day: state.day, source: "review", location: "library", eventId },
        );
        storage.save();
        ui.hud();
        const label = container.querySelector("summary span:last-child");
        if (label)
          label.textContent = ` ${e.romanisation} · ${e.englishSenses.join("; ")} · ${e.partOfSpeech} · ${LibraryEngine.status(state.progress.library.acquired[e.lemmaId])}`;
        exercise.append(
          ui.node(
            "p",
            correct
              ? "Correct. Practice recorded; no XP is awarded for Library review."
              : "Review: " + form.englishGloss,
          ),
        );
      });
      b.classList.add("choice");
      b.dataset.answer = option;
      exercise.append(b);
    }
    container.append(exercise);
  }
  function renderLibraryPace(root) {
    const plan = state.progress.library.plans[state.day],
      current = plan?.effectiveDailyTarget;
    const next = LibraryEngine.nextUnstartedDay(state.progress, state.day);
    root.append(
      ui.node("h3", "Learning Pace"),
      ui.node(
        "p",
        `Current Day ${state.day}: ${plan ? (current !== null && current !== undefined ? current + " new scheduled content lemmas" : "content gap; " + Object.values(plan.locationAssignments).flat().length + " available scheduled lemmas") : "not started"}. Requested pace: ${paceSummary(state.progress.library.requestedDailyTarget)}.`,
      ),
    );
    root.append(
      ui.node(
        "p",
        `Changes apply to ${next <= 14 ? "Day " + next + " before its first lesson or challenge" : "future content"}. Existing assignments remain unchanged. Eligible words follow curated teaching order; future-day vocabulary is not pulled forward to fill gaps.`,
      ),
      ui.node("p", content.LIBRARY_DATA.contentNotice, "notice"),
    );
    root.append(
      ui.node(
        "p",
        `${content.LIBRARY_DATA.inventorySummary.activeContentLemmas} district draft lemmas are active; promoted entries remain provisional and unchecked. Native review is pending.`,
      ),
    );
    const message = ui.node("p");
    message.id = "libraryPaceFeedback";
    message.setAttribute("role", "status");
    for (const target of LibraryEngine.presets) {
      const b = ui.button(`${paceSummary(target)}`, () => {
        const result = LibraryEngine.setPace(state.progress, target, state.day);
        if (result.ok) {
          storage.save();
          renderOnboardingPace();
          renderLibrary("pace");
          ui.$("libraryPaceFeedback").textContent =
            `Selected ${target}/day, starting Day ${result.day}.`;
        } else message.textContent = result.reason;
      });
      b.dataset.pace = String(target);
      b.disabled = next > content.curriculum.days.length;
      b.setAttribute(
        "aria-pressed",
        String(state.progress.library.requestedDailyTarget === target),
      );
      root.append(b);
    }
    if (next > content.curriculum.days.length)
      root.append(
        ui.node(
          "p",
          "All fourteen day plans have started. Their assignments stay fixed; you can continue visits, challenges and revision.",
        ),
      );
    root.append(message);
  }
  function paceSummary(target) {
    return `${target}/day requested · ${target / LibraryEngine.places.length} per teaching location`;
  }
  function renderOnboardingPace() {
    const choices = ui.$("onboardingPace") || ui.node("div");
    choices.id = "onboardingPace";
    choices.replaceChildren();
    choices.append(
      ui.node("h3", "Choose your learning pace"),
      ui.node(
        "p",
        `Default: ${paceSummary(LibraryEngine.state().requestedDailyTarget)}. District vocabulary remains a development draft; shortages are shown in the day plan.`,
      ),
    );
    const feedback = ui.node(
      "p",
      paceSummary(state.progress.library.requestedDailyTarget),
    );
    feedback.id = "onboardingPaceFeedback";
    feedback.setAttribute("role", "status");
    choices.append(
      ui.node(
        "p",
        "Available district-word paces: " +
          LibraryEngine.presets.join(" or ") +
          "/day. Universal grammar words and forms are shown separately. At pace 0 or 4, Day 1 Home cannot yet make two sentences: word/grammar practice adapts without extra district words. Choose 0 for a review day.",
      ),
    );
    for (const target of LibraryEngine.presets) {
      const b = ui.button(target + "/day", () => {
        const result = LibraryEngine.setPace(state.progress, target, 1);
        if (result.ok) {
          storage.save();
          renderOnboardingPace();
        } else feedback.textContent = result.reason;
      });
      b.dataset.onboardingPace = String(target);
      b.setAttribute(
        "aria-pressed",
        String(state.progress.library.requestedDailyTarget === target),
      );
      choices.append(b);
    }
    choices.append(feedback);
    if (!choices.isConnected)
      ui.$("introScreen").insertBefore(choices, ui.$("startTutorial"));
  }
  function prepareOnboarding() {
    renderOnboardingPace();
    ui.$("introScreen").insertBefore(
      document.querySelector(".worldmap"),
      ui.$("introScreen").querySelector(".guide-row"),
    );
    for (const marker of document.querySelectorAll(
      ".map-point:not(.library)",
    )) {
      marker.disabled = true;
      marker.classList.remove("done", "checkin");
      marker.querySelector("b").textContent = ui.displayPlace(
        marker.dataset.place,
      );
      marker.querySelector("small").textContent =
        "Complete the Library welcome";
    }
  }
  function libraryInit() {
    const dialog = ui.node("dialog");
    dialog.id = "libraryDialog";
    dialog.setAttribute("aria-labelledby", "libraryTitle");
    const heading = ui.node("h2", "📚 Village Library");
    heading.id = "libraryTitle";
    const close = ui.button("Close Library", closeLibrary);
    close.id = "libraryClose";
    const nav = ui.node("nav");
    nav.setAttribute("aria-label", "Library pages");
    for (const [tab, label] of [
      ["vocabulary", "Vocabulary Bank"],
      ["universal", "Universal Vocabulary"],
      ["grammar", "Grammar Journal"],
      ["pace", "Learning Pace"],
      ["phrases", "Useful Expressions"],
    ]) {
      const b = ui.button(label, () => renderLibrary(tab));
      b.dataset.libraryTab = tab;
      nav.append(b);
    }
    const body = ui.node("div");
    body.id = "libraryBody";
    const audioNotice = ui.node(
      "p",
      "Pronunciation uses an available Pashto asset or device voice; native Laghman recordings are not bundled.",
      "tiny",
    );
    audioNotice.id = "libraryAudioStatus";
    audioNotice.setAttribute("role", "status");
    dialog.append(heading, close, nav, audioNotice, body);
    document.body.append(dialog);
    new MutationObserver(() => {
      audioNotice.textContent = ui.$("audioStatus").textContent;
    }).observe(ui.$("audioStatus"), {
      childList: true,
      subtree: true,
      characterData: true,
    });
    dialog.addEventListener("close", () => {
      audio.stopAudio(); // Includes the native Escape/cancel path.
      libraryLastFocus?.focus();
    });
    const navButton = ui.button("📚 Library", () => openLibrary());
    navButton.id = "navLibrary";
    navButton.className = "ghost";
    document.querySelector("header .hud").prepend(navButton);
    const marker = ui.button("", () => openLibrary());
    marker.className = "map-point library";
    marker.dataset.place = "library";
    marker.append(
      ui.node("span", "📚", "micon"),
      ui.node("b", "Library"),
      ui.node("small", "Always open"),
    );
    document.querySelector(".worldmap").append(marker);
    if (!state.progress.tutorialDone) prepareOnboarding();
    else renderOnboardingPace();
  }

  return { openLibrary, closeLibrary, libraryInit, prepareOnboarding };
}

