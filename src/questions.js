/* Frozen cumulative assessments and answer choices, separate from presentation. */
function createQuestions({ state, content, progression, storage }) {
  function prependChallengeGreetings(day, questions) {
    const greetings = content.NARRATIVE_DATA.expressions.filter(
      (p) => p.day === day && p.active && !p.optional && content.wordById[p.id],
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
      if (target < 0)
        throw Error("Day " + day + " has no greeting assessment slot");
      remaining.splice(target, 1);
    }
    const opening = greetings.map((p) => ({
      id: p.id,
      kind: "word",
      direction: "ps-en",
      vocabularyOrigin: "daily-greeting",
      speaker: p.speaker,
      recipient: p.recipient,
      comment: "Recognise today's greeting.",
    }));
    const result = [...opening, ...remaining];
    if (result.length !== questions.length)
      throw Error("Greeting changed challenge length");
    return result;
  }
  function libraryChallengeQuestions(day, questions) {
    if (day === 3) return prependChallengeGreetings(day, questions); // Preserve dinner story and length.
    const selection = LibraryEngine.lexicalSelection(
        state.progress,
        content.LIBRARY_DATA,
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
          "This word may be unfamiliar. Listen to its pronunciation and choose an answer.";
        continue;
      }
      q.id = "library-card:" + picked.lemmaId;
      used.add(q.id);
      q.lemmaId = picked.lemmaId;
      q.vocabularyOrigin = picked.origin;
      q.comment =
        picked.origin === "scheduled-scaffold"
          ? "Scheduled word, not yet studied. Listen to its pronunciation and choose an answer."
          : "Recall from your encountered bank · " + picked.origin;
    }
    const withGreetings = prependChallengeGreetings(day, result);
    return withGreetings;
  }
  function selectChallenge(day) {
    const currentPlan = LibraryEngine.ensurePlan(
      state.progress,
      content.LIBRARY_DATA,
      day,
    );
    const saved = currentPlan.challengeQuestions;
    if (saved) return saved.map((q) => ({ ...q }));
    const random = QuestionEngine.randomFor(currentPlan.seed + day * 7919);
    const authored = createAssessmentContent({
      content,
      progression,
      shuffle: (list) => QuestionEngine.shuffle(list, random),
    });
    const result = libraryChallengeQuestions(
      day,
      authored.selectAuthoredChallenge(day),
    );
    state.progress.library.plans[day].challengeQuestions = result.map((q) => ({
      ...q,
    }));
    storage.save();
    return result;
  }
  function answerChoices(w, direction, lesson = false) {
    const day = state.session.loop || state.day;
    const field = direction === "ps-en" ? "en" : "ps";
    let peers = [
      ...content.words,
      ...Object.values(content.wordById).filter((x) =>
        x.id.startsWith("library-card:"),
      ),
    ].filter(
      (x) =>
        x.id !== w.id &&
        x.type === w.type &&
        x[field] !== w[field] &&
        (lesson || x.loop <= day) &&
        LibraryEngine.cardAllowed(content.LIBRARY_DATA, x.id, day),
    );
    if (w.type === "sentence") {
      if (lesson)
        peers = [
          ...QuestionEngine.shuffle(peers.filter((x) => x.loop === w.loop)),
          ...QuestionEngine.shuffle(peers.filter((x) => x.loop < w.loop)),
          ...QuestionEngine.shuffle(peers.filter((x) => x.loop > w.loop)),
        ];
      else
        peers.sort(
          (a, b) => Number(b.loop === w.loop) - Number(a.loop === w.loop),
        );
    } else peers = QuestionEngine.shuffle(peers);
    const options = [...new Set(peers.map((x) => x[field]))].slice(0, 3);
    const fallback = lesson
      ? ["A different meaning", "None of these", "Another expression"]
      : ["None of these", "A different answer", "Another expression"].map(
          (x) => "— " + x + " —",
        );
    while (options.length < 3) options.push(fallback[options.length]);
    return QuestionEngine.shuffle([w[field], ...options]);
  }
  function makeChallengeChoices(word, direction) {
    return answerChoices(word, direction);
  }
  function distractors(word) {
    return answerChoices(word, "ps-en", true);
  }
  function buildTiles(
    word,
    question = state.session?.questions?.[state.session.index],
  ) {
    return QuestionEngine.buildTiles(word, question, state.session?.loop);
  }
  function questionUsesDuds(question) {
    return QuestionEngine.questionUsesDuds(question, state.session?.loop);
  }

  return {
    selectChallenge,
    makeChallengeChoices,
    distractors,
    buildTiles,
    questionUsesDuds,
  };
}
