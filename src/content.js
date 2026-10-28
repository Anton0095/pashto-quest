/* Runtime registry and world lookups from the single curriculum and lexical identities. */
function createContent(LIBRARY_DATA, NARRATIVE_DATA) {
  const curriculum = LIBRARY_DATA.curriculum;
  const { zones, days } = curriculum;
  const dayById = Object.fromEntries(days.map((day) => [day.day, day]));
  const zoneKeys = Object.keys(zones);
  const wordById = {};
  LIBRARY_DATA.cardDays = {};
  const libraryEntries = Object.fromEntries(
    LIBRARY_DATA.entries.map((e) => [e.lemmaId, e]),
  );
  const villagePeople = {
    residential: {
      role: "Village elder",
      name: "Muhammad Jan",
      face: "👴",
      description: "An older village leader, patient and wise.",
    },
    business: {
      role: "Grocer",
      name: "Edris",
      face: "🧑‍🌾",
      description: "The grocer who loves a good chat.",
    },
    nature: {
      role: "Fellow student",
      name: "Saleha",
      face: "👩‍🎓",
      description: "A fellow student from your school.",
    },
    school: {
      role: "Pashto teacher",
      name: "Ms Hameed",
      face: "👩‍🏫",
      description: "Your Pashto teacher at the village school.",
    },
  };
  const peopleByName = Object.fromEntries(
    [
      ...Object.values(villagePeople),
      {
        name: "Mina",
        face: "👧",
        role: "Saleha’s sister",
      },
    ].map((p) => [p.name, p]),
  );
  const peopleAt = Object.fromEntries(
    days.map((day) => [
      day.day,
      Object.fromEntries(
        day.lessons.map((lesson) => [lesson.location, lesson.participants]),
      ),
    ]),
  );
  function teacherFor(day, location, mode) {
    if (mode === "tutorial") return villagePeople.residential;
    const goal = dayById[day];
    const name =
      mode === "challenge"
        ? goal?.assessment.teacher
        : goal?.lessons.find((lesson) => lesson.location === location)?.teacher;
    return peopleByName[name] || villagePeople.school;
  }
  for (const phrase of LIBRARY_DATA.phrases) {
    wordById[phrase.id] ||= {
      id: phrase.id,
      loop: phrase.day || 0,
      type: "greeting",
      ps: phrase.pashto,
      roman: phrase.romanisation,
      en: phrase.english,
      place: phrase.location || "library",
      note: "Fixed expression; provisional romanisation, native Laghman review pending.",
    };
    LIBRARY_DATA.cardTypes[phrase.id] = "greeting";
  }
  for (const entry of LIBRARY_DATA.entries) {
    const form = entry.forms[0],
      id = "library-card:" + entry.lemmaId;
    wordById[id] = {
      id,
      loop: entry.introduction.day,
      place: entry.primaryDistrict,
      type: entry.partOfSpeech,
      audioContentId: form.audioContentId,
      ps: form.pashto,
      roman: form.romanisation || "Romanisation pending native review",
      en: entry.englishSenses[0],
      note: "Provisional vocabulary; native Laghman review pending.",
    };
    LIBRARY_DATA.cardDays[id] = entry.introduction.day;
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
        loop: form.firstAllowedDay,
        place: entry.primaryDistrict,
        type: entry.partOfSpeech,
        audioContentId: form.audioContentId,
        ps: form.pashto,
        roman: form.romanisation || "Romanisation pending native review",
        en: form.englishGloss,
        note: "Attested form · native review pending.",
      };
      LIBRARY_DATA.cardDays[id] = form.firstAllowedDay;
      LIBRARY_DATA.cardTypes[id] = entry.partOfSpeech;
      LIBRARY_DATA.sourceMappings[id] = [
        { lemmaId: entry.lemmaId, formId: form.formId },
      ];
    }
  LIBRARY_DATA.sentenceOrigins = {};
  // No sentence catalogue is built before study. The engine compiles current eligible state on request.
  const meaningOrigins = new Map();
  const deepFreeze = (value) => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.values(value).forEach(deepFreeze);
      Object.freeze(value);
    }
    return value;
  };
  // Lexical evidence is build-time data. Acquisition lives in progress, never here.
  // Immutable roots allow compiler views to share one index without stale edits.
  deepFreeze(LIBRARY_DATA.entries);
  deepFreeze(LIBRARY_DATA.generationEvidence);
  deepFreeze(LIBRARY_DATA.generationAttestations);
  function registerGenerated(card) {
    if (wordById[card.id]) return wordById[card.id];
    if (
      card.type !== "sentence" ||
      card.generated?.origin !== "productive_engine"
    )
      throw Error("Only compiler output may register a sentence");
    {
      const check = SentenceEngine.restoreCard(
        LIBRARY_DATA,
        LIBRARY_DATA.sentenceFrames,
        card,
      );
      if (!check || JSON.stringify(check) !== JSON.stringify(card))
        throw Error("Sentence body does not match its compiler proof");
    }
    deepFreeze(card);
    wordById[card.id] = card;
    LIBRARY_DATA.cardTypes[card.id] = "sentence";
    const meaning = card.ps + "\n" + card.en,
      origin = meaningOrigins.get(meaning) || card.id;
    meaningOrigins.set(meaning, origin);
    LIBRARY_DATA.sentenceOrigins[card.id] = origin;
    LIBRARY_DATA.sourceMappings[card.id] = [
      ...new Map(
        Object.values(card.generated.slots).map((r) => [r.formId, r]),
      ).values(),
    ];
    LIBRARY_DATA.cardDays[card.id] = card.loop;
    return card;
  }
  function restoreGenerated(progress) {
    // A practiced meaning's first registered binding owns its SRS/reward key.
    // Restore those owners before plan snapshots, which may contain an equivalent
    // binding from a different frame and were not necessarily registered first.
    for (const id of Object.keys(progress.library?.units || {})) {
      if (!id.startsWith("generated:")) continue;
      const card = SentenceEngine.restoreId(
        LIBRARY_DATA,
        LIBRARY_DATA.sentenceFrames,
        id,
      );
      if (!card) return false;
      registerGenerated(card);
    }
    const snapshots = [];
    for (const plan of Object.values(progress.library?.plans || {})) {
      for (const cards of Object.values(plan.generatedPracticeCards || {}))
        snapshots.push(...cards);
      for (const q of plan.challengeQuestions || [])
        snapshots.push(q.generated, q.promptGenerated);
    }
    for (const q of progress.activeChallenge?.questions || [])
      snapshots.push(q.generated, q.promptGenerated);
    for (const snapshot of snapshots.filter(Boolean)) {
      const card = SentenceEngine.restoreCard(
        LIBRARY_DATA,
        LIBRARY_DATA.sentenceFrames,
        snapshot,
      );
      if (!card || JSON.stringify(card) !== JSON.stringify(snapshot))
        return false;
      registerGenerated(card);
    }
    for (const delivery of Object.values(progress.library?.deliveries || {})) {
      if (delivery.kind !== "generated_sentence" || wordById[delivery.id])
        continue;
      const card = SentenceEngine.restoreId(
        LIBRARY_DATA,
        LIBRARY_DATA.sentenceFrames,
        delivery.id,
      );
      if (!card) return false;
      registerGenerated(card);
    }
    return true;
  }
  // Four guided study cards introduce the game's interaction types.
  const tutorialCards = [
    {
      id: "g-hello",
      kind: "choice",
      help: "Choose the meaning of this conventional greeting.",
    },
    {
      id: "g-how",
      kind: "tiles",
      help: "Arrange the words of this conventional greeting, taught as one fixed phrase.",
    },
    {
      id: "tutorial-gender",
      kind: "gender",
      help: "Optional profile preference. This is an English interface question, not Pashto language instruction.",
    },
    {
      id: "tutorial-name",
      kind: "name",
      help: "Choose your player name. This is an English interface question, not Pashto language instruction.",
    },
  ];
  for (const [id, en] of [
    ["tutorial-gender", "Your gender preference"],
    ["tutorial-name", "Your player name"],
  ]) {
    wordById[id] = {
      id,
      type: "profile",
      loop: 0,
      ps: "",
      roman: "",
      en,
      note: "English profile setting",
    };
    LIBRARY_DATA.cardTypes[id] = "profile";
  }
  const tutorialIds = tutorialCards.map((c) => c.id);
  return {
    registerGenerated,
    restoreGenerated,
    zones,
    wordById,
    curriculum,
    dayById,
    zoneKeys,
    villagePeople,
    peopleByName,
    peopleAt,
    teacherFor,
    tutorialCards,
    tutorialIds,
    libraryEntries,
    LIBRARY_DATA,
    NARRATIVE_DATA,
  };
}
