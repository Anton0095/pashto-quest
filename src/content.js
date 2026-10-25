/* Runtime catalog derived from authored curriculum and lexical identities. No DOM or player state. */
function createContent(GAME_DATA, WEEK2_DATA, LIBRARY_DATA, NARRATIVE_DATA) {
  const { words, courses, loops, zones } = GAME_DATA;
  const wordById = Object.fromEntries(words.map((w) => [w.id, w]));
  const week2Days = Object.fromEntries(WEEK2_DATA.days.map((d) => [d.day, d]));
  const zoneKeys = ["residential", "nature", "business", "school"];
  const libraryEntries = Object.fromEntries(
    LIBRARY_DATA.entries.map((e) => [e.lemmaId, e]),
  );
  const dayTwoScenes = {
    school:
      "Ms Hameed: “Good morning! Watch me read, write and open this book. Before we practise, I will show you how a Pashto action sentence puts its verb at the end.”",
    business:
      "Edris: “Salaam again! Look at my customers. One buys an apple, another carries a bag, and I sell bread. What actions can you describe?”",
    nature:
      "Saleha: “Look! There are fish and birds by the water. Let us describe what people see, drink, catch and throw.”",
    residential:
      "Muhammad Jan: “You are home! Tell me what people do here: open and close the door, drink tea, and clean the room. Then we will see what you remember.”",
  };
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
  const advancedScenes = {
    4: {
      residential:
        "Muhammad Jan: “You have learnt to speak about yourself. Now we will use ته when talking to a familiar person, and join two meaningful thoughts with او — and.”",
      business:
        "Edris: “Imagine you are speaking to a friend who buys bread while you carry a bag. Describe what you each do!”",
      nature:
        "Saleha: “Look at the fish and birds. You see the bird and I see the fish. Let us say both ideas together.”",
      school:
        "Ms Hameed: “Two clauses can each have their own subject and verb. Try saying what your classmate does, then what you do.”",
    },
    5: {
      residential:
        "Muhammad Jan: “Our neighbours are coming together near the lake. With elders, the polite تاسې is usually the respectful choice.”",
      business:
        "Edris: “Saleha is helping at the shop today! You can use ته with a friend like her, and تاسې to speak to me politely.”",
      nature:
        "Saleha: “Everyone is gathering at the lake! Muhammad Jan and Ms Hameed will be here too. Practise speaking to a group with تاسې.”",
      school:
        "Ms Hameed: “Today you will learn how to use تاسې for elders, teachers, and groups, and how it changes the verb endings.”",
    },
    6: {
      residential:
        "Saleha: “I came to visit Muhammad Jan. Let us talk about what WE do together.”",
      nature:
        "Saleha: “Meet my sister Mina! Join us beside the lake. I run; Mina and I run together; WE run together. You both means the people I address, not my own group.”",
      business:
        "Muhammad Jan: “I stopped by Edris’s shop. We can talk about what WE buy and sell.”",
      school:
        "Ms Hameed: “Now we will practise first-person plural forms: موږ, we.”",
    },
    7: {
      residential:
        "Muhammad Jan: “Our village is busy with visitors. Let us describe what THEY do.”",
      nature:
        "Ms Hameed: “We came here with Saleha. Can you describe what the people and birds around us do?”",
      business:
        "Edris: “Look at the customers by the fruit stall. They buy apples and carry baskets. The sellers at the bread stall are another group: they sell bread. Neither group includes you or me.”",
      school:
        "Saleha: “I am visiting our classroom. Practise telling me what the other students do.”",
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
  // Four guided study cards introduce the game's interaction types.
  const tutorialCards = [
    {
      id: "g-hello",
      kind: "choice",
      help: "Read Salaam and its pronunciation. Tap the correct English meaning; then Continue.",
    },
    {
      id: "g-how",
      kind: "tiles",
      help: "Tap the Pashto word tiles in the order needed to ask 'How are you?'. Use Undo or Clear if needed.",
    },
    {
      id: "tutorial-gender",
      kind: "gender",
      ps: "ستاسو جنسیت څه دی؟",
      roman: "Staaso jinsiyat tsa day?",
      en: "What is your gender?",
      help: "Answer the question rather than translating it. Select the option that suits you, or prefer not to say.",
    },
    {
      id: "tutorial-name",
      kind: "name",
      ps: "ستا نوم څه دی؟",
      roman: "Sta num tsa day?",
      en: "What is your name?",
      help: "Type your own answer. Your name and gender preference are only saved in this browser's game progress.",
    },
  ];
  for (const c of tutorialCards) {
    if (c.ps)
      wordById[c.id] = {
        id: c.id,
        loop: 0,
        place: "guide",
        type: "greeting",
        ps: c.ps,
        roman: c.roman,
        en: c.en,
        note: "Provisional Afghan Pashto; native Laghman language review pending.",
        dialect: "",
      };
    if (!LIBRARY_DATA.phrases.some((p) => p.id === c.id)) {
      const w = wordById[c.id];
      LIBRARY_DATA.phrases.push({
        id: c.id,
        pashto: w.ps,
        romanisation: w.roman,
        english: w.en,
        reviewStatus: "needsNativeLaghmanReview",
      });
    }
  }
  const tutorialIds = tutorialCards.map((c) => c.id);
  const dinnerLines = [
    "Salaam! Welcome to my market. Let’s get ready for dinner.",
    "This is a common ingredient. Can you name it?",
    "Now for another ingredient to take home.",
    "What action do you do when you pay for food?",
    "Tell me how to say that you want something.",
    "Good. Tell me what you are buying.",
    "Suppose you ask for onions. What would you say?",
    "Sometimes fruit costs too much. What does this mean?",
    "I have baked some bread. What do you understand?",
    "A customer is eating bread. What is happening?",
    "Now speak to me directly: say you are buying potatoes.",
    "Do not forget the bread. Tell me you are buying it.",
    "Imagine dinner is ready. Say that you eat bread.",
    "You need a way to carry everything home. Tell me.",
    "And what will you drink with dinner? One last sentence!",
  ];
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
    townStories,
    dinnerLines,
    words,
    courses,
    loops,
    zones,
    wordById,
    week2Days,
    zoneKeys,
    dayTwoScenes,
    villagePeople,
    roamingTeachers,
    peopleByName,
    peopleAt,
    advancedScenes,
    teacherFor,
    tutorialCards,
    tutorialIds,
    libraryEntries,
    LIBRARY_DATA,
    NARRATIVE_DATA,
    WEEK2_DATA,
  };
}
