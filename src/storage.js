/* Current save validation, local storage and live assessment snapshots. No migrations. */
function createStorage({
  state,
  content,
  progression,
  backend,
}) {
  const KEY = "pashto-town-days-v1";
  let saveProblem = null, persistenceProblem = null, readBlocked = false;
  let notifyPersistence = () => {};
  const access = () => backend || globalThis.localStorage;
  function persistenceFailure(message) {
    persistenceProblem = message;
    notifyPersistence(message);
    return false;
  }
  function validOrder(order, size) {
    return (
      Array.isArray(order) &&
      order.length === size &&
      new Set(order).size === size &&
      order.every(
        (index) => Number.isInteger(index) && index >= 0 && index < size,
      )
    );
  }
  function currentSave(p) {
    const object = (value) =>
      value && typeof value === "object" && !Array.isArray(value);
    if (
      !object(p) ||
      p.saveSchemaVersion !== progression.SAVE_VERSION ||
      !Number.isFinite(p.xp) ||
      p.xp < 0
    )
      return false;
    if (!["rewards", "complete", "challenges"].every((key) => object(p[key])))
      return false;
    if (
      !object(p.playerProfile) ||
      typeof p.playerProfile.name !== "string" ||
      p.playerProfile.name.length > 40 ||
      !["male", "female", "unspecified"].includes(p.playerProfile.gender) ||
      typeof p.tutorialDone !== "boolean" ||
      !object(p.library) ||
      !Number.isInteger(p.library.attemptSequence) ||
      p.library.attemptSequence < 0 ||
      !LibraryEngine.presets.includes(p.library.requestedDailyTarget) ||
      ![
        "units",
        "dayExposure",
        "plans",
        "acquired",
        "phrases",
        "grammar",
        "events",
        "deliveries",
        "deficits",
      ].every((key) => object(p.library[key]))
    )
      return false;
    if (!content.restoreGenerated(p)) return false;
    for (const delivery of Object.values(p.library.deliveries)) {
      const card = content.wordById[delivery.id];
      if (
        !card ||
        ![
          "generated_sentence",
          "fixed_phrase",
          "lexical_or_interface",
        ].includes(delivery.kind)
      )
        return false;
      if (
        delivery.kind === "generated_sentence" &&
        card.generated?.origin !== "productive_engine"
      )
        return false;
      if (
        delivery.kind === "fixed_phrase" &&
        !content.LIBRARY_DATA.phrases.some((x) => x.id === card.id)
      )
        return false;
    }
    for (const [day, record] of Object.entries(p.challenges)) {
      if (
        !Number.isInteger(Number(day)) ||
        day < 1 ||
        day > 14 ||
        !object(record)
      )
        return false;
      const spec = progression.getChallengeSpec(Number(day));
      if (
        !Number.isInteger(record.best) ||
        record.best < 0 ||
        record.best > spec.questionCount ||
        !Number.isInteger(record.attempts) ||
        record.attempts < 1 ||
        record.passed !== record.best >= spec.passCount
      )
        return false;
    }
    for (const [id, record] of Object.entries(p.library.acquired)) {
      const entry = content.libraryEntries[id];
      if (
        !entry ||
        !object(record) ||
        !object(record.forms) ||
        !Array.isArray(record.encounteredFormIds) ||
        !Array.isArray(record.practisedFormIds) ||
        !Array.isArray(record.introducedFormIds)
      )
        return false;
      if (
        record.introducedFormIds.some(
          (id) => !record.encounteredFormIds.includes(id),
        )
      )
        return false;
      if (
        record.encounteredFormIds.some(
          (formId) => !entry.forms.some((f) => f.formId === formId),
        )
      )
        return false;
    }
    for (const [key, plan] of Object.entries(p.library.plans)) {
      if (
        !object(plan) ||
        plan.day !== Number(key) ||
        plan.day < 1 ||
        plan.day > 14 ||
        !object(plan.locationAssignments) ||
        !LibraryEngine.presets.includes(plan.requestedDailyTarget)
      )
        return false;
      if (
        plan.generatedPractice &&
        (!object(plan.generatedPractice) ||
          Object.entries(plan.generatedPractice).some(
            ([district, ids]) =>
              !content.zoneKeys.includes(district) ||
              !Array.isArray(ids) ||
              new Set(ids).size !== ids.length ||
              ids.some(
                (id) =>
                  !content.wordById[id]?.generated ||
                  !LibraryEngine.cardAllowed(
                    content.LIBRARY_DATA,
                    id,
                    plan.day,
                  ),
              ),
          ))
      )
        return false;
      const assignments = plan.locationAssignments;
      if (
        Object.keys(assignments).length !== content.zoneKeys.length ||
        !content.zoneKeys.every((district) =>
          Array.isArray(assignments[district]),
        )
      )
        return false;
      const ids = Object.values(assignments).flat();
      if (new Set(ids).size !== ids.length || (plan.day === 14 && ids.length))
        return false;
      for (const [district, assigned] of Object.entries(assignments)) {
        if (
          assigned.length > plan.requestedDailyTarget / 4 ||
          assigned.some((id) => {
            const e = content.libraryEntries[id];
            return (
              !e?.countsTowardDailyQuota ||
              !LibraryEngine.allowedOnDay(e, plan.day) ||
              !LibraryEngine.matchesPlace(e, district)
            );
          })
        )
          return false;
      }
    }
    if (p.activeChallenge) {
      const a = p.activeChallenge;
      if (
        !object(a) ||
        a.mode !== "challenge" ||
        a.finished ||
        !progression.allowed(p, a.loop) ||
        !Array.isArray(a.questions) ||
        a.questions.length !==
          progression.getChallengeSpec(a.loop).questionCount ||
        !Number.isInteger(a.index) ||
        a.index < 0 ||
        a.index >= a.questions.length ||
        typeof a.locked !== "boolean" ||
        a.answered !== a.index + Number(a.locked) ||
        !Number.isInteger(a.correctCount) ||
        a.correctCount < 0 ||
        a.correctCount > a.answered ||
        !Number.isInteger(a.attemptId) ||
        a.attemptId < 1 ||
        !Number.isFinite(a.earned) ||
        a.earned < 0 ||
        !Array.isArray(a.built) ||
        (a.recallDraft !== undefined && (typeof a.recallDraft !== "string" || a.recallDraft.length > 160))
      )
        return false;
      if (
        a.questions.some(
          (q) =>
            !object(q) ||
            ![
              "word",
              "sentence",
              "construct",
              "choice",
              "dialogue",
              "address",
            ].includes(q.kind) ||
            (!["choice", "dialogue", "address"].includes(q.kind) &&
              !content.wordById[q.id]) ||
            !LibraryEngine.cardAllowed(content.LIBRARY_DATA, q.id, a.loop),
        )
      )
        return false;
      for (const item of a.questions) {
        // Current attempts always freeze presentation at creation. Missing choices
        // or tile order are corrupt data, never a request to draw another exam.
        if (
          item.kind === "word" &&
          (typeof item.unstudied !== "boolean" ||
            (item.unstudied && item.direction !== "ps-en"))
        )
          return false;
        if (["construct", "dialogue"].includes(item.kind)) {
          let size;
          try {
            size = QuestionEngine.buildTiles(
              content.wordById[item.id],
              item,
              a.loop,
            ).length;
          } catch {
            return false;
          }
          if (!validOrder(item.tileSequence, size)) return false;
        } else if (
          !Array.isArray(item.choiceOrder) ||
          !item.choiceOrder.length ||
          item.choiceOrder.some((value) => typeof value !== "string") ||
          new Set(item.choiceOrder).size !== item.choiceOrder.length
        )
          return false;
        if (
          ["sentence", "construct", "dialogue"].includes(item.kind) &&
          content.wordById[item.id]?.type === "sentence" &&
          !item.generated
        )
          return false;
        if (
          item.promptPs &&
          (!item.promptGenerated || item.promptPs !== item.promptGenerated.ps)
        )
          return false;
        if (item.promptGenerated) {
          const prompt = content.wordById[item.promptGenerated.id];
          if (
            !prompt?.generated ||
            JSON.stringify(prompt) !== JSON.stringify(item.promptGenerated)
          )
            return false;
        }
        if (
          item.kind === "dialogue" &&
          (!item.generated || item.answerPs !== content.wordById[item.id]?.ps)
        )
          return false;
        if (item.generated) {
          if (
            !item.generated.generated.requiredGrammarIds.every(
              (g) => p.library.grammar[g],
            ) ||
            !Object.values(item.generated.generated.slots).every((r) =>
              p.library.acquired[r.lemmaId]?.introducedFormIds.includes(
                r.formId,
              ),
            )
          )
            return false;
          const card = content.wordById[item.id];
          if (
            !card?.generated ||
            item.generated.ps !== card.ps ||
            item.generated.en !== card.en ||
            item.generated.roman !== card.roman ||
            JSON.stringify(item.generated.generated) !==
              JSON.stringify(card.generated)
          )
            return false;
        }
      }
      const q = a.questions[a.index];
      if (["construct", "dialogue"].includes(q.kind)) {
        let tiles;
        try {
          tiles = QuestionEngine.buildTiles(content.wordById[q.id], q, a.loop);
        } catch {
          return false;
        }
        if (
          !validOrder(a.tileSequence, tiles.length) ||
          JSON.stringify(a.tileSequence) !== JSON.stringify(q.tileSequence) ||
          new Set(a.built).size !== a.built.length ||
          [...a.tileSequence, ...a.built].some(
            (i) => !Number.isInteger(i) || i < 0 || i >= tiles.length,
          )
        )
          return false;
      }
      if (a.locked && typeof a.submittedAnswer !== "string") return false;
    }
    return true;
  }

  function load() {
    let raw;
    try {
      raw = access().getItem(KEY);
    } catch (error) {
      readBlocked = true;
      persistenceFailure("Progress has not been saved: browser storage is unavailable. Progress stays in this tab. Retry or export before closing it.");
      return progression.fresh();
    }
    if (!raw) return progression.fresh();
    try {
      const p = JSON.parse(raw);
      if (!currentSave(p)) throw Error("Unsupported or invalid save schema");
      return p;
    } catch (error) {
      saveProblem =
        "This save belongs to an older or incompatible version. This release uses save format 7 and does not convert old saves. Your stored data has not been changed. Reset it explicitly to start this version.";
      return progression.fresh();
    }
  }
  function snapshot() {
    if (state.session?.mode === "challenge") {
      if (state.session.finished) delete state.progress.activeChallenge;
      else state.progress.activeChallenge = JSON.parse(JSON.stringify(state.session));
    }
    return JSON.stringify(state.progress);
  }
  function save() {
    if (saveProblem) return false;
    try {
      const target = access();
      if (readBlocked) {
        if (target.getItem(KEY))
          return persistenceFailure("Progress has not been saved: existing progress could not be read at startup. Export this tab’s progress, then reload to recover the existing save. Retry will not overwrite it.");
        readBlocked = false;
      }
      const raw = snapshot();
      target.setItem(KEY, raw);
      if (target.getItem(KEY) !== raw) throw Error("Storage did not retain progress");
      persistenceProblem = null;
      notifyPersistence(null);
      return true;
    } catch (error) {
      return persistenceFailure("Progress has not been saved: browser storage is full or unavailable. Progress stays in this tab. Retry or export before closing it.");
    }
  }

  return {
    load,
    save,
    currentSave,
    snapshot,
    onPersistenceChange(listener) {
      notifyPersistence = listener;
      listener(persistenceProblem);
    },
    get persistenceProblem() { return persistenceProblem; },
    get problem() {
      return saveProblem;
    },
    resetProblem() {
      saveProblem = null;
    },
  };
}
