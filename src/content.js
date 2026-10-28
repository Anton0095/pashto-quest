/* Runtime catalog derived from authored curriculum and lexical identities. No DOM or player state. */
function createContent(GAME_DATA, WEEK2_DATA, LIBRARY_DATA, NARRATIVE_DATA) {
  const { words, courses, loops, zones } = GAME_DATA;
  if (words.some((w) => w.type === "sentence"))
    throw Error("Authored sentences are forbidden in the runtime catalog");
  const wordById = Object.fromEntries(words.map((w) => [w.id, w]));
  LIBRARY_DATA.cardDays = Object.fromEntries(words.map((w) => [w.id, w.loop]));
  const week2Days = Object.fromEntries(WEEK2_DATA.days.map((d) => [d.day, d]));
  const zoneKeys = ["residential", "nature", "business", "school"];
  const libraryEntries = Object.fromEntries(
    LIBRARY_DATA.entries.map((e) => [e.lemmaId, e]),
  );
  const villagePeople = {
    residential: {
      name: "Muhammad Jan",
      face: "👴",
      description: "An older village leader, patient and wise.",
      welcome:
        "Welcome back, my friend! A home is the best place to start learning about the village.",
      words:
        "Look around our home. The door, rooms and other familiar things are a fine place to begin.",
    },
    business: {
      name: "Edris",
      face: "🧑‍🌾",
      description: "The grocer who loves a good chat.",
      welcome:
        "Salaam! Come closer. There is always something interesting to see at my shop!",
      words:
        "A market is full of useful words. Look at the food, the shop and everything around you.",
    },
    nature: {
      name: "Saleha",
      face: "👩‍🎓",
      description: "A fellow student from your school.",
      welcome:
        "You are new here too? I am Saleha! I often come to the lake after school.",
      words:
        "It is peaceful beside the lake. We can describe the water and the river together.",
    },
    school: {
      name: "Ms Hameed",
      face: "👩‍🏫",
      description: "Your Pashto teacher at the village school.",
      welcome:
        "Welcome to class. We will build your Pashto one clear step at a time.",
      words:
        "We will study these words carefully, then use them in complete sentences.",
    },
  };
  const roamingTeachers = {
    5: {
      residential: "Muhammad Jan",
      business: "Edris",
      nature: "Saleha",
      school: "Ms Hameed",
    },
    6: {
      residential: "Saleha",
      business: "Muhammad Jan",
      nature: "Saleha",
      school: "Ms Hameed",
    },
    7: {
      residential: "Muhammad Jan",
      business: "Edris",
      nature: "Ms Hameed",
      school: "Saleha",
    },
  };
  const peopleByName = Object.fromEntries(
    [
      ...Object.values(villagePeople),
      {
        name: "Mina",
        face: "👧",
        description: "Saleha’s sister",
        role: "Saleha’s sister",
      },
    ].map((p) => [p.name, p]),
  );
  const peopleAt = {
    5: {
      residential: ["Muhammad Jan", "Edris"],
      business: ["Edris", "Saleha"],
      nature: ["Saleha", "Muhammad Jan", "Ms Hameed", "Edris"],
      school: ["Ms Hameed", "Saleha"],
    },
    6: {
      residential: ["Saleha", "Muhammad Jan"],
      business: ["Muhammad Jan", "Edris"],
      nature: ["Saleha", "Mina"],
      school: ["Ms Hameed", "Mina"],
    },
    7: {
      residential: ["Muhammad Jan", "Saleha"],
      business: ["Edris", "Muhammad Jan"],
      nature: ["Ms Hameed", "Saleha", "Mina"],
      school: ["Saleha", "Ms Hameed"],
    },
  };
  function teacherFor(loop, loc, mode) {
    if (mode === "tutorial") return villagePeople.residential;
    if (loop >= 8) {
      const day = week2Days[loop];
      return (
        peopleByName[
          mode === "challenge"
            ? loop === 14
              ? "Ms Hameed"
              : day.lessons.find((l) => l.location === day.opening).teacher
            : day.lessons.find((l) => l.location === loc)?.teacher
        ] || villagePeople.school
      );
    }
    if (mode === "challenge") {
      if (loop === 7) return villagePeople.school;
      if (loop === 6) return villagePeople.nature;
      if (loop === 3) return villagePeople.business;
      if (loop === 5) return villagePeople.nature;
      return villagePeople.residential;
    }
    if (loop <= 4 && villagePeople[loc]) return villagePeople[loc];
    return peopleByName[roamingTeachers[loop]?.[loc]] || villagePeople.school;
  }
  for (const day of WEEK2_DATA.days) {
    const d = day.day;
    peopleAt[d] = {};
    roamingTeachers[d] = {};
    for (const [i, lesson] of day.lessons.entries()) {
      const visitor = ["Mina", "Saleha", "Muhammad Jan", "Edris", "Ms Hameed"][
        (d + i) % 5
      ];
      peopleAt[d][lesson.location] = [
        ...new Set([
          ...lesson.participants,
          visitor,
          ...(d === 14 && lesson.location === "residential"
            ? ["Ms Hameed"]
            : []),
        ]),
      ];
      roamingTeachers[d][lesson.location] = lesson.teacher;
    }
  }
  for (const phrase of LIBRARY_DATA.phrases) {
    wordById[phrase.id] ||= {
      id: phrase.id,
      loop: phrase.day || 0,
      type: "greeting",
      phraseException: phrase.id,
      ps: phrase.pashto,
      roman: phrase.romanisation,
      en: phrase.english,
      place: phrase.location || "library",
      note: "Fixed expression; provisional romanisation, native Laghman review pending.",
      dialect: "",
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
      dialect: "",
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
        dialect: "",
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
      dialect: "",
    };
    LIBRARY_DATA.cardTypes[id] = "profile";
  }
  const tutorialIds = tutorialCards.map((c) => c.id);
  const townStories = {
    1: "Muhammad Jan welcomes you. Edris is at the market, Saleha is by the lake, and Ms Hameed is at school.",
    2: "Ms Hameed introduces S–O–V. Visit the market and lake before returning home to Muhammad Jan.",
    3: "Saleha shows you how to talk about yourself. Practise around town, then shop for dinner with Edris.",
    4: "Muhammad Jan welcomes you home to learn informal ته and link actions using او. Return for a friendly conversation at the end of the day.",
    5: "Ms Hameed teaches respectful/plural تاسې. The whole village is preparing to gather beside the lake. Characters can now visit different locations.",
    6: "Saleha introduces her sister Mina beside the lake. Practise shared actions around town, then walk together in the Hills.",
    7: "Edris describes groups of shoppers. Ms Hameed welcomes you to the separate 25-question Week 1 examination at School.",
  };
  return {
    registerGenerated,
    restoreGenerated,
    townStories,
    words,
    courses,
    loops,
    zones,
    wordById,
    curriculum: LIBRARY_DATA.curriculum,
    week2Days,
    zoneKeys,
    villagePeople,
    roamingTeachers,
    peopleByName,
    peopleAt,
    teacherFor,
    tutorialCards,
    tutorialIds,
    libraryEntries,
    LIBRARY_DATA,
    NARRATIVE_DATA,
    WEEK2_DATA,
  };
}
