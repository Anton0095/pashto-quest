const libraryEntries = Object.fromEntries(
  LIBRARY_DATA.entries.map((e) => [e.lemmaId, e]),
);
for (const phrase of LIBRARY_DATA.phrases) {
  wordById[phrase.id] ||= {
    id: phrase.id, loop: phrase.day || 0, type: "greeting",
    ps: phrase.pashto, roman: phrase.romanisation, en: phrase.english,
    place: phrase.location || "library",
    note: "Fixed expression; provisional romanisation, native Laghman review pending.", dialect: "",
  };
  LIBRARY_DATA.cardTypes[phrase.id] = "greeting";
}
for (const entry of LIBRARY_DATA.entries) {
  const form = entry.forms[0],
    id = "library-card:" + entry.lemmaId;
  wordById[id] = {
    id,
    loop: 1,
    place: entry.primaryDistrict,
    type: entry.partOfSpeech,
    ps: form.pashto,
    roman: form.romanisation,
    en: entry.englishSenses[0],
    note: "Existing authored draft vocabulary. Native Laghman review pending.",
    dialect: "",
  };
  LIBRARY_DATA.cardTypes[id] = entry.partOfSpeech;
  LIBRARY_DATA.sourceMappings[id] = [
    { lemmaId: entry.lemmaId, formId: form.formId },
  ];
}
for (const entry of LIBRARY_DATA.entries)
  for (const form of entry.forms) {
    const id = "library-form:" + form.formId;
    wordById[id] = {
      id,
      loop: 1,
      place: entry.primaryDistrict,
      type: entry.partOfSpeech,
      ps: form.pashto,
      roman: form.romanisation || "",
      en: form.englishGloss,
      note: "Attested form · native review pending.",
      dialect: "",
    };
    LIBRARY_DATA.cardTypes[id] = entry.partOfSpeech;
    LIBRARY_DATA.sourceMappings[id] = [
      { lemmaId: entry.lemmaId, formId: form.formId },
    ];
  }
