/* Authored question blueprints and narrative contexts. Content, not grading or rendering. */
function createAssessmentContent({ content, progression, shuffle }) {
  function sampleUnique(items, count, used = new Set()) {
    const pool = shuffle(items.filter((x) => !used.has(x)));
    const taken = pool.slice(0, count);
    taken.forEach((id) => used.add(id));
    return taken;
  }
  function makeContextQuestion(
    id,
    kind,
    direction,
    speaker,
    recipient,
    comment,
  ) {
    return { id, kind, direction, speaker, recipient, comment };
  }
  function choiceQuestion(
    id,
    prompt,
    correct,
    options,
    speaker = "Saleha",
    recipient = "Player",
    extra = {},
  ) {
    return {
      id,
      kind: "choice",
      direction: "en-ps",
      prompt,
      correct,
      options,
      speaker,
      recipient,
      ...extra,
    };
  }
  function authoredQuestion(id, kind, speaker, recipient, comment, section) {
    return {
      ...makeContextQuestion(
        id,
        kind,
        kind === "construct" ? "en-ps" : "ps-en",
        speaker,
        recipient,
        comment,
      ),
      section,
    };
  }
  function week1Questions(day) {
    const people = ["Saleha", "Mina"];
    if (day === 6)
      return [
        choiceQuestion(
          "hills-we",
          "Saleha asks you: Which pronoun describes a group including the person speaking?",
          "موږ",
          ["موږ", "تاسې", "زه", "ته"],
        ),
        choiceQuestion(
          "hills-together",
          "Mina asks you: What does یو ځای mean?",
          "Together",
          ["Together", "Alone", "A book", "Water"],
          "Mina",
        ),
        choiceQuestion(
          "hills-river",
          "Saleha points to the river: choose سیند in English.",
          "River",
          ["River", "School", "Bread", "Room"],
        ),
        choiceQuestion(
          "hills-you",
          "Mina asks you: Which pronoun addresses both sisters without including you?",
          "تاسې",
          ["تاسې", "موږ", "زه", "ته"],
          "Mina",
        ),
        choiceQuestion(
          "hills-run",
          "Saleha asks you: What does منډې وهل mean?",
          "To run",
          ["To run", "To read", "To buy", "To write"],
        ),
        choiceQuestion(
          "hills-transform",
          "Saleha models زه منډې وهم (I run). Choose “We run together”.",
          "موږ یو ځای منډې وهو.",
          [
            "موږ یو ځای منډې وهو.",
            "زه منډې وهم.",
            "تاسې منډې وهئ.",
            "ته منډې وهې.",
          ],
        ),
        choiceQuestion(
          "hills-subject",
          "Mina invites you to describe yourself: “Mina and I walk together.” Who is included?",
          "The player and Mina",
          [
            "The player and Mina",
            "Only Mina",
            "Only Saleha",
            "The two sisters without the player",
          ],
          "Mina",
        ),
        choiceQuestion(
          "hills-birds",
          "Saleha asks you: Choose “We see two birds” (speaker included).",
          "موږ دوه مرغان وینو.",
          [
            "موږ دوه مرغان وینو.",
            "تاسې دوه مرغان وینئ.",
            "زه دوه مرغان وینم.",
            "ته دوه مرغان وینې.",
          ],
        ),
        authoredQuestion(
          "w6-river-water",
          "sentence",
          "Mina",
          "Player",
          "Mina asks you to recognise a shared action. “We” includes the person speaking.",
          "meaning",
        ),
        choiceQuestion(
          "hills-carry",
          "You tell Saleha and Mina: تاسې دواړه اوبه وړئ. Who carries the water?",
          "Saleha and Mina, whom you address",
          [
            "Saleha and Mina, whom you address",
            "You alone",
            "You and Mina",
            "Muhammad Jan",
          ],
          "Saleha",
          "Saleha and Mina",
        ),
        authoredQuestion(
          "w6-walk",
          "construct",
          "Saleha",
          "Saleha and Mina",
          "Saleha asks you to describe walking with both sisters.",
          "build",
        ),
        authoredQuestion(
          "w6-mina-village",
          "construct",
          "Mina",
          "Saleha",
          "Mina asks for your response about yourself and Mina; “I” is the player, not Mina.",
          "build",
        ),
        authoredQuestion(
          "w6-you-water",
          "construct",
          "Saleha",
          "Saleha and Mina",
          "Saleha asks you to address both sisters, excluding yourself.",
          "build",
        ),
        authoredQuestion(
          "w6-bag",
          "construct",
          "Mina",
          "Mina",
          "Mina asks you to describe your shared task.",
          "build",
        ),
        authoredQuestion(
          "w6-compound",
          "construct",
          "Saleha",
          "Saleha and Mina",
          "Saleha asks for two clauses. Vocabulary help: غونډۍ means hills.",
          "build",
        ),
      ].map((q) => ({
        ...q,
        audioId: {
          "hills-we": "w6-we",
          "hills-together": "w6-together",
          "hills-you": "w6-you-all",
          "hills-run": "w6-run",
          "hills-transform": "w6-we-run",
          "hills-birds": "w6-river-birds",
          "hills-carry": "w6-you-carry",
        }[q.id],
        participants: people,
        day: 6,
        location: "hills",
      }));
    const pronouns = [
      [
        "we",
        "You describe yourself and Mina. Choose the pronoun for your group.",
        "موږ",
        "Mina",
      ],
      ["friend", "You address Saleha, one familiar friend.", "ته", "Saleha"],
      ["respect", "You address Ms Hameed respectfully.", "تاسې", "Ms Hameed"],
      [
        "group",
        "You address Saleha and Mina together.",
        "تاسې",
        "Saleha and Mina",
      ],
      [
        "they",
        "You describe customers elsewhere in the market, excluding yourself.",
        "هغوی",
        "Edris",
      ],
    ].map(([id, prompt, correct, recipient]) =>
      choiceQuestion(
        "exam-pronoun-" + id,
        prompt,
        correct,
        ["موږ", "ته", "تاسې", "هغوی"],
        "Ms Hameed",
        recipient,
        { section: "pronouns" },
      ),
    );
    const verbs = [
      [
        "i",
        "I read a book: زه کتاب ___.",
        "لولم",
        ["لولم", "لولې", "لولو", "لولي"],
        "Player",
      ],
      [
        "you",
        "You, Saleha, read a book: ته کتاب ___.",
        "لولې",
        ["لولې", "لولم", "لولو", "لولي"],
        "Saleha",
      ],
      [
        "we",
        "We read books: موږ کتابونه ___.",
        "لولو",
        ["لولو", "لولم", "لولي", "لولئ"],
        "Ms Hameed",
      ],
      [
        "all",
        "You all read books: تاسې کتابونه ___.",
        "لولئ",
        ["لولئ", "لولو", "لولم", "لولي"],
        "Saleha and Mina",
      ],
      [
        "they",
        "They, the other students, read books: هغوی کتابونه ___.",
        "لولي",
        ["لولي", "لولو", "لولم", "لولئ"],
        "Player",
      ],
    ].map(([id, prompt, correct, options, recipient]) =>
      choiceQuestion(
        "exam-verb-" + id,
        prompt,
        correct,
        options,
        "Ms Hameed",
        recipient,
        { section: "verbs" },
      ),
    );
    const sov = [
      "w7-he-bread",
      "s1-water",
      "w6-river-birds",
      "w7-market-baskets",
      "w7-you-open",
    ].map((id, i) =>
      authoredQuestion(
        id,
        "construct",
        "Ms Hameed",
        i === 4 ? "Saleha" : "Ms Hameed",
        "Ms Hameed asks you to build a subject–object–verb sentence. The response is yours.",
        "sov",
      ),
    );
    const compound = [
      "w7-compound-room",
      "w7-compound-read",
      "w7-compound-buy",
      "w7-compound-books",
      "w7-compound-door",
    ].map((id, i) =>
      authoredQuestion(
        id,
        "construct",
        "Ms Hameed",
        i < 2 ? "Saleha" : i === 3 ? "Saleha and Mina" : "Ms Hameed",
        "Ms Hameed asks you to join two present-tense clauses with او.",
        "compounds",
      ),
    );
    const dialogue = [
      [
        "w6-we-run",
        "Mina invites you to join the group. Reply “We run together”.",
        "Mina",
      ],
      [
        "w7-you-bird",
        "You address Saleha alone: “You see the bird”.",
        "Saleha",
      ],
      [
        "w7-polite-tea",
        "You respectfully address Muhammad Jan: “You drink tea”.",
        "Muhammad Jan",
      ],
      [
        "w6-river-you-walk",
        "You address both sisters: “You both walk beside the river”.",
        "Saleha and Mina",
      ],
      [
        "w7-market-apples",
        "Edris points to the fruit customers. Tell him “They buy apples”.",
        "Edris",
      ],
    ].map(([id, prompt, recipient]) => {
      const w = content.wordById[id];
      return choiceQuestion(
        "exam-dialogue-" + id,
        prompt,
        w.ps,
        makeAuthoredOptions(id),
        "Ms Hameed",
        recipient,
        {
          section: "dialogue",
          audioId: id,
          comment:
            "Ms Hameed presents this scenario; the player supplies the quoted response.",
        },
      );
    });
    return [...pronouns, ...verbs, ...sov, ...compound, ...dialogue].map(
      (q) => ({
        ...q,
        day: 7,
        location: "school",
        participants: [
          "Ms Hameed",
          ...(content.peopleByName[q.recipient] ? [q.recipient] : []),
        ],
      }),
    );
  }
  function makeAuthoredOptions(id) {
    const alternatives = {
      "w6-we-run": ["زه منډې وهم.", "تاسې منډې وهئ.", "هغوی منډې وهي."],
      "w7-you-bird": ["زه مرغۍ وینم.", "موږ مرغۍ وینو.", "هغوی مرغۍ ویني."],
      "w7-polite-tea": ["ته چای څښې.", "زه چای څښم.", "موږ چای څښو."],
      "w6-river-you-walk": [
        "موږ د سیند تر څنګ ګرځو.",
        "زه د سیند تر څنګ ګرځم.",
        "هغوی د سیند تر څنګ ګرځي.",
      ],
      "w7-market-apples": ["موږ مڼې اخلو.", "زه مڼې اخلم.", "تاسې مڼې اخلئ."],
    };
    return [content.wordById[id].ps, ...alternatives[id]];
  }
  function specialDayChallenge(day) {
    if (day === 4) {
      // Muhammad Jan is an elder; informal "you" prompts address a friend, not Muhammad Jan.
      return [
        ...[
          "n-chair4",
          "n-basket4",
          "n-sentence4",
          "v-give",
          "n-question4",
        ].map((id, i) =>
          makeContextQuestion(
            id,
            "word",
            i % 2 ? "en-ps" : "ps-en",
            "Muhammad Jan",
            "Muhammad Jan",
            "Muhammad Jan reviews objects and actions you have met today.",
          ),
        ),
        ...[
          "s4-house-room",
          "s4-market-mixed",
          "s4-river-bird",
          "s4-school-words",
          "s4-house-tea",
        ].map((id, i) =>
          makeContextQuestion(
            id,
            "sentence",
            i % 2 ? "en-ps" : "ps-en",
            "Muhammad Jan",
            "Saleha",
            "Describe what you and your friend Saleha do, using informal “you” for Saleha.",
          ),
        ),
        ...[
          "s4-house-compound",
          "s4-house-window",
          "s4-market-mixed2",
          "s4-river-water",
          "s4-school-learn",
        ].map((id) =>
          makeContextQuestion(
            id,
            "construct",
            "en-ps",
            "Muhammad Jan",
            "Saleha",
            "Build both clauses. The “you” in the example addresses your familiar friend, not Muhammad Jan.",
          ),
        ),
      ];
    }
    if (day === 5) {
      const address = [
        {
          speaker: "Saleha",
          recipient: "Saleha",
          scope: "friend",
          correct: "ته",
          comment:
            "You are speaking to Saleha, a familiar student. Choose the informal singular pronoun.",
        },
        {
          speaker: "Saleha",
          recipient: "Muhammad Jan",
          scope: "elder",
          correct: "تاسې",
          comment:
            "Saleha invites you to greet Muhammad Jan, an older respected village leader.",
        },
        {
          speaker: "Ms Hameed",
          recipient: "a familiar classmate",
          scope: "friend",
          correct: "ته",
          comment:
            "Ms Hameed invites you to speak to another young classmate you know well. Choose informal singular.",
        },
        {
          speaker: "Muhammad Jan",
          recipient: "Edris",
          scope: "adult",
          correct: "تاسې",
          comment: "Muhammad Jan asks you to address Edris respectfully.",
        },
        {
          speaker: "Ms Hameed",
          recipient: "Saleha and Edris together",
          scope: "group",
          correct: "تاسې",
          comment:
            "Ms Hameed asks you to address two people together: plural “you”.",
        },
      ].map((a, i) => ({
        id: "address5-" + i,
        kind: "address",
        direction: "en-ps",
        ...a,
      }));
      const meanings = [
        makeContextQuestion(
          "s2-read",
          "sentence",
          "ps-en",
          "Saleha",
          "Saleha",
          "Recall how friends use informal ته.",
        ),
        makeContextQuestion(
          "s5-read",
          "sentence",
          "en-ps",
          "Ms Hameed",
          "Ms Hameed",
          "Show respect when addressing your teacher.",
        ),
        makeContextQuestion(
          "s5-home-tea",
          "sentence",
          "ps-en",
          "Saleha",
          "Muhammad Jan",
          "Speak politely about tea with an elder.",
        ),
        makeContextQuestion(
          "s5-market-bread",
          "sentence",
          "en-ps",
          "Saleha",
          "Edris",
          "Use polite “you” when talking to the grocer.",
        ),
        makeContextQuestion(
          "s5-lake-fish",
          "sentence",
          "ps-en",
          "Muhammad Jan",
          "Saleha and Edris together",
          "Address the two people together, using plural “you”.",
        ),
      ];
      const builds = [
        makeContextQuestion(
          "s4-river-fish",
          "construct",
          "en-ps",
          "Saleha",
          "Saleha",
          "Speak informally with your friend Saleha.",
        ),
        makeContextQuestion(
          "s5-school-pashto",
          "construct",
          "en-ps",
          "Ms Hameed",
          "Ms Hameed and other teachers",
          "Use plural “you” for a group.",
        ),
        makeContextQuestion(
          "s5-market-fruit",
          "construct",
          "en-ps",
          "Saleha",
          "Edris",
          "Politely address the shopkeeper.",
        ),
        makeContextQuestion(
          "s5-lake-water",
          "construct",
          "en-ps",
          "Edris",
          "the gathered villagers",
          "Speak to everyone together in the plural.",
        ),
        makeContextQuestion(
          "s5-home-compare",
          "construct",
          "en-ps",
          "Muhammad Jan",
          "Muhammad Jan",
          "Speak respectfully to the village elder and use “I” in the second clause.",
        ),
      ];
      return [...address, ...meanings, ...builds];
    }
    return null;
  }
  function selectWeek2Challenge(day) {
    const plan = content.week2Days[day],
      spec = progression.getChallengeSpec(day),
      questions = plan.dialogues.map((q) => ({
        ...q,
        comment: q.context,
        location: spec.scene,
      }));
    const usedPs = new Set(
        questions.map((q) =>
          QuestionEngine.normalizePashtoResponse(q.answerPs),
        ),
      ),
      usedIds = new Set(questions.map((q) => q.id));
    const cards = Array.from({ length: 5 }, (_, i) =>
      plan.lessons.map((l) => l.cards[i]),
    ).flat();
    let wordIndex = 0,
      cardIndex = 0,
      kindIndex = 0;
    while (questions.length < spec.questionCount) {
      const kind = ["word", "sentence", "construct"][kindIndex++ % 3];
      if (kind === "word" && wordIndex < plan.vocabulary.length) {
        const w = plan.vocabulary[wordIndex++];
        questions.push({
          id: w.id,
          kind: "word",
          direction: wordIndex % 2 ? "ps-en" : "en-ps",
          speaker: content.teacherFor(day, null, "challenge").name,
          recipient: content.teacherFor(day, null, "challenge").name,
          comment: "Recall this word from the week’s topic.",
          participants: [content.teacherFor(day, null, "challenge").name],
        });
        continue;
      }
      let card;
      while (cardIndex < cards.length) {
        const candidate = cards[cardIndex++];
        if (
          !usedPs.has(
            QuestionEngine.normalizePashtoResponse(candidate.pashto),
          ) &&
          !usedIds.has(candidate.id)
        ) {
          card = candidate;
          break;
        }
      }
      if (!card)
        throw Error("Insufficient distinct Week 2 content for Day " + day);
      usedIds.add(card.id);
      usedPs.add(QuestionEngine.normalizePashtoResponse(card.pashto));
      questions.push({
        id: card.id,
        kind: kind === "construct" ? "construct" : "sentence",
        direction: kind === "construct" ? "en-ps" : "ps-en",
        duds: kind === "construct" ? card.duds : undefined,
        speaker: content.teacherFor(day, null, "challenge").name,
        recipient: content.teacherFor(day, null, "challenge").name,
        participants: [content.teacherFor(day, null, "challenge").name],
        comment: `Study example spoken by ${card.speaker}, addressed to ${card.recipient}. ${card.note}`,
      });
    }
    if (
      questions.length !== spec.questionCount ||
      new Set(questions.map((q) => q.id)).size !== questions.length
    )
      throw Error("Invalid Week 2 challenge");
    for (const q of questions)
      if (QuestionEngine.questionUsesDuds(q, day))
        QuestionEngine.getAnswerTiles(
          q.kind === "dialogue" ? q.answerPs : content.wordById[q.id].ps,
          q.duds,
        );
    return questions;
  }
  function selectAuthoredChallenge(day) {
    if (day >= 8) return selectWeek2Challenge(day);
    if (day >= 6) {
      const q = week1Questions(day);
      if (
        q.length !== progression.getChallengeSpec(day).questionCount ||
        q.some(
          (x) =>
            !x.speaker ||
            !x.recipient ||
            (x.kind !== "choice" && !content.wordById[x.id]),
        )
      )
        throw Error("Invalid authored Week 1 assessment");
      return q;
    }
    if (day === 4 || day === 5) {
      const questions = specialDayChallenge(day);
      if (
        questions.length !== progression.getChallengeSpec(day).questionCount ||
        questions.some((q) => q.kind !== "address" && !content.wordById[q.id])
      )
        throw Error("Invalid Day " + day + " narrative questions");
      return questions;
    }
    if (day === 3) {
      const wordIds = ["n-apple", "n-potato3", "n-onion3", "v-buy", "v-want3"];
      const meaningIds = [
        "s1-buy",
        "s1-onions",
        "s1-price",
        "s3-fresh",
        "s3-eat",
      ];
      const buildIds = [
        "s1-potatoes",
        "s1-bread-buy",
        "s1-eat",
        "s1-bag",
        "s1-water",
      ];
      const qs = [
        ...wordIds.map((id, i) => ({
          id,
          kind: "word",
          direction: i % 2 ? "en-ps" : "ps-en",
        })),
        ...meaningIds.map((id, i) => ({
          id,
          kind: "sentence",
          direction: i % 2 ? "en-ps" : "ps-en",
        })),
        ...buildIds.map((id) => ({
          id,
          kind: "construct",
          direction: "en-ps",
        })),
      ];
      if (
        qs.length !== progression.getChallengeSpec(day).questionCount ||
        qs.some(
          (q) => !content.wordById[q.id] || content.wordById[q.id].loop > day,
        )
      )
        throw Error("Invalid dinner conversation questions");
      return qs;
    }
    const current = content.zoneKeys.flatMap(
      (z) => content.courses[`${day}-${z}`] || [],
    );
    const historical = content.zoneKeys.flatMap((z) =>
      Array.from(
        { length: day - 1 },
        (_, i) => content.courses[`${i + 1}-${z}`] || [],
      ).flat(),
    );
    const lexical = (id) => content.wordById[id]?.type !== "sentence",
      sentence = (id) => content.wordById[id]?.type === "sentence";
    const questionSet = [];
    // A guaranteed visit to each location, and an earlier-day recall as soon as one is available.
    const pickFour = (filter, used) =>
      content.zoneKeys
        .map(
          (z) =>
            sampleUnique(
              (content.courses[`${day}-${z}`] || []).filter(filter),
              1,
              used,
            )[0],
        )
        .filter(Boolean);
    const wordUsed = new Set(),
      sentenceUsed = new Set();
    let vocab = pickFour(lexical, wordUsed);
    let extras =
      day > 1 ? sampleUnique(historical.filter(lexical), 1, wordUsed) : [];
    if (!extras.length)
      extras = sampleUnique(current.filter(lexical), 1, wordUsed);
    vocab.push(...extras);
    for (let i = 0; i < 5; i++)
      questionSet.push({
        id: vocab[i],
        kind: "word",
        direction: i % 2 === 0 ? "ps-en" : "en-ps",
      });
    let meanings = pickFour(sentence, sentenceUsed);
    let extraMeaning =
      day > 1 ? sampleUnique(historical.filter(sentence), 1, sentenceUsed) : [];
    if (!extraMeaning.length)
      extraMeaning = sampleUnique(current.filter(sentence), 1, sentenceUsed);
    meanings.push(...extraMeaning);
    for (let i = 0; i < 5; i++)
      questionSet.push({
        id: meanings[i],
        kind: "sentence",
        direction: i % 2 === 0 ? "ps-en" : "en-ps",
      });
    const buildUsed = new Set();
    let builds = pickFour(sentence, buildUsed);
    let extraBuild =
      day > 1 ? sampleUnique(historical.filter(sentence), 1, buildUsed) : [];
    if (!extraBuild.length)
      extraBuild = sampleUnique(current.filter(sentence), 1, buildUsed);
    builds.push(...extraBuild);
    // Day 1 can repeat a meaning prompt as a construction prompt: the tasks are different.
    for (let i = 0; i < 5; i++)
      questionSet.push({
        id: builds[i],
        kind: "construct",
        direction: "en-ps",
      });
    if (
      questionSet.length !== progression.getChallengeSpec(day).questionCount ||
      questionSet.some((x) => !content.wordById[x.id])
    )
      throw Error("Unexpected number of available questions for Day " + day);
    return shuffle(questionSet);
  }

  return { selectAuthoredChallenge };
}
