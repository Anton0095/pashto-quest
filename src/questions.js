/* Every assessment proposition and Pashto reply is compiled from actual unlocks.
 * Deficits adapt to vocabulary/approved phrase practice, never authored sentence targets. */
function createQuestions({ state, content, progression, seedSource = QuestionEngine.randomSeed }) {
  const clone = (x) => JSON.parse(JSON.stringify(x));
  function isUnstudied(id) {
    const phrase = state.progress.library.phrases[id];
    if (content.LIBRARY_DATA.phrases.some(p => p.id === id))
      return !phrase || (phrase.source === "challenge-start" && !phrase.studiedDay);
    return (content.LIBRARY_DATA.sourceMappings[id] || []).some(ref => {
      const r = state.progress.library.acquired[ref.lemmaId], origin = r?.formUnlocks?.[ref.formId];
      return !r?.introducedFormIds.includes(ref.formId) ||
        (origin?.source === "challenge-start" && !origin.studiedDay);
    });
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
    day = state.session?.loop || state.day,
    random = Math.random,
  ) {
    const field = direction === "ps-en" ? "en" : "ps";
    const peers = w.type === "sentence" ? available(day) : Object.values(content.wordById).filter(c =>
      !["sentence", "profile"].includes(c.type) && (c.type !== "greeting" || w.type === "greeting") && !isUnstudied(c.id) &&
      (content.LIBRARY_DATA.phrases.some(p => p.id === c.id) || (content.LIBRARY_DATA.sourceMappings[c.id] || []).length) &&
      LibraryEngine.cardAllowed(content.LIBRARY_DATA, c.id, day));
    // Backup choices are display-only base forms, never an acquisition transaction.
    const backup = w.type === "sentence" ? [] : content.LIBRARY_DATA.entries
      .filter(e => e.introduction.day === 1 && e.forms[0].firstAllowedDay === 1)
      .map(e => content.wordById["library-card:" + e.lemmaId]);
    const meanings = new Set(QuestionEngine.meaningKeys(w));
    const forms = new Set([QuestionEngine.normalizeAnswer(w.ps)]);
    const labels = new Set([w[field].normalize("NFC").trim().toLocaleLowerCase("en")]);
    const choices = [];
    for (const group of [peers, backup]) for (const c of QuestionEngine.shuffle(group, random)) {
      if (choices.length === 3) break;
      const keys = QuestionEngine.meaningKeys(c), ps = QuestionEngine.normalizeAnswer(c.ps);
      const label = c[field].normalize("NFC").trim().toLocaleLowerCase("en");
      if (forms.has(ps) || labels.has(label) || keys.some(k => meanings.has(k))) continue;
      // Check the evaluator too: no accepted answer can become a distractor.
      if (QuestionEngine.evaluate({kind:w.type === "sentence" ? "sentence" : "word", direction}, w, c[field])) continue;
      choices.push(c[field]);labels.add(label);forms.add(ps);keys.forEach(k => meanings.add(k));
    }
    while (choices.length < 3) choices.push(["A different meaning", "Another response", "None of these"][choices.length]);
    return QuestionEngine.shuffle([w[field], ...choices], random);
  }
  // Terminology-heavy editorial glosses are reference/study material, not
  // practical recall answers. Their licensed forms remain usable in clauses.
  const practicalMeaning = id => !/\b(?:first|second|third)[ -]person\b|\b(?:masculine|feminine|singular|plural)\b/i.test(content.wordById[id]?.en || "");
  function lexicalPool(day, random) {
    const plan = state.progress.library.plans[day];
    // Every location contributes regardless of visit completion. Interleave the
    // frozen assignments so additional recall tasks stay balanced as well.
    const rows = QuestionEngine.shuffle(content.zoneKeys, random).map(place => QuestionEngine.shuffle(
      plan.locationAssignments[place] || [], random,
    ).map(id => {
      const base = "library-card:" + id;
      if (practicalMeaning(base)) return base;
      // A category-qualified lemma gloss can still have an evidenced practical
      // form gloss (e.g. cooked). Retain its lemma identity and district coverage.
      const entry=content.libraryEntries[id];
      return entry.forms.map(f=>"library-form:"+f.formId).find(card=>LibraryEngine.cardAllowed(content.LIBRARY_DATA,card,day)&&practicalMeaning(card)) || base;
    }).filter(id =>
      LibraryEngine.cardAllowed(content.LIBRARY_DATA, id, day) && practicalMeaning(id)));
    const scheduled = [];
    for (let i = 0; i < Math.max(0, ...rows.map(row => row.length)); i++)
      for (const row of rows) if (row[i]) scheduled.push(row[i]);
    const due = new Set(
      LibraryEngine.dueForms(state.progress, content.LIBRARY_DATA).map(
        (x) => x.entry.lemmaId,
      ),
    );
    const grammarWords = QuestionEngine.shuffle(content.LIBRARY_DATA.entries
      .filter(
        (e) => e.vocabularyClass === "universal" && e.introduction.day === day,
      )
      .map((e) => "library-card:" + e.lemmaId), random);
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
    const phrases = QuestionEngine.shuffle(content.LIBRARY_DATA.phrases
      .filter((p) => state.progress.library.phrases[p.id] || p.day === day)
      .map((p) => p.id), random);
    return [
      ...new Set([
        ...scheduled,
        ...grammarWords,
        ...review,
        ...phrases,
      ]),
    ].filter((id) => LibraryEngine.cardAllowed(content.LIBRARY_DATA, id, day) && practicalMeaning(id));
  }
  function selectChallenge(day, { newAttempt = false } = {}) {
    if (!progression.challengeAccessible(state.progress, day)) return [];
    const plan = LibraryEngine.ensurePlan(
      state.progress,
      content.LIBRARY_DATA,
      day,
    );
    const frozen = state.session?.mode === "challenge" && state.session.loop === day && !state.session.finished && state.session.index < state.session.questions.length
      ? state.session : state.progress.activeChallenge?.loop === day ? state.progress.activeChallenge : null;
    if (!newAttempt && frozen) return clone(frozen.questions);
    const seed = seedSource();
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError("Invalid assessment random seed");
    progression.activateChallenge(state.progress, day);
    const random = QuestionEngine.randomFor(seed),
      blueprint = createAssessmentContent({ content, progression }).blueprint(
        day, state.progress.enableTypingChallenges === true, random,
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
    const assigned = new Set(Object.values(plan.locationAssignments).flat());
    const usesCurrentVocabulary = card => Object.values(card.generated.slots).some(ref => assigned.has(ref.lemmaId));
    const current = pool.filter(usesCurrentVocabulary), currentFocus = focus.filter(usesCurrentVocabulary);
    const targetCount = Math.ceil((blueprint.count - 5) * 0.7);
    const preferred = currentFocus.length ? currentFocus : current;
    const targeted = [];
    // Random sampling remains constrained by four-location coverage. Select
    // within each compatible cohort before filling the remaining current slots.
    for (const place of QuestionEngine.shuffle(content.zoneKeys, random)) {
      if (targeted.length >= targetCount) break;
      const ids = new Set(plan.locationAssignments[place]);
      const covers = c => Object.values(c.generated.slots).some(ref => ids.has(ref.lemmaId));
      if (targeted.some(covers)) continue;
      const candidates = preferred.filter(covers).filter(c => !targeted.some(x => x.ps === c.ps));
      targeted.push(...choose(candidates, 1, Math.floor(random() * 0x100000000)));
    }
    targeted.push(...choose(preferred.filter(c => !targeted.some(x => x.ps === c.ps)), targetCount - targeted.length, seed));
    const focused = [...targeted, ...choose(
      focus.filter(c => !targeted.some(x => x.ps === c.ps)),
      Math.ceil(blueprint.count * 0.7) - targeted.length,
      (seed + 2) >>> 0,
    )];
    const cards = [
      ...focused,
      ...choose(
        pool.filter((c) => !focused.some((x) => x.ps === c.ps)),
        blueprint.count,
        (seed + 1) >>> 0,
      ),
    ]
      .slice(0, blueprint.count)
      .map((card) => content.registerGenerated(card));
    const pairs = SentenceEngine.dialogues(
      pool,
      content.LIBRARY_DATA,
      (seed + 3) >>> 0,
    );
    const lexical = lexicalPool(day, random);
    const studiedForms = QuestionEngine.shuffle(content.LIBRARY_DATA.entries.flatMap(e => e.forms
      .filter(f => state.progress.library.acquired[e.lemmaId]?.introducedFormIds.includes(f.formId))
      .map(f => "library-form:" + f.formId)), random);
    const recallIdentities = new Set();
    const practical = [...lexical, ...studiedForms,
      ...QuestionEngine.shuffle(content.LIBRARY_DATA.phrases.filter(p => p.active && p.day <= day).map(p => p.id), random)]
      .filter(id => {
        if (!LibraryEngine.cardAllowed(content.LIBRARY_DATA, id, day) || !practicalMeaning(id)) return false;
        const identity = LibraryEngine.identity(content.LIBRARY_DATA, id);
        if (recallIdentities.has(identity)) return false;
        recallIdentities.add(identity);
        return true;
      });
    if (!practical.length) throw Error("No approved practical assessment material available");
    const used = new Set(),
      usedRecall = new Set(),
      out = [],
      usedDialogueFamilies = new Set();
    const opening = content.NARRATIVE_DATA.expressions.find(
      (p) => p.active && p.day === day,
    );
    const greeting =
      content.LIBRARY_DATA.phrases.find((p) => p.id === opening?.id) ||
      content.LIBRARY_DATA.phrases.find((p) => p.day === day);
    let constructionIndex = 0, deficit = 0, lexicalCount = 0;
    const deviations = [];
    for (let i = 0; i < blueprint.count; i++) {
      const wanted = blueprint.formats[i];
      let format = wanted, q;
      const nextWord = () => lexical.find(id => !usedRecall.has(LibraryEngine.identity(content.LIBRARY_DATA,id)));
      if (i === 0 && greeting) q = {id: opening?.responsePhraseId || greeting.id,
        phrasePromptId: opening?.promptPhraseId, kind:"word", vocabularyOrigin:"daily-phrase"};
      // The first four lexical targets cover the interleaved district assignments.
      else if (wanted !== "build" && (lexicalCount < 4 || random() < .35) && nextWord()) {
        q = {id:nextWord(),kind:"word",vocabularyOrigin:"curriculum"};lexicalCount++;
      } else {
        // Dialogue content is independent of response format. Keep its licensed
        // proposition/context, using the same evaluator as other sentence content.
        const pair = random() < .3 ? pairs.find(p => !used.has(p.answer.ps) && !usedDialogueFamilies.has(p.family)) : null;
        const card = pair?.answer || cards.find(c => !used.has(c.ps));
        if (card) {
          content.registerGenerated(card);used.add(card.ps);
          q = {id:card.id,kind:wanted === "build" ? "construct" : "sentence",generated:clone(card)};
          if (pair) {usedDialogueFamilies.add(pair.family);q.sceneEnglish=pair.scene;}
        }
      }
      if (!q) {
        deficit++;
        const id = practical.find(id => !usedRecall.has(LibraryEngine.identity(content.LIBRARY_DATA,id))) || practical[(deficit-1)%practical.length];
        q = {id,kind:"word",vocabularyOrigin:"practical-review"};
        if (wanted === "build") {format="select";deviations.push({index:i,requested:wanted,actual:format,reason:"Insufficient distinct licensed sentences"});}
        q.adaptation="Insufficient distinct licensed sentences; use eligible vocabulary or approved phrases.";
      }
      if (!q.generated) usedRecall.add(LibraryEngine.identity(content.LIBRARY_DATA,q.id));
      q.speaker=content.teacherFor(day,null,"challenge").name;q.recipient="Player";q.comment=blueprint.scenario;
      q.answerFormat=format;q.requestedFormat=wanted;q.direction=blueprint.directions[i];
      if (q.kind === "word") {q.unstudied=isUnstudied(q.id);q.recognition=format === "select";}
      if (format === "build") {
        Object.assign(q,constructionQuestion(content.wordById[q.id],{question:q,withDuds:constructionIndex++ % 2 === 1,random}));
        q.tileSequence=QuestionEngine.shuffle(QuestionEngine.buildTiles(content.wordById[q.id],q,day).map(t=>t.index),random);
      } else if (format === "select") {
        q.choiceOrder=answerChoices(content.wordById[q.id],q.direction,day,random);
        if (q.generated) q.choiceIds=originsForChoices(content.wordById[q.id],q.choiceOrder,q.direction,day).map(c=>c.id);
      } else q.choiceOrder=[]; // Typed category has no visible/hidden multiple-choice bank.
      out.push(q);
    }
    plan.assessmentDeficit = {
      requestedSentences: blueprint.count - 5,
      plannedCategories: blueprint.counts,
      actualCategories: out.reduce((counts,q) => {counts[q.answerFormat]++;return counts;},{select:0,build:0,type:0}),
      distributionDeviations: deviations,
      generatedSentences: out.filter((q) => q.generated).length,
      adaptedTasks: deficit,
      practicalPoolSize: practical.length,
      reason: deficit
        ? "Not enough distinct licensed sentences from actually introduced forms and grammar; Vocabulary/approved phrase practice preserves assessment length; a small eligible pool may repeat."
        : null,
    };
    return clone(out);
  }
  // Display-only tiles: introduced forms first, then Day-1 base backup.
  // The variant is intentional, independent of the size of the vocabulary pool.
  function constructionQuestion(card, {question = {}, withDuds = false, random = Math.random} = {}) {
    const q = {...question, id:card.id, kind:question.kind || "construct", direction:"en-ps"};
    delete q.duds;
    q.tileVariant="exact";
    if (!withDuds) return q;
    const key = t => QuestionEngine.normalizeAnswer(QuestionEngine.normalizePashtoResponse(t));
    const excluded = new Set([card.ps, q.answerPs, ...(q.acceptedPs || [])].filter(Boolean).flatMap(a => key(a).split(" ")));
    const day=state.session?.loop || state.day;
    const introduced = content.LIBRARY_DATA.entries.flatMap(e => e.forms.filter(f =>
      LibraryEngine.formAllowed(e,f,day) && state.progress.library.acquired[e.lemmaId]?.introducedFormIds.includes(f.formId)).map(f => f.pashto));
    const backup = content.LIBRARY_DATA.entries.filter(e => e.introduction.day === 1 && e.forms[0].firstAllowedDay === 1).map(e => e.forms[0].pashto);
    const duds=[];
    for (const group of [introduced, backup]) for (const token of QuestionEngine.shuffle(group,random)) {
      if (duds.length===2) break;
      const k=key(token);
      if (!k || k.includes(" ") || excluded.has(k)) continue;
      duds.push(token);excluded.add(k);
    }
    if (duds.length===2) {q.duds=duds;q.tileVariant="distractors";}
    return q;
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
  return {
    selectChallenge,
    constructionQuestion,
    distractors: (w) => answerChoices(w, "ps-en"),
    buildTiles: (w, q = state.session?.questions?.[state.session.index]) =>
      QuestionEngine.buildTiles(w, q, state.session?.loop),
    questionUsesDuds: (q) =>
      QuestionEngine.questionUsesDuds(q, state.session?.loop),
  };
}