/* Library is a reference dialog. Opening it never changes lesson/quiz state or earns XP. */
function libraryContext(source, contentId) {
  return {
    day: session?.loop || selectedLoop,
    source,
    location:
      session?.loc || (source === "challenge" ? "challenge" : "library"),
    contentId,
  };
}
function libraryExpose(id, source) {
  LibraryEngine.expose(progress, LIBRARY_DATA, id, libraryContext(source, id));
}
function libraryPractice(id, correct, eventId, source) {
  LibraryEngine.practise(progress, LIBRARY_DATA, id, correct, {
    ...libraryContext(source, id),
    eventId,
  });
}
function libraryLessonPool(day, place) {
  const plan = LibraryEngine.ensurePlan(progress, LIBRARY_DATA, day),
    assigned = plan.locationAssignments[place] || [];
  const lexical = assigned.map((id) => "library-card:" + id);
  const original =
    LIBRARY_DATA.lessonSentenceTargets?.[day]?.[place] ||
    (courses[day + "-" + place] || []).filter(
      (id) => wordById[id]?.type === "sentence",
    );
  const grammar = (courses[day + "-" + place] || []).filter(
    (id) =>
      wordById[id]?.type !== "sentence" &&
      (LIBRARY_DATA.sourceMappings[id] || []).some(
        (r) => !libraryEntries[r.lemmaId].countsTowardDailyQuota,
      ),
  );
  // Fixed authored sentences preserve grammar, roles and stories; no unreviewed substitutions.
  const review = LibraryEngine.dueForms(progress, LIBRARY_DATA)
    .filter(({ entry }) => LibraryEngine.allowedOnDay(entry, day))
    .slice(0, 2)
    .map(({ form }) => "library-form:" + form.formId);

  const actionIntro = day === 2 && place === "school" ? ["v-read", "v-write"] : [];
  // Use a location's active expression, otherwise repeat this day's active
  // greeting. Pending translations remain unavailable. Expressions do not
  // consume lexical quotas, even when repeated at multiple locations.
  const greeting = NARRATIVE_DATA.expressions.find(
    (p) => p.day === day && p.location === place && p.active && !p.optional,
  ) || NARRATIVE_DATA.expressions.find(
    (p) => p.day === day && p.active && !p.optional,
  );
  const opening = greeting ? [greeting.id] : [];
  return [...new Set([...opening, ...actionIntro, ...lexical, ...grammar, ...review, ...original])]
    .filter((id) => LibraryEngine.cardAllowed(LIBRARY_DATA, id, day));
}
function prependChallengeGreetings(day, questions) {
  const greetings = NARRATIVE_DATA.expressions.filter(
    (p) => p.day === day && p.active && !p.optional && wordById[p.id],
  );
  if (!greetings.length) return questions;
  const remaining = questions.map((q) => ({ ...q }));
  const greetingIds = new Set(greetings.map((p) => p.id));
  for (const p of greetings) {
    const existing = remaining.findIndex((q) => q.id === p.id);
    if (existing >= 0) {
      remaining.splice(existing, 1);
      continue;
    }
    const wordSlot = remaining.findIndex(
      (q) => q.kind === "word" && !greetingIds.has(q.id),
    );
    const otherSlot = remaining.findIndex(
      (q) => q.kind === "sentence" && !greetingIds.has(q.id),
    );
    const target = wordSlot >= 0 ? wordSlot : otherSlot;
    if (target < 0) throw Error("Day " + day + " has no greeting assessment slot");
    remaining.splice(target, 1);
  }
  const opening = greetings.map((p) => ({
    id: p.id, kind: "word", direction: "ps-en",
    vocabularyOrigin: "daily-greeting", speaker: p.speaker,
    recipient: p.recipient, comment: "Recognise today's greeting.",
  }));
  const result = [...opening, ...remaining];
  if (result.length !== questions.length) throw Error("Greeting changed challenge length");
  return result;
}
function libraryChallengeQuestions(day, questions) {
  if (day === 3) return prependChallengeGreetings(day, questions); // Preserve dinner story and length.
  const plan = LibraryEngine.ensurePlan(progress, LIBRARY_DATA, day);
  const selection = LibraryEngine.lexicalSelection(
      progress,
      LIBRARY_DATA,
      day,
      30,
    ),
    used = new Set(questions.map((q) => q.id)),
    result = questions.map((q) => ({ ...q }));
  for (const q of result) {
    if (q.kind !== "word") continue;
    const picked = selection.find(
      (x) => !used.has("library-card:" + x.lemmaId),
    );
    if (!picked) {
      q.vocabularyOrigin = "authored-fallback";
      q.comment =
        "Context scaffold: this word may be unfamiliar; use the supplied meaning and options.";
      continue;
    }
    q.id = "library-card:" + picked.lemmaId;
    used.add(q.id);
    q.lemmaId = picked.lemmaId;
    q.vocabularyOrigin = picked.origin;
    q.comment =
      picked.origin === "scheduled-scaffold"
        ? "Scheduled word, not yet studied: use the meaning and answer options."
        : "Recall from your encountered bank · " + picked.origin;
  }
  for (const q of result)
    if (q.kind !== "word")
      q.scaffold =
        "Authored grammar/story context; unfamiliar vocabulary is supported by the translation and answer feedback.";
  const withGreetings = prependChallengeGreetings(day, result);
  plan.assessmentMix = withGreetings.reduce((out, q) => {
    const key = q.vocabularyOrigin || "authored-grammar";
    out[key] = (out[key] || 0) + 1;
    return out;
  }, {});

  return withGreetings;
}
function captureLibraryChallenge() {
  if (!session || session.mode !== "challenge") return;
  if (session.finished) {
    delete progress.activeChallenge;
    return;
  }
  const snapshot = { ...session };
  progress.activeChallenge = JSON.parse(JSON.stringify(snapshot));
}
function restoreLibraryChallenge() {
  const s = progress.activeChallenge;
  if (
    !s ||
    s.mode !== "challenge" ||
    s.finished ||
    !allowed(s.loop) ||
    !Array.isArray(s.questions) ||
    s.questions.length !== getChallengeSpec(s.loop).questionCount ||
    !Number.isInteger(s.index) ||
    s.index < 0 ||
    s.index >= s.questions.length
  )
    return false;
  const snapshot = JSON.parse(JSON.stringify(s));
  const replacements = selectChallenge(s.loop);
  const replacedCurrent = !LibraryEngine.cardAllowed(LIBRARY_DATA, snapshot.questions[snapshot.index].id, s.loop);
  snapshot.questions = snapshot.questions.map((q, index) =>
    LibraryEngine.cardAllowed(LIBRARY_DATA, q.id, s.loop) ? q : replacements[index]);
  if (replacedCurrent) snapshot.built = [];
  startChallenge(s.loop, true);
  session = { ...snapshot };
  const built = [...(session.built || [])],
    locked = session.locked;
  const answered = session.answered,
    correctCount = session.correctCount,
    earned = session.earned;
  showChallengeQuestion();
  session.built = built;
  if (locked) {
    // Recreate submitted feedback without a second practice, score or XP event.
    session.locked = false;
    session.restoring = true;
    answerChallenge(snapshot.submittedAnswer);
    if (replacedCurrent)
      $("quizFeedback").textContent = "Your earlier response and score remain saved. This Day 1 action prompt has been replaced with description vocabulary; continue without another submission.";
    delete session.restoring;
    session.answered = answered;
    session.correctCount = correctCount;
    session.earned = earned;
  } else if (
    ["construct", "dialogue"].includes(session.questions[session.index].kind)
  )
    renderBuiltSentence();
  save();
  return true;
}
function libraryNode(tag, text, cls) {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}
function libraryButton(text, fn) {
  const b = libraryNode("button", text, "secondary");
  b.type = "button";
  b.addEventListener("click", fn);
  return b;
}
let libraryLastFocus = null;
function openLibrary(tab = "vocabulary") {
  stopAudio();
  libraryLastFocus = document.activeElement;
  renderLibrary(tab);
  $("libraryDialog").showModal();
  $("libraryClose").focus();
}
function closeLibrary() {
  stopAudio();
  $("libraryDialog").close();
  libraryLastFocus?.focus();
}
function renderLibrary(tab) {
  stopAudio();
  const root = $("libraryBody");
  root.replaceChildren();
  $("libraryDialog").dataset.tab = tab;
  for (const b of document.querySelectorAll("[data-library-tab]"))
    b.setAttribute("aria-pressed", String(b.dataset.libraryTab === tab));
  if (tab === "pace") {
    renderLibraryPace(root);
    return;
  }
  if (tab === "grammar") {
    root.append(
      libraryNode("h3", "Grammar Journal"),
      libraryNode(
        "p",
        "Rules unlock through actual lesson exposure or a correctly demonstrated challenge response. Native Laghman review is pending.",
      ),
    );
    for (const rule of LIBRARY_DATA.grammar) {
      const unlocked = progress.library.grammar[rule.grammarId],
        detail = libraryNode("details");
      const heading = libraryNode(
        "summary",
        `Day ${rule.day}: ${rule.title}${unlocked ? "" : " · Locked"}`,
      );
      detail.append(heading);
      if (unlocked) {
        detail.append(libraryNode("p", rule.explanation));
        const ex = rule.example;
        const ps = libraryNode("p", ex.pashto, "library-pashto");
        ps.lang = "ps";
        ps.dir = "rtl";
        detail.append(
          ps,
          libraryNode("p", ex.romanisation),
          libraryNode("p", ex.english),
          libraryNode(
            "p",
            `${ex.speaker} → ${ex.recipient} · Native review pending.`,
            "tiny",
          ),
        );
        const links = rule.linkedLemmaIds
          .filter((id) => progress.library.acquired[id])
          .map((id) => libraryEntries[id].englishSenses[0]);
        if (links.length)
          detail.append(
            libraryNode("p", "Linked vocabulary: " + links.join(", ")),
          );
      } else {
        detail.append(
          libraryNode(
            "p",
            "Encounter this grammar in a lesson or demonstrate it in a challenge to read its examples.",
          ),
        );
      }
      root.append(detail);
    }
    return;
  }
  if (tab === "phrases") {
    root.append(libraryNode("h3", "Useful Expressions / Greetings"));
    const phrases = LIBRARY_DATA.phrases.filter(
      (p) => progress.library.phrases[p.id],
    );
    if (!phrases.length)
      root.append(
        libraryNode(
          "p",
          "Your greetings will appear here as you meet Muhammad Jan at the Library.",
        ),
      );
    for (const p of phrases) {
      const card = libraryNode("article", undefined, "library-entry");
      const ps = libraryNode("p", p.pashto, "library-pashto");
      ps.dir = "rtl";
      ps.lang = "ps";
      card.append(
        ps,
        libraryNode("p", p.romanisation + " — " + p.english),
        libraryButton("Pronunciation (if available)", () => speak(p.id)),
      );
      card.dataset.phrase = p.id;
      card.append(libraryNode("p", "Fixed expression · native Laghman review pending. Inflections/components add no district words.", "tiny"));
      appendPhrasePractice(card, p, "review");
      root.append(card);
    }
    return;
  }
  const universal = tab === "universal";
  root.append(libraryNode("h3", universal ? "Universal Vocabulary" : "Vocabulary Bank"));
  if (universal) root.append(libraryNode("p", "Universal words can occur in every district and never consume a district quota. Each lexical identity counts once; expressions have their own collection."));
  const sum = LibraryEngine.summary(progress, LIBRARY_DATA);
  const encounteredUniversal = LIBRARY_DATA.entries.filter((e) => e.vocabularyClass === "universal" && progress.library.acquired[e.lemmaId]).length;
  root.append(
    libraryNode(
      "p",
      universal
        ? `${encounteredUniversal} encountered universal lemmas · ${sum.encountered + encounteredUniversal} distinct lexical lemmas overall. Universal words never consume district quotas.`
        : `${sum.encountered} encountered · ${sum.practised} practised · ${sum.mastered} mastered content lemmas. ${encounteredUniversal} universal lemmas appear separately. Inflections count under one entry.`,
      "notice",
    ),
  );
  const plan = progress.library.plans[selectedLoop];
  if (plan) {
    const tally = LibraryEngine.tallies(progress, LIBRARY_DATA, selectedLoop),
      ids = tally.scheduledNewLemmas,
      seen = tally.actuallyEncounteredScheduledLemmas.length,
      actual = tally.incidentalStoryLemmas.length;
    root.append(
      libraryNode(
        "p",
        `Day ${selectedLoop}: ${ids.length} scheduled · ${seen} scheduled lemmas actually encountered. ${actual} incidental story lemmas · ${tally.reviewedExistingLemmas.length} existing lemmas revisited · ${tally.masteredLemmas.length} mastered. Story exposure is separate from your assigned target. ${plan.contentGap ? plan.notice : ""}`,
      ),
    );
  }
  const filters = libraryNode("div", undefined, "library-filters");
  function select(label, id, values) {
    const wrap = libraryNode("label", label + " "),
      input = libraryNode("select");
    input.id = id;
    for (const [value, text] of values) {
      const o = libraryNode("option", text);
      o.value = value;
      input.append(o);
    }
    wrap.append(input);
    filters.append(wrap);
    return input;
  }
  const searchLabel = libraryNode("label", "Search "),
    search = libraryNode("input");
  search.id = "librarySearch";
  search.type = "search";
  search.placeholder = "Pashto, romanisation or meaning";
  searchLabel.append(search);
  filters.append(searchLabel);
  const pos = select("Part of speech", "libraryPos", [
    ["", "All"],
    ...["noun", "verb", "adjective", "adverb", "pronoun", "grammar"].map(
      (x) => [x, x],
    ),
  ]);
  const day = select("First encounter", "libraryDay", [
    ["", "All days"],
    ["0", "Legacy"],
    ...Array.from({ length: 14 }, (_, i) => [String(i + 1), "Day " + (i + 1)]),
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
  const list = libraryNode("div");
  list.id = "libraryEntries";
  root.append(list);
  function update() {
    list.replaceChildren();
    const query = search.value.trim().toLocaleLowerCase();
    let entries = LIBRARY_DATA.entries.filter((e) => {
      const r = progress.library.acquired[e.lemmaId];
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
        ? progress.library.acquired[a.lemmaId].firstEncounteredDay -
          progress.library.acquired[b.lemmaId].firstEncounteredDay
        : sort.value === "due"
          ? progress.library.acquired[a.lemmaId].srsDueAt -
            progress.library.acquired[b.lemmaId].srsDueAt
          : a.englishSenses[0].localeCompare(b.englishSenses[0]),
    );
    if (!entries.length)
      list.append(
        libraryNode(
          "p",
          Object.keys(progress.library.acquired).length
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
  const r = progress.library.acquired[e.lemmaId],
    detail = libraryNode("details", undefined, "library-entry"),
    heading = libraryNode("summary");
  const ps = libraryNode("span", e.displayLemmaPs, "library-pashto");
  ps.lang = "ps";
  ps.dir = "rtl";
  detail.dataset.lemma = e.lemmaId;
  heading.append(
    ps,
    libraryNode(
      "span",
      ` ${e.romanisation} · ${e.englishSenses.join("; ")} · ${e.partOfSpeech} · ${LibraryEngine.status(r)}`,
    ),
  );
  detail.append(heading);
  detail.append(
    libraryNode(
      "p",
      `First encountered: Day ${r.firstEncounteredDay} · ${r.firstEncounteredSource} · ${r.firstEncounteredLocation}. ${r.correctAttempts}/${r.totalAttempts} correct attempts. ${r.srsDueAt <= Date.now() ? "Due for revision." : "Revision scheduled."}`,
      "tiny",
    ),
  );
  for (const f of e.forms.filter((f) =>
    r.encounteredFormIds.includes(f.formId),
  )) {
    const box = libraryNode("div", undefined, "library-form"),
      text = libraryNode("p", f.pashto, "library-pashto");
    text.lang = "ps";
    text.dir = "rtl";
    box.append(
      text,
      libraryNode(
        "p",
        `${f.englishGloss} · ${Object.entries(f.morphology)
          .map(([k, v]) => k + ": " + v)
          .join(", ")}`,
      ),
      libraryNode("p", f.romanisationNote || f.romanisation),
      libraryNode("p", "Native review pending.", "tiny"),
    );
    if (f.audioContentId)
      box.append(
        libraryButton("Pronunciation (if available)", () =>
          speak(f.audioContentId),
        ),
      );
    detail.append(box);
  }
  for (const ex of e.examples
    .filter((ex) => (r.encounteredSourceIds || []).includes(ex.exampleId))
    .slice(0, 3)) {
    const text = libraryNode("p", ex.pashto, "library-pashto");
    text.dir = "rtl";
    text.lang = "ps";
    detail.append(
      text,
      libraryNode("p", ex.romanisation + " — " + ex.english),
      libraryNode(
        "p",
        `${ex.speaker} → ${ex.recipient} · Native review pending.`,
        "tiny",
      ),
    );
  }
  detail.append(
    libraryButton("Practise an encountered form", () =>
      libraryVoluntaryPractice(e, detail),
    ),
  );
  return detail;
}
function libraryVoluntaryPractice(e, container) {
  if (!LibraryEngine.allowedOnDay(e, selectedLoop)) {
    container.append(libraryNode("p", "Action-verb practice begins on Day 2. Your existing vocabulary history is retained."));
    return;
  }
  const r = progress.library.acquired[e.lemmaId],
    form = e.forms.find((f) => r.encounteredFormIds.includes(f.formId));
  if (!form) return;
  const exercise = libraryNode("div");
  exercise.append(libraryNode("p", "Choose the meaning of " + form.pashto));
  const options = [
    ...new Set([
      form.englishGloss,
      ...LIBRARY_DATA.entries
        .filter((x) => x.lemmaId !== e.lemmaId)
        .slice(0, 3)
        .map((x) => x.englishSenses[0]),
    ]),
  ];
  const eventId = "library-practice:" + ++progress.library.attemptSequence;
  for (const option of shuffle(options)) {
    const b = libraryButton(option, () => {
      for (const btn of exercise.querySelectorAll("button"))
        btn.disabled = true;
      const correct = option === form.englishGloss;
      LibraryEngine.practise(
        progress,
        {
          ...LIBRARY_DATA,
          sourceMappings: {
            exercise: [{ lemmaId: e.lemmaId, formId: form.formId }],
          },
        },
        "exercise",
        correct,
        { day: selectedLoop, source: "review", location: "library", eventId },
      );
      save();
      hud();
      const label = container.querySelector("summary span:last-child");
      if (label)
        label.textContent = ` ${e.romanisation} · ${e.englishSenses.join("; ")} · ${e.partOfSpeech} · ${LibraryEngine.status(progress.library.acquired[e.lemmaId])}`;
      exercise.append(
        libraryNode(
          "p",
          correct
            ? "Correct. Practice recorded; no XP is awarded for Library review."
            : "Review: " + form.englishGloss,
        ),
      );
    });
    exercise.append(b);
  }
  container.append(exercise);
}
function renderLibraryPace(root) {
  const plan = progress.library.plans[selectedLoop],
    current = plan?.effectiveDailyTarget;
  let next = selectedLoop;
  while (progress.library.plans[next] && next <= 14) next++;
  const available = LibraryEngine.supported(progress, LIBRARY_DATA, next);
  root.append(
    libraryNode("h3", "Learning Pace"),
    libraryNode(
      "p",
      `Current Day ${selectedLoop}: ${plan ? (current !== null && current !== undefined ? current + " new scheduled content lemmas" : "content gap; " + Object.values(plan.locationAssignments).flat().length + " available scheduled lemmas") : "not started"}. Requested pace: ${progress.library.requestedDailyTarget}/day.`,
    ),
  );
  root.append(
    libraryNode(
      "p",
      `Changes apply to ${next <= 14 ? "Day " + next + " before its first lesson or challenge" : "future content"}. Existing assignments remain unchanged. Story examples can expose additional words beyond the supplementary target.`,
    ),
    libraryNode("p", LIBRARY_DATA.contentNotice, "notice"),
  );
  root.append(
    libraryNode(
      "p",
      `${LIBRARY_DATA.inventorySummary.activeContentLemmas} activated draft content lemmas; ${LIBRARY_DATA.inventorySummary.inactiveCandidates} untranslated candidates remain inactive. Native review is pending.`,
    ),
  );
  const message = libraryNode("p");
  message.id = "libraryPaceFeedback";
  message.setAttribute("role", "status");
  for (const [i, target] of LibraryEngine.presets.entries()) {
    const b = libraryButton(
      `${["Review only", "Very gentle", "Gentle", "Steady", "Moderate", "Standard", "Intensive"][i]} · ${target}/day · ${target / 4} per teaching location${available.includes(target) ? "" : " · Unavailable for this story / pool"}`,
      () => {
        const result = LibraryEngine.setPace(
          progress,
          LIBRARY_DATA,
          target,
          selectedLoop,
        );
        if (result.ok) {
          save();
          renderLibrary("pace");
          $("libraryPaceFeedback").textContent =
            `Saved ${target}/day, starting Day ${result.day}.`;
        } else message.textContent = result.reason;
      },
    );
    b.dataset.pace = String(target);
    b.disabled = !available.includes(target) || next > 14;
    b.setAttribute(
      "aria-pressed",
      String(progress.library.requestedDailyTarget === target),
    );
    root.append(b);
  }
  if (!available.length)
    root.append(
      libraryNode(
        "p",
        "No complete quota is supported by the remaining distinct draft content. Lessons, fixed stories and skip challenges remain available. More curated vocabulary and native review are needed; repeats will not count as new.",
      ),
    );
  root.append(message);
}
function libraryUpdateWorld() {
  const map = document.querySelector(".worldmap");
  $("worldScreen").prepend(map);
  const plan = LibraryEngine.ensurePlan(progress, LIBRARY_DATA, selectedLoop);
  save();
  for (const [index, place] of zoneKeys.entries()) {
    const placeCard = $("placeCards").children[index],
      ids = plan.locationAssignments[place] || [],
      seen = ids.filter((id) => progress.library.acquired[id]).length;
    const quota = libraryNode(
      "span",
      `${seen}/${ids.length} scheduled content lemmas encountered`,
      "tiny",
    );
    placeCard.append(quota);
  }
  const card = libraryButton(
    "📚 Library · Vocabulary, Grammar & Learning Pace",
    () => openLibrary(),
  );
  card.className = "place library-place";
  $("placeCards").append(card);
  const marker = document.querySelector(".map-point.residential");
  marker.querySelector("b").textContent = progress.homeGranted
    ? "Your Home"
    : "Muhammad Jan’s Home";
  if (selectedLoop === 1) {
    $("townStory").querySelector("p").textContent = progress.homeGranted
      ? "Muhammad Jan has welcomed you as the owner of your home. He can still visit and teach there."
      : "Muhammad Jan welcomes you at the Library. Explore his home, then meet him at the Library for your home handover challenge.";
    $("skipDayBtn").textContent = "📚 Meet Muhammad Jan at the Library →";
  }
  $("knownPill").textContent =
    `${LibraryEngine.summary(progress, LIBRARY_DATA).encountered} content lemmas encountered`;
  $("characterSubtitle").textContent =
    characterStatus(progress).level === 10
      ? "Week 1 complete · New Resident"
      : progress.homeGranted
        ? "Your home · Day-by-day Pashto"
        : "Muhammad Jan welcomes you at the Library";
  if (plan.contentGap)
    $("roundInsight").append(libraryNode("p", plan.notice, "notice"));
  if (progress.activeChallenge) {
    const resume = libraryButton(
      "Resume paused Day " + progress.activeChallenge.loop + " challenge",
      restoreLibraryChallenge,
    );
    $("placeCards").append(resume);
  }
}
function libraryInit() {
  const dialog = libraryNode("dialog");
  dialog.id = "libraryDialog";
  dialog.setAttribute("aria-labelledby", "libraryTitle");
  const heading = libraryNode("h2", "📚 Village Library");
  heading.id = "libraryTitle";
  const close = libraryButton("Close Library", closeLibrary);
  close.id = "libraryClose";
  const nav = libraryNode("nav");
  nav.setAttribute("aria-label", "Library pages");
  for (const [tab, label] of [
    ["vocabulary", "Vocabulary Bank"],
    ["universal", "Universal Vocabulary"],
    ["grammar", "Grammar Journal"],
    ["pace", "Learning Pace"],
    ["phrases", "Useful Expressions"],
  ]) {
    const b = libraryButton(label, () => renderLibrary(tab));
    b.dataset.libraryTab = tab;
    nav.append(b);
  }
  const body = libraryNode("div");
  body.id = "libraryBody";
  const audio = libraryNode(
    "p",
    "Pronunciation uses an available Pashto asset or device voice; native Laghman recordings are not bundled.",
    "tiny",
  );
  audio.id = "libraryAudioStatus";
  audio.setAttribute("role", "status");
  dialog.append(heading, close, nav, audio, body);
  document.body.append(dialog);
  new MutationObserver(() => {
    audio.textContent = $("audioStatus").textContent;
  }).observe($("audioStatus"), {
    childList: true,
    subtree: true,
    characterData: true,
  });
  dialog.addEventListener("close", () => {
    stopAudio(); // Includes the native Escape/cancel path.
    libraryLastFocus?.focus();
  });
  const navButton = libraryButton("📚 Library", () => openLibrary());
  navButton.id = "navLibrary";
  navButton.className = "ghost";
  document.querySelector("header .hud").prepend(navButton);
  const marker = libraryButton("", () => openLibrary());
  marker.className = "map-point library";
  marker.dataset.place = "library";
  marker.append(
    libraryNode("span", "📚", "micon"),
    libraryNode("b", "Library"),
    libraryNode("small", "Always open"),
  );
  document.querySelector(".worldmap").append(marker);
  const choices = libraryNode("div");
  choices.id = "onboardingPace";
  choices.append(
    libraryNode("h3", "Choose your learning pace"),
    libraryNode(
      "p",
      "Default: 20 new content lemmas/day, five per teaching location. Existing content is a development draft; unavailable quotas are flagged.",
    ),
  );
  const feedback = libraryNode("p", "20/day requested · 5 per location");
  feedback.id = "onboardingPaceFeedback";
  feedback.setAttribute("role", "status");
  const onboardingSupported = LibraryEngine.supported(
    progress,
    LIBRARY_DATA,
    1,
  );
  choices.append(
    libraryNode(
      "p",
      "Available for the preserved Day 1 story: " +
        onboardingSupported.join(" or ") +
        "/day. Story words are scaffolded incidental exposure and do not set your assigned-word target. Choose 0 for a review day, including exam days.",
    ),
  );
  for (const target of LibraryEngine.presets) {
    const b = libraryButton(target + "/day", () => {
      const result = LibraryEngine.setPace(progress, LIBRARY_DATA, target, 1);
      if (result.ok) {
        save();
        for (const x of choices.querySelectorAll("button"))
          x.setAttribute("aria-pressed", String(x === b));
        feedback.textContent =
          target + "/day requested · " + target / 4 + " per location";
      } else feedback.textContent = result.reason;
    });
    b.dataset.onboardingPace = String(target);
    b.disabled = !LibraryEngine.supported(progress, LIBRARY_DATA, 1).includes(
      target,
    );
    b.setAttribute(
      "aria-pressed",
      String(progress.library.requestedDailyTarget === target),
    );
    choices.append(b);
  }
  choices.append(feedback);
  $("introScreen").insertBefore(choices, $("startTutorial"));
  if (!progress.tutorialDone) {
    $("introScreen").insertBefore(document.querySelector(".worldmap"), $("introScreen").querySelector(".guide-row"));
    for (const b of document.querySelectorAll(".map-point:not(.library)"))
      b.disabled = true;
  }
}
