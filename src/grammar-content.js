/* Existing authored Week 1 grammar examples and conversations, moved without translation edits. */
const GrammarContent = (() => {
  const openings = {
    6: [
      [
        "Saleha",
        "Meet my sister, Mina",
        "Salaam! This is my sister Mina. We often run together beside the lake. Join us!",
      ],
      [
        "Mina",
        "Join our group",
        "Salaam! Saleha and I like to run. If you join us, your group includes you too.",
      ],
      [
        "Saleha",
        "I → Mina and I → we",
        "زه منډې وهم — I run. مینا او زه یو ځای منډې وهو — Mina and I run together. موږ یو ځای منډې وهو — We run together. A subject containing the speaker takes a first-person plural verb. Notice وهم → وهو.",
      ],
      [
        "Saleha",
        "موږ includes the speaker",
        "موږ ښوونځي ته ځو — We go to school. تاسې ښوونځي ته ځئ — You all go to school. ځو and ځئ differ; learn whole verb forms rather than adding one ending to every stem. The pronoun can sometimes be omitted because the verb marks person.",
      ],
      [
        "Mina",
        "Which group is we?",
        "I ask you to describe yourself with Mina: “Mina and I run together.” Choose who belongs to your group, then build “We run together”.",
      ],
    ],
    7: [
      [
        "Edris",
        "Look at the groups in the market",
        "The fruit customers buy apples and carry baskets. The bread sellers are a different group. Both groups are outside our conversation.",
      ],
      [
        "Edris",
        "He buys → they buy",
        "هغه ډوډۍ اخلي — He buys bread. هغوی ډوډۍ اخلي — They buy bread. The present verb اخلي can be shared by third-person singular and plural; هغوی and context identify the group.",
      ],
      [
        "Edris",
        "We, you all, they",
        "موږ سابه اخلو — We buy vegetables (you and me included). تاسې سابه اخلئ — You all buy vegetables (I address customers). هغوی سابه اخلي — They buy vegetables (I describe other customers).",
      ],
      [
        "Edris",
        "Describe two groups",
        "Describe the fruit customers and then the bread sellers. Neither group includes you or me.",
      ],
    ],
  };
  const demos = {
    residential: {
      object: "the door",
      verb: "opens",
      psObject: "دروازه",
      psVerb: "خلاصوي",
      romanObject: "darwaaza",
      romanVerb: "khlaasawi",
    },
    nature: {
      object: "water",
      verb: "drinks",
      psObject: "اوبه",
      psVerb: "څښي",
      romanObject: "oba",
      romanVerb: "ts-khee",
    },
    business: {
      object: "bread",
      verb: "eats",
      psObject: "ډوډۍ",
      psVerb: "خوري",
      romanObject: "ḍoḍay",
      romanVerb: "khoree",
    },
    school: {
      object: "a book",
      verb: "reads",
      psObject: "کتاب",
      psVerb: "لولي",
      romanObject: "kitaab",
      romanVerb: "lolee",
    },
  };
  const samples = {
    2: [
      "هغه",
      "He / she",
      "څښي",
      "He/she drinks",
      "Third-person singular often uses a present verb ending written ـي. هغه can mean he or she.",
    ],
    3: [
      "زه",
      "I",
      "څښم",
      "I drink",
      "First-person singular often uses ـم. Compare څښي with څښم.",
    ],
    4: [
      "ته",
      "You (informal singular)",
      "څښې",
      "You drink",
      "Second-person singular often uses ـې. Compare څښم with څښې.",
    ],
    5: [
      "تاسې",
      "You (polite/plural)",
      "څښئ",
      "You drink",
      "Polite or plural you commonly takes ـئ in the present tense.",
    ],
    6: [
      "موږ",
      "We",
      "څښو",
      "We drink",
      "First-person plural often uses ـو. Same action, new subject.",
    ],
    7: [
      "هغوی",
      "They",
      "څښي",
      "They drink",
      "Third-person plural often shares the ـي ending with third-person singular.",
    ],
  };
  const workshops = {
    4: {
      place: "residential",
      sovStep: "MUHAMMAD JAN · DAY 4 · AT HOME",
      sovTitle: "ته — informal “you”; linking two actions with او",
      sovExplanation:
        "Muhammad Jan: “Yesterday you said زه اوبه څښم — I drink water. Today, when speaking to a familiar friend, say ته اوبه څښې — you drink water. The ending changes from ـم to ـې. We can join two complete clauses: ته کوټه پاکوې او زه پر څوکۍ کښېنم — You clean the room, and I sit on the chair. Each clause has its own subject and verb. Use informal ته with peers; when addressing respected elders, a different polite form will be taught tomorrow.”",
      sovNext: "Practise “you” and compound sentences →",
      guideMessage:
        "Muhammad Jan: “I may address you as ته. When you practise your own sentences, imagine speaking to a friend such as Saleha, not to me.”",
    },
    5: {
      place: "school",
      sovStep: "MS HAMEED · DAY 5 · AT SCHOOL",
      sovTitle: "ته or تاسې? Choose by whom you address",
      sovExplanation:
        "Ms Hameed: “You have learned ته کتاب لولې — you read a book (speaking to one familiar friend). When addressing an elder, a teacher, an unfamiliar adult or several people, use تاسې کتاب لولئ. The polite/plural verb generally ends in ـئ instead of the informal ـې. The same تاسې form can refer to one respected person or a group. Look at the listener and the context. In some speech you will also hear تاسو; we use تاسې for consistency in these lessons.”",
      sovNext: "Practise respectful and plural “you” →",
      guideMessage:
        "Ms Hameed: “I can speak to you with ته, but you should usually use تاسې when speaking politely to me or Muhammad Jan.”",
    },
    3: {
      place: "nature",
      sovStep: "SALEHA · MORNING BY THE LAKE",
      sovTitle: "Today, YOU are the subject: زه means “I”.",
      sovExplanation:
        "Saleha points to the water: “Yesterday you learned هغه اوبه څښي — he/she drinks water. Now say زه اوبه څښم — I drink water.” Compare څښي (he/she drinks) with څښم (I drink). Many present-tense first-person verbs end in ـم. Verb endings communicate who is doing the action, so Pashto can sometimes omit the pronoun when context is clear. The verb still usually comes after the object. Some verbs change their stems too: learn the complete form, not just an ending.",
      sovNext: "Practise speaking as “I” →",
      guideMessage:
        "Saleha: “When I say زه اوبه څښم, the ending of څښم tells you it is ME drinking. Watch how the verbs change, then try describing what you do by the lake.”",
    },
  };
  return { openings, demos, samples, workshops };
})();
