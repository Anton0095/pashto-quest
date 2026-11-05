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
    if (!answer.length) throw Error("Empty construction answer");
    if (extras.length < 2)
      throw Error("Distractor construction requires at least two dud tiles");
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
    // The explicit variant licenses early-day duds. Existing frozen attempts
    // retain their original day gate; unused metadata never adds new tiles.
    return ["construct", "dialogue"].includes(q?.kind) && q.tileVariant !== "exact" && q.duds?.length >= 2 &&
      (q.tileVariant === "distractors" || q.kind === "dialogue" || day >= 8);
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
  function evaluate(q, card, value) {
    if (q.kind === "dialogue") return isDialogueAnswerCorrect(q, value);
    if (["choice", "address"].includes(q.kind) || q.grammarConcept) return false;
    if (q.kind === "construct")
      return normalizeAnswer(value) === normalizeAnswer(card.ps);
    if (q.kind === "word" && q.direction !== "en-ps") {
      return englishAnswers(card).some(answer => englishKey(answer) === englishKey(value));
    }
    if (q.direction === "en-ps") return normalizeAnswer(value) === normalizeAnswer(card.ps);
    return englishAnswers(card).some(answer => englishKey(answer) === englishKey(value));
  }
  // Fresh per-attempt entropy; the resulting questions, not a replayed seed,
  // are authoritative when a saved assessment resumes.
  function randomSeed() {
    if (globalThis.crypto?.getRandomValues) {
      try { return globalThis.crypto.getRandomValues(new Uint32Array(1))[0]; } catch {}
    }
    return Math.floor(Math.random() * 0x100000000);
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
    randomSeed,
  };
})();
