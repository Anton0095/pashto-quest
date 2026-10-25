/* Vocabulary exposure, lesson selection and practice transactions over one shared learning state. */
function createLearning({ state, content, progression }) {
  const DAY = 86400000;
  function stat(id) {
    const f = LibraryEngine.cardStat(state.progress, content.LIBRARY_DATA, id);
    return {
      seen: f.totalAttempts || 0,
      correct: f.correctAttempts || 0,
      wrong: (f.totalAttempts || 0) - (f.correctAttempts || 0),
      stage: f.stage || 0,
      dueAt: f.srsDueAt || 0,
    };
  }

  function isDue(id) {
    let s = stat(id);
    return s.seen > 0 && (s.stage === 0 || s.dueAt <= Date.now());
  }
  function learned(id) {
    return stat(id).correct > 0;
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
    const original =
      content.LIBRARY_DATA.lessonSentenceTargets?.[day]?.[place] ||
      (content.courses[day + "-" + place] || []).filter(
        (id) => content.wordById[id]?.type === "sentence",
      );
    const grammar = (content.courses[day + "-" + place] || []).filter(
      (id) =>
        content.wordById[id]?.type !== "sentence" &&
        (content.LIBRARY_DATA.sourceMappings[id] || []).some(
          (r) => !content.libraryEntries[r.lemmaId].countsTowardDailyQuota,
        ),
    );
    // Fixed authored sentences preserve grammar, roles and stories; no unreviewed substitutions.
    const review = LibraryEngine.dueForms(state.progress, content.LIBRARY_DATA)
      .filter(({ entry }) => LibraryEngine.allowedOnDay(entry, day))
      .slice(0, 2)
      .map(({ form }) => "library-form:" + form.formId);

    const actionIntro =
      day === 2 && place === "school" ? ["v-read", "v-write"] : [];
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
    return [
      ...new Set([
        ...opening,
        ...deferred,
        ...actionIntro,
        ...lexical,
        ...grammar,
        ...review,
        ...original,
      ]),
    ].filter((id) => LibraryEngine.cardAllowed(content.LIBRARY_DATA, id, day));
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
  function needsOpening(day, place) {
    return progression.needsOpening(state.progress, day, place);
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
    if (correct)
      for (const day of content.LIBRARY_DATA.challengeGrammarMappings[q.id] ||
        [])
        LibraryEngine.unlock(state.progress, day, "challenge");
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
      { kind: "word", direction: "ps-en" },
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
        (p) => p.id === w.id && p.kind === "fixed conversational expression",
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
  function preLessonGrammar(day, place) {
    return (
      needsOpening(day, place) ||
      (day === 2 &&
        place === "school" &&
        !state.progress.complete["2-school"]) ||
      ([3, 4, 5].includes(day) &&
        place === { 3: "nature", 4: "residential", 5: "school" }[day] &&
        !state.progress.complete[`${day}-${place}`] &&
        !state.progress.personIntros[day])
    );
  }
  return {
    stat,
    isDue,
    learned,
    duePool,
    libraryContext,
    libraryExpose,
    libraryPractice,
    libraryLessonPool,
    completeRound,
    passedChallenge,
    allowed,
    placeAccessible,
    needsOpening,
    currentAvailable,
    submitChallenge,
    submitLesson,
    submitTutorial,
    preLessonGrammar,
  };
}
