/* Vocabulary exposure, lesson selection and practice transactions over one shared learning state. */
function createLearning({ state, content, progression }) {
  const DAY = 86400000;
  function stat(id) {
    const f = LibraryEngine.cardStat(state.progress, content.LIBRARY_DATA, id);
    return {
      seen: f.totalAttempts || 0,
      correct: f.correctAttempts || 0,
      stage: f.stage || 0,
      dueAt: f.srsDueAt || 0,
    };
  }

  function isDue(id) {
    let s = stat(id);
    return s.seen > 0 && (s.stage === 0 || s.dueAt <= Date.now());
  }

  function duePool() {
    const ids = [
      ...LibraryEngine.dueForms(state.progress, content.LIBRARY_DATA).map(
        (x) => "library-form:" + x.form.formId,
      ),
      ...Object.keys(state.progress.library.units).filter(
        (id) =>
          isDue(id) &&
          content.wordById[id] &&
          content.wordById[id].type !== "profile" &&
          currentAvailable(content.wordById[id]),
      ),
    ];
    return [...new Set(ids)]
      .filter((id) =>
        LibraryEngine.cardAllowed(content.LIBRARY_DATA, id, state.day),
      )
      .map((id) => content.wordById[id]);
  }
  function libraryContext(source, contentId) {
    return {
      day: state.session?.loop || state.day,
      source,
      location:
        state.session?.loc ||
        (source === "challenge" ? "challenge" : "library"),
      contentId,
    };
  }
  function libraryExpose(id, source) {
    LibraryEngine.expose(
      state.progress,
      content.LIBRARY_DATA,
      id,
      libraryContext(source, id),
    );
  }
  function libraryPractice(id, correct, eventId, source) {
    LibraryEngine.practise(state.progress, content.LIBRARY_DATA, id, correct, {
      ...libraryContext(source, id),
      eventId,
    });
  }
  function libraryLessonPool(day, place) {
    const plan = LibraryEngine.ensurePlan(
        state.progress,
        content.LIBRARY_DATA,
        day,
      ),
      assigned = plan.locationAssignments[place] || [];
    const lexical = assigned.map((id) => "library-card:" + id);
    const universals = content.LIBRARY_DATA.entries
      .filter(
        (e) =>
          day !== 14 &&
          e.vocabularyClass === "universal" &&
          e.introduction.day <= day &&
          !state.progress.library.acquired[
            e.lemmaId
          ]?.introducedFormIds.includes(e.forms[0].formId),
      )
      .map((e) => "library-card:" + e.lemmaId);
    const taught = new Set([
      ...Object.entries(state.progress.library.acquired)
        .filter(([, record]) => record.introducedFormIds.length)
        .map(([id]) => id),
      ...assigned,
      ...universals.flatMap((id) =>
        (content.LIBRARY_DATA.sourceMappings[id] || []).map((r) => r.lemmaId),
      ),
    ]);
    // Finite forms, plurals, adjective variants and whole case-governed chunks
    // receive individual study cards. Incidental sentences never introduce them.
    // A current-day workshop may follow this lexical phase; generation still waits
    // for its actual unlock. Missing earlier workshops are not silently granted.
    const forms =
      day === 14
        ? []
        : content.LIBRARY_DATA.entries.flatMap((e) =>
            taught.has(e.lemmaId)
              ? e.forms
                  .filter(
                    (f) =>
                      f.formId !== e.forms[0].formId &&
                      f.composition.enabled &&
                      LibraryEngine.formAllowed(e, f, day) &&
                      f.prerequisiteGrammarIds.every(
                        (id) =>
                          state.progress.library.grammar[id] ||
                          id === "grammar-day-" + day,
                      ) &&
                      !state.progress.library.acquired[
                        e.lemmaId
                      ]?.introducedFormIds.includes(f.formId),
                  )
                  .map((f) => "library-form:" + f.formId)
              : [],
          );
    const review = LibraryEngine.dueForms(state.progress, content.LIBRARY_DATA)
      .filter(
        ({ entry, form }) =>
          LibraryEngine.formAllowed(entry, form, day) &&
          (day !== 14 ||
            state.progress.library.acquired[
              entry.lemmaId
            ]?.introducedFormIds.includes(form.formId)),
      )
      .slice(0, 2)
      .map(({ form }) => "library-form:" + form.formId);
    // Use a location's active expression, otherwise repeat this day's active
    // greeting. Pending translations remain unavailable. Expressions do not
    // consume lexical quotas, even when repeated at multiple locations.
    const greeting =
      content.NARRATIVE_DATA.expressions.find(
        (p) => p.day === day && p.location === place && p.active && !p.optional,
      ) ||
      content.NARRATIVE_DATA.expressions.find(
        (p) => p.day === day && p.active && !p.optional,
      );
    const opening = greeting ? [greeting.id] : [];
    // Move former tutorial courtesies into contextual Day 2–3 teaching, without affecting lexical quotas.
    const deferred =
      day === 2 && place === "business"
        ? ["g-thanks"]
        : day === 3 && place === "residential"
          ? ["g-bye"]
          : [];
    const pool = [
      ...new Set([
        ...opening,
        ...deferred,
        ...lexical,
        ...universals,
        ...forms,
        ...review,
      ]),
    ].filter((id) => LibraryEngine.cardAllowed(content.LIBRARY_DATA, id, day));
    return pool;
  }
  function availableSentences(day = state.session?.loop || state.day) {
    return SentenceEngine.available(
      state.progress,
      content.LIBRARY_DATA,
      content.LIBRARY_DATA.sentenceFrames,
      day,
    );
  }
  function generatedPractice(day, seed, count = 4, options = {}) {
    let pool = availableSentences(day);
    if (options.filter) pool = pool.filter(options.filter);
    const excluded = new Set(options.excludeTexts || []);
    pool = pool.filter((c) => !excluded.has(c.ps));
    const goal = content.curriculum.days[day - 1],
      focus = goal.focusFamilies;
    const preferred = pool.filter(
      (c) =>
        focus.includes(c.generated.family) &&
        (!goal.subjectFeatures ||
          c.generated.subjects.some(
            (s) =>
              s.person === goal.subjectFeatures.person &&
              s.number === goal.subjectFeatures.number,
          )),
    );
    const from = (candidates) =>
      SentenceEngine.select(
        state.progress,
        { ...content.LIBRARY_DATA, generatedCatalog: candidates },
        content.LIBRARY_DATA.sentenceFrames,
        day,
        count,
        seed,
      );
    const first = from(preferred.length ? preferred : pool);
    if (first.length >= count)
      return first.map((card) => content.registerGenerated(card));
    return [
      ...first,
      ...from(pool.filter((c) => !first.some((x) => x.ps === c.ps))),
    ]
      .slice(0, count)
      .map((card) => content.registerGenerated(card));
  }
  function prepareSentences(s) {
    if (s.mode !== "standard" || s.generatedPrepared) return;
    s.generatedPrepared = true;
    const plan = state.progress.library.plans[s.loop];
    const selections = (plan.generatedPractice ||= {});
    const requested = content.curriculum.days[s.loop - 1].sentenceCount;
    if (!selections[s.loc]) {
      const prior = Object.values(state.progress.library.deliveries).filter(
        (d) => d.surface === "study" && d.mode === "standard",
      );
      const excluded = prior
        .map((d) => content.wordById[d.id]?.ps)
        .filter(Boolean);
      const selected = generatedPractice(
        s.loop,
        plan.seed + s.attemptId,
        requested,
        { excludeTexts: excluded },
      );
      selections[s.loc] = selected.map((c) => c.id);
      (plan.generatedPracticeCards ||= {})[s.loc] = JSON.parse(
        JSON.stringify(selected),
      );
      state.progress.library.deficits[s.id] = {
        requested,
        available: selected.length,
        missing: Math.max(0, requested - selected.length),
        reason:
          selected.length < requested
            ? "Not enough distinct, previously unshown sentences from individually studied forms and unlocked grammar. Continue vocabulary/form and grammar practice; no fixed sentence is substituted."
            : null,
      };
    }
    s.generatedPractice = selections[s.loc].map((id) => content.wordById[id]);
    s.studySentences = s.generatedPractice.map((c) => c.id);
    s.required.push(...s.studySentences);
    s.queue.push(
      ...s.studySentences.map((id) => ({ id, retries: 0, kind: "construct" })),
    );
    s.generationDeficit = state.progress.library.deficits[s.id];
  }
  function surface(id, surfaceName, extra = {}) {
    const card = content.wordById[id];
    if (!card) throw Error("Unknown instructional card: " + id);
    const day = state.session?.loop || state.day;
    if (card.type === "sentence") {
      if (
        card.generated?.origin !== "productive_engine" ||
        !card.generated.requiredGrammarIds.every(
          (g) => state.progress.library.grammar[g],
        ) ||
        !Object.values(card.generated.slots).every((r) =>
          state.progress.library.acquired[
            r.lemmaId
          ]?.introducedFormIds.includes(r.formId),
        )
      )
        throw Error(
          "Instructional sentence lacks productive origin or actual unlocks: " +
            id,
        );
    } else if (
      card.type === "greeting" &&
      !content.LIBRARY_DATA.phrases.some((p) => p.id === id)
    )
      throw Error("Unregistered fixed expression: " + id);
    // Compact delivery evidence is separate from the complete frozen question snapshots.
    // Keeping full text and long IDs in both key and value would exhaust offline storage.
    let hash = 2166136261;
    for (let i = 0; i < id.length; i++)
      hash = Math.imul(hash ^ id.charCodeAt(i), 16777619);
    let key = `${state.session?.attemptId || "reference"}:${surfaceName}:${hash >>> 0}`;
    while (
      state.progress.library.deliveries[key] &&
      state.progress.library.deliveries[key].id !== id
    )
      key += ":";
    state.progress.library.deliveries[key] ||= {
      id,
      day,
      surface: surfaceName,
      mode: state.session?.mode || "reference",
      kind:
        card.type === "sentence"
          ? "generated_sentence"
          : card.type === "greeting"
            ? "fixed_phrase"
            : "lexical_or_interface",
      family: card.generated?.family || null,
      ...extra,
    };
    return card;
  }
  function deliverySummary() {
    const rows = Object.values(state.progress.library.deliveries);
    const sentences = rows.filter((d) => d.kind === "generated_sentence");
    return {
      instructionalSentences: sentences.length,
      generatedSentences: sentences.length,
      generatedPercent: sentences.length ? 100 : null,
      fixedPhrases: rows.filter((d) => d.kind === "fixed_phrase").length,
    };
  }
  function completeRound(day) {
    return progression.completeRound(state.progress, day);
  }
  function passedChallenge(day) {
    return progression.passedChallenge(state.progress, day);
  }
  function allowed(day) {
    return progression.allowed(state.progress, day);
  }
  function placeAccessible(day, place) {
    return progression.placeAccessible(state.progress, day, place);
  }
  function currentAvailable(word) {
    return word.loop === 0 ? state.progress.tutorialDone : allowed(word.loop);
  }

  function submitChallenge(value) {
    const s = state.session;
    if (s?.mode !== "challenge" || s.locked || s.finished) return null;
    const q = s.questions[s.index],
      w = content.wordById[q.id];
    const correct = QuestionEngine.evaluate(q, w, value);
    libraryPractice(
      q.id,
      correct,
      `challenge:${s.attemptId}:${s.index}`,
      "challenge",
    );
    s.submittedAnswer = value;
    s.locked = true;
    s.answered++;
    if (correct) s.correctCount++;
    const expression = content.LIBRARY_DATA.phrases.some((p) => p.id === q.id);
    const key =
      q.kind === "dialogue"
        ? `week2-dialogue:${s.loop}:${q.id}`
        : q.kind === "choice"
          ? `${s.loop}:choice:${q.id}`
          : `${s.loop}:${q.kind}:${q.direction}:${q.id}`;
    const gain =
      correct && q.kind !== "address" && !expression
        ? progression.awardXP(state.progress, key, 5)
        : 0;
    s.earned += gain;
    return { q, w, correct, gain };
  }
  function submitLesson(value) {
    const s = state.session;
    if (
      !s ||
      !["standard", "review"].includes(s.mode) ||
      s.locked ||
      !s.queue.length
    )
      return null;
    const item = s.queue.shift(),
      w = content.wordById[item.id],
      previous = stat(w.id);
    const correct = QuestionEngine.evaluate(
      {
        kind: item.kind || "word",
        direction: item.kind === "construct" ? "en-ps" : "ps-en",
      },
      w,
      value,
    );
    libraryPractice(
      w.id,
      correct,
      `lesson:${s.attemptId}:${s.answered}`,
      s.mode === "review" ? "review" : "lesson",
    );
    if (!s.firstAsked.has(w.id)) {
      s.firstAsked.add(w.id);
      if (correct) s.firstCorrect++;
    }
    let gain = 0;
    if (correct) {
      s.passed.add(w.id);
      const identity = LibraryEngine.identity(content.LIBRARY_DATA, w.id);
      const expression = content.LIBRARY_DATA.phrases.some(
        (p) => p.id === w.id,
      );
      if (!expression && previous.correct === 0)
        gain = progression.awardXP(state.progress, "practice:" + identity, 10);
      else if (!expression && previous.dueAt <= Date.now())
        gain = progression.awardXP(
          state.progress,
          "review:" + identity + ":" + Math.floor(Date.now() / DAY),
          7,
        );
      s.earned += gain;
    } else
      s.queue.splice(Math.min(2, s.queue.length), 0, {
        ...item,
        id: w.id,
        retries: item.retries + 1,
      });
    s.answered++;
    s.locked = true;
    return { w, correct, gain };
  }
  function submitTutorial(id, correct) {
    const s = state.session;
    const first = !s.firstAsked.has(id);
    s.firstAsked.add(id);
    s.tutorialResponses++;
    if (content.wordById[id]?.type !== "profile")
      libraryPractice(
        id,
        correct,
        `tutorial:${s.attemptId}:${s.tutorialResponses}`,
        "tutorial",
      );
    s.answered++;
    if (correct) {
      if (first) s.firstCorrect++;
      s.passed.add(id);
      s.earned += progression.awardXP(state.progress, "practice:" + id, 10);
    }
  }
  return {
    availableSentences,
    surface,
    deliverySummary,
    generatedPractice,
    prepareSentences,
    duePool,
    libraryExpose,
    libraryLessonPool,
    completeRound,
    passedChallenge,
    allowed,
    placeAccessible,
    submitChallenge,
    submitLesson,
    submitTutorial,
  };
}
