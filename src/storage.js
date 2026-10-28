/* Current save validation, local storage and live assessment snapshots. No migrations. */
function createStorage({
  state,
  content,
  progression,
  backend = localStorage,
}) {
  const KEY = "pashto-town-days-v1";
  let saveProblem = null;
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
    if (
      !["rewards", "complete", "challenges", "personIntros"].every((key) =>
        object(p[key]),
      )
    )
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
        !Array.isArray(a.built)
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
          !Array.isArray(a.tileSequence) ||
          a.tileSequence.length !== tiles.length ||
          new Set(a.tileSequence).size !== tiles.length ||
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
      raw = backend.getItem(KEY);
    } catch (error) {
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
  function save() {
    if (saveProblem) return;
    if (state.session?.mode === "challenge") {
      if (state.session.finished) delete state.progress.activeChallenge;
      else
        state.progress.activeChallenge = JSON.parse(
          JSON.stringify(state.session),
        );
    }
    try {
      backend.setItem(KEY, JSON.stringify(state.progress));
    } catch (e) {}
  }

  return {
    load,
    save,
    currentSave,
    get problem() {
      return saveProblem;
    },
    resetProblem() {
      saveProblem = null;
    },
  };
}
