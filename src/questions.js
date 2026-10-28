/* Every assessment proposition and Pashto reply is compiled from actual unlocks.
 * Deficits adapt to vocabulary/English grammar tasks, never authored sentence targets. */
function createQuestions({ state, content, progression, storage }) {
  const clone = (x) => JSON.parse(JSON.stringify(x));
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
  function available(day) {
    return SentenceEngine.available(
      state.progress,
      content.LIBRARY_DATA,
      content.LIBRARY_DATA.sentenceFrames,
      day,
    );
  }
  function answerChoices(
    w,
    direction,
    lesson = false,
    day = state.session?.loop || state.day,
    random = Math.random,
  ) {
    const field = direction === "ps-en" ? "en" : "ps";
    const peers =
      w.type === "sentence"
        ? available(day)
        : Object.values(content.wordById).filter(
            (c) =>
              c.type === w.type &&
              LibraryEngine.cardAllowed(content.LIBRARY_DATA, c.id, day),
          );
    const choices = [
      ...new Set(
        QuestionEngine.shuffle(
          peers.filter((c) => c.ps !== w.ps && c[field] !== w[field]),
          random,
        ).map((c) => c[field]),
      ),
    ].slice(0, 3);
    while (choices.length < 3)
      choices.push(
        ["A different meaning", "Another response", "None of these"][
          choices.length
        ],
      );
    return QuestionEngine.shuffle([w[field], ...choices], random);
  }
  function lexicalPool(day, random) {
    const plan = state.progress.library.plans[day],
      first = [],
      rest = [];
    for (const place of content.zoneKeys) {
      const ids = QuestionEngine.shuffle(
        plan.locationAssignments[place] || [],
        random,
      ).map((id) => "library-card:" + id);
      if (ids.length) first.push(ids[0]);
      rest.push(...ids.slice(1));
    }
    const due = new Set(
      LibraryEngine.dueForms(state.progress, content.LIBRARY_DATA).map(
        (x) => x.entry.lemmaId,
      ),
    );
    const grammarWords = content.LIBRARY_DATA.entries
      .filter(
        (e) => e.vocabularyClass === "universal" && e.introduction.day === day,
      )
      .map((e) => "library-card:" + e.lemmaId);
    const review = QuestionEngine.shuffle(
      content.LIBRARY_DATA.entries
        .filter(
          (e) =>
            e.introduction.day <= day &&
            (due.has(e.lemmaId) || state.progress.library.acquired[e.lemmaId]),
        )
        .map((e) => "library-card:" + e.lemmaId),
      random,
    );
    const phrases = content.LIBRARY_DATA.phrases
      .filter((p) => state.progress.library.phrases[p.id] || p.day === day)
      .map((p) => p.id);
    return [
      ...new Set([
        ...first,
        ...grammarWords,
        ...QuestionEngine.shuffle(rest, random),
        ...review,
        ...phrases,
      ]),
    ].filter((id) => LibraryEngine.cardAllowed(content.LIBRARY_DATA, id, day));
  }
  function grammarQuestion(day, index) {
    const ruleDay = 1 + (index % day),
      goal = content.curriculum.days[ruleDay - 1];
    return {
      id: `grammar:${day}:${index}`,
      kind: "choice",
      direction: "en-ps",
      section: "grammar",
      prompt: `Which rule belongs to ${goal.topic}?`,
      correct: goal.grammar[0],
      options: [
        goal.grammar[0],
        "Ignore agreement when words have familiar spellings.",
        "Invent a missing form from any dictionary headword.",
        "Study or use a future construction before its prerequisites.",
      ],
      grammarDays: [ruleDay],
      adaptation:
        "Insufficient distinct compiled sentences; this is an English grammar task, not a fixed sentence fallback.",
    };
  }
  function selectChallenge(day) {
    const plan = LibraryEngine.ensurePlan(
      state.progress,
      content.LIBRARY_DATA,
      day,
    );
    if (plan.challengeQuestions) return clone(plan.challengeQuestions);
    const random = QuestionEngine.randomFor(plan.seed + day * 7919),
      blueprint = createAssessmentContent({ content, progression }).blueprint(
        day,
      );
    const pool = available(day);
    const goal = content.curriculum.days[day - 1];
    const focus = pool.filter(
      (c) =>
        goal.focusFamilies.includes(c.generated.family) &&
        (!goal.subjectFeatures ||
          goal.assessmentReview ||
          c.generated.subjects.some(
            (s) =>
              s.person === goal.subjectFeatures.person &&
              s.number === goal.subjectFeatures.number,
          )),
    );
    const choose = (candidates, n, seed) =>
      SentenceEngine.select(
        state.progress,
        { ...content.LIBRARY_DATA, generatedCatalog: candidates },
        content.LIBRARY_DATA.sentenceFrames,
        day,
        n,
        seed,
      );
    const focused = choose(
      focus,
      Math.ceil(blueprint.count * 0.7),
      plan.seed + day,
    );
    const cards = [
      ...focused,
      ...choose(
        pool.filter((c) => !focused.some((x) => x.ps === c.ps)),
        blueprint.count,
        plan.seed + day + 1,
      ),
    ]
      .slice(0, blueprint.count)
      .map((card) => content.registerGenerated(card));
    const pairs = SentenceEngine.dialogues(
      pool,
      content.LIBRARY_DATA,
      plan.seed + day,
    );
    const lexical = lexicalPool(day, random),
      used = new Set(),
      out = [],
      usedDialogueFamilies = new Set();
    const opening = content.NARRATIVE_DATA.expressions.find(
      (p) => p.active && p.day === day,
    );
    const greeting =
      content.LIBRARY_DATA.phrases.find((p) => p.id === opening?.id) ||
      content.LIBRARY_DATA.phrases.find((p) => p.day === day);
    let wordIndex = 0,
      deficit = 0;
    for (let i = 0; i < blueprint.count; i++) {
      const wanted = blueprint.kinds[i];
      let q;
      if (i === 0 && greeting)
        q = {
          id: greeting.id,
          kind: "word",
          direction: "ps-en",
          vocabularyOrigin: "daily-phrase",
        };
      else if (wanted === "word" && lexical.length)
        q = {
          id: lexical[wordIndex++ % lexical.length],
          kind: "word",
          direction: "ps-en",
          vocabularyOrigin: "curriculum",
        };
      else if (wanted === "address") {
        const familiar =
            content.libraryEntries["lemma:universal:pronouns-1"]?.forms[0],
          polite = content.libraryEntries["lemma:w6-you-all"]?.forms[0];
        if (
          familiar &&
          polite &&
          state.progress.library.acquired[
            "lemma:universal:pronouns-1"
          ]?.introducedFormIds.includes(familiar.formId) &&
          state.progress.library.acquired[
            "lemma:w6-you-all"
          ]?.introducedFormIds.includes(polite.formId)
        ) {
          const scopes = [
              ["Saleha", "familiar"],
              ["Muhammad Jan", "respectful"],
              [day >= 6 ? "Saleha and Mina" : "Saleha and Edris", "group"],
            ],
            [recipient, scope] = scopes[i % scopes.length];
          q = {
            id: "address:" + day + ":" + i,
            kind: "address",
            recipient,
            scope,
            correct: scope === "familiar" ? familiar.pashto : polite.pashto,
            comment:
              "Address " +
              recipient +
              ". Choose the pronoun appropriate to this listener.",
            addressOptions: [
              [familiar.pashto + " · familiar singular", familiar.pashto],
              [polite.pashto + " · respectful or plural", polite.pashto],
            ],
          };
        }
      } else if (wanted === "dialogue") {
        const usable = pairs.filter(
          (p) =>
            !used.has(p.answer.ps) && (!p.prompt || !used.has(p.prompt.ps)),
        );
        const preferred = usable.filter(
          (p) =>
            goal.focusFamilies.includes(p.family) &&
            !usedDialogueFamilies.has(p.family),
        );
        const varied = usable.filter(
          (p) => !usedDialogueFamilies.has(p.family),
        );
        const choices = preferred.length
          ? preferred
          : varied.length
            ? varied
            : usable;
        const pair = choices.length
          ? choices[Math.floor(random() * choices.length)]
          : null;
        if (pair) {
          usedDialogueFamilies.add(pair.family);
          content.registerGenerated(pair.answer);
          if (pair.prompt) content.registerGenerated(pair.prompt);
          used.add(pair.answer.ps);
          if (pair.prompt) used.add(pair.prompt.ps);
          q = {
            id: pair.answer.id,
            kind: "dialogue",
            direction: "en-ps",
            answerPs: pair.answer.ps,
            answerEnglish: pair.answer.en,
            promptPs: pair.prompt?.ps || null,
            promptEnglish: pair.prompt?.en || pair.request,
            sceneEnglish: pair.scene,
            generated: clone(pair.answer),
            promptGenerated: pair.prompt ? clone(pair.prompt) : null,
            audioId: pair.prompt?.id || null,
            dialogueContext: {
              promptSpeaker: content.teacherFor(day, null, "challenge").name,
              responseSpeaker: "Player",
              responseAddressee:
                pair.recipient === "Teacher"
                  ? content.teacherFor(day, null, "challenge").name
                  : pair.recipient,
            },
            dialogueFamily: pair.family,
            speaker: content.teacherFor(day, null, "challenge").name,
            recipient:
              pair.recipient === "Teacher"
                ? content.teacherFor(day, null, "challenge").name
                : pair.recipient,
            acceptedPs: [],
          };
        }
      } else if (wanted !== "word") {
        const card = cards.find((c) => !used.has(c.ps));
        if (card) {
          used.add(card.ps);
          q = {
            id: card.id,
            kind: wanted,
            direction: wanted === "construct" ? "en-ps" : "ps-en",
            generated: clone(card),
          };
        }
      }
      if (!q) {
        deficit++;
        q = grammarQuestion(day, i);
      }
      q.speaker ||= content.teacherFor(day, null, "challenge").name;
      q.recipient ||= "Player";
      q.comment = blueprint.scenario;
      q.requestedKind = wanted;
      if (q.kind === "word") {
        q.unstudied = isUnstudied(q.id);
        if (q.unstudied) q.direction = "ps-en";
      }
      if (q.kind === "choice")
        q.choiceOrder = QuestionEngine.shuffle(q.options, random);
      else if (q.kind === "address")
        q.choiceOrder = q.addressOptions.map((x) => x[1]);
      else if (["construct", "dialogue"].includes(q.kind)) {
        const answer = q.answerPs || content.wordById[q.id].ps;
        const tokens = new Set(
          QuestionEngine.normalizePashtoResponse(answer).split(" "),
        );
        const studiedTokens = content.LIBRARY_DATA.entries.flatMap((e) =>
          e.forms
            .filter(
              (f) =>
                state.progress.library.acquired[
                  e.lemmaId
                ]?.introducedFormIds.includes(f.formId) &&
                !f.pashto.includes(" "),
            )
            .map((f) => f.pashto),
        );
        const duds = [...new Set(studiedTokens)]
          .filter((t) => !tokens.has(t))
          .slice(0, 2);
        if (duds.length === 2) q.duds = duds;
        q.tileSequence = QuestionEngine.shuffle(
          QuestionEngine.buildTiles(content.wordById[q.id], q, day).map(
            (t) => t.index,
          ),
          random,
        );
      } else
        q.choiceOrder = answerChoices(
          content.wordById[q.id],
          q.direction,
          false,
          day,
          random,
        );
      if (q.generated && q.kind === "sentence")
        q.choiceIds = originsForChoices(
          content.wordById[q.id],
          q.choiceOrder,
          q.direction,
          day,
        ).map((c) => c.id);
      out.push(q);
    }
    plan.assessmentDeficit = {
      requestedSentences: blueprint.kinds.filter((k) => k !== "word").length,
      generatedSentences: out.filter((q) => q.generated).length,
      adaptedTasks: deficit,
      reason: deficit
        ? "Not enough distinct licensed sentences from actually introduced forms and grammar; English grammar tasks preserve assessment length."
        : null,
    };
    plan.challengeQuestions = clone(out);
    storage.save();
    return clone(out);
  }
  function originsForChoices(
    w,
    values,
    direction,
    day = state.session?.loop || state.day,
  ) {
    if (w.type !== "sentence") return [];
    const field = direction === "ps-en" ? "en" : "ps",
      pool = available(day);
    return values
      .map((text) => pool.find((c) => c[field] === text))
      .filter(Boolean)
      .map((card) => content.registerGenerated(card));
  }
  function inspectQuestion(q) {
    const cards = [];
    if (q.generated) cards.push(content.wordById[q.generated.id]);
    if (q.promptGenerated) cards.push(content.wordById[q.promptGenerated.id]);
    return cards;
  }
  return {
    selectChallenge,
    isUnstudied,
    inspectQuestion,
    originsForChoices,
    makeChallengeChoices: (w, d) => answerChoices(w, d),
    distractors: (w) => answerChoices(w, "ps-en", true),
    buildTiles: (w, q = state.session?.questions?.[state.session.index]) =>
      QuestionEngine.buildTiles(w, q, state.session?.loop),
    questionUsesDuds: (q) =>
      QuestionEngine.questionUsesDuds(q, state.session?.loop),
  };
}
