/* Pure answer evaluation, indexed tiles and randomness. No UI or learning records. */
const QuestionEngine = (() => {
  // These two written variants preserve person/number; do not normalize verb endings.
  function normalizeAnswer(value) {
    return value
      .normalize("NFC")
      .replace(/[.!؟،]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => (w === "مونږ" ? "موږ" : w === "تاسو" ? "تاسې" : w))
      .join(" ");
  }
  function normalizePashtoResponse(value) {
    return String(value || "")
      .normalize("NFC")
      .replace(/[.!؟،\u200c]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function getAnswerTiles(answerPs, duds) {
    const answer = normalizePashtoResponse(answerPs).split(" ").filter(Boolean);
    const extras = (duds || []).map((x) => String(x).trim()).filter(Boolean);
    if (!answer.length) throw Error("Empty dialogue answer");
    if (extras.length < 2)
      throw Error("Week 2 tile puzzle requires at least two dud tiles");
    if (
      extras.some((x) => x.includes(" ") || answer.includes(x)) ||
      new Set(extras).size !== extras.length
    )
      throw Error(
        "Dud tiles must be unique single words not present in the target answer",
      );
    return [...answer, ...extras].map((word, index) => ({
      word,
      index,
      dud: index >= answer.length,
    }));
  }
  function getDialogueTiles(q) {
    if (!q || q.kind !== "dialogue")
      throw Error("A dialogue question is required");
    if (!q.answerPs || (!q.promptPs && !q.promptEnglish))
      throw Error(
        "Dialogue requires a generated answer and a meaningful prompt",
      );
    if (q.duds?.length >= 2) return getAnswerTiles(q.answerPs, q.duds);
    return normalizePashtoResponse(q.answerPs)
      .split(" ")
      .filter(Boolean)
      .map((word, index) => ({ word, index }));
  }
  function questionUsesDuds(q, day) {
    return (
      (q?.kind === "dialogue" && q.duds?.length >= 2) ||
      (q?.kind === "construct" && day >= 8 && Array.isArray(q.duds))
    );
  }
  function isDialogueAnswerCorrect(q, value) {
    const valid = [q.answerPs, ...(q.acceptedPs || [])];
    return valid.some(
      (v) => normalizeAnswer(normalizePashtoResponse(v)) === normalizeAnswer(normalizePashtoResponse(value)),
    );
  }
  function buildTiles(w, q, day) {
    if (q?.kind === "dialogue") return getDialogueTiles(q);
    if (questionUsesDuds(q, day)) return getAnswerTiles(w.ps, q.duds);
    return w.ps
      .replace(/[.!؟،]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((word, i) => ({ word, index: i }));
  }
  function shuffle(list, random = Math.random) {
    let a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const englishKey = value => String(value || "").normalize("NFC").trim().toLocaleLowerCase("en").replace(/\s+/g, " ").replace(/[.!?]+$/, "");
  function englishAnswers(card) {
    // Slash-separated listed senses and explicit form-specific alternatives only.
    return [...new Set([card?.en, ...(card?.acceptedEnglishAnswers || [])].filter(Boolean).flatMap(v => {
      if (!/^(?:to )?[a-z]+\s*\/\s*[a-z]+$/i.test(v)) return [v];
      const parts = v.split(/\s*\/\s*/);
      if (!/^to /i.test(v)) return [v, ...parts];
      const verbs = parts.map(p => p.replace(/^to /i, ""));
      return [v, ...verbs, ...verbs.map(p => "To " + p)];
    }))];
  }
  function meaningKeys(card) {
    // Conservative exclusions do not add accepted synonyms or inflect words.
    return englishAnswers(card).map(v => englishKey(v).replace(/^to /, ""));
  }
  function legacyAgreement(q) {
    const cases = {
      "feminine-description": ["The described noun is feminine singular. Which pair agrees?", "Masculine singular adjective + feminine singular equative"],
      "masculine-description": ["The described noun is masculine singular. Which pair agrees?", "Feminine singular adjective + masculine singular equative"],
      "plural-description": ["The described noun is plural. What number must its agreeing forms have?", "Singular adjective and plural equative"],
    };
    const old = cases[q.grammarConcept];
    if (!old || !q.prompt?.endsWith(old[0])) return null;
    return old[1];
  }
  const legacyAddress = q => q.kind === "address" && ["familiar", "respectful"].includes(q.scope) && !q.registerSpecified;
  function explanation(q, card) {
    if (legacyAddress(q)) return "This saved prompt did not explicitly specify the address register for its singular listener. Either listed familiar or respectful form is accepted. Earlier scores and rewards are unchanged.";
    if (legacyAgreement(q)) return "This saved question did not specify an adjective with distinct inflections. An invariant adjective can share a surface form across genders/numbers. Either adjective label with the required equative is accepted here. Previously recorded scores and rewards are unchanged.";
    if (q.explanation || q.reference) return q.explanation || q.reference;
    if (q.kind === "address") return "Choose the pronoun for the stated listener count and the explicitly requested familiar or respectful register.";
    if (q.kind === "word") return `For this exact form, the listed meaning is ${card.en}. Listed senses and explicit accepted alternatives are equivalent answers; another word's meaning is not.`;
    if (q.kind === "dialogue") return "The reply must preserve the question's referent and requested information, using the studied forms and their agreement.";
    return "Use the same referents and meaning, with the studied word order and matching noun, adjective, equative or verb features.";
  }
  function evaluate(q, card, value) {
    if (q.kind === "dialogue") return isDialogueAnswerCorrect(q, value);
    if (legacyAddress(q)) return q.addressOptions.some(a => normalizeAnswer(value) === normalizeAnswer(a[1]));
    if (q.kind === "address" || q.kind === "choice")
      return [q.correct, legacyAgreement(q)].filter(Boolean).some(v => normalizeAnswer(value) === normalizeAnswer(v));
    if (q.kind === "construct")
      return normalizeAnswer(value) === normalizeAnswer(card.ps);
    if (q.kind === "word" && q.direction !== "en-ps") {
      return englishAnswers(card).some(answer => englishKey(answer) === englishKey(value));
    }
    if (q.direction === "en-ps") return normalizeAnswer(value) === normalizeAnswer(card.ps);
    return englishAnswers(card).some(answer => englishKey(answer) === englishKey(value));
  }
  function randomFor(seed) {
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }
  return {
    englishAnswers,
    meaningKeys,
    explanation,
    legacyAgreement,
    normalizeAnswer,
    normalizePashtoResponse,
    getAnswerTiles,
    getDialogueTiles,
    questionUsesDuds,
    isDialogueAnswerCorrect,
    buildTiles,
    shuffle,
    evaluate,
    randomFor,
  };
})();
