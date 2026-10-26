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
  function retimeQuestions(day, list) {
    const used = new Set();
    const reserved = new Set(list.map((q) => q.id));
    return list.map((q) => {
      q = { ...q };
      if (!LibraryEngine.cardAllowed(content.LIBRARY_DATA, q.id, day)) {
        const old = content.wordById[q.id];
        const pool = content.words
          .filter(
            (w) =>
              (q.kind === "word"
                ? !["sentence", "greeting"].includes(w.type)
                : w.type === "sentence") &&
              LibraryEngine.cardAllowed(content.LIBRARY_DATA, w.id, day) &&
              !used.has(w.id) &&
              !reserved.has(w.id) &&
              (q.section !== "compounds" || w.ps.includes(" او ")),
          )
          .sort(
            (a, b) =>
              Number(b.place === old?.place) - Number(a.place === old?.place) ||
              Number(b.loop === day) - Number(a.loop === day) ||
              a.id.localeCompare(b.id),
          );
        if (!pool.length)
          throw Error("No prerequisite-safe authored fallback for day " + day);
        if (q.kind === "choice") {
          q.correct = pool[0].ps;
          q.options = [pool[0].ps, ...pool.slice(1, 4).map((w) => w.ps)];
          q.prompt = "Choose the Pashto sentence for: " + pool[0].en;
          delete q.audioId;
        }
        q.retimedFrom = q.id;
        q.id = pool[0].id;
        q.comment =
          "Cumulative authored practice within today's grammar. Later forms remain available in their original content records.";
      }
      used.add(q.id);
      return q;
    });
  }
  function isUnstudied(id) {
    return content.LIBRARY_DATA.phrases.some((p) => p.id === id)
      ? !state.progress.library.phrases[id]
      : (content.LIBRARY_DATA.sourceMappings[id] || []).some(
          (r) =>
            !state.progress.library.acquired[
              r.lemmaId
            ]?.introducedFormIds.includes(r.formId),
        );
  }
  function freezeQuestions(day, list, random) {
    const practice = SentenceEngine.select(
      state.progress,
      content.LIBRARY_DATA,
      content.LIBRARY_DATA.sentenceFrames,
      day,
      2,
      state.progress.library.seed + day,
    );
    // Story/dialogue identities remain fixed; only generic recall slots vary.
    let selected = 0;
    return list.map((q) => {
      q = { ...q };
      if (
        day <= 2 &&
        ["sentence", "construct"].includes(q.kind) &&
        practice[selected]
      ) {
        const card = practice[selected++];
        q.id = card.id;
        q.generated = JSON.parse(JSON.stringify(card));
        q.audioId = card.generated.sourceId;
      }
      const w = content.wordById[q.id];
      if (q.kind === "word") {
        q.unstudied = isUnstudied(q.id);
        if (q.unstudied) q.direction = "ps-en";
      }
      if (q.kind === "choice")
        q.choiceOrder = QuestionEngine.shuffle(q.options, random);
      else if (q.kind === "address") q.choiceOrder = ["ته", "تاسې"];
      else if (["construct", "dialogue"].includes(q.kind))
        q.tileSequence = QuestionEngine.shuffle(
          QuestionEngine.buildTiles(w, q, day).map((t) => t.index),
          random,
        );
      else q.choiceOrder = answerChoices(w, q.direction, false, day, random);
      return q;
    });
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
    const result = freezeQuestions(
      day,
      retimeQuestions(
        day,
        libraryChallengeQuestions(day, authored.selectAuthoredChallenge(day)),
      ),
      random,
    );
    state.progress.library.plans[day].challengeQuestions = result.map((q) => ({
      ...q,
    }));
    storage.save();
    return result;
  }
  function answerChoices(
    w,
    direction,
    lesson = false,
    day = state.session?.loop || state.day,
    random = Math.random,
  ) {
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
          ...QuestionEngine.shuffle(
            peers.filter((x) => x.loop === w.loop),
            random,
          ),
          ...QuestionEngine.shuffle(
            peers.filter((x) => x.loop < w.loop),
            random,
          ),
          ...QuestionEngine.shuffle(
            peers.filter((x) => x.loop > w.loop),
            random,
          ),
        ];
      else
        peers.sort(
          (a, b) => Number(b.loop === w.loop) - Number(a.loop === w.loop),
        );
    } else peers = QuestionEngine.shuffle(peers, random);
    const options = [...new Set(peers.map((x) => x[field]))].slice(0, 3);
    const fallback = lesson
      ? ["A different meaning", "None of these", "Another expression"]
      : ["None of these", "A different answer", "Another expression"].map(
          (x) => "— " + x + " —",
        );
    while (options.length < 3) options.push(fallback[options.length]);
    return QuestionEngine.shuffle([w[field], ...options], random);
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
    isUnstudied,
    makeChallengeChoices,
    distractors,
    buildTiles,
    questionUsesDuds,
  };
}
