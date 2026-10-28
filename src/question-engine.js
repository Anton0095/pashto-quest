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
      (v) => normalizePashtoResponse(v) === normalizePashtoResponse(value),
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
  function evaluate(q, card, value) {
    if (q.kind === "dialogue") return isDialogueAnswerCorrect(q, value);
    if (q.kind === "address" || q.kind === "choice")
      return normalizeAnswer(value) === normalizeAnswer(q.correct);
    if (q.kind === "construct")
      return normalizeAnswer(value) === normalizeAnswer(card.ps);
    if (q.kind === "word" && q.direction !== "en-ps") {
      const english = text => String(text).normalize("NFC").trim().toLocaleLowerCase("en");
      return [card.en, ...(card.acceptedEnglishAnswers || [])].some(answer => english(answer) === english(value));
    }
    return value === (q.direction === "en-ps" ? card.ps : card.en);
  }
  function randomFor(seed) {
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }
  return {
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
